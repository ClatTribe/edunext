/**
 * refresh-college-data.js  —  EduNext college data refresh pipeline (single command)
 *
 * WHAT IT DOES (per college):
 *   1. Scrapes fresh data from Collegedunia (fixed: reads the CollegeOrUniversity
 *      JSON-LD block, so address / phone / official website / logo / rating are the
 *      REAL college's, not Collegedunia's office).
 *   2. Builds the EduNext record + card_detail (same logic as generate-card-details.js).
 *   3. Strips every Collegedunia URL and the word "Collegedunia" from ALL fields
 *      (incl. info_tables). "Collegedunia Ranking" -> "EduNext Ranking" (+1), same as
 *      your existing card logic.
 *   4. EXISTING college -> UPDATE in place, slug / id / URL never change (SEO safe).
 *      NEW college -> INSERT with a fresh slug (your usual pattern).
 *   5. Does NOT touch: image, description, pdf_url, location, order_position, created_at.
 *      Fees / salary figures are kept REAL (only ranking gets the +1 your code already does).
 *
 * SAFETY:
 *   - Default is DRY-RUN (writes a preview CSV + a backup, DB untouched). Add --apply to write.
 *   - Guards: a college is SKIPPED (and logged) if the scrape returns Collegedunia's
 *     office address / office phone, a fake free-email website, or if it previously had
 *     fees/cutoff/placement data and now has none (likely a scrape failure).
 *   - Resumable: progress saved after every college; re-run continues where it stopped.
 *
 * USAGE:
 *   node script/refresh-college-data.js --ids=91,105            # dry-run these ids
 *   node script/refresh-college-data.js --ids=91,105 --apply    # live update them
 *   node script/refresh-college-data.js --target=all --dry-run  # whole table (long)
 *   node script/refresh-college-data.js --from-list=new-data/_index/new-urls.txt --apply
 *   node script/refresh-college-data.js --target=all --apply --limit=500 --offset=0
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const U = process.env.NEXT_PUBLIC_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!U || !K) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

// ---------------- args ----------------
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
}));
const APPLY = !!args.apply;
const DELAY_MS = parseInt(args.delay || '1200', 10);
const LIMIT = args.limit ? parseInt(args.limit, 10) : null;
const MAIN_ONLY = !!args['main-only']; // website-only fast pass: skip tab fetches (1 request/college)
const OFFSET = args.offset ? parseInt(args.offset, 10) : 0;
const OUT_DIR = path.join(__dirname, '..', 'db-cleanup-' + new Date().toISOString().slice(0, 10));
const STATE_FILE = path.join(__dirname, '..', 'new-data', '_index', 'refresh-processed.json');

// ---------------- constants ----------------
const OFFICE_ADDR = '4TH FLOOR, 418-419';
const OFFICE_PH = '01165499934';
const FREE = ['gmail.com','yahoo.com','yahoo.co.in','yahoo.in','rediffmail.com','hotmail.com','outlook.com','ymail.com','googlemail.com','rocketmail.com'];
const HEADERS = { 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9', Accept:'text/html,*/*;q=0.8' };
const DEDICATED_TABS = { admission:['admission'], cutoff:['cutoff'], ranking:['ranking'] };
const FILTERED_FIELDS = { fees:{tabs:['courses-fees','courses-and-fees'],kw:/fee|scholarship|course|tuition/i}, placement:{tabs:['placement','placements'],kw:/placement|recruiter|package|salary|compan|ctc|offers/i} };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------- supabase (REST) ----------------
async function sb(method, q, body) {
  const res = await fetch(`${U}/rest/v1/${q}`, { method, headers: { apikey:K, Authorization:'Bearer '+K, 'Content-Type':'application/json', Prefer:'return=minimal' }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${q} -> ${res.status} ${(await res.text()).slice(0,200)}`);
  return res;
}
async function sbGet(q) { const r = await fetch(`${U}/rest/v1/${q}`, { headers:{ apikey:K, Authorization:'Bearer '+K } }); if(!r.ok) throw new Error(`GET ${q} ${r.status}`); return r.json(); }

// ---------------- scraper (fixed parseInfo) ----------------
async function fetchHtml(u){ for(let a=1;a<=3;a++){ try{ return (await axios.get(u,{headers:HEADERS,timeout:45000,maxRedirects:5,maxContentLength:15*1024*1024,maxBodyLength:15*1024*1024})).data; }catch(e){ const c=e.response?e.response.status:e.code; if(c===404)return null; if(a===3)return null; await sleep(DELAY_MS*a);} } return null; }
function clean(t){ return (t||'').replace(/ /g,' ').replace(/\s+/g,' ').trim(); }
function baseUrl(u){ const m=u.match(/^(https?:\/\/[^?#]*\/(?:college|university)\/\d+-[^/?#]+)/i); return m?m[1]:u.replace(/\/+$/,''); }
function idFromUrl(u){ const m=u.match(/\/(?:college|university)\/(\d+)/i); return m?parseInt(m[1],10):null; }
function parseTable($,t){ const $t=$(t); let h=[]; const th=$t.find('thead th'); if(th.length)th.each((i,e)=>h.push(clean($(e).text()))); else { const f=$t.find('tr').first(); if(f.find('th').length)f.find('th').each((i,e)=>h.push(clean($(e).text()))); } const rows=[]; const br=$t.find('tbody tr').length?$t.find('tbody tr'):$t.find('tr'); br.each((i,tr)=>{ const c=[]; $(tr).find('td,th').each((j,td)=>c.push(clean($(td).text()))); if(c.length&&!(i===0&&h.length&&$(tr).find('th').length))rows.push(c); }); return {headers:h,rows}; }
function extractTables($,s){ const b=[]; let last=''; $(s).find('h1,h2,h3,h4,table').each((i,el)=>{ const tag=el.tagName?el.tagName.toLowerCase():el.name; if(tag!=='table'){ last=clean($(el).text()); return; } const {headers,rows}=parseTable($,el); if(rows.length)b.push({heading:last,headers,rows}); }); return b; }
function parseInfo($){
  const meta=n=>$(`meta[name="${n}"]`).attr('content')||$(`meta[property="${n}"]`).attr('content')||'';
  let title=clean(meta('og:title')||$('title').first().text());
  let about=clean(meta('description')||meta('og:description'));
  let col=null;
  $('script[type="application/ld+json"]').each((i,el)=>{ if(col)return; let d; try{ d=JSON.parse($(el).contents().text()); }catch(_){ return; } for(const it of (Array.isArray(d)?d:[d])) if(it&&it['@type']==='CollegeOrUniversity') col=it; });
  let email=null,contact=null,street='',website=null,logo=null,rating=null,reviews=null;
  if(col){ if(col.name)title=clean(col.name); email=col.email||null; contact=col.telephone?clean(String(col.telephone)):null; const a=col.address||{}; street=clean(a.streetAddress||''); website=col.url||null; logo=col.logo||null; const ar=col.aggregateRating||{}; rating=ar.ratingValue!=null?ar.ratingValue:null; reviews=ar.reviewCount!=null?ar.reviewCount:null; }
  return { title, about, email, contact, address:{'@type':'PostalAddress',streetAddress:street}, _website:website, _logo:logo, _rating:rating, _reviews:reviews };
}
async function scrape(url){
  const base=baseUrl(url), id=idFromUrl(url);
  const rec={ id, url:base, title:'', address:{'@type':'PostalAddress',streetAddress:''}, contact:null, email:null, about:'', fees:[], courses:'See Fees Section', placement:[], cutoff:[], reviews:{}, ranking:[], admission:[], scholarship:[] };
  const info=await fetchHtml(base); let extra={};
  const scopeOf=$=>$('main').length?$('main'):$('body');
  let baseBlocks=[];
  if(info){ const $=cheerio.load(info); const p=parseInfo($); extra={_website:p._website,_logo:p._logo,_rating:p._rating,_reviews:p._reviews}; delete p._website;delete p._logo;delete p._rating;delete p._reviews; Object.assign(rec,p); baseBlocks=extractTables($,scopeOf($)); }
  await sleep(DELAY_MS);
  if(!MAIN_ONLY){
  for(const [f,tabs] of Object.entries(DEDICATED_TABS)){ for(const tab of tabs){ const h=await fetchHtml(`${base}/${tab}`); await sleep(DELAY_MS); if(!h)continue; const $=cheerio.load(h); const bl=extractTables($,scopeOf($)); if(bl.length){ rec[f]=bl; break; } } }
  for(const [f,cfg] of Object.entries(FILTERED_FIELDS)){ let bl=[]; for(const tab of cfg.tabs){ const h=await fetchHtml(`${base}/${tab}`); await sleep(DELAY_MS); if(!h)continue; const $=cheerio.load(h); bl=extractTables($,scopeOf($)); if(bl.length)break; } if(!bl.length)bl=baseBlocks; bl=bl.filter(b=>cfg.kw.test(b.heading)); rec[f]=bl; }
  }
  return { rec, extra };
}

// ---------------- card_detail extractors (same as generate-card-details.js) ----------------
function gAvg(c){const p=c.microsite_data?.placement;if(!p||!Array.isArray(p))return null;for(const pl of p){const h=pl.headers||[],rows=pl.rows||[];const i=h.findIndex(x=>x&&x.toString().toLowerCase().includes('average'));if(i!==-1&&rows.length>0&&rows[0][i])return rows[0][i];const ar=rows.find(r=>r[0]&&r[0].toString().toLowerCase().includes('average'));if(ar&&ar.length>1)return ar[1];}return null;}
function gHigh(c){const p=c.microsite_data?.placement;if(!p||!Array.isArray(p))return null;for(const pl of p){const h=pl.headers||[],rows=pl.rows||[];const i=h.findIndex(x=>x&&x.toString().toLowerCase().includes('high'));if(i!==-1&&rows.length>0&&rows[0][i])return rows[0][i];const hr=rows.find(r=>r[0]&&r[0].toString().toLowerCase().includes('high'));if(hr&&hr.length>1)return hr[1];}return null;}
function gFees(c){const fees=c.microsite_data?.fees;if(!fees||!Array.isArray(fees))return null;let all=[];for(const t of fees){const rows=t.rows||[],h=t.headers||[];const ti=h.findIndex(x=>x&&(x.toString().toLowerCase().includes('total fee')||x.toString().toLowerCase().includes('total fees')));if(ti!==-1){rows.forEach(r=>{if(r[ti]&&r[ti].toString().match(/\d/))all.push(r[ti].toString().trim());});}else{const tr=rows.find(r=>r[0]&&r[0].toString().toLowerCase().includes('total fee'));if(tr&&tr[1]&&tr[1].toString().match(/\d/))all.push(tr[1].toString().trim());}}if(all.length===0)return null;const pf=all.map(f=>{const m=f.match(/[\d,.]+/);return{str:f,val:m?parseFloat(m[0].replace(/,/g,'')):0};}).filter(f=>f.val>0);if(pf.length>1){pf.sort((a,b)=>a.val-b.val);const mn=pf[0].str,mx=pf[pf.length-1].str;return mn===mx?mn:`${mn} - ${mx}`;}else if(pf.length===1)return pf[0].str;return all[0];}
function gCourses(c){const fees=c.microsite_data?.fees;if(!fees||!Array.isArray(fees))return null;let s=new Set();for(const t of fees){const h=t.headers||[],rows=t.rows||[];const ci=h.findIndex(x=>x?.toLowerCase()==='course'||x?.toLowerCase().includes('course'));if(ci!==-1){rows.forEach(r=>{if(r[ci]&&r[ci].toString().trim()){let n=r[ci].toString().trim();n=n.split('₹')[0].trim();n=n.replace(/\d+Courses?$/i,'').trim();n=n.replace(/Check Details?$/i,'').trim();if(n&&n.length>0)s.add(n);}});}}if(c.microsite_data?.courses){const cd=c.microsite_data.courses;if(typeof cd==='string'&&cd!=='See Fees Section')s.add(cd);}return s.size>0?Array.from(s):null;}
function gRank(c){const ranking=c.microsite_data?.ranking;if(!ranking||!Array.isArray(ranking))return null;const V=['Collegedunia Ranking','Indiatoday Ranking','NIRF Ranking','The Week Ranking','Outlook Ranking','IIRF Ranking','TOI Ranking','QS Ranking'];const cc=x=>x?x.toString().replace(/Compare$/i,'').trim():null;const en=v=>{if(!v||v==='-'||v==='N/A')return null;const m=v.toString().match(/#?(\d+)/);return m?parseInt(m[1],10):null;};let out=[];for(const rt of ranking){const hd=rt.heading?.trim();if(!hd||!V.includes(hd))continue;const rows=rt.rows||[];if(rows.length===0)continue;const isE=hd==='Collegedunia Ranking';const fh=isE?'EduNext Ranking':hd;let cr=[];for(const r of rows){const cat=cc(r[0]);const val=en(r[1]);if(cat&&val!==null)cr.push({category:cat,value:isE?val+1:val});}if(cr.length>0)out.push({heading:fh,rows:cr});}if(out.length===0){const f=ranking[0];if(f){const rows=f.rows||[];if(rows.length>0&&rows[0][1]){const fv=en(rows[0][1]);return fv!==null?[{heading:f.heading||'Ranking',rows:[{category:'Overall',value:fv}]}]:null;}}return null;}return out;}
function gRating(c){const r=c.microsite_data?.reviews?.aggregate_rating?.ratingValue;return r?r.toString():null;}
function gRevCount(c){return c.microsite_data?.reviews?.aggregate_rating?.reviewCount||null;}
function gApprov(c){const a=c.microsite_data?.admission;if(!a||!Array.isArray(a))return null;for(const t of a){const rows=t.rows||[];const ar=rows.find(r=>r[0]?.toLowerCase().includes('accredited')||r[0]?.toLowerCase().includes('approval'));if(ar&&ar[1])return ar[1];}return null;}
function gSchol(c){const s=c.microsite_data?.scholarship;if(s&&Array.isArray(s)&&s.length>0)return 'Available';const fees=c.microsite_data?.fees;if(fees&&Array.isArray(fees)){for(const t of fees){const h=t.headers||[];if(h.some(x=>x?.toLowerCase().includes('scholarship')))return 'Available';const rows=t.rows||[];if(rows.find(r=>r[0]?.toLowerCase().includes('scholarship')))return 'Available';}}const a=c.microsite_data?.admission;if(a&&Array.isArray(a))for(const t of a)if(t.heading&&t.heading.toLowerCase().includes('scholarship'))return 'Available';return null;}
function gExam(c){const cut=c.microsite_data?.cutoff;if(cut&&Array.isArray(cut))for(const t of cut){const h=t.headers||[];const ei=h.findIndex(x=>x?.toLowerCase().includes('exam'));if(ei!==-1){const rows=t.rows||[];if(rows.length>0&&rows[0][ei])return rows[0][ei];}}const fees=c.microsite_data?.fees;if(fees&&Array.isArray(fees))for(const t of fees){const h=t.headers||[];const el=h.findIndex(x=>x?.toLowerCase().includes('eligibility'));if(el!==-1){const rows=t.rows||[];const ex=new Set();rows.forEach(r=>{if(r[el]){const m=r[el].toString().match(/[A-Z]{2,}[-]?[A-Z]*/g);if(m)m.forEach(e=>{if(e.length>=2&&e!=='OR'&&e!=='AND')ex.add(e);});}});if(ex.size>0)return Array.from(ex).join(', ');}}const a=c.microsite_data?.admission;if(a&&Array.isArray(a)){let ex=new Set();for(const t of a){const rows=t.rows||[];rows.forEach(r=>{const p=r[0]?.toString().toUpperCase()||'';['JEE','SAT','PAT','CAT','MAT','XAT','CMAT','CUET','NEET'].forEach(e=>{if(p.includes(e))ex.add(e);});});}if(ex.size>0)return Array.from(ex).join(', ');}return null;}

// ---------------- strip collegedunia (all fields incl info_tables) ----------------
function strip(obj, web){
  if (typeof obj==='string'){ let s=obj; s=s.replace(/https?:\/\/[^\s"]*collegedunia\.com[^\s"]*/ig, web||''); s=s.replace(/Collegedunia\s+Ranking/g,'EduNext Ranking'); s=s.replace(/collegedunia/ig,''); return s.replace(/\s{2,}/g,' ').replace(/^[\s\-:]+|[\s\-:]+$/g,''); }
  if (Array.isArray(obj)) return obj.map(x=>strip(x,web));
  if (obj && typeof obj==='object'){ const o={}; for(const k in obj)o[k]=strip(obj[k],web); return o; }
  return obj;
}
function rankCol(ranking){ if(!Array.isArray(ranking))return ranking; return ranking.map(t=>{ if(t&&t.heading&&/collegedunia ranking/i.test(t.heading)){ const rows=(t.rows||[]).map(r=>{ if(Array.isArray(r)&&r.length>=2){ const m=r[1]?.toString().match(/#?(\d+)/); if(m){ const nr=[...r]; nr[1]=String(parseInt(m[1],10)+1); return nr; } } return r; }); return {...t,heading:'EduNext Ranking',rows}; } return t; }); }
function isFreeUrl(u){ if(!u)return false; const d=u.replace(/https?:\/\//,'').replace(/^www\./,'').replace(/\/.*/,'').toLowerCase(); return FREE.includes(d); }
function slugify(name){ if(!name)return 'unknown-college'; return name.split(':')[0].toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,''); }
function tableCount(r){ return ['fees','placement','cutoff','ranking','admission'].reduce((n,k)=>n+((Array.isArray(r[k])?r[k].length:0)),0); }

// ---------------- build EduNext record + guard ----------------
function buildRecord(scraped, existing){
  const raw={...scraped.rec}; const ex=scraped.extra||{};
  raw.reviews=(ex._rating!=null)?{aggregate_rating:{ratingValue:ex._rating,reviewCount:ex._reviews}}:{};
  const web=ex._website||null;
  // GUARDS
  const guards=[];
  if (raw.address?.streetAddress && raw.address.streetAddress.includes(OFFICE_ADDR)) guards.push('office-address');
  if (raw.contact===OFFICE_PH) guards.push('office-phone');
  if (isFreeUrl(web)) guards.push('fake-website');
  // MAIN_ONLY website-only pass: update ONLY url/address/contact/email + card_detail.url; preserve ALL existing section data. No data-vanished guard.
  if (MAIN_ONLY && existing){
    const payloadMin = { url: web, updated_at: new Date().toISOString() };
    if (raw.address?.streetAddress && !raw.address.streetAddress.includes(OFFICE_ADDR)) payloadMin.address = raw.address;
    if (raw.contact && raw.contact!==OFFICE_PH) payloadMin.contact = raw.contact;
    if (raw.email) payloadMin.email = raw.email;
    if (existing.card_detail && typeof existing.card_detail==='object') payloadMin.card_detail = { ...existing.card_detail, url: web };
    const guardsMin = !web ? ['no-website'] : (isFreeUrl(web) ? ['fake-website'] : []);
    return { payload: payloadMin, web, guards: guardsMin, card: existing.card_detail };
  }
  if (existing){ const prev=['fees','placement','cutoff'].reduce((n,k)=>n+((Array.isArray(existing[k])?existing[k].length:0)),0); const now=['fees','placement','cutoff'].reduce((n,k)=>n+((Array.isArray(raw[k])?raw[k].length:0)),0); if (prev>0 && now===0) guards.push('data-vanished'); }
  const colForCard={ ...raw, microsite_data:raw, college_name: existing?existing.college_name:(raw.title.split(':')[0].trim()), location: existing?existing.location:null, url:web, contact:raw.contact, email:raw.email, slug: existing?existing.slug:slugify(raw.title) };
  let card={ college_name:colForCard.college_name||null, location:colForCard.location||null, url:web||null, contact:raw.contact||null, email:raw.email||null, slug:colForCard.slug||null, rating:gRating(colForCard), review_count:gRevCount(colForCard), courses:gCourses(colForCard), fees:gFees(colForCard), avg_package:gAvg(colForCard), high_package:gHigh(colForCard), ranking:gRank(colForCard), approvals:gApprov(colForCard), scholarship:gSchol(colForCard), entrance_exam:gExam(colForCard) };
  card=strip(card,web);
  const ms=strip({...raw, ranking:rankCol(raw.ranking)}, web);
  const payload={ url:web, about:strip(raw.about||'',web)||null, contact:raw.contact||null, email:raw.email||null, address:raw.address||null, fees:strip(raw.fees,web)||null, courses:raw.courses||null, placement:strip(raw.placement,web)||null, reviews:ms.reviews||null, cutoff:strip(raw.cutoff,web)||null, ranking:rankCol(strip(raw.ranking,web))||null, admission:strip(raw.admission,web)||null, scholarship:strip(raw.scholarship,web)||null, microsite_data:ms, card_detail:card, updated_at:new Date().toISOString() };
  // NEW college extra columns
  if(!existing){ payload.slug=colForCard.slug; payload.college_name=colForCard.college_name; payload.title=colForCard.college_name; payload.created_at=new Date().toISOString(); }
  // existing info_tables carrying "Collegedunia" -> clean in place
  if(existing && existing.info_tables){ const cleaned=strip(existing.info_tables, web); if(JSON.stringify(cleaned)!==JSON.stringify(existing.info_tables)) payload.info_tables=cleaned; }
  return { payload, web, guards, card };
}

// ---------------- runner (streaming, memory-safe) ----------------
const PAGE = parseInt(args.page || '50', 10);
function loadState(){ try{ const d=JSON.parse(fs.readFileSync(STATE_FILE,'utf8')); return { done:new Set(d.done||[]), lastId: d.lastId||0 }; }catch(_){ return { done:new Set(), lastId:0 }; } }
function saveState(st){ fs.mkdirSync(path.dirname(STATE_FILE),{recursive:true}); fs.writeFileSync(STATE_FILE, JSON.stringify({ done:[...st.done], lastId: st.lastId })); }
function csvRow(a){ return a.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')+'\n'; }

(async()=>{
  fs.mkdirSync(OUT_DIR,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const csvPath=path.join(OUT_DIR,`refresh_${APPLY?'applied':'dryrun'}_${stamp}.csv`);
  const skipPath=path.join(OUT_DIR,`refresh_skipped_${stamp}.csv`);
  const backupPath=path.join(OUT_DIR,`refresh_backup_${stamp}.jsonl`);
  fs.writeFileSync(csvPath,'id_or_new,college,field,OLD,NEW\n');
  fs.writeFileSync(skipPath,'id_or_url,reason\n');
  const st = APPLY ? loadState() : { done:new Set(), lastId:0 };
  let done=0, applied=0, inserted=0, skip=0;

  async function processOne(t){
    const key=(t.existing?('id:'+t.existing.id):('url:'+t.cdUrl));
    if(APPLY && st.done.has(key)) return;
    let scraped; try{ scraped=await scrape(t.cdUrl); }catch(e){ fs.appendFileSync(skipPath,csvRow([t.existing?t.existing.id:t.cdUrl,'scrape-fail:'+e.message])); return; }
    if(!scraped.rec.title){ skip++; fs.appendFileSync(skipPath,csvRow([t.existing?t.existing.id:t.cdUrl,'no-data-page'])); return; }
    const { payload, web, guards } = buildRecord(scraped, t.existing);
    if(guards.length){ skip++; fs.appendFileSync(skipPath,csvRow([t.existing?t.existing.id:t.cdUrl, guards.join('+')])); console.log(`  SKIP ${t.existing?t.existing.id:t.cdUrl}: ${guards.join('+')}`); return; }
    const nm=(t.existing?t.existing.college_name:payload.college_name||'').slice(0,34);
    if(t.existing){
      if((t.existing.url||'')!==(web||'')) fs.appendFileSync(csvPath,csvRow([t.existing.id,nm,'url',(t.existing.url||'').slice(0,60),(web||'').slice(0,60)]));
      const os=(t.existing.address&&t.existing.address.streetAddress)||''; const ns=(payload.address&&payload.address.streetAddress)||''; if(os!==ns) fs.appendFileSync(csvPath,csvRow([t.existing.id,nm,'address',os.slice(0,60),ns.slice(0,60)]));
      if((t.existing.contact||'')!==(payload.contact||'')) fs.appendFileSync(csvPath,csvRow([t.existing.id,nm,'phone',t.existing.contact||'',payload.contact||'']));
    } else { fs.appendFileSync(csvPath,csvRow(['NEW',nm,'insert','',web||''])); }
    if(APPLY){
      try{
        if(t.existing){ fs.appendFileSync(backupPath, JSON.stringify(t.existing)+'\n'); await sb('PATCH',`college_microsites?id=eq.${t.existing.id}`,payload); applied++; }
        else { await sb('POST','college_microsites',payload); inserted++; }
        st.done.add(key);
      }catch(e){ console.log('  write fail',key,e.message); fs.appendFileSync(skipPath,csvRow([key,'write-fail:'+e.message])); return; }
    }
    done++;
    if(done%20===0){ console.log(`  ..${done} done (apply ${applied} ins ${inserted} skip ${skip})`); if(APPLY) saveState(st); }
  }

  if (args.ids){
    const ids=String(args.ids).split(',').map(x=>x.trim()).filter(Boolean);
    const rows=await sbGet(`college_microsites?select=*&id=in.(${ids.join(',')})`);
    console.log(`Targets: ${rows.length} (ids) | mode: ${APPLY?'APPLY (LIVE)':'DRY-RUN'} | delay ${DELAY_MS}ms`);
    for(const r of rows){ await processOne({ cdUrl:`https://collegedunia.com/college/${(r.microsite_data&&r.microsite_data.id)||''}`, existing:r }); }
  } else if (args['ids-file']){
    const allIds=fs.readFileSync(path.resolve(args['ids-file']),'utf8').split('\n').map(x=>x.trim()).filter(Boolean);
    console.log(`Targets: ${allIds.length} (ids-file, paged ${PAGE}) | mode: ${APPLY?'APPLY (LIVE)':'DRY-RUN'} | delay ${DELAY_MS}ms | resume: ${st.done.size} already done`);
    for(let i=0;i<allIds.length;i+=PAGE){
      const chunk=allIds.slice(i,i+PAGE).filter(id=>!(APPLY && st.done.has('id:'+id)));
      if(!chunk.length) continue;
      const rows=await sbGet(`college_microsites?select=*&id=in.(${chunk.join(',')})&order=id.asc`);
      for(const r of rows){
        await processOne({ cdUrl:`https://collegedunia.com/college/${(r.microsite_data&&r.microsite_data.id)||''}`, existing:r });
        if(LIMIT && done>=LIMIT) break;
      }
      if(APPLY) saveState(st);
      if(LIMIT && done>=LIMIT) break;
    }
  } else if (args['from-list']){
    const urls=fs.readFileSync(path.resolve(args['from-list']),'utf8').split('\n').map(x=>x.trim()).filter(Boolean);
    console.log(`Targets: ${urls.length} (new from list) | mode: ${APPLY?'APPLY (LIVE)':'DRY-RUN'} | delay ${DELAY_MS}ms`);
    for(const u of urls){ await processOne({ cdUrl:u, existing:null }); }
  } else if (args.target==='all'){
    console.log(`Targets: ALL existing (streamed, page ${PAGE}) | mode: ${APPLY?'APPLY (LIVE)':'DRY-RUN'} | delay ${DELAY_MS}ms | resume id>${st.lastId}`);
    let lastId = st.lastId || 0;
    while(true){
      const rows=await sbGet(`college_microsites?select=*&id=gt.${lastId}&order=id.asc&limit=${PAGE}`);
      if(!rows.length) break;
      for(const r of rows){
        await processOne({ cdUrl:`https://collegedunia.com/college/${(r.microsite_data&&r.microsite_data.id)||''}`, existing:r });
        lastId=r.id; st.lastId=lastId;
        if(LIMIT && done>=LIMIT) break;
      }
      if(APPLY) saveState(st);
      if(LIMIT && done>=LIMIT) break;
    }
  } else { console.error('Specify --ids=.. or --from-list=.. or --target=all'); process.exit(1); }

  if(APPLY) saveState(st);
  console.log(`\n=== ${APPLY?'APPLIED':'DRY-RUN'} ===`);
  console.log(`processed ${done} | ${APPLY?`updated ${applied}, inserted ${inserted}, `:''}skipped ${skip}`);
  console.log(`preview CSV: ${path.relative(path.join(__dirname,'..'),csvPath)}`);
  if(APPLY) console.log(`backup JSONL: ${path.relative(path.join(__dirname,'..'),backupPath)}`);
  if(!APPLY) console.log(`No DB changes made. Re-run with --apply to write.`);
})().catch(e=>{ console.error('FATAL',e); process.exit(1); });

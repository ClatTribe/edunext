<<<<<<< Updated upstream
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// ===== SUPABASE DIRECT INIT =====
const SUPABASE_URL = 'https://tnlbukkknbujenxjjmym.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGJ1a2trbmJ1amVueGpqbXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjQzMiwiZXhwIjoyMDc3MTUyNDMyfQ.o5rLyz0L6OB5ng9eRt-GPE7cvLhKIFeqzZDpG2iSn3k';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// ===== CONFIGURATION =====
const API_KEYS = [
  'AIzaSyA7v-XBIkslGlkA8d9UfOf-4ZqmaYhh-Pg'
];
let currentKeyIndex = 0;
let genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// ===== BATCH CONFIGURATION =====
const BATCH_SIZE = 10;                  // Process 10 colleges per batch
const BATCH_START_OFFSET = 0;        // Starting row number
const BATCH_END_OFFSET = 19161;         // Ending row number
// UNCOMMENT TO TEST WITH SPECIFIC COLLEGE IDs
// const TARGET_COLLEGE_IDS = [34624];
const TARGET_COLLEGE_IDS = null;
// Delay between API calls (in ms) to avoid rate limiting
const DELAY_MS = 5000;
// ===== HELPER FUNCTIONS =====
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Switch to next API key
function switchToNextAPIKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔄 Switching to API Key ${currentKeyIndex + 1}/${API_KEYS.length}`);
  genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}
// Extract key data from college object
function extractCollegeData(college) {
  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college?.microsite_data || {});
  // Get fees
  let fees = null;
  if (college.card_detail?.fees) {
    fees = college.card_detail.fees;
  } else if (micrositeData.fees?.[0]?.rows) {
    const totalFeesRow = micrositeData.fees[0].rows.find(r =>
      r[0]?.toLowerCase().includes('total') || r[0]?.toLowerCase().includes('tuition')
    );
    fees = totalFeesRow?.[1];
  }
  // Get placements
  let avgPackage = null;
  let highestPackage = null;
  if (micrositeData.placement?.[0]?.rows) {
    const avgRow = micrositeData.placement[0].rows.find(r => r[0]?.toLowerCase().includes('average'));
    const highRow = micrositeData.placement[0].rows.find(r => r[0]?.toLowerCase().includes('highest'));
    avgPackage = avgRow?.[1];
    highestPackage = highRow?.[1];
  }
  // Get courses
=======
const { supabase } = require('../src/app/lib/supabase-admin.js');
const fs = require('fs');
const path = require('path');

// ===================================================================
// ⚙️  MODE CONFIGURATION
// ===================================================================

const MODE = 'batch';
// 'single' → test one college by ID
// 'batch'  → process all colleges

const SINGLE_COLLEGE_ID = 105;

const BATCH_START_OFFSET = 0;
const BATCH_END_OFFSET   = 19161;
const COLLEGES_PER_BATCH = 50;
const DELAY_MS           = 100;

// ===================================================================
// 📅 DYNAMIC YEAR — always current, never hardcoded
// ===================================================================
const CURRENT_YEAR      = new Date().getFullYear();
const ADMISSION_YEAR    = `${CURRENT_YEAR}-${String(CURRENT_YEAR + 1).slice(-2)}`; // "2026-27"

// ===================================================================
// 📂 PROGRESS TRACKING
// ===================================================================

const PROGRESS_FILE = path.join(__dirname, 'seo_progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log('\n📂 Resuming from saved progress...');
      console.log(`   Last offset    : ${data.lastOffset}`);
      console.log(`   Total processed: ${data.totalProcessed}`);
      console.log(`   Last run       : ${data.lastRunDate}\n`);
      return data;
    }
  } catch { console.log('⚠️  No progress file — starting fresh\n'); }
  return { lastOffset: BATCH_START_OFFSET, totalProcessed: 0, totalSuccess: 0, totalErrors: 0 };
}

function saveProgress(offset, totalProcessed, totalSuccess, totalErrors) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      lastOffset: offset, totalProcessed, totalSuccess, totalErrors,
      lastRunDate: new Date().toISOString(),
      lastRunDateReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }, null, 2));
    console.log(`💾 Progress saved → offset ${offset} | ✅ ${totalSuccess} | ❌ ${totalErrors}`);
  } catch (err) { console.error('⚠️  Failed to save progress:', err.message); }
}

// ===================================================================
// 🧹 VALIDATION HELPERS
// ===================================================================

function safeJSON(val) {
  if (!val) return {};
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return {}; } }
  return {};
}

// Strings that are table headers / labels, NOT real data values
const JUNK_PATTERNS = [
  /^see\s/i, /section$/i, /^fees?$/i, /^courses?$/i, /^placement$/i,
  /^ranking$/i, /^admission$/i, /^total$/i, /^n\/a$/i, /^na$/i,
  /^nil$/i, /^not\s/i, /^\s*-\s*$/, /^yes$/i, /^no$/i,
  /views/i, /click here/i, /read more/i, /know more/i,
  /^eligibility$/i, /^duration$/i, /^mode$/i, /^type$/i,
  /^s\.no/i, /^sr\.?\s*no/i, /^#$/
];

function isJunk(val) {
  if (!val || typeof val !== 'string') return true;
  const s = val.trim();
  if (s.length < 2) return true;
  return JUNK_PATTERNS.some(p => p.test(s));
}

// Fee: must have digits + currency/amount hint; reject eligibility/duration strings
function isValidFee(val) {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  if (isJunk(s)) return false;
  if (!/\d/.test(s)) return false;
  if (/^\d+\+\d+$/.test(s)) return false;          // "10+2"
  if (/^\d+\s*years?$/i.test(s)) return false;      // "2 years"
  if (/^\d+\s*months?$/i.test(s)) return false;
  if (/^\d+\s*semesters?$/i.test(s)) return false;
  // Must look like money
  return /lakh|lpa|inr|₹|\brs\b|per\s*annum|p\.a\.|yearly|annual|tuition|fee/i.test(s)
      || /[\d,]+\s*\/-/.test(s)       // "50,000/-"
      || /₹\s*[\d,]+/.test(s)         // "₹ 50,000"
      || /[\d,]{4,}/.test(s);         // bare number >= 1000 (likely a fee amount)
}

// Package: must look like a salary
function isValidPackage(val) {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  if (!/\d/.test(s)) return false;
  return /lpa|lakh|l\.p\.a|inr|₹|ctc|per\s*annum|package/i.test(s);
}

// Course name: real program, not a header
function isValidCourse(val) {
  if (!val || typeof val !== 'string') return false;
  const s = val.replace(/\(.*?\)/g, '').trim();
  if (s.length < 2 || s.length > 80) return false;
  if (isJunk(s)) return false;
  if (/^\d+$/.test(s)) return false;
  // Must look like a course — contain a letter sequence typical of degree names
  // Reject if it's obviously eligibility like "10+2 / Graduation"
  if (/^\d+\+\d+/.test(s)) return false;
  return true;
}

// Ranking: must contain a digit
function isValidRanking(val) {
  if (!val || typeof val !== 'string') return false;
  return /\d/.test(val) && val.trim().length > 2;
}

// Admission exam: must be a known exam keyword, NOT a course list
function isValidAdmissionExam(val) {
  if (!val || typeof val !== 'string') return false;
  const lower = val.toLowerCase();
  return /\b(cat|jee|neet|clat|mat|xat|gate|cuet|gmat|cet|snap|iift|nmat)\b/.test(lower);
}

// Clean HTML, normalize whitespace, cap length
function cleanText(str, maxLen = 280) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length < 10) return null;
  return cleaned.substring(0, maxLen);
}

// ===================================================================
// 🔍 DATA EXTRACTION — all columns, strict validation
// ===================================================================

function extractAllData(college) {
  const ms = safeJSON(college.microsite_data);
  const cd = safeJSON(college.card_detail);

  const name     = (college.college_name || college.name || '').trim();
  const location = (college.location || college.city || '').trim();
  const city     = location.split(',')[0]?.trim() || location;
  const state    = location.split(',')[1]?.trim() || '';

  // ── Identity ──────────────────────────────────────────────────
  const ownership   = cleanText(college.ownership    || cd.ownership    || ms.ownership,   50) || null;
  const collegeType = cleanText(college.college_type || cd.type         || ms.type,        50) || null;
  const estYear     = (() => {
    const y = college.established || cd.established || ms.established;
    if (!y) return null;
    const n = parseInt(y);
    return (n > 1800 && n <= CURRENT_YEAR) ? n : null;
  })();
  const affiliation = cleanText(college.affiliated_to || cd.affiliation || ms.affiliation, 80) || null;
  const approvedBy  = cleanText(college.approved_by   || cd.approved_by || ms.approved_by, 80) || null;

  // ── Rating ────────────────────────────────────────────────────
  const rating = (() => {
    const r = college.rating || cd.rating;
    if (!r) return null;
    const n = parseFloat(r);
    return (!isNaN(n) && n >= 1 && n <= 5) ? n.toFixed(1) : null;
  })();

  // ── Fees ─────────────────────────────────────────────────────
  // Walk candidates strictly — reject anything that isn't money
  let fees = null;
  for (const c of [college.fees, cd.fees, cd.fee]) {
    if (c && typeof c === 'string' && isValidFee(c)) { fees = c.trim(); break; }
  }
  // Dig into microsite fees table — col 1 or 2 only (col 0 = course name)
  if (!fees && Array.isArray(ms.fees)) {
    outer: for (const section of ms.fees) {
      for (const row of (section?.rows || [])) {
        for (const idx of [1, 2]) {
          if (typeof row?.[idx] === 'string' && isValidFee(row[idx])) {
            fees = row[idx].trim();
            break outer;
          }
        }
      }
    }
  }

  // ── Courses ───────────────────────────────────────────────────
  // Source 1: microsite fees table col 0 = course names (most reliable)
>>>>>>> Stashed changes
  let courses = [];
  if (Array.isArray(ms.fees)) {
    for (const section of ms.fees) {
      const names = (section?.rows || [])
        .map(r => r?.[0])
        .map(v => typeof v === 'string' ? v.replace(/\(.*?\)/g, '').trim() : null)
        .filter(isValidCourse);
      if (names.length) { courses = names; break; }
    }
  }
<<<<<<< Updated upstream
  const coursesText = courses.length > 0 ? courses.slice(0, 5).join(', ') : 'Various programs';
  // Get ranking
  let ranking = null;
  if (micrositeData.ranking?.[0]?.rows?.[0]) {
    ranking = `${micrositeData.ranking[0].rows[0][0]} Rank ${micrositeData.ranking[0].rows[0][2]}`;
  }
  // Get admission info
  let admissionExams = null;
  if (micrositeData.admission?.[0]?.rows) {
    const examRow = micrositeData.admission[0].rows.find(r =>
      r[4]?.toLowerCase().includes('cat') ||
      r[4]?.toLowerCase().includes('exam')
    );
    admissionExams = examRow?.[4];
  }
=======
  // Source 2: top-level / card_detail courses
  if (!courses.length) {
    const raw = college.courses || cd.courses || ms.courses;
    if (Array.isArray(raw)) {
      courses = raw.map(c => typeof c === 'string' ? c : (c?.name || c?.title || null)).filter(isValidCourse);
    } else if (typeof raw === 'string' && !isJunk(raw)) {
      courses = raw.split(',').map(s => s.trim()).filter(isValidCourse);
    }
  }

  const uniqueCourses = [...new Set(courses)].slice(0, 6);

  // Total course count — use DB column if available and > uniqueCourses.length
  const dbTotal    = parseInt(college.total_courses || cd.total_courses) || 0;
  const totalCount = dbTotal > uniqueCourses.length ? dbTotal : uniqueCourses.length;
  // Only show count if we have real course names to back it up
  const courseCountLabel = (totalCount > 1 && uniqueCourses.length > 0)
    ? (dbTotal > uniqueCourses.length ? `over ${dbTotal}` : null)
    : null;

  // Course type flags
  const ct = uniqueCourses.join(' ').toLowerCase();
  const hasMBA  = ct.includes('mba')    || ct.includes('management');
  const hasEng  = ct.includes('b.tech') || ct.includes('engineering') || ct.includes('b.e');
  const hasMed  = ct.includes('mbbs')   || ct.includes('medical')     || ct.includes('b.pharm');
  const hasLaw  = ct.includes('law')    || ct.includes('llb');
  const hasBSc  = ct.includes('b.sc')   || ct.includes('science');
  const hasArts = ct.includes('arts')   || ct.includes('ba ')         || ct.includes('b.a');
  const hasMCA  = ct.includes('mca')    || ct.includes('computer');
  const hasMCom = ct.includes('m.com')  || ct.includes('commerce')    || ct.includes('b.com');

  // ── Placements ────────────────────────────────────────────────
  let avgPackage = null, highestPackage = null, placementPct = null, topRecruiters = null;

  if (isValidPackage(college.avg_package))     avgPackage     = college.avg_package;
  if (isValidPackage(college.highest_package)) highestPackage = college.highest_package;
  if (isValidPackage(cd.avg_package))          avgPackage     = avgPackage || cd.avg_package;
  if (isValidPackage(cd.highest_package))      highestPackage = highestPackage || cd.highest_package;

  if (Array.isArray(ms.placement)) {
    for (const section of ms.placement) {
      for (const row of (section?.rows || [])) {
        const label = (row?.[0] || '').toLowerCase();
        const val   = String(row?.[1] || row?.[2] || '');
        if (!avgPackage     && label.includes('average')                      && isValidPackage(val)) avgPackage     = val;
        if (!highestPackage && label.includes('highest')                      && isValidPackage(val)) highestPackage = val;
        if (!placementPct   && (label.includes('%') || label.includes('rate')))                       placementPct   = val;
        if (!topRecruiters  && (label.includes('recruiter') || label.includes('company')) && !isJunk(val)) topRecruiters = val;
      }
    }
  }

  // ── Rankings ──────────────────────────────────────────────────
  let rankings = [];
  if (Array.isArray(ms.ranking)) {
    for (const section of ms.ranking) {
      for (const row of (section?.rows || [])) {
        const label = row?.[0]; const rank = row?.[2];
        if (label && rank && isValidRanking(String(rank))) rankings.push(`${label} — Rank ${rank}`);
      }
    }
  }
  if (!rankings.length && college.ranking && isValidRanking(String(college.ranking))) {
    rankings = [String(college.ranking)];
  }

  // ── Admission exams — STRICT: only real exam names ─────────────
  let admissionExams = null;
  // Check known sources
  for (const src of [college.admission_exams, cd.admission_exams]) {
    if (src && isValidAdmissionExam(String(src))) { admissionExams = String(src).trim(); break; }
  }
  // Scan admission table cells
  if (!admissionExams && Array.isArray(ms.admission)) {
    outer: for (const section of ms.admission) {
      for (const row of (section?.rows || [])) {
        for (const cell of (row || [])) {
          if (typeof cell === 'string' && isValidAdmissionExam(cell)) {
            admissionExams = cell.trim();
            break outer;
          }
        }
      }
    }
  }

  // ── Facilities ────────────────────────────────────────────────
  let facilities = college.facilities || cd.facilities || ms.facilities || [];
  if (typeof facilities === 'string') facilities = facilities.split(',').map(f => f.trim());
  const facilitiesText = Array.isArray(facilities)
    ? facilities.filter(f => typeof f === 'string' && f.length > 2 && !isJunk(f)).slice(0, 5).join(', ') || null
    : null;

  // ── Scholarships ─────────────────────────────────────────────
  const rawSch = college.scholarships || cd.scholarships || ms.scholarships || null;
  const scholarships = rawSch && typeof rawSch === 'string' && !isJunk(rawSch) ? rawSch : null;

  // ── About ─────────────────────────────────────────────────────
  const about = cleanText(ms.about || college.about || cd.about);

>>>>>>> Stashed changes
  return {
    name, location, city, state,
    ownership, collegeType, estYear, affiliation, approvedBy,
    rating, fees,
    uniqueCourses, courseCountLabel, totalCount,
    hasMBA, hasEng, hasMed, hasLaw, hasBSc, hasArts, hasMCA, hasMCom,
    avgPackage, highestPackage, placementPct, topRecruiters,
    rankings, admissionExams, facilitiesText, scholarships, about
  };
}
<<<<<<< Updated upstream
// Generate SEO description using Gemini with retry logic
async function generateSEODescription(collegeData, retryCount = 0) {
  const prompt = `You are an expert SEO content writer for an education platform. Create a compelling, SEO-optimized description for the following college.
**College Name:** ${collegeData.name}
**Location:** ${collegeData.location}
**Fees:** ${collegeData.fees || 'Not available'}
**Average Placement:** ${collegeData.avgPackage || 'Not available'}
**Highest Placement:** ${collegeData.highestPackage || 'Not available'}
**Courses Offered:** ${collegeData.courses}
**Ranking:** ${collegeData.ranking || 'Not available'}
**Admission Exams:** ${collegeData.admissionExams || 'Not available'}
**About:** ${collegeData.about ? collegeData.about.substring(0, 300) : 'Not available'}
**Requirements:**
1. Write 150-200 words
2. Target students searching for "${collegeData.name}" or similar colleges in "${collegeData.location}"
3. Include keywords naturally: college name, location, courses, placements, fees, rankings
4. Make it engaging and conversion-focused (encourage applications/inquiries)
5. Use bullet points (with emoji) for key highlights like:
   - 🎯 **Industry-First Curriculum**
   - 💼 **100% Placement Record**
   etc.
6. Start with a strong opening sentence about the college
7. End with a call-to-action or value proposition
8. Use markdown formatting (**bold** for highlights, bullet points with -)
9. Focus on what makes this college unique
Write ONLY the description, no explanations or meta-commentary.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error(`❌ Gemini API Error (Key ${currentKeyIndex + 1}):`, error.message);

    // If we haven't tried all keys yet, switch and retry
    if (retryCount < API_KEYS.length - 1) {
      switchToNextAPIKey();
      console.log('🔁 Retrying with new API key...');
      await delay(2000); // Short delay before retry
      return generateSEODescription(collegeData, retryCount + 1);
    }

    // All keys failed
    console.error('❌ All API keys failed for this request');
    return null;
=======

// ===================================================================
// ✍️  5 SEO TEMPLATES — varied structure, no broken data
// ===================================================================

// Pick template index deterministically based on college name
// so same college always gets same template (not random on each run)
function pickTemplate(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return hash % 5; // 0-4
}

// Shared helpers used across templates
function typeStr(d) {
  return [d.ownership, d.collegeType].filter(Boolean).join(' ') || 'leading';
}
function courseList(d, n = 5) {
  return d.uniqueCourses.slice(0, n).join(', ');
}
function placementLine(d) {
  if (!d.avgPackage && !d.highestPackage) return null;
  let s = 'The institute has a strong placement record';
  if (d.placementPct)   s += ` with **${d.placementPct}** placement rate`;
  if (d.avgPackage)     s += `, average package of **${d.avgPackage}**`;
  if (d.highestPackage) s += `, and highest offers reaching **${d.highestPackage}**`;
  return s + '.';
}
function buildBullets(d) {
  const b = [];
  d.rankings.forEach(r  => b.push(`🏆 **${r}**`));
  if (d.uniqueCourses.length)  b.push(`📚 **Programs**: ${courseList(d, 3)}`);
  if (d.hasMBA)   b.push(`💼 **MBA & Management** — industry-focused curriculum`);
  if (d.hasEng)   b.push(`⚙️ **Engineering** — strong technical & placement support`);
  if (d.hasMed)   b.push(`🏥 **Medical/Pharmacy** — clinical training facilities`);
  if (d.hasLaw)   b.push(`⚖️ **Law programs** — preparing future legal professionals`);
  if (d.hasMCA)   b.push(`💻 **MCA / Computer Science** programs`);
  if (d.hasMCom)  b.push(`📊 **Commerce programs** with industry relevance`);
  if (d.hasBSc || d.hasArts) b.push(`🔬 **Science & Arts** — broad academic foundation`);
  if (d.highestPackage) b.push(`💰 **Top placement**: up to **${d.highestPackage}**`);
  else if (d.avgPackage) b.push(`💰 **Average package**: **${d.avgPackage}**`);
  if (d.fees)           b.push(`💵 **Fees**: ${d.fees}`);
  if (d.facilitiesText) b.push(`🏫 **Facilities**: ${d.facilitiesText}`);
  if (d.scholarships)   b.push(`🎓 **Scholarships**: ${d.scholarships}`);
  if (d.rating)         b.push(`⭐ **Rated ${d.rating}/5** by students`);
  const loc = [d.ownership, 'institute in', d.city].filter(Boolean).join(' ');
  b.push(`📍 **${loc}**`);
  return b;
}

// ── Template 0: Discovery / Explore style ─────────────────────────
function template0(d) {
  const parts = [];
  const est = d.estYear ? `, established in ${d.estYear},` : '';
  const aff = d.affiliation ? ` affiliated to **${d.affiliation}**` : '';

  let p1 = `Discover unparalleled academic opportunities at **${d.name}**, a ${typeStr(d)} institute${est} located in **${d.location}**${aff}. `;
  if (d.uniqueCourses.length) {
    const countPart = d.courseCountLabel ? `a robust portfolio of ${d.courseCountLabel} programs` : 'quality programs';
    p1 += `Dedicated to nurturing future leaders, ${d.name} offers ${countPart} including **${courseList(d)}**. `;
  } else {
    p1 += `${d.name} is committed to delivering quality education and nurturing future leaders in ${d.city}. `;
>>>>>>> Stashed changes
  }
  parts.push(p1.trim());

  const p2Parts = [];
  if (d.fees)         p2Parts.push(`With an accessible fee structure of **${d.fees}**, a world-class education at ${d.name} is well within reach.`);
  const pl = placementLine(d);
  if (pl)             p2Parts.push(pl);
  if (!pl)            p2Parts.push(`${d.name} places strong emphasis on career readiness, equipping graduates to thrive in a competitive job market.`);
  if (d.admissionExams) p2Parts.push(`Admissions are conducted through **${d.admissionExams}**.`);
  parts.push(p2Parts.join(' '));

  const bullets = buildBullets(d);
  parts.push('**Key Highlights:**\n' + bullets.map(b => `- ${b}`).join('\n'));

  if (d.about && d.about.length > 60) parts.push(d.about);

  const firstCourse = d.uniqueCourses[0] || null;
  let cta = `Ready to shape your future? Explore **${d.name} Admission ${ADMISSION_YEAR}** details and take the first step toward a rewarding career. `;
  cta += firstCourse
    ? `Whether you are searching for top **${firstCourse} colleges in ${d.city}** or the best institutes in ${d.state || d.location}, ${d.name} is a premier choice.`
    : `Join thousands of successful alumni who have built thriving careers after studying at **${d.name}**, ${d.location}.`;
  cta += ` Inquire now to learn more about courses, fees, placements, and campus life.`;
  parts.push(cta);

  return parts.filter(Boolean).join('\n\n');
}
<<<<<<< Updated upstream
// ===== MAIN FUNCTION =====
async function generateDescriptions() {
  try {
    console.log('🚀 Starting SEO Description Generator...\n');
    console.log(`🔑 Using ${API_KEYS.length} API keys with automatic failover\n`);
    console.log(`📦 Batch Size: ${BATCH_SIZE} colleges per batch`);
    console.log(`📊 Range: Rows ${BATCH_START_OFFSET} to ${BATCH_END_OFFSET}\n`);
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalProcessed = 0;
    let offset = BATCH_START_OFFSET;
    while (offset <= BATCH_END_OFFSET) {
      const batchEnd = Math.min(offset + BATCH_SIZE - 1, BATCH_END_OFFSET);

      console.log('\n' + '='.repeat(70));
      console.log(`📦 BATCH: Rows ${offset} to ${batchEnd}`);
      console.log('='.repeat(70));
      // Fetch colleges for this batch
      let query = supabase
        .from('college_microsites')
        .select('*')
        .order('id', { ascending: true });
      if (TARGET_COLLEGE_IDS && TARGET_COLLEGE_IDS.length > 0) {
        console.log(`🎯 Testing with specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);
        query = query.in('id', TARGET_COLLEGE_IDS);
      }
      const { data: colleges, error } = await query.range(offset, batchEnd);
      if (error) throw error;
      if (!colleges || colleges.length === 0) {
        console.log('✅ No more colleges found. Batch processing complete!');
        break;
      }
      console.log(`✅ Found ${colleges.length} college(s) in this batch\n`);
      let batchSuccessCount = 0;
      let batchErrorCount = 0;
      for (let i = 0; i < colleges.length; i++) {
        const college = colleges[i];

        try {
          console.log(`\n[${offset + i}/${BATCH_END_OFFSET}] Processing: ${college.college_name} (ID: ${college.id})`);

          // Extract data
          const collegeData = extractCollegeData(college);
          console.log(`📊 Extracted Data:
  - Location: ${collegeData.location}
  - Fees: ${collegeData.fees || 'N/A'}
  - Avg Package: ${collegeData.avgPackage || 'N/A'}
  - Courses: ${collegeData.courses.substring(0, 50)}...`);
          // Generate description
          console.log('🤖 Generating SEO description with Gemini...');
          const description = await generateSEODescription(collegeData);
          if (!description) {
            console.log('❌ Failed to generate description');
            batchErrorCount++;
            totalErrorCount++;
            continue;
          }
          console.log('\n📝 Generated Description:');
          console.log('─'.repeat(70));
          console.log(description);
          console.log('─'.repeat(70));
          // Update database
          const { error: updateError } = await supabase
            .from('college_microsites')
            .update({
              description: description,
              updated_at: new Date().toISOString()
            })
            .eq('id', college.id);
          if (updateError) {
            console.log('❌ Database update failed:', updateError.message);
            batchErrorCount++;
            totalErrorCount++;
          } else {
            console.log('✅ Description saved to database!');
            batchSuccessCount++;
            totalSuccessCount++;
          }
          // Delay before next API call
          if (i < colleges.length - 1) {
            console.log(`⏳ Waiting ${DELAY_MS / 1000}s before next college...`);
            await delay(DELAY_MS);
          }
        } catch (err) {
          console.error(`❌ Error processing college ${college.id}:`, err.message);
          batchErrorCount++;
          totalErrorCount++;
        }
      }
      totalProcessed += colleges.length;
      console.log('\n' + '─'.repeat(70));
      console.log(`📊 BATCH SUMMARY (Rows ${offset}-${batchEnd})`);
      console.log('─'.repeat(70));
      console.log(`✅ Success: ${batchSuccessCount}`);
      console.log(`❌ Errors: ${batchErrorCount}`);
      console.log(`📁 Batch Total: ${colleges.length}`);
      // If we got fewer colleges than expected, we've reached the end
      if (colleges.length < BATCH_SIZE || batchEnd >= BATCH_END_OFFSET) {
        break;
      }
      // Move to next batch
      offset += BATCH_SIZE;

      // Small delay between batches
      if (offset <= BATCH_END_OFFSET) {
        console.log(`\n⏳ Batch complete. Moving to next batch in 3s...`);
        await delay(3000);
      }
    }
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully Generated: ${totalSuccessCount}`);
    console.log(`❌ Errors: ${totalErrorCount}`);
    console.log(`📁 Total Processed: ${totalProcessed}`);
    console.log(`🔑 API Keys Used: ${API_KEYS.length}`);
    console.log('='.repeat(70));
  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
=======

// ── Template 1: Achievement / Rankings-first style ─────────────────
function template1(d) {
  const parts = [];
  const est = d.estYear ? ` Since ${d.estYear}, it` : `${d.name}`;

  let p1 = `**${d.name}** has built a reputation as one of the most respected ${typeStr(d)} institutes in **${d.location}**. `;
  p1 += `${est === `${d.name}` ? 'It' : est} has been shaping careers across ${d.uniqueCourses.length > 0 ? `fields like **${courseList(d)}**` : `diverse academic disciplines`} with a focus on academic rigor and professional excellence.`;
  parts.push(p1);

  if (d.rankings.length || d.avgPackage || d.highestPackage || d.placementPct) {
    let p2 = '';
    if (d.rankings.length) p2 += `Recognized nationally, ${d.name} holds prestigious rankings: **${d.rankings.join(', ')}**. `;
    const pl = placementLine(d);
    if (pl) p2 += pl;
    if (d.topRecruiters) p2 += ` Leading companies like **${d.topRecruiters}** actively recruit from campus.`;
    if (p2.trim()) parts.push(p2.trim());
  }

  const p3Parts = [];
  if (d.fees)           p3Parts.push(`The fee structure of **${d.fees}** ensures that quality education is accessible to students from all backgrounds.`);
  if (d.admissionExams) p3Parts.push(`Admission is through **${d.admissionExams}**, selecting the brightest minds.`);
  if (d.scholarships)   p3Parts.push(`Scholarships are available: **${d.scholarships}**.`);
  if (p3Parts.length)   parts.push(p3Parts.join(' '));

  const bullets = buildBullets(d);
  parts.push('**Why Choose ' + d.name + '?**\n' + bullets.map(b => `- ${b}`).join('\n'));

  if (d.about && d.about.length > 60) parts.push(d.about);

  const firstCourse = d.uniqueCourses[0] || null;
  let cta = `Take the next step in your academic journey. Apply to **${d.name}** for the ${ADMISSION_YEAR} session and unlock a future full of possibilities. `;
  cta += firstCourse
    ? `Thousands of students searching for **${firstCourse} admission in ${d.city}** choose ${d.name} every year.`
    : `Students across ${d.state || d.location} trust ${d.name} for quality education and exceptional career outcomes.`;
  parts.push(cta);

  return parts.filter(Boolean).join('\n\n');
}

// ── Template 2: Student-journey / narrative style ──────────────────
function template2(d) {
  const parts = [];
  const est   = d.estYear ? `, with a legacy dating back to ${d.estYear},` : '';
  const aff   = d.affiliation ? `, affiliated to **${d.affiliation}**` : '';

  let p1 = `Embarking on a career begins with the right institution. **${d.name}**${est} is a ${typeStr(d)} college in **${d.location}**${aff} that has consistently guided students toward academic and professional success. `;
  p1 += d.uniqueCourses.length
    ? `From **${courseList(d)}** to advanced postgraduate offerings, students find a program aligned with their ambitions.`
    : `With a wide range of programs, students find opportunities that align with their ambitions and career goals.`;
  parts.push(p1);

  const p2Parts = [];
  if (d.fees) p2Parts.push(`Tuition and fees at ${d.name} are structured at **${d.fees}**, making it an affordable choice without compromising on quality.`);
  const pl = placementLine(d);
  if (pl) p2Parts.push(pl);
  if (!pl) p2Parts.push(`The college's dedicated placement cell works tirelessly to connect graduates with top employers across India.`);
  if (p2Parts.length) parts.push(p2Parts.join(' '));

  if (d.admissionExams || d.estYear || d.approvedBy) {
    let p3 = '';
    if (d.admissionExams) p3 += `Admission to ${d.name} is facilitated through **${d.admissionExams}**, ensuring a merit-based selection. `;
    if (d.approvedBy)     p3 += `The institute is approved by **${d.approvedBy}**, upholding the highest academic standards. `;
    if (p3.trim())        parts.push(p3.trim());
  }

  const bullets = buildBullets(d);
  parts.push('**Key Highlights:**\n' + bullets.map(b => `- ${b}`).join('\n'));

  if (d.about && d.about.length > 60) parts.push(d.about);

  const firstCourse = d.uniqueCourses[0] || null;
  let cta = `Your future starts with a single decision. Explore **${d.name} ${CURRENT_YEAR} admissions**, compare fees, review placement records, and discover why it remains one of the top-rated colleges in ${d.city}. `;
  cta += firstCourse
    ? `If you are looking for the best **${firstCourse} program in ${d.state || d.location}**, your search ends here.`
    : `Join a community of achievers and begin your journey at **${d.name}** today.`;
  parts.push(cta);

  return parts.filter(Boolean).join('\n\n');
}

// ── Template 3: Program-first / courses-led style ─────────────────
function template3(d) {
  const parts = [];

  if (d.uniqueCourses.length) {
    let p1 = `Looking for top-rated **${courseList(d, 3)} courses** in ${d.city}? **${d.name}** is a premier ${typeStr(d)} institution in **${d.location}** `;
    p1 += d.courseCountLabel
      ? `offering ${d.courseCountLabel} programs across diverse disciplines. `
      : `offering a strong lineup of academic programs. `;
    p1 += d.estYear ? `With a legacy since ${d.estYear}, it stands as a trusted name in higher education.` : `It stands as a trusted name in higher education across ${d.state || d.location}.`;
    parts.push(p1);
  } else {
    let p1 = `**${d.name}** is a distinguished ${typeStr(d)} institution in **${d.location}**, known for academic excellence and strong industry connections.`;
    if (d.estYear) p1 += ` Established in ${d.estYear}, it has built decades of trust among students and parents.`;
    parts.push(p1);
  }

  const p2Parts = [];
  if (d.fees)           p2Parts.push(`The fee structure stands at **${d.fees}**, offering excellent value for a high-quality education.`);
  const pl = placementLine(d);
  if (pl)               p2Parts.push(pl);
  if (!pl)              p2Parts.push(`The college maintains an active placement cell ensuring students are industry-ready upon graduation.`);
  if (d.admissionExams) p2Parts.push(`Entrance to the college is through **${d.admissionExams}**.`);
  if (d.affiliation)    p2Parts.push(`It is affiliated to **${d.affiliation}**.`);
  if (p2Parts.length)   parts.push(p2Parts.join(' '));

  const bullets = buildBullets(d);
  parts.push('**Quick Facts:**\n' + bullets.map(b => `- ${b}`).join('\n'));

  if (d.about && d.about.length > 60) parts.push(d.about);

  const firstCourse = d.uniqueCourses[0] || null;
  let cta = `Secure your spot at **${d.name}** — one of ${d.city}'s most sought-after colleges for **${ADMISSION_YEAR} admissions**. `;
  cta += firstCourse
    ? `Students applying for **${firstCourse}** and similar programs will find an exceptional academic environment here.`
    : `Find detailed information on courses, fees, scholarships, and placements on our portal.`;
  parts.push(cta);

  return parts.filter(Boolean).join('\n\n');
}

// ── Template 4: Location + community style ────────────────────────
function template4(d) {
  const parts = [];
  const est  = d.estYear ? ` since ${d.estYear}` : '';
  const aff  = d.affiliation ? `, affiliated to **${d.affiliation}**` : '';

  let p1 = `Situated in the heart of **${d.location}**, **${d.name}** is a ${typeStr(d)} institution${aff} that has been empowering students${est}. `;
  p1 += d.uniqueCourses.length
    ? `With programs spanning **${courseList(d)}**, the college caters to diverse academic aspirations under one roof.`
    : `The college offers diverse academic programs designed to prepare students for success in a rapidly evolving world.`;
  parts.push(p1);

  const p2Parts = [];
  const pl = placementLine(d);
  if (pl)   p2Parts.push(pl);
  if (!pl)  p2Parts.push(`${d.name}'s dedicated career services team ensures every student is prepared for the workforce with practical skills and professional guidance.`);
  if (d.topRecruiters) p2Parts.push(`Alumni are placed at leading companies including **${d.topRecruiters}**.`);
  if (d.fees) p2Parts.push(`Annual fees are **${d.fees}**, with ${d.scholarships ? 'various scholarship options available' : 'a transparent and student-friendly fee structure'}.`);
  if (p2Parts.length) parts.push(p2Parts.join(' '));

  if (d.admissionExams || d.approvedBy) {
    let p3 = '';
    if (d.admissionExams) p3 += `Aspiring students are selected through **${d.admissionExams}**. `;
    if (d.approvedBy)     p3 += `Courses are approved by **${d.approvedBy}**, ensuring nationally recognized credentials. `;
    if (p3.trim())        parts.push(p3.trim());
  }

  const bullets = buildBullets(d);
  parts.push('**Key Highlights:**\n' + bullets.map(b => `- ${b}`).join('\n'));

  if (d.about && d.about.length > 60) parts.push(d.about);

  const firstCourse = d.uniqueCourses[0] || null;
  let cta = `Planning your higher education? Explore **${d.name} admissions for ${ADMISSION_YEAR}** and discover a campus community dedicated to your success. `;
  cta += firstCourse
    ? `From **${firstCourse}** to advanced specializations, ${d.name} in ${d.city} has the program and the support system you need.`
    : `With an experienced faculty and excellent infrastructure, ${d.name} in **${d.city}** is where futures are built.`;
  parts.push(cta);

  return parts.filter(Boolean).join('\n\n');
}

// ===================================================================
// 🎯 MAIN BUILD FUNCTION
// ===================================================================

function buildSEODescription(d) {
  if (!d.name) return null;
  const idx = pickTemplate(d.name);
  const templates = [template0, template1, template2, template3, template4];
  return templates[idx](d);
}

// ===================================================================
// 💾 DB UPDATE
// ===================================================================

async function updateCollege(college) {
  const data = extractAllData(college);
  const desc = buildSEODescription(data);
  if (!desc) return { desc: null, error: new Error('Could not build description') };
  const { error } = await supabase
    .from('college_microsites')
    .update({ description: desc, updated_at: new Date().toISOString() })
    .eq('id', college.id);
  return { desc, error };
}

// ===================================================================
// 🔬 SINGLE COLLEGE MODE
// ===================================================================

async function runSingleMode() {
  console.log(`\n🔬 SINGLE MODE — College ID: ${SINGLE_COLLEGE_ID}`);
  console.log('='.repeat(60));

  const { data: colleges, error } = await supabase
    .from('college_microsites').select('*').eq('id', SINGLE_COLLEGE_ID).limit(1);

  if (error)             { console.error('❌ Fetch error:', error.message); process.exit(1); }
  if (!colleges?.length) { console.error('❌ College not found');           process.exit(1); }

  const college = colleges[0];
  const data    = extractAllData(college);

  console.log('\n📋 Extracted Data (non-empty only):');
  console.log('─'.repeat(40));
  Object.entries(data).forEach(([k, v]) => {
    const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
    if (!empty) console.log(`  ${k.padEnd(22)}: ${Array.isArray(v) ? v.join(' | ') : v}`);
  });

  const templateIdx = pickTemplate(data.name);
  console.log(`\n🎨 Using Template #${templateIdx}`);

  const desc = buildSEODescription(data);
  console.log('\n📝 Generated SEO Description:');
  console.log('─'.repeat(60));
  console.log(desc || '❌ Could not build description');
  console.log('─'.repeat(60));
  if (desc) {
    console.log(`\n📏 Word count : ~${desc.split(/\s+/).length}`);
    console.log(`📏 Char count : ${desc.length}`);
  }

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\n💾 Save this to DB? (y/n): ', async (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y') {
      const { error: ue } = await supabase
        .from('college_microsites')
        .update({ description: desc, updated_at: new Date().toISOString() })
        .eq('id', college.id);
      if (ue) console.error('❌ Save failed:', ue.message);
      else    console.log('✅ Saved successfully!');
    } else {
      console.log('⏭️  Skipped saving.');
    }
    process.exit(0);
  });
}

// ===================================================================
// 🚀 BATCH MODE
// ===================================================================

async function runBatchMode() {
  const progress     = loadProgress();
  let offset         = progress.lastOffset;
  let totalSuccess   = progress.totalSuccess;
  let totalErrors    = progress.totalErrors;
  let totalProcessed = progress.totalProcessed;

  console.log('🚀 BATCH MODE');
  console.log('='.repeat(60));
  console.log(`  Year used    : ${CURRENT_YEAR} / ${ADMISSION_YEAR}`);
  console.log(`  Start offset : ${offset}`);
  console.log(`  End offset   : ${BATCH_END_OFFSET}`);
  console.log(`  Batch size   : ${COLLEGES_PER_BATCH}\n`);

  while (offset <= BATCH_END_OFFSET) {
    const batchEnd = Math.min(offset + COLLEGES_PER_BATCH - 1, BATCH_END_OFFSET);
    console.log(`\n📦 Batch rows ${offset}–${batchEnd}`);

    const { data: colleges, error } = await supabase
      .from('college_microsites').select('*')
      .order('id', { ascending: true }).range(offset, batchEnd);

    if (error) {
      console.error('❌ Supabase error:', error.message);
      offset += COLLEGES_PER_BATCH;
      saveProgress(offset, totalProcessed, totalSuccess, totalErrors);
      continue;
    }

    if (!colleges?.length) { console.log('✅ All done!'); break; }

    let batchSuccess = 0, batchErrors = 0;

    for (const college of colleges) {
      try {
        const { desc, error: ue } = await updateCollege(college);
        if (ue) {
          console.log(`  ❌ [${college.id}] ${college.college_name} — ${ue.message}`);
          batchErrors++; totalErrors++;
        } else {
          const preview = desc.replace(/\n/g, ' ').substring(0, 90);
          console.log(`  ✅ [${college.id}] T${pickTemplate(college.college_name)} ${college.college_name}`);
          console.log(`     └─ ${preview}...`);
          batchSuccess++; totalSuccess++;
        }
      } catch (err) {
        console.error(`  ❌ [${college.id}] Error:`, err.message);
        batchErrors++; totalErrors++;
      }
    }

    totalProcessed += colleges.length;
    offset         += COLLEGES_PER_BATCH;
    console.log(`\n  📊 Batch — ✅ ${batchSuccess} | ❌ ${batchErrors}`);
    saveProgress(offset, totalProcessed, totalSuccess, totalErrors);

    if (colleges.length < COLLEGES_PER_BATCH || offset > BATCH_END_OFFSET) break;
    if (DELAY_MS > 0) await new Promise(r => setTimeout(r, DELAY_MS));
>>>>>>> Stashed changes
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`  ✅ Success   : ${totalSuccess}`);
  console.log(`  ❌ Errors    : ${totalErrors}`);
  console.log(`  📁 Processed : ${totalProcessed}`);
  console.log('='.repeat(60));
}
<<<<<<< Updated upstream
// ===== RUN SCRIPT =====
generateDescriptions()
  .then(() => {
    console.log('\n✨ Description generation completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
=======

// ===================================================================
// 🎬 ENTRY POINT
// ===================================================================

async function main() {
  console.log('\n' + '🎓'.repeat(30));
  console.log(`   SEO DESCRIPTION GENERATOR — ${CURRENT_YEAR}`);
  console.log('🎓'.repeat(30) + '\n');
  if      (MODE === 'single') await runSingleMode();
  else if (MODE === 'batch')  { await runBatchMode(); process.exit(0); }
  else { console.error('❌ Invalid MODE'); process.exit(1); }
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1); });
>>>>>>> Stashed changes

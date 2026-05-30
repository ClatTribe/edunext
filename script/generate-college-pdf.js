const { supabase } = require('../src/app/lib/supabase-admin.js');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
// const TEST_COLLEGE_ID = 91;
const TEST_MODE = false;
const DELAY_MS = 2000;
const PDF_OUTPUT_DIR = path.join(__dirname, 'generated_pdfs');
const LOGO_PATH = path.join(__dirname, '../public/whitelogo.svg');

// ===== BATCH CONFIGURATION =====       ← CHANGE THESE TWO VALUES
const BATCH_SIZE = 500;                 // ← how many colleges per batch
const BATCH_START_OFFSET = 12520;           // ← set to e.g. 2000 to resume from row 2001

// ===== DESIGN TOKENS =====
const C = {
  pageBg:    '#0D1117',
  surface:   '#161B22',
  surfaceAlt:'#1C2128',
  headerBg:  '#010409',
  border:    '#30363D',
  borderFaint:'#21262D',
  gold:      '#F59E0B',
  goldDark:  '#B45309',
  goldLight: '#FDE68A',
  white:     '#E6EDF3',
  text2:     '#8B949E',
  text3:     '#6E7681',
  info:      '#388BFD',
};

// ===== PAGE LAYOUT CONSTANTS =====
const PW  = 595.28;
const PH  = 841.89;
const M   = 40;
const TW  = PW - M * 2;

const HDR = 68;
const FTR = 34;
const CT  = HDR + 18;
const CB  = PH - FTR - 16;

const THH = 32;
const TRH = 28;

// ===== UTILITIES =====
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensurePDFDirectory() {
  if (!fs.existsSync(PDF_OUTPUT_DIR)) {
    fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
  }
}

function extractCollegeData(college) {
  const ms = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college?.microsite_data || {});
  let location = 'N/A';
  const raw = college.address || ms.address;
  if (raw) {
    location = typeof raw === 'object'
      ? (raw.streetAddress || JSON.stringify(raw))
      : raw;
  }
  return {
    name:        college.college_name || 'College Name',
    slug:        college.slug || 'college',
    location:    college.location || location,
    contact:     college.contact || ms.contact || 'N/A',
    email:       college.email || ms.email || 'N/A',
    website:     college.url || ms.url || 'N/A',
    about:       college.about || ms.about || null,
    fees:        college.fees || ms.fees || null,
    placement:   college.placement || ms.placement || null,
    cutoff:      college.cutoff || ms.cutoff || null,
    ranking:     college.ranking || ms.ranking || null,
    admission:   college.admission || ms.admission || null,
    scholarship: college.scholarship || ms.scholarship || null,
  };
}

// ===== PAGE CHROME HELPERS =====

function drawLogo(doc, x, y) {
  try {
    const svg = fs.readFileSync(LOGO_PATH, 'utf-8');
    SVGtoPDF(doc, svg, x, y, {
      width: 130,
      height: 38,
      preserveAspectRatio: 'xMidYMid meet',
    });
  } catch {
    doc.fontSize(20).fillColor(C.gold).font('Helvetica-Bold').text('EDUNEXT', x, y + 8);
  }
}

function drawContentHeader(doc, collegeName) {
  doc.rect(0, 0, PW, HDR).fill(C.headerBg);
  doc.rect(0, 0, PW, 3).fill(C.gold);
  doc.rect(0, HDR - 1, PW, 1).fill(C.border);
  drawLogo(doc, M, 15);
  if (collegeName) {
    doc.fontSize(8).fillColor(C.text2).font('Helvetica')
       .text(collegeName, 190, 18, {
         width: PW - 210,
         align: 'right',
         lineBreak: false,
         ellipsis: true,
       });
    doc.fontSize(6.5).fillColor(C.text3).font('Helvetica')
       .text('OFFICIAL BROCHURE', 190, 32, {
         width: PW - 210,
         align: 'right',
       });
  }
}

function drawContentFooter(doc) {
  doc.rect(0, PH - FTR, PW, FTR).fill(C.headerBg);
  doc.rect(0, PH - FTR, PW, 1).fill(C.border);
  doc.rect(0, PH - 2, PW, 2).fill(C.gold);
  doc.fontSize(6.5).fillColor(C.text3).font('Helvetica')
     .text(
       'edunext.com  ·  All information subject to verification from official sources',
       M, PH - FTR + 11,
       { width: TW },
     );
}

function newPage(doc, collegeName) {
  doc.addPage();
  doc.rect(0, 0, PW, PH).fill(C.pageBg);
  drawContentHeader(doc, collegeName);
  drawContentFooter(doc);
  return CT;
}

function ensureSpace(doc, cy, needed, collegeName) {
  if (cy + needed > CB) {
    return newPage(doc, collegeName);
  }
  return cy;
}

// ===== SECTION TITLE =====

function drawSectionTitle(doc, title, cy, collegeName) {
  cy = ensureSpace(doc, cy, 28 + THH + TRH, collegeName);
  doc.rect(M, cy, 4, 24).fill(C.gold);
  doc.fontSize(12.5).fillColor(C.white).font('Helvetica-Bold')
     .text(title, M + 14, cy + 4, { width: TW - 14 });
  return cy + 34;
}

// ===== TABLE DRAWING =====

function prepareTableData(tableData) {
  if (!tableData) return null;
  let rows = tableData.rows || [];
  if (!Array.isArray(rows) || rows.length === 0) return null;

  rows = rows
    .map(r => {
      if (Array.isArray(r)) return r;
      if (r && Array.isArray(r.base_data)) return r.base_data;
      return [];
    })
    .filter(r => r.length > 0);

  if (rows.length === 0) return null;

  const hasExplicit = Array.isArray(tableData.headers) && tableData.headers.length > 0;
  return {
    heading:  tableData.heading || null,
    headers:  hasExplicit ? tableData.headers : rows[0],
    dataRows: (hasExplicit ? rows : rows.slice(1)).slice(0, 10),
  };
}

function renderTableHeader(doc, headers, cy, colW) {
  const numCols = headers.length;
  doc.rect(M, cy, TW, THH).fill(C.surface);
  doc.rect(M, cy, TW, 2).fill(C.gold);
  doc.rect(M, cy, TW, THH).strokeColor(C.border).lineWidth(0.5).stroke();

  headers.forEach((cell, i) => {
    if (i > 0) {
      doc.moveTo(M + i * colW, cy + 6)
         .lineTo(M + i * colW, cy + THH - 6)
         .strokeColor(C.border).lineWidth(0.5).stroke();
    }
    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text(
         String(cell || '').toUpperCase(),
         M + i * colW + 8, cy + 11,
         { width: colW - 14, lineBreak: false, ellipsis: true },
       );
  });

  return cy + THH;
}

function drawTable(doc, tableData, cy, collegeName) {
  const td = prepareTableData(tableData);
  if (!td) return cy;

  if (td.heading) {
    cy = ensureSpace(doc, cy, 20 + THH + TRH, collegeName);
    doc.fontSize(9).fillColor(C.goldLight).font('Helvetica-Bold')
       .text(td.heading, M, cy, { width: TW });
    cy += 18;
  }

  const numCols = Math.max(td.headers.length, ...td.dataRows.map(r => r.length));
  if (numCols === 0) return cy;
  const colW = TW / numCols;

  cy = ensureSpace(doc, cy, THH + TRH, collegeName);
  cy = renderTableHeader(doc, td.headers, cy, colW);

  td.dataRows.forEach((row, ri) => {
    if (cy + TRH > CB) {
      doc.rect(M, cy, TW, 1).fill(C.border);
      cy = newPage(doc, collegeName);
      cy = renderTableHeader(doc, td.headers, cy, colW);
    }

    doc.rect(M, cy, TW, TRH).fill(ri % 2 === 0 ? C.pageBg : C.surfaceAlt);
    doc.rect(M, cy, TW, TRH).strokeColor(C.borderFaint).lineWidth(0.3).stroke();
    if (ri % 2 === 0) {
      doc.rect(M, cy, 2, TRH).fill(C.goldDark);
    }

    row.forEach((cell, ci) => {
      if (ci >= numCols) return;
      if (ci > 0) {
        doc.moveTo(M + ci * colW, cy + 5)
           .lineTo(M + ci * colW, cy + TRH - 5)
           .strokeColor(C.borderFaint).lineWidth(0.3).stroke();
      }
      doc.fontSize(8).fillColor(C.white).font('Helvetica')
         .text(
           String(cell || ''),
           M + ci * colW + 8, cy + 9,
           { width: colW - 16, lineBreak: false, ellipsis: true },
         );
    });

    cy += TRH;
  });

  doc.rect(M, cy, TW, 1.5).fill(C.border);
  return cy + 16;
}

// ===== SECTION BLOCK =====

function drawSection(doc, title, tables, cy, collegeName) {
  if (!tables || tables.length === 0) return cy;

  cy += 8;
  if (cy > CT + 30 && cy + 60 < CB) {
    doc.rect(M, cy, TW, 0.5).fill(C.border);
    cy += 14;
  } else {
    cy += 6;
  }

  cy = drawSectionTitle(doc, title, cy, collegeName);

  for (const t of tables.slice(0, 4)) {
    cy = drawTable(doc, t, cy, collegeName);
  }

  return cy;
}

// ===== PDF GENERATION =====

async function generatePDF(college) {
  return new Promise((resolve, reject) => {
    try {
      const d = extractCollegeData(college);
      const fileName = `${d.slug}_brochure.pdf`;
      const filePath = path.join(PDF_OUTPUT_DIR, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        bufferPages: true,
        info: {
          Title: `${d.name} — Official Brochure`,
          Author: 'EduNext',
          Subject: 'College Information & Admission Guide',
        },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // PAGE 1 — COVER
      doc.rect(0, 0, PW, PH).fill(C.pageBg);
      doc.rect(0, 0, PW, HDR).fill(C.headerBg);
      doc.rect(0, 0, PW, 3).fill(C.gold);
      doc.rect(0, HDR - 1, PW, 1).fill(C.border);
      drawLogo(doc, M, 15);
      doc.fontSize(7).fillColor(C.text3).font('Helvetica')
         .text(
           new Date().getFullYear() + '  ·  OFFICIAL COLLEGE BROCHURE',
           0, 30,
           { width: PW - M, align: 'right' },
         );

      let y = HDR + 24;
      doc.fontSize(8).fillColor(C.gold).font('Helvetica-Bold')
         .text('COLLEGE PROFILE', M, y);
      y += 16;

      const nfs = d.name.length > 48 ? 19 : d.name.length > 32 ? 23 : 27;
      doc.fontSize(nfs).fillColor(C.white).font('Helvetica-Bold')
         .text(d.name, M, y, { width: PW - M * 2, lineGap: 4 });
      y += doc.heightOfString(d.name, { width: PW - M * 2, fontSize: nfs, lineGap: 4 }) + 10;

      doc.rect(M, y, 64, 2.5).fill(C.gold);
      y += 12;

      doc.fontSize(10).fillColor(C.text2).font('Helvetica')
         .text(d.location, M, y);
      y += 30;

      const cw3 = (TW - 16) / 3;
      [
        { label: 'CONTACT', value: d.contact },
        { label: 'EMAIL',   value: d.email   },
        { label: 'WEBSITE', value: d.website  },
      ].forEach((item, i) => {
        const cx = M + i * (cw3 + 8);
        doc.rect(cx, y, cw3, 52).fill(C.surface);
        doc.rect(cx, y, cw3, 52).strokeColor(C.border).lineWidth(0.5).stroke();
        doc.rect(cx, y, cw3, 2).fill(C.gold);
        doc.fontSize(7).fillColor(C.gold).font('Helvetica-Bold')
           .text(item.label, cx + 10, y + 10, { width: cw3 - 16 });
        doc.fontSize(8.5).fillColor(C.white).font('Helvetica')
           .text(item.value || 'N/A', cx + 10, y + 26, {
             width: cw3 - 16,
             lineBreak: false,
             ellipsis: true,
           });
      });
      y += 68;

      const chips = [];
      if (d.about)       chips.push('About');
      if (d.fees)        chips.push('Fee Structure');
      if (d.placement)   chips.push('Placements');
      if (d.cutoff)      chips.push('Cutoff');
      if (d.ranking)     chips.push('Rankings');
      if (d.admission)   chips.push('Admission');
      if (d.scholarship) chips.push('Scholarships');

      if (chips.length > 0) {
        doc.fontSize(7).fillColor(C.text3).font('Helvetica-Bold')
           .text('SECTIONS IN THIS BROCHURE', M, y);
        y += 13;
        let cx = M;
        chips.forEach(chip => {
          const cw = doc.widthOfString(chip, { fontSize: 7.5 }) + 22;
          if (cx + cw > PW - M) { cx = M; y += 22; }
          doc.roundedRect(cx, y, cw, 18, 9).fill(C.surface);
          doc.roundedRect(cx, y, cw, 18, 9).strokeColor(C.border).lineWidth(0.5).stroke();
          doc.fontSize(7.5).fillColor(C.goldLight).font('Helvetica-Bold')
             .text(chip, cx, y + 4, { width: cw, align: 'center' });
          cx += cw + 8;
        });
        y += 26;
      }

      if (d.about && d.about.trim().length > 0) {
        y += 8;
        const snip = d.about.trim().substring(0, 380) + (d.about.length > 380 ? '...' : '');
        const sh = Math.min(
          doc.heightOfString(snip, { width: TW - 28, lineGap: 5, fontSize: 9 }) + 28,
          150,
        );
        const maxSh = PH - FTR - 16 - y - 4;
        const finalSh = Math.min(sh, maxSh);
        if (finalSh > 40) {
          doc.rect(M, y, TW, finalSh).fill(C.surface);
          doc.rect(M, y, TW, finalSh).strokeColor(C.border).lineWidth(0.5).stroke();
          doc.rect(M, y, 3, finalSh).fill(C.gold);
          doc.fontSize(9).fillColor(C.text2).font('Helvetica')
             .text(snip, M + 14, y + 13, {
               width: TW - 28,
               lineGap: 5,
               height: finalSh - 22,
               ellipsis: true,
             });
        }
      }

      doc.rect(0, PH - FTR, PW, FTR).fill(C.headerBg);
      doc.rect(0, PH - FTR, PW, 1).fill(C.border);
      doc.rect(0, PH - 2, PW, 2).fill(C.gold);
      doc.fontSize(7).fillColor(C.gold).font('Helvetica-Bold')
         .text('EDUNEXT  ·  Your Trusted College Information Portal', 0, PH - FTR + 7, {
           width: PW,
           align: 'center',
         });
      doc.fontSize(6.5).fillColor(C.text3).font('Helvetica')
         .text(
           `Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}  ·  Verify all details from official college sources.`,
           0, PH - FTR + 20,
           { width: PW, align: 'center' },
         );

      // CONTENT PAGES
      let cy = newPage(doc, d.name);

      if (d.about && d.about.trim().length > 0) {
        cy = drawSectionTitle(doc, 'About the Institution', cy, d.name);
        const at = d.about.trim().substring(0, 1800);
        const ah = Math.min(
          doc.heightOfString(at, { width: TW - 28, lineGap: 6, fontSize: 9.5 }) + 28,
          420,
        );
        cy = ensureSpace(doc, cy, ah, d.name);
        doc.rect(M, cy, TW, ah).fill(C.surface);
        doc.rect(M, cy, TW, ah).strokeColor(C.border).lineWidth(0.5).stroke();
        doc.rect(M, cy, 3, ah).fill(C.gold);
        doc.fontSize(9.5).fillColor(C.text2).font('Helvetica')
           .text(at, M + 14, cy + 14, {
             width: TW - 28,
             align: 'justify',
             lineGap: 6,
             height: ah - 24,
             ellipsis: true,
           });
        cy += ah + 16;
      }

      if (d.fees && d.fees.length > 0) {
        cy += 8;
        if (cy > CT + 30 && cy + 60 < CB) {
          doc.rect(M, cy, TW, 0.5).fill(C.border);
          cy += 14;
        } else {
          cy += 6;
        }
        cy = drawSectionTitle(doc, 'Fee Structure', cy, d.name);

        const noteH = 36;
        cy = ensureSpace(doc, cy, noteH, d.name);
        doc.rect(M, cy, TW, noteH).fill(C.surface);
        doc.rect(M, cy, TW, noteH).strokeColor(C.info).lineWidth(0.5).stroke();
        doc.rect(M, cy, 3, noteH).fill(C.info);
        doc.fontSize(8).fillColor(C.text2).font('Helvetica')
           .text(
             'Note: Fee structure varies by program and category. Contact the admissions office for the latest information.',
             M + 12, cy + 12,
             { width: TW - 24 },
           );
        cy += noteH + 10;

        for (const table of d.fees.slice(0, 4)) {
          cy = drawTable(doc, table, cy, d.name);
        }
      }

      if (d.placement && d.placement.length > 0) {
        cy = drawSection(doc, 'Placement Statistics', d.placement.slice(0, 3), cy, d.name);
      }
      if (d.cutoff && d.cutoff.length > 0) {
        cy = drawSection(doc, 'Cutoff Details', d.cutoff.slice(0, 4), cy, d.name);
      }
      if (d.ranking && d.ranking.length > 0) {
        cy = drawSection(doc, 'Rankings', d.ranking.slice(0, 3), cy, d.name);
      }
      if (d.admission && d.admission.length > 0) {
        cy = drawSection(doc, 'Admission Process', d.admission.slice(0, 3), cy, d.name);
      }
      if (d.scholarship && d.scholarship.length > 0) {
        cy = drawSection(doc, 'Scholarships & Financial Aid', d.scholarship.slice(0, 3), cy, d.name);
      }

      // BACK COVER
      doc.addPage();
      doc.rect(0, 0, PW, PH).fill(C.pageBg);
      doc.rect(0, 0, PW, HDR).fill(C.headerBg);
      doc.rect(0, 0, PW, 3).fill(C.gold);
      doc.rect(0, HDR - 1, PW, 1).fill(C.border);
      drawLogo(doc, M, 15);

      const bmy = PH / 2 - 96;
      doc.fontSize(38).fillColor(C.gold).font('Helvetica-Bold')
         .text('EDUNEXT', 0, bmy, { width: PW, align: 'center' });
      doc.fontSize(11).fillColor(C.text2).font('Helvetica')
         .text('Your Trusted College Information Portal', 0, bmy + 48, {
           width: PW,
           align: 'center',
         });

      const sepY = bmy + 76;
      const rlen = 56;
      doc.rect(PW / 2 - rlen - 6, sepY + 1, rlen, 1).fill(C.border);
      doc.circle(PW / 2, sepY + 1.5, 3.5).fill(C.gold);
      doc.rect(PW / 2 + 6, sepY + 1, rlen, 1).fill(C.border);

      doc.fontSize(9).fillColor(C.text2).font('Helvetica')
         .text('info@edunext.com  ·  www.edunext.com', 0, sepY + 16, {
           width: PW,
           align: 'center',
         });

      const tcw = 320, tch = 68, tcx = (PW - tcw) / 2, tcy = sepY + 50;
      doc.rect(tcx, tcy, tcw, tch).fill(C.surface);
      doc.rect(tcx, tcy, tcw, tch).strokeColor(C.border).lineWidth(1).stroke();
      doc.rect(tcx, tcy, tcw, 2).fill(C.gold);
      doc.fontSize(13).fillColor(C.white).font('Helvetica-Bold')
         .text('Thank You for Choosing EduNext!', 0, tcy + 16, { width: PW, align: 'center' });
      doc.fontSize(8.5).fillColor(C.text3).font('Helvetica')
         .text('Empowering students with accurate college information.', 0, tcy + 38, {
           width: PW,
           align: 'center',
         });

      doc.rect(0, PH - FTR, PW, FTR).fill(C.headerBg);
      doc.rect(0, PH - FTR, PW, 1).fill(C.border);
      doc.rect(0, PH - 2, PW, 2).fill(C.gold);
      doc.fontSize(6.5).fillColor(C.text3).font('Helvetica-Oblique')
         .text(
           'This brochure is auto-generated. All information is subject to change. Verify details from official college sources before any admission decision.',
           M, PH - FTR + 11,
           { width: TW, align: 'center' },
         );

      doc.end();
      stream.on('finish', () => resolve({ filePath, fileName }));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

// ===== UPLOAD TO SUPABASE =====
async function uploadPDF(filePath, fileName) {
  try {
    const buffer = fs.readFileSync(filePath);
    const { error } = await supabase.storage
      .from('college-pdfs')
      .upload(`brochures/${fileName}`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('college-pdfs')
      .getPublicUrl(`brochures/${fileName}`);
    return publicUrl;
  } catch (err) {
    console.error('Upload error:', err.message);
    return null;
  }
}

// ===== MAIN =====
async function run() {
  console.log('EduNext PDF Generator\n');
  ensurePDFDirectory();

  let success = 0, errors = 0, totalProcessed = 0;

  // ── TEST MODE ──────────────────────────────────────────────────
  if (TEST_MODE) {
    console.log(`TEST MODE: College ID ${TEST_COLLEGE_ID}\n`);
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('*')
      .eq('id', TEST_COLLEGE_ID);
    if (error) throw error;
    if (!colleges?.length) { console.log('No colleges found'); return; }

    for (let i = 0; i < colleges.length; i++) {
      const college = colleges[i];
      try {
        console.log(`[1/1] ${college.college_name} (ID: ${college.id})`);
        const { filePath, fileName } = await generatePDF(college);
        console.log(`  PDF created: ${fileName}`);
        const url = await uploadPDF(filePath, fileName);
        if (!url) { errors++; continue; }
        console.log(`  Uploaded: ${url}`);
        const { error: upErr } = await supabase
          .from('college_microsites')
          .update({ pdf_url: url, updated_at: new Date().toISOString() })
          .eq('id', college.id);
        if (upErr) { console.log('  DB update failed:', upErr.message); errors++; }
        else { console.log('  Saved to DB'); success++; }
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        errors++;
      }
    }

    console.log(`\nDone — Success: ${success}, Errors: ${errors}`);
    return;
  }

  // ── PRODUCTION MODE (batched) ──────────────────────────────────
  console.log(`PRODUCTION MODE: All colleges (batch size: ${BATCH_SIZE}, starting offset: ${BATCH_START_OFFSET})\n`);

  let offset = BATCH_START_OFFSET;   // ← set BATCH_START_OFFSET above to resume mid-run

  while (true) {
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('*')
      .order('id', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);   // ← controlled by BATCH_SIZE above

    if (error) throw error;
    if (!colleges?.length) {
      console.log('No more colleges found — all done.');
      break;
    }

    console.log(`\n── Batch: rows ${offset + 1} → ${offset + colleges.length} ──`);
    totalProcessed += colleges.length;

    for (let i = 0; i < colleges.length; i++) {
      const college = colleges[i];
      try {
        console.log(`  [${offset + i + 1}] ${college.college_name} (ID: ${college.id})`);
        const { filePath, fileName } = await generatePDF(college);
        console.log(`    PDF created: ${fileName}`);

        const url = await uploadPDF(filePath, fileName);
        if (!url) { errors++; continue; }
        console.log(`    Uploaded: ${url}`);

        const { error: upErr } = await supabase
          .from('college_microsites')
          .update({ pdf_url: url, updated_at: new Date().toISOString() })
          .eq('id', college.id);

        if (upErr) { console.log('    DB update failed:', upErr.message); errors++; }
        else { console.log('    Saved to DB'); success++; }

        if (i < colleges.length - 1) await delay(DELAY_MS);
      } catch (err) {
        console.error(`    Error: ${err.message}`);
        errors++;
      }
    }

    // If we got fewer rows than BATCH_SIZE, we've reached the end
    if (colleges.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  console.log(`\nDone — Total processed: ${totalProcessed}, Success: ${success}, Errors: ${errors}`);
}

run()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
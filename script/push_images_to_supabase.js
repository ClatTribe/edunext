// script/push_images_to_supabase.js
const fs = require('fs');
const path = require('path');
const { supabase } = require('../src/app/lib/supabase-admin.js');

// ==================== CONFIGURATION ====================
const CSV_FILE = path.join(__dirname, 'images_with_cloudinary.csv');
const BATCH_SIZE = 50; // update 50 rows at a time

// ==================== CSV PARSER ====================
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

// ==================== MAIN ====================
async function pushImages() {
  try {
    console.log('Starting image push to Supabase...\n');

    // 1. Read CSV
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`CSV not found: ${CSV_FILE}`);
      console.error('Run the image uploader script first to generate this file.');
      process.exit(1);
    }

    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const rows = parseCsv(csvContent);
    console.log(`Total rows in CSV: ${rows.length}`);

    // 2. Filter rows that have images
    const rowsWithImages = rows.filter(row => {
      return row.image && row.image !== '' && row.image !== 'null';
    });

    console.log(`Rows with images to push: ${rowsWithImages.length}\n`);

    if (rowsWithImages.length === 0) {
      console.log('No images to push. Exiting.');
      process.exit(0);
    }

    // 3. Test connection
    const { error: connectionError } = await supabase
      .from('college_microsites')
      .select('id')
      .limit(1);

    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    console.log('Database connection successful\n');

    // 4. Push in batches
    let updated = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rowsWithImages.length; i++) {
      const row = rowsWithImages[i];
      const id = parseInt(row.id);
      const title = row.title;
      const imageJson = row.image; // already a JSON string like ["url1","url2"]

      try {
        // Parse the image JSON to validate it
        const imageArray = JSON.parse(imageJson);

        if (!Array.isArray(imageArray) || imageArray.length === 0) {
          console.log(`[${i + 1}] Skipping ${title} — invalid image data`);
          continue;
        }

        const { error: updateError } = await supabase
          .from('college_microsites')
          .update({
            image: imageArray,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        updated++;

        if (updated % 50 === 0) {
          console.log(`Progress: ${updated} updated...`);
        }

      } catch (err) {
        failed++;
        const errorMsg = `${title} (ID: ${id}): ${err.message}`;
        errors.push(errorMsg);
        if (failed <= 10) {
          console.log(`[${i + 1}] FAILED — ${errorMsg}`);
        }
      }
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('PUSH SUMMARY');
    console.log('='.repeat(60));
    console.log(`Updated: ${updated}`);
    console.log(`Failed:  ${failed}`);
    console.log(`Total:   ${rowsWithImages.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log(`\nFirst ${Math.min(errors.length, 10)} errors:`);
      errors.slice(0, 10).forEach((err, idx) => {
        console.log(`${idx + 1}. ${err}`);
      });
    }

    console.log('\nDone!');

  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  }
}

pushImages()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
const fs = require('fs');
const path = require('path');
const { supabase } = require('../src/app/lib/supabase-admin.js');

const OUTPUT_CSV = path.join(__dirname, 'images_missing.csv');

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportMissingImages() {
  try {
    console.log('Fetching colleges from Supabase...\n');

    let allRows = [];
    let from = 0;
    const step = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('college_microsites')
        .select('id, title, image')
        .range(from, from + step - 1);

      if (error) {
        throw new Error(`Database fetch failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        break;
      }

      allRows = allRows.concat(data);
      console.log(`Fetched ${allRows.length} rows so far...`);
      from += step;
    }

    console.log(`\nTotal rows fetched: ${allRows.length}`);

    // Filter rows where image is null, empty string, or "null" string
    const missingImagesRows = allRows.filter(row => {
      if (!row.image) return true;
      if (row.image === 'null' || row.image === '') return true;
      // If it's an array or a JSON string of an array
      if (Array.isArray(row.image) && row.image.length === 0) return true;
      if (typeof row.image === 'string' && row.image.trim() === '[]') return true;
      return false;
    });

    console.log(`Rows missing images: ${missingImagesRows.length}\n`);

    if (missingImagesRows.length === 0) {
      console.log('No missing images found. Exiting.');
      return;
    }

    // Write to CSV
    let csvContent = 'id,title,image\n';
    missingImagesRows.forEach(row => {
      const id = escapeCsvField(row.id);
      const title = escapeCsvField(row.title);
      const image = escapeCsvField(row.image);
      csvContent += `${id},${title},${image}\n`;
    });

    fs.writeFileSync(OUTPUT_CSV, csvContent, 'utf8');
    console.log(`Successfully wrote ${missingImagesRows.length} entries to ${OUTPUT_CSV}`);
    console.log(`\nYou can now run: node script/college_image_uploader.js (after renaming ${OUTPUT_CSV} to images.csv)`);

  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  }
}

exportMissingImages();

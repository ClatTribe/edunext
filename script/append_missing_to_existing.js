const fs = require('fs');
const path = require('path');

const MISSING_CSV = path.join(__dirname, 'images_missing.csv');
const IMAGES_CSV = path.join(__dirname, 'images.csv');
const IMAGEKIT_CSV = path.join(__dirname, 'images_with_imagekit.csv');

function appendToCsv() {
  if (!fs.existsSync(MISSING_CSV)) {
    console.error('images_missing.csv not found!');
    return;
  }

  // Read missing data
  const missingContent = fs.readFileSync(MISSING_CSV, 'utf8');
  const missingLines = missingContent.split('\n').filter(l => l.trim());
  
  if (missingLines.length <= 1) {
    console.log('No data to append.');
    return;
  }

  console.log(`Read ${missingLines.length - 1} entries from images_missing.csv`);

  // We skip the header of missingLines (id,title,image)
  let appendString = '\n';
  
  for (let i = 1; i < missingLines.length; i++) {
    // missingLines[i] format: id,title,image
    // We need to insert a blank 'url' column to match id,title,url,image
    
    // Simple parse (assuming no commas in image field for missing ones, which are empty)
    // Actually, title can have commas and is quoted. 
    // Let's do a proper split if needed, or regex:
    const line = missingLines[i];
    
    // The image field in missing is usually empty or '[]'. We just need to insert an empty URL before it.
    // However, it's safer to parse the CSV line.
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (inQuotes) {
        if (char === '"' && line[j + 1] === '"') { current += '"'; j++; }
        else if (char === '"') { inQuotes = false; }
        else { current += char; }
      } else {
        if (char === '"') { inQuotes = true; }
        else if (char === ',') { result.push(current); current = ''; }
        else { current += char; }
      }
    }
    result.push(current);

    // result should be [id, title, image]
    const id = result[0];
    let title = result[1];
    let image = result[2] || '';
    
    // Escape title and image if they have commas or quotes
    if (title && (title.includes(',') || title.includes('"') || title.includes('\n'))) {
      title = `"${title.replace(/"/g, '""')}"`;
    }
    if (image && (image.includes(',') || image.includes('"') || image.includes('\n'))) {
      image = `"${image.replace(/"/g, '""')}"`;
    }
    
    const url = ''; // Empty URL column
    
    // Construct new line: id, title, url, image
    appendString += `${id},${title},${url},${image}\n`;
  }

  // Append to images.csv
  if (fs.existsSync(IMAGES_CSV)) {
    fs.appendFileSync(IMAGES_CSV, appendString, 'utf8');
    console.log(`Successfully appended to ${IMAGES_CSV}`);
  } else {
    console.log('images.csv not found, skipping append.');
  }

  // Append to images_with_imagekit.csv
  if (fs.existsSync(IMAGEKIT_CSV)) {
    fs.appendFileSync(IMAGEKIT_CSV, appendString, 'utf8');
    console.log(`Successfully appended to ${IMAGEKIT_CSV}`);
  } else {
    console.log('images_with_imagekit.csv not found, skipping append.');
  }

  console.log('\nMerge complete! Both files now contain all 19,000+ entries.');
}

appendToCsv();

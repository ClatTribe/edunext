// script/upsert-raw-testcollege.js
const fs = require('fs');
const path = require('path');
const { supabase } = require('../src/app/lib/supabase-admin.js');

// Configuration
const JSON_FILE_PATH = path.join(__dirname, '../new-data/testcollege_0006.jsonl');

// Helper to generate a slug from the raw title
function generateSlug(name) {
  if (!name) return 'unknown-college';
  return name.split(':')[0]
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Sanitize empty arrays to null
function sanitizeEmptyArrays(obj) {
  const sanitized = { ...obj };
  const jsonbFields = [
    'fees', 'placement', 'cutoff', 'ranking', 
    'admission', 'scholarship', 'reviews', 'address', 
    'info_tables'
  ];
  
  jsonbFields.forEach(field => {
    if (Array.isArray(sanitized[field]) && sanitized[field].length === 0) {
      sanitized[field] = null;
    }
    if (sanitized[field] && typeof sanitized[field] === 'object' && Object.keys(sanitized[field]).length === 0) {
      sanitized[field] = null;
    }
  });
  
  return sanitized;
}

async function runUpsert() {
  try {
    console.log('🚀 Starting UPSERT for testcollege_0006.jsonl...\n');

    // 1. Read JSONL
    if (!fs.existsSync(JSON_FILE_PATH)) {
      throw new Error(`File not found: ${JSON_FILE_PATH}`);
    }
    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    const collegesData = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ Found ${collegesData.length} colleges to process.\n`);

    let updatedCount = 0;
    let insertedCount = 0;
    let failedCount = 0;

    // 2. Iterate and Upsert
    for (let i = 0; i < collegesData.length; i++) {
      const rawCollege = collegesData[i];
      const collegeId = rawCollege.id;
      const cleanName = rawCollege.title ? rawCollege.title.split(':')[0].trim() : 'Unknown College';
      const slug = generateSlug(cleanName);

      // Data payload mapping everything up to "scholarship"
      // Note: We DO NOT include card_detail, image, podcast, video, order_position, description, pdf_url
      let payload = {
        slug: slug,
        college_name: cleanName,
        title: cleanName,
        url: rawCollege.url || null,
        location: null, // Usually generated later or kept null
        microsite_data: rawCollege, // Raw backup
        about: rawCollege.about || null,
        contact: rawCollege.contact || null,
        email: rawCollege.email || null,
        address: rawCollege.address || null,
        info_tables: rawCollege.info_tables || null,
        fees: rawCollege.fees || null,
        courses: rawCollege.courses || null,
        placement: rawCollege.placement || null,
        reviews: rawCollege.reviews || null,
        cutoff: rawCollege.cutoff || null,
        ranking: rawCollege.ranking || null,
        admission: rawCollege.admission || null,
        scholarship: rawCollege.scholarship || null,
        updated_at: new Date().toISOString()
      };

      payload = sanitizeEmptyArrays(payload);

      try {
        // Check if exists using microsite_data->>id
        const { data: existingRecords, error: fetchError } = await supabase
          .from('college_microsites')
          .select('id')
          .eq('microsite_data->>id', collegeId.toString());

        if (fetchError) throw fetchError;

        if (existingRecords && existingRecords.length > 0) {
          // UPDATE
          const dbId = existingRecords[0].id;
          
          const { error: updateError } = await supabase
            .from('college_microsites')
            .update(payload)
            .eq('id', dbId);

          if (updateError) throw updateError;
          
          updatedCount++;
          console.log(`[UPDATE] ID: ${collegeId} -> DB ID: ${dbId} | ${cleanName}`);
        } else {
          // INSERT
          // add created_at for insert
          payload.created_at = new Date().toISOString();
          
          const { error: insertError } = await supabase
            .from('college_microsites')
            .insert(payload);

          if (insertError) throw insertError;
          
          insertedCount++;
          console.log(`[INSERT] ID: ${collegeId} | ${cleanName}`);
        }

      } catch (err) {
        failedCount++;
        console.error(`[ERROR] ID: ${collegeId} | ${cleanName} - ${err.message}`);
      }
    }

    console.log('\n========================================');
    console.log('📊 UPSERT SUMMARY');
    console.log('========================================');
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`✅ Inserted: ${insertedCount}`);
    console.log(`❌ Failed:  ${failedCount}`);
    console.log('========================================');

  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

runUpsert();

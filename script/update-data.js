// script/update-data.js
const fs = require('fs');

// Import the admin Supabase client (with SERVICE ROLE key)
const { supabase } = require('../src/app/lib/supabase-admin.js');

// ==================== CONFIGURATION ====================
const JSON_FILE_PATH = './all_data.jsonl';

// ==================== HELPER FUNCTIONS ====================
function generateSlug(name) {
  if (!name) return 'unknown-college';

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractCollegeName(title) {
  if (!title) return 'Unknown College';
  return title.split(':')[0].trim(); // "Dr SRK Government Arts College Yanam"
}

// ==================== MAIN FUNCTION ====================
async function updateColleges() {
  try {
    console.log('🚀 Starting update...\n');

    // 1. Read and parse JSONL file
    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const lines = fileContent.trim().split('\n');

    const collegesData = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('Failed to parse line:', line);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ Found ${collegesData.length} colleges in file\n`);

    // 2. Test connection first
    const { error: connectionError } = await supabase
      .from('college_microsites')
      .select('id')
      .limit(1);

    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }

    console.log('✅ Database connection successful\n');

    // 3. Delete & Re-insert each college by matching name column
    let success = 0;
    let inserted = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < collegesData.length; i++) {
      const college = collegesData[i];
      const rawTitle = college.title || 'Unknown College';
      const collegeName = extractCollegeName(rawTitle); // Before colon
      const slug = generateSlug(collegeName);

      try {
        // Prepare data
        const insertData = {
          slug: slug,
          college_name: collegeName,
          title: rawTitle,
          url: college.url || null,
          location: college.address?.streetAddress || null,
          about: college.about || null,
          contact: college.contact || null,
          email: college.email || null,
          address: college.address || null,
          info_tables: college.info_tables || null,
          fees: college.fees || null,
          courses: college.courses || null,
          placement: college.placement || null,
          reviews: college.reviews || null,
          cutoff: college.cutoff || null,
          ranking: college.ranking || null,
          admission: college.admission || null,
          scholarship: college.scholarship || null,
          microsite_data: college,
          updated_at: new Date().toISOString()
        };

        console.log(`🔍 Looking up: ${collegeName}`);

        // Check if college exists in DB by "name" column
        const { data: existing, error: fetchError } = await supabase
          .from('college_microsites')
          .select('id, created_at')
          .eq('college_name', collegeName)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existing) {
          // Preserve original created_at
          insertData.created_at = existing.created_at;

          // Step 1: Delete existing record
          const { error: deleteError } = await supabase
            .from('college_microsites')
            .delete()
            .eq('college_name', collegeName);

          if (deleteError) throw deleteError;

          // Step 2: Insert fresh record
          const { error: insertError } = await supabase
            .from('college_microsites')
            .insert(insertData);

          if (insertError) throw insertError;

          success++;
          console.log(`✅ [${i + 1}/${collegesData.length}] Updated: ${collegeName}\n`);

        } else {
          // Not found → Insert as new entry
          const { error: insertError } = await supabase
            .from('college_microsites')
            .insert(insertData);

          if (insertError) throw insertError;

          inserted++;
          console.log(`🆕 [${i + 1}/${collegesData.length}] New entry inserted: ${collegeName}\n`);
        }

      } catch (err) {
        failed++;
        const errorMsg = `${collegeName}: ${err.message}`;
        errors.push(errorMsg);
        console.log(`❌ [${i + 1}/${collegesData.length}] ERROR: ${errorMsg}\n`);
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated : ${success}`);
    console.log(`🆕 Newly inserted      : ${inserted}`);
    console.log(`❌ Errors               : ${failed}`);
    console.log(`📁 Total in file        : ${collegesData.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
    }

    console.log('\n✨ Update completed!\n');

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error('\nStack trace:', err.stack);
    process.exit(1);
  }
}

// ==================== EXECUTE ====================
updateColleges()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });
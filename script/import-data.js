// script/import-data.js
const fs = require('fs');

// Import the admin Supabase client (with SERVICE ROLE key)
const { supabase } = require('../src/app/lib/supabase-admin.js');

// ==================== CONFIGURATION ====================
const JSON_FILE_PATH = './colleges-data.json';  // Your JSON file path

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

function cleanJsonData(data) {
  // Handle array or single object
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

// ==================== MAIN IMPORT FUNCTION ====================
async function importColleges() {
  try {
    console.log('🚀 Starting import...\n');

    // 1. Read and parse JSON file
    let fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    
    // Remove trailing commas (common JSON error)
    fileContent = fileContent.replace(/,(\s*[}\]])/g, '$1');
    
    let collegesData = JSON.parse(fileContent);
    collegesData = cleanJsonData(collegesData);

    console.log(`✅ Found ${collegesData.length} colleges\n`);

    // 2. Test connection first
    const { error: connectionError } = await supabase
      .from('college_microsites')
      .select('id')
      .limit(1);

    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }

    console.log('✅ Database connection successful\n');

    // 3. Import each college
    let success = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < collegesData.length; i++) {
      const college = collegesData[i];
      const name = college.name || college['College Name'] || 'Unknown College';
      const slug = generateSlug(name);

      try {
        // Prepare data for insertion
        const insertData = {
          id: college.id || null, // Include the id from JSON if present
          slug: slug,
          college_name: name,
          url: college.url || null,
          location: college.location || null,
          microsite_data: college
        };

        console.log(`📝 Inserting: ${name} (slug: ${slug})`);

        const { data, error } = await supabase
          .from('college_microsites')
          .insert(insertData)
          .select();

        if (error) {
          throw error;
        }

        success++;
        console.log(`✅ [${i + 1}/${collegesData.length}] ${name}\n`);

      } catch (err) {
        failed++;
        const errorMsg = `${name}: ${err.message}`;
        errors.push(errorMsg);
        console.log(`❌ [${i + 1}/${collegesData.length}] ${errorMsg}\n`);
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${success}`);
    console.log(`❌ Failed to import: ${failed}`);
    console.log(`📁 Total colleges: ${collegesData.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err}`);
      });
    }

    console.log('\n✨ Import completed!\n');

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error('\nStack trace:', err.stack);
    process.exit(1);
  }
}

// ==================== EXECUTE ====================
// Run the import
importColleges()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });
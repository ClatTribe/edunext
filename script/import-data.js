// script/import-data.js
const fs = require('fs');

// Import the admin Supabase client (with SERVICE ROLE key)
const { supabase } = require('../src/app/lib/supabase-admin.js');

// ==================== CONFIGURATION ====================
const JSON_FILE_PATH = './college_data.jsonl';  // Your JSON file path

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

    // 1. Read and parse JSONL file (line by line)
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
      const title = college.title || 'Unknown College';
      const slug = generateSlug(title);

      try {
        // Prepare data for insertion (mapping to new schema)
        const insertData = {
          slug: slug,
          college_name: title, // Keep for backward compatibility
          title: title,
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
          microsite_data: college, // Store complete JSON as backup
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log(`📝 Inserting: ${title} (slug: ${slug})`);

        const { data, error } = await supabase
          .from('college_microsites')
          .insert(insertData)
          .select();

        if (error) {
          throw error;
        }

        success++;
        console.log(`✅ [${i + 1}/${collegesData.length}] ${title}\n`);

      } catch (err) {
        failed++;
        const errorMsg = `${title}: ${err.message}`;
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
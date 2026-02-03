// scripts/replace-collegedunia-urls.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

// Recursive function to replace URLs in nested objects/arrays
function replaceUrlsInObject(obj, targetUrl) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceUrlsInObject(item, targetUrl));
  }

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('https://collegedunia.com/')) {
      newObj[key] = targetUrl;
    } else if (typeof value === 'object' && value !== null) {
      newObj[key] = replaceUrlsInObject(value, targetUrl);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

async function replaceCollegeduniaUrls() {
  try {
    console.log('🚀 Starting URL replacement process...\n');

    // Fetch all colleges
    let allColleges = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('📥 Fetching all colleges from database...\n');

    while (hasMore) {
      const { data, error } = await supabase
        .from('college_microsites')
        .select('*')
        .range(from, from + batchSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allColleges = allColleges.concat(data);
        console.log(`📥 Fetched ${data.length} colleges (total so far: ${allColleges.length})`);
        from += batchSize;
      } else {
        hasMore = false;
      }

      if (!data || data.length < batchSize) {
        hasMore = false;
      }
    }

    console.log(`\n✅ Total colleges fetched: ${allColleges.length}\n`);
    console.log('⚙️  Processing colleges and replacing URLs...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // JSONB columns to check and update
    const jsonbColumns = ['microsite_data', 'address', 'info_tables', 'fees', 'placement', 'reviews', 'cutoff', 'ranking', 'admission', 'scholarship', 'card_detail'];

    // Process each college
    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      try {
        // Skip if no card_detail or no url in card_detail
        if (!college.card_detail || !college.card_detail.url) {
          skippedCount++;
          console.log(`⏭️  Skipped college ${college.id} (no card_detail.url)`);
          continue;
        }

        const targetUrl = college.card_detail.url;
        const updateData = {};
        let hasChanges = false;

        // Check and update the main 'url' column
        if (college.url && college.url.startsWith('https://collegedunia.com/')) {
          updateData.url = targetUrl;
          hasChanges = true;
        }

        // Process each JSONB column
        for (const columnName of jsonbColumns) {
          if (college[columnName]) {
            const updatedColumn = replaceUrlsInObject(college[columnName], targetUrl);
            
            // Check if anything changed
            if (JSON.stringify(updatedColumn) !== JSON.stringify(college[columnName])) {
              updateData[columnName] = updatedColumn;
              hasChanges = true;
            }
          }
        }

        // Only update if there are changes
        if (hasChanges) {
          updateData.updated_at = new Date().toISOString();

          const { error: updateError } = await supabase
            .from('college_microsites')
            .update(updateData)
            .eq('id', college.id);

          if (updateError) {
            console.error(`❌ Error updating college ${college.id}:`, updateError.message);
            errorCount++;
          } else {
            successCount++;
            if (successCount % 100 === 0) {
              console.log(`✅ Progress: ${successCount} colleges updated...`);
            }
          }
        } else {
          skippedCount++;
        }

      } catch (err) {
        console.error(`❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 URL REPLACEMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`⏭️  Skipped (no changes/no url): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Colleges: ${allColleges.length}`);
    console.log('='.repeat(70));

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

replaceCollegeduniaUrls()
  .then(() => {
    console.log('\n✨ URL replacement completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
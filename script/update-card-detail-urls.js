// scripts/update-card-detail-urls.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

async function updateCardDetailUrls() {
  try {
    console.log('🚀 Starting card_detail URL update...\n');

    // Step 1: Fetch ALL colleges
    let allColleges = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('📥 Fetching all colleges from database...\n');

    while (hasMore) {
      const { data, error } = await supabase
        .from('college_microsites')
        .select('id, card_detail')
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
    console.log('⚙️  Processing colleges and updating URLs...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Step 2: Process each college
    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      try {
        // Skip if no card_detail
        if (!college.card_detail) {
          skippedCount++;
          continue;
        }

        const cardDetail = college.card_detail;
        
        // Skip if no email in card_detail
        if (!cardDetail.email || typeof cardDetail.email !== 'string') {
          skippedCount++;
          continue;
        }

        // Extract domain from email
        const emailParts = cardDetail.email.split('@');
        if (emailParts.length !== 2) {
          skippedCount++;
          continue;
        }

        const domain = emailParts[1].trim();
        
        // Create new URL with https://
        const newUrl = `https://${domain}`;

        // Update card_detail with new URL
        const updatedCardDetail = {
          ...cardDetail,
          url: newUrl
        };

        // Update the college
        const { error: updateError } = await supabase
          .from('college_microsites')
          .update({ 
            card_detail: updatedCardDetail,
            updated_at: new Date().toISOString()
          })
          .eq('id', college.id);

        if (updateError) {
          console.error(`❌ Error updating college ${college.id}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 100 === 0) {
            console.log(`✅ Progress: ${successCount}/${allColleges.length} colleges updated...`);
          }
        }
      } catch (err) {
        console.error(`❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 URL UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`⏭️  Skipped (no email/card_detail): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Colleges: ${allColleges.length}`);
    console.log('='.repeat(70));

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

updateCardDetailUrls()
  .then(() => {
    console.log('\n✨ URL update completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
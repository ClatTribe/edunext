// // scripts/update-card-detail-urls.js
// const { supabase } = require('../src/app/lib/supabase-admin.js');

// async function updateCardDetailUrls() {
//   try {
//     console.log('🚀 Starting card_detail URL update...\n');

//     // Step 1: Fetch ALL colleges
//     let allColleges = [];
//     let from = 0;
//     const batchSize = 1000;
//     let hasMore = true;

//     console.log('📥 Fetching all colleges from database...\n');

//     while (hasMore) {
//       const { data, error } = await supabase
//         .from('college_microsites')
//         .select('id, card_detail')
//         .range(from, from + batchSize - 1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         allColleges = allColleges.concat(data);
//         console.log(`📥 Fetched ${data.length} colleges (total so far: ${allColleges.length})`);
//         from += batchSize;
//       } else {
//         hasMore = false;
//       }

//       if (!data || data.length < batchSize) {
//         hasMore = false;
//       }
//     }

//     console.log(`\n✅ Total colleges fetched: ${allColleges.length}\n`);
//     console.log('⚙️  Processing colleges and updating URLs...\n');

//     let successCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;

//     // Step 2: Process each college
//     for (let i = 0; i < allColleges.length; i++) {
//       const college = allColleges[i];
      
//       try {
//         // Skip if no card_detail
//         if (!college.card_detail) {
//           skippedCount++;
//           continue;
//         }

//         const cardDetail = college.card_detail;
        
//         // Skip if no email in card_detail
//         if (!cardDetail.email || typeof cardDetail.email !== 'string') {
//           skippedCount++;
//           continue;
//         }

//         // Extract domain from email
//         const emailParts = cardDetail.email.split('@');
//         if (emailParts.length !== 2) {
//           skippedCount++;
//           continue;
//         }

//         const domain = emailParts[1].trim();
        
//         // Create new URL with https://
//         const newUrl = `https://${domain}`;

//         // Update card_detail with new URL
//         const updatedCardDetail = {
//           ...cardDetail,
//           url: newUrl
//         };

//         // Update the college
//         const { error: updateError } = await supabase
//           .from('college_microsites')
//           .update({ 
//             card_detail: updatedCardDetail,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id);

//         if (updateError) {
//           console.error(`❌ Error updating college ${college.id}:`, updateError.message);
//           errorCount++;
//         } else {
//           successCount++;
//           if (successCount % 100 === 0) {
//             console.log(`✅ Progress: ${successCount}/${allColleges.length} colleges updated...`);
//           }
//         }
//       } catch (err) {
//         console.error(`❌ Error processing college ${college.id}:`, err.message);
//         errorCount++;
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 URL UPDATE SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`✅ Successfully Updated: ${successCount}`);
//     console.log(`⏭️  Skipped (no email/card_detail): ${skippedCount}`);
//     console.log(`❌ Errors: ${errorCount}`);
//     console.log(`📁 Total Colleges: ${allColleges.length}`);
//     console.log('='.repeat(70));

//   } catch (err) {
//     console.error('❌ Fatal Error:', err.message);
//     process.exit(1);
//   }
// }

// updateCardDetailUrls()
//   .then(() => {
//     console.log('\n✨ URL update completed!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });

// scripts/update-card-detail-urls.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

// 🎯 ADD YOUR SPECIFIC COLLEGE IDs HERE
// const TARGET_COLLEGE_IDS = [14906, 14907, 14908, 14909, 14910];
const TARGET_COLLEGE_IDS = Array.from({length: 15515 - 15299 + 1}, (_, i) => 15299 + i);

async function updateCardDetailUrls() {
  try {
    console.log('🚀 Starting card_detail URL update...\n');
    console.log(`🎯 Targeting specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);

    // Fetch only the specific colleges
    const { data: allColleges, error } = await supabase
      .from('college_microsites')
      .select('id, college_name, card_detail')
      .in('id', TARGET_COLLEGE_IDS);

    if (error) throw error;

    if (!allColleges || allColleges.length === 0) {
      console.log('❌ No colleges found with the specified IDs');
      return;
    }

    console.log(`✅ Found ${allColleges.length} colleges to process\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each college
    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      console.log(`\n📝 Processing College ID: ${college.id} - ${college.college_name || 'Unknown'}`);
      
      try {
        // Skip if no card_detail
        if (!college.card_detail) {
          skippedCount++;
          console.log(`   ⏭️  Skipped (no card_detail)`);
          continue;
        }

        const cardDetail = college.card_detail;
        
        // Skip if no email in card_detail
        if (!cardDetail.email || typeof cardDetail.email !== 'string') {
          skippedCount++;
          console.log(`   ⏭️  Skipped (no email in card_detail)`);
          continue;
        }

        console.log(`   📧 Email found: ${cardDetail.email}`);

        // Extract domain from email
        const emailParts = cardDetail.email.split('@');
        if (emailParts.length !== 2) {
          skippedCount++;
          console.log(`   ⏭️  Skipped (invalid email format)`);
          continue;
        }

        const domain = emailParts[1].trim();
        
        // Create new URL with https://
        const newUrl = `https://${domain}`;
        console.log(`   🔗 Generated URL: ${newUrl}`);

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
          console.error(`   ❌ Error updating college ${college.id}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
          console.log(`   ✅ Successfully updated card_detail.url`);
        }
      } catch (err) {
        console.error(`   ❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 URL UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`🎯 Targeted Colleges: ${TARGET_COLLEGE_IDS.join(', ')}`);
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`⏭️  Skipped (no email/card_detail): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Processed: ${allColleges.length}`);
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
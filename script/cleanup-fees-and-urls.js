// // scripts/cleanup-fees-and-urls.js
// const { supabase } = require('../src/app/lib/supabase-admin.js');

// // Function to clean fees string
// function cleanFeesString(feesStr) {
//   if (!feesStr || typeof feesStr !== 'string') {
//     return null;
//   }

//   // Remove "undefined", "Check Details", extra spaces and dashes
//   let cleaned = feesStr
//     .replace(/Check Details/gi, '')
//     .replace(/undefined/gi, '')
//     .replace(/\s*-\s*-\s*/g, ' - ')  // Replace multiple dashes with single dash
//     .replace(/\s*-\s*$/g, '')        // Remove trailing dash
//     .replace(/^\s*-\s*/g, '')        // Remove leading dash
//     .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
//     .trim();

//   // If nothing meaningful left, return null
//   if (!cleaned || cleaned === '-' || cleaned === '- -') {
//     return null;
//   }

//   return cleaned;
// }

// // Recursive function to replace URLs in nested objects/arrays
// function replaceUrlsInObject(obj, targetUrl) {
//   if (!obj || typeof obj !== 'object') {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map(item => replaceUrlsInObject(item, targetUrl));
//   }

//   const newObj = {};
//   for (const [key, value] of Object.entries(obj)) {
//     if (typeof value === 'string' && 
//         (value.includes('collegedunia.com') || value.startsWith('http'))) {
//       // Replace any URL (especially collegedunia) with targetUrl
//       // If targetUrl is null/empty, this will set it to null
//       newObj[key] = targetUrl || null;
//     } else if (typeof value === 'object' && value !== null) {
//       newObj[key] = replaceUrlsInObject(value, targetUrl);
//     } else {
//       newObj[key] = value;
//     }
//   }
//   return newObj;
// }

// async function cleanupFeesAndUrls() {
//   try {
//     console.log('🚀 Starting cleanup process for fees and URLs...\n');

//     // Fetch all colleges
//     let allColleges = [];
//     let from = 0;
//     const batchSize = 1000;
//     let hasMore = true;

//     console.log('📥 Fetching all colleges from database...\n');

//     while (hasMore) {
//       const { data, error } = await supabase
//         .from('college_microsites')
//         .select('*')
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
//     console.log('⚙️  Processing colleges...\n');

//     let successCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;
//     let feesCleanedCount = 0;
//     let urlsCleanedCount = 0;

//     // JSONB columns to check and update for URLs
//     const jsonbColumns = ['microsite_data', 'address', 'info_tables', 'fees', 'placement', 'reviews', 'cutoff', 'ranking', 'admission', 'scholarship', 'card_detail'];

//     // Process each college
//     for (let i = 0; i < allColleges.length; i++) {
//       const college = allColleges[i];
      
//       try {
//         const updateData = {};
//         let hasChanges = false;

//         // Get target URL from card_detail (or null if not exists)
//         const targetUrl = (college.card_detail && college.card_detail.url) ? college.card_detail.url : null;

//         // 1. CLEAN FEES in card_detail.fees
//         if (college.card_detail && college.card_detail.fees) {
//           const cleanedFees = cleanFeesString(college.card_detail.fees);
//           if (cleanedFees !== college.card_detail.fees) {
//             updateData.card_detail = { ...college.card_detail, fees: cleanedFees };
//             hasChanges = true;
//             feesCleanedCount++;
//           }
//         }

//         // 2. CLEAN URL in main 'url' column
//         if (college.url) {
//           // If URL contains collegedunia OR if targetUrl is null, update it
//           if (college.url.includes('collegedunia.com') || !targetUrl) {
//             updateData.url = targetUrl;
//             hasChanges = true;
//             urlsCleanedCount++;
//           } else if (targetUrl && college.url !== targetUrl) {
//             // Ensure main URL matches card_detail.url
//             updateData.url = targetUrl;
//             hasChanges = true;
//             urlsCleanedCount++;
//           }
//         }

//         // 3. CLEAN URLs in all JSONB columns
//         for (const columnName of jsonbColumns) {
//           if (college[columnName]) {
//             // Skip card_detail if we already updated it for fees
//             if (columnName === 'card_detail' && updateData.card_detail) {
//               // Apply URL replacement to the already updated card_detail
//               updateData.card_detail = replaceUrlsInObject(updateData.card_detail, targetUrl);
//             } else {
//               const updatedColumn = replaceUrlsInObject(college[columnName], targetUrl);
              
//               // Check if anything changed
//               if (JSON.stringify(updatedColumn) !== JSON.stringify(college[columnName])) {
//                 updateData[columnName] = updatedColumn;
//                 hasChanges = true;
//                 if (columnName !== 'card_detail') {
//                   urlsCleanedCount++;
//                 }
//               }
//             }
//           }
//         }

//         // Only update if there are changes
//         if (hasChanges) {
//           updateData.updated_at = new Date().toISOString();

//           const { error: updateError } = await supabase
//             .from('college_microsites')
//             .update(updateData)
//             .eq('id', college.id);

//           if (updateError) {
//             console.error(`❌ Error updating college ${college.id}:`, updateError.message);
//             errorCount++;
//           } else {
//             successCount++;
//             if (successCount % 100 === 0) {
//               console.log(`✅ Progress: ${successCount} colleges updated...`);
//             }
//           }
//         } else {
//           skippedCount++;
//         }

//       } catch (err) {
//         console.error(`❌ Error processing college ${college.id}:`, err.message);
//         errorCount++;
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 CLEANUP SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`✅ Successfully Updated: ${successCount}`);
//     console.log(`🧹 Fees Cleaned (card_detail): ${feesCleanedCount}`);
//     console.log(`🔗 URLs Cleaned/Replaced: ${urlsCleanedCount}`);
//     console.log(`⏭️  Skipped (no changes): ${skippedCount}`);
//     console.log(`❌ Errors: ${errorCount}`);
//     console.log(`📁 Total Colleges: ${allColleges.length}`);
//     console.log('='.repeat(70));

//   } catch (err) {
//     console.error('❌ Fatal Error:', err.message);
//     process.exit(1);
//   }
// }

// cleanupFeesAndUrls()
//   .then(() => {
//     console.log('\n✨ Cleanup completed!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });

// scripts/cleanup-fees-and-urls.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

// 🎯 ADD YOUR SPECIFIC COLLEGE IDs HERE
const TARGET_COLLEGE_IDS = [14893];

// Function to clean fees string
function cleanFeesString(feesStr) {
  if (!feesStr || typeof feesStr !== 'string') {
    return null;
  }

  // Remove "undefined", "Check Details", extra spaces and dashes
  let cleaned = feesStr
    .replace(/Check Details/gi, '')
    .replace(/undefined/gi, '')
    .replace(/\s*-\s*-\s*/g, ' - ')  // Replace multiple dashes with single dash
    .replace(/\s*-\s*$/g, '')        // Remove trailing dash
    .replace(/^\s*-\s*/g, '')        // Remove leading dash
    .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
    .trim();

  // If nothing meaningful left, return null
  if (!cleaned || cleaned === '-' || cleaned === '- -') {
    return null;
  }

  return cleaned;
}

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
    if (typeof value === 'string' && 
        (value.includes('collegedunia.com') || value.startsWith('http'))) {
      // Replace any URL (especially collegedunia) with targetUrl
      // If targetUrl is null/empty, this will set it to null
      newObj[key] = targetUrl || null;
    } else if (typeof value === 'object' && value !== null) {
      newObj[key] = replaceUrlsInObject(value, targetUrl);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

async function cleanupFeesAndUrls() {
  try {
    console.log('🚀 Starting cleanup process for fees and URLs...\n');
    console.log(`🎯 Targeting specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);

    // Fetch only the specific colleges
    const { data: allColleges, error } = await supabase
      .from('college_microsites')
      .select('*')
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
    let feesCleanedCount = 0;
    let urlsCleanedCount = 0;

    // JSONB columns to check and update for URLs
    const jsonbColumns = ['microsite_data', 'address', 'info_tables', 'fees', 'placement', 'reviews', 'cutoff', 'ranking', 'admission', 'scholarship', 'card_detail'];

    // Process each college
    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      console.log(`\n📝 Processing College ID: ${college.id} - ${college.college_name || 'Unknown'}`);
      
      try {
        const updateData = {};
        let hasChanges = false;

        // Get target URL from card_detail (or null if not exists)
        const targetUrl = (college.card_detail && college.card_detail.url) ? college.card_detail.url : null;
        console.log(`   🔗 Target URL: ${targetUrl || 'None'}`);

        // 1. CLEAN FEES in card_detail.fees
        if (college.card_detail && college.card_detail.fees) {
          const originalFees = college.card_detail.fees;
          const cleanedFees = cleanFeesString(college.card_detail.fees);
          if (cleanedFees !== college.card_detail.fees) {
            updateData.card_detail = { ...college.card_detail, fees: cleanedFees };
            hasChanges = true;
            feesCleanedCount++;
            console.log(`   🧹 Cleaned fees: "${originalFees}" → "${cleanedFees}"`);
          }
        }

        // 2. CLEAN URL in main 'url' column
        if (college.url) {
          const originalUrl = college.url;
          // If URL contains collegedunia OR if targetUrl is null, update it
          if (college.url.includes('collegedunia.com') || !targetUrl) {
            updateData.url = targetUrl;
            hasChanges = true;
            urlsCleanedCount++;
            console.log(`   🔗 Updated main URL: "${originalUrl}" → "${targetUrl}"`);
          } else if (targetUrl && college.url !== targetUrl) {
            // Ensure main URL matches card_detail.url
            updateData.url = targetUrl;
            hasChanges = true;
            urlsCleanedCount++;
            console.log(`   🔗 Synced main URL with card_detail: "${originalUrl}" → "${targetUrl}"`);
          }
        }

        // 3. CLEAN URLs in all JSONB columns
        for (const columnName of jsonbColumns) {
          if (college[columnName]) {
            // Skip card_detail if we already updated it for fees
            if (columnName === 'card_detail' && updateData.card_detail) {
              // Apply URL replacement to the already updated card_detail
              updateData.card_detail = replaceUrlsInObject(updateData.card_detail, targetUrl);
            } else {
              const updatedColumn = replaceUrlsInObject(college[columnName], targetUrl);
              
              // Check if anything changed
              if (JSON.stringify(updatedColumn) !== JSON.stringify(college[columnName])) {
                updateData[columnName] = updatedColumn;
                hasChanges = true;
                if (columnName !== 'card_detail') {
                  urlsCleanedCount++;
                }
                console.log(`   ✏️  Cleaned URLs in ${columnName}`);
              }
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
            console.error(`   ❌ Error updating college ${college.id}:`, updateError.message);
            errorCount++;
          } else {
            successCount++;
            console.log(`   ✅ Successfully updated college ${college.id}`);
          }
        } else {
          skippedCount++;
          console.log(`   ⏭️  No changes needed`);
        }

      } catch (err) {
        console.error(`   ❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`🎯 Targeted Colleges: ${TARGET_COLLEGE_IDS.join(', ')}`);
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`🧹 Fees Cleaned (card_detail): ${feesCleanedCount}`);
    console.log(`🔗 URLs Cleaned/Replaced: ${urlsCleanedCount}`);
    console.log(`⏭️  Skipped (no changes): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Processed: ${allColleges.length}`);
    console.log('='.repeat(70));

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

cleanupFeesAndUrls()
  .then(() => {
    console.log('\n✨ Cleanup completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
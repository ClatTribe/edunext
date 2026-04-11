// // script/update-locations.js - UPDATE ALL COLLEGES
// const { supabase } = require('../src/app/lib/supabase-admin.js');
// const fs = require('fs');
// const path = require('path');

// async function updateAllCollegeLocations() {
//   try {
//     console.log('\n' + '='.repeat(70));
//     console.log('📍 UPDATING ALL COLLEGES FROM CSV');
//     console.log('='.repeat(70) + '\n');

//     // Read the cleaned CSV file
//     const csvPath = path.join(__dirname, 'college_locations_cleaned.csv');
//     console.log(`📁 Reading CSV from: ${csvPath}\n`);
    
//     const csvContent = fs.readFileSync(csvPath, 'utf-8');
//     const lines = csvContent.split('\n');

//     // Parse CSV (title, location)
//     const csvRows = [];
//     for (let i = 1; i < lines.length; i++) {
//       const line = lines[i].trim();
//       if (!line) continue;

//       // Handle CSV with quoted fields
//       let title, location;
      
//       const parts = [];
//       let current = '';
//       let inQuotes = false;
      
//       for (let j = 0; j < line.length; j++) {
//         const char = line[j];
//         if (char === '"') {
//           inQuotes = !inQuotes;
//           current += char;
//         } else if (char === ',' && !inQuotes) {
//           parts.push(current);
//           current = '';
//         } else {
//           current += char;
//         }
//       }
//       parts.push(current);

//       title = parts[0]?.trim().replace(/"/g, '') || '';
//       location = parts[1]?.trim().replace(/"/g, '') || '';

//       if (title && location && !location.startsWith('Unknown')) {
//         csvRows.push({ title, location });
//       }
//     }

//     console.log(`📄 Total rows in CSV: ${csvRows.length}\n`);
    
//     // Show sample rows
//     console.log('🔍 Sample rows from CSV:');
//     csvRows.slice(0, 3).forEach((row, idx) => {
//       console.log(`   ${idx + 1}. Title: "${row.title}"`);
//       console.log(`      Location: "${row.location}"`);
//     });
//     console.log();

//     let updated = 0;
//     let notFound = 0;
//     let failed = 0;

//     console.log('=' .repeat(70));
//     console.log('🔄 PROCESSING ALL COLLEGES...\n');

//     // Process each college from CSV
//     for (let i = 0; i < csvRows.length; i++) {
//       const { title, location } = csvRows[i];

//       try {
//         // Check if college exists in database
//         const { data: checkData, error: checkError } = await supabase
//           .from('college_microsites')
//           .select('id, card_detail')
//           .eq('title', title)
//           .limit(1);

//         if (checkError) {
//           failed++;
//           if (i % 500 === 0) {
//             console.log(`❌ Row ${i + 1}: Query error`);
//           }
//           continue;
//         }

//         if (!checkData || checkData.length === 0) {
//           notFound++;
//           if (i % 1000 === 0 && i > 0) {
//             console.log(`🔍 Row ${i + 1}: Not found - "${title}"`);
//           }
//           continue;
//         }

//         // Update location for this college
//         const college = checkData[0];
//         const updatedCardDetail = {
//           ...college.card_detail,
//           location: location
//         };

//         const { data, error } = await supabase
//           .from('college_microsites')
//           .update({
//             location: location,
//             card_detail: updatedCardDetail,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id)
//           .select('id');

//         if (error) {
//           failed++;
//           if (i % 500 === 0) {
//             console.log(`❌ Row ${i + 1}: Update error`);
//           }
//         } else if (!data || data.length === 0) {
//           notFound++;
//         } else {
//           updated++;
//           // Show progress every 500 rows
//           if (i % 500 === 0 && i > 0) {
//             console.log(`✅ Row ${i + 1}: Updated ${updated} colleges so far...`);
//           }
//         }
//       } catch (err) {
//         failed++;
//         if (i % 500 === 0) {
//           console.log(`❌ Row ${i + 1}: Exception - ${err.message}`);
//         }
//       }

//       // Small delay to avoid rate limiting
//       if (i % 10 === 0) {
//         await new Promise(resolve => setTimeout(resolve, 5));
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 FINAL SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`✅ Updated:        ${updated}`);
//     console.log(`🔍 Not Found:      ${notFound}`);
//     console.log(`❌ Failed:         ${failed}`);
//     console.log(`📁 Total CSV:      ${csvRows.length}`);
    
//     const successRate = csvRows.length > 0 ? ((updated / csvRows.length) * 100).toFixed(2) : 0;
//     console.log(`📈 Success Rate:   ${successRate}%`);
    
//     console.log('='.repeat(70) + '\n');

//     console.log('✨ UPDATE COMPLETE!\n');

//     process.exit(0);

//   } catch (err) {
//     console.error('❌ ERROR:', err.message);
//     console.error(err);
//     process.exit(1);
//   }
// }

// updateAllCollegeLocations();


// script/update-locations-by-id.js - UPDATE SPECIFIC COLLEGES BY ID
const { supabase } = require('../src/app/lib/supabase-admin.js');
const fs = require('fs');
const path = require('path');

// 🎯 ADD YOUR SPECIFIC COLLEGE IDs HERE
const TARGET_COLLEGE_IDS = [29877, 28927, 28295, 28287, 28278];

async function updateSpecificCollegeLocations() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📍 UPDATING SPECIFIC COLLEGES BY ID FROM CSV');
    console.log('='.repeat(70) + '\n');

    console.log(`🎯 Targeting specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);

    // Read the cleaned CSV file
    const csvPath = path.join(__dirname, 'college_locations_cleaned.csv');
    console.log(`📁 Reading CSV from: ${csvPath}\n`);

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Parse CSV (title, location)
    const csvRows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
          current += char;
        } else if (char === ',' && !inQuotes) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current);

      const title = parts[0]?.trim().replace(/"/g, '') || '';
      const location = parts[1]?.trim().replace(/"/g, '') || '';

      if (title && location && !location.startsWith('Unknown')) {
        csvRows.push({ title, location });
      }
    }

    console.log(`📄 Total rows in CSV: ${csvRows.length}\n`);

    // Build a title -> location map from CSV for quick lookup
    const locationMap = {};
    csvRows.forEach(({ title, location }) => {
      locationMap[title] = location;
    });

    // Fetch only the targeted colleges from DB
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('id, title, card_detail')
      .in('id', TARGET_COLLEGE_IDS);

    if (error) throw error;

    if (!colleges || colleges.length === 0) {
      console.log('❌ No colleges found with the specified IDs');
      return;
    }

    console.log(`✅ Found ${colleges.length} colleges in DB\n`);

    let updated = 0;
    let notFound = 0;
    let failed = 0;

    console.log('='.repeat(70));
    console.log('🔄 PROCESSING...\n');

    for (const college of colleges) {
      const location = locationMap[college.title];

      if (!location) {
        console.log(`🔍 ID ${college.id}: No matching location in CSV for title "${college.title}"`);
        notFound++;
        continue;
      }

      try {
        const updatedCardDetail = {
          ...college.card_detail,
          location: location
        };

        const { data, error: updateError } = await supabase
          .from('college_microsites')
          .update({
            location: location,
            card_detail: updatedCardDetail,
            updated_at: new Date().toISOString()
          })
          .eq('id', college.id)
          .select('id');

        if (updateError) {
          console.log(`❌ ID ${college.id}: Update error - ${updateError.message}`);
          failed++;
        } else if (!data || data.length === 0) {
          console.log(`🔍 ID ${college.id}: No rows updated`);
          notFound++;
        } else {
          console.log(`✅ ID ${college.id}: Updated → "${location}"`);
          updated++;
        }
      } catch (err) {
        console.log(`❌ ID ${college.id}: Exception - ${err.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`🎯 Targeted IDs:  ${TARGET_COLLEGE_IDS.join(', ')}`);
    console.log(`✅ Updated:       ${updated}`);
    console.log(`🔍 Not Found:     ${notFound}`);
    console.log(`❌ Failed:        ${failed}`);
    console.log(`📁 Total:         ${colleges.length}`);
    console.log('='.repeat(70) + '\n');
    console.log('✨ UPDATE COMPLETE!\n');

    process.exit(0);

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

updateSpecificCollegeLocations();
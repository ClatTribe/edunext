// // script/clean-titles.js
// const { supabase } = require('../src/app/lib/supabase-admin.js');

// async function cleanCollegeTitles() {
//   try {
//     console.log('🧹 Starting title cleanup...\n');

//     let allColleges = [];
//     let from = 0;
//     const batchSize = 1000;
//     let hasMore = true;

//     // Fetch ALL colleges in batches (Supabase has 1000 row limit by default)
//     while (hasMore) {
//       const { data, error } = await supabase
//         .from('college_microsites')
//         .select('id, title')
//         .range(from, from + batchSize - 1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         allColleges = allColleges.concat(data);
//         console.log(`📥 Fetched ${data.length} colleges (total: ${allColleges.length})`);
//         from += batchSize;
//       } else {
//         hasMore = false;
//       }

//       // If we got less than batchSize, we've reached the end
//       if (!data || data.length < batchSize) {
//         hasMore = false;
//       }
//     }

//     console.log(`\n✅ Total colleges found: ${allColleges.length}\n`);

//     let updated = 0;
//     let skipped = 0;

//     // Process each college
//     for (const college of allColleges) {
//       const originalTitle = college.title;
//       const cleanTitle = originalTitle.split(':')[0].trim();

//       if (cleanTitle !== originalTitle) {
//         const { error: updateError } = await supabase
//           .from('college_microsites')
//           .update({ 
//             title: cleanTitle,
//             college_name: cleanTitle,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id);

//         if (!updateError) {
//           updated++;
//           if (updated % 100 === 0) {
//             console.log(`✅ Progress: ${updated} updated...`);
//           }
//         }
//       } else {
//         skipped++;
//       }
//     }

//     console.log('\n' + '='.repeat(60));
//     console.log('📊 CLEANUP SUMMARY');
//     console.log('='.repeat(60));
//     console.log(`✅ Updated: ${updated}`);
//     console.log(`⏭️  Skipped: ${skipped}`);
//     console.log(`📁 Total: ${allColleges.length}`);
//     console.log('='.repeat(60));

//   } catch (err) {
//     console.error('❌ Error:', err.message);
//     process.exit(1);
//   }
// }

// cleanCollegeTitles()
//   .then(() => {
//     console.log('\n✨ Done!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });

// scripts/clean-titles.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

// 🎯 ADD YOUR SPECIFIC COLLEGE IDs HERE
const TARGET_COLLEGE_IDS = [14897];

async function cleanCollegeTitles() {
  try {
    console.log('🧹 Starting title cleanup...\n');
    console.log(`🎯 Targeting specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);

    // Fetch only the specific colleges
    const { data: allColleges, error } = await supabase
      .from('college_microsites')
      .select('id, title, college_name')
      .in('id', TARGET_COLLEGE_IDS);

    if (error) throw error;

    if (!allColleges || allColleges.length === 0) {
      console.log('❌ No colleges found with the specified IDs');
      return;
    }

    console.log(`✅ Found ${allColleges.length} colleges to process\n`);

    let updated = 0;
    let skipped = 0;

    // Process each college
    for (const college of allColleges) {
      console.log(`\n📝 Processing College ID: ${college.id}`);
      console.log(`   Original title: "${college.title}"`);
      console.log(`   Current college_name: "${college.college_name || 'None'}"`);

      const originalTitle = college.title;
      const cleanTitle = originalTitle.split(':')[0].trim();

      if (cleanTitle !== originalTitle) {
        console.log(`   🧹 Cleaned title: "${cleanTitle}"`);

        const { error: updateError } = await supabase
          .from('college_microsites')
          .update({ 
            title: cleanTitle,
            college_name: cleanTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', college.id);

        if (!updateError) {
          updated++;
          console.log(`   ✅ Successfully updated title and college_name`);
        } else {
          console.error(`   ❌ Error updating:`, updateError.message);
        }
      } else {
        skipped++;
        console.log(`   ⏭️  No changes needed (title already clean)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`🎯 Targeted Colleges: ${TARGET_COLLEGE_IDS.join(', ')}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📁 Total Processed: ${allColleges.length}`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanCollegeTitles()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
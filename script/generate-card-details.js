// const { supabase } = require('../src/app/lib/supabase-admin.js');
// const fs = require('fs');
// const path = require('path');

// function getAveragePackage(college) {
//   const placements = college.microsite_data?.placement;
//   if (!placements || !Array.isArray(placements)) return null;

//   for (const placement of placements) {
//     const headers = placement.headers || [];
//     const rows = placement.rows || [];

//     const avgIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("average"));
//     if (avgIndex !== -1 && rows.length > 0 && rows[0][avgIndex]) {
//       return rows[0][avgIndex];
//     }

//     const avgRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("average"));
//     if (avgRow && avgRow.length > 1) {
//       return avgRow[1];
//     }
//   }
  
//   // Fallback: check college description if placement tables are empty (like Polaris)
//   if (college.description) {
//     const avgMatch = college.description.match(/average package.*?INR\s*([\d.]+\s*Lakhs?)/i);
//     if (avgMatch) return `INR ${avgMatch[1]}`;
//   }
  
//   return null;
// }

// function getHighestPackage(college) {
//   const placements = college.microsite_data?.placement;
//   if (!placements || !Array.isArray(placements)) return null;

//   for (const placement of placements) {
//     const headers = placement.headers || [];
//     const rows = placement.rows || [];

//     const highIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("high"));
//     if (highIndex !== -1 && rows.length > 0 && rows[0][highIndex]) {
//       return rows[0][highIndex];
//     }

//     const highRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("high"));
//     if (highRow && highRow.length > 1) {
//       return highRow[1];
//     }
//   }
  
//   // Fallback: check college description if placement tables are empty (like Polaris)
//   if (college.description) {
//     const highMatch = college.description.match(/highest.*?INR\s*([\d.]+\s*Lakhs?)/i);
//     if (highMatch) return `INR ${highMatch[1]}`;
//   }
  
//   return null;
// }

// function getFees(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allFees = [];
  
//   for (const table of fees) {
//     const rows = table.rows || [];
//     const headers = table.headers || [];
    
//     const totalFeeIndex = headers.findIndex(h => h && 
//       (h.toString().toLowerCase().includes('total fee') || h.toString().toLowerCase().includes('total fees'))
//     );
    
//     if (totalFeeIndex !== -1) {
//       rows.forEach(row => {
//         if (row[totalFeeIndex] && row[totalFeeIndex].toString().match(/\d/)) {
//           allFees.push(row[totalFeeIndex].toString().trim());
//         }
//       });
//     } else {
//       const totalFeeRow = rows.find(row => 
//         row[0] && row[0].toString().toLowerCase().includes('total fee')
//       );
//       if (totalFeeRow && totalFeeRow[1] && totalFeeRow[1].toString().match(/\d/)) {
//         allFees.push(totalFeeRow[1].toString().trim());
//       }
//     }
//   }
  
//   if (allFees.length === 0) return null;
  
//   const parsedFees = allFees.map(fee => {
//     const match = fee.match(/[\d,.]+/);
//     return {
//       str: fee,
//       val: match ? parseFloat(match[0].replace(/,/g, '')) : 0
//     };
//   }).filter(f => f.val > 0);

//   if (parsedFees.length > 1) {
//     parsedFees.sort((a, b) => a.val - b.val);
//     const minFee = parsedFees[0].str;
//     const maxFee = parsedFees[parsedFees.length - 1].str;
//     if (minFee === maxFee) return minFee;
//     return `${minFee} - ${maxFee}`;
//   } else if (parsedFees.length === 1) {
//     return parsedFees[0].str;
//   }
  
//   return allFees[0];
// }

// function getCourses(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allCourses = new Set();
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     const rows = table.rows || [];
    
//     const courseIndex = headers.findIndex(h => 
//       h?.toLowerCase() === 'course' || h?.toLowerCase().includes('course')
//     );
    
//     if (courseIndex !== -1) {
//       rows.forEach(row => {
//         if (row[courseIndex] && row[courseIndex].toString().trim()) {
//           let courseName = row[courseIndex].toString().trim();
//           courseName = courseName.split('₹')[0].trim();
//           courseName = courseName.replace(/\d+Courses?$/i, '').trim();
//           courseName = courseName.replace(/Check Details?$/i, '').trim();
//           if (courseName && courseName.length > 0) {
//             allCourses.add(courseName);
//           }
//         }
//       });
//     }
//   }
  
//   if (college.microsite_data?.courses) {
//     const coursesData = college.microsite_data.courses;
//     if (typeof coursesData === 'string' && coursesData !== 'See Fees Section') {
//       allCourses.add(coursesData);
//     }
//   }
  
//   return allCourses.size > 0 ? Array.from(allCourses) : null;
// }

// function getRanking(college) {
//   const ranking = college.microsite_data?.ranking;
//   if (!ranking || !Array.isArray(ranking)) return null;

//   const validRankingTypes = [
//     "Collegedunia Ranking",
//     "Indiatoday Ranking",
//     "NIRF Ranking",
//     "The Week Ranking",
//     "Outlook Ranking",
//     "IIRF Ranking",
//     "TOI Ranking",
//     "QS Ranking"
//   ];

//   function cleanCategory(category) {
//     if (!category) return null;
//     return category.toString().replace(/Compare$/i, '').trim();
//   }

//   function extractRankingNumber(value) {
//     if (!value || value === "-" || value === "N/A") return null;
//     const match = value.toString().match(/#?(\d+)/);
//     return match ? parseInt(match[1], 10) : null;
//   }

//   let matchedRankings = [];

//   for (const rankingTable of ranking) {
//     const heading = rankingTable.heading?.trim();

//     if (!heading || !validRankingTypes.includes(heading)) continue;

//     const rows = rankingTable.rows || [];
//     if (rows.length === 0) continue;

//     const isEduNext = heading === "Collegedunia Ranking";
//     const finalHeading = isEduNext ? "EduNext Ranking" : heading;

//     let categoryRows = [];

//     for (const row of rows) {
//       const rawCategory = row[0];
//       const rawValue = row[1];

//       const category = cleanCategory(rawCategory);
//       const value = extractRankingNumber(rawValue);

//       if (category && value !== null) {
//         const finalValue = isEduNext ? value + 1 : value;
//         categoryRows.push({ category, value: finalValue });
//       }
//     }

//     if (categoryRows.length > 0) {
//       matchedRankings.push({
//         heading: finalHeading,
//         rows: categoryRows
//       });
//     }
//   }

//   if (matchedRankings.length === 0) {
//     const firstTable = ranking[0];
//     if (firstTable) {
//       const rows = firstTable.rows || [];
//       if (rows.length > 0 && rows[0][1]) {
//         const fallbackValue = extractRankingNumber(rows[0][1]);
//         return fallbackValue !== null ? [{ heading: firstTable.heading || "Ranking", rows: [{ category: "Overall", value: fallbackValue }] }] : null;
//       }
//     }
//     return null;
//   }

//   return matchedRankings;
// }

// function getRating(college) {
//   const rating = college.microsite_data?.reviews?.aggregate_rating?.ratingValue;
//   return rating ? rating.toString() : null;
// }

// function getReviewCount(college) {
//   return college.microsite_data?.reviews?.aggregate_rating?.reviewCount || null;
// }

// function getApprovals(college) {
//   const admission = college.microsite_data?.admission;
//   if (!admission || !Array.isArray(admission)) return null;
  
//   for (const table of admission) {
//     const rows = table.rows || [];
//     const approvalRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('accredited') || 
//       row[0]?.toLowerCase().includes('approval')
//     );
//     if (approvalRow && approvalRow[1]) return approvalRow[1];
//   }
//   return null;
// }

// function getScholarship(college) {
//   const scholarship = college.microsite_data?.scholarship;
//   if (scholarship && Array.isArray(scholarship) && scholarship.length > 0) {
//     return "Available";
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     if (headers.some(h => h?.toLowerCase().includes('scholarship'))) {
//       return "Available";
//     }
//     const rows = table.rows || [];
//     const scholarshipRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('scholarship')
//     );
//     if (scholarshipRow) return "Available";
//   }
  
//   // Also check admission tables (like Polaris)
//   const admission = college.microsite_data?.admission;
//   if (admission && Array.isArray(admission)) {
//     for (const table of admission) {
//       if (table.heading && table.heading.toLowerCase().includes('scholarship')) return "Available";
//     }
//   }
  
//   return null;
// }

// function getEntranceExam(college) {
//   const cutoff = college.microsite_data?.cutoff;
//   if (cutoff && Array.isArray(cutoff)) {
//     for (const table of cutoff) {
//       const headers = table.headers || [];
//       const examIndex = headers.findIndex(h => h?.toLowerCase().includes('exam'));
//       if (examIndex !== -1) {
//         const rows = table.rows || [];
//         if (rows.length > 0 && rows[0][examIndex]) {
//           return rows[0][examIndex];
//         }
//       }
//     }
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (fees && Array.isArray(fees)) {
//     for (const table of fees) {
//       const headers = table.headers || [];
//       const eligibilityIndex = headers.findIndex(h => h?.toLowerCase().includes('eligibility'));
//       if (eligibilityIndex !== -1) {
//         const rows = table.rows || [];
//         const exams = new Set();
//         rows.forEach(row => {
//           if (row[eligibilityIndex]) {
//             const eligibility = row[eligibilityIndex].toString();
//             const examMatches = eligibility.match(/[A-Z]{2,}[-]?[A-Z]*/g);
//             if (examMatches) {
//               examMatches.forEach(exam => {
//                 if (exam.length >= 2 && exam !== 'OR' && exam !== 'AND') {
//                   exams.add(exam);
//                 }
//               });
//             }
//           }
//         });
//         if (exams.size > 0) {
//           return Array.from(exams).join(', ');
//         }
//       }
//     }
//   }
  
//   // Also check admission tables (like Polaris)
//   const admission = college.microsite_data?.admission;
//   if (admission && Array.isArray(admission)) {
//     let exams = new Set();
//     for (const table of admission) {
//       const rows = table.rows || [];
//       rows.forEach(row => {
//         const param = row[0]?.toString().toUpperCase() || '';
//         if (param.includes('JEE')) exams.add('JEE');
//         if (param.includes('SAT')) exams.add('SAT');
//         if (param.includes('PAT')) exams.add('PAT');
//         if (param.includes('CAT')) exams.add('CAT');
//         if (param.includes('MAT')) exams.add('MAT');
//         if (param.includes('XAT')) exams.add('XAT');
//         if (param.includes('CMAT')) exams.add('CMAT');
//         if (param.includes('CUET')) exams.add('CUET');
//         if (param.includes('NEET')) exams.add('NEET');
//       });
//     }
//     if (exams.size > 0) return Array.from(exams).join(', ');
//   }
  
//   return null;
// }

// async function generateCardDetails() {
//   try {
//     console.log('🚀 Starting card_detail generation...\n');

//     // To test a single college, set this variable (e.g. "24967"). Set to null to process all from JSONL.
//     const TEST_COLLEGE_ID = 33752;

//     // 1. Read target IDs from JSONL files
//     console.log('📂 Reading all testcollege_*.jsonl files to get target IDs...');
//     const targetRawIds = [];
//     const newDataDir = path.join(__dirname, '../new-data');
    
//     if (fs.existsSync(newDataDir)) {
//       const files = fs.readdirSync(newDataDir).filter(f => f.startsWith('testcollege_') && f.endsWith('.jsonl'));
      
//       for (const file of files) {
//         const lines = fs.readFileSync(path.join(newDataDir, file), 'utf8').trim().split('\n');
//         lines.forEach(line => {
//           if (!line.trim()) return;
//           try { 
//             const id = JSON.parse(line).id;
//             if (id) targetRawIds.push(String(id));
//           } catch (e) { }
//         });
//       }
//       console.log(`🎯 Found ${targetRawIds.length} target IDs across ${files.length} JSONL files to process.\n`);
//     } else {
//       console.log(`⚠️ Directory ${newDataDir} not found. No target IDs loaded.`);
//     }

//     let allColleges = [];
//     let from = 0;
//     const batchSize = 1000;
//     let hasMore = true;

//     console.log('📥 Fetching all colleges from database...\n');

//     while (hasMore) {
//       const { data, error } = await supabase
//         .from('college_microsites')
//         .select('id, slug, college_name, location, url, contact, email, description, microsite_data')
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
//     console.log('⚙️  Processing colleges and generating card details...\n');

//     let successCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;

//     for (let i = 0; i < allColleges.length; i++) {
//       const college = allColleges[i];
      
//       try {
//         // --- ADDED SKIP LOGIC FOR 5k BATCH ---
//         const micrositeData = typeof college.microsite_data === 'string' 
//           ? JSON.parse(college.microsite_data) 
//           : (college.microsite_data || {});
        
//         const rawId = micrositeData.id ? String(micrositeData.id) : null;
//         const dbId = String(college.id);
        
//         if (TEST_COLLEGE_ID) {
//           if (rawId !== String(TEST_COLLEGE_ID) && dbId !== String(TEST_COLLEGE_ID)) {
//             skippedCount++;
//             continue; // Skip everything except the TEST_COLLEGE_ID
//           }
//         } else {
//           if (!rawId || !targetRawIds.includes(rawId)) {
//             skippedCount++;
//             continue; // Skip this college completely, it's not in the new JSONL batch
//           }
//         }
//         // -------------------------------------

//         const cardDetail = {
//           college_name: college.college_name || null,
//           location: college.location || null,
//           url: college.url || null,
//           contact: college.contact || null,
//           email: college.email || null,
//           slug: college.slug || null,
//           rating: getRating(college),
//           review_count: getReviewCount(college),
//           courses: getCourses(college),
//           fees: getFees(college),
//           avg_package: getAveragePackage(college),
//           high_package: getHighestPackage(college),
//           ranking: getRanking(college),
//           approvals: getApprovals(college),
//           scholarship: getScholarship(college),
//           entrance_exam: getEntranceExam(college)
//         };

//         const { error: updateError } = await supabase
//           .from('college_microsites')
//           .update({ 
//             card_detail: cardDetail,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id);

//         if (updateError) {
//           console.error(`❌ Error updating college ${college.id}:`, updateError.message);
//           errorCount++;
//         } else {
//           successCount++;
//           if (successCount % 100 === 0) {
//             console.log(`✅ Progress: ${successCount} colleges updated...`);
//           }
//         }
//       } catch (err) {
//         console.error(`❌ Error processing college ${college.id}:`, err.message);
//         errorCount++;
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 CARD DETAIL GENERATION SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`✅ Successfully Updated: ${successCount}`);
//     console.log(`⏭️  Skipped (not in target list): ${skippedCount}`);
//     console.log(`❌ Errors: ${errorCount}`);
//     console.log(`📁 Total Target Colleges Processed: ${successCount + errorCount}`);
//     console.log('='.repeat(70));

//   } catch (err) {
//     console.error('❌ Fatal Error:', err.message);
//     process.exit(1);
//   }
// }

// generateCardDetails()
//   .then(() => {
//     console.log('\n✨ Card detail generation completed!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });





//For all colleges
const { supabase } = require('../src/app/lib/supabase-admin.js');
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// Choose your target mode. 
// Options:
// - 'all'    : Process every single college in the database.
// - 'jsonl'  : Process only the colleges found in new-data/testcollege_*.jsonl files.
// - 12345    : Put a specific ID number to process only that single college (e.g., 24967).
const TARGET_MODE = 'all';
// ------------------------------------------------------------------

function getAveragePackage(college) {
  const placements = college.microsite_data?.placement;
  if (!placements || !Array.isArray(placements)) return null;

  for (const placement of placements) {
    const headers = placement.headers || [];
    const rows = placement.rows || [];

    const avgIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("average"));
    if (avgIndex !== -1 && rows.length > 0 && rows[0][avgIndex]) {
      return rows[0][avgIndex];
    }

    const avgRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("average"));
    if (avgRow && avgRow.length > 1) {
      return avgRow[1];
    }
  }
  
  // Fallback: check college description if placement tables are empty (like Polaris)
  if (college.description) {
    const avgMatch = college.description.match(/average package.*?INR\s*([\d.]+\s*Lakhs?)/i);
    if (avgMatch) return `INR ${avgMatch[1]}`;
  }
  
  return null;
}

function getHighestPackage(college) {
  const placements = college.microsite_data?.placement;
  if (!placements || !Array.isArray(placements)) return null;

  for (const placement of placements) {
    const headers = placement.headers || [];
    const rows = placement.rows || [];

    const highIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("high"));
    if (highIndex !== -1 && rows.length > 0 && rows[0][highIndex]) {
      return rows[0][highIndex];
    }

    const highRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("high"));
    if (highRow && highRow.length > 1) {
      return highRow[1];
    }
  }
  
  // Fallback: check college description if placement tables are empty (like Polaris)
  if (college.description) {
    const highMatch = college.description.match(/highest.*?INR\s*([\d.]+\s*Lakhs?)/i);
    if (highMatch) return `INR ${highMatch[1]}`;
  }
  
  return null;
}

function getFees(college) {
  const fees = college.microsite_data?.fees;
  if (!fees || !Array.isArray(fees)) return null;
  
  let allFees = [];
  
  for (const table of fees) {
    const rows = table.rows || [];
    const headers = table.headers || [];
    
    const totalFeeIndex = headers.findIndex(h => h && 
      (h.toString().toLowerCase().includes('total fee') || h.toString().toLowerCase().includes('total fees'))
    );
    
    if (totalFeeIndex !== -1) {
      rows.forEach(row => {
        if (row[totalFeeIndex] && row[totalFeeIndex].toString().match(/\d/)) {
          allFees.push(row[totalFeeIndex].toString().trim());
        }
      });
    } else {
      const totalFeeRow = rows.find(row => 
        row[0] && row[0].toString().toLowerCase().includes('total fee')
      );
      if (totalFeeRow && totalFeeRow[1] && totalFeeRow[1].toString().match(/\d/)) {
        allFees.push(totalFeeRow[1].toString().trim());
      }
    }
  }
  
  if (allFees.length === 0) return null;
  
  const parsedFees = allFees.map(fee => {
    const match = fee.match(/[\d,.]+/);
    return {
      str: fee,
      val: match ? parseFloat(match[0].replace(/,/g, '')) : 0
    };
  }).filter(f => f.val > 0);

  if (parsedFees.length > 1) {
    parsedFees.sort((a, b) => a.val - b.val);
    const minFee = parsedFees[0].str;
    const maxFee = parsedFees[parsedFees.length - 1].str;
    if (minFee === maxFee) return minFee;
    return `${minFee} - ${maxFee}`;
  } else if (parsedFees.length === 1) {
    return parsedFees[0].str;
  }
  
  return allFees[0];
}

function getCourses(college) {
  const fees = college.microsite_data?.fees;
  if (!fees || !Array.isArray(fees)) return null;
  
  let allCourses = new Set();
  
  for (const table of fees) {
    const headers = table.headers || [];
    const rows = table.rows || [];
    
    const courseIndex = headers.findIndex(h => 
      h?.toLowerCase() === 'course' || h?.toLowerCase().includes('course')
    );
    
    if (courseIndex !== -1) {
      rows.forEach(row => {
        if (row[courseIndex] && row[courseIndex].toString().trim()) {
          let courseName = row[courseIndex].toString().trim();
          courseName = courseName.split('₹')[0].trim();
          courseName = courseName.replace(/\d+Courses?$/i, '').trim();
          courseName = courseName.replace(/Check Details?$/i, '').trim();
          if (courseName && courseName.length > 0) {
            allCourses.add(courseName);
          }
        }
      });
    }
  }
  
  if (college.microsite_data?.courses) {
    const coursesData = college.microsite_data.courses;
    if (typeof coursesData === 'string' && coursesData !== 'See Fees Section') {
      allCourses.add(coursesData);
    }
  }
  
  return allCourses.size > 0 ? Array.from(allCourses) : null;
}

function getRanking(college) {
  const ranking = college.microsite_data?.ranking;
  if (!ranking || !Array.isArray(ranking)) return null;

  const validRankingTypes = [
    "Collegedunia Ranking",
    "Indiatoday Ranking",
    "NIRF Ranking",
    "The Week Ranking",
    "Outlook Ranking",
    "IIRF Ranking",
    "TOI Ranking",
    "QS Ranking"
  ];

  function cleanCategory(category) {
    if (!category) return null;
    return category.toString().replace(/Compare$/i, '').trim();
  }

  function extractRankingNumber(value) {
    if (!value || value === "-" || value === "N/A") return null;
    const match = value.toString().match(/#?(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  let matchedRankings = [];

  for (const rankingTable of ranking) {
    const heading = rankingTable.heading?.trim();

    if (!heading || !validRankingTypes.includes(heading)) continue;

    const rows = rankingTable.rows || [];
    if (rows.length === 0) continue;

    const isEduNext = heading === "Collegedunia Ranking";
    const finalHeading = isEduNext ? "EduNext Ranking" : heading;

    let categoryRows = [];

    for (const row of rows) {
      const rawCategory = row[0];
      const rawValue = row[1];

      const category = cleanCategory(rawCategory);
      const value = extractRankingNumber(rawValue);

      if (category && value !== null) {
        const finalValue = isEduNext ? value + 1 : value;
        categoryRows.push({ category, value: finalValue });
      }
    }

    if (categoryRows.length > 0) {
      matchedRankings.push({
        heading: finalHeading,
        rows: categoryRows
      });
    }
  }

  if (matchedRankings.length === 0) {
    const firstTable = ranking[0];
    if (firstTable) {
      const rows = firstTable.rows || [];
      if (rows.length > 0 && rows[0][1]) {
        const fallbackValue = extractRankingNumber(rows[0][1]);
        return fallbackValue !== null ? [{ heading: firstTable.heading || "Ranking", rows: [{ category: "Overall", value: fallbackValue }] }] : null;
      }
    }
    return null;
  }

  return matchedRankings;
}

function getRating(college) {
  const rating = college.microsite_data?.reviews?.aggregate_rating?.ratingValue;
  return rating ? rating.toString() : null;
}

function getReviewCount(college) {
  return college.microsite_data?.reviews?.aggregate_rating?.reviewCount || null;
}

function getApprovals(college) {
  const admission = college.microsite_data?.admission;
  if (!admission || !Array.isArray(admission)) return null;
  
  for (const table of admission) {
    const rows = table.rows || [];
    const approvalRow = rows.find(row => 
      row[0]?.toLowerCase().includes('accredited') || 
      row[0]?.toLowerCase().includes('approval')
    );
    if (approvalRow && approvalRow[1]) return approvalRow[1];
  }
  return null;
}

function getScholarship(college) {
  const scholarship = college.microsite_data?.scholarship;
  if (scholarship && Array.isArray(scholarship) && scholarship.length > 0) {
    return "Available";
  }
  
  const fees = college.microsite_data?.fees;
  if (!fees || !Array.isArray(fees)) return null;
  
  for (const table of fees) {
    const headers = table.headers || [];
    if (headers.some(h => h?.toLowerCase().includes('scholarship'))) {
      return "Available";
    }
    const rows = table.rows || [];
    const scholarshipRow = rows.find(row => 
      row[0]?.toLowerCase().includes('scholarship')
    );
    if (scholarshipRow) return "Available";
  }
  
  // Also check admission tables (like Polaris)
  const admission = college.microsite_data?.admission;
  if (admission && Array.isArray(admission)) {
    for (const table of admission) {
      if (table.heading && table.heading.toLowerCase().includes('scholarship')) return "Available";
    }
  }
  
  return null;
}

function getEntranceExam(college) {
  const cutoff = college.microsite_data?.cutoff;
  if (cutoff && Array.isArray(cutoff)) {
    for (const table of cutoff) {
      const headers = table.headers || [];
      const examIndex = headers.findIndex(h => h?.toLowerCase().includes('exam'));
      if (examIndex !== -1) {
        const rows = table.rows || [];
        if (rows.length > 0 && rows[0][examIndex]) {
          return rows[0][examIndex];
        }
      }
    }
  }
  
  const fees = college.microsite_data?.fees;
  if (fees && Array.isArray(fees)) {
    for (const table of fees) {
      const headers = table.headers || [];
      const eligibilityIndex = headers.findIndex(h => h?.toLowerCase().includes('eligibility'));
      if (eligibilityIndex !== -1) {
        const rows = table.rows || [];
        const exams = new Set();
        rows.forEach(row => {
          if (row[eligibilityIndex]) {
            const eligibility = row[eligibilityIndex].toString();
            const examMatches = eligibility.match(/[A-Z]{2,}[-]?[A-Z]*/g);
            if (examMatches) {
              examMatches.forEach(exam => {
                if (exam.length >= 2 && exam !== 'OR' && exam !== 'AND') {
                  exams.add(exam);
                }
              });
            }
          }
        });
        if (exams.size > 0) {
          return Array.from(exams).join(', ');
        }
      }
    }
  }
  
  // Also check admission tables (like Polaris)
  const admission = college.microsite_data?.admission;
  if (admission && Array.isArray(admission)) {
    let exams = new Set();
    for (const table of admission) {
      const rows = table.rows || [];
      rows.forEach(row => {
        const param = row[0]?.toString().toUpperCase() || '';
        if (param.includes('JEE')) exams.add('JEE');
        if (param.includes('SAT')) exams.add('SAT');
        if (param.includes('PAT')) exams.add('PAT');
        if (param.includes('CAT')) exams.add('CAT');
        if (param.includes('MAT')) exams.add('MAT');
        if (param.includes('XAT')) exams.add('XAT');
        if (param.includes('CMAT')) exams.add('CMAT');
        if (param.includes('CUET')) exams.add('CUET');
        if (param.includes('NEET')) exams.add('NEET');
      });
    }
    if (exams.size > 0) return Array.from(exams).join(', ');
  }
  
  return null;
}

async function generateCardDetails() {
  try {
    console.log('🚀 Starting card_detail generation...\n');
    console.log(`🎯 Target Mode: ${TARGET_MODE}\n`);

    const targetRawIds = [];
    
    // Only load JSONL files if the user chose 'jsonl'
    if (TARGET_MODE === 'jsonl') {
      console.log('📂 Reading all testcollege_*.jsonl files to get target IDs...');
      const newDataDir = path.join(__dirname, '../new-data');
      
      if (fs.existsSync(newDataDir)) {
        const files = fs.readdirSync(newDataDir).filter(f => f.startsWith('testcollege_') && f.endsWith('.jsonl'));
        
        for (const file of files) {
          const lines = fs.readFileSync(path.join(newDataDir, file), 'utf8').trim().split('\n');
          lines.forEach(line => {
            if (!line.trim()) return;
            try { 
              const id = JSON.parse(line).id;
              if (id) targetRawIds.push(String(id));
            } catch (e) { }
          });
        }
        console.log(`🎯 Found ${targetRawIds.length} target IDs across ${files.length} JSONL files to process.\n`);
      } else {
        console.log(`⚠️ Directory ${newDataDir} not found. No target IDs loaded.`);
      }
    }

    let allColleges = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('📥 Fetching all colleges from database...\n');

    while (hasMore) {
      const { data, error } = await supabase
        .from('college_microsites')
        .select('id, slug, college_name, location, url, contact, email, description, microsite_data')
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
    console.log('⚙️  Processing colleges and generating card details...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      try {
        const micrositeData = typeof college.microsite_data === 'string' 
          ? JSON.parse(college.microsite_data) 
          : (college.microsite_data || {});
        
        const rawId = micrositeData.id ? String(micrositeData.id) : null;
        const dbId = String(college.id);
        
        // --- TARGET FILTERING LOGIC ---
        if (TARGET_MODE !== 'all') {
          if (TARGET_MODE === 'jsonl') {
            if (!rawId || !targetRawIds.includes(rawId)) {
              skippedCount++;
              continue; // Skip this college completely, it's not in the JSONL files
            }
          } else {
            // TARGET_MODE is a specific ID
            if (rawId !== String(TARGET_MODE) && dbId !== String(TARGET_MODE)) {
              skippedCount++;
              continue; // Skip everything except the specific TEST_COLLEGE_ID
            }
          }
        }
        // ------------------------------

        const cardDetail = {
          college_name: college.college_name || null,
          location: college.location || null,
          url: college.url || null,
          contact: college.contact || null,
          email: college.email || null,
          slug: college.slug || null,
          rating: getRating(college),
          review_count: getReviewCount(college),
          courses: getCourses(college),
          fees: getFees(college),
          avg_package: getAveragePackage(college),
          high_package: getHighestPackage(college),
          ranking: getRanking(college),
          approvals: getApprovals(college),
          scholarship: getScholarship(college),
          entrance_exam: getEntranceExam(college)
        };

        const { error: updateError } = await supabase
          .from('college_microsites')
          .update({ 
            card_detail: cardDetail,
            updated_at: new Date().toISOString()
          })
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
      } catch (err) {
        console.error(`❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 CARD DETAIL GENERATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`🎯 Mode: ${TARGET_MODE}`);
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Target Colleges Processed: ${successCount + errorCount}`);
    console.log('='.repeat(70));

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

generateCardDetails()
  .then(() => {
    console.log('\n✨ Card detail generation completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });



// Dedicated colleges
// // scripts/generate-card-details-specific.js
// const { supabase } = require('../src/app/lib/supabase-admin.js');

// // 🎯 ADD YOUR SPECIFIC COLLEGE IDs HERE
// const TARGET_COLLEGE_IDS = [22681];
// // const TARGET_COLLEGE_IDS = Array.from({length: 15515 - 15299 + 1}, (_, i) => 15299 + i);

// function getAveragePackage(college) {
//   const placement = college.microsite_data?.placement?.[0];
//   if (!placement) return null;
//   const headers = placement.headers || {};
//   const rows = placement.rows || [];
//   if (headers["Average package"]) return headers["Average package"];
//   const avgRow = rows.find((row) => row[0]?.toLowerCase().includes("average"));
//   return avgRow ? avgRow[1] : null;
// }

// function getHighestPackage(college) {
//   const placement = college.microsite_data?.placement?.[0];
//   if (!placement) return null;
//   const headers = placement.headers || {};
//   const rows = placement.rows || [];
//   if (headers["High package"] || headers["Highest package"]) {
//     return headers["High package"] || headers["Highest package"];
//   }
//   const highRow = rows.find((row) => row[0]?.toLowerCase().includes("high"));
//   return highRow ? highRow[1] : null;
// }

// function getFees(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allFees = [];
  
//   for (const table of fees) {
//     const rows = table.rows || [];
//     const headers = table.headers || [];
    
//     const totalFeeIndex = headers.findIndex(h => 
//       h?.toLowerCase().includes('total fee') || h?.toLowerCase().includes('total fees')
//     );
    
//     if (totalFeeIndex !== -1) {
//       rows.forEach(row => {
//         if (row[totalFeeIndex] && row[totalFeeIndex].toString().includes('₹')) {
//           allFees.push(row[totalFeeIndex]);
//         }
//       });
//     } else {
//       const totalFeeRow = rows.find(row => 
//         row[0]?.toLowerCase().includes('total fee')
//       );
//       if (totalFeeRow && totalFeeRow[1]) {
//         allFees.push(totalFeeRow[1]);
//       }
//     }
//   }
  
//   if (allFees.length === 0) return null;
  
//   if (allFees.length > 1) {
//     const numericFees = allFees.map(fee => {
//       const match = fee.toString().match(/[\d,.]+/);
//       return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
//     }).filter(f => f > 0);
    
//     if (numericFees.length > 1) {
//       const min = Math.min(...numericFees);
//       const max = Math.max(...numericFees);
//       const minFee = allFees.find(f => f.toString().includes(min.toString().substring(0, 3)));
//       const maxFee = allFees.find(f => f.toString().includes(max.toString().substring(0, 3)));
//       return `${minFee} - ${maxFee}`;
//     }
//   }
  
//   return allFees[0];
// }

// function getCourses(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allCourses = new Set();
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     const rows = table.rows || [];
    
//     const courseIndex = headers.findIndex(h => 
//       h?.toLowerCase() === 'course' || h?.toLowerCase().includes('course')
//     );
    
//     if (courseIndex !== -1) {
//       rows.forEach(row => {
//         if (row[courseIndex] && row[courseIndex].toString().trim()) {
//           let courseName = row[courseIndex].toString().trim();
//           courseName = courseName.split('₹')[0].trim();
//           courseName = courseName.replace(/\d+Courses?$/i, '').trim();
//           courseName = courseName.replace(/Check Details?$/i, '').trim();
//           if (courseName && courseName.length > 0) {
//             allCourses.add(courseName);
//           }
//         }
//       });
//     }
//   }
  
//   if (college.microsite_data?.courses) {
//     const coursesData = college.microsite_data.courses;
//     if (typeof coursesData === 'string' && coursesData !== 'See Fees Section') {
//       allCourses.add(coursesData);
//     }
//   }
  
//   return allCourses.size > 0 ? Array.from(allCourses) : null;
// }

// function getRanking(college) {
//   const ranking = college.microsite_data?.ranking;
//   if (!ranking || !Array.isArray(ranking)) return null;

//   const validRankingTypes = [
//     "Collegedunia Ranking",
//     "Indiatoday Ranking",
//     "NIRF Ranking",
//     "The Week Ranking",
//     "Outlook Ranking",
//     "IIRF Ranking",
//     "TOI Ranking",
//     "QS Ranking"
//   ];

//   function cleanCategory(category) {
//     if (!category) return null;
//     return category.toString().replace(/Compare$/i, '').trim();
//   }

//   function extractRankingNumber(value) {
//     if (!value || value === "-" || value === "N/A") return null;
//     const match = value.toString().match(/#?(\d+)/);
//     return match ? parseInt(match[1], 10) : null;
//   }

//   let matchedRankings = [];

//   for (const rankingTable of ranking) {
//     const heading = rankingTable.heading?.trim();

//     if (!heading || !validRankingTypes.includes(heading)) continue;

//     const rows = rankingTable.rows || [];
//     if (rows.length === 0) continue;

//     const isEduNext = heading === "Collegedunia Ranking";
//     const finalHeading = isEduNext ? "EduNext Ranking" : heading;

//     let categoryRows = [];

//     for (const row of rows) {
//       const rawCategory = row[0];
//       const rawValue = row[1];

//       const category = cleanCategory(rawCategory);
//       const value = extractRankingNumber(rawValue);

//       if (category && value !== null) {
//         const finalValue = isEduNext ? value + 1 : value;
//         categoryRows.push({ category, value: finalValue });
//       }
//     }

//     if (categoryRows.length > 0) {
//       matchedRankings.push({
//         heading: finalHeading,
//         rows: categoryRows
//       });
//     }
//   }

//   if (matchedRankings.length === 0) {
//     const firstTable = ranking[0];
//     if (firstTable) {
//       const rows = firstTable.rows || [];
//       if (rows.length > 0 && rows[0][1]) {
//         const fallbackValue = extractRankingNumber(rows[0][1]);
//         return fallbackValue !== null ? [{ heading: firstTable.heading || "Ranking", rows: [{ category: "Overall", value: fallbackValue }] }] : null;
//       }
//     }
//     return null;
//   }

//   return matchedRankings;
// }

// function getRating(college) {
//   const rating = college.microsite_data?.reviews?.aggregate_rating?.ratingValue;
//   return rating ? rating.toString() : null;
// }

// function getReviewCount(college) {
//   return college.microsite_data?.reviews?.aggregate_rating?.reviewCount || null;
// }

// function getApprovals(college) {
//   const admission = college.microsite_data?.admission;
//   if (!admission || !Array.isArray(admission)) return null;
  
//   for (const table of admission) {
//     const rows = table.rows || [];
//     const approvalRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('accredited') || 
//       row[0]?.toLowerCase().includes('approval')
//     );
//     if (approvalRow && approvalRow[1]) return approvalRow[1];
//   }
//   return null;
// }

// function getScholarship(college) {
//   const scholarship = college.microsite_data?.scholarship;
//   if (scholarship && Array.isArray(scholarship) && scholarship.length > 0) {
//     return "Available";
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     if (headers.some(h => h?.toLowerCase().includes('scholarship'))) {
//       return "Available";
//     }
//     const rows = table.rows || [];
//     const scholarshipRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('scholarship')
//     );
//     if (scholarshipRow) return "Available";
//   }
//   return null;
// }

// function getEntranceExam(college) {
//   const cutoff = college.microsite_data?.cutoff;
//   if (cutoff && Array.isArray(cutoff)) {
//     for (const table of cutoff) {
//       const headers = table.headers || [];
//       const examIndex = headers.findIndex(h => h?.toLowerCase().includes('exam'));
//       if (examIndex !== -1) {
//         const rows = table.rows || [];
//         if (rows.length > 0 && rows[0][examIndex]) {
//           return rows[0][examIndex];
//         }
//       }
//     }
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (fees && Array.isArray(fees)) {
//     for (const table of fees) {
//       const headers = table.headers || [];
//       const eligibilityIndex = headers.findIndex(h => h?.toLowerCase().includes('eligibility'));
//       if (eligibilityIndex !== -1) {
//         const rows = table.rows || [];
//         const exams = new Set();
//         rows.forEach(row => {
//           if (row[eligibilityIndex]) {
//             const eligibility = row[eligibilityIndex].toString();
//             const examMatches = eligibility.match(/[A-Z]{2,}[-]?[A-Z]*/g);
//             if (examMatches) {
//               examMatches.forEach(exam => {
//                 if (exam.length >= 2 && exam !== 'OR' && exam !== 'AND') {
//                   exams.add(exam);
//                 }
//               });
//             }
//           }
//         });
//         if (exams.size > 0) {
//           return Array.from(exams).join(', ');
//         }
//       }
//     }
//   }
  
//   return null;
// }

// async function generateCardDetails() {
//   try {
//     console.log('🚀 Starting card_detail generation...\n');
//     console.log(`🎯 Targeting specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);

//     const { data: allColleges, error } = await supabase
//       .from('college_microsites')
//       .select('id, slug, college_name, location, url, contact, email, microsite_data')
//       .in('id', TARGET_COLLEGE_IDS);

//     if (error) throw error;

//     if (!allColleges || allColleges.length === 0) {
//       console.log('❌ No colleges found with the specified IDs');
//       return;
//     }

//     console.log(`✅ Found ${allColleges.length} colleges to process\n`);

//     let successCount = 0;
//     let errorCount = 0;

//     for (let i = 0; i < allColleges.length; i++) {
//       const college = allColleges[i];
      
//       console.log(`\n📝 Processing College ID: ${college.id} - ${college.college_name || 'Unknown'}`);
      
//       try {
//         const cardDetail = {
//           college_name: college.college_name || null,
//           location: college.location || null,
//           url: college.url || null,
//           contact: college.contact || null,
//           email: college.email || null,
//           slug: college.slug || null,
//           rating: getRating(college),
//           review_count: getReviewCount(college),
//           courses: getCourses(college),
//           fees: getFees(college),
//           avg_package: getAveragePackage(college),
//           high_package: getHighestPackage(college),
//           ranking: getRanking(college),
//           approvals: getApprovals(college),
//           scholarship: getScholarship(college),
//           entrance_exam: getEntranceExam(college)
//         };

//         console.log(`   📊 Generated card_detail:`, JSON.stringify(cardDetail, null, 2));

//         const { error: updateError } = await supabase
//           .from('college_microsites')
//           .update({ 
//             card_detail: cardDetail,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id);

//         if (updateError) {
//           console.error(`   ❌ Error updating college ${college.id}:`, updateError.message);
//           errorCount++;
//         } else {
//           successCount++;
//           console.log(`   ✅ Successfully generated and saved card_detail`);
//         }
//       } catch (err) {
//         console.error(`   ❌ Error processing college ${college.id}:`, err.message);
//         errorCount++;
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 CARD DETAIL GENERATION SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`🎯 Targeted Colleges: ${TARGET_COLLEGE_IDS.join(', ')}`);
//     console.log(`✅ Successfully Updated: ${successCount}`);
//     console.log(`❌ Errors: ${errorCount}`);
//     console.log(`📁 Total Processed: ${allColleges.length}`);
//     console.log('='.repeat(70));

//   } catch (err) {
//     console.error('❌ Fatal Error:', err.message);
//     process.exit(1);
//   }
// }

// generateCardDetails()
//   .then(() => {
//     console.log('\n✨ Card detail generation completed!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });




// scripts/generate-card-details.js
// const fs = require('fs');
// const path = require('path');
// const { supabase } = require('../src/app/lib/supabase-admin.js');

// function getAveragePackage(college) {
//   const placements = college.microsite_data?.placement;
//   if (!placements || !Array.isArray(placements)) return null;

//   for (const placement of placements) {
//     const headers = placement.headers || [];
//     const rows = placement.rows || [];

//     const avgIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("average"));
//     if (avgIndex !== -1 && rows.length > 0 && rows[0][avgIndex]) {
//       return rows[0][avgIndex];
//     }

//     const avgRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("average"));
//     if (avgRow && avgRow.length > 1) {
//       return avgRow[1];
//     }
//   }
//   return null;
// }

// function getHighestPackage(college) {
//   const placements = college.microsite_data?.placement;
//   if (!placements || !Array.isArray(placements)) return null;

//   for (const placement of placements) {
//     const headers = placement.headers || [];
//     const rows = placement.rows || [];

//     const highIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes("high"));
//     if (highIndex !== -1 && rows.length > 0 && rows[0][highIndex]) {
//       return rows[0][highIndex];
//     }

//     const highRow = rows.find((row) => row[0] && row[0].toString().toLowerCase().includes("high"));
//     if (highRow && highRow.length > 1) {
//       return highRow[1];
//     }
//   }
//   return null;
// }

// function getFees(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allFees = [];
  
//   for (const table of fees) {
//     const rows = table.rows || [];
//     const headers = table.headers || [];
    
//     const totalFeeIndex = headers.findIndex(h => 
//       h?.toLowerCase().includes('total fee') || h?.toLowerCase().includes('total fees')
//     );
    
//     if (totalFeeIndex !== -1) {
//       rows.forEach(row => {
//         if (row[totalFeeIndex] && row[totalFeeIndex].toString().includes('₹')) {
//           allFees.push(row[totalFeeIndex]);
//         }
//       });
//     } else {
//       const totalFeeRow = rows.find(row => 
//         row[0]?.toLowerCase().includes('total fee')
//       );
//       if (totalFeeRow && totalFeeRow[1]) {
//         allFees.push(totalFeeRow[1]);
//       }
//     }
//   }
  
//   if (allFees.length === 0) return null;
  
//   if (allFees.length > 1) {
//     const numericFees = allFees.map(fee => {
//       const match = fee.toString().match(/[\d,.]+/);
//       return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
//     }).filter(f => f > 0);
    
//     if (numericFees.length > 1) {
//       const min = Math.min(...numericFees);
//       const max = Math.max(...numericFees);
//       const minFee = allFees.find(f => f.toString().includes(min.toString().substring(0, 3)));
//       const maxFee = allFees.find(f => f.toString().includes(max.toString().substring(0, 3)));
//       return `${minFee} - ${maxFee}`;
//     }
//   }
  
//   return allFees[0];
// }

// function getCourses(college) {
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   let allCourses = new Set();
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     const rows = table.rows || [];
    
//     const courseIndex = headers.findIndex(h => 
//       h?.toLowerCase() === 'course' || h?.toLowerCase().includes('course')
//     );
    
//     if (courseIndex !== -1) {
//       rows.forEach(row => {
//         if (row[courseIndex] && row[courseIndex].toString().trim()) {
//           let courseName = row[courseIndex].toString().trim();
//           courseName = courseName.split('₹')[0].trim();
//           courseName = courseName.replace(/\d+Courses?$/i, '').trim();
//           courseName = courseName.replace(/Check Details?$/i, '').trim();
//           if (courseName && courseName.length > 0) {
//             allCourses.add(courseName);
//           }
//         }
//       });
//     }
//   }
  
//   if (college.microsite_data?.courses) {
//     const coursesData = college.microsite_data.courses;
//     if (typeof coursesData === 'string' && coursesData !== 'See Fees Section') {
//       allCourses.add(coursesData);
//     }
//   }
  
//   return allCourses.size > 0 ? Array.from(allCourses) : null;
// }

// function getRanking(college) {
//   const ranking = college.microsite_data?.ranking;
//   if (!ranking || !Array.isArray(ranking)) return null;

//   const validRankingTypes = [
//     "Collegedunia Ranking",
//     "Indiatoday Ranking",
//     "NIRF Ranking",
//     "The Week Ranking",
//     "Outlook Ranking",
//     "IIRF Ranking",
//     "TOI Ranking",
//     "QS Ranking"
//   ];

//   function cleanCategory(category) {
//     if (!category) return null;
//     return category.toString().replace(/Compare$/i, '').trim();
//   }

//   function extractRankingNumber(value) {
//     if (!value || value === "-" || value === "N/A") return null;
//     const match = value.toString().match(/#?(\d+)/);
//     return match ? parseInt(match[1], 10) : null;
//   }

//   let matchedRankings = [];

//   for (const rankingTable of ranking) {
//     const heading = rankingTable.heading?.trim();

//     if (!heading || !validRankingTypes.includes(heading)) continue;

//     const rows = rankingTable.rows || [];
//     if (rows.length === 0) continue;

//     const isEduNext = heading === "Collegedunia Ranking";
//     const finalHeading = isEduNext ? "EduNext Ranking" : heading;

//     let categoryRows = [];

//     for (const row of rows) {
//       const rawCategory = row[0];
//       const rawValue = row[1];

//       const category = cleanCategory(rawCategory);
//       const value = extractRankingNumber(rawValue);

//       if (category && value !== null) {
//         const finalValue = isEduNext ? value + 1 : value;
//         categoryRows.push({ category, value: finalValue });
//       }
//     }

//     if (categoryRows.length > 0) {
//       matchedRankings.push({
//         heading: finalHeading,
//         rows: categoryRows
//       });
//     }
//   }

//   if (matchedRankings.length === 0) {
//     const firstTable = ranking[0];
//     if (firstTable) {
//       const rows = firstTable.rows || [];
//       if (rows.length > 0 && rows[0][1]) {
//         const fallbackValue = extractRankingNumber(rows[0][1]);
//         return fallbackValue !== null ? [{ heading: firstTable.heading || "Ranking", rows: [{ category: "Overall", value: fallbackValue }] }] : null;
//       }
//     }
//     return null;
//   }

//   return matchedRankings;
// }

// function getRating(college) {
//   const rating = college.microsite_data?.reviews?.aggregate_rating?.ratingValue;
//   return rating ? rating.toString() : null;
// }

// function getReviewCount(college) {
//   return college.microsite_data?.reviews?.aggregate_rating?.reviewCount || null;
// }

// function getApprovals(college) {
//   const admission = college.microsite_data?.admission;
//   if (!admission || !Array.isArray(admission)) return null;
  
//   for (const table of admission) {
//     const rows = table.rows || [];
//     const approvalRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('accredited') || 
//       row[0]?.toLowerCase().includes('approval')
//     );
//     if (approvalRow && approvalRow[1]) return approvalRow[1];
//   }
//   return null;
// }

// function getScholarship(college) {
//   const scholarship = college.microsite_data?.scholarship;
//   if (scholarship && Array.isArray(scholarship) && scholarship.length > 0) {
//     return "Available";
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (!fees || !Array.isArray(fees)) return null;
  
//   for (const table of fees) {
//     const headers = table.headers || [];
//     if (headers.some(h => h?.toLowerCase().includes('scholarship'))) {
//       return "Available";
//     }
//     const rows = table.rows || [];
//     const scholarshipRow = rows.find(row => 
//       row[0]?.toLowerCase().includes('scholarship')
//     );
//     if (scholarshipRow) return "Available";
//   }
//   return null;
// }

// function getEntranceExam(college) {
//   const cutoff = college.microsite_data?.cutoff;
//   if (cutoff && Array.isArray(cutoff)) {
//     for (const table of cutoff) {
//       const headers = table.headers || [];
//       const examIndex = headers.findIndex(h => h?.toLowerCase().includes('exam'));
//       if (examIndex !== -1) {
//         const rows = table.rows || [];
//         if (rows.length > 0 && rows[0][examIndex]) {
//           return rows[0][examIndex];
//         }
//       }
//     }
//   }
  
//   const fees = college.microsite_data?.fees;
//   if (fees && Array.isArray(fees)) {
//     for (const table of fees) {
//       const headers = table.headers || [];
//       const eligibilityIndex = headers.findIndex(h => h?.toLowerCase().includes('eligibility'));
//       if (eligibilityIndex !== -1) {
//         const rows = table.rows || [];
//         const exams = new Set();
//         rows.forEach(row => {
//           if (row[eligibilityIndex]) {
//             const eligibility = row[eligibilityIndex].toString();
//             const examMatches = eligibility.match(/[A-Z]{2,}[-]?[A-Z]*/g);
//             if (examMatches) {
//               examMatches.forEach(exam => {
//                 if (exam.length >= 2 && exam !== 'OR' && exam !== 'AND') {
//                   exams.add(exam);
//                 }
//               });
//             }
//           }
//         });
//         if (exams.size > 0) {
//           return Array.from(exams).join(', ');
//         }
//       }
//     }
//   }
  
//   return null;
// }

// async function generateCardDetails() {
//   try {
//     console.log('🚀 Starting card_detail generation...\n');

//     // 1. Read target IDs from JSONL file
//     console.log('📂 Reading testcollege_0006.jsonl to get target IDs...');
//     const JSON_FILE_PATH = path.join(__dirname, '../new-data/testcollege_0006.jsonl');
//     const lines = fs.readFileSync(JSON_FILE_PATH, 'utf8').trim().split('\n');
    
//     // Extract IDs and convert to strings for safe comparison
//     const targetRawIds = lines.map(line => {
//       try { return String(JSON.parse(line).id); } catch (e) { return null; }
//     }).filter(Boolean);
//     console.log(`🎯 Found ${targetRawIds.length} target IDs in your JSONL file to process.\n`);

//     let allColleges = [];
//     let from = 0;
//     const batchSize = 1000;
//     let hasMore = true;

//     console.log('📥 Fetching all colleges from database...\n');

//     while (hasMore) {
//       const { data, error } = await supabase
//         .from('college_microsites')
//         .select('id, slug, college_name, location, url, contact, email, microsite_data')
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
//     console.log('⚙️  Processing colleges and generating card details...\n');

//     let successCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;

//     for (let i = 0; i < allColleges.length; i++) {
//       const college = allColleges[i];
      
//       try {
//         // --- ADDED SKIP LOGIC FOR 5k BATCH ---
//         const micrositeData = typeof college.microsite_data === 'string' 
//           ? JSON.parse(college.microsite_data) 
//           : (college.microsite_data || {});
        
//         const rawId = micrositeData.id ? String(micrositeData.id) : null;
//         if (!rawId || !targetRawIds.includes(rawId)) {
//           skippedCount++;
//           continue; // Skip this college completely, it's not in the new JSONL batch
//         }
//         // -------------------------------------

//         const cardDetail = {
//           college_name: college.college_name || null,
//           location: college.location || null,
//           url: college.url || null,
//           contact: college.contact || null,
//           email: college.email || null,
//           slug: college.slug || null,
//           rating: getRating(college),
//           review_count: getReviewCount(college),
//           courses: getCourses(college),
//           fees: getFees(college),
//           avg_package: getAveragePackage(college),
//           high_package: getHighestPackage(college),
//           ranking: getRanking(college),
//           approvals: getApprovals(college),
//           scholarship: getScholarship(college),
//           entrance_exam: getEntranceExam(college)
//         };

//         const { error: updateError } = await supabase
//           .from('college_microsites')
//           .update({ 
//             card_detail: cardDetail,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', college.id);

//         if (updateError) {
//           console.error(`❌ Error updating college ${college.id}:`, updateError.message);
//           errorCount++;
//         } else {
//           successCount++;
//           if (successCount % 100 === 0) {
//             console.log(`✅ Progress: ${successCount} colleges updated...`);
//           }
//         }
//       } catch (err) {
//         console.error(`❌ Error processing college ${college.id}:`, err.message);
//         errorCount++;
//       }
//     }

//     console.log('\n' + '='.repeat(70));
//     console.log('📊 CARD DETAIL GENERATION SUMMARY');
//     console.log('='.repeat(70));
//     console.log(`✅ Successfully Updated: ${successCount}`);
//     console.log(`⏭️  Skipped (not in target list): ${skippedCount}`);
//     console.log(`❌ Errors: ${errorCount}`);
//     console.log(`📁 Total Target Colleges Processed: ${successCount + errorCount}`);
//     console.log('='.repeat(70));

//   } catch (err) {
//     console.error('❌ Fatal Error:', err.message);
//     process.exit(1);
//   }
// }

// generateCardDetails()
//   .then(() => {
//     console.log('\n✨ Card detail generation completed!');
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error(err);
//     process.exit(1);
//   });
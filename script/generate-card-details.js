// scripts/generate-card-details.js
const { supabase } = require('../src/app/lib/supabase-admin.js');

// Helper functions to extract data from microsite_data

function getAveragePackage(college) {
  const placement = college.microsite_data?.placement?.[0];
  if (!placement) return null;
  const headers = placement.headers || {};
  const rows = placement.rows || [];
  if (headers["Average package"]) return headers["Average package"];
  const avgRow = rows.find((row) => row[0]?.toLowerCase().includes("average"));
  return avgRow ? avgRow[1] : null;
}

function getHighestPackage(college) {
  const placement = college.microsite_data?.placement?.[0];
  if (!placement) return null;
  const headers = placement.headers || {};
  const rows = placement.rows || [];
  if (headers["High package"] || headers["Highest package"]) {
    return headers["High package"] || headers["Highest package"];
  }
  const highRow = rows.find((row) => row[0]?.toLowerCase().includes("high"));
  return highRow ? highRow[1] : null;
}

function getFees(college) {
  const fees = college.microsite_data?.fees;
  if (!fees || !Array.isArray(fees)) return null;
  
  let allFees = [];
  
  // Extract all fee amounts from different tables
  for (const table of fees) {
    const rows = table.rows || [];
    const headers = table.headers || [];
    
    // Look for "Total Fees" or "Total Fee" column
    const totalFeeIndex = headers.findIndex(h => 
      h?.toLowerCase().includes('total fee') || h?.toLowerCase().includes('total fees')
    );
    
    if (totalFeeIndex !== -1) {
      // Extract fees from the total fee column
      rows.forEach(row => {
        if (row[totalFeeIndex] && row[totalFeeIndex].toString().includes('₹')) {
          allFees.push(row[totalFeeIndex]);
        }
      });
    } else {
      // Look for rows with "Total Fee" or "Total Fees" in first column
      const totalFeeRow = rows.find(row => 
        row[0]?.toLowerCase().includes('total fee')
      );
      if (totalFeeRow && totalFeeRow[1]) {
        allFees.push(totalFeeRow[1]);
      }
    }
  }
  
  if (allFees.length === 0) return null;
  
  // If multiple fees found, return range (min - max)
  if (allFees.length > 1) {
    // Extract numeric values for comparison
    const numericFees = allFees.map(fee => {
      const match = fee.toString().match(/[\d,.]+/);
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    }).filter(f => f > 0);
    
    if (numericFees.length > 1) {
      const min = Math.min(...numericFees);
      const max = Math.max(...numericFees);
      const minFee = allFees.find(f => f.toString().includes(min.toString().substring(0, 3)));
      const maxFee = allFees.find(f => f.toString().includes(max.toString().substring(0, 3)));
      return `${minFee} - ${maxFee}`;
    }
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
    
    // Look for "Course" column
    const courseIndex = headers.findIndex(h => 
      h?.toLowerCase() === 'course' || h?.toLowerCase().includes('course')
    );
    
    if (courseIndex !== -1) {
      // Extract courses from the course column
      rows.forEach(row => {
        if (row[courseIndex] && row[courseIndex].toString().trim()) {
          let courseName = row[courseIndex].toString().trim();
          // Clean up course name (remove fees info if attached)
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
  
  // Also check in courses field if available
  if (college.microsite_data?.courses) {
    const coursesData = college.microsite_data.courses;
    if (typeof coursesData === 'string' && coursesData !== 'See Fees Section') {
      allCourses.add(coursesData);
    }
  }
  
  return allCourses.size > 0 ? Array.from(allCourses) : null;
}

function getRanking(college) {
  const ranking = college.microsite_data?.ranking?.[0];
  if (!ranking) return null;
  const rows = ranking.rows || [];
  return rows.length > 0 ? rows[0][1] : null;
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
  
  // Also check in fees section for entrance exam eligibility
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
            // Extract exam names like JEE, NEET, BSDU-CET, etc.
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
  
  return null;
}

async function generateCardDetails() {
  try {
    console.log('🚀 Starting card_detail generation...\n');

    // Step 1: Fetch ALL colleges
    let allColleges = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('📥 Fetching all colleges from database...\n');

    while (hasMore) {
      const { data, error } = await supabase
        .from('college_microsites')
        .select('id, slug, college_name, location, url, contact, email, microsite_data')
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

    // Step 2: Process each college
    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i];
      
      try {
        // Extract card details with ALL fields (existing + new)
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

        // Update the college with card_detail
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
            console.log(`✅ Progress: ${successCount}/${allColleges.length} colleges updated...`);
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
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Colleges: ${allColleges.length}`);
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
const { supabase } = require('../src/app/lib/supabase-admin.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ===== CONFIGURATION =====
const GEMINI_API_KEY = 'AIzaSyAfvLc4bKl9LhupY62M55_FR-xUTYJbp20';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// UNCOMMENT TO TEST WITH SPECIFIC COLLEGE IDs
// const TARGET_COLLEGE_IDS = [34624]; // Test with Masters' Union first
const TARGET_COLLEGE_IDS = null

// Delay between API calls (in ms) to avoid rate limiting
const DELAY_MS = 5000;

// ===== HELPER FUNCTIONS =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract key data from college object
function extractCollegeData(college) {
  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college?.microsite_data || {});

  // Get fees
  let fees = null;
  if (college.card_detail?.fees) {
    fees = college.card_detail.fees;
  } else if (micrositeData.fees?.[0]?.rows) {
    const totalFeesRow = micrositeData.fees[0].rows.find(r => 
      r[0]?.toLowerCase().includes('total') || r[0]?.toLowerCase().includes('tuition')
    );
    fees = totalFeesRow?.[1];
  }

  // Get placements
  let avgPackage = null;
  let highestPackage = null;
  if (micrositeData.placement?.[0]?.rows) {
    const avgRow = micrositeData.placement[0].rows.find(r => r[0]?.toLowerCase().includes('average'));
    const highRow = micrositeData.placement[0].rows.find(r => r[0]?.toLowerCase().includes('highest'));
    avgPackage = avgRow?.[1];
    highestPackage = highRow?.[1];
  }

  // Get courses
  let courses = [];
  if (micrositeData.fees?.[0]?.rows) {
    courses = micrositeData.fees[0].rows.map(r => r[0]).filter(c => c && !c.toLowerCase().includes('fees'));
  }
  const coursesText = courses.length > 0 ? courses.slice(0, 5).join(', ') : 'Various programs';

  // Get ranking
  let ranking = null;
  if (micrositeData.ranking?.[0]?.rows?.[0]) {
    ranking = `${micrositeData.ranking[0].rows[0][0]} Rank ${micrositeData.ranking[0].rows[0][2]}`;
  }

  // Get admission info
  let admissionExams = null;
  if (micrositeData.admission?.[0]?.rows) {
    const examRow = micrositeData.admission[0].rows.find(r => 
      r[4]?.toLowerCase().includes('cat') || 
      r[4]?.toLowerCase().includes('exam')
    );
    admissionExams = examRow?.[4];
  }

  return {
    name: college.college_name,
    location: college.location,
    fees,
    avgPackage,
    highestPackage,
    courses: coursesText,
    ranking,
    admissionExams,
    about: micrositeData.about || college.about
  };
}

// Generate SEO description using Gemini
async function generateSEODescription(collegeData) {
  const prompt = `You are an expert SEO content writer for an education platform. Create a compelling, SEO-optimized description for the following college.

**College Name:** ${collegeData.name}
**Location:** ${collegeData.location}
**Fees:** ${collegeData.fees || 'Not available'}
**Average Placement:** ${collegeData.avgPackage || 'Not available'}
**Highest Placement:** ${collegeData.highestPackage || 'Not available'}
**Courses Offered:** ${collegeData.courses}
**Ranking:** ${collegeData.ranking || 'Not available'}
**Admission Exams:** ${collegeData.admissionExams || 'Not available'}
**About:** ${collegeData.about ? collegeData.about.substring(0, 300) : 'Not available'}

**Requirements:**
1. Write 150-200 words
2. Target students searching for "${collegeData.name}" or similar colleges in "${collegeData.location}"
3. Include keywords naturally: college name, location, courses, placements, fees, rankings
4. Make it engaging and conversion-focused (encourage applications/inquiries)
5. Use bullet points (with emoji) for key highlights like:
   - 🎯 **Industry-First Curriculum**
   - 💼 **100% Placement Record**
   etc.
6. Start with a strong opening sentence about the college
7. End with a call-to-action or value proposition
8. Use markdown formatting (**bold** for highlights, bullet points with -)
9. Focus on what makes this college unique

Write ONLY the description, no explanations or meta-commentary.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    return null;
  }
}

// ===== MAIN FUNCTION =====

async function generateDescriptions() {
  try {
    console.log('🚀 Starting SEO Description Generator...\n');
    console.log('🔑 Using Gemini API Key:', GEMINI_API_KEY.substring(0, 10) + '...\n');

    // Fetch colleges
let query = supabase
  .from('college_microsites')
  .select('*')
  .order('id', { ascending: true });

if (TARGET_COLLEGE_IDS && TARGET_COLLEGE_IDS.length > 0) {
  console.log(`🎯 Testing with specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);
  query = query.in('id', TARGET_COLLEGE_IDS);
} else {
  console.log('🌍 Running for ALL colleges...\n');
}

const { data: colleges, error } = await query.range(1001,2000);

    if (error) throw error;
    if (!colleges || colleges.length === 0) {
      console.log('❌ No colleges found!');
      return;
    }

    console.log(`✅ Found ${colleges.length} college(s) to process\n`);
    console.log('='.repeat(70));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < colleges.length; i++) {
      const college = colleges[i];
      
      try {
        console.log(`\n[${i + 1}/${colleges.length}] Processing: ${college.college_name} (ID: ${college.id})`);
        
        // Extract data
        const collegeData = extractCollegeData(college);
        console.log(`📊 Extracted Data:
  - Location: ${collegeData.location}
  - Fees: ${collegeData.fees || 'N/A'}
  - Avg Package: ${collegeData.avgPackage || 'N/A'}
  - Courses: ${collegeData.courses.substring(0, 50)}...`);

        // Generate description
        console.log('🤖 Generating SEO description with Gemini...');
        const description = await generateSEODescription(collegeData);

        if (!description) {
          console.log('❌ Failed to generate description');
          errorCount++;
          continue;
        }

        console.log('\n📝 Generated Description:');
        console.log('─'.repeat(70));
        console.log(description);
        console.log('─'.repeat(70));

        // Update database
        const { error: updateError } = await supabase
          .from('college_microsites')
          .update({
            description: description,
            updated_at: new Date().toISOString()
          })
          .eq('id', college.id);

        if (updateError) {
          console.log('❌ Database update failed:', updateError.message);
          errorCount++;
        } else {
          console.log('✅ Description saved to database!');
          successCount++;
        }

        // Delay before next API call
        if (i < colleges.length - 1) {
          console.log(`⏳ Waiting ${DELAY_MS / 1000}s before next college...`);
          await delay(DELAY_MS);
        }

      } catch (err) {
        console.error(`❌ Error processing college ${college.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 GENERATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully Generated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total Processed: ${colleges.length}`);
    console.log('='.repeat(70));

  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

// ===== RUN SCRIPT =====

generateDescriptions()
  .then(() => {
    console.log('\n✨ Description generation completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
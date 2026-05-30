const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// ===== SUPABASE DIRECT INIT =====
const SUPABASE_URL = 'https://tnlbukkknbujenxjjmym.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGJ1a2trbmJ1amVueGpqbXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjQzMiwiZXhwIjoyMDc3MTUyNDMyfQ.o5rLyz0L6OB5ng9eRt-GPE7cvLhKIFeqzZDpG2iSn3k';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// ===== CONFIGURATION =====
const API_KEYS = [
  'AIzaSyA7v-XBIkslGlkA8d9UfOf-4ZqmaYhh-Pg'
];
let currentKeyIndex = 0;
let genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// ===== BATCH CONFIGURATION =====
const BATCH_SIZE = 10;                  // Process 10 colleges per batch
const BATCH_START_OFFSET = 0;        // Starting row number
const BATCH_END_OFFSET = 19161;         // Ending row number
// UNCOMMENT TO TEST WITH SPECIFIC COLLEGE IDs
// const TARGET_COLLEGE_IDS = [34624];
const TARGET_COLLEGE_IDS = null;
// Delay between API calls (in ms) to avoid rate limiting
const DELAY_MS = 5000;
// ===== HELPER FUNCTIONS =====
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Switch to next API key
function switchToNextAPIKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔄 Switching to API Key ${currentKeyIndex + 1}/${API_KEYS.length}`);
  genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
// Generate SEO description using Gemini with retry logic
async function generateSEODescription(collegeData, retryCount = 0) {
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
    console.error(`❌ Gemini API Error (Key ${currentKeyIndex + 1}):`, error.message);

    // If we haven't tried all keys yet, switch and retry
    if (retryCount < API_KEYS.length - 1) {
      switchToNextAPIKey();
      console.log('🔁 Retrying with new API key...');
      await delay(2000); // Short delay before retry
      return generateSEODescription(collegeData, retryCount + 1);
    }

    // All keys failed
    console.error('❌ All API keys failed for this request');
    return null;
  }
}
// ===== MAIN FUNCTION =====
async function generateDescriptions() {
  try {
    console.log('🚀 Starting SEO Description Generator...\n');
    console.log(`🔑 Using ${API_KEYS.length} API keys with automatic failover\n`);
    console.log(`📦 Batch Size: ${BATCH_SIZE} colleges per batch`);
    console.log(`📊 Range: Rows ${BATCH_START_OFFSET} to ${BATCH_END_OFFSET}\n`);
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalProcessed = 0;
    let offset = BATCH_START_OFFSET;
    while (offset <= BATCH_END_OFFSET) {
      const batchEnd = Math.min(offset + BATCH_SIZE - 1, BATCH_END_OFFSET);

      console.log('\n' + '='.repeat(70));
      console.log(`📦 BATCH: Rows ${offset} to ${batchEnd}`);
      console.log('='.repeat(70));
      // Fetch colleges for this batch
      let query = supabase
        .from('college_microsites')
        .select('*')
        .order('id', { ascending: true });
      if (TARGET_COLLEGE_IDS && TARGET_COLLEGE_IDS.length > 0) {
        console.log(`🎯 Testing with specific college IDs: ${TARGET_COLLEGE_IDS.join(', ')}\n`);
        query = query.in('id', TARGET_COLLEGE_IDS);
      }
      const { data: colleges, error } = await query.range(offset, batchEnd);
      if (error) throw error;
      if (!colleges || colleges.length === 0) {
        console.log('✅ No more colleges found. Batch processing complete!');
        break;
      }
      console.log(`✅ Found ${colleges.length} college(s) in this batch\n`);
      let batchSuccessCount = 0;
      let batchErrorCount = 0;
      for (let i = 0; i < colleges.length; i++) {
        const college = colleges[i];

        try {
          console.log(`\n[${offset + i}/${BATCH_END_OFFSET}] Processing: ${college.college_name} (ID: ${college.id})`);

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
            batchErrorCount++;
            totalErrorCount++;
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
            batchErrorCount++;
            totalErrorCount++;
          } else {
            console.log('✅ Description saved to database!');
            batchSuccessCount++;
            totalSuccessCount++;
          }
          // Delay before next API call
          if (i < colleges.length - 1) {
            console.log(`⏳ Waiting ${DELAY_MS / 1000}s before next college...`);
            await delay(DELAY_MS);
          }
        } catch (err) {
          console.error(`❌ Error processing college ${college.id}:`, err.message);
          batchErrorCount++;
          totalErrorCount++;
        }
      }
      totalProcessed += colleges.length;
      console.log('\n' + '─'.repeat(70));
      console.log(`📊 BATCH SUMMARY (Rows ${offset}-${batchEnd})`);
      console.log('─'.repeat(70));
      console.log(`✅ Success: ${batchSuccessCount}`);
      console.log(`❌ Errors: ${batchErrorCount}`);
      console.log(`📁 Batch Total: ${colleges.length}`);
      // If we got fewer colleges than expected, we've reached the end
      if (colleges.length < BATCH_SIZE || batchEnd >= BATCH_END_OFFSET) {
        break;
      }
      // Move to next batch
      offset += BATCH_SIZE;

      // Small delay between batches
      if (offset <= BATCH_END_OFFSET) {
        console.log(`\n⏳ Batch complete. Moving to next batch in 3s...`);
        await delay(3000);
      }
    }
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully Generated: ${totalSuccessCount}`);
    console.log(`❌ Errors: ${totalErrorCount}`);
    console.log(`📁 Total Processed: ${totalProcessed}`);
    console.log(`🔑 API Keys Used: ${API_KEYS.length}`);
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

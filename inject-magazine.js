const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inject() {
  const content = `
    <p><em>Imagine walking into an IIT Kanpur classroom to study the future of hacking and cybersecurity—without ever having to crack the brutal JEE Advanced exam.</em></p>
    <p>In an unprecedented move that is shaking up the engineering landscape, IIT Kanpur has officially launched a new Bachelor's degree in Cybersecurity. And the biggest shocker? They are not using the traditional JEE Advanced score as the only entry gate.</p>

    <h2>Why This is a Game-Changer</h2>
    <p>For decades, entering an IIT meant enduring years of stressful coaching and intense competition for a top rank. This new pathway acknowledges that true tech aptitude isn't always reflected in a physics or chemistry paper.</p>
    <ul>
      <li><strong>Direct Focus on Tech:</strong> You dive straight into cryptography, ethical hacking, and network defense.</li>
      <li><strong>Massive Industry Demand:</strong> Cybersecurity experts are among the highest-paid professionals globally, with companies desperate for trained talent.</li>
      <li><strong>Bypassing the Rat Race:</strong> It provides a lifeline to brilliant coders who might not be traditional exam-toppers.</li>
    </ul>

    <h2>How the Admission Works</h2>
    <p>While the exact alternative entry criteria are still being finalized, early reports suggest they will look at aptitude tests, coding portfolios, and specific math skills rather than the generic JEE Advanced rank list. This is similar to how IIT Madras launched its BS in Data Science.</p>

    <h2>What You Need to Do Now</h2>
    <p>If you are serious about tech, this is your moment to pivot:</p>
    <ul>
      <li><strong>Start Coding Now:</strong> Build a GitHub portfolio. Participate in Capture The Flag (CTF) competitions online.</li>
      <li><strong>Strengthen Your Math:</strong> While chemistry might not matter, discrete mathematics and logic will be crucial.</li>
      <li><strong>Keep Track of Announcements:</strong> The official portal will open soon for the first cohort. Don't miss the deadline.</li>
    </ul>

    <p><em><strong>Disclaimer:</strong> This information is based on initial announcements from IIT Kanpur. Students must refer to the official IIT Kanpur website for finalized admission criteria, syllabus, and important dates before applying.</em></p>
  `;

  const heroImage = "https://image.pollinations.ai/prompt/cybersecurity,%20hacker%20coding,%20IIT%20campus,%20modern%20editorial%20photography,%20professional,%20dark%20navy%20background,%20no%20text,%20magazine%20cover%20quality,%20cinematic%20lighting?width=1200&height=630&nologo=true&enhance=true&model=flux";

  const { data, error } = await sb.from('edu_news').insert({
    title: "IIT Kanpur's New Cybersecurity Degree: No JEE Advanced Required",
    slug: "iit-kanpur-cybersecurity-degree-no-jee",
    summary: "IIT Kanpur has launched a new Bachelor of Cybersecurity degree that doesn't require a JEE Advanced score. Learn how to secure your spot in this high-demand program.",
    content: content,
    category: "JEE / Engineering",
    tags: ["IIT Kanpur", "Cybersecurity", "JEE Advanced", "BTech", "Admissions"],
    source_name: "EduNext Editorial",
    hero_image: heroImage,
    image_url: heroImage,
    is_magazine: true,
    published_at: new Date().toISOString()
  }).select();

  if (error) {
    console.error("Failed to inject article:", error.message);
  } else {
    console.log('Successfully injected magazine article. ID:', data[0].id);
    
    await sb.from('magazine_topic_history').upsert({
      topic_key: 'news:iit-kanpur-cybersecurity-degree-no-jee',
      category: 'JEE / Engineering',
      used_for_slug: 'iit-kanpur-cybersecurity-degree-no-jee'
    });
    console.log('Successfully logged to topic history.');
  }
}

inject();

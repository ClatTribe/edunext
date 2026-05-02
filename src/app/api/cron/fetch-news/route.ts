import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Extend Vercel function timeout to 60s (prevents timeout with 9 feeds)
export const maxDuration = 60;

// Use server-side GEMINI_API_KEY first (same key that powers Medha AI successfully)
// NEXT_PUBLIC key is restricted — only fall back to it if server key absent
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

// Use models confirmed working with this key (gemini-2.5-flash-lite powers Medha AI)
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

const RSS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=CBSE+Class+10+12+board+exam+result+2026&hl=en-IN&gl=IN&ceid=IN:en', category: 'Boards / CBSE', name: 'Google News CBSE' },
  { url: 'https://indianexpress.com/section/education/feed/', category: 'JEE / Engineering', name: 'Indian Express Education' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms', category: 'MBA / CAT', name: 'TOI Education' },
  { url: 'https://news.google.com/rss/search?q=JEE+2025+2026+exam+results+cutoff+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'JEE / Engineering', name: 'Google News JEE' },
  { url: 'https://news.google.com/rss/search?q=NEET+2025+2026+results+counselling+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'NEET / Medical', name: 'Google News NEET' },
  { url: 'https://news.google.com/rss/search?q=CLAT+2025+law+NLU+admissions+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'CLAT / Law', name: 'Google News CLAT' },
  { url: 'https://news.google.com/rss/search?q=CAT+MBA+IIM+admissions+India+2025&hl=en-IN&gl=IN&ceid=IN:en', category: 'MBA / CAT', name: 'Google News CAT' },
  { url: 'https://news.google.com/rss/search?q=study+abroad+scholarship+Indian+students+2025&hl=en-IN&gl=IN&ceid=IN:en', category: 'Study Abroad', name: 'Google News Study Abroad' },
  { url: 'https://news.google.com/rss/search?q=UPSC+SSC+government+exam+India+2025&hl=en-IN&gl=IN&ceid=IN:en', category: 'Govt Exams', name: 'Google News Govt Exams' },
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

function parseRSSFeed(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemPattern = new RegExp('<item[^>]*>([\\s\\S]*?)<\\/item>', 'g');
  const itemMatches = xml.matchAll(itemPattern);
  for (const match of itemMatches) {
    const itemXml = match[1];
    const titleCdata = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
    const titlePlain = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const title = (titleCdata?.[1] || titlePlain?.[1] || '').replace(/<[^>]+>/g, '').trim();
    const linkMatch = itemXml.match(/<link[^>]*>(https?:\/\/[^<\s]+)/);
    const guidMatch = itemXml.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
    const link = (linkMatch?.[1] || guidMatch?.[1] || '').trim();
    const descCdata = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    const descPlain = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const description = (descCdata?.[1] || descPlain?.[1] || '').replace(/<[^>]+>/g, '').trim().slice(0, 500);
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toUTCString();
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1];
    let source = sourceMatch || '';
    if (!source && link) {
      try { source = new URL(link).hostname.replace('www.', ''); } catch { source = 'News'; }
    }
    if (title && link) {
      items.push({ title, link, description, pubDate, source });
    }
  }
  return items.slice(0, 3);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}
// Per-article category router. Runs on title + description, ignores feed.category
// unless nothing matches. Order matters: more specific buckets first; Boards
// before Govt Exams (so "AP SSC results" routes to Boards, not Govt SSC CGL).
function classifyCategory(title: string, description: string, fallback: string): string {
  const text = `${title} ${description}`.toLowerCase();

  // 1. NEET / Medical
  if (/\b(neet|mbbs|aiims|nmc|jipmer|mds|bds|medical (college|entrance|admission))\b/.test(text)) return 'NEET / Medical';

  // 2. CLAT / Law
  if (/\b(clat|ailet|nlu|nlsiu|nalsar|national law univers|law (admission|entrance)|llb admission)\b/.test(text)) return 'CLAT / Law';

  // 3. MBA / CAT
  if (/\b(iim|xat|cmat|nmat|gmat|mba admission|business school|b-school)\b/.test(text)) return 'MBA / CAT';
  if (/\bcat (exam|20\d{2}|result|cutoff|registration|aspir)/.test(text)) return 'MBA / CAT';

  // 4. Boards / CBSE — must precede Govt Exams (state SSC = Boards, not Govt)
  if (/\b(cbse|icse|hsc|cisce|aissce|matric|board exam|board result|marksheet|digilocker|msbshse)\b/.test(text)) return 'Boards / CBSE';
  if (/\bclass (10|11|12)(th)?\b/.test(text)) return 'Boards / CBSE';
  if (/\b(10th|11th|12th) (result|board|exam|marks)/.test(text)) return 'Boards / CBSE';
  if (/\b(ap|maharashtra|odisha|telangana|bihar|gujarat|kerala|tamil nadu|tn) (ssc|hsc|board)\b/.test(text)) return 'Boards / CBSE';
  if (/\bssc (result|board|exam|10th|12th|marks|supplementary)/.test(text)) return 'Boards / CBSE';
  if (/\b(bse odisha|jac board|wbbse|cgbse|pseb|ahsec)\b/.test(text)) return 'Boards / CBSE';

  // 5. Govt Exams
  if (/\b(upsc|civil service|nda exam|cds exam|capf|epfo|state psc|sbi (po|clerk))\b/.test(text)) return 'Govt Exams';
  if (/\bssc (cgl|gd|mts|chsl|je|stenographer|selection commission)\b/.test(text)) return 'Govt Exams';
  if (/\b(rrb|ntpc|ibps)\b/.test(text)) return 'Govt Exams';

  // 6. Scholarships
  if (/\b(scholarship|fellowship|inspire scholarship|kvpy|nsp portal)\b/.test(text)) return 'Scholarships';

  // 7. Study Abroad
  if (/\b(ielts|toefl|study abroad|f-?1 visa|student visa|us universit|uk universit|canada visa|gre exam|sat exam|mbbs abroad|overseas educ)\b/.test(text)) return 'Study Abroad';

  // 8. AI & EdTech
  if (/\b(chatgpt|generative ai|gen ai|edtech|ed-tech|ai tutor)\b/.test(text)) return 'AI & EdTech';
  if (/\bai (in|for) educat/.test(text)) return 'AI & EdTech';

  // 9. JEE / Engineering — last specific check (broad terms appear elsewhere)
  if (/\b(jee|josaa|csab|iit|nit|iiit|btech|b\.tech)\b/.test(text)) return 'JEE / Engineering';
  if (/\bengineering (admission|counsell|entrance|college|aspir)/.test(text)) return 'JEE / Engineering';

  return fallback;
}


async function summarizeWithGemini(
  item: RSSItem,
  category: string,
  diagnostics: string[]
): Promise<{ title: string; summary: string; content: string; tags: string[]; slug: string } | null> {
  if (!GEMINI_API_KEY) {
    diagnostics.push('Gemini: no API key');
    return null;
  }

  const prompt = `You are an education news writer for EduNext (getedunext.com), India's college discovery platform.
Write a comprehensive, long-form article for Indian students based on this news.

Title: ${item.title}
Description: ${item.description.slice(0, 400)}
Category: ${category}

IMPORTANT RULES:
- Write at least 600-800 words of content
- Do NOT mention or link to any specific news source, newspaper, or website by name
- Instead of citing sources, add a disclaimer at the end asking students to verify from official websites
- Structure the article with multiple sections covering: what happened, why it matters, key details/dates, how students should prepare, what to do next
- Use <h2> tags for section headings, <p> for paragraphs, <ul><li> for lists
- Write in an informative, helpful tone for Indian students

Return ONLY valid JSON (no markdown, no code block):
{
  "title": "SEO-optimised headline max 80 chars",
  "summary": "2-3 sentences overview for Indian students, max 250 chars",
  "content": "<h2>Overview</h2><p>...</p><h2>Why This Matters for Students</h2><p>...</p><h2>Key Details and Dates</h2><p>...</p><h2>How to Prepare</h2><ul><li>...</li></ul><h2>What Should Students Do Next?</h2><ul><li>...</li></ul><h2>How EduNext Can Help</h2><p>...</p><p><em><strong>Disclaimer:</strong> The information in this article is compiled from various news reports. Students are strongly advised to verify all dates, cutoffs, eligibility criteria, and official procedures directly from the respective official website before taking any action.</em></p>",
  "tags": ["tag1", "tag2", "tag3"],
  "slug": "url-friendly-slug-max-60-chars"
}`;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        diagnostics.push(`${model} HTTP ${response.status}: ${err.slice(0, 120)}`);
        continue;
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) { diagnostics.push(`${model} empty response`); continue; }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { diagnostics.push(`${model} no JSON in response`); continue; }
      const parsed = JSON.parse(jsonMatch[0]);
      diagnostics.push(`${model} SUCCESS`);
      return parsed;
    } catch (e) {
      diagnostics.push(`${model} exception: ${String(e).slice(0, 80)}`);
    }
  }
  return null;
}

const CATEGORY_CONTEXT: Record<string, { advice: string; prepTips: string[]; nextSteps: string[] }> = {
  'JEE / Engineering': {
    advice: 'JEE Main and JEE Advanced are the most competitive engineering entrance exams in India, with lakhs of students appearing each year. Staying updated with the latest notifications is crucial for effective preparation.',
    prepTips: [
      'Focus on NCERT books for Physics, Chemistry, and Mathematics as the foundation',
      'Practice previous years\' question papers to understand exam patterns and frequently tested topics',
      'Take regular mock tests under timed conditions to improve speed and accuracy',
      'Keep a formula sheet for quick revision of important concepts',
      'Follow the official NTA website for exam date and admit card updates',
    ],
    nextSteps: [
      'Check the official NTA website for the latest notification and syllabus',
      'Register on the official portal if applications are open',
      'Use EduNext\'s College Finder to explore engineering colleges based on your expected JEE rank',
      'Consult EduNext\'s Percentile Predictor to estimate your rank and eligible colleges',
    ],
  },
  'NEET / Medical': {
    advice: 'NEET-UG is the single gateway for MBBS, BDS, and allied health science admissions across India. Every update from NTA and NMC can significantly impact your preparation and college choices.',
    prepTips: [
      'Biology carries the highest weightage — prioritise NCERT Biology chapters thoroughly',
      'Practice MCQs from previous NEET papers as the question style is largely NCERT-based',
      'Create a daily revision schedule covering all three subjects: Physics, Chemistry, Biology',
      'Pay close attention to NCERT diagrams and flowcharts — these are frequently tested',
      'Monitor NTA announcements regularly for any exam schedule changes',
    ],
    nextSteps: [
      'Visit the official NTA NEET portal for the latest updates and admit card downloads',
      'Check state counselling websites for NEET cutoff trends and seat availability',
      'Use EduNext to compare medical colleges based on your expected NEET score',
    ],
  },
  'MBA / CAT': {
    advice: 'CAT is the premier MBA entrance exam in India, with scores accepted by IIMs and over 1,200 B-schools. Staying on top of the latest CAT and IIM announcements gives aspirants a strategic edge in their preparation.',
    prepTips: [
      'Focus on the three CAT sections: Verbal Ability and Reading Comprehension, Data Interpretation and Logical Reasoning, and Quantitative Aptitude',
      'Read quality editorials and business articles daily to strengthen reading comprehension skills',
      'Solve Data Interpretation sets from previous CAT papers to improve speed',
      'Take full-length sectional mock tests and analyse your performance after each attempt',
      'Research IIM selection criteria including WAT-PI components well in advance',
    ],
    nextSteps: [
      'Register for CAT on the official IIM CAT portal when the window opens',
      'Research participating institutes and their individual cutoffs and selection criteria',
      'Use EduNext to compare B-schools based on placement records, fees, and specialisations',
    ],
  },
  'Boards / CBSE': {
    advice: 'CBSE board examinations are a critical milestone for Class 10 and Class 12 students. Results and exam-related updates directly impact college admissions, scholarship eligibility, and competitive exam preparation.',
    prepTips: [
      'Study from NCERT textbooks as the primary resource — CBSE board questions are largely NCERT-based',
      'Solve CBSE sample papers and previous years\' question papers for all subjects',
      'Focus on the marking scheme to understand how answers should be structured',
      'Manage your time effectively during the exam — practise within time limits',
      'For compartment or re-evaluation queries, visit the official CBSE website',
    ],
    nextSteps: [
      'Check the official CBSE website for results, marksheet downloads, and re-checking procedures',
      'Explore college options based on your Class 12 stream on EduNext\'s College Finder',
      'Research entrance exams like CUET for central university admissions',
    ],
  },
  'CLAT / Law': {
    advice: 'CLAT (Common Law Admission Test) is conducted by the Consortium of NLUs for admission to the 24 National Law Universities across India. AILET is conducted separately by NLU Delhi. Both exams demand strong command over English, current affairs, logical reasoning, and legal aptitude.',
    prepTips: [
      'Read quality newspapers daily to build current affairs knowledge — this section is heavily weighted',
      'Practise comprehension passages from the CLAT pattern: comprehension-based English and legal reasoning',
      'Solve previous CLAT and AILET papers to understand difficulty levels and question types',
      'Focus on logical reasoning — arrangement, syllogism, and analogy questions are common',
      'Stay updated with landmark Supreme Court and High Court judgments for the legal aptitude section',
    ],
    nextSteps: [
      'Visit the official Consortium of NLUs website for CLAT registration and updates',
      'Check NLU Delhi\'s official website for AILET notifications',
      'Use EduNext to compare National Law Universities based on CLAT cutoffs and placement records',
    ],
  },
  'Study Abroad': {
    advice: 'Studying abroad offers Indian students access to world-class universities, global exposure, and strong career prospects. However, navigating visa requirements, scholarship applications, and university deadlines requires careful planning well in advance.',
    prepTips: [
      'Start your English proficiency test preparation (IELTS/TOEFL) at least 6 months before your target intake',
      'Research university ranking systems like QS, THE, and US News to identify the right fit',
      'Build a strong Statement of Purpose (SOP) and Letters of Recommendation early',
      'Apply for scholarships simultaneously with university applications — many deadlines coincide',
      'Understand the visa requirements and financial documentation needed for your target country',
    ],
    nextSteps: [
      'Check official university websites for the latest application deadlines and requirements',
      'Visit the official embassy or visa portal of your target country for visa updates',
      'Use EduAbroad by EduNext to find verified universities and scholarships matching your profile',
    ],
  },
  'Govt Exams': {
    advice: 'Government examinations like UPSC Civil Services, SSC CGL, IBPS, and state PSC exams are among the most sought-after career pathways in India. Official notifications, syllabus updates, and exam dates can change — staying updated is essential for serious aspirants.',
    prepTips: [
      'Read the official notification carefully for eligibility, syllabus, and exam pattern before starting preparation',
      'Focus on NCERT books for General Studies and Current Affairs for UPSC',
      'For SSC, practise quantitative aptitude, English, and reasoning from standard guides',
      'Solve previous years\' question papers to understand the difficulty and question distribution',
      'Follow reliable current affairs sources for daily updates relevant to your exam',
    ],
    nextSteps: [
      'Bookmark the official UPSC, SSC, IBPS, or respective state PSC website for notifications',
      'Apply within the registration window — late applications are not accepted',
      'Use EduNext to explore government job-oriented courses and colleges',
    ],
  },
};

const DISCLAIMER = `<p><em><strong>Disclaimer:</strong> The information in this article has been compiled from various news reports and is intended for general awareness only. Students are strongly advised to verify all dates, cutoffs, eligibility criteria, and official procedures directly from the respective official website before taking any action.</em></p>`;

function buildRichFallback(item: RSSItem, category: string): { title: string; summary: string; content: string; tags: string[]; slug: string } {
  const slug = slugify(item.title);
  const summary = item.description.slice(0, 250) || item.title;
  const ctx = CATEGORY_CONTEXT[category] || {
    advice: 'Staying updated with the latest developments in Indian education is key to effective preparation.',
    prepTips: ['Follow official websites for the latest updates', 'Practise consistently with previous year papers', 'Manage your time effectively during preparation'],
    nextSteps: ['Visit the official exam portal for the latest notification', "Use EduNext's College Finder to explore options"],
  };

  const prepTipsList = ctx.prepTips.map((tip) => `<li>${tip}</li>`).join('');
  const nextStepsList = ctx.nextSteps.map((step) => `<li>${step}</li>`).join('');

  const content = [
    `<h2>Overview</h2>`,
    `<p>${item.title}. ${item.description ? item.description.slice(0, 400) : 'This is an important development for students across India and is expected to have a significant impact on admissions, exam schedules, and preparation strategies.'}</p>`,
    `<p>This development is particularly relevant for students preparing for ${category} exams and those planning their academic future in this domain. Understanding such updates early helps students make timely and informed decisions about their preparation and college applications.</p>`,

    `<h2>Why This Matters for Students</h2>`,
    `<p>${ctx.advice}</p>`,
    `<p>Students who stay updated with such announcements are better positioned to plan their study schedule, meet deadlines, and avoid missing out on important opportunities. Whether it is a change in exam dates, cutoff trends, or new eligibility criteria, being informed early gives you a clear competitive advantage.</p>`,

    `<h2>Key Preparation Tips for ${category.split(' / ')[0]} Aspirants</h2>`,
    `<ul>${prepTipsList}</ul>`,

    `<h2>What Should Students Do Next?</h2>`,
    `<p>Based on this update, here are the immediate steps students should take to stay ahead:</p>`,
    `<ul>${nextStepsList}</ul>`,

    `<h2>How EduNext Can Help</h2>`,
    `<p>EduNext is India's privacy-first college discovery platform that helps students find, compare, and shortlist colleges — without spam calls or biased rankings. Whether you are looking for cutoff trends, placement data, fee structures, or scholarship options, EduNext provides verified, unbiased data to help you make the right choice.</p>`,
    `<p>Use our College Finder to explore colleges matching your exam score and preferences, and our Percentile Predictor to estimate your rank and eligible colleges across India.</p>`,

    DISCLAIMER,
  ].join('');

  const tags = [...category.split(' / ').map((t) => t.trim().toLowerCase()), 'india', 'education', '2026'];
  return { title: item.title.slice(0, 80), summary, content, tags, slug };
}

async function processFeed(
  feed: { url: string; category: string; name: string },
  slugSet: Set<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  diagnostics: string[]
): Promise<string[]> {
  const saved: string[] = [];
  try {
    const rssResponse = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EduNextBot/1.0; +https://getedunext.com)' },
    });
    if (!rssResponse.ok) {
      diagnostics.push(`RSS ${feed.name} failed: ${rssResponse.status}`);
      return saved;
    }
    const xml = await rssResponse.text();
    const items = parseRSSFeed(xml);
    diagnostics.push(`${feed.name}: ${items.length} items parsed`);

    for (const item of items) {
      const baseSlug = slugify(item.title);
      if (slugSet.has(baseSlug)) {
        diagnostics.push(`Skip duplicate: ${baseSlug.slice(0, 50)}`);
        continue;
      }
      // Reserve slug immediately before any await (prevents parallel feed race condition)
      slugSet.add(baseSlug);

      // Per-article classification overrides feed.category when text signals a different bucket
      const articleCategory = classifyCategory(item.title, item.description, feed.category);
      if (articleCategory !== feed.category) {
        diagnostics.push(`Reclassified "${item.title.slice(0, 40)}" → ${articleCategory} (feed default: ${feed.category})`);
      }

      let processed = await summarizeWithGemini(item, articleCategory, diagnostics);
      if (!processed) {
        diagnostics.push(`Gemini failed for "${item.title.slice(0, 40)}" — using rich fallback`);
        processed = buildRichFallback(item, articleCategory);
      }

      const finalSlug = processed.slug || baseSlug;
      if (slugSet.has(finalSlug)) {
        diagnostics.push(`Skip slug collision: ${finalSlug.slice(0, 50)}`);
        continue;
      }
      slugSet.add(finalSlug);
      slugSet.add(baseSlug);

      const { error } = await supabase.from('edu_news').insert({
        title: processed.title,
        slug: finalSlug,
        summary: processed.summary,
        content: processed.content,
        category: articleCategory,
        tags: processed.tags,
        source_name: item.source,
        source_url: item.link,
        image_url: null,
        published_at: new Date(item.pubDate).toISOString(),
      });

      if (!error) {
        saved.push(processed.title);
        diagnostics.push(`Saved: ${processed.title.slice(0, 60)}`);
      } else {
        diagnostics.push(`Supabase insert error: ${error.message}`);
      }
    }
  } catch (err) {
    diagnostics.push(`Feed ${feed.name} exception: ${String(err).slice(0, 100)}`);
  }
  return saved;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fire-and-forget: return immediately so callers don't time out (~30-60s).
  // Vercel keeps the function alive (up to maxDuration=60) to finish the work.
  after(async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

      const { data: existingSlugs, error: slugErr } = await supabase.from('edu_news').select('slug');
    if (slugErr) console.error('Supabase slug fetch error:', slugErr.message);
    const slugSet = new Set((existingSlugs || []).map((r: { slug: string }) => r.slug));

    const diagnostics: string[] = [
      `Existing articles in DB: ${slugSet.size}`,
      `Gemini key available: ${!!GEMINI_API_KEY}`,
    ];

    // Process all feeds in PARALLEL
    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map((feed) => processFeed(feed, slugSet, supabase, diagnostics))
    );

    const savedArticles: string[] = [];
    feedResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        savedArticles.push(...result.value);
      } else {
        diagnostics.push(`Feed ${RSS_FEEDS[i].name} rejected: ${String(result.reason).slice(0, 80)}`);
      }
    });

    console.log(
      `[fetch-news] Completed: ${savedArticles.length} articles saved`,
      JSON.stringify({ articles: savedArticles, diagnostics })
    );
  });

  return NextResponse.json({
    success: true,
    message: 'News fetch started. Check Vercel logs for results.',
    geminiKeyAvailable: !!GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

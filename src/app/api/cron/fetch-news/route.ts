import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

// Try models in order until one works
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
];

const RSS_FEEDS = [
  { url: 'https://www.thehindu.com/education/feed/?format=feed&type=rss', category: 'Boards / CBSE', name: 'The Hindu Education' },
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

async function summarizeWithGemini(
  item: RSSItem,
  category: string,
  diagnostics: string[]
): Promise<{ title: string; summary: string; content: string; tags: string[]; slug: string } | null> {
  if (!GEMINI_API_KEY) {
    diagnostics.push('Gemini: no API key');
    return null;
  }

  const prompt = `You are an education news editor for EduNext (getedunext.com), India's college discovery platform.

Summarize this news for Indian students preparing for entrance exams.

Title: ${item.title}
Description: ${item.description.slice(0, 400)}
Category: ${category}
Source: ${item.source}

Return ONLY valid JSON (no markdown, no code block):
{
  "title": "Clear headline max 80 chars",
  "summary": "2-3 sentences for Indian students, max 250 chars",
  "content": "<p>Opening paragraph with key facts.</p><p>Second paragraph with context and what this means for students.</p><p>Third paragraph with actionable advice or next steps for students preparing for ${category}.</p><p>Fourth paragraph with relevant dates, cutoffs, or important numbers if available.</p>",
  "tags": ["tag1", "tag2", "tag3"],
  "slug": "url-friendly-slug-from-title-max-60-chars"
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
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        diagnostics.push(`${model} HTTP ${response.status}: ${err.slice(0, 120)}`);
        continue; // try next model
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        diagnostics.push(`${model} empty response`);
        continue;
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        diagnostics.push(`${model} no JSON in response`);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      diagnostics.push(`${model} SUCCESS`);
      return parsed;
    } catch (e) {
      diagnostics.push(`${model} exception: ${String(e).slice(0, 80)}`);
    }
  }

  return null;
}

const CATEGORY_CONTEXT: Record<string, string> = {
  'JEE / Engineering': 'JEE Main and Advanced aspirants should stay updated as exam patterns, cutoffs, and counselling schedules can change. Regular updates help in planning preparation strategy.',
  'NEET / Medical': 'NEET aspirants must track all official announcements from NMC and NTA regarding exam dates, result declarations, and counselling rounds.',
  'MBA / CAT': 'CAT and MBA aspirants should monitor IIM admission criteria, percentile cutoffs, and application deadlines across top B-schools.',
  'Boards / CBSE': 'Class 10 and 12 students should follow CBSE and state board updates for exam schedules, result dates, and marking scheme changes.',
  'CLAT / Law': 'CLAT and AILET aspirants should track NLU admission updates, legal reasoning changes, and counselling processes.',
  'Study Abroad': 'Students planning to study abroad should follow visa updates, scholarship deadlines, and university application windows.',
  'Govt Exams': 'UPSC and SSC aspirants should track notification releases, exam dates, and syllabus updates from official sources.',
  'Scholarships': 'Students should apply early and track scholarship deadlines to maximise financial aid opportunities.',
};

function buildRichFallback(item: RSSItem, category: string): { title: string; summary: string; content: string; tags: string[]; slug: string } {
  const slug = slugify(item.title);
  const summary = item.description.slice(0, 250) || item.title;
  const categoryAdvice = CATEGORY_CONTEXT[category] || 'Stay updated with the latest developments in Indian education.';

  const content = [
    `<p>${item.title}. ${item.description ? item.description.slice(0, 300) : 'This is an important development for students in India.'}</p>`,
    `<p>This update is significant for students preparing for ${category} exams. ${categoryAdvice}</p>`,
    `<p>For the most accurate and detailed information, students are advised to check the official website and the original source at ${item.source}. Keeping track of such updates ensures you never miss a critical deadline or change in exam pattern.</p>`,
    `<p>EduNext recommends that students bookmark reliable sources and set up alerts for exam-related news. Early preparation and staying informed give you a competitive edge in ${category.split(' / ')[0]} preparation.</p>`,
  ].join('');

  const tags = [
    ...category.split(' / ').map((t) => t.trim().toLowerCase()),
    'india',
    'education',
  ];

  return { title: item.title.slice(0, 80), summary, content, tags, slug };
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existingSlugs, error: slugErr } = await supabase.from('edu_news').select('slug');
  if (slugErr) console.error('Supabase slug fetch error:', slugErr.message);
  const slugSet = new Set((existingSlugs || []).map((r: { slug: string }) => r.slug));
  console.log('Existing articles in DB:', slugSet.size);

  let totalSaved = 0;
  const savedArticles: string[] = [];
  const diagnostics: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log('Fetching RSS:', feed.name);
      const rssResponse = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EduNextBot/1.0; +https://getedunext.com)' },
      });

      if (!rssResponse.ok) {
        const msg = `RSS ${feed.name} failed: ${rssResponse.status}`;
        console.error(msg);
        diagnostics.push(msg);
        continue;
      }

      const xml = await rssResponse.text();
      const items = parseRSSFeed(xml);
      diagnostics.push(`${feed.name}: ${items.length} items parsed`);

      for (const item of items) {
        const baseSlug = slugify(item.title);
        if (slugSet.has(baseSlug)) {
          console.log('Skipping duplicate:', baseSlug);
          continue;
        }

        await new Promise((resolve) => setTimeout(resolve, 600));

        let processed = await summarizeWithGemini(item, feed.category, diagnostics);
        if (!processed) {
          diagnostics.push(`Gemini unavailable for "${item.title.slice(0, 40)}" — using rich fallback`);
          processed = buildRichFallback(item, feed.category);
        }

        const finalSlug = processed.slug || baseSlug;
        if (slugSet.has(finalSlug)) continue;
        slugSet.add(finalSlug);

        const { error } = await supabase.from('edu_news').insert({
          title: processed.title,
          slug: finalSlug,
          summary: processed.summary,
          content: processed.content,
          category: feed.category,
          tags: processed.tags,
          source_name: item.source,
          source_url: item.link,
          image_url: null,
          published_at: new Date(item.pubDate).toISOString(),
        });

        if (!error) {
          totalSaved++;
          savedArticles.push(processed.title);
          console.log('Saved:', processed.title.slice(0, 60));
        } else {
          diagnostics.push(`Supabase insert error: ${error.message}`);
        }
      }
    } catch (err) {
      diagnostics.push(`Feed ${feed.name} exception: ${String(err).slice(0, 100)}`);
    }
  }

  return NextResponse.json({
    success: true,
    articlesProcessed: totalSaved,
    articles: savedArticles,
    diagnostics,
    geminiKeyAvailable: !!GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

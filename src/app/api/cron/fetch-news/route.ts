import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

const RSS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=JEE+exam+engineering+admissions+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'JEE / Engineering' },
  { url: 'https://news.google.com/rss/search?q=NEET+medical+admissions+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'NEET / Medical' },
  { url: 'https://news.google.com/rss/search?q=CAT+MBA+IIM+admissions+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'MBA / CAT' },
  { url: 'https://news.google.com/rss/search?q=CBSE+board+exams+results+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'Boards / CBSE' },
  { url: 'https://news.google.com/rss/search?q=CLAT+law+NLU+admissions+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'CLAT / Law' },
  { url: 'https://news.google.com/rss/search?q=study+abroad+international+universities+Indian+students&hl=en-IN&gl=IN&ceid=IN:en', category: 'Study Abroad' },
  { url: 'https://news.google.com/rss/search?q=AI+EdTech+education+technology+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'AI & EdTech' },
  { url: 'https://news.google.com/rss/search?q=UPSC+SSC+government+exam+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'Govt Exams' },
  { url: 'https://news.google.com/rss/search?q=scholarships+India+students+2025+2026&hl=en-IN&gl=IN&ceid=IN:en', category: 'Scholarships' },
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
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const itemXml = match[1];
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                  itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] ||
                 itemXml.match(/<guid[^>]*>(https?:\/\/[^<]*)<\/guid>/)?.[1] || '';
    const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                        itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toUTCString();
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1];
    const source = sourceMatch || (link ? new URL(link).hostname.replace('www.', '') : 'Google News');

    if (title && link) {
      items.push({ title: title.trim(), link: link.trim(), description: description.trim(), pubDate, source });
    }
  }
  return items.slice(0, 2);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function summarizeWithGemini(
  item: RSSItem,
  category: string
): Promise<{ title: string; summary: string; content: string; tags: string[]; slug: string } | null> {
  if (!GEMINI_API_KEY) return null;

  const prompt = `You are an education news editor for EduNext (getedunext.com), India's college discovery platform.

Summarize this news article for Indian students preparing for entrance exams.

Title: ${item.title}
Description: ${item.description}
Category: ${category}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Clear, engaging headline (max 80 chars)",
  "summary": "2-3 sentence summary relevant to Indian students (max 200 chars)",
  "content": "Full article in 3-4 paragraphs, well-written, relevant to Indian students preparing for ${category} exams",
  "tags": ["tag1", "tag2", "tag3"],
  "slug": "url-friendly-slug-from-title"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
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

  const { data: existingSlugs } = await supabase.from('edu_news').select('slug');
  const slugSet = new Set((existingSlugs || []).map((r: { slug: string }) => r.slug));

  let totalSaved = 0;
  const savedArticles: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const rssResponse = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 EduNextBot/1.0' },
      });
      if (!rssResponse.ok) continue;

      const xml = await rssResponse.text();
      const items = parseRSSFeed(xml);

      for (const item of items) {
        const baseSlug = slugify(item.title);
        if (slugSet.has(baseSlug)) continue;

        await new Promise((resolve) => setTimeout(resolve, 800));

        const processed = await summarizeWithGemini(item, feed.category);
        if (!processed) continue;

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
        }
      }
    } catch (err) {
      console.error(`Error processing feed ${feed.category}:`, err);
    }
  }

  if (totalSaved > 0) {
    const digestEmail = process.env.NEWS_DIGEST_EMAIL || 'goeduabroadonline@gmail.com';
    console.log(`News digest: ${totalSaved} articles saved. Email notification would go to ${digestEmail}`);
  }

  return NextResponse.json({
    success: true,
    articlesProcessed: totalSaved,
    articles: savedArticles,
    timestamp: new Date().toISOString(),
  });
}

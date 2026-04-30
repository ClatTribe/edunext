import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

// Mix of Google News RSS + direct education site RSS feeds
const RSS_FEEDS = [
  { url: 'https://www.thehindu.com/education/feed/?format=feed&type=rss', category: 'Boards / CBSE', name: 'The Hindu Education' },
  { url: 'https://feeds.feedburner.com/ndtvnews-education', category: 'Govt Exams', name: 'NDTV Education' },
  { url: 'https://indianexpress.com/section/education/feed/', category: 'JEE / Engineering', name: 'Indian Express Education' },
  { url: 'https://www.hindustantimes.com/feeds/rss/education/rssfeed.xml', category: 'NEET / Medical', name: 'HT Education' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms', category: 'MBA / CAT', name: 'TOI Education' },
  { url: 'https://news.google.com/rss/search?q=JEE+2025+2026+exam+results+cutoff&hl=en-IN&gl=IN&ceid=IN:en', category: 'JEE / Engineering', name: 'Google News JEE' },
  { url: 'https://news.google.com/rss/search?q=NEET+2025+2026+results+counselling&hl=en-IN&gl=IN&ceid=IN:en', category: 'NEET / Medical', name: 'Google News NEET' },
  { url: 'https://news.google.com/rss/search?q=CLAT+2025+law+NLU+admissions&hl=en-IN&gl=IN&ceid=IN:en', category: 'CLAT / Law', name: 'Google News CLAT' },
  { url: 'https://news.google.com/rss/search?q=study+abroad+scholarship+Indian+students+2025&hl=en-IN&gl=IN&ceid=IN:en', category: 'Study Abroad', name: 'Google News Study Abroad' },
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
  const itemMatches = xml.matchAll(/<item[^>]*>([sS]*?)</item>/g);

  for (const match of itemMatches) {
    const itemXml = match[1];
    const title =
      itemXml.match(/<title><![CDATA[(.*?)]]></title>/s)?.[1] ||
      itemXml.match(/<title[^>]*>(.*?)</title>/s)?.[1] || '';
    const link =
      itemXml.match(/<link>(https?://[^<s]+)/)?.[1] ||
      itemXml.match(/<guid[^>]*>(https?://[^<]+)</guid>/)?.[1] ||
      itemXml.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
    const description =
      itemXml.match(/<description><![CDATA[([sS]*?)]]></description>/)?.[1] ||
      itemXml.match(/<description[^>]*>([sS]*?)</description>/)?.[1] || '';
    const pubDate = itemXml.match(/<pubDate>(.*?)</pubDate>/)?.[1] || new Date().toUTCString();
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)</source>/)?.[1];
    let source = sourceMatch || '';
    if (!source && link) {
      try { source = new URL(link).hostname.replace('www.', ''); } catch { source = 'News'; }
    }

    const cleanTitle = title.trim().replace(/<[^>]+>/g, '');
    if (cleanTitle && link) {
      items.push({ title: cleanTitle, link: link.trim(), description: description.trim().replace(/<[^>]+>/g, '').slice(0, 500), pubDate, source });
    }
  }
  return items.slice(0, 2);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

async function summarizeWithGemini(item: RSSItem, category: string): Promise<{ title: string; summary: string; content: string; tags: string[]; slug: string } | null> {
  if (!GEMINI_API_KEY) {
    console.log('No Gemini API key found');
    return null;
  }

  const prompt = `You are an education news editor for EduNext (getedunext.com), India's college discovery platform.

Summarize this news for Indian students preparing for entrance exams.

Title: ${item.title}
Description: ${item.description.slice(0, 300)}
Category: ${category}

Return ONLY valid JSON:
{
  "title": "Clear headline max 80 chars",
  "summary": "2-3 sentences for Indian students max 200 chars",
  "content": "3-4 paragraphs relevant to ${category} students",
  "tags": ["tag1", "tag2", "tag3"],
  "slug": "url-friendly-slug"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }),
      }
    );
    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', response.status, err.slice(0, 200));
      return null;
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.error('No JSON in Gemini response:', text.slice(0, 100)); return null; }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Gemini exception:', String(e));
    return null;
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
        signal: AbortSignal.timeout(8000),
      });

      if (!rssResponse.ok) {
        const msg = `RSS ${feed.name} failed: ${rssResponse.status}`;
        console.error(msg);
        diagnostics.push(msg);
        continue;
      }

      const xml = await rssResponse.text();
      const items = parseRSSFeed(xml);
      console.log(`RSS ${feed.name}: ${items.length} items parsed`);
      diagnostics.push(`${feed.name}: ${items.length} items`);

      for (const item of items) {
        const baseSlug = slugify(item.title);
        if (slugSet.has(baseSlug)) { console.log('Skipping duplicate:', baseSlug); continue; }

        await new Promise((resolve) => setTimeout(resolve, 800));

        const processed = await summarizeWithGemini(item, feed.category);
        if (!processed) { console.log('Gemini returned null for:', item.title.slice(0, 50)); continue; }

        const finalSlug = processed.slug || baseSlug;
        if (slugSet.has(finalSlug)) continue;
        slugSet.add(finalSlug);

        const { error } = await supabase.from('edu_news').insert({
          title: processed.title, slug: finalSlug, summary: processed.summary,
          content: processed.content, category: feed.category, tags: processed.tags,
          source_name: item.source, source_url: item.link, image_url: null,
          published_at: new Date(item.pubDate).toISOString(),
        });

        if (!error) { totalSaved++; savedArticles.push(processed.title); console.log('Saved:', processed.title.slice(0, 60)); }
        else { console.error('Supabase insert error:', error.message); }
      }
    } catch (err) {
      const msg = `Feed ${feed.name} exception: ${String(err).slice(0, 100)}`;
      console.error(msg);
      diagnostics.push(msg);
    }
  }

  return NextResponse.json({ success: true, articlesProcessed: totalSaved, articles: savedArticles, diagnostics, timestamp: new Date().toISOString() });
}

/**
 * EduNext Magazine — Daily auto-publish cron endpoint.
 *
 * Deploy to: src/app/api/cron/publish-magazine/route.ts
 *
 * Trigger:
 *   GET  https://www.getedunext.com/api/cron/publish-magazine?secret=edunext-news-cron-2026
 *
 * What it does on every call:
 *   1. Pick today's topic — first try the latest hot news (edu_news where
 *      is_magazine=false, published in last 48h, not yet expanded into a
 *      magazine piece). If nothing fresh, fall back to the evergreen
 *      topic bank, rotating through the 4 categories by day-of-year.
 *   2. Generate the article via Gemini with humanizer pass.
 *   3. Insert into edu_news with is_magazine=true.
 *   4. Log the topic_key to magazine_topic_history so we never repeat.
 *   5. Return success JSON.
 *
 * Idempotency: if the slug already exists, retries with a date suffix.
 *
 * Failure modes (all logged, all return 500 with details):
 *   - Gemini API down / rate-limited
 *   - Supabase down
 *   - Topic bank exhausted (resets after all topics used once)
 *
 * This route is meant to be called once per day by a scheduled task.
 * Vercel cron / GitHub Actions / Cowork scheduled task all work.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  MAGAZINE_TOPIC_BANK,
  pickEvergreenTopic,
  type MagazineTopic,
} from '../../../lib/magazine/topic-bank';
import {
  generateMagazineArticle,
} from '../../../lib/magazine/article-generator';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

// =====================================================================
// 1. Topic selection — news first, evergreen fallback
// =====================================================================
async function pickTodaysTopic(
  supabase: any
): Promise<{ topic: MagazineTopic; sourceType: 'news' | 'evergreen' }> {
  // 1a. Look for fresh news (last 48h) that hasn't been turned into magazine yet
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: freshNews } = await supabase
    .from('edu_news')
    .select('id, title, slug, summary, category, tags, source_name, source_url')
    .eq('is_magazine', false)
    .gte('published_at', since)
    .in('category', ['JEE / Engineering', 'NEET / Medical', 'CLAT / Law', 'MBA / CAT'])
    .order('published_at', { ascending: false })
    .limit(5);

  if (freshNews && freshNews.length > 0) {
    // Pick the most recent and convert to a MagazineTopic shape
    const n = freshNews[0] as {
      title: string;
      slug: string;
      summary: string;
      category: string;
      tags: string[];
    };
    return {
      sourceType: 'news',
      topic: {
        topic_key: `news:${n.slug}`,
        category: n.category as MagazineTopic['category'],
        title_template: `Magazine deep-dive: ${n.title}`,
        angle: `Take the news event "${n.summary}" and turn it into a forward-looking analysis with student impact, decision frameworks, and what comes next. Add depth that the news ticker version did not have.`,
        target_keyword: (n.tags && n.tags[0]) || n.title.split(' ').slice(0, 4).join(' '),
        intent: 'informational',
        gen_z_hook: 'The news told you what happened. We tell you what to do about it.',
        internal_links: ['/find-colleges', '/news', '/'],
      },
    };
  }

  // 1b. Evergreen fallback
  const { data: usedRows } = await supabase
    .from('magazine_topic_history')
    .select('topic_key');
  const usedKeys: Set<string> = new Set<string>((usedRows || []).map((r: { topic_key: string }) => r.topic_key));

  const dayOfYear = Math.floor(
    (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000
  );

  const topic = pickEvergreenTopic(dayOfYear, usedKeys);
  if (!topic) {
    // every topic in the bank has been used — reset history and pick again
    await supabase.from('magazine_topic_history').delete().neq('id', 0);
    const fresh = pickEvergreenTopic(dayOfYear, new Set());
    if (!fresh) throw new Error('Topic bank is empty');
    return { topic: fresh, sourceType: 'evergreen' };
  }
  return { topic, sourceType: 'evergreen' };
}

// =====================================================================
// 2. Slug deduper
// =====================================================================
async function ensureUniqueSlug(
  supabase: any,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  while (true) {
    const { data } = await supabase
      .from('edu_news')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
    if (counter > 5) {
      slug = `${baseSlug}-${new Date().toISOString().slice(0, 10)}`;
      return slug;
    }
  }
}

// =====================================================================
// 3. Health check
// =====================================================================
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // optional dry-run: ?dry=true returns the picked topic without publishing
  const dryRun = request.nextUrl.searchParams.get('dry') === 'true';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { success: false, error: 'GEMINI_API_KEY missing in env' },
      { status: 500 }
    );
  }

  try {
    const { topic, sourceType } = await pickTodaysTopic(supabase);
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        picked_topic: topic,
        source_type: sourceType,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Generate article
    const article = await generateMagazineArticle(topic, {
      geminiApiKey: geminiKey,
      unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    });

    // 5. Ensure unique slug
    const slug = await ensureUniqueSlug(supabase, article.slug);

    // 6. Insert into edu_news
    const row = {
      title: article.title,
      slug,
      summary: article.summary,
      magazine_subtitle: article.magazine_subtitle,
      content: article.content,
      category: article.category,
      tags: article.tags,
      hero_image: article.hero_image,
      image_url: article.hero_image,
      read_time: article.read_time,
      toc: article.toc,
      faqs: article.faqs,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      source_name: article.source_name,
      source_url: article.source_url,
      is_magazine: true,
      featured: false,
      author_name: article.author_name,
      humanizer_passed: article.humanizer_passed,
      published_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from('edu_news')
      .insert(row)
      .select('id, slug, title, category, published_at')
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message, code: insertError.code, stage: 'insert' },
        { status: 500 }
      );
    }

    // 7. Log topic to history
    await supabase.from('magazine_topic_history').upsert(
      {
        topic_key: topic.topic_key,
        category: topic.category,
        used_for_slug: slug,
      },
      { onConflict: 'topic_key' }
    );

    return NextResponse.json({
      success: true,
      article: inserted,
      url: `https://www.getedunext.com/magazine/${slug}`,
      source_type: sourceType,
      humanizer_passed: article.humanizer_passed,
      read_time: article.read_time,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { success: false, error: err.message, stack: err.stack?.split('\n').slice(0, 3) },
      { status: 500 }
    );
  }
}

// =====================================================================
// POST = same as GET (for Vercel cron compatibility)
// =====================================================================
export async function POST(request: NextRequest) {
  return GET(request);
}

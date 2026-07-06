import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// One-shot manual publish for hand-written articles (CBSE results,
// scholarship announcements, special features). Reuses the same secret
// as /api/cron/fetch-news.
//
// Deploy to: src/app/api/admin/publish-article/route.ts
//
// Usage:
//   POST /api/admin/publish-article?secret=edunext-news-cron-2026
//   body: { title, slug, summary, content, category, tags, source_name,
//           source_url, image_url?, published_at? }
//
//   GET  /api/admin/publish-article?secret=edunext-news-cron-2026
//        -> health check ({ok:true})

export const maxDuration = 30;

const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

const ALLOWED_CATEGORIES = new Set([
  'JEE / Engineering',
  'NEET / Medical',
  'CLAT / Law',
  'MBA / CAT',
  'Boards / CBSE',
  'Govt Exams',
  'Scholarships',
  'Study Abroad',
  'AI & EdTech',
]);

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, endpoint: 'publish-article', method: 'POST' });
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const required = ['title', 'slug', 'summary', 'content', 'category'];
  for (const k of required) {
    if (!body[k] || typeof body[k] !== 'string') {
      return NextResponse.json({ error: `Missing or invalid field: ${k}` }, { status: 400 });
    }
  }

  const category = body.category as string;
  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: `Invalid category. Allowed: ${[...ALLOWED_CATEGORIES].join(', ')}` },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const row = {
    title: body.title as string,
    slug: body.slug as string,
    summary: body.summary as string,
    content: body.content as string,
    category,
    tags: Array.isArray(body.tags) ? body.tags : [],
    source_name: (body.source_name as string) || 'EduNext Editorial',
    source_url: (body.source_url as string) || 'https://www.getedunext.com/news',
    image_url: (body.image_url as string) || null,
    published_at: (body.published_at as string) || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('edu_news')
    .insert(row)
    .select('id, slug, title, category, published_at')
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    article: data,
    url: `https://www.getedunext.com/news/${row.slug}`,
    timestamp: new Date().toISOString(),
  });
}

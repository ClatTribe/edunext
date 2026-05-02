import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// One-shot backfill: re-runs the per-article category classifier over every
// existing row in edu_news and updates rows whose stored category disagrees
// with what the classifier would assign now. Safe to run repeatedly — only
// rows that need to change get updated.
//
// Usage:
//   GET /api/admin/recategorize?secret=edunext-news-cron-2026
//   GET /api/admin/recategorize?secret=...&dryRun=1   (preview, no writes)
//
// Reuses the same secret as the cron endpoint to avoid yet another env var.

export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';

// Same router logic as src/app/api/cron/fetch-news/route.ts. Keep these two
// in sync — if you change classifyCategory there, mirror it here.
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

interface NewsRow {
  id: string;
  title: string;
  summary: string | null;
  category: string;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: rows, error: readErr } = await supabase
    .from('edu_news')
    .select('id, title, summary, category');

  if (readErr) {
    return NextResponse.json({ error: 'Read failed', detail: readErr.message }, { status: 500 });
  }

  const total = rows?.length ?? 0;
  const changes: Array<{ id: string; title: string; from: string; to: string }> = [];
  const errors: string[] = [];

  for (const row of (rows as NewsRow[] | null) ?? []) {
    const want = classifyCategory(row.title || '', row.summary || '', row.category);
    if (want !== row.category) {
      changes.push({
        id: row.id,
        title: (row.title || '').slice(0, 60),
        from: row.category,
        to: want,
      });

      if (!dryRun) {
        const { error: upErr } = await supabase
          .from('edu_news')
          .update({ category: want })
          .eq('id', row.id);
        if (upErr) errors.push(`${row.id}: ${upErr.message}`);
      }
    }
  }

  // Distribution after the run (for the response only — doesn't reflect writes if dryRun)
  const distAfter: Record<string, number> = {};
  for (const row of (rows as NewsRow[] | null) ?? []) {
    const cat = changes.find((c) => c.id === row.id)?.to ?? row.category;
    distAfter[cat] = (distAfter[cat] || 0) + 1;
  }

  return NextResponse.json({
    success: true,
    dryRun,
    total,
    changedCount: changes.length,
    distributionAfter: distAfter,
    sample: changes.slice(0, 25),
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}

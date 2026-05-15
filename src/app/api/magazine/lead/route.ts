/**
 * EduNext Magazine — lead capture endpoint.
 *
 * Deploy to: src/app/api/magazine/lead/route.ts
 *
 * POST /api/magazine/lead
 * body: { name, phone, exam?, source_slug?, source_category? }
 *
 * - Inserts into magazine_leads
 * - Triggers an internal WhatsApp alert via WhatsApp Business deep link
 *   (logs the link; team picks up from CRM dashboard)
 * - Returns { success: true, id }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 10;

const ALLOWED_EXAMS = new Set(['JEE', 'NEET', 'CLAT', 'CAT', 'IPMAT', 'CUET', 'OTHER']);

function clean(s: unknown, max = 200): string | null {
  if (typeof s !== 'string') return null;
  const t = s.trim().slice(0, max);
  return t.length > 0 ? t : null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20)?.replace(/\D/g, '') || null;
  const exam = clean(body.exam, 10);
  const sourceSlug = clean(body.source_slug, 200);
  const sourceCategory = clean(body.source_category, 80);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'name required (min 2 chars)' }, { status: 400 });
  }
  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'valid phone required (min 10 digits)' }, { status: 400 });
  }
  if (exam && !ALLOWED_EXAMS.has(exam)) {
    return NextResponse.json({ error: `exam must be one of ${[...ALLOWED_EXAMS].join(', ')}` }, { status: 400 });
  }

  // UTMs from referrer
  const ref = request.headers.get('referer') || '';
  let utmSource: string | null = null;
  let utmMedium: string | null = null;
  let utmCampaign: string | null = null;
  try {
    const u = new URL(ref);
    utmSource = u.searchParams.get('utm_source');
    utmMedium = u.searchParams.get('utm_medium');
    utmCampaign = u.searchParams.get('utm_campaign');
  } catch {
    /* ignore */
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('magazine_leads')
    .insert({
      name,
      phone,
      exam,
      source_slug: sourceSlug,
      source_category: sourceCategory,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: request.headers.get('user-agent') || null,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: 500 }
    );
  }

  // Internal counsellor alert — logs a WhatsApp deep link for the
  // counsellor team to pick up. They can also see leads in Supabase Studio.
  const counsellorMsg = encodeURIComponent(
    `New EduNext Magazine lead\n\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Exam: ${exam || '—'}\n` +
    `Article: ${sourceSlug || '—'}\n` +
    `Category: ${sourceCategory || '—'}`
  );
  const waLink = `https://wa.me/?text=${counsellorMsg}`;

  // (Optional) you can POST this to a Slack webhook here if you have one.
  // For now we just log it for Vercel logs.
  console.log('[magazine_leads] new lead', { id: data.id, waLink });

  return NextResponse.json({
    success: true,
    id: data.id,
  });
}

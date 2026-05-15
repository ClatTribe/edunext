/**
 * MagazineLeadForm — sticky sidebar lead-capture widget.
 *
 * Used on /magazine/[slug] pages.
 * Minimal: name + phone + exam dropdown. Submits to /api/magazine/lead.
 *
 * Design: warm, Gen Z friendly, EduNext red (#af0100) brand,
 * sits in sticky sidebar, mobile-first.
 */

'use client';

import { useState } from 'react';

interface Props {
  sourceSlug?: string;
  sourceCategory?: string;
}

const EXAMS = [
  { value: 'JEE', label: 'JEE / Engineering' },
  { value: 'NEET', label: 'NEET / Medical' },
  { value: 'CLAT', label: 'CLAT / Law' },
  { value: 'CAT', label: 'CAT / MBA' },
  { value: 'IPMAT', label: 'IPMAT / BBA' },
  { value: 'CUET', label: 'CUET / Other UG' },
  { value: 'OTHER', label: 'Still figuring out' },
];

export default function MagazineLeadForm({ sourceSlug, sourceCategory }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [exam, setExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // basic client-side validation
    if (!name.trim() || name.trim().length < 2) {
      setError('Drop your name first');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('That phone number looks short');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/magazine/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          exam: exam || null,
          source_slug: sourceSlug || null,
          source_category: sourceCategory || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submit failed (${res.status})`);
      }
      setDone(true);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <aside className="sticky top-24 rounded-2xl border border-white/10 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-6 backdrop-blur-sm">
        <div className="text-center">
          <div className="mb-3 text-4xl">✓</div>
          <h3 className="mb-2 text-lg font-bold text-white">You are in.</h3>
          <p className="text-sm text-slate-300">
            Our counsellor will WhatsApp you in the next 24 hours. No spam calls.
            Promise.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-24 rounded-2xl border border-white/10 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-6 backdrop-blur-sm">
      <div className="mb-4">
        <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
          Free counselling
        </span>
      </div>
      <h3 className="mb-1 text-xl font-bold leading-tight text-white">
        Confused which college to pick?
      </h3>
      <p className="mb-4 text-sm text-slate-400">
        Talk to a real counsellor. 15 minutes. No spam calls. No selling.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-rose-500"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (we WhatsApp you)"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-rose-500"
          required
        />
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-rose-500"
        >
          <option value="">Pick your exam (optional)</option>
          {EXAMS.map((ex) => (
            <option key={ex.value} value={ex.value} className="bg-slate-900">
              {ex.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Get Free Counselling →'}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-slate-500">
          We do not sell your data. We do not spam call you.
          <br />
          One human. One conversation. That is it.
        </p>
      </form>
    </aside>
  );
}

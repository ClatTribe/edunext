/**
 * ArticleRightSidebar — right rail on magazine article pages.
 *
 * Deploy to: components/magazine/ArticleRightSidebar.tsx
 *
 * Width: 280px on lg, 320px on xl (matches /blogs sidebar pattern lg:w-80 xl:w-96-ish).
 * Hidden below lg.
 *
 * Three sections:
 *   A) Table of Contents — h2-only, scroll-spy via IntersectionObserver
 *   B) Free Counselling form — name + phone + exam, posts to /api/magazine/lead
 *   C) Related Articles
 */

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { categoryTone } from './categoryTone';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface RelatedArticle {
  id: number | string;
  slug: string;
  title: string;
  category: string;
}

interface Props {
  toc: TocItem[];
  related: RelatedArticle[];
  sourceSlug?: string;
  sourceCategory?: string;
}

const EXAMS = [
  { value: '', label: 'Pick exam' },
  { value: 'JEE', label: 'JEE' },
  { value: 'NEET', label: 'NEET' },
  { value: 'CLAT', label: 'CLAT' },
  { value: 'CAT', label: 'CAT' },
  { value: 'IPMAT', label: 'IPMAT' },
  { value: 'CUET', label: 'CUET' },
  { value: 'OTHER', label: 'Other' },
];

export default function ArticleRightSidebar({
  toc,
  related,
  sourceSlug,
  sourceCategory,
}: Props) {
  const [activeId, setActiveId] = useState<string>('');

  // Scroll-spy: highlight the TOC item whose heading is currently in view
  useEffect(() => {
    if (!toc || toc.length === 0) return;
    const filteredToc = toc.filter((t) => t.level === 2);
    const headings: HTMLElement[] = filteredToc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -65% 0px',
        threshold: [0, 1],
      }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  const tocH2 = (toc || []).filter((t) => t.level === 2);

  return (
    <aside
      className="hidden h-full shrink-0 overflow-y-auto lg:block lg:w-72 xl:w-80"
      style={{
        backgroundColor: '#050818',
        borderLeft: '1px solid #1e293b',
      }}
    >
      <div className="flex flex-col gap-8 px-5 py-6 xl:px-6">
        {/* Section A — Table of Contents */}
        {tocH2.length > 0 && (
          <nav>
            <div
              className="mb-4 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#475569' }}
            >
              On this page
            </div>
            <ul className="flex flex-col" style={{ gap: 2 }}>
              {tocH2.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        display: 'block',
                        padding: '6px 12px',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: isActive ? '#10b981' : '#94a3b8',
                        borderLeft: isActive
                          ? '2px solid #10b981'
                          : '1px solid #1e293b',
                        fontWeight: isActive ? 600 : 400,
                        textDecoration: 'none',
                        transition: 'color 120ms ease',
                      }}
                    >
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Section B — Free Counselling */}
        <CounsellingCard
          sourceSlug={sourceSlug}
          sourceCategory={sourceCategory}
        />

        {/* Section C — Related Articles */}
        {related && related.length > 0 && (
          <section>
            <div
              className="mb-4 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#475569' }}
            >
              Related
            </div>
            <ul className="flex flex-col">
              {related.map((r) => {
                const tone = categoryTone(r.category);
                return (
                  <li
                    key={r.id}
                    style={{ borderBottom: '1px solid #1e293b' }}
                  >
                    <Link
                      href={`/magazine/${r.slug}`}
                      className="block py-4"
                      style={{ textDecoration: 'none' }}
                    >
                      <span
                        className="mb-2 inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: tone.text,
                          backgroundColor: tone.bg,
                          border: `1px solid ${tone.border}`,
                          borderRadius: 4,
                          lineHeight: 1.3,
                        }}
                      >
                        {tone.label}
                      </span>
                      <div
                        style={{
                          color: '#cbd5e1',
                          fontSize: 14,
                          lineHeight: 1.5,
                          marginTop: 4,
                          fontWeight: 500,
                        }}
                      >
                        {r.title}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

// =====================================================================
// Counselling card
// =====================================================================
function CounsellingCard({
  sourceSlug,
  sourceCategory,
}: {
  sourceSlug?: string;
  sourceCategory?: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [exam, setExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError('Name?');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return setError('Phone too short');
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
        throw new Error(body.error || 'Submit failed');
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 10,
          padding: 18,
        }}
      >
        <div
          className="mb-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: '#10b981' }}
        >
          ✓ Sent
        </div>
        <div className="text-sm font-semibold text-white">
          A counsellor will WhatsApp you in 24 hours.
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 10,
        padding: 18,
      }}
    >
      <div
        className="mb-2 text-xs font-bold uppercase tracking-wider"
        style={{ color: '#10b981' }}
      >
        Free Counselling
      </div>
      <div className="text-base font-semibold leading-snug text-white">
        Confused which college?
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
        Talk to a real counsellor. 15 min. No spam.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-sm text-white placeholder-slate-500"
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '9px 11px',
            outline: 'none',
          }}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full text-sm text-white placeholder-slate-500"
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '9px 11px',
            outline: 'none',
          }}
        />
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="w-full text-sm text-white"
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '9px 11px',
            outline: 'none',
          }}
        >
          {EXAMS.map((ex) => (
            <option key={ex.value} value={ex.value}>
              {ex.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-semibold"
          style={{
            backgroundColor: '#f59e0b',
            color: '#050818',
            borderRadius: 6,
            padding: '10px 12px',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending…' : 'Get Free Counselling'}
        </button>
        <div className="mt-1 text-center text-[11px] leading-relaxed text-slate-600">
          One human · One call · No selling
        </div>
      </form>
    </section>
  );
}

/**
 * ArticleRightSidebar — 186px fixed-width right rail on magazine article pages.
 *
 * Deploy to: components/magazine/ArticleRightSidebar.tsx
 *
 * Three sections:
 *   A) Table of Contents — scroll-spy via IntersectionObserver
 *   B) Free Counselling form — minimal name + phone + exam, posts to /api/magazine/lead
 *   C) Related Articles
 *
 * Brand tokens:
 *   - bg            #050818
 *   - surface       #0f172a
 *   - card          #1a1f2e
 *   - border        #1e293b
 *   - amber CTA     #f59e0b
 *   - green active  #10b981
 *   - text-muted    #64748b
 *   - text-very-dim #334155
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

  // Scroll-spy: mark TOC item active when its corresponding heading is in view
  useEffect(() => {
    if (!toc || toc.length === 0) return;
    const headings: HTMLElement[] = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among intersecting entries, pick the topmost
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 1],
      }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <aside
      className="hidden h-full shrink-0 overflow-y-auto lg:block"
      style={{
        width: 186,
        backgroundColor: '#050818',
        borderLeft: '1px solid #1e293b',
      }}
    >
      <div className="flex flex-col gap-7 p-4">
        {/* Section A — Table of Contents */}
        {toc && toc.length > 0 && (
          <nav>
            <div
              className="mb-3 uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              On this page
            </div>
            <ul className="flex flex-col" style={{ gap: 1 }}>
              {toc.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        display: 'block',
                        padding: '5px 10px',
                        fontSize: 11,
                        lineHeight: 1.4,
                        color: isActive ? '#10b981' : '#64748b',
                        borderLeft: isActive
                          ? '2px solid #10b981'
                          : '1px solid #1e293b',
                        fontWeight: isActive ? 500 : 400,
                        textDecoration: 'none',
                        marginLeft: item.level === 3 ? 8 : 0,
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
              className="mb-3 uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: '#334155',
                fontWeight: 600,
              }}
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
                      className="block py-3"
                      style={{ textDecoration: 'none' }}
                    >
                      <span
                        className="mb-1.5 inline-block uppercase"
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          color: tone.text,
                          backgroundColor: tone.bg,
                          border: `1px solid ${tone.border}`,
                          borderRadius: 4,
                          padding: '2px 6px',
                          lineHeight: 1.3,
                        }}
                      >
                        {tone.label}
                      </span>
                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize: 11,
                          lineHeight: 1.5,
                          marginTop: 4,
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
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div
          className="mb-1 uppercase"
          style={{
            color: '#10b981',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          ✓ Sent
        </div>
        <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>
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
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div
        className="mb-1 uppercase"
        style={{
          color: '#10b981',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Free Counselling
      </div>
      <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>
        Confused which college?
      </div>
      <p style={{ color: '#475569', fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>
        Talk to a real counsellor. 15 min. No spam.
      </p>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: 11,
            outline: 'none',
          }}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: 11,
            outline: 'none',
          }}
        />
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: 11,
            outline: 'none',
          }}
        >
          {EXAMS.map((ex) => (
            <option key={ex.value} value={ex.value}>
              {ex.label}
            </option>
          ))}
        </select>
        {error && <p style={{ color: '#f43f5e', fontSize: 10 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#f59e0b',
            color: '#050818',
            fontWeight: 600,
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 11,
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending…' : 'Get Free Counselling'}
        </button>
        <div
          className="text-center"
          style={{ color: '#334155', fontSize: 10, lineHeight: 1.5, marginTop: 2 }}
        >
          One human · One call · No selling
        </div>
      </form>
    </section>
  );
}

/**
 * MagazineArticleView — client-side layout shell for magazine article pages.
 *
 * Deploy to: src/app/magazine/[slug]/MagazineArticleView.tsx
 *
 * Typography matches the existing /blogs/[slug] page exactly so the
 * magazine feels like a first-class citizen of the EduNext site:
 *
 *   - Headings: Montserrat, font-bold, white
 *   - Body: Tailwind Typography prose prose-lg prose-invert
 *   - Links: amber
 *
 * Layout:
 *
 *   ┌─── DefaultLayout ────────────────────────────────────────────┐
 *   │ ┌────────┐ ┌─────────────────────────────────────────────┐  │
 *   │ │ Sidebar│ │ ArticleHero                                 │  │
 *   │ │        │ ├──────────────────────────────────────┬──────┤  │
 *   │ │        │ │ Body (prose prose-lg prose-invert)   │ Side │  │
 *   │ │        │ │                                      │ rail │  │
 *   │ │        │ │                                      │ 186px│  │
 *   │ └────────┘ └──────────────────────────────────────┴──────┘  │
 *   └──────────────────────────────────────────────────────────────┘
 */

'use client';

import DefaultLayout from '../../defaultLayout';
import ArticleHero from '../../../../components/magazine/ArticleHero';
import ArticleRightSidebar from '../../../../components/magazine/ArticleRightSidebar';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { categoryTone } from '../../../../components/magazine/categoryTone';
import { User, Linkedin } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Faq {
  question: string;
  answer: string;
}

interface ArticleData {
  id: number | string;
  slug: string;
  title: string;
  summary: string;
  magazine_subtitle: string | null;
  content: string;
  category: string;
  tags: string[];
  hero_image: string | null;
  read_time: number | null;
  author_name: string;
  toc: TocItem[];
  faqs: Faq[];
  published_at: string;
}

interface RelatedArticle {
  id: number | string;
  slug: string;
  title: string;
  category: string;
}

interface Props {
  article: ArticleData;
  related: RelatedArticle[];
}

export default function MagazineArticleView({ article, related }: Props) {
  const initials = (article.author_name || 'EduNext')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const shareUrl = `https://www.getedunext.com/magazine/${article.slug}`;

  return (
    <DefaultLayout>
      <div className="flex flex-col" style={{ backgroundColor: '#050818' }}>
        <ArticleHero
          title={article.title}
          subtitle={article.magazine_subtitle || article.summary}
          category={article.category}
          readTime={article.read_time}
          publishedAt={article.published_at}
          heroImage={article.hero_image}
        />
        <div className="flex flex-col lg:flex-row w-full">
          {/* Article column */}
          <div className="flex-1">
            <article className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
            {/* Author + share row */}
            <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981',
                  }}
                >
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white md:text-base">
                    {article.author_name}
                  </span>
                  <span className="text-xs text-slate-500 md:text-sm">
                    EduNext Magazine
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareIcon
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`}
                  label="X"
                >
                  𝕏
                </ShareIcon>
                <ShareIcon
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  label="LinkedIn"
                >
                  in
                </ShareIcon>
                <CopyLinkButton url={shareUrl} />
              </div>
            </div>

            {/* TL;DR callout */}
            <div
              className="mb-10 rounded-r-lg border-l-4 px-5 py-4"
              style={{
                backgroundColor: '#0f172a',
                borderLeftColor: '#10b981',
              }}
            >
              <div
                className="mb-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: '#10b981' }}
              >
                TL;DR
              </div>
              <p className="text-base leading-relaxed text-slate-300">
                {article.summary}
              </p>
            </div>

            {/* Body — Tailwind Typography matches /blogs/[slug] page exactly */}
            <div
              className="
                prose prose-lg prose-invert max-w-none
                prose-headings:font-montserrat prose-headings:font-bold prose-headings:text-white prose-headings:mt-10 prose-headings:mb-4
                prose-h1:text-3xl prose-h1:md:text-4xl
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-slate-700 prose-h2:pb-2 prose-h2:scroll-mt-24
                prose-h3:text-xl prose-h3:md:text-2xl prose-h3:scroll-mt-24
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-[#f59e0b] prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-[#d97706]
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-slate-400
                prose-ul:my-5 prose-ol:my-5 prose-ul:text-slate-300 prose-ol:text-slate-300
                prose-li:text-slate-300 prose-li:leading-relaxed prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-[#10b981] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400 prose-blockquote:my-6
                prose-code:text-[#f59e0b] prose-code:bg-[#0f172a] prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-table:my-6 prose-table:w-full
                prose-th:border prose-th:border-slate-800 prose-th:px-4 prose-th:py-3 prose-th:bg-[#0f172a] prose-th:text-white prose-th:font-semibold prose-th:text-left
                prose-td:border prose-td:border-slate-800 prose-td:px-4 prose-td:py-3 prose-td:text-slate-300
                prose-img:rounded-lg
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-slate-800 pt-8">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.12)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Author, Form, and Related Articles */}
            <div className="mt-16 pt-10 border-t border-slate-800 flex flex-col items-center max-w-xl mx-auto w-full">
              
              {/* About the Author Section */}
              <div className="w-full mb-12">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/30">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-white font-bold text-lg">About the author</h3>
                </div>

                <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#0f172a] relative">
                  <a 
                    href="https://www.linkedin.com/in/eashishm/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute top-5 sm:top-6 right-5 sm:right-6 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-white/5 hover:bg-white/10 transition-colors text-xs text-slate-300 font-semibold"
                  >
                    <Linkedin size={14} />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    <img 
                      src="/ashish_sir.png" 
                      alt="Ashish Sharma" 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0" 
                    />
                    <div className="pr-0 sm:pr-24">
                      <h4 className="text-white font-bold text-lg">Ashish Sharma</h4>
                      <div className="text-red-400 font-semibold text-xs mb-3 uppercase tracking-wider">Founder, EduNext</div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Ashish Sir is a distinguished alumnus of IIIT and IIT Bombay. With five years of experience at Google and a strong entrepreneurial spirit, he brings deep technical expertise and innovative vision to advancing education technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counselling Form */}
              <div className="w-full mb-12">
                <CounsellingCard sourceSlug={article.slug} sourceCategory={article.category} />
              </div>
              
              {related && related.length > 0 && (
                <div className="w-full">
                  <div className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">
                    Related Articles
                  </div>
                  <ul className="flex flex-col">
                    {related.map((r) => {
                      const tone = categoryTone(r.category);
                      return (
                        <li key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <Link
                            href={`/magazine/${r.slug}`}
                            className="block py-4 hover:bg-[#0f172a]/50 transition-colors px-2 rounded-lg"
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
                            <div className="text-slate-200 text-base font-semibold leading-snug">
                              {r.title}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Right rail */}
        <ArticleRightSidebar
          toc={article.toc || []}
          related={related}
          sourceSlug={article.slug}
          sourceCategory={article.category}
        />
      </div>
      </div>
    </DefaultLayout>
  );
}

// =====================================================================
// Share icon (matches blog visual size: 36px)
// =====================================================================
function ShareIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${label}`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-white/5 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      }}
      aria-label="Copy link"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-white/5 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      ⌁
    </button>
  );
}

// =====================================================================
// EXAMS & Counselling card
// =====================================================================
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
      <div className="text-base font-semibold leading-snug text-white text-center sm:text-left">
        Confused which college?
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 text-center sm:text-left">
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
            padding: '11px 13px',
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
            padding: '11px 13px',
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
            padding: '11px 13px',
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
            padding: '12px 14px',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
            marginTop: '4px',
          }}
        >
          {loading ? 'Sending…' : 'Get Free Counselling'}
        </button>
        <div className="mt-2 text-center text-[11px] leading-relaxed text-slate-600">
          One human · One call · No selling
        </div>
      </form>
    </section>
  );
}

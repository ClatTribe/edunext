/**
 * ArticleHero — full-width hero banner for magazine article detail pages.
 *
 * Deploy to: components/magazine/ArticleHero.tsx
 *
 * Typography matches the existing /blogs/[slug] page:
 *   - Title:    text-3xl sm:text-4xl md:text-5xl font-bold text-white  (Montserrat)
 *   - Subtitle: text-base md:text-lg text-slate-400 italic
 *   - Meta chips: text-xs slate-400
 *
 * Brand tokens preserved for the surface itself:
 *   bg #0f172a, border-bottom 1px #1e293b
 */

import { categoryTone } from './categoryTone';

interface Props {
  title: string;
  subtitle?: string | null;
  category: string;
  readTime?: number | null;
  publishedAt: string;
}

function formatPublishedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ArticleHero({
  title,
  subtitle,
  category,
  readTime,
  publishedAt,
}: Props) {
  const tone = categoryTone(category);

  return (
    <header
      className="w-full"
      style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
        {/* Top row: chips on the right */}
        <div className="mb-5 flex items-center justify-end gap-2 text-slate-400">
          {readTime ? (
            <span
              className="px-3 py-1 text-xs"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid #1e293b',
                borderRadius: 20,
                lineHeight: 1.4,
              }}
            >
              {readTime} min read
            </span>
          ) : null}
          <span
            className="px-3 py-1 text-xs"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid #1e293b',
              borderRadius: 20,
              lineHeight: 1.4,
            }}
          >
            {formatPublishedAt(publishedAt)}
          </span>
        </div>

        {/* Category tag */}
        <span
          className="mb-5 inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            color: tone.text,
            backgroundColor: tone.bg,
            border: `1px solid ${tone.border}`,
            borderRadius: 999,
            lineHeight: 1.4,
          }}
        >
          {tone.label}
        </span>

        {/* Title */}
        <h1 className="font-montserrat text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-base italic leading-relaxed text-slate-400 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}

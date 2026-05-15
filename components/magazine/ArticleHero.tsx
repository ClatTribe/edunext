/**
 * ArticleHero — full-width hero banner for magazine article detail pages.
 *
 * Deploy to: components/magazine/ArticleHero.tsx
 *
 * Pure presentational. Server-component safe (no hooks).
 *
 * Brand tokens (from getedunext.com live CSS — do not change):
 *   - Surface         #0f172a
 *   - Border          #1e293b
 *   - Title text      #ffffff
 *   - Subtitle text   #475569
 *   - Chip text       #64748b
 *   - Category map    Medical/Admissions=green, Engineering=indigo, Law/Management=amber
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
      className="w-full px-8 py-10 sm:px-12 sm:py-14"
      style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {/* Top row: chips on the right */}
        <div className="flex items-center justify-end gap-2">
          {readTime ? (
            <span
              className="px-3 py-1"
              style={{
                fontSize: 10,
                color: '#64748b',
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
            className="px-3 py-1"
            style={{
              fontSize: 10,
              color: '#64748b',
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
          className="self-start uppercase"
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: tone.text,
            backgroundColor: tone.bg,
            border: `1px solid ${tone.border}`,
            borderRadius: 4,
            padding: '4px 8px',
            lineHeight: 1.2,
          }}
        >
          {tone.label}
        </span>

        {/* Title */}
        <h1
          style={{
            color: '#ffffff',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 21,
            fontWeight: 500,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle ? (
          <p
            style={{
              color: '#475569',
              fontStyle: 'italic',
              fontSize: 12,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}

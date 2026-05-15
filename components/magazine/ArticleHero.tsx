/**
 * ArticleHero — full-width hero banner for magazine article detail pages.
 *
 * Deploy to: components/magazine/ArticleHero.tsx
 *
 * Two visual modes:
 *   1. heroImage present — full-bleed background image with dark overlay,
 *      text rendered on top (matches EduAbroad magazine reference).
 *   2. heroImage absent — solid #0f172a band, same typography.
 *
 * Typography matches /blogs/[slug]:
 *   - Title:    text-3xl sm:text-4xl md:text-5xl font-bold text-white (Montserrat)
 *   - Subtitle: text-base md:text-lg text-slate-300 italic
 */

import { categoryTone } from './categoryTone';

interface Props {
  title: string;
  subtitle?: string | null;
  category: string;
  readTime?: number | null;
  publishedAt: string;
  heroImage?: string | null;
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
  heroImage,
}: Props) {
  const tone = categoryTone(category);

  // Two-mode background: image-with-overlay if heroImage, else solid surface
  const bgStyle = heroImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(5,8,24,0.55) 0%, rgba(5,8,24,0.92) 100%), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid #1e293b',
      }
    : {
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
      };

  return (
    <header
      className="relative w-full"
      style={{
        ...bgStyle,
        minHeight: heroImage ? 460 : undefined,
      }}
    >
      <div className="container mx-auto flex max-w-4xl flex-col justify-end px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        {/* Top row: chips on the right */}
        <div className="mb-5 flex items-center justify-end gap-2 text-slate-300">
          {readTime ? (
            <span
              className="px-3 py-1 text-xs font-medium backdrop-blur"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                lineHeight: 1.4,
              }}
            >
              {readTime} min read
            </span>
          ) : null}
          <span
            className="px-3 py-1 text-xs font-medium backdrop-blur"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              lineHeight: 1.4,
            }}
          >
            {formatPublishedAt(publishedAt)}
          </span>
        </div>

        {/* Category tag */}
        <span
          className="mb-5 inline-block self-start px-3 py-1 text-xs font-bold uppercase tracking-wider"
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
        <h1 className="font-montserrat text-3xl font-bold text-white drop-shadow-md sm:text-4xl md:text-5xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-base italic leading-relaxed text-slate-300 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}

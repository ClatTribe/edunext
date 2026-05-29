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

import { useEffect, useState } from 'react';
import JumbleWords from '../microsite/JumbleWords';

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
      className="shrink-0 w-full lg:w-72 xl:w-80"
      style={{
        backgroundColor: '#050818',
        borderLeft: '1px solid #1e293b',
      }}
    >
      <div className="flex flex-col gap-8 px-5 py-6 xl:px-6 h-full">
        <JumbleWords compact={true} />
        
        {/* Section A — Table of Contents */}
        {tocH2.length > 0 && (
          <nav className="lg:sticky lg:top-6">
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
      </div>
    </aside>
  );
}



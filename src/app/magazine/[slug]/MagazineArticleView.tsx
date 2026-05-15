/**
 * MagazineArticleView — client-side layout shell for magazine article pages.
 *
 * Deploy to: src/app/magazine/[slug]/MagazineArticleView.tsx
 *
 * Wraps the article in DefaultLayout (which provides the global Sidebar +
 * auth context), then renders the hero, body, and right sidebar.
 *
 * Layout:
 *
 *   ┌─── DefaultLayout ────────────────────────────────────────────┐
 *   │ ┌────────┐ ┌─────────────────────────────────────────────┐  │
 *   │ │        │ │ ArticleHero                                 │  │
 *   │ │ Side-  │ ├──────────────────────────────────────┬──────┤  │
 *   │ │ bar    │ │ Article body                         │ Side │  │
 *   │ │        │ │ (TL;DR, paragraphs, headings,        │ bar  │  │
 *   │ │        │ │  FAQs, disclaimer)                   │ 186px│  │
 *   │ └────────┘ └──────────────────────────────────────┴──────┘  │
 *   └──────────────────────────────────────────────────────────────┘
 */

'use client';

import Link from 'next/link';
import DefaultLayout from '../../defaultLayout';
import ArticleHero from '../../../../components/magazine/ArticleHero';
import ArticleRightSidebar from '../../../../components/magazine/ArticleRightSidebar';
import { categoryTone } from '../../../../components/magazine/categoryTone';

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
  const tone = categoryTone(article.category);
  const initials = (article.author_name || 'EduNext')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const shareUrl = `https://www.getedunext.com/magazine/${article.slug}`;

  return (
    <DefaultLayout>
      <div
        className="flex h-full"
        style={{ backgroundColor: '#050818' }}
      >
        {/* Article column */}
        <div className="flex-1 overflow-y-auto">
          <ArticleHero
            title={article.title}
            subtitle={article.magazine_subtitle || article.summary}
            category={article.category}
            readTime={article.read_time}
            publishedAt={article.published_at}
          />

          <div
            className="mx-auto px-8 py-10 sm:px-12 sm:py-12"
            style={{ maxWidth: 760 }}
          >
            {/* Author + share row */}
            <div
              className="mb-8 flex items-center justify-between"
              style={{ borderBottom: '1px solid #1e293b', paddingBottom: 18 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </div>
                <div className="flex flex-col">
                  <div
                    style={{
                      color: '#e2e8f0',
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {article.author_name}
                  </div>
                  <div style={{ color: '#475569', fontSize: 10, lineHeight: 1.4 }}>
                    EduNext Magazine
                  </div>
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

            {/* TL;DR */}
            <div
              className="mb-8"
              style={{
                backgroundColor: '#0f172a',
                borderLeft: '2px solid #10b981',
                padding: '12px 16px',
                borderRadius: '0 6px 6px 0',
              }}
            >
              <div
                className="mb-1 uppercase"
                style={{
                  color: '#10b981',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
                TL;DR
              </div>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {article.summary}
              </p>
            </div>

            {/* Body */}
            <div
              className="magazine-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* FAQs */}
            {article.faqs && article.faqs.length > 0 && (
              <section
                className="mt-12 pt-8"
                style={{ borderTop: '1px solid #1e293b' }}
              >
                <h2
                  style={{
                    color: '#e2e8f0',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 15,
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  Frequently Asked Questions
                </h2>
                <div className="flex flex-col gap-2">
                  {article.faqs.map((f, i) => (
                    <details
                      key={i}
                      style={{
                        backgroundColor: '#1a1f2e',
                        border: '1px solid #1e293b',
                        borderRadius: 6,
                        padding: '10px 14px',
                      }}
                    >
                      <summary
                        style={{
                          color: '#e2e8f0',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          listStyle: 'none',
                        }}
                      >
                        {f.question}
                      </summary>
                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: 12,
                          lineHeight: 1.7,
                          marginTop: 8,
                        }}
                      >
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div
                className="mt-10 flex flex-wrap gap-2 pt-6"
                style={{ borderTop: '1px solid #1e293b' }}
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #1e293b',
                      color: '#64748b',
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <ArticleRightSidebar
          toc={article.toc || []}
          related={related}
          sourceSlug={article.slug}
          sourceCategory={article.category}
        />
      </div>

      {/* Scoped body styles for the article HTML coming from Supabase */}
      <style jsx global>{`
        .magazine-body {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.8;
        }
        .magazine-body p {
          margin: 0 0 18px 0;
          color: #94a3b8;
        }
        .magazine-body h2 {
          color: #e2e8f0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          margin: 36px 0 14px 0;
          scroll-margin-top: 16px;
        }
        .magazine-body h2:first-child {
          margin-top: 0;
        }
        .magazine-body h3 {
          color: #e2e8f0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          margin: 24px 0 10px 0;
          scroll-margin-top: 16px;
        }
        .magazine-body strong {
          color: #e2e8f0;
          font-weight: 500;
        }
        .magazine-body em {
          color: #64748b;
          font-style: italic;
        }
        .magazine-body a {
          color: #10b981;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .magazine-body a:hover {
          color: #34d399;
        }
        .magazine-body ul,
        .magazine-body ol {
          margin: 14px 0 22px 0;
          padding-left: 22px;
        }
        .magazine-body ul {
          list-style: disc;
        }
        .magazine-body ol {
          list-style: decimal;
        }
        .magazine-body li {
          margin: 6px 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }
        .magazine-body blockquote {
          border-left: 2px solid #10b981;
          padding: 4px 0 4px 14px;
          margin: 20px 0;
          color: #64748b;
          font-style: italic;
        }
        .magazine-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 22px 0;
          border: 1px solid #1e293b;
          border-radius: 6px;
          overflow: hidden;
          font-size: 12px;
        }
        .magazine-body th {
          background: #1a1f2e;
          color: #e2e8f0;
          font-weight: 500;
          padding: 10px 12px;
          text-align: left;
          border: 1px solid #1e293b;
        }
        .magazine-body td {
          color: #94a3b8;
          padding: 10px 12px;
          border: 1px solid #1e293b;
        }
        .magazine-body details summary {
          list-style: none;
        }
        .magazine-body details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </DefaultLayout>
  );
}

// =====================================================================
// Share icon
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
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid #1e293b',
        color: '#64748b',
        fontSize: 11,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        lineHeight: 1,
      }}
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
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid #1e293b',
        color: '#64748b',
        fontSize: 11,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        lineHeight: 1,
      }}
    >
      ⌁
    </button>
  );
}

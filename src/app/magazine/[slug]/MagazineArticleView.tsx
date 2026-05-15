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
      <div className="flex h-full" style={{ backgroundColor: '#050818' }}>
        {/* Article column */}
        <div className="flex-1 overflow-y-auto">
          <ArticleHero
            title={article.title}
            subtitle={article.magazine_subtitle || article.summary}
            category={article.category}
            readTime={article.read_time}
            publishedAt={article.published_at}
            heroImage={article.hero_image}
          />

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

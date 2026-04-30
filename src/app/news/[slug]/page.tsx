export const dynamic = 'force-dynamic';

import { getNewsBySlug, getRelatedNews, CATEGORY_COLORS, CATEGORY_EMOJIS, timeAgo } from '../../lib/news';
import NewsCard from '../NewsCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getNewsBySlug(resolvedParams.slug);
  if (!article) return { title: 'Article Not Found | EduNext' };
  return {
    title: `${article.title} | EduNext News`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getNewsBySlug(resolvedParams.slug);
  if (!article) notFound();

  const related = await getRelatedNews(article.category, article.slug, 3);
  const color = CATEGORY_COLORS[article.category] || '#F59E0B';
  const emoji = CATEGORY_EMOJIS[article.category] || '📰';

  const htmlContent = article.content.includes('<')
    ? article.content
    : article.content
        .split('\n\n')
        .map((p: string) => `<p>${p}</p>`)
        .join('');

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full pt-16" style={{ backgroundColor: '#050818' }}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-amber-400 transition-colors">News</Link>
            <span>/</span>
            <Link
              href={`/news?category=${encodeURIComponent(article.category)}`}
              className="hover:text-amber-400 transition-colors"
            >
              {article.category}
            </Link>
          </nav>

          {/* Category + Time */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <span>{emoji}</span>
              <span>{article.category}</span>
            </span>
            <span className="text-xs text-slate-500">{timeAgo(article.published_at)}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">
            {article.title}
          </h1>

          {/* Summary */}
          <p
            className="text-lg text-slate-300 mb-6 leading-relaxed border-l-4 pl-4 italic"
            style={{ borderColor: color }}
          >
            {article.summary}
          </p>

          {/* Source */}
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
            <span>Source:</span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              {article.source_name}
            </a>
          </div>

          {/* Article content */}
          <div
            className="mb-8 rounded-xl p-6"
            style={{ backgroundColor: '#0F172B', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div
              className="text-slate-300 leading-relaxed space-y-4 text-base"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full font-medium"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            className="rounded-xl p-6 mb-4"
            style={{ backgroundColor: '#0F172B', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <h3 className="font-bold text-white mb-2">
              Preparing for {article.category.split(' / ')[0]}?
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Discover colleges that match your profile — no spam calls, verified data.
            </p>
            <Link
              href="/find-colleges"
              className="inline-block font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: '#F59E0B', color: '#050818' }}
            >
              Explore Colleges →
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(245,158,11,0.15)' }} className="py-10">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
              <h2 className="text-xl font-bold text-white mb-6">More in {article.category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <NewsCard key={r.id} article={r} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

import { getNewsBySlug, getRelatedNews, CATEGORY_COLORS, CATEGORY_EMOJIS, timeAgo } from '../../lib/news';
import NewsCard from '../NewsCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getNewsBySlug(params.slug);
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getNewsBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedNews(article.category, article.slug, 4);
  const color = CATEGORY_COLORS[article.category] || '#3B82F6';
  const emoji = CATEGORY_EMOJIS[article.category] || '\uD83D\uDCF0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-blue-600">News</Link>
          <span>/</span>
          <Link href={`/news?category=${encodeURIComponent(article.category)}`} className="hover:text-blue-600">
            {article.category}
          </Link>
        </nav>

        {/* Category + Time */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}
          >
            <span>{emoji}</span>
            <span>{article.category}</span>
          </span>
          <span className="text-xs text-gray-400">{timeAgo(article.published_at)}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-3">
          {article.title}
        </h1>

        {/* Summary block */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 pl-4 italic" style={{ borderColor: color }}>
          {article.summary}
        </p>

        {/* Source attribution */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <span>Source:</span>
          <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {article.source_name}
          </a>
        </div>

        {/* Article content */}
        <div className="mb-8">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4 text-base">
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-blue-900 mb-1">
            Preparing for {article.category.split(' / ')[0]}?
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Discover colleges that match your profile — no spam calls, verified data.
          </p>
          <Link
            href="/find-colleges"
            className="inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Explore Colleges \u2192
          </Link>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More in {article.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <NewsCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

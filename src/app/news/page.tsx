export const dynamic = 'force-dynamic';
import { getAllNews, NEWS_CATEGORIES, CATEGORY_COLORS } from '../lib/news';
import NewsCard from './NewsCard';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
  title: 'Education News | EduNext',
  description: 'Latest education news for Indian students — JEE, NEET, MBA, CLAT, Study Abroad, and more. Updated daily.',
};

interface NewsPageProps {
  searchParams: { category?: string };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const activeCategory = searchParams.category || 'All';
  const articles = await getAllNews(activeCategory === 'All' ? undefined : activeCategory, 15);

  const heroArticles = articles.slice(0, 3);
  const gridArticles = articles.slice(3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Education News</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with the latest in Indian education</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              const color = CATEGORY_COLORS[cat] || '#3B82F6';
              return (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/news' : `/news?category=${encodeURIComponent(cat)}`}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: cat === 'All' ? '#1D4ED8' : color } : {}}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">\uD83D\uDCF0</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h2>
            <p className="text-gray-500">Check back soon — new articles are added daily.</p>
          </div>
        ) : (
          <>
            {heroArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {heroArticles.map((article, i) => (
                  <div key={article.id} className={i === 0 ? 'md:col-span-2' : ''}>
                    <NewsCard article={article} featured={i === 0} />
                  </div>
                ))}
              </div>
            )}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-blue-600 text-white py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Find Your Perfect College</h2>
          <p className="text-blue-100 mb-4 text-sm">Explore 10,000+ colleges across India — zero spam calls.</p>
          <Link
            href="/find-colleges"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Explore Colleges \u2192
          </Link>
        </div>
      </div>
    </div>
  );
}

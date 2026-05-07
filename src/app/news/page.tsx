export const dynamic = 'force-dynamic';

import { getAllNews, NEWS_CATEGORIES, CATEGORY_COLORS } from '../lib/news';
import NewsCard from './NewsCard';
import Link from 'next/link';
import DefaultLayout from '../defaultLayout';

export const metadata = {
  title: 'Education News | EduNext',
  description: 'Latest education news for Indian students — JEE, NEET, MBA, CLAT, Study Abroad, and more. Updated daily.',
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }> | { category?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const activeCategory = resolvedParams?.category || 'All';
  const articles = await getAllNews(
    activeCategory === 'All' ? undefined : activeCategory,
    18
  );

  return (
    <DefaultLayout>
      <main className="min-h-screen w-full" style={{ backgroundColor: 'transparent' }}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          <header className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Education News
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-400">
              Stay updated with the latest in Indian education — JEE, NEET, MBA, CLAT &amp; more.
            </p>
          </header>

          {/* Category Tabs */}
          <div className="mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 pb-2 min-w-max">
              {NEWS_CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                const color = CATEGORY_COLORS[cat] || '#F59E0B';
                return (
                  <Link
                    key={cat}
                    href={cat === 'All' ? '/news' : `/news?category=${encodeURIComponent(cat)}`}
                    className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={
                      isActive
                        ? { backgroundColor: cat === 'All' ? '#F59E0B' : color, color: '#fff' }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: '#94a3b8',
                            border: '1px solid rgba(245,158,11,0.15)',
                          }
                    }
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>

          {articles.length === 0 ? (
            <div
              className="text-center py-16 sm:py-20 rounded-2xl"
              style={{ backgroundColor: '#0F172B', border: '1px solid rgba(245, 158, 11, 0.15)' }}
            >
              <div className="text-5xl mb-4">📰</div>
              <h2 className="text-xl font-semibold text-white mb-2">No articles yet</h2>
              <p className="text-slate-400">Check back soon — new articles are added daily.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </DefaultLayout>
  );
}

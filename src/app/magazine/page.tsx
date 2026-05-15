/**
 * EduNext Magazine — listing page.
 *
 * Deploy to: src/app/magazine/page.tsx
 *
 * Modern, Gen Z-styled magazine listing with:
 *  - Hero featured article
 *  - Category pill filter (All / Engineering / Medical / Law / Management)
 *  - Search bar (client-side filter on title + tags)
 *  - Latest grid (3-col on desktop)
 *  - "Updated daily" pulse indicator
 *
 * Uses dark mode (matches existing /news theme: #050818 navy).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 600; // re-cache every 10 minutes

import Link from 'next/link';
import {
  getMagazineArticles,
  getFeaturedMagazineArticle,
  MAGAZINE_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  timeAgo,
  type MagazineCategory,
} from '../lib/magazine';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import MagazineSearch from './MagazineSearch';

export const metadata = {
  title: 'EduNext Magazine | Honest College & Exam Stories for Indian Students',
  description:
    'Daily long-form stories on JEE, NEET, CLAT, CAT and Indian college life. No spam calls. No paid rankings. Just honest deep-dives for students figuring it out.',
  openGraph: {
    title: 'EduNext Magazine',
    description: 'Daily long-form stories on JEE, NEET, CLAT, CAT and Indian college life.',
    type: 'website',
    url: 'https://www.getedunext.com/magazine',
  },
};

interface PageProps {
  searchParams?: Promise<{ category?: string }> | { category?: string };
}

export default async function MagazinePage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams);
  const activeCategory = (sp?.category || '') as MagazineCategory | '';

  const [featured, articles] = await Promise.all([
    getFeaturedMagazineArticle(),
    getMagazineArticles(activeCategory || undefined, 30),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full pt-16" style={{ backgroundColor: '#050818' }}>
        {/* Header */}
        <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
                  <span className="text-lg">⚡</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">Magazine</h1>
                  <p className="text-sm text-slate-400">by EduNext</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-semibold uppercase tracking-wide text-emerald-400">
                Updated daily
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8">
            <MagazineSearch articles={articles} />
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryPill label="All" href="/magazine" active={!activeCategory} />
            {MAGAZINE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={CATEGORY_LABELS[cat]}
                href={`/magazine?category=${encodeURIComponent(cat)}`}
                active={activeCategory === cat}
                color={CATEGORY_COLORS[cat]}
              />
            ))}
          </div>
        </section>

        {/* Hero featured */}
        {featured && !activeCategory && (
          <section className="container mx-auto max-w-7xl px-4 sm:px-6">
            <Link
              href={`/magazine/${featured.slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-slate-900 transition-transform hover:scale-[1.005]"
              style={{
                minHeight: '420px',
                backgroundImage: featured.hero_image
                  ? `linear-gradient(180deg, rgba(5,8,24,0.4) 0%, rgba(5,8,24,0.95) 100%), url(${featured.hero_image})`
                  : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
                    Featured
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[featured.category]}20`,
                      color: CATEGORY_COLORS[featured.category],
                    }}
                  >
                    {CATEGORY_EMOJIS[featured.category]} {CATEGORY_LABELS[featured.category]}
                  </span>
                  {featured.read_time && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                      ⏱ {featured.read_time} min
                    </span>
                  )}
                </div>
                <h2 className="mb-3 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                  {featured.title}
                </h2>
                {featured.magazine_subtitle && (
                  <p className="mb-4 max-w-2xl text-base text-slate-300 sm:text-lg">
                    {featured.magazine_subtitle}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>{featured.author_name}</span>
                  <span>·</span>
                  <span>{timeAgo(featured.published_at)}</span>
                </div>
              </div>
              <div className="absolute right-6 bottom-6 hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 sm:block">
                Read article ↗
              </div>
            </Link>
          </section>
        )}

        {/* Latest grid */}
        <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              📈
            </div>
            <h2 className="text-xl font-bold text-white">Latest</h2>
            <span className="text-sm text-slate-500">{articles.length} articles</span>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-slate-400">
                No articles in this category yet. Check back tomorrow — we publish daily.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles
                .filter((a) => !featured || a.id !== featured.id || activeCategory)
                .map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

// =====================================================================
// Category pill
// =====================================================================
function CategoryPill({
  label,
  href,
  active,
  color,
}: {
  label: string;
  href: string;
  active: boolean;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-white bg-white text-slate-900'
          : 'border-white/15 text-slate-300 hover:border-white/40 hover:text-white'
      }`}
      style={active && color ? { borderColor: color, backgroundColor: color, color: '#050818' } : undefined}
    >
      {label}
    </Link>
  );
}

// =====================================================================
// Article card
// =====================================================================
function ArticleCard({ article }: { article: Awaited<ReturnType<typeof getMagazineArticles>>[number] }) {
  const color = CATEGORY_COLORS[article.category];
  const emoji = CATEGORY_EMOJIS[article.category];
  return (
    <Link
      href={`/magazine/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-slate-900"
    >
      <div
        className="relative aspect-[16/10] w-full bg-slate-800"
        style={{
          backgroundImage: article.hero_image
            ? `url(${article.hero_image})`
            : `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span
          className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            color: color,
          }}
        >
          {emoji} {CATEGORY_LABELS[article.category]}
        </span>
        {article.read_time && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
            {article.read_time}m
          </span>
        )}
      </div>
      <div className="flex-1 p-5">
        <h3 className="mb-2 text-base font-bold leading-snug text-white group-hover:text-rose-300">
          {article.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-400">{article.summary}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{article.author_name}</span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

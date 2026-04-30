'use client';
import Link from 'next/link';
import { NewsArticle, CATEGORY_COLORS, CATEGORY_EMOJIS, timeAgo } from '../lib/news';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const color = CATEGORY_COLORS[article.category] || '#F59E0B';
  const emoji = CATEGORY_EMOJIS[article.category] || '📰';

  return (
    <Link href={`/news/${article.slug}`} className="block h-full">
      <div
        className="rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
        style={{
          backgroundColor: '#0F172B',
          border: '1px solid rgba(245, 158, 11, 0.15)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.15)';
        }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: color }} />

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <span>{emoji}</span>
              <span>{article.category}</span>
            </span>
            <span className="text-xs text-slate-500">{timeAgo(article.published_at)}</span>
          </div>

          <h2
            className={`font-bold mb-2 text-white hover:text-[#F59E0B] transition-colors line-clamp-2 ${
              featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            }`}
          >
            {article.title}
          </h2>

          <p className="text-slate-400 text-sm line-clamp-3 flex-1">{article.summary}</p>

          <div
            className="mt-4 pt-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(245,158,11,0.1)' }}
          >
            <span className="text-xs text-slate-500 truncate max-w-[160px]">{article.source_name}</span>
            <span className="text-xs font-medium text-amber-400">Read →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

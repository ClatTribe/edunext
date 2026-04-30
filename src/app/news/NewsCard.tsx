import Link from 'next/link';
import { NewsArticle, CATEGORY_COLORS, CATEGORY_EMOJIS, timeAgo } from '../lib/news';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const color = CATEGORY_COLORS[article.category] || '#6B7280';
  const emoji = CATEGORY_EMOJIS[article.category] || '\uD83D\uDCF0';

  return (
    <Link href={`/news/${article.slug}`} className="block group">
      <div className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 h-full ${featured ? 'flex flex-col' : ''}`}>
        {/* Color strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

        <div className="p-4 flex flex-col flex-1">
          {/* Category badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <span>{emoji}</span>
              <span>{article.category}</span>
            </span>
            <span className="text-xs text-gray-400">{timeAgo(article.published_at)}</span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 ${featured ? 'text-lg line-clamp-2' : 'text-sm line-clamp-2'}`}>
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-500 text-sm line-clamp-3 flex-1">{article.summary}</p>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 truncate max-w-[160px]">{article.source_name}</span>
            <span className="text-xs font-medium text-blue-500 group-hover:underline">Read \u2192</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

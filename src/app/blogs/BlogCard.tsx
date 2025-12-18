'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: {
    _id: string;
    title: string;
    slug: { current: string };
    excerpt?: string;
    publishedAt?: string;
  };
  accentColor: string;
  secondaryBg: string;
  borderColor: string;
}

export default function BlogCard({ post, accentColor, secondaryBg, borderColor }: BlogCardProps) {
  return (
    <Link 
      key={post._id} 
      href={`/blogs/${post.slug.current}`}
      className="group"
    >
      <div 
        className="rounded-2xl shadow-xl p-6 backdrop-blur-xl h-full transition-all hover:shadow-2xl"
        style={{ 
          backgroundColor: secondaryBg,
          border: `1px solid ${borderColor}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = borderColor;
        }}
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-opacity-90 transition-all line-clamp-2">
              {post.title}
            </h2>
          </div>
          <ArrowRight 
            style={{ color: accentColor }}
            className="group-hover:translate-x-1 transition-transform flex-shrink-0 ml-3 mt-1" 
            size={20} 
          />
        </div>

        {/* Post Excerpt */}
        {post.excerpt && (
          <p className="text-slate-400 text-sm md:text-base mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Post Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t"
          style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}
        >
          {post.publishedAt && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar size={14} />
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
          <span 
            className="text-sm font-semibold group-hover:translate-x-1 transition-transform"
            style={{ color: accentColor }}
          >
            Read More →
          </span>
        </div>
      </div>
    </Link>
  );
}
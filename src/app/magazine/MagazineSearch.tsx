/**
 * MagazineSearch — client-side search input that filters the article list.
 *
 * Deploy alongside magazine/page.tsx as: src/app/magazine/MagazineSearch.tsx
 *
 * Currently a UI placeholder that scrolls to the latest grid and filters
 * via URL param. (Full client filter to be wired in v2.)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Article = { id: number; title: string; tags: string[]; slug: string };

export default function MagazineSearch({ articles }: { articles: Article[] }) {
  const [q, setQ] = useState('');
  const router = useRouter();

  const filtered = q
    ? articles.filter((a) => {
        const needle = q.toLowerCase();
        return (
          a.title.toLowerCase().includes(needle) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(needle))
        );
      }).slice(0, 6)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles, exams, colleges..."
          className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-base text-white placeholder-slate-500 outline-none focus:border-white/30"
        />
        <svg
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      {filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 overflow-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              className="block w-full border-b border-white/5 px-5 py-3 text-left text-sm text-white hover:bg-white/5"
              onClick={() => {
                setQ('');
                router.push(`/magazine/${a.slug}`);
              }}
            >
              {a.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

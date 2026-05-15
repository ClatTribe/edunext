/**
 * EduNext Magazine — data access helpers.
 *
 * Deploy to: src/app/lib/magazine.ts
 *
 * Server-side functions to read magazine articles from Supabase.
 * Mirrors the existing pattern in src/app/lib/news.ts.
 */

import { createClient } from '@supabase/supabase-js';

export type MagazineCategory =
  | 'JEE / Engineering'
  | 'NEET / Medical'
  | 'CLAT / Law'
  | 'MBA / CAT';

export interface MagazineArticleRow {
  id: number;
  title: string;
  slug: string;
  summary: string;
  magazine_subtitle: string | null;
  content: string;
  category: MagazineCategory;
  tags: string[];
  hero_image: string | null;
  image_url: string | null;
  read_time: number | null;
  featured: boolean;
  author_name: string;
  author_avatar: string | null;
  toc: { id: string; text: string; level: number }[];
  faqs: { question: string; answer: string }[];
  meta_title: string | null;
  meta_description: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
}

export const MAGAZINE_CATEGORIES: MagazineCategory[] = [
  'JEE / Engineering',
  'NEET / Medical',
  'CLAT / Law',
  'MBA / CAT',
];

export const CATEGORY_LABELS: Record<MagazineCategory, string> = {
  'JEE / Engineering': 'Engineering',
  'NEET / Medical': 'Medical',
  'CLAT / Law': 'Law',
  'MBA / CAT': 'Management',
};

export const CATEGORY_COLORS: Record<MagazineCategory, string> = {
  'JEE / Engineering': '#F59E0B', // amber
  'NEET / Medical': '#10B981',    // emerald
  'CLAT / Law': '#8B5CF6',        // violet
  'MBA / CAT': '#F43F5E',         // rose
};

export const CATEGORY_EMOJIS: Record<MagazineCategory, string> = {
  'JEE / Engineering': '⚙️',
  'NEET / Medical': '🩺',
  'CLAT / Law': '⚖️',
  'MBA / CAT': '📈',
};

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const MAGAZINE_FIELDS = `
  id, title, slug, summary, magazine_subtitle, content, category, tags,
  hero_image, image_url, read_time, featured, author_name, author_avatar,
  toc, faqs, meta_title, meta_description, source_name, source_url, published_at
`;

export async function getMagazineArticles(
  category: MagazineCategory | undefined = undefined,
  limit = 50
): Promise<MagazineArticleRow[]> {
  const supabase = getServerSupabase();
  let query = supabase
    .from('edu_news')
    .select(MAGAZINE_FIELDS)
    .eq('is_magazine', true)
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[getMagazineArticles]', error);
    return [];
  }
  return (data || []) as MagazineArticleRow[];
}

export async function getFeaturedMagazineArticle(): Promise<MagazineArticleRow | null> {
  const supabase = getServerSupabase();
  // first try a manually featured article
  const { data: feat } = await supabase
    .from('edu_news')
    .select(MAGAZINE_FIELDS)
    .eq('is_magazine', true)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (feat) return feat as MagazineArticleRow;

  // fallback to latest magazine article
  const { data: latest } = await supabase
    .from('edu_news')
    .select(MAGAZINE_FIELDS)
    .eq('is_magazine', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (latest as MagazineArticleRow) || null;
}

export async function getMagazineBySlug(slug: string): Promise<MagazineArticleRow | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from('edu_news')
    .select(MAGAZINE_FIELDS)
    .eq('is_magazine', true)
    .eq('slug', slug)
    .maybeSingle();
  return (data as MagazineArticleRow) || null;
}

export async function getRelatedMagazine(
  category: MagazineCategory,
  excludeSlug: string,
  limit = 3
): Promise<MagazineArticleRow[]> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from('edu_news')
    .select(MAGAZINE_FIELDS)
    .eq('is_magazine', true)
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data as MagazineArticleRow[]) || [];
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 5) return `${diffWk}w ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

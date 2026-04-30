import { createClient } from '@supabase/supabase-js';

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  source_name: string;
  source_url: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export const NEWS_CATEGORIES = [
  'All',
  'JEE / Engineering',
  'NEET / Medical',
  'MBA / CAT',
  'Boards / CBSE',
  'CLAT / Law',
  'Study Abroad',
  'AI & EdTech',
  'Govt Exams',
  'Scholarships',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'JEE / Engineering': '#3B82F6',
  'NEET / Medical': '#10B981',
  'MBA / CAT': '#8B5CF6',
  'Boards / CBSE': '#F59E0B',
  'CLAT / Law': '#EF4444',
  'Study Abroad': '#06B6D4',
  'AI & EdTech': '#EC4899',
  'Govt Exams': '#F97316',
  'Scholarships': '#14B8A6',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  'JEE / Engineering': '\u2699\uFE0F',
  'NEET / Medical': '\uD83C\uDFE5',
  'MBA / CAT': '\uD83D\uDCBC',
  'Boards / CBSE': '\uD83D\uDCDA',
  'CLAT / Law': '\u2696\uFE0F',
  'Study Abroad': '\u2708\uFE0F',
  'AI & EdTech': '\uD83E\uDD16',
  'Govt Exams': '\uD83C\uDFDB\uFE0F',
  'Scholarships': '\uD83C\uDF93',
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function getAllNews(
  category?: string,
  limit = 15,
  offset = 0
): Promise<NewsArticle[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('edu_news')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  return data || [];
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('edu_news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching news by slug:', error);
    return null;
  }
  return data;
}

export async function getRelatedNews(
  category: string,
  excludeSlug: string,
  limit = 4
): Promise<NewsArticle[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('edu_news')
    .select('*')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related news:', error);
    return [];
  }
  return data || [];
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

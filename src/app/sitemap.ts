import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/app/lib/blogs';
import { supabase } from '../../lib/supabase'; // Using your existing import

const baseUrl = 'https://www.getedunext.com';

/**
 * 1. GENERATE SITEMAP INDEX CHUNKS
 */
export async function generateSitemaps() {
  // Use the imported 'supabase' object directly, do not call createClient()
  const { count } = await supabase
    .from('colleges')
    .select('*', { count: 'exact', head: true });

  const totalColleges = count || 0;
  
  // 3000 colleges * ~9 paths = 27k URLs (well under the 50k limit)
  const numberOfSitemaps = Math.ceil(totalColleges / 3000);

  return Array.from({ length: numberOfSitemaps }, (_, id) => ({ id }));
}

/**
 * 2. MAIN SITEMAP FUNCTION
 */
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // Calculate range for this chunk
  const start = id * 3000;
  const end = start + 2999;

  let blogUrls: MetadataRoute.Sitemap = [];
  let staticPages: MetadataRoute.Sitemap = [];
  let toolUrls: MetadataRoute.Sitemap = [];

  if (id === 0) {
    const blogs = await getAllBlogs();
    blogUrls = blogs.map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: new Date(post.lastModified || post.date),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    staticPages = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ];

    toolUrls = [
      { url: `${baseUrl}/xat-score-calculator-2026`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ];
  }

  // Fetch batch of colleges
  const { data: colleges } = await supabase
    .from('colleges')
    .select('slug, updated_at')
    .range(start, end);

  const collegeUrls: MetadataRoute.Sitemap = [];

  if (colleges) {
    // Added type definition (slug: string, updated_at: any) to fix TS7006 error
    colleges.forEach((college: { slug: string; updated_at?: string }) => {
      const lastMod = new Date(college.updated_at || new Date());
      
      const subPaths = [
        '', 
        'admission', 
        'courses', 
        'cutoff', 
        'fees', 
        'placement', 
        'ranking', 
        'reviews', 
        'contact'
      ];

      subPaths.forEach((path) => {
        collegeUrls.push({
          url: `${baseUrl}/college/${college.slug}${path ? `/${path}` : ''}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: path === '' ? 0.9 : 0.6,
        });
      });
    });
  }

  return [...staticPages, ...toolUrls, ...blogUrls, ...collegeUrls];
}
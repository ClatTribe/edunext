import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/app/lib/blogs';
import { supabase } from '../../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.getedunext.com';

  // 1. Static and Blog Data
  const blogs = await getAllBlogs();
  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/xat-score-calculator-2026`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  ];

  // 2. Fetch Colleges
  const { data: colleges, error } = await supabase
    .from('college_microsites') // DOUBLE CHECK: Is your table name exactly 'colleges'?
    .select('slug, updated_at')
    .limit(500);

  // Debug log - check your terminal/console where you run 'npm run dev'
  console.log('Sitemap Fetch:', { count: colleges?.length, error });

  const collegeUrls: MetadataRoute.Sitemap = [];

  if (colleges && colleges.length > 0) {
    colleges.forEach((college: { slug: string; updated_at?: string }) => {
      const lastMod = new Date(college.updated_at || new Date());
      const subPaths = ['', 'admission', 'contact', 'courses', 'cutoff', 'fees', 'placement', 'ranking', 'reviews'];

      subPaths.forEach((path) => {
        collegeUrls.push({
          url: `${baseUrl}/college/${college.slug}${path ? `/${path}` : ''}`,
          lastModified: lastMod,
          changeFrequency: 'monthly' as const,
          priority: path === '' ? 0.9 : 0.6,
        });
      });
    });
  } else {
    // BACKUP LINK: If this shows in your XML, it means the database returned NO data
    collegeUrls.push({
      url: `${baseUrl}/college/no-data-found-check-supabase`,
      lastModified: new Date(),
    });
  }

  return [...staticPages, ...blogUrls, ...collegeUrls];
}
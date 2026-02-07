import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/app/lib/blogs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.getedunext.com';

  // Fetch all your blogs
  const blogs = await getAllBlogs();

  // Create sitemap entries for blog posts
  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // Tools/Calculators (PUBLIC ZONE - Must be indexed)
  const toolUrls = [
    {
      url: `${baseUrl}/xat-score-calculator-2026`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  return [
    ...staticPages,
    ...toolUrls,
    ...blogUrls,
  ];
}
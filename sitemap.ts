import { MetadataRoute } from 'next';
// import { getAllBlogs } from '../../lib/blogs';
import { getAllBlogs } from '@/app/lib/blogs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.edunext.co.in';

  // Fetch all your blogs using the library function
  const blogs = await getAllBlogs();

  // Create sitemap entries for your blog posts
  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    // Use lastModified if it exists, otherwise use the original date
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Add your static pages (Home, About, etc.)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...blogUrls,
  ];
}
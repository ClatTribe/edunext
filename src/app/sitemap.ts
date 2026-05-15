import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/app/lib/blogs';
import { getAllNews } from '@/app/lib/news';
import { getMagazineArticles } from '@/app/lib/magazine';
import { supabase } from '../../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.getedunext.com';
  const prepBaseUrl = 'https://prep.getedunext.com';
  const secondSubdomainUrl = 'https://test.getedunext.com';

  // 1. Static Pages (Main Domain)
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/lms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/magazine`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/xat-score-calculator-2026`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/jee-score-calculator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/neet-call-predictor`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/forms-and-deadlines/jee`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/forms-and-deadlines/cuet`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/forms-and-deadlines/law`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/forms-and-deadlines/ipm`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${baseUrl}/college/first-bridge-business-school-gurgaon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9
    },
  ];

  // 2. Prep Pages
  const prepPages: MetadataRoute.Sitemap = [
    { url: prepBaseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 }
  ];

  // 3. Second Subdomain Pages
  const secondSubdomainPages: MetadataRoute.Sitemap = [
    { url: secondSubdomainUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 }
  ];

  // 4. Blog Pages
  const blogs = await getAllBlogs();
  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 5. News Pages
  const news = await getAllNews(undefined, 1000);
  const newsUrls = news.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.published_at || article.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 6. Magazine Pages
  const magazine = await getMagazineArticles(undefined, 1000);
  const magazineUrls = magazine.map((article) => ({
    url: `${baseUrl}/magazine/${article.slug}`,
    lastModified: new Date(article.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...prepPages,
    ...secondSubdomainPages,
    ...blogUrls,
    ...magazineUrls,
    ...newsUrls
  ];
}

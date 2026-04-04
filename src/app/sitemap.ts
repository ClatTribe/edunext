// import { MetadataRoute } from 'next';
// import { getAllBlogs } from '@/app/lib/blogs';
// import { supabase } from '../../lib/supabase';

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const baseUrl = 'https://www.getedunext.com';

//   // 1. Static Pages
//   const staticPages: MetadataRoute.Sitemap = [
//     { 
//       url: baseUrl, 
//       lastModified: new Date(), 
//       changeFrequency: 'daily' as const, 
//       priority: 1.0 
//     },
//     { 
//       url: `${baseUrl}/lms`,
//       lastModified: new Date(), 
//       changeFrequency: 'weekly' as const, 
//       priority: 0.9 
//     },
//     { 
//       url: `${baseUrl}/xat-score-calculator-2026`, 
//       lastModified: new Date(), 
//       changeFrequency: 'weekly' as const, 
//       priority: 0.9 
//     },
//     {
//       url: `${baseUrl}/forms-and-deadlines/jee`,
//       lastModified: new Date(),
//       changeFrequency: 'weekly' as const,
//       priority: 0.9
//     },
//     {
//       url: `${baseUrl}/forms-and-deadlines/cuet`,
//       lastModified: new Date(),
//       changeFrequency: 'weekly' as const,
//       priority: 0.9
//     },
//     {
//       url: `${baseUrl}/forms-and-deadlines/law`,
//       lastModified: new Date(),
//       changeFrequency: 'weekly' as const,
//       priority: 0.9
//     },
//     {
//       url: `${baseUrl}/forms-and-deadlines/ipm`,
//       lastModified: new Date(),
//       changeFrequency: 'weekly' as const,
//       priority: 0.9
//     },
//   ];

//   // 2. Blog Pages
//   const blogs = await getAllBlogs();
//   const blogUrls = blogs.map((post) => ({
//     url: `${baseUrl}/blogs/${post.slug}`,
//     lastModified: new Date(post.lastModified || post.date),
//     changeFrequency: 'weekly' as const,
//     priority: 0.8,
//   }));

//   // NO COLLEGES HERE ANYMORE
//   return [...staticPages, ...blogUrls];
// }

import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/app/lib/blogs';
import { supabase } from '../../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.getedunext.com';
  const prepBaseUrl = 'https://prep.getedunext.com';
  // Assuming the second subdomain follows a similar pattern, e.g., 'test' or 'app' 
  const secondSubdomainUrl = 'https://test.getedunext.com'; 

  // 1. Static Pages (Main Domain) - Keeping all existing lines
  const staticPages: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: 'daily' as const, 
      priority: 1.0 
    },
    { 
      url: `${baseUrl}/lms`,
      lastModified: new Date(), 
      changeFrequency: 'weekly' as const, 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/xat-score-calculator-2026`, 
      lastModified: new Date(), 
      changeFrequency: 'weekly' as const, 
      priority: 0.9 
    },
    {
      url: `${baseUrl}/forms-and-deadlines/jee`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/forms-and-deadlines/cuet`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/forms-and-deadlines/law`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/forms-and-deadlines/ipm`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
  ];

  // 2. Subdomain 1: Prep Pages
  const prepPages: MetadataRoute.Sitemap = [
    {
      url: prepBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }
    // You can add specific prep paths here like `${prepBaseUrl}/practice`
  ];

  // 3. Subdomain 2: Second Subdomain Pages
  const secondSubdomainPages: MetadataRoute.Sitemap = [
    {
      url: secondSubdomainUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }
  ];

  // 4. Blog Pages (Existing logic)
  const blogs = await getAllBlogs();
  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Returning everything combined: Static + Prep + Second Subdomain + Blogs
  return [
    ...staticPages, 
    ...prepPages, 
    ...secondSubdomainPages, 
    ...blogUrls
  ];
}
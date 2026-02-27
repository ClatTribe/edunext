import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/profile',
        '/account',
        '/login',
        '/register',
        '/api/',
      ],
    },
    // We use an array here to tell Google about both sitemaps
    sitemap: [
      'https://www.getedunext.com/sitemap.xml',
      'https://www.getedunext.com/college-list/sitemap.xml',
    ],
  };
}
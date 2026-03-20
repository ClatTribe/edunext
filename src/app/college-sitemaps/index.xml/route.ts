import { NextResponse } from 'next/server';

const baseUrl = 'https://www.getedunext.com';
const TOTAL_PAGES = 13; // 0 to 12

export async function GET() {
  const sitemaps = Array.from({ length: TOTAL_PAGES }, (_, i) => {
    return `
    <sitemap>
      <loc>${baseUrl}/college-sitemaps/${i}.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
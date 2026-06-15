import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 1000;

// Sitemap index for the programmatic /best-colleges/* pages.
// Lists one child sitemap per CHUNK_SIZE published pages.
export async function GET() {
  try {
    const { count, error } = await supabase
      .from('seo_pages')
      .select('*', { count: 'exact', head: true })
      .eq('qualifies', true)
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching seo_pages count for sitemap:', error);
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }

    const totalPages = count || 0;
    const totalSitemaps = Math.ceil(totalPages / CHUNK_SIZE) || 1; // At least 1

    const sitemaps = Array.from({ length: totalSitemaps }, (_, i) => {
      return `
    <sitemap>
      <loc>${baseUrl}/seo-sitemaps/${i}.xml</loc>
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
  } catch (err) {
    console.error('SEO sitemap index error:', err);
    return new NextResponse('Server Error', { status: 500 });
  }
}

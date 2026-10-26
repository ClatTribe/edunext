import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 500;

export async function GET() {
  try {
    // Count colleges to decide how many sitemap chunks to list.
    // 'planned' uses Postgres statistics (instant) instead of counting every row,
    // which was timing out and returning "Error:" to Google.
    const { count, error } = await supabase
      .from('college_microsites')
      .select('id', { count: 'planned', head: true });

    if (error) {
      console.error('College count failed for sitemap index, using fallback:', error);
    }

    // Fallback: if the count fails, still return a valid index. Chunks past the
    // last college return an empty (valid) urlset, so over-listing is harmless.
    const FALLBACK_PAGES = 100;
    const totalColleges = count || 0;
    const totalPages = totalColleges > 0 ? Math.ceil(totalColleges / CHUNK_SIZE) + 1 : FALLBACK_PAGES;

    const sitemaps = Array.from({ length: totalPages }, (_, i) => {
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
  } catch (err) {
    console.error('Sitemap index error:', err);
    return new NextResponse('Server Error', { status: 500 });
  }
}
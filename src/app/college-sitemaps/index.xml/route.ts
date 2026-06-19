import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 500;

export async function GET() {
  try {
    // Get total count of colleges to dynamically generate the correct number of sitemaps
    const { count, error } = await supabase
      .from('college_microsites')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching college count for sitemap:', error);
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }

    const totalColleges = count || 0;
    const totalPages = Math.ceil(totalColleges / CHUNK_SIZE) || 1; // At least 1 page

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

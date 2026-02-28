import { supabase } from '../../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 5000;

const subPaths = [
  '', 'admission', 'contact', 'courses', 
  'cutoff', 'fees', 'placement', 'ranking', 'reviews'
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise type
) {
  try {
    const { id } = await params;  // ← await params
    const chunkIndex = parseInt(id.replace('.xml', ''));

    console.log('PARAMS ID:', id, 'CHUNK:', chunkIndex);

    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }

    const from = chunkIndex * CHUNK_SIZE;
    const to = from + CHUNK_SIZE - 1;

    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('slug, updated_at')
      .range(from, to);

    console.log('College Sitemap Fetch:', { chunkIndex, from, to, count: colleges?.length, error });

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(`Supabase error: ${error.message}`, { status: 500 });
    }

    if (!colleges || colleges.length === 0) {
      return new NextResponse('No colleges found for this chunk', { status: 404 });
    }

    const urls = colleges.flatMap((college: { slug: string; updated_at?: string }) => {
      const lastMod = new Date(college.updated_at || new Date()).toISOString();
      return subPaths.map((path) => `
    <url>
      <loc>${baseUrl}/college/${college.slug}${path ? `/${path}` : ''}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${path === '' ? '0.9' : '0.6'}</priority>
    </url>`
      );
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400',
      },
    });

  } catch (err) {
    console.error('Sitemap route error:', err);
    return new NextResponse(`Server error: ${err}`, { status: 500 });
  }
}
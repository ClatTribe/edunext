import { supabase } from '../../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 1000;

// One chunk of the programmatic /best-colleges/* sitemap.
// /seo-sitemaps/0.xml, /seo-sitemaps/1.xml, ...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chunkIndex = parseInt(id.replace('.xml', ''));

    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }

    const from = chunkIndex * CHUNK_SIZE;
    const to = from + CHUNK_SIZE - 1;

    const { data: pages, error } = await supabase
      .from('seo_pages')
      .select('slug, updated_at')
      .eq('qualifies', true)
      .eq('is_published', true)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(`Supabase error: ${error.message}`, { status: 500 });
    }

    // Return an empty valid sitemap instead of 404 for out-of-range chunks
    if (!pages || pages.length === 0) {
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
      return new NextResponse(emptyXml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
        },
      });
    }

    const urls = pages.map((pg: any) => {
      const safeSlug = String(pg.slug).replace(/&/g, '&amp;');
      const lastMod = new Date(pg.updated_at || new Date()).toISOString();
      return `
      <url>
        <loc>${baseUrl}/best-colleges/${safeSlug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('SEO sitemap route error:', err);
    return new NextResponse(`Server error: ${err}`, { status: 500 });
  }
}

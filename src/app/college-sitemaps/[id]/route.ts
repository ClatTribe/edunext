import { supabase } from '../../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 1000;

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

    // FIXED: Order by id instead of updated_at so chunks stay stable
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('slug, updated_at, microsite_data')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(`Supabase error: ${error.message}`, { status: 500 });
    }

    // FIXED: Return empty valid sitemap instead of 404
    if (!colleges || colleges.length === 0) {
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

    const urls = colleges.flatMap((college: {
      slug: string;
      updated_at?: string;
      microsite_data?: any;
    }) => {
      const m = college.microsite_data || {};
      const lastMod = new Date(college.updated_at || new Date()).toISOString();

      const activePaths = [
        { path: '', show: true },
        { path: '/admission', show: !!m.admission },
        { path: '/contact', show: true },
        { path: '/course-&-fees', show: !!(m.fees?.length || m.courses?.length) },
        { path: '/cutoff', show: !!m.cutoff?.length },
        { path: '/placement', show: !!m.placement?.length },
        { path: '/ranking', show: !!m.ranking?.length },
        { path: '/reviews', show: !!m.reviews?.length },
      ].filter(item => item.show);

      return activePaths.map(({ path }) => {
        const safeSlug = college.slug.replace(/&/g, '&amp;');
        const safePath = path.replace(/&/g, '&amp;');

        return `
        <url>
          <loc>${baseUrl}/college/${safeSlug}${safePath}</loc>
          <lastmod>${lastMod}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>${path === '' ? '0.9' : '0.6'}</priority>
        </url>`;
      });
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
    console.error('Sitemap route error:', err);
    return new NextResponse(`Server error: ${err}`, { status: 500 });
  }
}
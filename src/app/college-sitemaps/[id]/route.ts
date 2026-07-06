import { supabase } from '../../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://www.getedunext.com';
const CHUNK_SIZE = 500;

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

    // Lightweight select: only the columns needed to build URLs + decide which
    // high-value subpages to include. (microsite_data is intentionally NOT
    // fetched — it is a huge blob and caused 500s / timeouts; its data is
    // already duplicated in these top-level columns.)
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('slug, updated_at, fees, courses, admission, cutoff, placement')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(`Supabase error: ${error.message}`, { status: 500 });
    }

    // Return empty valid sitemap instead of 404 for out-of-range chunks
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

    const urls = colleges.flatMap((college: any) => {
      const lastMod = new Date(college.updated_at || new Date()).toISOString();

      // Only the main page + high-value subpages (where data exists).
      // ranking / reviews / contact are intentionally excluded (thin / low value).
      const activePaths = [
        { path: '', show: true },
        { path: '/course-and-fees', show: !!(college.fees?.length || college.courses?.length) },
        { path: '/admission', show: !!college.admission?.length },
        { path: '/cutoff', show: !!college.cutoff?.length },
        { path: '/placement', show: !!college.placement?.length },
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

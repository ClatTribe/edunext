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

    // Fetch all necessary columns to determine page visibility correctly
    const { data: colleges, error } = await supabase
      .from('college_microsites')
      .select('slug, updated_at, microsite_data, fees, admission, cutoff, placement, ranking, reviews, courses')
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

    const urls = colleges.flatMap((college: any) => {
      // Safe parsing of microsite_data
      const m = typeof college.microsite_data === 'string'
        ? JSON.parse(college.microsite_data)
        : (college.microsite_data || {});
      
      const lastMod = new Date(college.updated_at || new Date()).toISOString();

      // Check for data in both microsite_data and the main college record
      const activePaths = [
        { path: '', show: true },
        { 
          path: '/admission', 
          show: !!(m.admission?.length || college.admission?.length || m.admission_section) 
        },
        { path: '/contact', show: true },
        { 
          path: '/course-and-fees', 
          show: !!(m.fees?.length || college.fees?.length || m.courses?.length || college.courses?.length) 
        },
        { path: '/cutoff', show: !!(m.cutoff?.length || college.cutoff?.length) },
        { path: '/placement', show: !!(m.placement?.length || college.placement?.length) },
        { path: '/ranking', show: !!(m.ranking?.length || college.ranking?.length) },
        { path: '/reviews', show: !!(m.reviews?.length || college.reviews?.length) },
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
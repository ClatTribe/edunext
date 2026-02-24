import { MetadataRoute } from 'next';
import { supabase } from '../../../lib/supabase'; 

const COLLEGES_PER_SITEMAP = 2000;

export async function generateSitemaps() {
  const { count } = await supabase
    .from('college_microsites')
    .select('*', { count: 'exact', head: true });

  const totalSitemaps = Math.ceil((count || 0) / COLLEGES_PER_SITEMAP);
  return Array.from({ length: totalSitemaps }, (_, id) => ({ id }));
}

export default async function sitemap(props: any): Promise<MetadataRoute.Sitemap> {
  // 1. Await the props because Next.js 15 params/ids are asynchronous
  const resolvedProps = await props;
  
  // 2. Log exactly what we have to find the ID
  // In some Next.js versions it is props.id, in others it is props.params.id
  const idValue = resolvedProps.id ?? resolvedProps.params?.id;
  
  const numericId = parseInt(idValue, 10);
  const baseUrl = 'https://www.getedunext.com';

  // 3. Stop execution if numericId is still NaN
  if (isNaN(numericId)) {
    console.error('--- SITEMAP ERROR ---');
    console.log('Could not parse ID from props:', resolvedProps);
    return [];
  }

  const start = numericId * COLLEGES_PER_SITEMAP;
  const end = start + COLLEGES_PER_SITEMAP - 1;

  const { data: colleges, error } = await supabase
    .from('college_microsites')
    .select('slug, updated_at')
    .range(start, end);

  console.log(`--- SITEMAP ATTEMPT ---`);
  console.log(`Numeric ID: ${numericId} | Range: ${start}-${end} | Found: ${colleges?.length || 0}`);

  if (error || !colleges) return [];

  return colleges.flatMap((college: any) => {
    const lastMod = college.updated_at ? new Date(college.updated_at) : new Date();
    const subPaths = ['', 'admission', 'contact', 'courses', 'cutoff', 'fees', 'placement', 'ranking', 'reviews'];

    return subPaths.map((path) => ({
      url: `${baseUrl}/college/${college.slug}${path ? `/${path}` : ''}`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 0.9 : 0.6,
    }));
  });
}
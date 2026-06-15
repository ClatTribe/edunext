import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { extractSocialContent } from './src/app/lib/social-automation/gemini-extractor';
import { generateCarousel } from './src/app/lib/social-automation/satori-carousel';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: articles } = await supabase.from('edu_news').select('*').eq('is_magazine', true).order('published_at', { ascending: false }).limit(1);
  const article = articles[0];
  console.log('Article:', article.title);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const mc = await extractSocialContent(article.title, article.summary, article.content, GEMINI_API_KEY!);
  
  const content = {
      topic: 'EduNext Insight',
      hook: mc.carousel.slide1_hook,
      dataTitle: 'KEY INSIGHT',
      dataHook: mc.carousel.slide2_value.split('.')[0] + '.',
      dataBody: mc.carousel.slide2_value.split('.').slice(1).join('.').trim() || mc.carousel.slide2_value,
      pointsTitle: "Action Steps",
      points: mc.carousel.slide3_cta.split('.').map((s: string) => s.trim()).filter((s: string) => s.length > 5).slice(0, 4),
      ctaTitle: "Read the full blueprint",
      ctaUrl: `getedunext.com/magazine/${article.slug}`
  };

  const paths = await generateCarousel(content);
  console.log('Paths:', paths);
  
  const publicUrls = [];
  for (let i = 0; i < paths.length; i++) {
    const fileBuffer = fs.readFileSync(paths[i]);
    const fileName = `carousel_${Date.now()}_${i}.png`;
    await supabase.storage.from('social-media-temp').upload(fileName, fileBuffer, { contentType: 'image/png', upsert: true });
    const { data: pubUrl } = supabase.storage.from('social-media-temp').getPublicUrl(fileName);
    publicUrls.push(pubUrl.publicUrl);
  }
  
  console.log('URLs:', JSON.stringify(publicUrls, null, 2));
}

run().catch(console.error);

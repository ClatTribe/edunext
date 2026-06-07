import { NextRequest, NextResponse, after } from 'next/server';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { extractSocialContent } from '../../../lib/social-automation/gemini-extractor';
import { generateCarouselImages, generateCarousel } from '../../../lib/social-automation/satori-carousel';
import { getManualContent } from '../../../lib/social-automation/manual-content';
import { generateTTS, renderRemotionVideo } from '../../../lib/social-automation/video-generator';
import { publishInstagramCarousel } from '../../../lib/social-automation/graph-api';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

/**
 * Uploads local images to Supabase Storage and returns their public URLs.
 */
async function uploadToSupabaseStorage(supabase: any, filePaths: string[]): Promise<string[]> {
  const publicUrls: string[] = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `carousel_${Date.now()}_${i}.png`;
    
    console.log(`Uploading ${fileName} to Supabase...`);
    const { data, error } = await supabase.storage
      .from('social-media-temp')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload image to Supabase');
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('social-media-temp')
      .getPublicUrl(fileName);
      
    publicUrls.push(publicUrlData.publicUrl);
  }
  
  return publicUrls;
}

export async function GET(request: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const useManual = process.env.USE_MANUAL_SCRIPT === 'true';
  const preview = request.nextUrl.searchParams.get('preview') === 'true';
  if (!GEMINI_API_KEY && !useManual) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY (or set USE_MANUAL_SCRIPT=true)' }, { status: 500 });
  }

  // Build the structured carousel content from manual content (or Gemini).
  async function buildCarouselContent(article: any) {
    const magazineUrl = `getedunext.com/magazine/${article.slug}`;
    let mc;
    if (useManual) {
      mc = getManualContent();
    } else {
      try {
        mc = await extractSocialContent(article.title, article.summary, article.content, GEMINI_API_KEY!);
      } catch (e) {
        console.warn('Gemini failed for social content, using dynamic fallback:', e);
        mc = {
          carousel: {
            slide1_hook: `Latest: ${article.title.substring(0, 40)}...`,
            slide2_value: article.summary,
            slide3_cta: `Read the full story at getedunext.com/magazine`,
          },
          instagram_caption: `${article.title} 🚨\n\n${article.summary}\n\nRead the full deep-dive at 👉 getedunext.com/magazine\n\n#EduNext #LatestNews #Education`,
          reel: { script: '' }
        };
      }
    }
    return {
      topic: 'EduNext Insight',
      hook: mc.carousel.slide1_hook,
      dataTitle: 'KEY INSIGHT',
      dataHook: mc.carousel.slide2_value.split('.')[0] + '.',
      dataBody: mc.carousel.slide2_value.split('.').slice(1).join('.').trim() || mc.carousel.slide2_value,
      pointsTitle: "Action Steps",
      points: mc.carousel.slide3_cta.split('.').map(s => s.trim()).filter(s => s.length > 5).slice(0, 4),
      ctaTitle: "Read the full blueprint",
      ctaUrl: magazineUrl,
      _caption: mc.instagram_caption,
      _magazineUrl: `https://www.${magazineUrl}`,
    };
  }

  // ---------------- PREVIEW: render the 4 slides, return URLs, NO posting ----------------
  if (preview) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { data: articles } = await supabase
        .from('edu_news').select('id, title, summary, content, slug')
        .eq('is_magazine', true).order('published_at', { ascending: false }).limit(1);
      if (!articles || articles.length === 0) {
        return NextResponse.json({ error: 'No magazine article found.' }, { status: 404 });
      }
      const content = await buildCarouselContent(articles[0]);
      console.log('Rendering 4-slide carousel preview...');
      const paths = await generateCarousel(content);
      const imageUrls = await uploadToSupabaseStorage(supabase, paths);
      return NextResponse.json({
        success: true, preview: true, slides: imageUrls.length,
        images: imageUrls, magazine_url: content._magazineUrl,
        note: 'Carousel preview (4 slides). NOT posted.',
      });
    } catch (e) {
      return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
  }

  // Check for Meta tokens
  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const IG_USER_ID = process.env.IG_USER_ID;

  if (!META_ACCESS_TOKEN || !IG_USER_ID) {
    console.log('Missing Meta Graph API credentials. Skipping Instagram publish.');
  }

  after(async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: articles } = await supabase
        .from('edu_news')
        .select('id, title, summary, content, slug')
        .eq('is_magazine', true)
        .order('published_at', { ascending: false })
        .limit(1);

      if (!articles || articles.length === 0) {
        console.log('No magazine articles found to process.');
        return;
      }

      const article = articles[0];
      console.log('Processing article for social media: ' + article.title);

      const content = await buildCarouselContent(article);
      const carouselPaths = await generateCarousel(content);
      console.log('Generated 4-slide carousel:', carouselPaths.length);

      if (META_ACCESS_TOKEN && IG_USER_ID) {
        const imageUrls = await uploadToSupabaseStorage(supabase, carouselPaths);
        console.log('Public image URLs:', imageUrls);
        await publishInstagramCarousel(IG_USER_ID, META_ACCESS_TOKEN, imageUrls, content._caption);
      } else {
        console.log('Meta tokens not found in .env, skipping Graph API publish step.');
      }

      console.log('Social automation pipeline completed successfully!');
    } catch (error) {
      console.error('Error in social automation pipeline:', error);
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Social pipeline triggered successfully. Check Vercel logs for processing details.',
  });
}

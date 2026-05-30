import { NextRequest, NextResponse, after } from 'next/server';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { extractSocialContent } from '../../../lib/social-automation/gemini-extractor';
import { generateCarouselImages } from '../../../lib/social-automation/satori-carousel';
import { generateTTS, renderRemotionVideo } from '../../../lib/social-automation/video-generator';
import { publishInstagramCarousel } from '../../../lib/social-automation/graph-api';

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

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
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

      const socialContent = await extractSocialContent(
        article.title, 
        article.summary, 
        article.content, 
        GEMINI_API_KEY
      );
      console.log('Extracted social content:', socialContent);

      const carouselPaths = await generateCarouselImages(
        socialContent.carousel.slide1_hook,
        socialContent.carousel.slide2_value,
        socialContent.carousel.slide3_cta
      );
      console.log('Generated carousel images:', carouselPaths);

      if (META_ACCESS_TOKEN && IG_USER_ID) {
        // Upload images to Supabase first to get public URLs
        const imageUrls = await uploadToSupabaseStorage(supabase, carouselPaths);
        console.log('Public image URLs:', imageUrls);

        // Publish via Graph API
        const caption = socialContent.instagram_caption;
        
        await publishInstagramCarousel(IG_USER_ID, META_ACCESS_TOKEN, imageUrls, caption);
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

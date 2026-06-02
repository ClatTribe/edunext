import { NextRequest, NextResponse, after } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { extractSocialContent } from '../../../lib/social-automation/gemini-extractor';
import { generateTTS, renderRemotionVideo } from '../../../lib/social-automation/video-generator';
import { publishInstagramReel } from '../../../lib/social-automation/graph-api';
import { uploadToYouTubeShorts } from '../../../lib/social-automation/youtube-api';

/**
 * Uploads a local MP4 file to Supabase Storage and returns its public URL.
 */
async function uploadVideoToSupabase(supabase: any, filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `reel_${Date.now()}.mp4`;
  
  console.log(`Uploading ${fileName} to Supabase...`);
  const { data, error } = await supabase.storage
    .from('social-media-temp')
    .upload(fileName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });
    
  if (error) {
    console.error('Supabase video upload error:', error);
    throw new Error('Failed to upload video to Supabase');
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('social-media-temp')
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
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
      console.log('Processing Reel for article: ' + article.title);

      const socialContent = await extractSocialContent(
        article.title, 
        article.summary, 
        article.content, 
        GEMINI_API_KEY
      );
      
      const script = socialContent.reel.script;
      console.log('Extracted Script:', script);

      // 1. Generate Voice (TTS)
      console.log('Generating TTS Audio...');
      const { audioUrl, durationInSeconds } = await generateTTS(script);

      // 2. Load Logo for Video Watermark
      let logoDataUri = '';
      try {
        const logoPath = path.join(process.cwd(), 'public', 'whitelogo.svg');
        const logoSvg = fs.readFileSync(logoPath, 'utf8');
        logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
      } catch (err) {
        console.warn('Could not load whitelogo.svg for video watermark.', err);
      }

      // 3. Render Remotion Video
      console.log('Rendering Remotion Video... (This might take a while)');
      const bgmUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Free royalty-free lo-fi bgm
      const dataPoints = socialContent.reel.data_points || [];
      const imageKeywords = socialContent.reel.image_keywords || ['education', 'student', 'exam'];
      const videoPath = await renderRemotionVideo(script, audioUrl, durationInSeconds, imageKeywords, logoDataUri, bgmUrl, dataPoints);
      console.log('Video rendered locally at:', videoPath);

      if (META_ACCESS_TOKEN && IG_USER_ID) {
        // 4. Upload to Supabase to get public URL for Meta
        const publicVideoUrl = await uploadVideoToSupabase(supabase, videoPath);
        console.log('Public Video URL:', publicVideoUrl);

        // 5. Publish via Graph API
        const caption = socialContent.instagram_caption;
        await publishInstagramReel(IG_USER_ID, META_ACCESS_TOKEN, publicVideoUrl, caption);
      } else {
        console.log('Meta tokens not found in .env, skipping Graph API publish step.');
      }

      // 6. Publish to YouTube Shorts
      const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
      if (YOUTUBE_REFRESH_TOKEN) {
        try {
          console.log('Publishing to YouTube Shorts...');
          const ytTitle = article.title.length > 90 ? article.title.substring(0, 87) + '...' : article.title;
          const ytDescription = socialContent.instagram_caption || article.summary;
          await uploadToYouTubeShorts(videoPath, ytTitle, ytDescription, ['education', 'edunext', 'shorts']);
        } catch (ytError) {
          console.error('Error publishing to YouTube Shorts:', ytError);
        }
      } else {
         console.log('Missing YouTube tokens. Skipping YouTube Shorts publish.');
      }

      console.log('Reel automation pipeline completed successfully!');
    } catch (error) {
      console.error('Error in Reel automation pipeline:', error);
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Reel pipeline triggered successfully. Check console/logs for progress.',
  });
}

import * as googleTTS from 'google-tts-api';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Downloads speech from google-tts-api. 
 * Since google tts has a 200 char limit per request, 
 * we split long text and download as multiple chunks if needed,
 * but for 50-word scripts, it usually fits.
 */
export async function generateTTS(text: string): Promise<string> {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  if (elevenLabsKey) {
    console.log('Using ElevenLabs TTS (Premium Voice)...');
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // 'Adam' Voice ID
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return 'data:audio/mp3;base64,' + buffer.toString('base64');
    
  } else {
    console.log('Falling back to free Google TTS...');
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?',
    });

    const buffers = results.map((r) => Buffer.from(r.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    return 'data:audio/mp3;base64,' + finalBuffer.toString('base64');
  }
}

/**
 * Bundles and renders the Remotion video.
 * WARNING: Running this on Vercel requires ffmpeg-static and high memory limits.
 */
export async function renderRemotionVideo(
  text: string, 
  audioUrl: string, 
  logoDataUri: string = '',
  bgmUrl: string = '',
  dataPoints: any[] = [],
  outputDir: string = os.tmpdir()
): Promise<string> {
  // Dynamic import to avoid breaking standard Next.js pages
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');
  
  const bundled = await bundle({
    entryPoint: path.resolve(process.cwd(), 'src/remotion/index.tsx'),
    // We use esbuild for speed on serverless
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'Reel',
    inputProps: { text, audioUrl, logoDataUri, bgmUrl, dataPoints },
  });

  const outputLocation = path.join(outputDir, 'reel_' + Date.now() + '.mp4');

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation,
    inputProps: { text, audioUrl, logoDataUri, bgmUrl, dataPoints },
  });

  return outputLocation;
}

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
  
  // For long scripts, getAudioUrl returns a single URL if it fits,
  // or we can use getAllAudioBase64 for longer text.
  try {
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?',
    });

    // Concatenate base64 chunks
    const buffers = results.map((result) => Buffer.from(result.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    
    const dataUri = 'data:audio/mp3;base64,' + finalBuffer.toString('base64');
    return dataUri;
  } catch (err) {
    console.error('TTS Error:', err);
    throw new Error('Failed to generate TTS');
  }
}

/**
 * Bundles and renders the Remotion video.
 * WARNING: Running this on Vercel requires ffmpeg-static and high memory limits.
 */
export async function renderRemotionVideo(
  text: string, 
  audioUrl: string, 
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
    inputProps: { text, audioUrl },
  });

  const outputLocation = path.join(outputDir, 'reel_' + Date.now() + '.mp4');

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation,
    inputProps: { text, audioUrl },
  });

  return outputLocation;
}

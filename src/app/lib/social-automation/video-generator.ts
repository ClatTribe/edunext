import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseFile } from 'music-metadata';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/**
 * Generates speech using Microsoft Edge Neural TTS (Free, Premium Quality).
 * Uses en-IN-NeerjaNeural for perfect Indian female accent.
 */
export async function generateTTS(text: string): Promise<{ audioUrl: string; durationInSeconds: number }> {
  console.log('Using Free Premium Edge TTS (en-IN-NeerjaNeural)...');
  
  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const { audioStream } = await tts.toStream(text);
  const chunks: Buffer[] = [];
  
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  
  const finalBuffer = Buffer.concat(chunks);
  
  // Save temp file to measure exact length
  const tempAudioPath = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
  fs.writeFileSync(tempAudioPath, finalBuffer);
  
  try {
    const meta = await parseFile(tempAudioPath);
    const durationInSeconds = meta.format.duration ?? 30;
    console.log(`TTS Audio generated successfully. Exact duration: ${durationInSeconds.toFixed(2)} seconds.`);
    
    return {
      audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'),
      durationInSeconds
    };
  } catch (err) {
    console.error('Failed to calculate mp3 duration, falling back to estimate:', err);
    // Rough estimate: 150 words per minute -> 2.5 words per second
    const estimate = text.split(' ').length / 2.5;
    return {
      audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'),
      durationInSeconds: estimate
    };
  }
}

/**
 * Bundles and renders the Remotion video.
 */
export async function renderRemotionVideo(
  text: string, 
  audioUrl: string, 
  audioDurationInSeconds: number, // <--- NEW PROP
  imageKeywords: string[] = [],  // <--- NEW PROP
  logoDataUri: string = '',
  bgmUrl: string = '',
  dataPoints: any[] = [],
  outputDir: string = os.tmpdir()
): Promise<string> {
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');
  
  const bundled = await bundle({
    entryPoint: path.resolve(process.cwd(), 'src/remotion/index.tsx'),
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'Reel',
    inputProps: { text, audioUrl, audioDurationInSeconds, imageKeywords, logoDataUri, bgmUrl, dataPoints },
  });

  const outputLocation = path.join(outputDir, 'reel_' + Date.now() + '.mp4');

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation,
    inputProps: { text, audioUrl, audioDurationInSeconds, imageKeywords, logoDataUri, bgmUrl, dataPoints },
  });

  return outputLocation;
}

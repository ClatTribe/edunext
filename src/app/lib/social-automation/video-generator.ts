// src/app/lib/social-automation/video-generator.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseFile } from 'music-metadata';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/**
 * Generates speech using Microsoft Edge Neural TTS (Free, Premium Quality).
 * Uses en-IN-NeerjaNeural for a natural Indian female accent.
 */
export async function generateTTS(text: string, rate: string = '+18%'): Promise<{ audioUrl: string; durationInSeconds: number }> {
  console.log(`Using Free Premium Edge TTS (en-IN-NeerjaNeural, rate ${rate})...`);

  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  // rate = faster delivery for a more energetic, less sluggish pace.
  const { audioStream } = await tts.toStream(text, { rate });
  const chunks: Buffer[] = [];

  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const finalBuffer = Buffer.concat(chunks);

  const tempAudioPath = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
  fs.writeFileSync(tempAudioPath, finalBuffer);

  try {
    const meta = await parseFile(tempAudioPath);
    const durationInSeconds = meta.format.duration ?? 30;
    console.log(`TTS Audio generated. Exact duration: ${durationInSeconds.toFixed(2)}s.`);
    return {
      audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'),
      durationInSeconds,
    };
  } catch (err) {
    console.error('Failed to calc mp3 duration, estimating:', err);
    const estimate = text.split(' ').length / 2.5;
    return {
      audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'),
      durationInSeconds: estimate,
    };
  }
}

/**
 * MODULATED Neerja narration. Splits the script into sentences and gives each a
 * pitch + rate from a natural arc: calm/low at the start, rising energy + emphasis
 * through the body, then settling lower for a smooth outro. Concatenates the
 * segments into one human-sounding track (punctuation already adds the pauses).
 */
export async function generateModulatedTTS(text: string): Promise<{ audioUrl: string; durationInSeconds: number }> {
  const sentences =
    (text.match(/[^.!?…]+[.!?…]*/g) || [text]).map((s) => s.trim()).filter(Boolean);
  const N = sentences.length;

  const sign = (n: number) => (n >= 0 ? '+' : '') + Math.round(n) + '%';
  // Wider arc = more noticeable modulation: low/calm -> high energy -> soft outro.
  const arc = (p: number) => {
    const pitch = p <= 0.7 ? -10 + (p / 0.7) * 20 : 10 + ((p - 0.7) / 0.3) * -18; // -10% -> +10% -> -8%
    const rate = p <= 0.6 ? 4 + (p / 0.6) * 20 : 24 + ((p - 0.6) / 0.4) * -18;     // +4% -> +24% -> +6%
    return { pitch, rate };
  };

  const buffers: Buffer[] = [];
  let totalDuration = 0;

  for (let i = 0; i < N; i++) {
    const p = N > 1 ? i / (N - 1) : 0.4;
    const seg = sentences[i];
    let { pitch, rate } = arc(p);
    // Punctuation-driven emotion layered on the arc.
    if (seg.includes('!')) { pitch += 5; rate += 4; }   // excitement / emphasis
    else if (seg.includes('?')) { pitch += 5; }          // question lift
    if (seg.includes('…') || seg.includes('...')) { rate -= 8; } // thoughtful, slower
    const tts = new MsEdgeTTS();
    await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(seg, { rate: sign(rate), pitch: sign(pitch) });
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const segBuf = Buffer.concat(chunks);
    buffers.push(segBuf);
    try {
      const tmp = path.join(os.tmpdir(), `seg_${Date.now()}_${i}.mp3`);
      fs.writeFileSync(tmp, segBuf);
      const meta = await parseFile(tmp);
      totalDuration += meta.format.duration ?? sentences[i].split(' ').length / 2.6;
      fs.unlinkSync(tmp);
    } catch {
      totalDuration += sentences[i].split(' ').length / 2.6;
    }
  }

  const finalBuffer = Buffer.concat(buffers);
  console.log(`Modulated Neerja: ${N} segments, ~${totalDuration.toFixed(1)}s (low->high->low arc).`);
  return { audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'), durationInSeconds: totalDuration };
}

/**
 * SCENE narration audio. One Neerja segment per scene with the low->high->low arc
 * PLUS extra emphasis when the line contains ALL-CAPS words (higher pitch + energy).
 * Returns the concatenated audio + each scene's exact duration (drives the cuts).
 */
export async function generateSceneAudio(
  narrations: string[]
): Promise<{ audioUrl: string; sceneDurations: number[]; totalDuration: number }> {
  const N = narrations.length;
  const sign = (n: number) => (n >= 0 ? '+' : '') + Math.round(n) + '%';
  const buffers: Buffer[] = [];
  const sceneDurations: number[] = [];
  let total = 0;

  for (let i = 0; i < N; i++) {
    const seg = narrations[i];
    // CONSTANT pitch = one consistent voice throughout (no more "voice changes" feel).
    // Emotion/modulation comes from punctuation pauses + a SUBTLE rate change only
    // (slower = weightier). Pitch never changes, so it stays the same single voice.
    const pitch = '+0%';
    let rate = 10; // lively, consistent narration pace
    if (seg.includes('…') || seg.includes('...')) rate -= 8;            // thoughtful trailing -> slower
    else if ((seg.match(/\b[A-Z]{3,}\b/g) || []).length > 0) rate -= 4; // ALL-CAPS weight -> slightly slower

    const tts = new MsEdgeTTS();
    await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(seg, { rate: sign(rate), pitch });
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const segBuf = Buffer.concat(chunks);
    buffers.push(segBuf);

    let dur = seg.split(' ').length / 2.6;
    try {
      const tmp = path.join(os.tmpdir(), `scn_${Date.now()}_${i}.mp3`);
      fs.writeFileSync(tmp, segBuf);
      const meta = await parseFile(tmp);
      if (meta.format.duration) dur = meta.format.duration;
      fs.unlinkSync(tmp);
    } catch { /* keep estimate */ }
    sceneDurations.push(dur);
    total += dur;
  }

  const finalBuffer = Buffer.concat(buffers);
  console.log(`Scene audio: ${N} scenes, ~${total.toFixed(1)}s.`);
  return { audioUrl: 'data:audio/mp3;base64,' + finalBuffer.toString('base64'), sceneDurations, totalDuration: total };
}

/** Render the faceless SCENE composition (id "SceneReel") to an mp4. */
export async function renderSceneVideo(opts: {
  scenes: any[];
  imageUrls: string[];
  sceneDurations: number[];
  audioRelPath: string;
  totalDuration: number;
  outputDir?: string;
}): Promise<string> {
  const { scenes, imageUrls, sceneDurations, audioRelPath, totalDuration, outputDir = os.tmpdir() } = opts;
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');
  const bundled = await bundle({ entryPoint: path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'src/remotion/index.tsx'), webpackOverride: (c) => c });
  const inputProps = { scenes, imageUrls, sceneDurations, audioRelPath, audioDurationInSeconds: totalDuration };
  const composition = await selectComposition({ serveUrl: bundled, id: 'SceneReel', inputProps });
  const outputLocation = path.join(outputDir, 'scene_' + Date.now() + '.mp4');
  await renderMedia({ composition, serveUrl: bundled, codec: 'h264', outputLocation, inputProps });
  return outputLocation;
}

export interface RenderReelOptions {
  text: string;
  audioUrl?: string;            // Edge-TTS data URI (template mode). Omit in face mode.
  audioDurationInSeconds: number;
  imageKeywords?: string[];
  imageUrls?: string[];         // dynamic Unsplash URLs (template mode)
  faceVideoUrl?: string;        // Tavus video public URL (face mode)
  logoDataUri?: string;
  bgmUrl?: string;
  dataPoints?: any[];
  quoteText?: string;
  overlayOnly?: boolean;   // render transparent graphics-only layer (ProRes 4444 .mov)
  wordFrames?: number[];   // pause-aware per-word frame timings (silence-synced captions)
  outputDir?: string;
}

/**
 * Bundles and renders the Remotion "Reel" composition.
 * Works for BOTH faceless (template) and Tavus face-day reels.
 */
export async function renderRemotionVideo(opts: RenderReelOptions): Promise<string> {
  const {
    text,
    audioUrl = '',
    audioDurationInSeconds,
    imageKeywords = [],
    imageUrls = [],
    faceVideoUrl = '',
    logoDataUri = '',
    bgmUrl = '',
    dataPoints = [],
    quoteText = '',
    overlayOnly = false,
    wordFrames = [],
    outputDir = os.tmpdir(),
  } = opts;

  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');

  const bundled = await bundle({
    entryPoint: path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'src/remotion/index.tsx'),
    webpackOverride: (config) => config,
  });

  const inputProps = {
    text,
    audioUrl,
    audioDurationInSeconds,
    imageKeywords,
    imageUrls,
    faceVideoUrl,
    logoDataUri,
    bgmUrl,
    dataPoints,
    quoteText,
    overlayOnly,
    wordFrames,
  };

  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'Reel',
    inputProps,
  });

  const outputLocation = path.join(outputDir, 'reel_' + Date.now() + (overlayOnly ? '.mov' : '.mp4'));

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: overlayOnly ? 'prores' : 'h264',
    ...(overlayOnly ? { proResProfile: '4444', pixelFormat: 'yuva444p10le', imageFormat: 'png' } : {}),
    outputLocation,
    inputProps,
  });

  return outputLocation;
}

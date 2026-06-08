// src/app/api/cron/publish-reel/route.ts
//
// EduNext Reel automation — with Tavus AI talking-head ("face") days.
//
// FACE DAYS now use AUDIO-DRIVEN Tavus:
//   1. Generate Edge-TTS "Neerja" audio from the (length-controlled) script.
//   2. Upload it and feed it to Tavus -> the replica lip-syncs to YOUR voice.
//   3. Wrap the talking head in the branded Remotion frame
//      (widgets + logo + gradient + SYNCED subtitles, 22-28s).
//   4. Upload + publish to Instagram & YouTube — same as the old pipeline.
//
// DAILY LOGIC (no params):
//   - Face day  = dayOfYear % 3 === 0 AND under FACE_CAP/month.
//   - Template  = every other day (faceless Remotion + rotating images).
//
// MANUAL TESTING:
//   Raw Tavus only (quick, returns hosted_url, NO posting):
//     ?secret=...&force=face&preview=true
//   FULL branded reel, returns a URL, NO posting (recommended to review before going live):
//     ?secret=...&force=face&previewbranded=true
//   FULL branded reel + PUBLISH to Instagram/YouTube:
//     ?secret=...&force=face
//   Faceless template run:
//     ?secret=...&force=template

import { NextRequest, NextResponse, after } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { parseFile } from 'music-metadata';
import { createClient } from '@supabase/supabase-js';
import { extractSocialContent } from '../../../lib/social-automation/gemini-extractor';
import { getManualContent, getManualScenes } from '../../../lib/social-automation/manual-content';
import { getScenesContent } from '../../../lib/social-automation/content-generator';
import { generateTTS, generateModulatedTTS, generateSceneAudio, renderRemotionVideo, renderSceneVideo } from '../../../lib/social-automation/video-generator';
import { publishInstagramReel } from '../../../lib/social-automation/graph-api';
import { uploadToYouTubeShorts } from '../../../lib/social-automation/youtube-api';
import { generateTavusVideo, pollTavusVideo } from '../../../lib/social-automation/tavus-api';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const FACE_CAP = 10;                 // max Tavus face videos / month (free quota guard)
const PRIMARY_WORDS = 70;            // faster Neerja (+18%) -> more words keep it ~22-26s
const SHORT_WORDS = 60;              // fallback only if the first take runs long
const MAX_SECONDS = 28;              // hard ceiling -> re-trim
const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function trimScript(script: string, maxWords: number): string {
  const words = script.trim().split(/\s+/);
  if (words.length <= maxWords) return script.trim();
  const slice = words.slice(0, maxWords).join(' ');
  const lastStop = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf('!'), slice.lastIndexOf('?'));
  return lastStop > 40 ? slice.slice(0, lastStop + 1) : slice + '.';
}

async function uploadLocalVideo(supabase: any, filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `reel_${Date.now()}.mp4`;
  const { error } = await supabase.storage
    .from('social-media-temp')
    .upload(fileName, fileBuffer, { contentType: 'video/mp4', upsert: true });
  if (error) throw new Error('Supabase video upload failed: ' + error.message);
  return supabase.storage.from('social-media-temp').getPublicUrl(fileName).data.publicUrl;
}

/**
 * Resolve the ffmpeg binary. Next.js/Turbopack mangles ffmpeg-static's default
 * export path (e.g. "\ROOT\edunext\..."), so we also try the real path under cwd.
 */
function resolveFfmpeg(): string {
  const candidates = [
    typeof ffmpegPath === 'string' ? ffmpegPath : '',
    process.platform === 'win32'
      ? path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe')
      : path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'),
  ];
  for (const c of candidates) {
    try { if (c && fs.existsSync(c)) return c; } catch { /* ignore */ }
  }
  throw new Error('ffmpeg binary not found. Tried: ' + candidates.filter(Boolean).join(' | '));
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(resolveFfmpeg(), args);
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error('ffmpeg exited ' + code + ': ' + stderr.slice(-600)))
    );
  });
}

/** Run ffmpeg purely to capture its stderr (e.g. silencedetect output). */
function runFfmpegCapture(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(resolveFfmpeg(), args);
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', reject);
    proc.on('close', () => resolve(stderr));
  });
}

/** Detect spoken (non-silent) intervals in a media file via ffmpeg silencedetect. */
async function detectSpeechSegments(mediaPath: string, durationSeconds: number): Promise<[number, number][]> {
  let stderr = '';
  try {
    stderr = await runFfmpegCapture(['-i', mediaPath, '-af', 'silencedetect=noise=-34dB:d=0.20', '-f', 'null', '-']);
  } catch {
    return [[0, durationSeconds]];
  }
  const events: [string, number][] = [];
  const re = /silence_(start|end): ([0-9.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stderr)) !== null) events.push([m[1], parseFloat(m[2])]);

  const sil: [number, number][] = [];
  let cur: number | null = null;
  for (const [kind, val] of events) {
    if (kind === 'start') cur = val;
    else if (kind === 'end' && cur !== null) { sil.push([cur, val]); cur = null; }
  }
  if (cur !== null) sil.push([cur, durationSeconds]);

  const seg: [number, number][] = [];
  let prev = 0;
  for (const [s, e] of sil) {
    if (s > prev) seg.push([prev, s]);
    prev = Math.max(prev, e);
  }
  if (prev < durationSeconds) seg.push([prev, durationSeconds]);
  return seg.length ? seg : [[0, durationSeconds]];
}

/**
 * Pause-aware word timings (ported from the reference build_captions.py).
 * Maps each word index to the frame where it is actually spoken, by distributing
 * words across the real speech segments (skipping silences). Returns N+1 frames.
 */
async function computeWordFrames(mediaPath: string, script: string, durationSeconds: number, fps = 30): Promise<number[]> {
  const words = script.trim().split(/\s+/).filter(Boolean);
  const N = Math.max(words.length, 1);
  const seg = await detectSpeechSegments(mediaPath, durationSeconds);
  const T = seg.reduce((a, [s, e]) => a + (e - s), 0) || durationSeconds;

  const realTime = (speechElapsed: number): number => {
    let acc = 0;
    for (const [s, e] of seg) {
      const d = e - s;
      if (speechElapsed <= acc + d) return s + (speechElapsed - acc);
      acc += d;
    }
    return seg[seg.length - 1][1];
  };

  const frames: number[] = [];
  for (let i = 0; i <= N; i++) frames.push(Math.round(realTime((i / N) * T) * fps));
  return frames;
}

/**
 * Download the Tavus mp4, RE-ENCODE it to a clean constant-frame-rate H.264 file
 * written into public/temp-face/ so Remotion can load it as a LOCAL staticFile
 * (remote URLs are unreliable for the compositor's frame seeking). Returns the
 * relative path (for staticFile), absolute path (for cleanup) and real duration.
 */
async function prepareFaceVideo(
  downloadUrl: string
): Promise<{ faceRelPath: string; faceAbsPath: string; durationInSeconds: number }> {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error('Failed to download Tavus video: ' + res.status);
  const inPath = path.join(os.tmpdir(), `tav_in_${Date.now()}.mp4`);
  fs.writeFileSync(inPath, Buffer.from(await res.arrayBuffer()));

  // Write the re-encoded clip into public/temp-face so Remotion loads it as a
  // LOCAL staticFile. Remote (Supabase) URLs fail the compositor's frame seek.
  const publicFaceDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'temp-face');
  fs.mkdirSync(publicFaceDir, { recursive: true });
  const fileName = `face_${Date.now()}.mp4`;
  const outAbs = path.join(publicFaceDir, fileName);

  // Re-encode to CFR 30fps, yuv420p, faststart — reliably seekable by Remotion.
  // Scale + crop to full-bleed 1080x1920 portrait. This is the FACE BASE LAYER that
  // ffmpeg later composites the Remotion overlay onto. Remotion never decodes it,
  // so there is no possibility of a decode/seek glitch.
  await runFfmpeg([
    '-y', '-i', inPath,
    '-filter_complex',
    // full-bleed crop + a louder voice (pace is controlled by the modulated Neerja audio).
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v];[0:a]volume=1.4[a]',
    '-map', '[v]', '-map', '[a]',
    '-r', '30', '-fps_mode', 'cfr',
    '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart',
    outAbs,
  ]);

  let durationInSeconds = 25;
  try {
    const meta = await parseFile(outAbs);
    if (meta.format.duration) durationInSeconds = meta.format.duration;
  } catch (e) {
    console.warn('Could not probe face video duration:', (e as Error).message);
  }

  try { fs.unlinkSync(inPath); } catch {}

  return { faceRelPath: `temp-face/${fileName}`, faceAbsPath: outAbs, durationInSeconds };
}

/**
 * Composite a transparent Remotion overlay (.mov, ProRes 4444 alpha) on top of the
 * full-bleed Tavus face base (.mp4). Audio is taken from the face. Output .mp4.
 */
async function compositeFaceAndOverlay(faceAbs: string, overlayAbs: string): Promise<string> {
  const out = path.join(os.tmpdir(), `final_${Date.now()}.mp4`);
  const musicPath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'music.mp3');
  const hasMusic = fs.existsSync(musicPath);

  // With music: mix the replica voice (0:a, full) + looped bg music (0.10, low). normalize=0
  // keeps the voice at full level. Without music: just the replica voice.
  const args = hasMusic
    ? [
        '-y',
        '-i', faceAbs,
        '-i', overlayAbs,
        '-stream_loop', '-1', '-i', musicPath,
        '-filter_complex',
        '[0:v][1:v]overlay=0:0:format=auto[v];[2:a]volume=0.10[bg];[0:a][bg]amix=inputs=2:duration=first:normalize=0[a]',
        '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '160k',
        '-shortest',
        out,
      ]
    : [
        '-y',
        '-i', faceAbs,
        '-i', overlayAbs,
        '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto[v]',
        '-map', '[v]', '-map', '0:a?',
        '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k',
        '-shortest',
        out,
      ];
  await runFfmpeg(args);
  return out;
}

async function uploadVideoToSupabase(supabase: any, filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const fileName = `face_processed_${Date.now()}.mp4`;
  const { error } = await supabase.storage.from('social-media-temp').upload(fileName, buffer, {
    contentType: 'video/mp4',
    upsert: false,
  });
  if (error) throw new Error('Supabase video upload failed: ' + error.message);
  return supabase.storage.from('social-media-temp').getPublicUrl(fileName).data.publicUrl;
}

/** Decode the Edge-TTS data URI to a buffer and host it as a public mp3 (for Tavus audio_url). */
async function uploadAudioToSupabase(supabase: any, dataUri: string): Promise<string> {
  const b64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
  const buf = Buffer.from(b64, 'base64');
  const fileName = `tts_${Date.now()}.mp3`;
  const { error } = await supabase.storage
    .from('social-media-temp')
    .upload(fileName, buf, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error('Supabase audio upload failed: ' + error.message);
  return supabase.storage.from('social-media-temp').getPublicUrl(fileName).data.publicUrl;
}

async function fetchUnsplashImages(keywords: string[], accessKey?: string): Promise<string[]> {
  if (!accessKey) return [];
  const urls: string[] = [];
  for (const kw of keywords.slice(0, 4)) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(kw)}&per_page=2&orientation=portrait`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      const data = await res.json();
      (data.results || []).forEach((r: any) => {
        if (r?.urls?.regular) urls.push(r.urls.regular);
      });
    } catch (e) {
      console.warn('Unsplash fetch failed for', kw, e);
    }
  }
  return urls;
}

async function faceReelsThisMonth(supabase: any): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('face_reel_log')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString());
  return count || 0;
}

async function logFaceReel(supabase: any, tavusVideoId: string) {
  // Non-fatal: a missing table must never block publishing.
  try {
    const { error } = await supabase.from('face_reel_log').insert({ tavus_video_id: tavusVideoId });
    if (error) console.warn('face_reel_log insert skipped:', error.message);
  } catch (e) {
    console.warn('face_reel_log insert failed (non-fatal):', (e as Error).message);
  }
}

/** Social content: hand-written manual content (Gemini bypass) when USE_MANUAL_SCRIPT=true, else Gemini. */
async function getSocialContent(article: any, geminiKey?: string) {
  if (process.env.USE_MANUAL_SCRIPT === 'true') {
    console.log('Using MANUAL script (Gemini bypass).');
    return getManualContent();
  }
  return extractSocialContent(article.title, article.summary, article.content, geminiKey!);
}

function loadLogoDataUri(): string {
  try {
    const logoSvg = fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'whitelogo.svg'), 'utf8');
    return `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
  } catch {
    return '';
  }
}

/** Write the narration data-URI to public/temp-audio so Remotion can load it via staticFile. */
async function saveNarrationAudio(dataUri: string): Promise<{ rel: string; abs: string }> {
  const b64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
  const buf = Buffer.from(b64, 'base64');
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'temp-audio');
  fs.mkdirSync(dir, { recursive: true });
  const name = `narr_${Date.now()}.mp3`;
  const abs = path.join(dir, name);
  fs.writeFileSync(abs, buf);
  return { rel: `temp-audio/${name}`, abs };
}

/** One portrait stock image for a scene keyword (Unsplash), with a safe fallback. */
async function fetchOneUnsplash(keyword: string, accessKey?: string): Promise<string> {
  const FALLBACK = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop';
  if (!accessKey) return FALLBACK;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular || FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/**
 * Full faceless scene-reel pipeline: modulated Neerja narration + 3-4 block
 * backgrounds + ALL-CAPS captions + widgets + SFX -> render -> (optionally) post
 * to Instagram Reel + YouTube Short. Used by both the preview and the daily cron.
 */
async function runScenePipeline(
  supabase: any,
  article: any,
  env: { unsplash?: string; meta?: string; ig?: string; yt?: string; gemini?: string },
  doPublish: boolean
): Promise<{ publicVideoUrl: string; seconds: number; sceneCount: number; published: { instagram: boolean; youtube: boolean }; magazineUrl: string }> {
  const { title: ytTitle, scenes } = await getScenesContent(article, env.gemini);
  const socialContent = await getSocialContent(article, env.gemini);
  const narrations = scenes.map((s) => s.narration);
  console.log(`Scene pipeline: ${scenes.length} scenes. Generating narration...`);
  const { audioBuffers, sceneDurations, totalDuration } = await generateSceneAudio(narrations);
  
  // Upload audio chunks sequentially to avoid Supabase concurrent socket issues/0-byte files
  const audioUrls: string[] = [];
  for (let i = 0; i < audioBuffers.length; i++) {
    const buf = audioBuffers[i];
    if (!buf || buf.length === 0) {
      console.warn(`Warning: Audio buffer for scene ${i} is empty!`);
      audioUrls.push('');
      continue;
    }
    const name = `scene_${Date.now()}_${i}.mp3`;
    const { error } = await supabase.storage.from('social-media-temp').upload(name, buf, { contentType: 'audio/mpeg' });
    if (error) console.error(`Error uploading scene ${i}:`, error.message);
    const pubUrl = supabase.storage.from('social-media-temp').getPublicUrl(name).data.publicUrl;
    audioUrls.push(pubUrl);
  }

  const uniqueKw = Array.from(new Set(scenes.map((s) => s.background_keyword)));
  const uniqueImgs = await Promise.all(uniqueKw.map((k) => fetchOneUnsplash(k, env.unsplash)));
  const perBlock = Math.ceil(scenes.length / uniqueImgs.length);
  const imageUrls = scenes.map((_, i) => uniqueImgs[Math.min(Math.floor(i / perBlock), uniqueImgs.length - 1)]);
  const videoPath = await renderSceneVideo({ scenes, imageUrls, sceneDurations, audioUrls, totalDuration });
  const publicVideoUrl = await uploadLocalVideo(supabase, videoPath);

  const magazineUrl = `https://www.getedunext.com/magazine/${article.slug}`;
  const caption = socialContent.instagram_caption;

  const published = { instagram: false, youtube: false };
  if (doPublish) {
    if (env.meta && env.ig) {
      try { await publishInstagramReel(env.ig, env.meta, publicVideoUrl, caption); published.instagram = true; }
      catch (e) { console.error('IG reel publish failed:', e); }
    } else { console.log('Skipping IG — token/user missing.'); }
    if (env.yt) {
      try { await uploadToYouTubeShorts(videoPath, ytTitle.slice(0, 95), caption, ['education', 'edunext', 'shorts']); published.youtube = true; }
      catch (e) { console.error('YT short publish failed:', e); }
    } else { console.log('Skipping YouTube — refresh token missing.'); }
  }
  return { publicVideoUrl, seconds: Number(totalDuration.toFixed(1)), sceneCount: scenes.length, published, magazineUrl };
}

/** Build a length-controlled, MODULATED Neerja voiceover (low->high->low arc). */
async function buildVoiceover(rawScript: string) {
  let script = trimScript(rawScript, PRIMARY_WORDS);
  let tts = await generateModulatedTTS(script);
  if (tts.durationInSeconds > MAX_SECONDS) {
    console.log(`Voiceover ${tts.durationInSeconds.toFixed(1)}s > ${MAX_SECONDS}s — re-trimming.`);
    script = trimScript(rawScript, SHORT_WORDS);
    tts = await generateModulatedTTS(script);
  }
  console.log(`Voiceover ready: ${tts.durationInSeconds.toFixed(1)}s, ${script.split(' ').length} words.`);
  return { script, audioDataUri: tts.audioUrl, duration: tts.durationInSeconds };
}

/**
 * Generate a Tavus talking head that lip-syncs to OUR modulated Neerja audio.
 * Falls back to the replica's own voice (script mode) only if audio mode fails.
 */
async function generateFaceVideoUrl(
  supabase: any,
  apiKey: string,
  replicaId: string,
  script: string,
  audioDataUri: string,
  videoName: string
): Promise<{ faceVideoUrl: string; faceAbsPath: string; videoId: string; durationInSeconds: number }> {
  let videoId: string;
  let downloadUrl: string | undefined;
  try {
    const publicAudioUrl = await uploadAudioToSupabase(supabase, audioDataUri);
    const r = await generateTavusVideo(apiKey, { replicaId, audioUrl: publicAudioUrl, videoName });
    videoId = r.videoId;
    downloadUrl = (await pollTavusVideo(apiKey, videoId)).downloadUrl;
  } catch (e) {
    console.warn('Audio-driven Tavus failed, falling back to script mode:', (e as Error).message);
    const r = await generateTavusVideo(apiKey, { replicaId, script, videoName });
    videoId = r.videoId;
    downloadUrl = (await pollTavusVideo(apiKey, videoId)).downloadUrl;
  }
  if (!downloadUrl) throw new Error('Tavus returned no download URL.');

  const { faceRelPath, faceAbsPath, durationInSeconds } = await prepareFaceVideo(downloadUrl);
  return { faceVideoUrl: faceRelPath, faceAbsPath, videoId, durationInSeconds };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET || 'edunext-news-cron-2026';
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get('force');               // 'face' | 'template' | null
  const preview = request.nextUrl.searchParams.get('preview') === 'true';            // raw Tavus only
  const previewBranded = request.nextUrl.searchParams.get('previewbranded') === 'true'; // full reel, no post
  const reuseFace = request.nextUrl.searchParams.get('reuseface') === 'true'; // DEBUG: reuse last face, skip Tavus
  const sceneMode = request.nextUrl.searchParams.get('scene') === 'true' || process.env.SCENE_MODE === 'true'; // faceless scene reel
  const publish = request.nextUrl.searchParams.get('publish') === 'true'; // also post to IG Reel + YouTube Short

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!GEMINI_API_KEY && process.env.USE_MANUAL_SCRIPT !== 'true') {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY (or set USE_MANUAL_SCRIPT=true)' }, { status: 500 });
  }

  const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
  const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;
  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const IG_USER_ID = process.env.IG_USER_ID;
  const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) } }
  );

  // ----- decide mode -----
  const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  
  let mode: 'face' | 'template' =
    force === 'face' ? 'face' : force === 'template' ? 'template' : dayOfYear % 3 === 0 ? 'face' : 'template';

  if (mode === 'face' && force !== 'face') {
    const used = await faceReelsThisMonth(supabase);
    if (used >= FACE_CAP) {
      console.log(`Face cap reached (${used}/${FACE_CAP}) — switching to template.`);
      mode = 'template';
    }
  }

  if (mode === 'face' && (!TAVUS_API_KEY || !TAVUS_REPLICA_ID)) {
    if (force === 'face') {
      return NextResponse.json({ error: 'Missing TAVUS_API_KEY or TAVUS_REPLICA_ID' }, { status: 500 });
    }
    mode = 'template';
  }

  // ----- latest magazine article -----
  const { data: articles } = await supabase
    .from('edu_news')
    .select('id, title, summary, content, slug')
    .eq('is_magazine', true)
    .order('published_at', { ascending: false })
    .limit(1);
  if (!articles || articles.length === 0) {
    return NextResponse.json({ error: 'No magazine article found.' }, { status: 404 });
  }
  const article = articles[0];
  const videoName = `EduNext Reel ${new Date().toISOString().slice(0, 10)}`;

  // =========================================================================
  // SCENE MODE — faceless, scene-based reel (no Tavus). Modulated Neerja audio
  // + changing stock backgrounds + ALL-CAPS captions + widgets + SFX.
  // =========================================================================
  if (sceneMode && previewBranded) {
    try {
      const r = await runScenePipeline(
        supabase, article,
        { unsplash: UNSPLASH_ACCESS_KEY, meta: META_ACCESS_TOKEN, ig: IG_USER_ID, yt: YOUTUBE_REFRESH_TOKEN, gemini: GEMINI_API_KEY },
        publish
      );
      return NextResponse.json({
        success: true, preview_branded: true, scene_mode: true,
        scenes: r.sceneCount, seconds: r.seconds,
        branded_video_url: r.publicVideoUrl,
        magazine_url: r.magazineUrl,
        published: r.published,
        note: publish ? 'Scene reel rendered + published (see "published").' : 'Scene reel rendered. Add &publish=true to post.',
      });
    } catch (e) {
      return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
  }

  // =========================================================================
  // PREVIEW (raw Tavus, audio-driven, returns hosted_url, no posting)
  // =========================================================================
  if (preview && mode === 'face') {
    try {
      const socialContent = await getSocialContent(article, GEMINI_API_KEY);
      const { script, audioDataUri } = await buildVoiceover(socialContent.reel.script);
      const publicAudioUrl = await uploadAudioToSupabase(supabase, audioDataUri);
      const { videoId } = await generateTavusVideo(TAVUS_API_KEY!, { replicaId: TAVUS_REPLICA_ID!, audioUrl: publicAudioUrl, videoName });
      const tav = await pollTavusVideo(TAVUS_API_KEY!, videoId);
      return NextResponse.json({
        success: true, preview: true, article: article.title, script,
        tavus_video_id: videoId, hosted_url: tav.hostedUrl, download_url: tav.downloadUrl,
        note: 'Raw talking head, modulated Neerja voice. Use previewbranded=true for the full reel.',
      });
    } catch (e) {
      return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
  }

  // =========================================================================
  // PREVIEW BRANDED (full reel: face + widgets + subs + logo, returns URL, NO post)
  // =========================================================================
  if (previewBranded && mode === 'face') {
    try {
      // Persistent debug face (saved on a real run, reused for free layout testing).
      const debugDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'temp-face');
      const debugFace = path.join(debugDir, '_debug_last.mp4');
      const debugMeta = path.join(debugDir, '_debug_last.json');

      // ---------- REUSE PATH: skip TTS + Tavus, render the saved face (0 credits) ----------
      if (reuseFace) {
        if (!fs.existsSync(debugFace) || !fs.existsSync(debugMeta)) {
          return NextResponse.json({
            success: false,
            error: 'No saved face to reuse yet. Run once WITHOUT reuseface=true first to create it.',
          }, { status: 400 });
        }
        const meta = JSON.parse(fs.readFileSync(debugMeta, 'utf8'));
        console.log('REUSE FACE: skipping Tavus/TTS, rendering overlay + compositing _debug_last.mp4');
        const wordFrames = await computeWordFrames(debugFace, meta.script, meta.duration);
        const overlayPath = await renderRemotionVideo({
          text: meta.script,
          audioDurationInSeconds: meta.duration,
          overlayOnly: true,
          wordFrames,
          dataPoints: meta.dataPoints || [],
          quoteText: meta.quoteText || '',
          logoDataUri: loadLogoDataUri(),
        });
        const videoPath = await compositeFaceAndOverlay(debugFace, overlayPath);
        try { fs.unlinkSync(overlayPath); } catch { /* ignore */ }
        const publicVideoUrl = await uploadLocalVideo(supabase, videoPath);
        return NextResponse.json({
          success: true, preview_branded: true, reused_face: true, script: meta.script,
          seconds: Number(meta.duration.toFixed(1)), branded_video_url: publicVideoUrl,
          note: 'Reused the saved face (no Tavus credit used). Layout-only test.',
        });
      }

      // ---------- NORMAL PATH: generate fresh face (modulated Neerja), then SAVE for reuse ----------
      const socialContent = await getSocialContent(article, GEMINI_API_KEY);
      const { script, audioDataUri } = await buildVoiceover(socialContent.reel.script);
      const { faceVideoUrl, faceAbsPath, videoId, durationInSeconds: faceDuration } = await generateFaceVideoUrl(
        supabase, TAVUS_API_KEY!, TAVUS_REPLICA_ID!, script, audioDataUri, videoName
      );
      const renderSeconds = faceDuration; // trim glitchy Tavus tail + stay in-bounds
      const dataPoints = socialContent.reel.data_points || [];
      const quoteText = socialContent.carousel?.slide1_hook || '';

      // Save a persistent copy + metadata so reuseface=true can re-render for free.
      try {
        fs.mkdirSync(debugDir, { recursive: true });
        fs.copyFileSync(faceAbsPath, debugFace);
        fs.writeFileSync(debugMeta, JSON.stringify({ script, duration: renderSeconds, dataPoints, quoteText }));
      } catch (saveErr) {
        console.warn('Could not save debug face (non-fatal):', (saveErr as Error).message);
      }

      const wordFrames = await computeWordFrames(faceAbsPath, script, renderSeconds);
      const overlayPath = await renderRemotionVideo({
        text: script,
        audioDurationInSeconds: renderSeconds,
        overlayOnly: true,
        wordFrames,
        dataPoints,
        quoteText,
        logoDataUri: loadLogoDataUri(),
      });
      const videoPath = await compositeFaceAndOverlay(faceAbsPath, overlayPath);
      try { fs.unlinkSync(faceAbsPath); fs.unlinkSync(overlayPath); } catch { /* ignore */ }
      const publicVideoUrl = await uploadLocalVideo(supabase, videoPath);
      return NextResponse.json({
        success: true, preview_branded: true, article: article.title, script,
        seconds: Number(renderSeconds.toFixed(1)), tavus_video_id: videoId,
        branded_video_url: publicVideoUrl,
        note: 'Full branded reel. Face saved — add &reuseface=true next time to re-render free.',
      });
    } catch (e) {
      return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
  }

  // =========================================================================
  // NORMAL RUN — build + PUBLISH in background, respond immediately.
  // =========================================================================
  after(async () => {
    try {
      // SCENE MODE (faceless) — the daily automated path. Renders the scene reel
      // and posts it to Instagram Reel + YouTube Short, then stops (no face/Tavus).
      if (sceneMode) {
        const r = await runScenePipeline(
          supabase, article,
          { unsplash: UNSPLASH_ACCESS_KEY, meta: META_ACCESS_TOKEN, ig: IG_USER_ID, yt: YOUTUBE_REFRESH_TOKEN, gemini: GEMINI_API_KEY },
          true
        );
        console.log('Daily scene reel done. Published:', JSON.stringify(r.published));
        return;
      }

      console.log(`Reel pipeline starting in "${mode}" mode for: ${article.title}`);
      const socialContent = await getSocialContent(article, GEMINI_API_KEY);
      const caption = socialContent.instagram_caption;
      const dataPoints = socialContent.reel.data_points || [];
      const quoteText = socialContent.carousel?.slide1_hook || '';
      const logoDataUri = loadLogoDataUri();

      let videoPath: string;

      if (mode === 'face') {
        const { script, audioDataUri } = await buildVoiceover(socialContent.reel.script);
        const { faceVideoUrl, faceAbsPath, videoId, durationInSeconds: faceDuration } = await generateFaceVideoUrl(
          supabase, TAVUS_API_KEY!, TAVUS_REPLICA_ID!, script, audioDataUri, videoName
        );
        const renderSeconds = faceDuration;
        console.log('Rendering overlay + compositing face reel...', renderSeconds);
        const wordFrames = await computeWordFrames(faceAbsPath, script, renderSeconds);
        const overlayPath = await renderRemotionVideo({
          text: script,
          audioDurationInSeconds: renderSeconds,
          overlayOnly: true,
          wordFrames,
          dataPoints,
          quoteText,
          logoDataUri,
        });
        videoPath = await compositeFaceAndOverlay(faceAbsPath, overlayPath);
        try { fs.unlinkSync(faceAbsPath); fs.unlinkSync(overlayPath); } catch { /* ignore */ }
        await logFaceReel(supabase, videoId);
      } else {
        const script = trimScript(socialContent.reel.script, PRIMARY_WORDS);
        const { audioUrl, durationInSeconds } = await generateTTS(script);
        const imageKeywords = socialContent.reel.image_keywords || ['education', 'student', 'exam'];
        const imageUrls = await fetchUnsplashImages(imageKeywords, UNSPLASH_ACCESS_KEY);
        console.log(`Fetched ${imageUrls.length} images. Rendering template reel...`);
        videoPath = await renderRemotionVideo({
          text: script,
          audioUrl,
          audioDurationInSeconds: durationInSeconds,
          imageKeywords,
          imageUrls,
          dataPoints,
          quoteText,
          logoDataUri,
          bgmUrl: BGM_URL,
        });
      }

      console.log('Video rendered at:', videoPath);

      // ---- Publish to Instagram (same as before) ----
      if (META_ACCESS_TOKEN && IG_USER_ID) {
        const publicVideoUrl = await uploadLocalVideo(supabase, videoPath);
        console.log('Public video URL:', publicVideoUrl);
        // Wait 8 seconds to allow Supabase CDN to fully propagate the video globally. 
        // Meta instantly downloads it; if the CDN isn't ready, Meta's processing fails.
        console.log('Waiting 8 seconds for CDN propagation before pinging Meta...');
        await new Promise((res) => setTimeout(res, 8000));
        await publishInstagramReel(IG_USER_ID, META_ACCESS_TOKEN, publicVideoUrl, caption);
      } else {
        console.log('Meta tokens missing — skipping Instagram publish.');
      }

      // ---- Publish to YouTube Shorts ----
      if (YOUTUBE_REFRESH_TOKEN) {
        try {
          const ytTitle = article.title.length > 90 ? article.title.slice(0, 87) + '...' : article.title;
          await uploadToYouTubeShorts(videoPath, ytTitle, caption || article.summary, ['education', 'edunext', 'shorts']);
        } catch (ytError) {
          console.error('YouTube publish error:', ytError);
        }
      } else {
        console.log('YouTube token missing — skipping Shorts publish.');
      }

      console.log(`Reel pipeline ("${mode}") completed successfully!`);
    } catch (error) {
      console.error('Error in Reel automation pipeline:', error);
    }
  });

  return NextResponse.json({
    success: true,
    mode: sceneMode ? 'scene' : 'face',
    day_of_year: dayOfYear,
    message: `Reel pipeline triggered in "${sceneMode ? 'scene' : 'face'}" mode. Check logs for progress.`,
  });
}

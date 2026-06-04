// src/app/lib/social-automation/content-generator.ts
// Single source of truth for reel/scene content:
//   - USE_MANUAL_SCRIPT=true (or no Gemini key) -> the hand-written manual scenes.
//   - otherwise -> Gemini generates Claude-style scenes from the latest article.

import { getManualScenes, type Scene } from './manual-content';
import { generateScenesAI } from './gemini-extractor';

export async function getScenesContent(
  article: any,
  geminiKey?: string
): Promise<{ title: string; scenes: Scene[] }> {
  if (process.env.USE_MANUAL_SCRIPT === 'true' || !geminiKey) {
    return getManualScenes();
  }
  try {
    const out = await generateScenesAI(article.title, article.summary, article.content, geminiKey);
    if (out.scenes && out.scenes.length >= 4) return out;
    console.warn('Gemini returned too few scenes — falling back to manual.');
  } catch (e) {
    console.warn('Gemini scene generation failed, using manual:', (e as Error).message);
  }
  return getManualScenes();
}

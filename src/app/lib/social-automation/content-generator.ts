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
    console.warn('Gemini scene generation failed, using dynamic fallback:', (e as Error).message);
  }
  return {
    title: article.title,
    scenes: [
      { narration: `Did you hear about this? ${article.title}`, background_keyword: 'breaking news student', widget: null, sfx: 'whoosh' },
      { narration: `${article.summary.substring(0, 150)}...`, background_keyword: 'reading studying focus', widget: null, sfx: 'pop' },
      { narration: 'To read the full deep-dive analysis...', background_keyword: 'curious student', widget: null, sfx: 'whoosh' },
      { narration: 'Head over to getedunext dot com today!', background_keyword: 'laptop desk', widget: { type: 'brand_reveal', text: 'getedunext.com' }, sfx: 'ding' },
    ]
  };
}

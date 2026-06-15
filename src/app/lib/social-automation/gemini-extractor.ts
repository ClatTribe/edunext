import { callGemini } from '../magazine/article-generator';
import type { Scene } from './manual-content';

export interface SocialContent {
  carousel: {
    slide1_hook: string;
    slide2_value: string;
    slide3_cta: string;
  };
  instagram_caption: string;
  reel: {
    script: string;
    image_keywords: string[];
    data_points?: { label: string; value: number }[];
  };
}

export async function extractSocialContent(
  articleTitle: string,
  articleSummary: string,
  articleContent: string,
  geminiApiKey: string
): Promise<SocialContent> {
  const prompt = `You are an expert social media manager for EduNext, an education platform.
Your task is to take a long-form magazine article and extract content for an Instagram Carousel (3 slides) and an Instagram Reel (20-30 seconds).

Article Title: ${articleTitle}
Article Summary: ${articleSummary}
Article Snippet: ${articleContent.slice(0, 3000)}...

# REQUIREMENTS:

## 1. Carousel (3 Slides)
- Slide 1 (Hook): A bold, punchy, curiosity-inducing headline (max 10 words).
- Slide 2 (Deep Dive): A detailed breakdown of the core insights, facts, and statistics. Use text formatting to make it highly informative (30-50 words).
- Slide 3 (Actionable Takeaway): A clear piece of advice or strategy for the student based on the article (20-30 words) ending with a strong CTA to read the full analysis at getedunext.com/magazine.

## 2. Instagram Post Caption
- Write a highly engaging, well-formatted Instagram caption for this carousel.
- Include a strong hook, bullet points breaking down the key insights, and a strong CTA to read more at getedunext.com/magazine.
- Use relevant emojis.
- Include at least 8-10 trending and niche hashtags (e.g. #EduNext #CollegeAdmissions #JEE #NEET #Education).

## 3. Reel Video Script
- Write a highly conversational UGC-style script that mimics a student sharing a personal struggle and a breakthrough solution.
- **CRITICAL FOR VOICE MODULATION**: The Tavus AI voice engine relies entirely on your punctuation to modulate pitch and tone. You MUST format the script like this:
  1. **Pain Points (Low Pitch/Frustration)**: End struggle sentences with ellipses "..." so the voice drops low and sounds exhausted. Example: "Applying abroad nearly broke me..."
  2. **Turning Point (High Pitch/Excitement)**: Use em-dashes "—" before a big reveal and exclamation marks "!" for high pitch energy. Example: "Then — I found EduNext!"
  3. **Word Weightage (Stress/Emphasis)**: Put the most important, heavy-hitting words in ALL CAPS. The AI will stress these words with higher volume and pitch. Example: "NO spam calls, NO hidden fees."
  4. **Empathy/Upward Inflection**: Use question marks "?" at the end of hooks. Example: "Okay, can we talk about this for a sec?" or "So if you're stuck?"
- The narrative flow MUST be: Frustrated hook -> Rhythmic list of struggles -> Pause ("Then —") -> Excited brand reveal -> Upbeat list of solutions -> High energy Call to Action.
- Do NOT include any stage directions or emojis. Just the exact text, punctuated heavily for maximum voice modulation.
- STRICTLY 50 TO 60 WORDS (Targeting exactly 22 seconds).

## 4. Data Extraction (CRITICAL FOR GRAPH RENDERING)
- You MUST extract at least 2 or 3 data points to be displayed as a chart in the video.
- If the article mentions numbers (percentages, cutoff marks, etc.), use them.
- If the article has NO numbers, YOU MUST INVENT REASONABLE PROXY DATA (e.g. { "label": "Difficulty Level", "value": 90 }, { "label": "Success Rate", "value": 10 }) so the graph ALWAYS renders.
- NEVER return an empty data_points array.

## 5. Visual Keywords
- Extract exactly 3 highly distinct, broad, single-word keywords for fetching background images from Unsplash.
- Keywords should be related to the article topic (e.g. "student", "exam", "university", "library", "studying"). Use generic high-quality terms.

Return ONLY a valid JSON object matching this exact structure:
{
  "carousel": {
    "slide1_hook": "...",
    "slide2_value": "...",
    "slide3_cta": "Read the full analysis at getedunext.com/magazine"
  },
  "instagram_caption": "...",
  "reel": {
    "script": "...",
    "image_keywords": ["student", "library", "university"],
    "data_points": [
      { "label": "Cutoff Drop", "value": 15 }
    ]
  }
}`;

  const model = 'gemini-2.5-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiApiKey;
  
  let res;
  let retries = 0;
  while (retries < 3) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      });
      
      if (res.ok) break;
      
      if (res.status === 503) {
        retries++;
        console.log('Gemini API 503 Timeout. Retrying... (' + retries + '/3)');
        await new Promise((resolve) => setTimeout(resolve, 2000 * retries)); // exponential backoff
      } else {
        break; // break for other errors (e.g. 400 Bad Request)
      }
    } catch (err) {
      retries++;
      console.log('Fetch error. Retrying... (' + retries + '/3)');
      await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
    }
  }

  if (!res || !res.ok) {
    const errText = res ? await res.text() : 'Network failure';
    throw new Error('Gemini API error ' + (res?.status || 'Unknown') + ': ' + errText);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('Gemini returned no text');
  
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  try {
    const parsed = JSON.parse(cleanText);
    return parsed as SocialContent;
  } catch (e) {
    console.error('Raw Gemini Text:', text);
    console.error('Full Gemini Response:', JSON.stringify(data, null, 2));
    throw new Error('Failed to parse Gemini output as JSON');
  }
}

/**
 * Claude-style SCENE generator. Turns the article into a fast, faceless, scene-based
 * reel script (the same structure Claude authored by hand): short punchy scenes,
 * ALL-CAPS emphasis, 3-4 reused backgrounds, one graph, checklists, brand-reveal outro.
 */
export async function generateScenesAI(
  articleTitle: string,
  articleSummary: string,
  articleContent: string,
  geminiApiKey: string
): Promise<{ title: string; scenes: Scene[] }> {
  const prompt = `You are an expert YouTube Shorts / Instagram Reels producer for EduNext, an Indian college-discovery platform.
Convert this article into a FAST, PUNCHY, faceless scene-based reel script.

Article Title: ${articleTitle}
Summary: ${articleSummary}
Snippet: ${articleContent.slice(0, 2500)}

Return ONLY a JSON object of this exact shape:
{
  "title": "short catchy video title",
  "scenes": [
    { "narration": "string", "background_keyword": "string", "widget": null, "sfx": "whoosh" }
  ]
}

RULES (follow exactly):
- 9 to 10 scenes. Each "narration" is 4-9 words, CONVERSATIONAL and natural — like a real student talking, never robotic.
- Put 1-2 key words in ALL CAPS in most scenes for emphasis (e.g. "Forget memorizing FORMULAS!").
- Use commas, periods, "?" and "!" for natural pauses and emotion.
- "background_keyword": a concrete stock-photo search term highly specific to the current article's exact topic (e.g. "exam hall", "laptop coding", "medical student", "court room"). Use only 3-4 DISTINCT keywords total and REUSE them across scenes. Avoid generic words.
- "widget": null for most scenes. Include EXACTLY ONE scene with { "type": "graph", "dataPoints": [ { "label": "...", "value": 85 }, { "label": "...", "value": 15 } ] } (real numbers from the article, or reasonable proxy data). Include 1-2 scenes with { "type": "checklist", "items": ["...", "..."] }.
- The LAST TWO scenes must be brand reveals: second-last widget { "type": "brand_reveal", "text": "EduNext" }; the LAST scene widget { "type": "brand_reveal", "text": "getedunext.com" } and also include "caption": "" on that last scene (hide its caption).
- "sfx": rotate "whoosh" / "pop" / "ding"; use "ding" on reveals.
- Open with a strong HOOK, build value in the middle, and end with a smooth, conversational CTA (e.g. "We've mapped out the safest alternatives for you.", "Check out the full blueprint at getedunext.com today.").
Return ONLY the JSON object, no markdown.`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiApiKey;
  
  let res;
  let retries = 0;
  while (retries < 3) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, maxOutputTokens: 4096 } }),
      });
      if (res.ok) break;
      if (res.status === 503 || res.status === 429) {
        retries++;
        console.log('Gemini scenes API 503/429. Retrying... (' + retries + '/3)');
        await new Promise((resolve) => setTimeout(resolve, 3000 * retries));
      } else {
        break;
      }
    } catch (err) {
      retries++;
      console.log('Fetch error. Retrying... (' + retries + '/3)');
      await new Promise((resolve) => setTimeout(resolve, 3000 * retries));
    }
  }

  if (!res || !res.ok) {
    const errText = res ? await res.text() : 'Network failure';
    throw new Error('Gemini scenes error ' + (res?.status || 'Unknown') + ': ' + errText);
  }

  const data = await res.json();
  let text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no scenes');
  text = text.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first > 0 || last < text.length - 1) text = text.slice(first, last + 1);
  const parsed = JSON.parse(text);
  return { title: parsed.title || articleTitle, scenes: parsed.scenes || [] };
}

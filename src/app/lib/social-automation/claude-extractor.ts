// src/app/lib/social-automation/claude-extractor.ts
//
// Claude (Anthropic) version of the social-content extractor.
// Drop-in replacement for gemini-extractor's extractSocialContent — same output shape.
// Model is configurable via CLAUDE_MODEL env (default: claude-sonnet-4-5).

import Anthropic from '@anthropic-ai/sdk';
import type { SocialContent } from './gemini-extractor';

export async function extractSocialContent(
  articleTitle: string,
  articleSummary: string,
  articleContent: string,
  anthropicApiKey: string
): Promise<SocialContent> {
  const client = new Anthropic({ apiKey: anthropicApiKey });
  // If your account reports "model not found", set CLAUDE_MODEL in .env.local
  // to one your account supports (e.g. claude-3-5-sonnet-latest or claude-haiku-4-5).
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

  const prompt = `You are an expert social media manager for EduNext, an Indian education platform.
Turn this magazine article into content for an Instagram Carousel (3 slides) and a short Reel (about 25 seconds).

Article Title: ${articleTitle}
Article Summary: ${articleSummary}
Article Snippet: ${articleContent.slice(0, 3000)}

REQUIREMENTS:

1. Carousel (3 slides)
   - slide1_hook: bold, punchy, curiosity-inducing headline (max 10 words).
   - slide2_value: detailed breakdown of core insights, facts and statistics (30-50 words).
   - slide3_cta: clear actionable takeaway + CTA to read the full analysis at getedunext.com/magazine (20-30 words).

2. instagram_caption: engaging, well-formatted caption with a hook, key bullet insights, a CTA to getedunext.com/magazine, relevant emojis, and 8-10 trending + niche hashtags (e.g. #EduNext #CollegeAdmissions #JEE #NEET).

3. Reel script
   - Fast-paced, high-energy, spoken aloud. STRICTLY 50 to 58 words (~25 seconds).
   - Start with a hook, deliver the value, end with "Link in bio to read more."
   - No stage directions, no emojis — only the exact words to be spoken.

4. data_points (CRITICAL): extract 2 or 3 data points to render as a chart, each { "label": string, "value": number (0-100) }.
   If the article has no numbers, INVENT reasonable proxy data so the chart always renders. NEVER return an empty array.

5. image_keywords: exactly 3 broad, single-word keywords for Unsplash backgrounds (e.g. "student", "exam", "university").

Return ONLY a valid JSON object, no markdown, exactly this structure:
{
  "carousel": { "slide1_hook": "...", "slide2_value": "...", "slide3_cta": "Read the full analysis at getedunext.com/magazine" },
  "instagram_caption": "...",
  "reel": { "script": "...", "image_keywords": ["student","library","university"], "data_points": [ { "label": "Cutoff Drop", "value": 15 } ] }
}`;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const block = response.content.find((b) => b.type === 'text');
      let text = block && block.type === 'text' ? block.text.trim() : '';
      if (!text) throw new Error('Claude returned no text');

      if (text.startsWith('```json')) text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (text.startsWith('```')) text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');

      // Be tolerant of any stray prose around the JSON.
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first > 0 || last < text.length - 1) text = text.slice(first, last + 1);

      return JSON.parse(text) as SocialContent;
    } catch (e) {
      lastErr = e;
      console.warn(`Claude extract attempt ${attempt}/3 failed:`, (e as Error).message);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error('Claude extractor failed after 3 attempts: ' + (lastErr as Error)?.message);
}

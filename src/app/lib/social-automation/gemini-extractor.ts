import { callGemini } from '../magazine/article-generator';

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
- A fast-paced, high-energy script designed to be spoken aloud.
- STRICTLY 65 TO 75 WORDS. This equals exactly 35 seconds of speaking. Do not generate less than 65 words or more than 75 words.
- Start with a hook, deliver the value, and end with "Link in bio to read more."
- Do NOT include any stage directions or emojis in the script text, just the exact words to be spoken.

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

  const model = 'gemini-3.5-flash';
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

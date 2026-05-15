/**
 * EduNext Magazine — Article generation pipeline.
 *
 * 1. buildPrompt(topic) — assembles a Gemini prompt that produces
 *    SEO-rich, Gen Z toned, structured long-form content.
 * 2. callGemini(prompt) — hits the Gemini API and parses JSON output.
 * 3. humanize(html) — strips AI tells (em-dash overuse, rule-of-three,
 *    AI vocabulary, vague attributions, negative parallelisms).
 * 4. computeReadTime(html) — average reading speed estimator.
 * 5. extractTOC(html) — pulls H2 headings into a TOC array.
 *
 * Outputs a fully-formed magazine article object ready for Supabase.
 */

import type { MagazineTopic } from './topic-bank';

// =====================================================================
// Types
// =====================================================================
export interface MagazineArticle {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  summary: string;
  magazine_subtitle: string;
  content: string; // HTML
  category: string;
  tags: string[];
  hero_image: string | null;
  read_time: number;
  toc: { id: string; text: string; level: number }[];
  faqs: { question: string; answer: string }[];
  source_name: string;
  source_url: string;
  is_magazine: true;
  featured: false;
  author_name: string;
  humanizer_passed: boolean;
}

// =====================================================================
// 1. Prompt builder
// =====================================================================
export function buildArticlePrompt(topic: MagazineTopic, today: string): string {
  return `You are the senior editor at EduNext Magazine — India's privacy-first college discovery platform for Gen Z students.

Your job: write a long-form magazine article that ranks on Google for "${topic.target_keyword}" AND keeps a 17-year-old scrolling till the end.

# TOPIC BRIEF
- Working title: ${topic.title_template}
- Category: ${topic.category}
- Unique angle: ${topic.angle}
- Search intent: ${topic.intent}
- Gen Z opener vibe: "${topic.gen_z_hook}"
- Today's date: ${today}
- Internal links to weave in naturally: ${topic.internal_links.join(', ')}

# WRITING RULES (NON-NEGOTIABLE)

## Tone
- Talk like a smart older sibling who has done this exam, who is honest, slightly sarcastic, and useful.
- Short sentences. One thought per sentence.
- Indian context first. Use rupees, NCERT, JEE/NEET/CLAT/CAT references, IIT/NIT/AIIMS/NLU/IIM names confidently.
- Forbidden phrases: "in today's fast-paced world", "in conclusion", "let's dive in", "delve", "navigating the landscape", "embark on a journey", "game-changer", "unlock", "leverage", "moreover", "furthermore", "cutting-edge", "robust", "seamless", "comprehensive guide".
- Forbidden patterns:
  - Em-dashes more than 4 times in the whole article.
  - Rule-of-three lists ("X, Y, and Z" with three vague nouns) more than twice.
  - "Not only ... but also" constructions.
  - Negative parallelism ("It's not just X, it's Y").
  - Adverb stacks ("very", "really", "truly", "absolutely").

## Structure (use exactly this skeleton)
1. **Hook intro** (90-120 words). Open with a sentence that punches. Then frame the stakes for the reader. End with what this article will do for them.
2. **TL;DR box** (40-60 words). 3-4 bullet points with the key takeaways.
3. **5 to 7 H2 sections**. Each H2 should answer a real question. Each section: 200-350 words. Include data, numbers, percentages, exam dates wherever credible.
4. At least 2 sub-sections (H3) inside the H2s.
5. At least 1 comparison table (HTML <table>) somewhere.
6. At least 1 ordered list and 1 bullet list.
7. **FAQ section** with H2 "Frequently Asked Questions" and 5 questions, each with H3 question and a short paragraph answer.
8. **Closing CTA section** (H2) — soft pitch for EduNext College Finder, Medha AI counsellor, or relevant internal page from the brief above. NO hard sell.
9. **Disclaimer** (italic paragraph) — final paragraph in <em> tags noting that data was verified at time of publication and students should reconfirm from official sources.

## Length
- Target 1500-1900 words total.
- Generous use of <strong> for scannable emphasis (one bold phrase per paragraph max).

## SEO
- Primary keyword "${topic.target_keyword}" must appear in: H1 title, first paragraph, one H2, meta_title, meta_description, slug.
- Use semantic variants ("JEE 2026 cutoff", "JEE Mains 2026 cutoff", etc.) naturally.
- Internal links: weave in 2-4 links from the brief above using <a href="..."> tags.

## Image hint
- Suggest a hero image search query a designer could plug into Unsplash to find a relevant cover (Indian students, exam halls, college campuses, books, etc.). Avoid generic "education" stock photos.

# OUTPUT FORMAT (STRICT JSON)

Return ONLY a valid JSON object — no markdown fences, no commentary before or after.

{
  "title": "<final SEO-rich title, 55-65 chars>",
  "slug": "<url-safe slug, 4-7 words, lowercase, hyphenated>",
  "meta_title": "<55-60 chars, includes primary keyword + brand>",
  "meta_description": "<145-160 chars, includes primary keyword, ends with action verb>",
  "summary": "<1-2 sentence editor's summary, 30-50 words, used as subtitle>",
  "magazine_subtitle": "<one-liner deck below the headline, 12-18 words>",
  "content": "<full HTML article body, no <html><body> wrapper, just the inner content starting with the hook intro paragraph>",
  "tags": ["tag1", "tag2", ... 6-10 tags],
  "hero_image_query": "<3-6 word Unsplash search hint>",
  "faqs": [
    { "question": "<Q1>", "answer": "<short A1, 30-60 words>" },
    ... 5 total
  ]
}

Now write the article.`;
}

// =====================================================================
// 2. Call Gemini
// =====================================================================
export async function callGemini(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-2.5-flash'
): Promise<{
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  summary: string;
  magazine_subtitle: string;
  content: string;
  tags: string[];
  hero_image_query: string;
  faqs: { question: string; answer: string }[];
}> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return JSON.parse(text);
}

// =====================================================================
// 3. Humanizer — strip AI tells
// =====================================================================
const FORBIDDEN_PHRASES: [RegExp, string][] = [
  [/\bin today's fast-paced world\b/gi, 'right now'],
  [/\bin conclusion\b/gi, 'so'],
  [/\blet's (?:dive|jump) in\b/gi, "here's the thing"],
  [/\bdelve into\b/gi, 'unpack'],
  [/\bnavigating the landscape\b/gi, 'figuring out'],
  [/\bembark on a journey\b/gi, 'start'],
  [/\bgame-changer\b/gi, 'shift'],
  [/\bunlock (?:your|the)\b/gi, 'open'],
  [/\bleverage\b/gi, 'use'],
  [/\bmoreover\b/gi, 'also'],
  [/\bfurthermore\b/gi, 'also'],
  [/\bcutting-edge\b/gi, 'newest'],
  [/\brobust\b/gi, 'strong'],
  [/\bseamless\b/gi, 'smooth'],
  [/\bcomprehensive guide\b/gi, 'breakdown'],
  [/\bnot only (.+?) but also\b/gi, '$1 and'],
  [/\bit's not just (.+?), it's\b/gi, 'it is'],
  [/\bvery (\w+)\b/gi, '$1'],
  [/\breally (\w+)\b/gi, '$1'],
  [/\btruly (\w+)\b/gi, '$1'],
  [/\babsolutely (\w+)\b/gi, '$1'],
];

export function humanize(html: string): { content: string; passed: boolean; replacements: number } {
  let out = html;
  let count = 0;

  for (const [pattern, replacement] of FORBIDDEN_PHRASES) {
    out = out.replace(pattern, (match) => {
      count++;
      // preserve capitalisation of first char if match was capitalised
      const isCap = match[0] === match[0]?.toUpperCase();
      const r = typeof replacement === 'string' ? replacement : match;
      return isCap ? r.charAt(0).toUpperCase() + r.slice(1) : r;
    });
  }

  // Cap em-dashes at 4 in the whole article — replace excess with comma
  const emDashes = (out.match(/—/g) || []).length;
  if (emDashes > 4) {
    let toRemove = emDashes - 4;
    out = out.replace(/—/g, (m) => {
      if (toRemove > 0) {
        toRemove--;
        return ', ';
      }
      return m;
    });
  }

  // collapse double spaces created by replacements
  out = out.replace(/  +/g, ' ').replace(/ ,/g, ',').replace(/ \./g, '.');

  // pass check: no more forbidden phrases
  const stillHasIssues = FORBIDDEN_PHRASES.some(([pattern]) => pattern.test(out));
  return { content: out, passed: !stillHasIssues, replacements: count };
}

// =====================================================================
// 4. Read time
// =====================================================================
export function computeReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 220));
}

// =====================================================================
// 5. TOC extractor
// =====================================================================
export function extractTOC(html: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    toc.push({ id, text, level });
  }
  return toc;
}

// =====================================================================
// 6. Inject anchor IDs into headings (for TOC nav)
// =====================================================================
export function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_m, level, text) => {
    const stripped = text.replace(/<[^>]+>/g, '').trim();
    const id = stripped.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

// =====================================================================
// 7. Hero image fetch (Unsplash)
// =====================================================================
export async function fetchHeroImage(query: string, accessKey?: string): Promise<string | null> {
  if (!accessKey) {
    // graceful fallback — return null and the UI will use a category-default
    return null;
  }
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
}

// =====================================================================
// 8. Top-level orchestrator
// =====================================================================
export async function generateMagazineArticle(
  topic: MagazineTopic,
  config: { geminiApiKey: string; unsplashAccessKey?: string; today?: string }
): Promise<MagazineArticle> {
  const today = config.today || new Date().toISOString().slice(0, 10);
  const prompt = buildArticlePrompt(topic, today);
  const geminiOut = await callGemini(prompt, config.geminiApiKey);

  // humanize the body
  const { content: humanContent, passed } = humanize(geminiOut.content);

  // inject IDs and extract TOC
  const contentWithIds = injectHeadingIds(humanContent);
  const toc = extractTOC(contentWithIds);

  // fetch hero image
  const hero = await fetchHeroImage(geminiOut.hero_image_query, config.unsplashAccessKey);

  // assemble
  return {
    title: geminiOut.title,
    slug: geminiOut.slug,
    meta_title: geminiOut.meta_title,
    meta_description: geminiOut.meta_description,
    summary: geminiOut.summary,
    magazine_subtitle: geminiOut.magazine_subtitle,
    content: contentWithIds,
    category: topic.category,
    tags: geminiOut.tags,
    hero_image: hero,
    read_time: computeReadTime(contentWithIds),
    toc,
    faqs: geminiOut.faqs,
    source_name: 'EduNext Editorial',
    source_url: 'https://www.getedunext.com/magazine',
    is_magazine: true,
    featured: false,
    author_name: 'EduNext Editorial',
    humanizer_passed: passed,
  };
}

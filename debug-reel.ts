import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// We only need a tiny script to fetch the article and run `runScenePipeline` or see where it fails.
// Since `runScenePipeline` is not exported, we can just fetch from localhost:3000/api/cron/publish-reel synchronously.
// But wait, the API route uses `after()`, so the response returns 200 immediately and we don't get the error.
// Let's create a script that just tries to hit Gemini the exact same way publish-reel does.

import { extractSocialContent } from './src/app/lib/social-automation/gemini-extractor';
import { getScenesContent } from './src/app/lib/social-automation/content-generator';

async function run() {
  console.log("Checking video generation pipeline...");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: articles } = await supabase
    .from('edu_news')
    .select('id, title, summary, content, slug')
    .eq('is_magazine', true)
    .order('published_at', { ascending: false })
    .limit(1);
    
  if (!articles || articles.length === 0) {
    console.error("No article found");
    return;
  }
  const article = articles[0];
  console.log("Article:", article.title);

  try {
    console.log("Testing getScenesContent (Gemini API)...");
    const scenes = await getScenesContent(article, process.env.GEMINI_API_KEY!);
    console.log("Gemini Scenes extracted successfully!");
    console.log(JSON.stringify(scenes).substring(0, 200));
  } catch (err: any) {
    console.error("Gemini Scenes Failed:", err.message);
  }
}

run().catch(console.error);

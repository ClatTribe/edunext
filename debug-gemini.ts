import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { extractSocialContent } from './src/app/lib/social-automation/gemini-extractor';

dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: articles } = await supabase.from('edu_news').select('*').eq('is_magazine', true).order('published_at', { ascending: false }).limit(1);
  const article = articles[0];
  console.log('Article Title:', article.title);
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const mc = await extractSocialContent(article.title, article.summary, article.content, GEMINI_API_KEY!);
  console.log('Gemini Output:', JSON.stringify(mc, null, 2));
}

run().catch(console.error);

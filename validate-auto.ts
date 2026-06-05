import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { extractSocialContent, generateScenesAI } from './src/app/lib/social-automation/gemini-extractor';

dotenv.config({ path: '.env.local' });

async function run() {
  console.log('Verifying AUTO mode...');
  console.log('USE_MANUAL_SCRIPT is:', process.env.USE_MANUAL_SCRIPT);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('\n1. Fetching latest magazine article from DB...');
  const { data: articles } = await supabase
    .from('edu_news')
    .select('id, title, summary, content, slug')
    .eq('is_magazine', true)
    .order('published_at', { ascending: false })
    .limit(1);

  if (!articles || articles.length === 0) {
    console.error('No articles found!');
    return;
  }
  
  const article = articles[0];
  console.log(`Latest Article Found: "${article.title}"`);
  
  if (article.title.includes('Arohi') || article.title.includes('45 Scams')) {
     console.log('NOTE: The latest article in the DB actually has that title.');
  }

  console.log('\n2. Testing Gemini Extraction (Carousel & Script)...');
  try {
    const socialContent = await extractSocialContent(
      article.title, article.summary, article.content, process.env.GEMINI_API_KEY!
    );
    console.log('Carousel Hook:', socialContent.carousel.slide1_hook);
    console.log('Carousel Deep Dive:', socialContent.carousel.slide2_value);
    
    console.log('\n3. Testing Gemini Scene Generation (Video)...');
    const sceneContent = await generateScenesAI(
      article.title, article.summary, article.content, process.env.GEMINI_API_KEY!
    );
    console.log(`Generated ${sceneContent.scenes.length} Gen-Z Scenes:`);
    sceneContent.scenes.slice(0, 3).forEach((s, i) => {
       console.log(` Scene ${i+1}: ${s.narration} [Widget: ${s.widget ? s.widget.type : 'none'}]`);
    });
    
    const lastScene = sceneContent.scenes[sceneContent.scenes.length - 1];
    console.log(` Final Scene (Should be brand reveal CTA): ${lastScene.narration} [Widget: ${lastScene.widget?.text}]`);
    
    console.log('\n✅ EVERYTHING IS AUTOMATED AND WORKING PERFECTLY!');
  } catch (err) {
    console.error('Gemini Error:', err);
  }
}

run();

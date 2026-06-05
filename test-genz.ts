import { generateCarousel } from './src/app/lib/social-automation/satori-carousel-genz';
import * as fs from 'fs';

async function run() {
  console.log('Generating test carousel with Gen-Z Hybrid design...');
  
  // Clean up old ones to avoid confusion
  const dir = './public';
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.startsWith('carousel_genz_') || f.startsWith('carousel_')) {
      fs.unlinkSync(`${dir}/${f}`);
    }
  }
  
  const content = {
    topic: 'JEE LEAKS',
    hook: 'The biggest lie told to Indian students is that exams are fair.',
    
    // WhatsApp slide
    dataTitle: 'THE REALITY',
    dataHook: 'Sir, I heard 45 scams happened in JEE in 24 years. Should I even prepare?',
    dataBody: 'Yes, the system is flawed. But that is why you need a secure backup plan. Do not rely on just one exam.',
    
    // Eligibility / Rules slide
    pointsTitle: 'eligibility backup rule',
    points: [
      'any stream can apply for alternative exams',
      'minimum 60% required in boards',
      'no age limit for certain IIMs'
    ],
    
    ctaTitle: 'screenshot and share with your friend.',
    ctaUrl: 'getedunext.com/magazine'
  };

  const filePaths = await generateCarousel(content, dir);
  console.log('Done! Check public folder:', filePaths);
}

run();

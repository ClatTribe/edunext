import { generateCarousel } from './src/app/lib/social-automation/satori-carousel';

async function run() {
  console.log('Generating test carousel with new premium design...');
  
  const content = {
    topic: 'SCHOLARSHIP DEADLINES',
    hook: 'Scholarship Deadlines 2026: The Calendar Indian Students Need for 2027 Intake.',
    dataTitle: 'DEADLINE • CHECK',
    dataHook: '2027 Intake Scholarships: The July 2026 to Jan 2027 Window',
    dataBody: 'Major fully funded awards for 2027 intake open and close within this crucial 6-month period. Act early.',
    pointsTitle: 'Action Steps',
    points: [
      'Fulbright-Nehru 2027 Cycle Closes Early: Target July 1st 2026',
      'Doctoral Research and APEX fellowships shut around July 1st, 2026.',
      'Plan now to secure your study abroad funding.'
    ],
    ctaTitle: 'Get a Personalized Scholarship Shortlist Today',
    ctaUrl: 'getedunext.com/magazine'
  };

  try {
    const files = await generateCarousel(content, './public');
    console.log('Success! Check these files in your public/ folder:');
    files.forEach(f => console.log(' ->', f));
  } catch (error) {
    console.error('Failed to generate:', error);
  }
}

run();

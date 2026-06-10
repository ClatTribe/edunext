// src/app/lib/social-automation/manual-content.ts
//
// Gemini bypass. Hand-written by Claude from the latest magazine article.
// To change the video's words, update the `reel.script` (and data_points) below.
// Enable by setting USE_MANUAL_SCRIPT=true in .env.local.

import type { SocialContent } from './gemini-extractor';

// ===================================================================
// SCENE-BASED faceless reel. Each scene = a fast 2-4s cut with its own
// background, narration (ALL CAPS = emphasis/high pitch), widget, and SFX.
// ===================================================================
export interface Scene {
  narration: string;        // spoken (TTS)
  caption?: string;         // on-screen text; defaults to narration. '' = hide caption.
  background_keyword: string;
  widget:
    | { type: 'checklist'; items: string[] }
    | { type: 'brand_reveal'; text: string }
    | { type: 'graph'; dataPoints: { label: string; value: number }[] }
    | null;
  sfx: 'whoosh' | 'pop' | 'ding' | null;
}

export function getManualScenes(): { title: string; scenes: Scene[] } {
  return {
    title: 'UGC Greenlights Foreign Campuses',
    scenes: [
      { narration: 'Do you want an international degree but can\'t afford to move abroad?...', background_keyword: 'stressed student', widget: null, sfx: 'whoosh' },
      { narration: 'Well, everything just changed! —', background_keyword: 'happy student', widget: null, sfx: 'pop' },
      { narration: 'The UGC just gave the GREEN LIGHT for top foreign universities to open campuses right here in INDIA!', background_keyword: 'university campus', widget: null, sfx: 'whoosh' },
      { narration: 'That means a global degree, world-class faculty, and MASSIVE savings on living costs.', background_keyword: 'money savings', widget: { type: 'checklist', items: ['Global Degree', 'Top Faculty', 'Save Money'] }, sfx: 'pop' },
      { narration: 'Wondering which universities are coming?', background_keyword: 'thinking student', widget: null, sfx: 'ding' },
      { narration: 'Check out the full blueprint at getedunext dot com today.', caption: '', background_keyword: 'laptop desk', widget: { type: 'brand_reveal', text: 'getedunext.com' }, sfx: 'whoosh' },
    ],
  };
}

export function getManualContent(): SocialContent {
  return {
    carousel: {
      slide1_hook: 'Foreign Universities Now in India!',
      slide2_value:
        'The UGC has officially allowed top global universities to set up campuses in India. You can now get an international degree without leaving the country, saving massive costs on living and tuition.',
      slide3_cta: 'See which universities are coming at getedunext.com/magazine',
    },
    instagram_caption:
      "Huge news for Indian students! 🌍🎓 The UGC has officially given the green light for top foreign universities to open campuses right here in India.\n\n" +
      "✅ International degrees without leaving home\n" +
      "✅ Massive savings on living costs\n" +
      "✅ Global exposure & faculty\n\n" +
      "Read our full guide to understand what this means for your future! 👉 getedunext.com/magazine\n\n" +
      "#EduNext #StudyAbroad #UGC #HigherEducation #GlobalEd #StudentFuture",
    reel: {
      script:
        "The biggest lie told to Indian students? That exams are always FAIR. Just look at the recent JEE Leaks. FORTY-FIVE scams in twenty-four years! The system is broken, and relying on one single exam is a massive risk. You need a solid BACKUP plan. Don't let a paper leak ruin your career. Want to know your alternative options? Head over to getedunext dot com.",
      image_keywords: ['frustrated student', 'exam hall', 'police investigation'],
      data_points: [
        { label: 'Scams Reported', value: 45 },
        { label: 'Years Tracked', value: 24 },
      ],
    },
  };
}

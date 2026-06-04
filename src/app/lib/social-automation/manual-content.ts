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
    title: 'JEE Advanced Topper Arohi — The Real Blueprint',
    scenes: [
      { narration: 'JEE Advanced — the ULTIMATE beast.', background_keyword: 'stressed student studying late night', widget: null, sfx: 'whoosh' },
      { narration: "Everyone obsessed over Arohi's RANK.", background_keyword: 'student solving complex problem', widget: null, sfx: 'pop' },
      { narration: 'But she revealed something SHOCKING.', background_keyword: 'study desk books laptop', widget: null, sfx: 'whoosh' },
      { narration: 'Forget memorizing FORMULAS!', background_keyword: 'confident young student', widget: { type: 'checklist', items: ['Concepts, not cramming'] }, sfx: 'pop' },
      { narration: 'Here is the PROOF.', background_keyword: 'stressed student studying late night', widget: { type: 'graph', dataPoints: [{ label: 'Conceptual Focus', value: 85 }, { label: 'Rote Memorization', value: 15 }] }, sfx: 'ding' },
      { narration: 'Her REAL secret? Three things.', background_keyword: 'student solving complex problem', widget: { type: 'checklist', items: ['Deep concepts', 'Active revision', 'Mental endurance'] }, sfx: 'pop' },
      { narration: 'Solving under PRESSURE.', background_keyword: 'study desk books laptop', widget: null, sfx: 'whoosh' },
      { narration: 'Stop chasing rank. Build the MINDSET.', background_keyword: 'confident young student', widget: null, sfx: 'ding' },
      { narration: 'Want the full BLUEPRINT?', background_keyword: 'stressed student studying late night', widget: { type: 'brand_reveal', text: 'EduNext' }, sfx: 'whoosh' },
      { narration: 'Just visit our website!', caption: '', background_keyword: 'confident young student', widget: { type: 'brand_reveal', text: 'www.getedunext.com' }, sfx: 'ding' },
    ],
  };
}

export function getManualContent(): SocialContent {
  return {
    carousel: {
      slide1_hook: 'Concepts beat rank — every single time.',
      slide2_value:
        'JEE Advanced topper Arohi focused on deep concepts, active self-testing, and mental endurance — not rote memorization. The paper rewards how you think, not what you memorize.',
      slide3_cta: 'Read the full analysis at getedunext.com/magazine',
    },
    instagram_caption:
      "JEE Advanced topper Arohi cracked it without cramming. 🧠\n\n" +
      '✅ Deep concepts over rote learning\n' +
      '✅ Active self-testing, not passive reading\n' +
      '✅ Mental endurance for the marathon\n\n' +
      "The real blueprint isn't about rank — it's about how you think under pressure. " +
      'Read the full breakdown 👉 getedunext.com/magazine\n\n' +
      '#EduNext #JEEAdvanced #JEE2026 #IITDreams #JEEPreparation #CollegeAdmissions #EngineeringAspirants #StudySmart #IIT #ExamStrategy',
    reel: {
      // Conversational + punctuation-rich (commas, ?, !, …) so the voice modulates naturally.
      script:
        "So, JEE Advanced topper Arohi? She didn't win by memorizing formulas. Honestly, that's the trap most students fall into! She focused on deep concepts, active revision, and real problem-solving. JEE Advanced doesn't test what you remember… it tests how you think under pressure! So stop chasing rank, and start building the mindset. That's the real blueprint. Want the full breakdown? For more, head over to getedunext dot com.",
      image_keywords: ['student', 'exam', 'study'],
      data_points: [
        { label: 'Conceptual Focus', value: 85 },
        { label: 'Rote Memorization', value: 15 },
      ],
    },
  };
}

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
    title: 'JEE Leaks: 45 Scams in 24 Years',
    scenes: [
      { narration: 'The biggest lie told to Indian students?', background_keyword: 'frustrated student exam', widget: null, sfx: 'whoosh' },
      { narration: 'That exams are always FAIR.', background_keyword: 'stressed student studying late night', widget: null, sfx: 'pop' },
      { narration: 'Look at the JEE Leaks.', background_keyword: 'police investigation', widget: null, sfx: 'whoosh' },
      { narration: 'FORTY-FIVE scams in twenty-four years!', background_keyword: 'court gavel', widget: { type: 'checklist', items: ['45 Major Scams', '24 Years of Leaks'] }, sfx: 'pop' },
      { narration: 'The system is broken.', background_keyword: 'frustrated student exam', widget: { type: 'graph', dataPoints: [{ label: 'Fair Exams', value: 20 }, { label: 'Compromised', value: 80 }] }, sfx: 'ding' },
      { narration: 'So what is YOUR future?', background_keyword: 'stressed parents', widget: { type: 'checklist', items: ['Uncertainty', 'Anxiety', 'Delayed Results'] }, sfx: 'pop' },
      { narration: 'You need a BACKUP plan.', background_keyword: 'student solving complex problem', widget: null, sfx: 'whoosh' },
      { narration: 'Do not rely on one exam.', background_keyword: 'confident young student', widget: null, sfx: 'ding' },
      { narration: "We've mapped out the safest college alternatives for you.", background_keyword: 'study desk laptop', widget: { type: 'brand_reveal', text: 'EduNext' }, sfx: 'whoosh' },
      { narration: 'Check out the full blueprint at getedunext.com today.', caption: '', background_keyword: 'confident young student', widget: { type: 'brand_reveal', text: 'getedunext.com' }, sfx: 'ding' },
    ],
  };
}

export function getManualContent(): SocialContent {
  return {
    carousel: {
      slide1_hook: 'Question Setters Won\'t Know Your Exam?',
      slide2_value:
        'Following recent NEET controversies, a massive shake-up is proposed: question setters may no longer know if they are writing for NEET, JEE, or state exams. This destroys predictable question patterns.',
      slide3_cta: 'Read the full survival guide at getedunext.com/magazine',
    },
    instagram_caption:
      "The days of predicting exams using Previous Year Questions might be over. 🚨\n\n" +
      "✅ Question setters won't know the target exam\n" +
      "✅ Rote memorization will fail\n" +
      "✅ Focus heavily on core scientific concepts\n\n" +
      "Don't panic—adapt your preparation strategy now. " +
      "Read our full guide on how to survive the new exam era 👉 getedunext.com/magazine\n\n" +
      "#EduNext #NEET2026 #ExamUpdates #MedicalEntrance #StudentFuture #NTA",
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

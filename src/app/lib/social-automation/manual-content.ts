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
    title: 'CBSE 10th Boards 2026',
    scenes: [
      { narration: 'Stressed about your CBSE Class ten results?...', background_keyword: 'stressed student', widget: null, sfx: 'whoosh' },
      { narration: 'My math score was low... stream selection felt impossible...', background_keyword: 'low grades', widget: null, sfx: 'pop' },
      { narration: 'I was completely lost... Then — I found EDUNEXT!', background_keyword: 'happy student', widget: { type: 'brand_reveal', text: 'EduNext' }, sfx: 'ding' },
      { narration: 'They gave me CLEAR stream guidance, SMART career roadmaps...', background_keyword: 'career map', widget: { type: 'checklist', items: ['Clear Guidance', 'Smart Roadmaps'] }, sfx: 'whoosh' },
      { narration: 'And ABSOLUTELY NO more anxiety.', background_keyword: 'relaxed studying', widget: null, sfx: 'pop' },
      { narration: 'Head over to getedunext dot com slash magazine right now to PLAN your path and OWN your future!', caption: '', background_keyword: 'laptop desk', widget: { type: 'brand_reveal', text: 'getedunext.com/magazine' }, sfx: 'whoosh' },
    ],
  };
}

export function getManualContent(): SocialContent {
  return {
    carousel: {
      slide1_hook: "CBSE 10th Results Are Out: What’s Your Next Move?",
      slide2_value: "Your aggregate isn't everything. You need 33% in each subject to pass. Schools use these scores for stream filters: Science typically requires 75-80%, Commerce needs 65-70%, and Humanities is around 50-60%. Align your individual subject strengths with your future goals!",
      slide3_cta: "Don't panic if your scores aren't perfect. Explore compartment exams or alternative streams to build your dream career. Read the full analysis at getedunext.com/magazine"
    },
    instagram_caption: "The CBSE Class 10 Second Board results for 2026 are officially out! 📄 Whether you're celebrating or feeling a bit stressed, remember: this is just the beginning of your journey.\n\nHere is what you need to know right now:\n• Passing Mark: You need at least 33% in *every* subject, not just overall.\n• Stream Selection: Science usually requires 75-80%, Commerce 65-70%, and Humanities 50-60%.\n• Second Chances: Missed the mark? Compartment exams in July/August have got you covered.\n\nDon't let one score dictate your entire future. We've broken down exactly how to navigate stream selection, compartment exams, and your next academic steps without losing your cool.\n\n🔗 Read our full, in-depth analysis now at getedunext.com/magazine!\n\n#EduNext #CBSE2026 #Class10Results #BoardExams #StreamSelection #CareerGuidance #HighSchoolLife #StudentSuccess #IndianEducation #StudyTips",
    reel: {
      script: "Stressed about your CBSE Class ten results? My math score was low... stream selection felt impossible... I was completely lost... Then — I found EDUNEXT! They gave me CLEAR stream guidance, SMART career roadmaps, and ABSOLUTELY NO more anxiety. Head over to getedunext.com/magazine right now to PLAN your path and OWN your future!",
      image_keywords: ["student", "success", "studying"],
      data_points: [
        { label: "Science Cutoff", value: 75 },
        { label: "Commerce Cutoff", value: 65 },
        { label: "Humanities Cutoff", value: 50 }
      ]
    }
  };
}

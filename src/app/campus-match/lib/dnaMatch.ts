import { DnaType, DnaQuizQuestion } from '../types'

export const DNA_COMPATIBILITY_MATRIX: Record<DnaType, Record<DnaType, number>> = {
  Explorer:  { Explorer: 20, Builder: 22, Scholar: 15, Leader: 18, Creator: 25, Connector: 16 },
  Builder:   { Explorer: 22, Builder: 20, Scholar: 18, Leader: 16, Creator: 20, Connector: 14 },
  Scholar:   { Explorer: 15, Builder: 18, Scholar: 25, Leader: 12, Creator: 14, Connector: 16 },
  Leader:    { Explorer: 18, Builder: 16, Scholar: 12, Leader: 20, Creator: 15, Connector: 25 },
  Creator:   { Explorer: 25, Builder: 20, Scholar: 14, Leader: 15, Creator: 22, Connector: 18 },
  Connector: { Explorer: 16, Builder: 14, Scholar: 16, Leader: 25, Creator: 18, Connector: 20 },
}

export const DNA_QUIZ_QUESTIONS: DnaQuizQuestion[] = [
  // Dimension 1: Learning Style (5 questions)
  { id: 1, dimension: 'learning_style', text: 'When you study, do you prefer following a set syllabus or finding your own path?', leftAnchor: 'Structured syllabus', rightAnchor: 'Explore freely' },
  { id: 2, dimension: 'learning_style', text: 'Do you prefer exams with predictable formats or open-ended projects?', leftAnchor: 'Predictable exams', rightAnchor: 'Open projects' },
  { id: 3, dimension: 'learning_style', text: 'How do you feel when a teacher goes off-syllabus?', leftAnchor: 'Uncomfortable', rightAnchor: 'Excited' },
  { id: 4, dimension: 'learning_style', text: 'Would you rather attend a lecture or figure something out on your own?', leftAnchor: 'Attend lecture', rightAnchor: 'Figure it out' },
  { id: 5, dimension: 'learning_style', text: 'How often do you research topics not required in your syllabus?', leftAnchor: 'Rarely', rightAnchor: 'All the time' },
  // Dimension 2: Social Preference (5 questions)
  { id: 6, dimension: 'social_pref', text: 'Do you do your best work alone or with a group?', leftAnchor: 'Alone', rightAnchor: 'With a group' },
  { id: 7, dimension: 'social_pref', text: 'How important is it that your college has active clubs and communities?', leftAnchor: 'Not important', rightAnchor: 'Very important' },
  { id: 8, dimension: 'social_pref', text: 'Do you prefer small class sizes or large lecture halls?', leftAnchor: 'Small classes', rightAnchor: 'Large lectures' },
  { id: 9, dimension: 'social_pref', text: 'Would you rather work on a solo project or lead a team?', leftAnchor: 'Solo project', rightAnchor: 'Lead a team' },
  { id: 10, dimension: 'social_pref', text: 'How much does the social life of a college matter to you?', leftAnchor: 'Doesn\'t matter', rightAnchor: 'Matters a lot' },
  // Dimension 3: Ambition Type (5 questions)
  { id: 11, dimension: 'ambition', text: 'Does the NIRF ranking of a college matter a lot to you?', leftAnchor: 'Not really', rightAnchor: 'Very much' },
  { id: 12, dimension: 'ambition', text: 'Would you prefer a college known for placements or one known for social impact?', leftAnchor: 'Social impact', rightAnchor: 'Placements' },
  { id: 13, dimension: 'ambition', text: 'Is a high-paying job your primary goal after college?', leftAnchor: 'Not primary', rightAnchor: 'Absolutely' },
  { id: 14, dimension: 'ambition', text: 'How much does your college\'s reputation matter to your family?', leftAnchor: 'Not much', rightAnchor: 'Everything' },
  { id: 15, dimension: 'ambition', text: 'Would you take a less prestigious college if it had a strong program in your exact interest?', leftAnchor: 'No, prestige first', rightAnchor: 'Yes, program first' },
  // Dimension 4: Risk Appetite (5 questions)
  { id: 16, dimension: 'risk', text: 'Would you choose a conventional engineering degree or an interdisciplinary new program?', leftAnchor: 'Conventional', rightAnchor: 'Interdisciplinary' },
  { id: 17, dimension: 'risk', text: 'Do you like knowing exactly what career you\'ll have, or keeping options open?', leftAnchor: 'Know exactly', rightAnchor: 'Keep open' },
  { id: 18, dimension: 'risk', text: 'Would you consider starting something of your own after college?', leftAnchor: 'Unlikely', rightAnchor: 'Definitely' },
  { id: 19, dimension: 'risk', text: 'How do you feel about colleges that are new but experimental?', leftAnchor: 'Too risky', rightAnchor: 'Exciting' },
  { id: 20, dimension: 'risk', text: 'Do you prefer familiar cities or would you go anywhere in India for the right college?', leftAnchor: 'Familiar only', rightAnchor: 'Anywhere' },
  // Dimension 5: Campus Life (5 questions)
  { id: 21, dimension: 'campus_life', text: 'Would you rather have quiet library nights or active campus events?', leftAnchor: 'Quiet library', rightAnchor: 'Active events' },
  { id: 22, dimension: 'campus_life', text: 'How important is fest culture and college events to you?', leftAnchor: 'Not important', rightAnchor: 'Very important' },
  { id: 23, dimension: 'campus_life', text: 'Do you want a college with a strong sports culture?', leftAnchor: 'Don\'t care', rightAnchor: 'Love sports' },
  { id: 24, dimension: 'campus_life', text: 'Would you prefer a compact urban campus or a large residential campus?', leftAnchor: 'Compact urban', rightAnchor: 'Large residential' },
  { id: 25, dimension: 'campus_life', text: 'How much does the energy and vibe of a college matter vs. academic quality?', leftAnchor: 'Academics only', rightAnchor: 'Vibe matters a lot' },
]

export const DNA_DESCRIPTIONS: Record<DnaType, string> = {
  Explorer: 'Curious, self-directed, startup-minded. You thrive when given freedom to explore.',
  Builder: 'Hands-on, project-driven, maker culture. You learn by building things.',
  Scholar: 'Academic-first, research-oriented. You love depth and rigour.',
  Leader: 'Community-driven, organiser, extrovert. You energize the people around you.',
  Creator: 'Arts, expression, aesthetics. You see the world through a creative lens.',
  Connector: 'People-first, commerce instinct, networks. You build bridges between people and ideas.',
}

export const DNA_COLORS: Record<DnaType, string> = {
  Explorer: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Builder: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Scholar: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Leader: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Creator: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Connector: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

export function computeDnaType(responses: { questionId: number; value: number }[]): { type: DnaType; scores: Record<string, number> } {
  const dimensions: Record<string, number[]> = {
    learning_style: [],
    social_pref: [],
    ambition: [],
    risk: [],
    campus_life: [],
  }

  for (const r of responses) {
    const q = DNA_QUIZ_QUESTIONS.find(q => q.id === r.questionId)
    if (q) dimensions[q.dimension].push(r.value)
  }

  const scores: Record<string, number> = {}
  for (const [dim, vals] of Object.entries(dimensions)) {
    scores[dim] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3
  }

  // Assign type based on highest dimension clusters
  const { learning_style, social_pref, ambition, risk, campus_life } = scores

  // Explorer: High exploratory (learning) + High adventurous (risk)
  // Builder: High collaborative (social) + moderate risk
  // Scholar: High structured (low learning) + High independent (low social) + High focused (low campus)
  // Leader: High collaborative (social) + High prestige (ambition)
  // Creator: High exploratory + High vibrant (campus) + moderate social
  // Connector: High collaborative + High prestige + High social campus

  const typeScores: Record<DnaType, number> = {
    Explorer: learning_style * 2 + risk * 2 + (6 - ambition),
    Builder: social_pref * 1.5 + risk + learning_style + (6 - campus_life) * 0.5,
    Scholar: (6 - learning_style) * 2 + (6 - social_pref) * 1.5 + (6 - campus_life),
    Leader: social_pref * 2 + ambition * 1.5 + campus_life,
    Creator: learning_style * 1.5 + campus_life * 1.5 + risk + (6 - ambition),
    Connector: social_pref * 1.5 + ambition * 2 + campus_life * 0.5 + (6 - risk) * 0.5,
  }

  const type = (Object.entries(typeScores).sort((a, b) => b[1] - a[1])[0][0]) as DnaType
  return { type, scores }
}

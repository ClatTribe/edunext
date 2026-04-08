

export interface OMRConfig {
  totalQuestions: number;
  optionsPerQuestion: number;
  optionLabels: string[];
  // NEET 200 specific
  sections?: OMRSection[];
  questionRange?: { start: number; end: number };
}

export interface OMRSection {
  subject: string;
  sectionA: { start: number; end: number; mandatory: boolean; total: number };
  sectionB: { start: number; end: number; mandatory: boolean; total: number; attempt: number };
}

export interface OMRAnswer {
  questionNumber: number;
  selectedOption: string | null;
  confidence: "high" | "medium" | "low";
  section?: "A" | "B";
  subject?: string;
}

export interface OMRResult {
  success: boolean;
  answers: OMRAnswer[];
  totalDetected: number;
  totalAnswered: number;
  totalUnanswered: number;
  summary: string;
  rawAIResponse?: string;
  error?: string;
  subjectBreakdown?: SubjectBreakdown[];
}

export interface SubjectBreakdown {
  subject: string;
  sectionAAnswered: number;
  sectionATotal: number;
  sectionBAnswered: number;
  sectionBTotal: number;
  sectionBAttemptLimit: number;
  sectionBValid: boolean; // false if > 10 answered in Section B
}


// NEET 200 (new format — Physics, Chemistry, Botany, Zoology)
export const NEET_200_CONFIG: OMRConfig = {
  totalQuestions: 200,
  optionsPerQuestion: 4,
  optionLabels: ["A", "B", "C", "D"],
  sections: [
    {
      subject: "Physics",
      sectionA: { start: 1,   end: 35,  mandatory: true,  total: 35 },
      sectionB: { start: 36,  end: 50,  mandatory: false, total: 15, attempt: 10 },
    },
    {
      subject: "Chemistry",
      sectionA: { start: 51,  end: 85,  mandatory: true,  total: 35 },
      sectionB: { start: 86,  end: 100, mandatory: false, total: 15, attempt: 10 },
    },
    {
      subject: "Botany",
      sectionA: { start: 101, end: 135, mandatory: true,  total: 35 },
      sectionB: { start: 136, end: 150, mandatory: false, total: 15, attempt: 10 },
    },
    {
      subject: "Zoology",
      sectionA: { start: 151, end: 185, mandatory: true,  total: 35 },
      sectionB: { start: 186, end: 200, mandatory: false, total: 15, attempt: 10 },
    },
  ],
};

export const DEFAULT_CONFIG: OMRConfig = NEET_200_CONFIG;

// Helper: get subject and section for a question number
export function getQuestionMeta(
  questionNumber: number,
  config: OMRConfig
): { subject: string; section: "A" | "B" } | null {
  if (!config.sections) return null;
  for (const s of config.sections) {
    if (questionNumber >= s.sectionA.start && questionNumber <= s.sectionA.end)
      return { subject: s.subject, section: "A" };
    if (questionNumber >= s.sectionB.start && questionNumber <= s.sectionB.end)
      return { subject: s.subject, section: "B" };
  }
  return null;
}

// Helper: compute per-subject breakdown
export function computeSubjectBreakdown(
  answers: OMRAnswer[],
  config: OMRConfig
): SubjectBreakdown[] {
  if (!config.sections) return [];

  return config.sections.map((s) => {
    const sectionAAnswers = answers.filter(
      (a) => a.questionNumber >= s.sectionA.start &&
             a.questionNumber <= s.sectionA.end &&
             a.selectedOption !== null
    );
    const sectionBAnswers = answers.filter(
      (a) => a.questionNumber >= s.sectionB.start &&
             a.questionNumber <= s.sectionB.end &&
             a.selectedOption !== null
    );

    return {
      subject: s.subject,
      sectionAAnswered: sectionAAnswers.length,
      sectionATotal: s.sectionA.total,
      sectionBAnswered: sectionBAnswers.length,
      sectionBTotal: s.sectionB.total,
      sectionBAttemptLimit: s.sectionB.attempt,
      sectionBValid: sectionBAnswers.length <= s.sectionB.attempt,
    };
  });
}
// OMR Reader Types

export interface OMRConfig {
  totalQuestions: number;
  optionsPerQuestion: number;
  optionLabels: string[];
  sheetType: "auto" | "standard" | "small" | "large" | "upsc";
}

export interface OMRAnswer {
  questionNumber: number;
  selectedOption: string | null;
  confidence: "high" | "medium" | "low";
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
}

export interface ParseOMRRequest {
  image: string;
  config: OMRConfig;
}

export const DEFAULT_CONFIG: OMRConfig = {
  totalQuestions: 120,
  optionsPerQuestion: 4,
  optionLabels: ["A", "B", "C", "D"],
  sheetType: "auto",
};

export const QUESTION_PRESETS = [
  { label: "30 Questions", value: 30 },
  { label: "60 Questions", value: 60 },
  { label: "90 Questions", value: 90 },
  { label: "100 Questions", value: 100 },
  { label: "120 Questions", value: 120 },
  { label: "150 Questions", value: 150 },
  { label: "200 Questions", value: 200 },
] as const;

// Sheet type presets — covers all common Indian exam OMR formats
export const SHEET_TYPE_PRESETS = [
  {
    id: "standard_abcd",
    label: "Standard A B C D",
    description: "School / coaching exams",
    optionsPerQuestion: 4,
    optionLabels: ["A", "B", "C", "D"],
  },
  {
    id: "govt_1234",
    label: "Govt 1 2 3 4",
    description: "UPSC / SSC / Railway / Bank exams",
    optionsPerQuestion: 4,
    optionLabels: ["1", "2", "3", "4"],
  },
  {
    id: "five_option",
    label: "Five Option A B C D E",
    description: "Some state PSC exams",
    optionsPerQuestion: 5,
    optionLabels: ["A", "B", "C", "D", "E"],
  },
  {
    id: "five_option_12345",
    label: "Five Option 1 2 3 4 5",
    description: "Some competitive exams",
    optionsPerQuestion: 5,
    optionLabels: ["1", "2", "3", "4", "5"],
  },
] as const;

export type SheetTypePresetId = typeof SHEET_TYPE_PRESETS[number]["id"];
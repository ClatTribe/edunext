// OMR Reader Types

export interface OMRConfig {
  totalQuestions: number;
  optionsPerQuestion: number; // 4 = A/B/C/D, 5 = A/B/C/D/E
  optionLabels: string[];
}

export interface OMRAnswer {
  questionNumber: number;
  selectedOption: string | null; // "A", "B", "C", "D" or null if unanswered
  confidence: "high" | "medium" | "low";
}

export interface OMRResult {
  success: boolean;
  answers: OMRAnswer[];
  totalDetected: number;
  totalAnswered: number;
  totalUnanswered: number;
  summary: string; // e.g., "1: A, 2: C, 3: B..."
  rawAIResponse?: string;
  error?: string;
}

export interface ParseOMRRequest {
  image: string; // base64 encoded image
  config: OMRConfig;
}

export const DEFAULT_CONFIG: OMRConfig = {
  totalQuestions: 120,
  optionsPerQuestion: 4,
  optionLabels: ["A", "B", "C", "D"],
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
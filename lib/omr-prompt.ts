import { OMRConfig } from "./omr";

export function getOMRSystemPrompt(config: OMRConfig): string {
  const optionsList = config.optionLabels.join(", ");

  return `You are an expert OMR sheet reader for Indian competitive exams.

SHEET LAYOUT:
- 4 columns: [Q1-Q30] [Q31-Q60] [Q61-Q90] [Q91-Q120]
- Each column has 30 rows. Each row = 1 question with 4 circles: A B C D.

SCANNING METHOD:
Scan row by row, column by column (Q1 → Q2 → ... → Q120).
For each row, examine all 4 circles individually.

THE TWO TYPES OF CIRCLES YOU WILL SEE:

TYPE 1 — FILLED (= this is the answer):
- Circle interior is covered with DARK BLUE or BLACK ink
- The circle looks like a solid dark spot/blob
- You CANNOT see the letter inside because ink covers it
- Clearly darker than all other circles in that row

TYPE 2 — EMPTY (= not selected, ignore):
- Circle is just a thin outline ring
- Interior is WHITE or LIGHT grey
- You CAN clearly see a small printed letter (A/B/C/D) inside
- All 4 circles in an unanswered row look identical and light

DECISION RULE PER ROW:
- Is ONE circle noticeably darker than the other 3? → That is the answer
- Are ALL 4 circles looking equally light/similar? → Unanswered → "-"
- Compare circles WITHIN the same row to each other — the filled one stands out

CONFIDENCE THRESHOLD:
- "high" → one circle is clearly much darker than others
- "medium" → one circle appears slightly darker, not fully filled
- "low" → hard to tell, but one seems marginally darker
- Mark "-" ONLY when ALL circles look equally light — no standout circle at all

OUTPUT — raw JSON only:
[{"q":1,"ans":"A","conf":"high"},{"q":2,"ans":"-","conf":"high"},...]`;
}

export function getUserPrompt(config: OMRConfig): string {
  return `Scan this OMR sheet row by row.

For each question row, compare the 4 circles (A B C D) to each other:
- One circle noticeably DARKER than the other 3 → that is the answer
- All 4 circles look equally LIGHT → unanswered → "-"

Do NOT use absolute darkness — use RELATIVE comparison within each row.
A partially filled bubble still counts if it is clearly darker than the other 3 in that row.

Total ${config.totalQuestions} questions. Return JSON array only.`;
}
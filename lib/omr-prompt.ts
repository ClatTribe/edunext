import { OMRConfig } from "./omr";

export function getOMRSystemPrompt(config: OMRConfig, isCropped = false): string {
  const optionsList = config.optionLabels.join(", ");
  const isNumeric = config.optionLabels[0] === "1";
  const [o1, o2, o3, o4] = config.optionLabels;

  const croppedContext = isCropped
    ? `
THE IMAGE IS A CROPPED SECTION:
- This image shows ONLY the answer bubble grid — no header, no instructions
- The entire image IS the answer section — read every single row
- Do NOT skip any rows — every row must appear in output
- Read all 4 columns left-to-right: Q1–30, Q31–60, Q61–90, Q91–120
`
    : `
FINDING THE ANSWER GRID:
- Ignore the header (roll number, booklet number, instructions box) completely
- Find the answer grid — 4 columns of 30 numbered rows each
- Questions may be labeled 1,2,3 or 001,002,003 — output as plain integers
`;

  return `You are a precision OMR scanner for NEET (Indian medical entrance) answer sheets.

FIXED SHEET LAYOUT — NEET FORMAT:
- Always exactly 120 questions
- Always 4 options per question (${optionsList})
- Always 4 columns of 30 questions: Q1–30 | Q31–60 | Q61–90 | Q91–120
- Read columns left to right, rows top to bottom within each column
${croppedContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — PARTIAL SHEET:
THIS SHEET MAY BE PARTIALLY FILLED.
Long runs of unanswered rows (10–30 in a row) are completely normal.
Do NOT invent answers. Do NOT assume a row has an answer because nearby rows do.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 2 — ROW ISOLATION (most common error):
Each row is 100% independent. A filled bubble belongs to EXACTLY ONE row.
- If row 34 has a filled bubble, rows 33 and 35 are UNAFFECTED — they have their own empty circles
- NEVER let a filled bubble in one row "bleed" to the row above or below
- After marking a row as answered, the rows immediately above AND below must be re-checked: 
  are their 4 circles all empty outlines? If yes → both are unanswered "-"
- A filled bubble can only belong to the row whose question number is printed to its LEFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 3 — POSITION COUNTING (second most common error):
The 4 circles in each row are: [${o1}] [${o2}] [${o3}] [${o4}] from left to right.
- ${o2} is the 2nd circle from left. ${o3} is the 3rd circle from left. These are ADJACENT — count carefully.
- When you think the answer is ${o2}: count from the left — is it truly the 2ND circle, not the 3rd?
- When you think the answer is ${o3}: count from the left — is it truly the 3RD circle, not the 2nd?
- When you think the answer is ${o1}: is it truly the LEFTMOST circle, not the 2nd?
- When you think the answer is ${o4}: is it truly the RIGHTMOST circle, not the 3rd?
- If unsure between two adjacent positions → output "-"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT COUNTS AS FILLED — STRICT DEFINITION:
- FILLED = SOLIDLY DARK with INK. The printed ${isNumeric ? "number" : "letter"} inside is COMPLETELY HIDDEN.
- EMPTY  = light circle outline. The ${isNumeric ? "number" : "letter"} is CLEARLY VISIBLE inside.
- The difference is EXTREME — filled = black, not grey, not slightly darker.
- Any circle where the label is still visible = EMPTY → "-"
- Smudge, shadow, printing artifact without solid fill = EMPTY → "-"
- When in doubt → "-". NEVER guess.

READING TECHNIQUE — FOR EVERY ROW:
1. Look at all 4 circles in the row
2. Ask: "Is ANY circle here SOLIDLY filled with dark ink?" — if NO → "-", move on
3. If YES → count its position from the left: 1st, 2nd, 3rd, or 4th
4. Apply Rule 3: double-check the position by counting again
5. Apply Rule 2: check the row above and below — do they also look filled? If yes, you're misreading — only ONE of those rows has the real bubble, the others are empty
6. Record the answer

BANNED BEHAVIOURS:
- Same answer letter appearing 5+ consecutive rows → you are hallucinating, re-read those rows
- Marking a row answered just because the row above or below is answered
- Guessing when uncertain — uncertain always = "-"

OUTPUT: Raw JSON array only, no markdown, no explanation:
[{"q":1,"ans":"${o1}","conf":"high"},{"q":2,"ans":"-","conf":"high"},...]

- "q" = question number (integer)
- "ans" = one of ${optionsList} or "-" for unanswered/unclear
- "conf" = "high" (clearly solid-filled) | "medium" (somewhat dark, identifiable) | "low" → use "-" instead`;
}

export function getUserPrompt(config: OMRConfig, isCropped = false): string {
  const [o1, o2, o3, o4] = config.optionLabels;

  if (isCropped) {
    return `This is a CROPPED NEET OMR answer grid (120 questions, 4 columns of 30).

KEY RULES:
1. PARTIAL SHEET — many rows are unanswered. Long unanswered runs (10–30) are normal. Do not invent answers.
2. ROW ISOLATION — a filled bubble belongs to exactly ONE row. Never attribute it to the row above or below. After marking any row as answered, explicitly verify the rows immediately above and below are empty.
3. POSITION COUNT — positions left to right: 1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4}. ${o2} and ${o3} are adjacent — count carefully. When unsure between two positions → "-".

For each row:
- Step 1: Is any circle solidly filled with dark ink? If NO → "-"
- Step 2: Count position from left (1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4})
- Step 3: Recount to verify position
- Step 4: Check the row above and below are truly empty

Only SOLID BLACK ink = answered. Shadows/smudges = "-".
If same letter appears 5+ rows in a row → you're hallucinating, re-read.

Return ONLY a raw JSON array. No markdown.`;
  }

  return `Read this NEET OMR sheet. Extract all 120 answers (4 columns of 30 each).
Options: ${config.optionLabels.join(", ")}.

KEY RULES:
1. PARTIAL SHEET — many rows unanswered. Do not invent answers.
2. ROW ISOLATION — each filled bubble belongs to exactly one row. Never bleed it to the row above or below.
3. POSITION COUNT — 1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4} from left. Recount before recording.

- Skip header entirely
- Only SOLID BLACK ink fill = answered. Outlines (even slightly dark) = "-"
- After marking any row, verify the rows immediately above and below are truly empty
- Same letter 5+ rows in a row → hallucination, re-read

Return ONLY a raw JSON array. No markdown.`;
}
import { OMRConfig } from "./omr";

export function getOMRSystemPrompt(config: OMRConfig, isCropped = false): string {
  const optionsList = config.optionLabels.join(", ");
  const isNumeric = config.optionLabels[0] === "1";
  const [o1, o2, o3, o4] = config.optionLabels;
  const isNEET200 = config.totalQuestions === 200;

  const croppedContext = isCropped
  ? `
THE IMAGE IS A CROPPED SECTION:
- This image shows ONLY the answer bubble grid — no header, no instructions
- The entire image IS the answer section — read every single row
- Do NOT skip any rows — every row must appear in output
${config.questionRange 
  ? `- This column contains ONLY questions ${config.questionRange.start} to ${config.questionRange.end}
- Output EXACTLY ${config.questionRange.end - config.questionRange.start + 1} entries
- Question numbers start at ${config.questionRange.start}, not 1` 
  : ''}
`
  : `...existing non-cropped text...`;

  const layoutDescription = isNEET200
    ? `
FIXED SHEET LAYOUT — NEET 200-QUESTION FORMAT:
This sheet has 4 VERTICAL COLUMNS side by side. Each column = 1 subject × 50 rows.

PHYSICAL COLUMN POSITIONS (left → right on the sheet):
  COLUMN 1 (far left):  PHYSICS (A+B)    — header says "PHYSICS-(A+B)"    — rows labeled 1–50
  COLUMN 2 (center-left): CHEMISTRY (A+B) — header says "CHEMISTRY-(A+B)" — rows labeled 51–100
  COLUMN 3 (center-right): BOTANY (A+B)   — header says "BOTANY-(A+B)"    — rows labeled 101–150
  COLUMN 4 (far right): ZOOLOGY (A+B)    — header says "ZOOLOGY-(A+B)"   — rows labeled 151–200

Note: Columns 3 and 4 (Botany + Zoology) share a "BIOLOGY" super-header above them.

WITHIN EACH COLUMN — two sections separated by a VISIBLE DIVIDER:
  ┌─────────────────────────────────────────┐
  │  SECTION A: first 35 rows (top portion) │
  │  — Text near divider: "Attempt All The  │
  │    35 Question From Section-A"          │
  ├─────────── visible gap/line ────────────┤
  │  SECTION B: last 15 rows (bottom)       │
  │  — Text near divider: "Attempt any 10   │
  │    Question From Section-B"             │
  └─────────────────────────────────────────┘

EXACT QUESTION RANGES:
  PHYSICS:    Section A = Q1–35 (mandatory)   | Section B = Q36–50 (attempt 10 of 15)
  CHEMISTRY:  Section A = Q51–85 (mandatory)  | Section B = Q86–100 (attempt 10 of 15)
  BOTANY:     Section A = Q101–135 (mandatory) | Section B = Q136–150 (attempt 10 of 15)
  ZOOLOGY:    Section A = Q151–185 (mandatory) | Section B = Q186–200 (attempt 10 of 15)

TOTAL ATTEMPTED = 180 out of 200 (4 subjects × 45 answered = 180). Exactly 20 rows will be unanswered.

SECTION A ROWS ARE NOT GUARANTEED TO BE FILLED:
Although Section A is mandatory in the exam rules, some students leave Section A rows blank on the OMR.
Do NOT assume every Section A row has a filled bubble.
Apply the same strict filled-bubble test to every Section A row — if no bubble is solidly dark → "-", regardless of which section it is.

READING ORDER — CRITICAL:
Read ONE COMPLETE COLUMN at a time, top to bottom, before moving to the next column.
  Step 1: Read Physics column rows 1→50 (left-most column)
  Step 2: Read Chemistry column rows 51→100 (second column)
  Step 3: Read Botany column rows 101→150 (third column)
  Step 4: Read Zoology column rows 151→200 (right-most column)
Do NOT jump between columns. Finish each column fully before moving right.

SECTION B RULES (most critical for accuracy):
- Each Section B block has 15 rows. Student fills EXACTLY 10. Five (5) rows are left BLANK.
- The 5 blank rows can be ANY 5 out of the 15 — they are NOT always the last 5.
- If you count 10 filled bubbles in a Section B block → STOP. The remaining MUST be "-".
- If you count more than 10 filled in Section B → you are hallucinating. Re-read that block.
- Section B ranges: Q36–50, Q86–100, Q136–150, Q186–200.
`
    : `
FIXED SHEET LAYOUT — NEET 120-QUESTION FORMAT:
- Always exactly 120 questions
- Always 4 options per question (${optionsList})
- Always 4 vertical columns of 30 questions each: Q1–30 | Q31–60 | Q61–90 | Q91–120
- Read one column at a time, top to bottom, left to right
`;

  return `You are a precision OMR scanner for NEET (Indian medical entrance) answer sheets.
Your job is to read filled bubbles from a scanned/photographed OMR answer sheet and output structured JSON.
${layoutDescription}
${croppedContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — COLUMN-BY-COLUMN READING:
${isNEET200 ? `This sheet has 4 subject columns. Read each column INDEPENDENTLY.
Each column has its own question numbers printed to the LEFT of the bubbles.
Match the printed question number — do NOT calculate or assume question numbers.
Physics column numbers: 1–50. Chemistry: 51–100. Botany: 101–150. Zoology: 151–200.` : `Read columns left to right: Q1–30, then Q31–60, then Q61–90, then Q91–120.`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 2 — ROW ISOLATION (most common error):
Each row is 100% independent. A filled bubble belongs to EXACTLY ONE row.
- If row 34 has a filled bubble, rows 33 and 35 are UNAFFECTED
- NEVER let a filled bubble in one row "bleed" to the row above or below
- After marking a row as answered, re-check the rows immediately above AND below
- A filled bubble can only belong to the row whose question number is printed to its LEFT
- At the Section A/B divider (rows 35→36, 85→86, 135→136, 185→186), be extra careful — the gap can cause misalignment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 3 — POSITION COUNTING (second most common error):
Each row has exactly 4 circles: [${o1}] [${o2}] [${o3}] [${o4}] from left to right.
- ${o1} = 1st circle (leftmost). ${o2} = 2nd. ${o3} = 3rd. ${o4} = 4th (rightmost).
- ${o2} and ${o3} are ADJACENT in the middle — count carefully, do not confuse them.
- When unsure between two adjacent positions → output "-"
- The option letters/numbers are printed INSIDE each circle as labels.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isNEET200 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 4 — SECTION B VALIDATION:
After reading each Section B block, COUNT the filled answers:
- Q36–50:   filled count must be ≤ 10. If more → re-read this block.
- Q86–100:  filled count must be ≤ 10. If more → re-read this block.
- Q136–150: filled count must be ≤ 10. If more → re-read this block.
- Q186–200: filled count must be ≤ 10. If more → re-read this block.
5 unanswered per Section B block is EXPECTED and CORRECT.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}
WHAT COUNTS AS FILLED — STRICT DEFINITION:
- FILLED = SOLIDLY DARK with INK. The printed ${isNumeric ? "number" : "letter"} inside is COMPLETELY HIDDEN by dark ink.
- EMPTY  = light circle outline. The ${isNumeric ? "number" : "letter"} is CLEARLY VISIBLE inside the circle.
- Smudge, shadow, printing artifact, or partial fill without solid dark coverage = EMPTY → "-"
- When in doubt → "-". NEVER guess.

READING TECHNIQUE — FOR EVERY ROW:
1. Look at the question number printed on the LEFT side of the row
2. Scan all 4 circles in that row. Is any circle SOLIDLY filled with dark ink? If NO → "-"
3. If YES, count its position from left: 1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4}
4. Recount position to verify (common error: confusing ${o2} and ${o3})
5. Verify the filled bubble is in THIS row — not bleeding from the row above or below
6. Record the answer

BANNED BEHAVIOURS:
- Same answer letter 5+ consecutive rows → likely hallucination, re-read those rows
- Marking a row answered just because an adjacent row is answered
- Guessing when uncertain — uncertain always = "-"
- Skipping rows or jumping between columns mid-read
${isNEET200 ? `- Filling more than 10 answers in any Section B block (Q36-50, Q86-100, Q136-150, Q186-200)
- Assuming unanswered Section B rows must have answers — 5 blanks per block is correct
- Assuming Section A rows are always filled — mandatory in exam rules does NOT mean the student filled them. Apply the same strict dark-ink test to every Section A row — if no bubble is solidly dark → "-"` : ''}

OUTPUT FORMAT — Raw JSON array only, no markdown, no explanation, no wrapping:
[{"q":1,"ans":"${o1}","conf":"high"},{"q":2,"ans":"-","conf":"high"},...]

- "q" = question number (integer, matching the printed number on the sheet)
- "ans" = one of ${optionsList} or "-" for unanswered/unclear
- "conf" = "high" | "medium" | "low"
- Use "low" conf when unsure → and set ans to "-"
- Output exactly ${config.totalQuestions} entries, q = 1 through ${config.totalQuestions}`;
}

export function getUserPrompt(config: OMRConfig, isCropped = false): string {
  const [o1, o2, o3, o4] = config.optionLabels;
  const isNEET200 = config.totalQuestions === 200;

  const neet200Rules = isNEET200 ? `
NEET 200 SHEET STRUCTURE:
- 4 vertical columns on the sheet: PHYSICS (Q1-50) | CHEMISTRY (Q51-100) | BOTANY (Q101-150) | ZOOLOGY (Q151-200)
- Each column has a visible DIVIDER separating Section A (top 35 rows) from Section B (bottom 15 rows)
- Section A: read every row with the strict filled-bubble test — do NOT assume all 35 are filled. Some students leave Section A rows blank → mark those as "-".
- Section B: EXACTLY 10 filled, 5 blank. Total attempted = 180 (but may be less if student skipped Section A rows).
- Read each column top-to-bottom COMPLETELY before moving to the next column.

SECTION B VALIDATION (do this after each column):
  After reading Q36–50: count filled. Must be ≤ 10.
  After reading Q86–100: count filled. Must be ≤ 10.
  After reading Q136–150: count filled. Must be ≤ 10.
  After reading Q186–200: count filled. Must be ≤ 10.
  If count > 10 in any block → you misread. Go back and re-check that block.
` : '';

  if (isCropped) {
    return `This is a CROPPED NEET OMR answer grid (${config.totalQuestions} questions, ${isNEET200 ? '180' : config.totalQuestions} attempted).
${neet200Rules}
READING RULES:
1. Read column by column, top to bottom, left to right.
2. ROW ISOLATION — each filled bubble belongs to exactly ONE row. Check rows above/below.
3. POSITION — 1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4} from left. Always recount.
4. Only SOLID DARK INK = filled. Outlines/smudges/shadows = "-".
5. Same letter 5+ consecutive rows → re-read those rows.
${isNEET200 ? `6. Section B blocks (15 rows each) have EXACTLY 10 filled, 5 blank. Do not fill more than 10.
7. Section A rows are NOT assumed to be filled — apply the same strict dark-ink test. If no bubble is solidly dark → "-".` : ''}

Return ONLY a raw JSON array of ${config.totalQuestions} entries. No markdown, no explanation.`;
  }

  return `Read this NEET OMR answer sheet. Extract all ${config.totalQuestions} answers (${isNEET200 ? '180 will be filled, 20 blank — but Section A rows may also be blank if the student skipped them' : 'some may be blank'}).
Options per row: ${config.optionLabels.join(", ")}.
${neet200Rules}
READING RULES:
1. IGNORE the header area (student info, roll number, instructions, category). Start at the answer grid.
2. Read ONE COLUMN at a time: ${isNEET200 ? 'Physics (Q1-50) → Chemistry (Q51-100) → Botany (Q101-150) → Zoology (Q151-200)' : 'Q1-30 → Q31-60 → Q61-90 → Q91-120'}.
3. Within each column, read TOP to BOTTOM. Match the printed question number on the left.
4. ROW ISOLATION — each filled bubble belongs to exactly one row. Never bleed to adjacent rows.
5. POSITION — 1st=${o1}, 2nd=${o2}, 3rd=${o3}, 4th=${o4} from left. Recount before recording.
6. Only SOLID DARK INK (letter/number inside completely hidden) = filled. Everything else = "-".
7. After marking any row, verify the rows immediately above and below are truly empty.
8. Same answer 5+ consecutive rows → likely hallucination, re-read those rows carefully.
9. Section A rows (Q1–35, Q51–85, Q101–135, Q151–185) are NOT assumed to be filled. Although Section A is mandatory in exam rules, some students leave rows blank — apply the same strict dark-ink test to every Section A row. If no bubble is solidly dark → "-".
${isNEET200 ? `10. At the Section A/B divider (gap between rows 35↔36, 85↔86, 135↔136, 185↔186), be extra careful with alignment.
11. After finishing each Section B block, COUNT your filled answers. If more than 10 → re-read.` : ''}

Return ONLY a raw JSON array of exactly ${config.totalQuestions} entries. No markdown, no wrapping, no explanation.`;
}
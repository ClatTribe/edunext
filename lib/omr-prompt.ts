import { OMRConfig } from "./omr";

export function getOMRSystemPrompt(config: OMRConfig, isCropped = false): string {
  const optionsList = config.optionLabels.join(", ");

  const croppedContext = isCropped ? `
THE IMAGE IS A CROPPED SECTION:
- This image shows ONLY the answer bubble grid — no header, no instructions
- The entire image IS the answer section — read every single row
- Do NOT skip any rows — every row is a question
- Read ALL columns left to right
` : `
FINDING THE ANSWER GRID:
- Ignore the header (roll number, booklet number, instructions) completely
- Find the answer grid — numbered rows each with ${config.optionsPerQuestion} bubbles
- Questions may be numbered 1,2,3 or 001,002,003 — output as integers only
`;

  return `You are an expert OMR sheet reader for Indian competitive exams.

SHEET OPTIONS: ${optionsList}
This sheet has ${config.optionsPerQuestion} options per question.
${croppedContext}
SCANNING — row by row, column by column:
For EACH question row:
1. Look at all ${config.optionsPerQuestion} bubbles side by side
2. COMPARE them RELATIVE to each other within that same row
3. Ask: "Which ONE of these ${config.optionsPerQuestion} circles looks clearly DARKER/FILLED compared to the others?"
4. That darkest circle = the answer
5. If ALL circles look equally light = unanswered = "-"

ANTI-BIAS RULES — CRITICAL:
- Do NOT default to option ${config.optionLabels[config.optionLabels.length - 1]} (last option) when unsure
- Do NOT default to option ${config.optionLabels[0]} (first option) when unsure  
- If you are not sure → mark "-" — never guess
- Expect answers to be roughly evenly distributed across all ${config.optionsPerQuestion} options
- If your output has more than 40% of answers as the same option → you are guessing, stop and re-read
- Each option (${optionsList}) should appear roughly equally often

FILLED vs EMPTY:
- FILLED = circle interior is solidly covered with dark ink, you cannot see the printed number/letter inside
- EMPTY = circle is just an outline ring, you CAN see the printed label (${optionsList}) inside clearly
- Partially filled still counts if it is clearly darker than the other 3 in that row

STRICT RULES:
- Read EVERY question 1 to ${config.totalQuestions}
- Output question numbers as plain integers (1 not "001")
- Never guess — uncertain = "-"

OUTPUT — raw JSON only:
[{"q":1,"ans":"${config.optionLabels[0]}","conf":"high"},{"q":2,"ans":"-","conf":"high"},...]

- "ans" = one of ${optionsList} or "-"
- "conf" = "high" / "medium" / "low"`;
}

export function getUserPrompt(config: OMRConfig, isCropped = false): string {
  if (isCropped) {
    return `This is a CROPPED image of only the answer bubble grid.
Read ALL ${config.totalQuestions} answers. Options: ${config.optionLabels.join(", ")}.

CRITICAL: Do not bias toward any single option. Compare bubbles within each row — the one that is clearly darker than the other ${config.optionsPerQuestion - 1} is the answer. If none stands out clearly → "-".

Return JSON array only.`;
  }

  return `Read this OMR answer sheet. Extract all ${config.totalQuestions} answers.
Options: ${config.optionLabels.join(", ")}.

- Ignore header section completely
- Compare bubbles within each row — darkest = answer
- Do NOT default to any single option when unsure → use "-"
- Expect answers spread across all options roughly equally
- Unanswered rows → "-"
- Question numbers as plain integers

Return JSON array only.`;
}
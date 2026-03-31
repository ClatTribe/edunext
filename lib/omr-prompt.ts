import { OMRConfig } from "./omr";

export function getOMRSystemPrompt(config: OMRConfig, isCropped = false): string {
  const optionsList = config.optionLabels.join(", ");
  const isNumeric = config.optionLabels[0] === "1";

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

  return `You are a precision OMR (Optical Mark Recognition) scanner for Indian competitive exam answer sheets.

YOUR TASK: Read a scanned OMR answer sheet and extract which bubble is filled for each question.

SHEET FORMAT:
- Options per question: ${config.optionsPerQuestion} (labeled: ${optionsList})
- Total questions to extract: ${config.totalQuestions}
${isNumeric ? `- Bubbles are labeled with NUMBERS: ${optionsList} printed inside each circle` : `- Bubbles are labeled with LETTERS: ${optionsList} printed inside each circle`}
${croppedContext}

CRITICAL — HOW TO READ EACH ROW:
The sheet has ${Math.ceil(config.totalQuestions / 30)} columns of 30 questions each, read left to right.
For EACH question row, there are ${config.optionsPerQuestion} circles in a line:
  - Position 1 (leftmost) = option ${config.optionLabels[0]}
  - Position 2 = option ${config.optionLabels[1]}
  - Position 3 = option ${config.optionLabels[2]}
  - Position 4 (rightmost) = option ${config.optionLabels[3]}
${config.optionsPerQuestion === 5 ? `  - Position 5 (far right) = option ${config.optionLabels[4]}` : ""}

FILLED vs EMPTY — ABSOLUTE RULES:
- A FILLED bubble is SOLID DARK — the printed label inside is COMPLETELY OBSCURED by dark ink/pencil
- An EMPTY bubble is a LIGHT CIRCLE — you can clearly see the printed ${isNumeric ? "number" : "letter"} inside it
- The filled bubble will be DRAMATICALLY darker than the empty ones — it is NOT subtle
- There should be exactly ONE filled bubble per row (or zero if unanswered)

READING TECHNIQUE — DO THIS FOR EVERY ROW:
1. Look at all ${config.optionsPerQuestion} circles in the row simultaneously
2. Identify which ONE circle is solid dark (ink-filled) vs the others which are light outlines
3. COUNT ITS POSITION from left: 1st, 2nd, 3rd, or 4th position
4. Map position to the option label: position 1=${config.optionLabels[0]}, position 2=${config.optionLabels[1]}, position 3=${config.optionLabels[2]}, position 4=${config.optionLabels[3]}
5. DOUBLE-CHECK: Is the dark circle truly at that position? Count from left again.

COMMON MISTAKES TO AVOID:
- Do NOT confuse option ${config.optionLabels[2]} and ${config.optionLabels[3]} — these are the two rightmost bubbles, count carefully
- Do NOT confuse option ${config.optionLabels[0]} and ${config.optionLabels[1]} — these are the two leftmost bubbles
- If the filled bubble is the RIGHTMOST one in the row, it is option ${config.optionLabels[config.optionsPerQuestion - 1]}, NOT ${config.optionLabels[config.optionsPerQuestion - 2]}
- If the filled bubble is the LEFTMOST one in the row, it is option ${config.optionLabels[0]}, NOT ${config.optionLabels[1]}
- When the filled bubble is 3rd from left, the answer is ${config.optionLabels[2]}. When it is 4th, the answer is ${config.optionLabels[3]}. Do NOT mix these up.

ANTI-HALLUCINATION RULES:
- If you cannot clearly see which bubble is filled → mark "-" (unanswered)
- NEVER guess — uncertain = "-"
- Expect answers to be distributed roughly evenly across all ${config.optionsPerQuestion} options
- If more than 35% of your answers are the same option, you are making systematic errors — re-read

READING ORDER:
- Read questions sequentially: 1, 2, 3, ... up to ${config.totalQuestions}
- The sheet may have questions arranged in columns (e.g., 1-30 in column 1, 31-60 in column 2, etc.)
- Follow the question NUMBERS printed on the left of each row

OUTPUT FORMAT — raw JSON array only, no markdown, no explanation:
[{"q":1,"ans":"${config.optionLabels[0]}","conf":"high"},{"q":2,"ans":"-","conf":"high"},...]

- "q" = question number as integer
- "ans" = one of ${optionsList} or "-" for unanswered
- "conf" = "high" if bubble is clearly filled, "medium" if somewhat ambiguous, "low" if very uncertain`;
}

export function getUserPrompt(config: OMRConfig, isCropped = false): string {
  if (isCropped) {
    return `This is a CROPPED image showing ONLY the answer bubble grid of an OMR sheet.

Read ALL ${config.totalQuestions} answers. Options: ${config.optionLabels.join(", ")}.

For each row: find the ONE solid dark bubble among the ${config.optionsPerQuestion} circles. Count its position from LEFT (1st=${config.optionLabels[0]}, 2nd=${config.optionLabels[1]}, 3rd=${config.optionLabels[2]}, 4th=${config.optionLabels[3]}).

IMPORTANT: The rightmost filled bubble = option ${config.optionLabels[config.optionsPerQuestion - 1]}, not ${config.optionLabels[config.optionsPerQuestion - 2]}. Count positions carefully.

If unsure about any row → "-". Never guess.

Return ONLY a JSON array.`;
  }

  return `Read this OMR answer sheet image. Extract all ${config.totalQuestions} answers.
Options: ${config.optionLabels.join(", ")}.

INSTRUCTIONS:
- Skip the header section (roll number, booklet code, etc.) entirely
- Focus only on the answer bubble grid
- For each question row: identify the ONE dark filled bubble
- Count its position from LEFT to determine the answer: 1st=${config.optionLabels[0]}, 2nd=${config.optionLabels[1]}, 3rd=${config.optionLabels[2]}, 4th=${config.optionLabels[3]}
- The RIGHTMOST filled bubble = ${config.optionLabels[config.optionsPerQuestion - 1]}. Do NOT confuse with ${config.optionLabels[config.optionsPerQuestion - 2]}
- Unanswered rows → "-"
- Question numbers as plain integers

Return ONLY a JSON array.`;
}
// =============================================================
// FILE: app/api/parse-omr/route.ts
// REQUIRES: npm install @google/generative-ai
// ENV VAR:  GEMINI_API_KEY in .env.local
// =============================================================

import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  OMRConfig,
  OMRAnswer,
  OMRResult,
  DEFAULT_CONFIG,
} from "../../../../lib/omr";
import { getOMRSystemPrompt, getUserPrompt } from "../../../../lib/omr-prompt";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- Helper: Parse raw AI JSON into structured answers ---
interface RawAnswer {
  q: number;
  ans: string;
  conf: string;
}

function parseAIResponse(rawText: string, config: OMRConfig): OMRAnswer[] {
  let jsonStr = rawText.trim();
  jsonStr = jsonStr.replace(/```json?\s*/g, "").replace(/```\s*/g, "");

  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error(
      "No JSON array found in AI response. Raw: " + rawText.slice(0, 200),
    );
  }

  const rawAnswers: RawAnswer[] = JSON.parse(arrayMatch[0]);

  const answers: OMRAnswer[] = rawAnswers.map((raw) => ({
    questionNumber: raw.q,
    selectedOption:
      raw.ans === "-" || raw.ans === "?" ? null : raw.ans.toUpperCase(),
    confidence: (["high", "medium", "low"].includes(raw.conf)
      ? raw.conf
      : "medium") as "high" | "medium" | "low",
  }));

  const answerMap = new Map(answers.map((a) => [a.questionNumber, a]));
  const fullAnswers: OMRAnswer[] = [];

  for (let i = 1; i <= config.totalQuestions; i++) {
    fullAnswers.push(
      answerMap.get(i) || {
        questionNumber: i,
        selectedOption: null,
        confidence: "low",
      },
    );
  }

  return fullAnswers;
}

// --- Main POST handler ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      image,
      config: userConfig,
      columnPrompt,
    } = body as {
      image: string;
      config?: Partial<OMRConfig>;
      columnPrompt?: string;
      questionOffset?: number;
    };

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" } as OMRResult,
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY not set in .env.local",
        } as OMRResult,
        { status: 500 },
      );
    }

    const config: OMRConfig = {
      ...DEFAULT_CONFIG,
      ...userConfig,
      optionLabels: userConfig?.optionLabels || DEFAULT_CONFIG.optionLabels,
    };

    // Detect media type from data URL
    let mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
      "image/jpeg";
    if (image.startsWith("data:image/png")) mimeType = "image/png";
    else if (image.startsWith("data:image/webp")) mimeType = "image/webp";
    else if (image.startsWith("data:image/gif")) mimeType = "image/gif";

    // Strip data URL prefix → raw base64
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // --- Gemini Vision API call ---
    // --- Gemini Vision API call (raw fetch, no referrer) ---

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: getOMRSystemPrompt(config) }],
          },
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: columnPrompt || getUserPrompt(config) },
              ],
            },
          ],
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawResponse: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse into structured answers
    const answers = parseAIResponse(rawResponse, config);
    const totalAnswered = answers.filter(
      (a) => a.selectedOption !== null,
    ).length;

    const summary = answers
      .map((a) => `${a.questionNumber}: ${a.selectedOption || "-"}`)
      .join(", ");

    const omrResult: OMRResult = {
      success: true,
      answers,
      totalDetected: answers.length,
      totalAnswered,
      totalUnanswered: config.totalQuestions - totalAnswered,
      summary,
      rawAIResponse: rawResponse,
    };

    return NextResponse.json(omrResult);
  } catch (error: unknown) {
    console.error("OMR Parse Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to process OMR sheet: ${msg}`,
        answers: [],
        totalDetected: 0,
        totalAnswered: 0,
        totalUnanswered: 0,
        summary: "",
      } as OMRResult,
      { status: 500 },
    );
  }
}

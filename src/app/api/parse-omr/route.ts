import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  OMRConfig,
  OMRAnswer,
  OMRResult,
  DEFAULT_CONFIG,
} from "../../../../lib/omr";
import { getOMRSystemPrompt, getUserPrompt } from "../../../../lib/omr-prompt";

// --- Preprocess image for better OMR detection ---
// --- Preprocess image for better OMR detection ---
async function preprocessImage(base64Data: string): Promise<string> {
  const inputBuffer = Buffer.from(base64Data, "base64");

  // Step 1: Get image metadata to check quality
  const metadata = await sharp(inputBuffer).metadata();
  const isLowRes =
    (metadata.width || 0) < 1500 || (metadata.height || 0) < 1500;

  let pipeline = sharp(inputBuffer).greyscale().normalize(); // Auto contrast stretch

  // Step 2: If low resolution, upscale first
  if (isLowRes && metadata.width && metadata.height) {
    const scale = 2;
    pipeline = pipeline.resize(
      metadata.width * scale,
      metadata.height * scale,
      { kernel: sharp.kernel.lanczos3 },
    );
  }

  // Step 3: Aggressive sharpen to fix blur
  pipeline = pipeline
    .sharpen({ sigma: 2, m1: 2, m2: 1 }) // Strong sharpen
    .linear(1.3, -(128 * 1.3 - 128)) // contrast via linear(a, b) → pixel = a * pixel + b
    .modulate({ brightness: 1.15 });
    
  // Step 4: Apply CLAHE (adaptive histogram equalization)
  // This makes filled bubbles stand out even in uneven lighting
  pipeline = pipeline.clahe({
    width: 10,
    height: 10,
    maxSlope: 5,
  });

  // Step 5: Threshold to make filled bubbles solid black, empty ones white
  // This is the KEY step for blurry images
  pipeline = pipeline.threshold(160);

  const processed = await pipeline.jpeg({ quality: 95 }).toBuffer();

  return processed.toString("base64");
}
// --- Parse raw AI JSON into structured answers ---
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

// --- Call Gemini API ---
async function callGemini(
  base64Data: string,
  mimeType: string,
  config: OMRConfig,
  isCropped: boolean,
): Promise<string> {
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: getOMRSystemPrompt(config, isCropped) }],
        },
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: getUserPrompt(config, isCropped) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
        },
      }),
    },
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`);
  }

  const geminiData = await geminiRes.json();
  return geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// --- Main POST handler ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      image,
      config: userConfig,
      isCropped,
    } = body as {
      image: string;
      config?: Partial<OMRConfig>;
      isCropped?: boolean;
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

    // Strip data URL prefix → raw base64
    const rawBase64 = image.includes(",") ? image.split(",")[1] : image;

    // Preprocess: greyscale + normalize + sharpen
    const base64Data = await preprocessImage(rawBase64);

    // Call Gemini 2.5 Pro
    const rawResponse = await callGemini(
      base64Data,
      "image/jpeg",
      config,
      isCropped ?? false,
    );

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

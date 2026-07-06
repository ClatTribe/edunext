const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callGemini(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    console.warn(`Gemini ${model} failed:`, response.status);
    return null;
  }

  const data = (await response.json()) as GeminiResponse;
  if (data.error) {
    console.warn(`Gemini ${model} error:`, data.error.message);
    return null;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || data.candidates?.[0]?.finishReason === "SAFETY") {
    return null;
  }

  return text;
}

export async function generateGeminiJson<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let text = await callGemini(PRIMARY_MODEL, systemPrompt, userPrompt, apiKey);
  if (!text) {
    text = await callGemini(FALLBACK_MODEL, systemPrompt, userPrompt, apiKey);
  }
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
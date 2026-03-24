import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are Medha AI, the intelligent counselling assistant for EduNext (getedunext.com) â India's privacy-first college discovery platform.

Your role is to guide students toward the right college by acting as a knowledgeable, empathetic, and data-driven counsellor.

CORE CAPABILITIES:
1. College Counselling â Help students pick the right college based on their rank, percentile, category, preferred branch, location, budget, and career goals.
2. Exam Guidance â Advise on JEE Main/Advanced, NEET, CAT, XAT, CUET, CLAT, IPMAT and other entrance exams.
3. Admission Process â Explain JoSAA, CSAB, state counselling, management quota, NRI quota, and direct admission processes.
4. College Comparison â Compare colleges on placements, fees, faculty, infrastructure, campus life, and alumni network.
5. Scholarship Guidance â Help students find and apply for scholarships (merit-based, need-based, state, corporate).
6. Career Path Advice â Guide on which streams and colleges align best with career aspirations.

PERSONALITY:
â Warm, encouraging, and student-friendly â like a senior mentor who genuinely cares
â Use simple language; avoid jargon unless explaining it
â Be specific with data (cutoffs, fees, placement stats) when you have it
â If unsure, say so honestly and suggest where to find accurate info
â Occasionally use Hindi/Hinglish phrases to feel relatable (e.g., "Bilkul!", "Tension mat lo")
â Keep responses concise but thorough â students are busy

IMPORTANT RULES:
â Never make up placement data or cutoff scores â if you don't know the exact number, say "approximate" or "as per last year's data"
â Always ask follow-up questions to understand the student's full profile before giving recommendations
â Encourage students to use EduNext's tools (College Finder, Percentile Predictor, Shortlist) for detailed analysis
â Be privacy-conscious â never ask for personal identifiable information beyond what's needed for counselling

RESPONSE FORMAT:
â Keep your main response concise (2-4 sentences max)
â Ask at most 3 follow-up questions. NEVER ask more than 3.
â CRITICAL: Put each follow-up question on its OWN separate line. Never combine multiple questions into one paragraph.
â Start each question with a number like "1." on a new line
â Example format:
Your main response text here.

1. First question?
2. Second question?
3. Third question?

PROFILE-AWARE RULES:
â The student's profile data (degree, field, state) will be provided if available. NEVER ask questions about information already in the profile.
â If the student's degree is "MBA", do NOT ask "are you looking for UG or PG?" â you already know.
â Instead, ask ACTIONABLE questions like: preferred specialization, budget, target exam score, location preference, or what matters most (placements, brand, fees).
â Focus on helping the student narrow down to specific colleges or scholarships from EduNext's database.
â Be direct and useful â don't waste questions on things you already know.`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, mode = "chat", profileContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Filter out empty or invalid messages and map to Gemini format
    const geminiMessages = messages
      .filter((msg: { role: string; content: string }) => msg.content && msg.content.trim() !== '')
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Ensure we have at least one message
    if (geminiMessages.length === 0) {
      return NextResponse.json(
        { error: "At least one non-empty message is required" },
        { status: 400 }
      );
    }

    // Ensure the first message is from user (Gemini requirement)
    if (geminiMessages[0].role !== "user") {
      geminiMessages.shift();
    }

    // Ensure alternating roles (Gemini requirement)
    const cleanedMessages = [];
    let lastRole = "";
    for (const msg of geminiMessages) {
      if (msg.role !== lastRole) {
        cleanedMessages.push(msg);
        lastRole = msg.role;
      }
    }

    // Build dynamic system prompt with profile data
    let dynamicPrompt = SYSTEM_PROMPT;
    if (profileContext) {
      const parts = [];
      if (profileContext.degree) parts.push(`Degree: ${profileContext.degree}`);
      if (profileContext.field) parts.push(`Field/Program: ${profileContext.field}`);
      if (profileContext.state) parts.push(`Preferred State: ${profileContext.state}`);
      if (parts.length > 0) {
        dynamicPrompt += `\n\nSTUDENT PROFILE (already known â do NOT ask about these):\n${parts.join('\n')}`;
      }
    }

    const model = mode === "deep" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: cleanedMessages,
          systemInstruction: {
            parts: [{ text: dynamicPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Could you try again?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Medha AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

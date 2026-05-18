import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `You are EduNext Data Bot, a highly analytical AI assistant that fetches REAL college data from our live database.

Your role is to provide accurate, data-driven answers about colleges using the 'get_college_details' tool.

CORE RULES:
1. ALWAYS use the tool to fetch college data — NEVER guess numbers
2. Format data beautifully with proper structure
3. If tool returns no data, clearly state "I don't have that information in the database"
4. Be direct, professional, and helpful

RESPONSE FORMAT:
— Keep responses concise (3-5 sentences)
— Present data in clean, readable format
— Use bullet points for multiple colleges
— Highlight key stats: fees, placements, location

TOOL USAGE:
— When user asks about a college, immediately call 'get_college_details'
— Extract college name from user's question
— Present the fetched data in a structured way

EXAMPLE RESPONSE:
"Based on our database, here's what I found for IIT Bombay:

📍 Location: Mumbai, Maharashtra
💰 Total Fees: ₹8.5 Lakhs
📊 Average Package: ₹20 LPA
🎯 Highest Package: ₹1.8 Crore"`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_college_details",
        description: "Fetch detailed information about a specific college from the database, including fees, placements, location, and courses.",
        parameters: {
          type: "OBJECT",
          properties: {
            college_name: {
              type: "STRING",
              description: "The name of the college to search for, e.g., 'IIT Bombay', 'Symbiosis Pune', 'NMIMS'.",
            },
          },
          required: ["college_name"],
        },
      },
    ],
  },
];

async function callGemini(contents: any[], apiKey: string, systemPrompt: string) {
  const model = "gemini-1.5-flash"; // Correct model name
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        tools,
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini API error details:", errorData);
    throw new Error(`Gemini API Error: ${errorData}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const body = await request.json();
    const { messages, profileContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Build dynamic system prompt with profile context
    let dynamicPrompt = SYSTEM_PROMPT;
    if (profileContext) {
      const parts = [];
      if (profileContext.examScore) parts.push(`Exam Score: ${profileContext.examScore}`);
      if (profileContext.preferredBranch) parts.push(`Preferred Branch: ${profileContext.preferredBranch}`);
      if (profileContext.budget) parts.push(`Budget: ${profileContext.budget}`);
      if (profileContext.location) parts.push(`Preferred Location: ${profileContext.location}`);
      
      if (parts.length > 0) {
        dynamicPrompt += `\n\nSTUDENT PROFILE (use this context for better recommendations):\n${parts.join('\n')}`;
      }
    }

    // Filter and map messages to Gemini format
    const geminiMessages = messages
      .filter((msg: any) => msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Ensure first message is from user
    if (geminiMessages.length > 0 && geminiMessages[0].role !== "user") {
      geminiMessages.shift();
    }

    // ✅ CRITICAL: Ensure alternating roles (Gemini API requirement)
    const cleanedMessages = [];
    let lastRole = "";
    for (const msg of geminiMessages) {
      if (msg.role !== lastRole) {
        cleanedMessages.push(msg);
        lastRole = msg.role;
      }
    }

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    // First call to Gemini
    let data = await callGemini(cleanedMessages, GEMINI_API_KEY, dynamicPrompt);
    let candidate = data.candidates?.[0];

    // Check if Gemini wants to call a function
    if (candidate?.content?.parts?.[0]?.functionCall) {
      const functionCall = candidate.content.parts[0].functionCall;
      
      if (functionCall.name === "get_college_details") {
        const { college_name } = functionCall.args;
        
        console.log(`🔍 Searching database for: ${college_name}`);
        
        // Execute Supabase Query
        const { data: dbData, error } = await supabase
          .from("college_microsites")
          .select("college_name, location, microsite_data")
          .ilike("college_name", `%${college_name}%`)
          .limit(3);

        let queryResult;
        if (error) {
          console.error("Supabase Error:", error);
          queryResult = { error: "Failed to query database." };
        } else if (!dbData || dbData.length === 0) {
          queryResult = { message: `No college found matching "${college_name}". Try a different name.` };
        } else {
          // Send simplified data
          queryResult = dbData.map(c => ({
            name: c.college_name,
            location: c.location,
            fees: c.microsite_data?.fees?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("total"))?.[1] || "N/A",
            avgPackage: c.microsite_data?.placement?.[0]?.headers?.["Average package"] || c.microsite_data?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("average"))?.[1] || "N/A",
            highestPackage: c.microsite_data?.placement?.[0]?.headers?.["Highest package"] || c.microsite_data?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1] || "N/A",
          }));
          
          console.log(`✅ Found ${dbData.length} college(s)`);
        }

        // Add function call and response to conversation
        cleanedMessages.push({
          role: "model",
          parts: [{ functionCall }],
        });

        cleanedMessages.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: { result: queryResult },
            },
          }],
        });

        // Second call to Gemini with the function response
        data = await callGemini(cleanedMessages, GEMINI_API_KEY, dynamicPrompt);
        candidate = data.candidates?.[0];
      }
    }

    const aiResponse = candidate?.content?.parts?.[0]?.text || "I couldn't process that. Could you try again?";

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Data Bot API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
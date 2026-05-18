import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";



const SYSTEM_PROMPT = `You are a highly analytical, data-driven AI assistant for EduNext.
Your sole purpose is to answer questions about colleges using the database tool provided to you.
You have access to a tool called 'get_college_details'. 
Whenever a user asks about a specific college (e.g., fees, placements, location), you MUST use the tool to fetch the exact data.
Do not guess or hallucinate any numbers or data. If the tool returns data, format it beautifully and concisely in your response.
If the tool returns no data, explicitly state that you don't have that information in the database.
Always be direct and professional.`;

// Define the tools for Gemini
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

async function callGemini(contents: any[], apiKey: string) {
  const model = "gemini-3.1-flash-live"; // Changed to match Medha AI model
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        tools,
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
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
      return NextResponse.json({ error: "Supabase credentials not configured in backend" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const geminiMessages: any[] = messages
      .filter((msg: any) => msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    if (geminiMessages.length === 0 || geminiMessages[0].role !== "user") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    // First call to Gemini
    let data = await callGemini(geminiMessages, GEMINI_API_KEY);
    let candidate = data.candidates?.[0];

    // Check if Gemini wants to call a function
    if (candidate?.content?.parts?.[0]?.functionCall) {
      const functionCall = candidate.content.parts[0].functionCall;
      
      if (functionCall.name === "get_college_details") {
        const { college_name } = functionCall.args;
        
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
          queryResult = { message: "No college found matching that name." };
        } else {
          // Send simplified data back to avoid massive token usage
          queryResult = dbData.map(c => ({
            name: c.college_name,
            location: c.location,
            fees: c.microsite_data?.fees?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("total"))?.[1] || "N/A",
            avgPackage: c.microsite_data?.placement?.[0]?.headers?.["Average package"] || c.microsite_data?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("average"))?.[1] || "N/A",
            highestPackage: c.microsite_data?.placement?.[0]?.headers?.["Highest package"] || c.microsite_data?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1] || "N/A",
          }));
        }

        // Add function call and response to conversation history
        geminiMessages.push({
          role: "model",
          parts: [{ functionCall }],
        });

        geminiMessages.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: { result: queryResult },
            },
          }],
        });

        // Make second call to Gemini with the function response
        data = await callGemini(geminiMessages, GEMINI_API_KEY);
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

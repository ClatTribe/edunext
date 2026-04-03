import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type } = body;

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Missing text or type parameter' },
        { status: 400 }
      );
    }

    if (type !== 'student' && type !== 'college') {
      return NextResponse.json(
        { error: 'Type must be either "student" or "college"' },
        { status: 400 }
      );
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text must be a non-empty string' },
        { status: 400 }
      );
    }

    // Call Gemini embedding API
    const model = genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    if (!embedding || embedding.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        embedding: embedding as number[],
        type,
        textLength: text.length,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in embed route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

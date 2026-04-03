import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, collegeId } = body;

    if (!studentId || !collegeId) {
      return NextResponse.json(
        { error: 'Missing studentId or collegeId' },
        { status: 400 }
      );
    }

    // Fetch student data
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch college data
    const { data: collegeData, error: collegeError } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', collegeId)
      .single();

    if (collegeError || !collegeData) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      );
    }

    // Prepare data for Gemini analysis
    const studentSOP = studentData.statement_of_purpose || 'No SOP provided';
    const studentExtracurriculars = studentData.extracurriculars || 'None listed';
    const studentAcademics = studentData.gpa || 0;

    const collegeAbout = collegeData.about || 'No description provided';
    const collegeCriteria = collegeData.admissions_criteria || 'Not specified';
    const collegeCulture = collegeData.culture || 'Not specified';

    // Create prompt for Gemini
    const prompt = `You are an expert college counselor analyzing the fit between a student and college.

STUDENT PROFILE:
- Statement of Purpose: ${studentSOP}
- Extracurricular Activities: ${studentExtracurriculars}
- Academic Profile (GPA): ${studentAcademics}

COLLEGE PROFILE:
- About: ${collegeAbout}
- Admissions Criteria: ${collegeCriteria}
- Culture & Values: ${collegeCulture}

Analyze the semantic and cultural fit between this student and college across three dimensions:
1. Academic Alignment: How well does the student's academics match the college's standards?
2. Values & Culture Alignment: How well do the student's interests and extracurriculars align with college culture?
3. Personal Fit: How well does the student's SOP align with the college's mission?

Provide your response in this exact JSON format:
{
  "fitScore": <a number between 0-100 representing overall fit>,
  "reasoning": "<detailed explanation of the fit in 2-3 sentences>",
  "matchQuote": "<a single inspiring quote or insight about this student-college pairing, max 15 words>"
}`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse Gemini response' },
        { status: 500 }
      );
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(
      {
        fitScore: parsedResponse.fitScore,
        reasoning: parsedResponse.reasoning,
        matchQuote: parsedResponse.matchQuote,
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
    console.error('Error in match route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

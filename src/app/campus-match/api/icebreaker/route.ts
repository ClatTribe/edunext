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
    const { matchId, studentId, collegeId } = body;

    if (!matchId || !studentId || !collegeId) {
      return NextResponse.json(
        { error: 'Missing matchId, studentId, or collegeId' },
        { status: 400 }
      );
    }

    // Fetch student profile
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

    // Fetch college profile
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

    // Fetch match record to get signal type and ghost mode status
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('signal_type, ghost_mode')
      .eq('id', matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const ghostMode = matchData.ghost_mode || false;

    // Prepare student data (mask if ghost mode is on)
    let studentInfo = '';
    if (ghostMode) {
      studentInfo = `Student interests: ${studentData.interests || 'Not specified'}\nAcademic level: Similar to your cohort`;
    } else {
      studentInfo = `Name: ${studentData.name || 'Anonymous'}\nStatement of Purpose: ${studentData.statement_of_purpose || 'Not provided'}\nInterests: ${studentData.interests || 'Not specified'}\nExtracurriculars: ${studentData.extracurriculars || 'None listed'}\nAcademic Profile: GPA ${studentData.gpa || 'Not specified'}`;
    }

    // Prepare college data
    const collegeInfo = `College: ${collegeData.name || 'College Name'}\nAbout: ${collegeData.about || 'Not specified'}\nCulture: ${collegeData.culture || 'Not specified'}\nKey Programs: ${collegeData.key_programs || 'Not specified'}`;

    // Create prompt for Gemini to generate icebreaker
    const prompt = `You are an expert at facilitating meaningful connections between students and colleges. Generate a warm, personalized icebreaker message that the student could use to start a conversation with the college's admissions team or a current student.

STUDENT PROFILE:
${studentInfo}

COLLEGE PROFILE:
${collegeInfo}

SIGNAL TYPE: ${matchData.signal_type || 'general_interest'}

Guidelines for the icebreaker:
- Be authentic and specific to this student-college pair
- Reference something from the student's background that connects to the college
- Show genuine interest in the college's unique qualities
- Keep it concise (2-3 sentences)
- Make it conversational and warm, not formal
- If ghost mode is on, avoid using personal names or specific identifiers
- Match the tone to the signal type (e.g., more enthusiastic for high interest signals)

Generate only the icebreaker message text, nothing else.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const icebreaker = result.response.text().trim();

    if (!icebreaker) {
      return NextResponse.json(
        { error: 'Failed to generate icebreaker' },
        { status: 500 }
      );
    }

    // Update the matches table with the icebreaker text
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        icebreaker_text: icebreaker,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match with icebreaker:', updateError);
      // Still return the icebreaker even if the update fails
    }

    return NextResponse.json(
      { icebreaker },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in icebreaker route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

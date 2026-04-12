import { NextRequest, NextResponse } from "next/server";
import { fetchUrl } from "../../../../lib/fetcher";

// ─────────────────────────────────────────────
//  PASTE YOUR ANSWER KEY HERE
// ─────────────────────────────────────────────
const OFFICIAL_ANSWER_KEY: Record<string, string | number> = {
 // Mathematics Section A
  "695278376": "6952781276",
  "695278377": "6952781283",
  "695278378": "6952781285",
  "695278379": "6952781290",
  "695278380": "6952781293",
  "695278381": "6952781298",
  "695278382": "6952781302",
  "695278383": "6952781307",
  "695278384": "6952781308",
  "695278385": "6952781315",
  "695278386": "6952781317",
  "695278387": "6952781321",
  "695278388": "6952781325",
  "695278389": "6952781328",

  // Physics Section A
  "695278404": "6952781374",
  "695278405": "6952781379",
  "695278406": "6952781384",
  "695278407": "6952781386",
  "695278408": "6952781391",
  "695278409": "6952781396",
  "695278410": "6952781397",
  "695278411": "6952781401",
  "695278412": "6952781405",
  "695278413": "6952781410",
  "695278414": "6952781414",
  "695278415": "6952781417",
  "695278416": "6952781424",
  "695278417": "6952781427",
  "695278418": "6952781432",
  "695278419": "6952781433",
  "695278420": "6952781439",

  // Physics Section B
  "695278421": 300,
  "695278422": 8,
  "695278423": 12,
  "695278424": 314,
  "695278425": 5625,

  // Chemistry Section A
  "695278426": "6952781449",
  "695278427": "6952781451",
  "695278428": "6952781456",
  "695278429": "6952781460",
  "695278430": "6952781463",
  "695278431": "6952781468",
  "695278432": "6952781472",
  "695278433": "6952781476",
  "695278434": "6952781481",
  "695278435": "6952781482",
  "695278436": "6952781489",
  "695278437": "6952781492",
  "695278438": "6952781495",
  "695278439": "6952781499",
  "695278440": "6952781503",
  "695278441": "6952781509",
  "695278442": "6952781512",
  "695278443": "6952781516",
  "695278444": "6952781521",
  "695278445": "6952781522",

  // Chemistry Section B
  "695278446": 3,
  "695278447": 2474,
  "695278448": 2,
  "695278449": 7,
  "695278450": 435,

  
};


const MARKS_CORRECT = 4;
const MARKS_WRONG   = -1;

const SECTION_MAP: Record<string, string[]> = {
  Physics:     ["Physics Section A",     "Physics Section B"],
  Chemistry:   ["Chemistry Section A",   "Chemistry Section B"],
  Mathematics: ["Mathematics Section A", "Mathematics Section B"],
};

// ─────────────────────────────────────────────
//  HTML HELPERS  (zero deps — pure regex/string)
// ─────────────────────────────────────────────

/** Strip all HTML tags and decode common entities */
function textContent(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract all <td>…</td> text values from an HTML string */
function getTdTexts(html: string): string[] {
  const results: string[] = [];
  const re = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    results.push(textContent(m[1]));
  }
  return results;
}

// ─────────────────────────────────────────────
//  PARSER  — handles BOTH formats:
//  1. digialm CDN format (flat tables, no special divs)
//  2. Classic NTA format (section-cntnr / question-pnl divs)
// ─────────────────────────────────────────────

interface Question {
  section:          string;
  question_id:      string | null;
  question_type:    string | null;
  candidate_answer: string | null;
  is_attempted:     boolean;
}

function parseJEEHtml(html: string): {
  candidateInfo: Record<string, string>;
  questions: Question[];
} {
  const candidateInfo: Record<string, string> = {};
  const CANDIDATE_KEYS = [
    "Application No", "Candidate Name", "Roll No.",
    "Test Date", "Test Time", "Subject",
  ];

  // ── Candidate info: scan ALL td pairs in the whole doc ──
  const allTds = getTdTexts(html);
  for (let i = 0; i + 1 < allTds.length; i++) {
    const k = allTds[i].replace(/:$/, "").trim();
    if (CANDIDATE_KEYS.includes(k)) {
      candidateInfo[k] = allTds[i + 1].trim();
    }
  }

  const questions: Question[] = [];

  // ── Detect format ──
  const hasClassDivs = /class="[^"]*section-cntnr[^"]*"/.test(html);

  if (hasClassDivs) {
    // ── FORMAT 1: Classic section-cntnr / question-pnl divs ──
    const sectionRe = /<div[^>]+class="[^"]*section-cntnr[^"]*"[^>]*>/gi;
    const sectionStarts: number[] = [];
    let sm;
    while ((sm = sectionRe.exec(html)) !== null) sectionStarts.push(sm.index);

    for (let si = 0; si < sectionStarts.length; si++) {
      const sectionChunk = html.slice(
        sectionStarts[si],
        sectionStarts[si + 1] ?? html.length
      );

      // Section name
      const lblMatch = sectionChunk.match(
        /class="[^"]*section-lbl[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      );
      const sectionName = lblMatch
        ? textContent(lblMatch[1]).replace(/Section\s*:/, "").trim()
        : "Unknown";

      // Question panels
      const qRe = /<div[^>]+class="[^"]*question-pnl[^"]*"[^>]*>/gi;
      const qStarts: number[] = [];
      let qm;
      while ((qm = qRe.exec(sectionChunk)) !== null) qStarts.push(qm.index);

      for (let qi = 0; qi < qStarts.length; qi++) {
        const qChunk = sectionChunk.slice(
          qStarts[qi],
          qStarts[qi + 1] ?? sectionChunk.length
        );
        const q = extractQuestionData(qChunk, sectionName);
        questions.push(q);
      }
    }
  } else {
    // ── FORMAT 2: digialm CDN flat tables ──
    // Sections are marked by text like "Section : Mathematics Section A"
    // Each question is a big <table> block

    // Split by section headers
    const sectionHeaderRe = /Section\s*:\s*([^\n<]+)/gi;
    const sectionMatches: Array<{ name: string; index: number }> = [];
    let shm;
    while ((shm = sectionHeaderRe.exec(html)) !== null) {
      sectionMatches.push({
        name:  shm[1].trim(),
        index: shm.index,
      });
    }

    if (sectionMatches.length === 0) {
      // Fallback: treat entire doc as one section
      sectionMatches.push({ name: "Unknown", index: 0 });
    }

    for (let si = 0; si < sectionMatches.length; si++) {
      const sectionName  = sectionMatches[si].name;
      const sectionStart = sectionMatches[si].index;
      const sectionEnd   = sectionMatches[si + 1]?.index ?? html.length;
      const sectionChunk = html.slice(sectionStart, sectionEnd);

      // Each question block is identified by "Question Type :" in a table
      // Split the section HTML into per-question chunks by finding table blocks
      // that contain "Question ID"
      const tableRe = /<table[\s\S]*?<\/table>/gi;
      let tm;
      while ((tm = tableRe.exec(sectionChunk)) !== null) {
        const tableHtml = tm[0];
        if (!tableHtml.includes("Question ID")) continue;

        const q = extractQuestionData(tableHtml, sectionName);
        if (q.question_id) questions.push(q);
      }
    }
  }

  return { candidateInfo, questions };
}

/** Extract question data from any HTML chunk containing the metadata table */
function extractQuestionData(chunk: string, sectionName: string): Question {
  const q: Question = {
    section:          sectionName,
    question_id:      null,
    question_type:    null,
    candidate_answer: null,
    is_attempted:     false,
  };

  const cells     = getTdTexts(chunk);
  const optionMap: Record<string, string> = {};

  for (let i = 0; i + 1 < cells.length; i++) {
    // Normalize key: remove trailing colon/spaces
    const key = cells[i].replace(/\s*:\s*$/, "").trim();
    const val = cells[i + 1].trim();

    if (key === "Question Type") {
      q.question_type = val;
    } else if (key === "Question ID") {
      q.question_id = val;
    } else if (/^Option\s+\d+\s+ID$/i.test(key)) {
      // "Option 1 ID", "Option 2 ID" etc.
      const idx = key.replace(/Option\s+/i, "").replace(/\s+ID$/i, "").trim();
      optionMap[idx] = val;
    } else if (key === "Chosen Option") {
      if (val !== "--" && val in optionMap) {
        q.candidate_answer = optionMap[val];
        q.is_attempted     = true;
      }
    } else if (key === "Given Answer") {
      if (val && val !== "--" && val !== "Not Answered") {
        q.candidate_answer = val;
        q.is_attempted     = true;
      }
    }
  }

  return q;
}

// ─────────────────────────────────────────────
//  SCORE CALCULATOR
// ─────────────────────────────────────────────


function calculateScores(questions: Question[]) {
  const subjects = ["Physics", "Chemistry", "Mathematics"] as const;
  type Subject = typeof subjects[number];

  const stats: Record<Subject, { correct: number; wrong: number; skipped: number; score: number }> =
    {} as never;
  for (const s of subjects) stats[s] = { correct: 0, wrong: 0, skipped: 0, score: 0 };

  for (const q of questions) {
    let subject: Subject | null = null;
    for (const [subj, subs] of Object.entries(SECTION_MAP)) {
      if (subs.includes(q.section)) { subject = subj as Subject; break; }
    }
    if (!subject) continue;

    const qid     = String(q.question_id  ?? "").trim();
    const candAns = String(q.candidate_answer ?? "").trim();

    if (!(qid in OFFICIAL_ANSWER_KEY)) { stats[subject].skipped++; continue; }

    const correct = String(OFFICIAL_ANSWER_KEY[qid]).trim();

    if (!q.is_attempted || !candAns || candAns === "None") {
      stats[subject].skipped++;
    } else if (candAns === correct) {
      stats[subject].correct++;
      stats[subject].score += MARKS_CORRECT;
    } else {
      stats[subject].wrong++;
      stats[subject].score += MARKS_WRONG;
    }
  }

  return {
    sections: subjects.map((subj) => ({
      name:        subj,
      correct:     stats[subj].correct,
      wrong:       stats[subj].wrong,
      unattempted: stats[subj].skipped,
      attempted:   stats[subj].correct + stats[subj].wrong,
      score:       stats[subj].score,
      total:       25,
    })),
    total_score:         subjects.reduce((s, sub) => s + stats[sub].score,   0),
    total_correct:       subjects.reduce((s, sub) => s + stats[sub].correct, 0),
    total_wrong:         subjects.reduce((s, sub) => s + stats[sub].wrong,   0),
    total_skipped:       subjects.reduce((s, sub) => s + stats[sub].skipped, 0),
    physics_correct:     stats.Physics.correct,
    physics_wrong:       stats.Physics.wrong,
    physics_skipped:     stats.Physics.skipped,
    chemistry_correct:   stats.Chemistry.correct,
    chemistry_wrong:     stats.Chemistry.wrong,
    chemistry_skipped:   stats.Chemistry.skipped,
    mathematics_correct: stats.Mathematics.correct,
    mathematics_wrong:   stats.Mathematics.wrong,
    mathematics_skipped: stats.Mathematics.skipped,
  };
}

// ─────────────────────────────────────────────
//  URL FETCHER
// ─────────────────────────────────────────────




// ─────────────────────────────────────────────
//  NEXT.JS ROUTE HANDLER
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { input = "" } = await req.json();
    const trimmed = input.trim();

    if (!trimmed)
      return NextResponse.json({ error: "No input provided" }, { status: 400 });

    let html = trimmed;

    if (trimmed.toLowerCase().startsWith("http")) {
      try {
        html = await fetchUrl(trimmed);
      } catch {
        return NextResponse.json(
          { error: "Unable to fetch URL. Please paste the page content instead." },
          { status: 400 }
        );
      }
    }

    if (html.length < 500)
      return NextResponse.json({ error: "Content too short or invalid" }, { status: 400 });

    const { candidateInfo, questions } = parseJEEHtml(html);

    if (!questions.length)
      return NextResponse.json({ error: "No questions found in HTML" }, { status: 400 });

    const scores = calculateScores(questions);

    return NextResponse.json({
      success:       true,
      candidateName: candidateInfo["Candidate Name"] ?? "",
      applicationNo: candidateInfo["Application No"] ?? "",
      rollNo:        candidateInfo["Roll No."]        ?? "",
      testDate:      candidateInfo["Test Date"]       ?? "",
      ...scores,
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
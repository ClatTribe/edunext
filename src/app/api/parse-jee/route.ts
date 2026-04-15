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
  
// Mathematics Section A
  "691121151": "691121514",
  "691121152": "691121517",
  "691121153": "691121520",
  "691121154": "691121526",
  "691121155": "691121528",
  "691121156": "691121533",
  "691121157": "691121537",
  "691121158": "691121541",
  "691121159": "691121546",
  "691121160": "691121549",
  "691121161": "691121553",
  "691121162": "691121556",
  "691121163": "691121559",
  "691121164": "691121564",
  "691121165": "691121567",
  "691121166": "691121572",
  "691121167": "691121577",
  "691121168": "691121582",
  "691121169": "691121585",
  "691121170": "691121588",

  // Mathematics Section B
  "691121171": 120,
  "691121172": 34,
  "691121173": 18,
  "691121174": 24,
  "691121175": 10,

  // Physics Section A
  "691121176": "691121597",
  "691121177": "691121600",
  "691121178": "691121606",
  "691121179": "691121608",
  "691121180": "691121615",
  "691121181": "691121616",
  "691121182": "691121620",
  "691121183": "691121626",
  "691121184": "691121630",
  "691121185": "691121633",
  "691121186": "691121637",
  "691121187": "691121641",
  "691121188": "691121645",
  "691121189": "691121648",
  "691121190": "691121654",
  "691121191": "691121659",
  "691121192": "691121661",
  "691121193": "691121667",
  "691121194": "691121669",
  "691121195": "691121672",

  // Physics Section B
  "691121196": 6,
  "691121197": 32,
  "691121198": 300,
  "691121199": 20,
  "691121200": 15,

  // Chemistry Section A
  "691121201": "691121682",
  "691121202": "691121687",
  "691121203": "691121690",
  "691121204": "691121696",
  "691121205": "691121697",
  "691121206": "691121702",
  "691121207": "691121705",
  "691121208": "691121711",
  "691121209": "691121714",
  "691121210": "691121717",
  "691121211": "691121722",
  "691121212": "691121725",
  "691121213": "691121729",
  "691121214": "691121735",
  "691121215": "691121739",
  "691121216": "691121743",
  "691121217": "691121748",
  "691121218": "691121750",
  "691121219": "691121755",
  "691121220": "691121760",

  // Chemistry Section B
  "691121221": 5,
  "691121222": 20,
  "691121223": 560,
  "691121224": 3,
  "691121225": 1,

// Mathematics Section A
  "691121451": "691121533",
  "691121452": "691121538",
  "691121453": "691121539",
  "691121454": "691121544",
  "691121455": "691121549",
  "691121456": "691121554",
  "691121457": "691121556",
  "691121458": "691121560",
  "691121459": "691121563",
  "691121460": "691121567",
  "691121461": "691121572",
  "691121462": "691121576",
  "691121463": "691121581",
  "691121464": "691121585",
  "691121465": "691121589",
  "691121466": "691121592",
  "691121467": "691121597",
  "691121470": "691121608",

  // Mathematics Section B
  "691121471": 18,
  "691121472": 7,
  "691121473": 19,
  "691121474": 16,
  "691121475": 48,

  // Physics Section A
  "691121476": "691121617",
  "691121477": "691121623",
  "691121478": "691121624",
  "691121479": "691121630",
  "691121480": "691121633",
  "691121481": "691121639",
  "691121482": "691121643",
  "691121483": "691121645",
  "691121484": "691121650",
  "691121485": "691121645",
  "691121486": "691121650",
  "691121487": "691121660",
  "691121488": "691121664",
  "691121489": "691121669",
  "691121490": "691121672",
  "691121491": "691121677",
  "691121492": "691121681",
  "691121493": "691121686",
  "691121494": "691121689",
  "691121495": "691121693",

  // Physics Section B
  "691121496": 33,
  "691121497": 422,
  "691121498": 200,
  "691121499": 1,
  "691121500": 44,

  // Chemistry Section A
  "691121501": "691121704",
  "691121502": "691121705",
  "691121503": "691121710",
  "691121504": "691121715",
  "691121505": "691121710",
  "691121506": "691121723",
  "691121507": "691121727",
  "691121508": "691121730",
  "691121509": "691121735",
  "691121510": "691121739",
  "691121511": "691121743",
  "691121512": "691121746",
  "691121513": "691121750",
  "691121514": "691121755",
  "691121515": "691121759",
  "691121517": "691121768",
  "691121518": "691121771",
  "691121519": "691121774",
  "691121520": "691121780",

  // Chemistry Section B
  "691121521": 10,
  "691121522": 1672,
  "691121523": 30,
  "691121524": 452,
  "691121525": 2,

  "695278001": "6952780005",
  "695278002": "6952780008",
  "695278003": "6952780014",
  "695278004": "6952780018",
  "695278005": "6952780023",
  "695278006": "6952780028",
  "695278007": "6952780031",
  "695278008": "6952780038",
  "695278009": "6952780042",
  "695278010": "6952780047",
  "695278011": "6952780052",
  "695278012": "6952780056",
  "695278013": "6952780059",
  "695278014": "6952780062",
  "695278015": "6952780068",
  "695278016": "6952780071",
  "695278017": "6952780076",
  "695278018": "6952780079",
  "695278019": "6952780083",
  "695278020": "6952780088",

  // Mathematics Section B
  "695278021": 7,
  "695278022": 12,
  "695278023": 204,
  "695278024": 2,
  "695278025": 18,

  // Physics Section A
  "695278026": "6952780098",
  "695278027": "6952780103",
  "695278028": "6952780105",
  "695278029": "6952780112",
  "695278030": "6952780115",
  "695278031": "6952780117",
  "695278032": "6952780121",
  "695278033": "6952780127",
  "695278034": "6952780132",
  "695278035": "6952780136",
  "695278036": "6952780140",
  "695278037": "6952780143",
  "695278038": "6952780150",
  "695278039": "6952780152",
  "695278040": "6952780158",
  "695278041": "6952780163",
  "695278042": "6952780167",
  "695278043": "6952780171",
  "695278044": "6952780175",
  "695278045": "6952780177",

  // Physics Section B
  "695278046": 3,
  "695278047": 288,
  "695278048": 3,
  "695278049": 3,
  "695278050": 60,

  // Chemistry Section A
  "695278051": "6952780189",
  "695278052": "6952780193",
  "695278053": "6952780198",
  "695278054": "6952780200",
  "695278055": "6952780206",
  "695278056": "6952780209",
  "695278057": "6952780215",
  "695278058": "6952780220",
  "695278059": "6952780223",
  "695278060": "6952780228",
  "695278061": "6952780233",
  "695278062": "6952780238",
  "695278063": "6952780239",
  "695278064": "6952780246",
  "695278065": "6952780251",
  "695278066": "6952780253",
  "695278067": "6952780259",
  "695278068": "6952780264",
  "695278069": "6952780267",
  "695278070": "6952780270",

  // Chemistry Section B
  "695278071": 48,
  "695278072": 75,
  "695278073": 2,
  "695278074": 16,
  "695278075": 6,
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
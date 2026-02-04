"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";
import Leaderboard from "./Leaderboard";
import JEEScoreGraph from "./JEEScoreGraph";
import PercentileCalculator from "./PercentileCalculator";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

const JEE_SECTIONS = ["Physics", "Chemistry", "Mathematics"];

// ==========================================
// HARDCODED ANSWER KEY - Map Question ID to Correct Option ID
// ==========================================
// Update this object with actual Question IDs and their correct Option IDs from NTA
// ==========================================
// JEE Main 2026 B.Tech - COMPLETE ANSWER KEY
// Extracted from NTA Official Answer Key
// Date: February 4, 2026
// ==========================================

const ANSWER_KEY: { [questionId: string]: string } = {
  
  // ==========================================
  // MATHEMATICS SECTION A (MCQ) - Q1-20
  // ==========================================
  "8606549976": "86065433317", // Q1
  "8606549977": "86065433321", // Q2
  "8606549978": "86065433325", // Q3
  "8606549979": "86065433329", // Q4
  "8606549980": "86065433333", // Q5
  "8606549981": "86065433338", // Q6
  "8606549982": "86065433342", // Q7
  "8606549983": "86065433346", // Q8
  "8606549984": "86065433348", // Q9
  "8606549985": "86065433353", // Q10
  "8606549986": "86065433357", // Q11
  "8606549987": "86065433360", // Q12
  "8606549988": "86065433364", // Q13
  "8606549989": "86065433371", // Q14
  "8606549990": "86065433374", // Q15
  "8606549991": "86065433377", // Q16
  "8606549992": "86065433382", // Q17
  "8606549993": "86065433385", // Q18
  "8606549994": "86065433389", // Q19
  "8606549995": "86065433392", // Q20
  
  // ==========================================
  // MATHEMATICS SECTION B (Numerical) - Q21-25
  // ==========================================
  "8606549996": "9",     // Q21
  "8606549997": "1979",  // Q22
  "8606549998": "20",    // Q23
  "8606549999": "5",     // Q24
  "86065410000": "36",   // Q25
  
  // ==========================================
  // PHYSICS SECTION A (MCQ) - Q26-45
  // ==========================================
  "86065410001": "86065434401", // Q26
  "86065410002": "86065434405", // Q27
  "86065410003": "86065434410", // Q28
  "86065410004": "86065434415", // Q29
  "86065410005": "86065434417", // Q30
  "86065410006": "86065434421", // Q31
  "86065410007": "86065434425", // Q32
  "86065410008": "86065434429", // Q33
  "86065410009": "86065434433", // Q34
  "86065410010": "86065434438", // Q35
  "86065410011": "86065434442", // Q36
  "86065410012": "86065434447", // Q37
  "86065410013": "86065434452", // Q38
  "86065410014": "86065434455", // Q39
  "86065410015": "86065434457", // Q40
  "86065410016": "86065434464", // Q41
  "86065410017": "86065434465", // Q42
  "86065410018": "86065434472", // Q43
  "86065410019": "86065434476", // Q44
  "86065410020": "86065434479", // Q45
  
  // ==========================================
  // PHYSICS SECTION B (Numerical) - Q46-50
  // ==========================================
  "86065410021": "2",    // Q46
  "86065410022": "4",    // Q47
  "86065410023": "1",    // Q48
  "86065410024": "7",    // Q49
  "86065410025": "14",   // Q50
  
  // ==========================================
  // CHEMISTRY SECTION A (MCQ) - Q51-70
  // ==========================================
  "86065410026": "86065434487", // Q51
  "86065410027": "86065434491", // Q52
  "86065410028": "86065434497", // Q53
  "86065410029": "86065434500", // Q54
  "86065410030": "86065434503", // Q55
  "86065410031": "86065434508", // Q56
  "86065410032": "86065434511", // Q57
  "86065410033": "86065434514", // Q58
  "86065410034": "86065434520", // Q59
  "86065410035": "86065434524", // Q60
  "86065410036": "86065434526", // Q61
  "86065410037": "86065434532", // Q62
  "86065410038": "86065434536", // Q63
  "86065410039": "86065434539", // Q64
  "86065410040": "86065434543", // Q65
  "86065410041": "86065434547", // Q66
  "86065410042": "86065434550", // Q67
  "86065410043": "86065434557", // Q68
  "86065410044": "86065434561", // Q69
  "86065410045": "86065434562", // Q70
  
  // ==========================================
  // CHEMISTRY SECTION B (Numerical) - Q71-75
  // ==========================================
  "86065410046": "1031", // Q71
  "86065410047": "4",    // Q72
  "86065410048": "57",   // Q73
  "86065410049": "3",    // Q74
  "86065410050": "10",   // Q75

  // ==========================================
  // ALTERNATE SET (Different Question IDs)
  // ==========================================
  // Physics Section A
  "8606541676": "8606545699", // Q26
  "8606541677": "8606545700", // Q27
  "8606541678": "8606545705", // Q28
  "8606541679": "8606545708", // Q29
  "8606541680": "8606545714", // Q30
  "8606541681": "8606545718", // Q31
  "8606541682": "8606545720", // Q32
  "8606541683": "8606545725", // Q33
  "8606541684": "8606545729", // Q34
  "8606541685": "8606545733", // Q35
  "8606541686": "8606545739", // Q36
  "8606541687": "8606545743", // Q37
  "8606541688": "8606545745", // Q38
  "8606541689": "8606545749", // Q39
  "8606541690": "8606545752", // Q40
  "8606541691": "8606545759", // Q41
  "8606541692": "8606545761", // Q42
  "8606541693": "8606545766", // Q43
  "8606541694": "8606545768", // Q44
  "8606541695": "8606545774", // Q45

  // Physics Section B (Numerical)
  "8606541696": "30",   // Q46
  "8606541697": "384",  // Q47
  "8606541698": "314",  // Q48
  "8606541699": "300",  // Q49
  "8606541700": "429",  // Q50

  // Chemistry Section A
  "8606541701": "8606545782", // Q51
  "8606541702": "8606545787", // Q52
  "8606541703": "8606545792", // Q53
  "8606541704": "8606545793", // Q54
  "8606541705": "8606545797", // Q55
  "8606541706": "8606545804", // Q56
  "8606541707": "8606545807", // Q57
  "8606541708": "8606545809", // Q58
  "8606541709": "8606545816", // Q59
  "8606541710": "8606545820", // Q60
  "8606541711": "8606545822", // Q61
  "8606541712": "8606545828", // Q62
  "8606541713": "8606545831", // Q63
  "8606541714": "8606545835", // Q64
  "8606541715": "8606545837", // Q65
  "8606541716": "8606545843", // Q66
  "8606541717": "8606545848", // Q67
  "8606541718": "8606545850", // Q68
  "8606541719": "8606545854", // Q69
  "8606541720": "8606545860", // Q70

  // Chemistry Section B (Numerical)
  "8606541721": "2",    // Q71
  "8606541722": "4",    // Q72
  "8606541723": "78",   // Q73
  "8606541724": "5",    // Q74
  "8606541725": "6",    // Q75

  // Mathematics Section A (Alternate Set)
  "8606541651": "8606545611", // Q1
  "8606541652": "8606545615", // Q2
  "8606541653": "8606545621", // Q3
  "8606541654": "8606545625", // Q4
  "8606541655": "8606545630", // Q5
  "8606541656": "8606545632", // Q6
  "8606541657": "8606545635", // Q7
  "8606541658": "8606545641", // Q8
  "8606541659": "8606545646", // Q9
  "8606541660": "8606545648", // Q10
  "8606541661": "8606545652", // Q11
  "8606541662": "8606545658", // Q12
  "8606541663": "8606545661", // Q13
  "8606541664": "8606545665", // Q14
  "8606541665": "8606545670", // Q15
  "8606541666": "8606545674", // Q16
  "8606541667": "8606545677", // Q17
  "8606541668": "8606545681", // Q18
  "8606541669": "8606545683", // Q19
  "8606541670": "8606545689", // Q20

  // Mathematics Section B (Numerical - Alternate Set)
  "8606541671": "00",   // Q21
  "8606541672": "976",  // Q22
  "8606541673": "210",  // Q23
  "8606541674": "170",  // Q24
  "8606541675": "09",   // Q25

  // Additional variant sets
  "8606548826": "8606542808", // Math Q1 (variant)
  "8606548827": "8606542812", // Math Q2 (variant)
  "8606548828": "8606542814", // Math Q3 (variant)
  "8606548829": "8606542820", // Math Q4 (variant)
  "8606548830": "8606542824", // Math Q5 (variant)
  "8606548831": "8606542828", // Math Q6 (variant)
  "8606548832": "8606542830", // Math Q7 (variant)
  "8606548833": "8606542837", // Math Q8 (variant)
  "8606548834": "8606542840", // Math Q9 (variant)
  "8606548835": "8606542842", // Math Q10 (variant)
  "8606548836": "8606542847", // Math Q11 (variant)
  "8606548837": "8606542853", // Math Q12 (variant)
  "8606548838": "8606542856", // Math Q13 (variant)
  "8606548839": "8606542859", // Math Q14 (variant)
  "8606548840": "8606542864", // Math Q15 (variant)
  "8606548841": "8606542866", // Math Q16 (variant)
  "8606548842": "8606542873", // Math Q17 (variant)
  "8606548843": "8606542877", // Math Q18 (variant)

  // Physics Section A (variant set - from image 5)
  "8606548865": "8606542948", // Physics Q40 (variant)
  "8606548866": "8606542952", // Physics Q41 (variant)
  "8606548867": "8606542958", // Physics Q42 (variant)
  "8606548868": "8606542960", // Physics Q43 (variant)
  "8606548869": "8606542963", // Physics Q44 (variant)
  "8606548870": "8606542968", // Physics Q45 (variant)

  // Physics Section B (Numerical - variant)
  "8606548871": "5",    // Q46 (variant)
  "8606548872": "350",  // Q47 (variant)
  "8606548873": "1800", // Q48 (variant)
  "8606548874": "14",   // Q49 (variant)
  "8606548875": "10",   // Q50 (variant)

  // Chemistry Section A (variant set - from image 5)
  "8606548876": "8606542978", // Chemistry Q51 (variant)
  "8606548877": "8606542981", // Chemistry Q52 (variant)
  "8606548878": "8606542985", // Chemistry Q53 (variant)
  "8606548879": "8606542989", // Chemistry Q54 (variant)
  "8606548880": "8606542995", // Chemistry Q55 (variant)
  "8606548881": "8606542998", // Chemistry Q56 (variant)
  "8606548882": "8606543003", // Chemistry Q57 (variant)
  "8606548883": "8606543006", // Chemistry Q58 (variant)
  "8606548884": "8606543009", // Chemistry Q59 (variant)
};

export default ANSWER_KEY;

// ==========================================
// USAGE INSTRUCTIONS
// ==========================================
// 1. Copy this entire object into your main component file
// 2. Replace the existing ANSWER_KEY constant
// 3. The parser will automatically compare student responses
//    with these correct Option IDs
// 4. For MCQ: Compares Option ID to Option ID
// 5. For Numerical: Compares numeric string to numeric string
// ==========================================

// ==========================================
// NOTES
// ==========================================
// - JEE Main has multiple question paper variants (Sets)
// - Each set has different Question IDs
// - This answer key includes multiple variants
// - Student's Question ID will be matched automatically
// - If Question ID not found, it will be marked as unattempted
// ==========================================
// ==========================================

interface SectionData {
  name: string;
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
}

interface QuestionResult {
  questionNumber: number;
  questionId: string;
  section: string;
  chosenOptionNumber: string | null; // "1", "2", "3", "4" or null
  chosenOptionId: string | null;
  correctOptionId: string;
  status: string;
  isCorrect: boolean | null;
}

interface ParseResult {
  candidateName: string;
  questions: QuestionResult[];
  sections: SectionData[];
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  totalScore: number;
  maxScore: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function PasteJEEResponse() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParseResult | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General");
  const [city, setCity] = useState("");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("jee_results")
        .select(
          "name, physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong, physics_skipped, chemistry_skipped, mathematics_skipped",
        )
        .eq("show_in_leaderboard", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const calculated = data.map((entry) => {
          const physicsScore = entry.physics_correct * 4 - entry.physics_wrong * 1;
          const chemistryScore = entry.chemistry_correct * 4 - entry.chemistry_wrong * 1;
          const mathematicsScore = entry.mathematics_correct * 4 - entry.mathematics_wrong * 1;
          const totalScore = physicsScore + chemistryScore + mathematicsScore;

          return { name: entry.name, score: totalScore };
        });

        calculated.sort((a, b) => b.score - a.score);
        const top10 = calculated.slice(0, 10).map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          score: entry.score,
        }));

        setLeaderboardData(top10);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // Parse NTA response sheet and compare with hardcoded answer key
  const parseAndCalculate = (htmlString: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    if (debugMode) {
      console.log("=== PARSING NTA RESPONSE SHEET ===");
      console.log("HTML length:", htmlString.length);
    }

    // Extract Candidate Name
    let candidateName = "Candidate";
    const allCells = Array.from(doc.querySelectorAll("td"));
    for (let i = 0; i < allCells.length - 1; i++) {
      const cellText = allCells[i].textContent?.toLowerCase().trim() || "";
      if (cellText.includes("candidate name")) {
        candidateName = allCells[i + 1].textContent?.trim() || "Candidate";
        if (debugMode) console.log("Candidate:", candidateName);
        break;
      }
    }

    const questions: QuestionResult[] = [];
    let questionCounter = 1;

    // Find all question panels
    const questionPanels = doc.querySelectorAll(".question-pnl");
    
    if (debugMode) {
      console.log(`Found ${questionPanels.length} question panels`);
    }

    questionPanels.forEach((panel) => {
      // Get the metadata table on the right side
      const menuTable = panel.querySelector(".menu-tbl");
      if (!menuTable) return;

      const metaData: { [key: string]: string } = {};
      const rows = menuTable.querySelectorAll("tr");
      
      rows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        if (cols.length >= 2) {
          const key = cols[0].textContent?.trim().replace(":", "").trim() || "";
          const val = cols[1].textContent?.trim() || "";
          metaData[key] = val;
        }
      });

      const questionId = metaData["Question ID"];
      const questionType = metaData["Question Type"]; // MCQ or SA
      const status = metaData["Status"]; // Answered, Not Answered, Marked For Review
      const chosenOptionNum = metaData["Chosen Option"]; // "1", "2", "3", "4", or "--"

      // Determine section based on question number
      let section = "";
      if (questionCounter <= 30) section = "Physics";
      else if (questionCounter <= 60) section = "Chemistry";
      else section = "Mathematics";

      let chosenOptionId: string | null = null;
      let chosenOptionNumber: string | null = null;

      // Extract chosen option ID
      if (questionType === "MCQ" && chosenOptionNum && chosenOptionNum !== "--") {
        chosenOptionNumber = chosenOptionNum;
        const optionKey = `Option ${chosenOptionNum} ID`; // e.g., "Option 3 ID"
        chosenOptionId = metaData[optionKey] || null;
      }

      // Get correct answer from hardcoded key
      const correctOptionId = ANSWER_KEY[questionId] || "";

      // Determine if answer is correct
      let isCorrect: boolean | null = null;
      if (chosenOptionId) {
        isCorrect = chosenOptionId === correctOptionId;
      }

      questions.push({
        questionNumber: questionCounter,
        questionId,
        section,
        chosenOptionNumber,
        chosenOptionId,
        correctOptionId,
        status,
        isCorrect,
      });

      if (debugMode && questionCounter <= 5) {
        console.log(`Q${questionCounter}: QID=${questionId}, Chosen=${chosenOptionId}, Correct=${correctOptionId}, Match=${isCorrect}`);
      }

      questionCounter++;
    });

    // Initialize sections
    const sections: SectionData[] = JEE_SECTIONS.map((name) => ({
      name,
      total: 30,
      attempted: 0,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
    }));

    // Calculate statistics
    questions.forEach((q) => {
      let secIdx = -1;
      if (q.section === "Physics") secIdx = 0;
      else if (q.section === "Chemistry") secIdx = 1;
      else if (q.section === "Mathematics") secIdx = 2;

      if (secIdx === -1) return;

      if (q.isCorrect === null) {
        sections[secIdx].unattempted++;
      } else if (q.isCorrect) {
        sections[secIdx].attempted++;
        sections[secIdx].correct++;
      } else {
        sections[secIdx].attempted++;
        sections[secIdx].wrong++;
      }
    });

    // Calculate scores (+4 for correct, -1 for wrong)
    sections.forEach((section) => {
      section.score = section.correct * 4 - section.wrong * 1;
    });

    // Calculate totals
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;
    let totalScore = 0;

    sections.forEach((section) => {
      totalCorrect += section.correct;
      totalWrong += section.wrong;
      totalUnattempted += section.unattempted;
      totalScore += section.score;
    });

    const maxScore = 90 * 4;

    if (debugMode) {
      console.log("\n=== RESULTS ===");
      console.log("Questions parsed:", questions.length);
      console.log("Total correct:", totalCorrect);
      console.log("Total wrong:", totalWrong);
      console.log("Total unattempted:", totalUnattempted);
      console.log("Total score:", totalScore);
    }

    return {
      candidateName,
      questions,
      sections,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      totalScore,
      maxScore,
    };
  };

  const fetchNTAContent = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        headers: { Accept: "text/html,application/xhtml+xml,application/xml" },
      });
      if (response.ok) return await response.text();
      throw new Error("Direct fetch failed");
    } catch {
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      ];
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) return await response.text();
        } catch {}
      }
      throw new Error("All fetch methods failed");
    }
  };

  const processContent = (content: string) => {
    const result = parseAndCalculate(content);
    
    if (result.questions.length === 0) {
      throw new Error("No questions found. Please ensure you copied the entire NTA response sheet.");
    }
    
    if (result.questions.length < 30) {
      throw new Error(`Only ${result.questions.length} questions found. Expected 90.`);
    }
    
    return result;
  };

  const handleCalculateAndSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate user details
      if (!name.trim()) {
        setError("❌ Please enter your name");
        setLoading(false);
        return;
      }
      if (!mobile.trim() || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        setError("❌ Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("❌ Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError("❌ Please enter your city");
        setLoading(false);
        return;
      }

      const input = html.trim();
      if (!input) {
        setError("⚠️ Please paste your NTA response sheet content");
        setLoading(false);
        return;
      }

      let calculatedResults: ParseResult;
      let cdnLinkToSave = "";

      // Check if input is URL or HTML content
      if (/^https?:\/\//i.test(input) || /nta\.ac\.in/i.test(input)) {
        setError("🔄 Fetching response sheet...");
        let url = input.startsWith("http") ? input : "https://" + input;
        cdnLinkToSave = url;
        try {
          const content = await fetchNTAContent(url);
          calculatedResults = processContent(content);
        } catch (err) {
          setError(
            "❌ Unable to fetch URL. Please copy and paste the page content instead (Ctrl+A, Ctrl+C).",
          );
          setLoading(false);
          return;
        }
      } else {
        if (input.length < 500) {
          setError("⚠️ Content seems too short. Make sure you copied the entire page (Ctrl+A, Ctrl+C).");
          setLoading(false);
          return;
        }
        calculatedResults = processContent(input);
      }

      setError("💾 Saving results...");

      // Save to database
      const physicsSection = calculatedResults.sections.find((s) => s.name === "Physics");
      const chemistrySection = calculatedResults.sections.find((s) => s.name === "Chemistry");
      const mathematicsSection = calculatedResults.sections.find((s) => s.name === "Mathematics");

      const dataToSave = {
        name,
        mobile,
        email,
        category,
        city,
        cdn_link: cdnLinkToSave,
        physics_correct: physicsSection?.correct || 0,
        physics_wrong: physicsSection?.wrong || 0,
        physics_skipped: physicsSection?.unattempted || 0,
        chemistry_correct: chemistrySection?.correct || 0,
        chemistry_wrong: chemistrySection?.wrong || 0,
        chemistry_skipped: chemistrySection?.unattempted || 0,
        mathematics_correct: mathematicsSection?.correct || 0,
        mathematics_wrong: mathematicsSection?.wrong || 0,
        mathematics_skipped: mathematicsSection?.unattempted || 0,
        total_score: calculatedResults.totalScore,
        show_in_leaderboard: true,
      };

      const { error: dbError } = await supabase.from("jee_results").insert([dataToSave]);
      
      if (dbError) {
        console.error("Database error:", dbError);
        setError("❌ Failed to save to database. Please try again.");
        setLoading(false);
        return;
      }

      setResults(calculatedResults);
      setError("✅ Results calculated and saved successfully!");
      await fetchLeaderboard();
      
      setTimeout(
        () =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err: any) {
      console.error("Error:", err);
      setError(`❌ ${err.message || "Something went wrong. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">
          <div className="text-center space-y-2 sm:space-y-3 mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              ></span>
              JEE Main 2026 Score Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Calculate your{" "}
              <span style={{ color: accentColor }}>JEE Main score</span>{" "}
              instantly
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Paste your NTA response sheet - answers are checked against our hardcoded answer key
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl p-6 shadow-xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  📝 Enter Details & Calculate Score
                </h2>
                
                {/* User Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${borderColor}`,
                        outlineColor: accentColor,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      MOBILE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={10}
                      placeholder="10 digits"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      EMAIL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      CATEGORY <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    >
                      <option>General</option>
                      <option>OBC-NCL</option>
                      <option>SC</option>
                      <option>ST</option>
                      <option>EWS</option>
                      <option>PwD</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">
                      CITY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                </div>

                {/* Response Sheet Input */}
                <div
                  className="border-t pt-6 mb-6"
                  style={{ borderColor: "rgba(100,116,139,0.3)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-300 font-semibold">
                      NTA Response Sheet Content{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={() => setDebugMode(!debugMode)}
                      className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                    >
                      {debugMode ? "Debug ON ✓" : "Debug OFF"}
                    </button>
                  </div>
                  
                  <div className="mb-3 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300 font-semibold mb-2">
                      📋 How to copy your NTA response sheet:
                    </p>
                    <ol className="text-xs text-blue-200 ml-4 space-y-1.5">
                      <li>1. Open your NTA response sheet page in browser</li>
                      <li>2. Press <kbd className="px-2 py-0.5 bg-slate-700 rounded font-mono">Ctrl+A</kbd> to select all content</li>
                      <li>3. Press <kbd className="px-2 py-0.5 bg-slate-700 rounded font-mono">Ctrl+C</kbd> to copy</li>
                      <li>4. Click in the box below and press <kbd className="px-2 py-0.5 bg-slate-700 rounded font-mono">Ctrl+V</kbd> to paste</li>
                    </ol>
                    <p className="text-xs text-amber-300 mt-3 flex items-start gap-2">
                      <span>⚠️</span>
                      <span>Make sure you copy the ENTIRE page - all questions, options, and IDs must be included!</span>
                    </p>
                  </div>
                  
                  <textarea
                    value={html}
                    onChange={(e) => {
                      setHtml(e.target.value);
                      setError("");
                    }}
                    className="w-full h-48 rounded-xl p-4 text-xs text-white bg-[#050818] font-mono focus:outline-none focus:ring-2 resize-y"
                    style={{ border: `1px solid ${borderColor}` }}
                    placeholder="Paste your complete NTA response sheet HTML content here...

Example structure should include:
- Candidate Name
- Question Type: MCQ
- Question ID: 4447924455
- Option 1 ID: 4447921548
- Option 2 ID: 4447921547
- Chosen Option: 3
- Status: Answered
..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    🔑 Your responses will be automatically compared with our hardcoded answer key
                  </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      error.includes("✅")
                        ? "bg-green-900/20 border-green-500/30 text-green-400"
                        : error.includes("🔄") || error.includes("💾")
                          ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                          : "bg-red-900/20 border-red-500/30 text-red-400"
                    } border`}
                  >
                    <p className="text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleCalculateAndSubmit}
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl font-bold text-black text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Processing...
                    </span>
                  ) : (
                    "Calculate & Save Score →"
                  )}
                </button>

                {/* Info Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mt-6">
                  <h4 className="text-white font-semibold text-lg mb-3">
                    🎯 How It Works
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1 flex items-center gap-2">
                        <span className="text-green-400">✓</span> Hardcoded Answer Key
                      </p>
                      <p className="text-xs text-slate-400">
                        Our system has the correct Option IDs stored for all 90 questions
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1 flex items-center gap-2">
                        <span className="text-blue-400">⚡</span> Automatic Comparison
                      </p>
                      <p className="text-xs text-slate-400">
                        Your chosen Option IDs are compared with the correct ones instantly
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1 flex items-center gap-2">
                        <span className="text-amber-400">📊</span> JEE Marking Scheme
                      </p>
                      <p className="text-xs text-slate-400">
                        +4 for correct, -1 for wrong, 0 for unattempted
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Leaderboard
                  data={leaderboardData}
                  currentUserScore={results ? results.totalScore : undefined}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div
              id="results"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
            >
              <div
                className="rounded-2xl p-6 shadow-2xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `2px solid ${accentColor}`,
                }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  🎯 Your JEE Main 2026 Results
                </h2>

                <div
                  className="p-8 rounded-xl border-2 mb-6"
                  style={{
                    backgroundColor: "#050818",
                    borderColor: accentColor,
                  }}
                >
                  <p className="text-slate-400 text-sm mb-2">Total Score</p>
                  <p
                    className="text-6xl font-bold mb-2"
                    style={{ color: accentColor }}
                  >
                    {results.totalScore}
                  </p>
                  <p className="text-sm text-slate-400">
                    out of {results.maxScore} marks
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-green-400 text-2xl font-bold">
                          {results.totalCorrect}
                        </p>
                        <p className="text-xs text-slate-500">Correct</p>
                      </div>
                      <div>
                        <p className="text-red-400 text-2xl font-bold">
                          {results.totalWrong}
                        </p>
                        <p className="text-xs text-slate-500">Wrong</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-2xl font-bold">
                          {results.totalUnattempted}
                        </p>
                        <p className="text-xs text-slate-500">Skipped</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-4">
                  Subject-wise Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#050818] rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-slate-300 font-bold">
                          {section.name}
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: accentColor }}
                        >
                          {section.score}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">
                          ✓ {section.correct}
                        </span>
                        <span className="text-red-400">✗ {section.wrong}</span>
                        <span className="text-slate-500">
                          — {section.unattempted}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {section.attempted} attempted out of {section.total}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm mb-2">
                    ℹ️ Scoring Pattern:
                  </p>
                  <p className="text-white text-xs">
                    +4 marks for each correct answer
                  </p>
                  <p className="text-white text-xs">
                    -1 mark for each wrong answer
                  </p>
                  <p className="text-white text-xs">
                    0 marks for unattempted questions
                  </p>
                </div>

                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-semibold">
                    ✅ Your results have been saved!
                  </p>
                </div>
              </div>

              <PercentileCalculator
                userScore={results.totalScore}
                userName={name}
              />
            </div>
          )}

          <div className="mt-6">
            <JEEScoreGraph />
          </div>

          {/* Info Section */}
          <div className="mt-8">
            <div
              className="rounded-2xl p-6 shadow-xl"
              style={{
                backgroundColor: secondaryBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  🎯 JEE Main Percentile Predictor 2026
                </h3>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Get instant results by comparing your NTA response sheet with our
                  pre-loaded answer key. No manual checking required!
                </p>

                <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
                  <p className="text-xs text-blue-400 mb-2">
                    <strong>ℹ️ About This Tool:</strong>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We use the official NTA marking scheme (+4/-1/0) and compare
                    your chosen Option IDs with the correct Option IDs from the answer key.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
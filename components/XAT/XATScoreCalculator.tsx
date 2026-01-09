"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";
import Leaderboard from "./Leaderboard";
import XATScoreGraph from "./XATScoreGraph";
import PercentileCalculator from "./PercentileCalculator";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

// Section name mappings from Code Set 2
const PART_1_SECTIONS = [
  "Quantitative Aptitude and Data Interpretation",
  "Decision Making",
  "Verbal Ability and Logical Reasoning",
  "Verbal and Logical Ability",
  "Quantitative Ability and Data Interpretation"
];

const PART_2_SECTIONS = [
  "General Knowledge"
];

interface SectionData {
  name: string;
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
}

interface ParseResult {
  candidateName: string;
  part1: {
    sections: SectionData[];
    correct: number;
    wrong: number;
    unattempted: number;
    score: number;
  };
  part2: {
    sections: SectionData[];
    correct: number;
    wrong: number;
    unattempted: number;
    score: number;
  };
  penalty: number;
  part1FinalScore: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function PasteXATResponse() {
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

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("xat_results")
        .select("name, valr_correct, valr_wrong, dm_correct, dm_wrong, qa_correct, qa_wrong, valr_skipped, dm_skipped, qa_skipped")
        .eq("show_in_leaderboard", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const calculated = data.map((entry) => {
          const valrScore = entry.valr_correct - (entry.valr_wrong * 0.25);
          const dmScore = entry.dm_correct - (entry.dm_wrong * 0.25);
          const qaScore = entry.qa_correct - (entry.qa_wrong * 0.25);
          const rawScore = valrScore + dmScore + qaScore;
          
          const totalNA = entry.valr_skipped + entry.dm_skipped + entry.qa_skipped;
          const penaltyCount = Math.max(0, totalNA - 8);
          const penaltyScore = penaltyCount * 0.1;
          
          const finalScore = rawScore - penaltyScore;
          
          return {
            name: entry.name,
            score: Math.round(finalScore * 100) / 100
          };
        });

        calculated.sort((a, b) => b.score - a.score);
        const top10 = calculated.slice(0, 10).map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          score: entry.score
        }));

        setLeaderboardData(top10);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // New parsing logic from Code Set 2
  const parseAndCalculate = (htmlString: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Extract Candidate Details
    let candidateName = "Candidate";
    const infoTables = doc.querySelectorAll(".main-info-pnl table tr");
    infoTables.forEach((tr: Element) => {
      const cells = tr.querySelectorAll("td");
      if (cells.length >= 2 && cells[0].textContent?.includes("Name")) {
        candidateName = cells[1].textContent?.trim() || "Candidate";
      }
    });

    // Initialize stats
    let part1Stats = {
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
      sections: [] as SectionData[]
    };

    let part2Stats = {
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
      sections: [] as SectionData[]
    };

    // Process each section
    const sectionContainers = doc.querySelectorAll(".section-cntnr");
    
    sectionContainers.forEach((container: Element) => {
      const sectionLbl = container.querySelector(".section-lbl");
      if (!sectionLbl) return;
      
      let sectionName = sectionLbl.textContent?.replace("Section :", "").trim() || "Unknown";

      const questionPanels = container.querySelectorAll(".question-pnl");
      
      let secStats: SectionData = {
        name: sectionName,
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        score: 0
      };

      questionPanels.forEach((qPnl: Element) => {
        const menuTbl = qPnl.querySelector(".menu-tbl");
        if (!menuTbl) return;

        let chosenOption: string | null = null;
        let status = "";
        
        const rows = menuTbl.querySelectorAll("tr");
        rows.forEach((row: Element) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const label = cells[0].textContent?.trim() || "";
            const val = cells[1].textContent?.trim() || "";
            
            if (label.includes("Status")) status = val;
            if (label.includes("Chosen Option")) {
              if (val !== "--") chosenOption = val;
            }
          }
        });

        const isAttempted = chosenOption !== null;

        // Extract Correct Answer
        const rightAnsCell = qPnl.querySelector("td.rightAns");
        let correctOption: string | null = null;

        if (rightAnsCell) {
          const text = rightAnsCell.textContent?.trim() || "";
          const match = text.match(/^([A-E])\./);
          if (match) {
            correctOption = match[1];
          } else if (text.length > 0) {
            correctOption = text.charAt(0);
          }
        }

        // Calculate
        secStats.total++;
        if (!isAttempted) {
          secStats.unattempted++;
        } else {
          secStats.attempted++;
          if (chosenOption === correctOption) {
            secStats.correct++;
          } else {
            secStats.wrong++;
          }
        }
      });

      // Assign to Part 1 or Part 2
      const isPart2 = PART_2_SECTIONS.some(s => 
        sectionName.includes("General Knowledge") || sectionName.includes("GK")
      );
      
      if (isPart2) {
        secStats.score = secStats.correct * 1;
        part2Stats.sections.push(secStats);
        part2Stats.correct += secStats.correct;
        part2Stats.wrong += secStats.wrong;
        part2Stats.unattempted += secStats.unattempted;
        part2Stats.score += secStats.score;
      } else {
        secStats.score = (secStats.correct * 1) - (secStats.wrong * 0.25);
        part1Stats.sections.push(secStats);
        part1Stats.correct += secStats.correct;
        part1Stats.wrong += secStats.wrong;
        part1Stats.unattempted += secStats.unattempted;
        part1Stats.score += secStats.score;
      }
    });

    // Calculate Unattempted Penalty for Part 1
    let penalty = 0;
    if (part1Stats.unattempted > 8) {
      penalty = (part1Stats.unattempted - 8) * 0.10;
    }

    const part1FinalScore = part1Stats.score - penalty;

    return {
      candidateName,
      part1: part1Stats,
      part2: part2Stats,
      penalty,
      part1FinalScore
    };
  };

  const fetchDigialmContent = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit", headers: { Accept: "text/html,application/xhtml+xml,application/xml" } });
      if (response.ok) return await response.text();
      throw new Error("Direct fetch failed");
    } catch {
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
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
    if (!result.part1.sections.length && !result.part2.sections.length) {
      throw new Error("No valid questions found");
    }
    return result;
  };

  const handleCalculateAndSubmit = async () => {
    try {
      setError(""); 
      setLoading(true);
      
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
        setError("⚠️ Please paste your Digialm URL or HTML content"); 
        setLoading(false); 
        return; 
      }

      let calculatedResults: ParseResult;
      
      if (/^https?:\/\//i.test(input) || /digialm\.com/i.test(input)) {
        setError("🔄 Fetching and processing...");
        let url = input.startsWith("http") ? input : "https://" + input;
        try {
          const content = await fetchDigialmContent(url);
          calculatedResults = processContent(content);
        } catch {
          setError("❌ Unable to fetch URL. Please copy and paste the page content instead.");
          setLoading(false); 
          return;
        }
      } else {
        if (input.length < 100) { 
          setError("⚠️ Content too short. Copy entire page (Ctrl+A)."); 
          setLoading(false); 
          return; 
        }
        calculatedResults = processContent(input);
      }

      setError("💾 Saving results...");
      
      // Map section data to database columns
      const valrSection = calculatedResults.part1.sections.find(s => 
        s.name.includes("Verbal") || s.name.includes("VALR")
      );
      const dmSection = calculatedResults.part1.sections.find(s => 
        s.name.includes("Decision")
      );
      const qaSection = calculatedResults.part1.sections.find(s => 
        s.name.includes("Quantitative")
      );
      
      const dataToSave = {
        name, 
        mobile, 
        email, 
        category, 
        city,
        valr_correct: valrSection?.correct || 0,
        valr_wrong: valrSection?.wrong || 0,
        valr_skipped: valrSection?.unattempted || 0,
        dm_correct: dmSection?.correct || 0,
        dm_wrong: dmSection?.wrong || 0,
        dm_skipped: dmSection?.unattempted || 0,
        qa_correct: qaSection?.correct || 0,
        qa_wrong: qaSection?.wrong || 0,
        qa_skipped: qaSection?.unattempted || 0,
        show_in_leaderboard: true
      };
      
      await supabase.from("xat_results").insert([dataToSave]);

      setResults(calculatedResults);
      setError("✅ Results calculated and saved successfully!");
      await fetchLeaderboard();
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">
          <div className="text-center space-y-2 sm:space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold uppercase tracking-widest" style={{color: accentColor}}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: accentColor}}></span>
              XAT 2026 Score Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Calculate your <span style={{color: accentColor}}>XAT score</span> instantly
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                <h2 className="text-xl font-bold text-white mb-4">📝 Enter Details & Calculate Score</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">NAME <span className="text-red-500">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}`, outlineColor: accentColor }} />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">MOBILE <span className="text-red-500">*</span></label>
                    <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} maxLength={10} placeholder="10 digits" className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}` }} />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">EMAIL <span className="text-red-500">*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}` }} />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">CATEGORY <span className="text-red-500">*</span></label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}` }}>
                      <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option><option>PwD</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">CITY <span className="text-red-500">*</span></label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}` }} />
                  </div>
                </div>

                <div className="border-t pt-6 mb-6" style={{borderColor: 'rgba(100,116,139,0.3)'}}>
                  <label className="block text-slate-300 font-semibold mb-2">Digialm URL or Response Content <span className="text-red-500">*</span></label>
                  <textarea value={html} onChange={(e) => {setHtml(e.target.value); setError("");}} className="w-full h-32 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2" style={{ border: `1px solid ${borderColor}` }} placeholder="https://cdn.digialm.com/... OR paste full page content" />
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">📋 How to Use</h3>
                  <div className="space-y-2 text-sm text-slate-400">
                    <p>✅ Fill all your details above</p>
                    <p>✅ Click "Candidate Response" on XAT portal and copy the link</p>
                    <p>✅ Paste the link in the textbox above</p>
                    <p>✅ Click "Calculate & Save Score" button</p>
                  </div>
                </div>

                {error && (
                  <div className={`p-4 rounded-lg mb-4 ${error.includes("✅") ? "bg-green-900/20 border-green-500/30 text-green-400" : error.includes("🔄") || error.includes("💾") ? "bg-blue-900/20 border-blue-500/30 text-blue-400" : "bg-red-900/20 border-red-500/30 text-red-400"} border`}>
                    <p className="text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <button onClick={handleCalculateAndSubmit} disabled={loading} className="w-full px-6 py-4 rounded-xl font-bold text-black text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: accentColor }}>
                  {loading ? "Processing..." : "Calculate & Save Score →"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Leaderboard 
                  data={leaderboardData} 
                  currentUserScore={results ? results.part1FinalScore : undefined}
                />
              </div>
            </div>
          </div>

          {results && (
            <div id="results" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: secondaryBg, border: `2px solid ${accentColor}` }}>
                <h2 className="text-2xl font-bold text-white mb-6">🎯 Your XAT 2026 Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-6 rounded-xl border-2" style={{backgroundColor: '#050818', borderColor: accentColor}}>
                    <p className="text-slate-400 text-sm mb-2">Part 1 Total Score</p>
                    <p className="text-5xl font-bold mb-2" style={{color: accentColor}}>{results.part1FinalScore.toFixed(2)}</p>
                    <p className="text-xs text-red-400">Penalty Applied: -{results.penalty.toFixed(2)}</p>
                  </div>
                  <div className="p-6 bg-[#050818] rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">General Knowledge</p>
                    <p className="text-5xl font-bold text-slate-300 mb-2">{results.part2.score.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Not included in percentile</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-4">Part 1 Sections</h3>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {results.part1.sections.map((section, idx) => (
                    <div key={idx} className="p-5 bg-[#050818] rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs font-semibold mb-3">{section.name}</p>
                      <div className="flex gap-4 text-sm mb-3">
                        <span className="text-green-400">✓ {section.correct}</span>
                        <span className="text-red-400">✗ {section.wrong}</span>
                        <span className="text-slate-500">— {section.unattempted}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">Score: {section.score.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 mb-4">
                  <p className="text-slate-400 text-sm mb-2">Part 1 Summary:</p>
                  <p className="text-white text-sm">Total Unattempted: <span className="font-bold">{results.part1.unattempted}</span></p>
                  <p className="text-white text-sm">Raw Score: <span className="font-bold">{results.part1.score.toFixed(2)}</span></p>
                </div>

                {results.part2.sections.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold text-white mb-4">Part 2: General Knowledge</h3>
                    {results.part2.sections.map((section, idx) => (
                      <div key={idx} className="p-5 bg-[#050818] rounded-xl border border-slate-700 mb-4">
                        <p className="text-slate-400 text-xs font-semibold mb-3">{section.name}</p>
                        <div className="flex gap-4 text-sm mb-3">
                          <span className="text-green-400">✓ {section.correct}</span>
                          <span className="text-red-400">✗ {section.wrong}</span>
                          <span className="text-slate-500">— {section.unattempted}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">Score: {section.score.toFixed(2)}</p>
                      </div>
                    ))}
                  </>
                )}

                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-semibold">✅ Your results have been saved to our database!</p>
                </div>
              </div>

              <PercentileCalculator 
                userScore={results.part1FinalScore} 
                userName={name}
              />
            </div>
          )}

          <div className="mt-6">
            <XATScoreGraph />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
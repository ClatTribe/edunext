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

// Answer key data
const answerKeyData: Record<string, string> = {
  "3279042221": "50(root3-1)", "3279042222": "1980", "3279042223": "21/11 hours",
  "3279042224": "35", "3279042226": "rs. 2500", "3279042227": "rs. 237,500",
  "3279042228": "320 meters", "3279042229": "4 sq. cm", "3279042230": "7",
  "3279042231": "48", "3279042232": "ii only", "3279042233": "19",
  "3279042234": "4 minutes", "3279042235": "13/90", "3279042236": "2^476 3^455 5^1034",
  "3279042237": "7", "3279042238": "10(√10+4)m", "3279042239": "1 minute 48 seconds",
  "3279042240": "16", "3279042241": "4 is the fourth digit of the key", "3279042242": "rs. 2115",
  "3279042243": "rs. 700,000", "3279042245": "20, 25, 10", "3279042246": "it department, all offices together",
  "3279042247": "finance and it departments in the bengaluru office are equal",
  "3279042249": "x = 10", "3279042250": "y = 58", "3279042251": "at least rs. 107,000",
  "3279042253": "kanmani should not interfere with salaries, since it is a sensitive topic",
  "3279042254": "she should ask instructors, who want to take leave, to conduct make up classes for the missed classes over the weekend",
  "3279042255": "a, b, e", "3279042257": "she is a good debater who can logically think and argue on the go",
  "3279042258": "mbs's professors generally appreciate these three batchmates' inputs during case discussions",
  "3279042259": "the group meetings that she has attended so far have taught her a lot about how organizations work",
  "3279042261": "screwvala loved taking up challenging assignments during his stint as an investment banker",
  "3279042262": "screwvala believes that he owes it to patel for the help he has received in his journey as a writer",
  "3279042263": "screwvala's lawyer believes that if screwvala is desperate, he can try helping screwvala in getting out of the contract, by offering patel a reasonable compensation",
  "3279042265": "every interview is unique, and it will be easy to guess her identity from the transcript",
  "3279042266": "have a discussion with anjali and clarify that vidya had nothing to do with the viral post",
  "3279042267": "create an anonymous in-house forum within bksm, where the students could discuss anything without consequences",
  "3279042269": "abhishek strongly feels that he cannot continue for one more year in his current role",
  "3279042270": "abhishek should request mukesh for an open discussion to get rid of any misunderstandings",
  "3279042271": "mukesh is known to be very possessive of his subordinates",
  "3279042273": "animisha has a lucrative offer from a competing firm, for a similar role",
  "3279042274": "other potential candidates were rejected because of the change in the experience criterion",
  "3279042275": "a, b, d",
  "3279042277": "meet uday in person and remind him why she, a gen z, was hired in the first place",
  "3279042278": "reach out to the top management and explain how the attitude of the seniors is affecting their morale",
  "3279042279": "invest in diversity, equity and inclusion training, using mass exodus as a turning point for the organization to embrace",
  "3279042280": "2, 4", "3279042281": "1, 4, 6", "3279042282": "1, 4, 3, 5, 2",
  "3279042283": "sense, mapping, minor, understanding", "3279042284": "people prioritize certitude even if their interests are at stake",
  "3279042285": "1, 5, 4, 3, 2", "3279042286": "when attempting to switch careers, an employee should be ready to take some risks",
  "3279042287": "immigrants have contributed immensely to the wealth of the usa through their scientific contributions",
  "3279042288": "opportunities only come to those who actively chase them",
  "3279042290": "old newspapers symbolize the repressed stories that may confront the present",
  "3279042291": "acting on an unsettling past can help in overcoming the fear it instils",
  "3279042293": "because it helps individuals to bridge the gap that occurs while sharing lived experiences",
  "3279042294": "effective communication is not merely an exchange of information, but it is an exchange of overview",
  "3279042295": "conduit metaphors work on the assumption that words have inherent fixed meanings",
  "3279042297": "trolls aggressively engage with those who are invested in what they care about",
  "3279042298": "anonymity lets trolls go against the social norms and express their repressed selves covertly",
  "3279042299": "trolls use their online harassment as a form of corrective social conditioning",
  "3279042301": "science is amoral", "3279042302": "scientific discoveries are driven by utility not by the pursuit of truth",
  "3279042303": "scientists are driven by the urge to explore, not by who the exploration affects",
  "3279042305": "temporal comparison eliminates threat responses, whereas social comparison can activate threat circuitry",
  "3279042306": "high self-esteem ensures that the anchor of comparison is seen as opportunity for growth",
  "3279042307": "individuals with low self-esteem prefer those comparisons that reinforce negative self-evaluation",
  "3279042309": "because liberal democratic institutions that enable protection of minorities restrain majorities from acting unilaterally",
  "3279042310": "by tolerating the views we disagree with, we suffer from multiple identities",
  "3279042311": "while we believe our views are correct, to accept that others' views deserve merit is not always easy",
  "3279042317": "1-c, 2-a, 3-b, 4-d, 5-e", "3279042324": "these celebrities passed away in 2025",
  "3279042313": "developing transparent solar panels for skyscrapers", "3279042321": "they can regrow their lost arms",
  "3279042328": "rajiv rao", "3279042314": "percival everett", "3279042329": "risat-2br1",
  "3279042312": "vega-x", "3279042330": "18 percent", "3279042322": "pookie", "3279042325": "smriti mandhana",
  "3279042323": "halley's comet", "3279042318": "2, 4, 5, 1, 3", "3279042327": "cockroach",
  "3279042331": "bengaluru", "3279042320": "thomas edison", "3279042326": "novak djokovic",
  "3279042315": "usbrl (udhampur-srinagar-baramulla rail link)", "3279042316": "1-b, 2-a, 3-d, 4-c", "3279042319": "malaysia"
};

interface QuestionData { qid: string; status: string; chosen: string; chosenText: string; isCorrect?: boolean; isWrong?: boolean; isNA?: boolean; keyText?: string; }
interface SectionData { name: string; questions: QuestionData[]; correct: number; wrong: number; na: number; score: number; }
interface Sections { VALR: SectionData; DM: SectionData; QA: SectionData; GK: SectionData; }
interface ParseResult { sections: Sections; finalPart1: string; penaltyScore: number; }
interface LeaderboardEntry { rank: number; name: string; score: number; }

function normalize(text: string): string {
  if (!text) return "";
  let s = text.toString().toLowerCase().trim();
  s = s.replace(/^[a-e]\.\s*/, '');
  return s.replace(/\s+/g, '').replace(/[^a-z0-9√\^\+\-\=\/\(\)]/g, '');
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

  const extractQuestion = (pnl: Element): QuestionData | null => {
    try {
      const menuTbl = pnl.querySelector('.menu-tbl');
      if (!menuTbl) return null;
      let qid = "", status = "", chosen = "";
      menuTbl.querySelectorAll('tr').forEach((row: Element) => {
        const txt = row.textContent || "";
        if (txt.includes("Question ID")) { const boldEl = row.querySelector('.bold'); if (boldEl) qid = boldEl.textContent?.trim() || ""; }
        if (txt.includes("Status")) { const boldEl = row.querySelector('.bold'); if (boldEl) status = boldEl.textContent?.trim() || ""; }
        if (txt.includes("Chosen Option")) { const boldEl = row.querySelector('.bold'); if (boldEl) chosen = boldEl.textContent?.trim() || ""; }
      });
      let chosenText = "";
      const optionsMap: Record<string, string> = {};
      pnl.querySelectorAll('.questionRowTbl tr').forEach((row: Element) => {
        const tds = row.querySelectorAll('td');
        if (tds.length >= 2) {
          const txt = tds[1].textContent?.trim() || "";
          if (txt.match(/^[A-E]\./)) {
            const optKey = txt.charAt(0);
            optionsMap[optKey] = txt.substring(2).trim();
            if (tds[1].querySelector('img')) optionsMap[optKey] = "IMAGE_OPTION";
          }
        }
      });
      if (chosen && chosen !== "--") chosenText = optionsMap[chosen] || "";
      return { qid, status, chosen, chosenText };
    } catch(e) { return null; }
  };

  const scoreQuestion = (q: QuestionData, sectionObj: SectionData, isGK: boolean): void => {
    const keyText = answerKeyData[q.qid];
    q.isCorrect = false; q.isWrong = false; q.isNA = false; q.keyText = keyText;
    if (!q.chosen || q.chosen === "--" || q.status === "Not Answered") { q.isNA = true; sectionObj.na++; }
    else if (!keyText) { q.isNA = true; }
    else {
      const nKey = normalize(keyText), nUser = normalize(q.chosenText);
      let isMatch = false;
      if (nKey.length < 10) { if (nKey === nUser) isMatch = true; }
      else { if (nKey === nUser || nUser.includes(nKey) || nKey.includes(nUser)) isMatch = true; }
      if (isMatch) { q.isCorrect = true; sectionObj.correct++; sectionObj.score += 1; }
      else { q.isWrong = true; sectionObj.wrong++; if (!isGK) sectionObj.score -= 0.25; }
    }
  };

  const parseAndCalculate = (htmlContent: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const sections: Sections = {
      "VALR": { name: "Verbal & Logical Ability", questions: [], correct: 0, wrong: 0, na: 0, score: 0 },
      "DM": { name: "Decision Making", questions: [], correct: 0, wrong: 0, na: 0, score: 0 },
      "QA": { name: "Quantitative Aptitude", questions: [], correct: 0, wrong: 0, na: 0, score: 0 },
      "GK": { name: "General Knowledge", questions: [], correct: 0, wrong: 0, na: 0, score: 0 }
    };
    const sectionContainers = doc.querySelectorAll('.section-cntnr');
    sectionContainers.forEach((container: Element) => {
      const sectionLabelEl = container.querySelector('.section-lbl .bold');
      let sectionName = sectionLabelEl?.textContent?.trim() || "Unknown";
      let key: keyof Sections = "QA";
      if (sectionName.includes("Verbal")) key = "VALR";
      else if (sectionName.includes("Decision")) key = "DM";
      else if (sectionName.includes("General")) key = "GK";
      const pnls = container.querySelectorAll('.question-pnl');
      pnls.forEach((pnl: Element) => {
        const qData = extractQuestion(pnl);
        if (qData) { sections[key].questions.push(qData); scoreQuestion(qData, sections[key], key === "GK"); }
      });
    });
    const totalNA_Part1 = sections['VALR'].na + sections['DM'].na + sections['QA'].na;
    const penaltyCount = Math.max(0, totalNA_Part1 - 8);
    const penaltyScore = penaltyCount * 0.1;
    const rawPart1 = sections['VALR'].score + sections['DM'].score + sections['QA'].score;
    const finalPart1 = (rawPart1 - penaltyScore).toFixed(2);
    return { sections, finalPart1, penaltyScore };
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
    if (!result.sections.VALR.questions.length && !result.sections.DM.questions.length && !result.sections.QA.questions.length) {
      throw new Error("No valid questions found");
    }
    return result;
  };

  const handleCalculateAndSubmit = async () => {
    try {
      setError(""); setLoading(true);
      if (!name.trim()) { setError("❌ Please enter your name"); setLoading(false); return; }
      if (!mobile.trim() || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) { setError("❌ Please enter a valid 10-digit mobile number"); setLoading(false); return; }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("❌ Please enter a valid email address"); setLoading(false); return; }
      if (!city.trim()) { setError("❌ Please enter your city"); setLoading(false); return; }

      const input = html.trim();
      if (!input) { setError("⚠️ Please paste your Digialm URL or HTML content"); setLoading(false); return; }

      let calculatedResults: ParseResult;
      if (/^https?:\/\//i.test(input) || /digialm\.com/i.test(input)) {
        setError("🔄 Fetching and processing...");
        let url = input.startsWith("http") ? input : "https://" + input;
        try {
          const content = await fetchDigialmContent(url);
          calculatedResults = processContent(content);
        } catch {
          setError("❌ Unable to fetch URL. Please copy and paste the page content instead.");
          setLoading(false); return;
        }
      } else {
        if (input.length < 100) { setError("⚠️ Content too short. Copy entire page (Ctrl+A)."); setLoading(false); return; }
        calculatedResults = processContent(input);
      }

      setError("💾 Saving results...");
      const dataToSave = {
        name, mobile, email, category, city,
        valr_correct: calculatedResults.sections.VALR.correct,
        valr_wrong: calculatedResults.sections.VALR.wrong,
        valr_skipped: calculatedResults.sections.VALR.na,
        dm_correct: calculatedResults.sections.DM.correct,
        dm_wrong: calculatedResults.sections.DM.wrong,
        dm_skipped: calculatedResults.sections.DM.na,
        qa_correct: calculatedResults.sections.QA.correct,
        qa_wrong: calculatedResults.sections.QA.wrong,
        qa_skipped: calculatedResults.sections.QA.na,
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
                  currentUserScore={results ? parseFloat(results.finalPart1) : undefined}
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
                    <p className="text-5xl font-bold mb-2" style={{color: accentColor}}>{results.finalPart1}</p>
                    <p className="text-xs text-red-400">Penalty Applied: -{results.penaltyScore.toFixed(2)}</p>
                  </div>
                  <div className="p-6 bg-[#050818] rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">General Knowledge</p>
                    <p className="text-5xl font-bold text-slate-300 mb-2">{results.sections.GK.score}</p>
                    <p className="text-xs text-slate-500">Not included in percentile</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['VALR', 'DM', 'QA'] as const).map(key => (
                    <div key={key} className="p-5 bg-[#050818] rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs font-semibold mb-3">{results.sections[key].name}</p>
                      <div className="flex gap-4 text-sm mb-3">
                        <span className="text-green-400">✓ {results.sections[key].correct}</span>
                        <span className="text-red-400">✗ {results.sections[key].wrong}</span>
                        <span className="text-slate-500">— {results.sections[key].na}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">Score: {results.sections[key].score.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-semibold">✅ Your results have been saved to our database!</p>
                </div>
              </div>

              {/* <PercentileCalculator 
                userScore={parseFloat(results.finalPart1)} 
                userName={name}
              /> */}
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
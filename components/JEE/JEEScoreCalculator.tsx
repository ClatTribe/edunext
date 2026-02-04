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

// JEE Main has 3 sections
const JEE_SECTIONS = ["Physics", "Chemistry", "Mathematics"];

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );

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
          // JEE Main scoring: +4 for correct, -1 for wrong
          const physicsScore =
            entry.physics_correct * 4 - entry.physics_wrong * 1;
          const chemistryScore =
            entry.chemistry_correct * 4 - entry.chemistry_wrong * 1;
          const mathematicsScore =
            entry.mathematics_correct * 4 - entry.mathematics_wrong * 1;
          const totalScore = physicsScore + chemistryScore + mathematicsScore;

          return {
            name: entry.name,
            score: totalScore,
          };
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

  // Parse JEE response from NTA portal
  const parseAndCalculate = (htmlString: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract Candidate Details
    let candidateName = "Candidate";
    const infoTables = doc.querySelectorAll(
      ".main-info-pnl table tr, .candidate-info table tr",
    );
    infoTables.forEach((tr: Element) => {
      const cells = tr.querySelectorAll("td");
      if (cells.length >= 2 && cells[0].textContent?.includes("Name")) {
        candidateName = cells[1].textContent?.trim() || "Candidate";
      }
    });

    // Initialize sections
    const sections: SectionData[] = JEE_SECTIONS.map((name) => ({
      name,
      total: 30, // JEE Main has 30 questions per section (20 compulsory + 10 optional, attempt any 5)
      attempted: 0,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
    }));

    // Process each section
    const sectionContainers = doc.querySelectorAll(
      ".section-cntnr, .subject-section",
    );

    sectionContainers.forEach((container: Element, idx: number) => {
      if (idx >= 3) return; // Only 3 sections in JEE

      const sectionLbl = container.querySelector(".section-lbl, .subject-name");
      let sectionName =
        sectionLbl?.textContent?.replace("Section :", "").trim() ||
        JEE_SECTIONS[idx];

      // Find matching section
      let secIdx = sections.findIndex((s) =>
        sectionName.toLowerCase().includes(s.name.toLowerCase()),
      );
      if (secIdx === -1) secIdx = idx;

      const questionPanels = container.querySelectorAll(
        ".question-pnl, .question-row",
      );

      questionPanels.forEach((qPnl: Element) => {
        const menuTbl = qPnl.querySelector(".menu-tbl, .answer-info");
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
            if (
              label.includes("Chosen Option") ||
              label.includes("Your Answer")
            ) {
              if (val !== "--" && val !== "Not Answered") chosenOption = val;
            }
          }
        });

        const isAttempted = chosenOption !== null;

        // Extract Correct Answer
        const rightAnsCell = qPnl.querySelector("td.rightAns, .correct-answer");
        let correctOption: string | null = null;

        if (rightAnsCell) {
          const text = rightAnsCell.textContent?.trim() || "";
          const match = text.match(/^([A-D])\./);
          if (match) {
            correctOption = match[1];
          } else if (text.length > 0) {
            correctOption = text.charAt(0);
          }
        }

        // Calculate
        if (!isAttempted) {
          sections[secIdx].unattempted++;
        } else {
          sections[secIdx].attempted++;
          if (chosenOption === correctOption) {
            sections[secIdx].correct++;
          } else {
            sections[secIdx].wrong++;
          }
        }
      });

      // JEE Main scoring: +4 for correct, -1 for wrong
      sections[secIdx].score =
        sections[secIdx].correct * 4 - sections[secIdx].wrong * 1;
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

    const maxScore = 90 * 4; // 90 questions × 4 marks = 360

    return {
      candidateName,
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
    if (!result.sections.length) {
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
        setError("⚠️ Please paste your NTA URL or HTML content");
        setLoading(false);
        return;
      }

      let calculatedResults: ParseResult;
      let cdnLinkToSave = ""; 

      if (/^https?:\/\//i.test(input) || /nta\.ac\.in/i.test(input)) {
        setError("🔄 Fetching and processing...");
        let url = input.startsWith("http") ? input : "https://" + input;
        cdnLinkToSave = url;
        try {
          const content = await fetchNTAContent(url);
          calculatedResults = processContent(content);
        } catch {
          setError(
            "❌ Unable to fetch URL. Please copy and paste the page content instead.",
          );
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
      const physicsSection = calculatedResults.sections.find(
        (s) => s.name === "Physics",
      );
      const chemistrySection = calculatedResults.sections.find(
        (s) => s.name === "Chemistry",
      );
      const mathematicsSection = calculatedResults.sections.find(
        (s) => s.name === "Mathematics",
      );

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

      await supabase.from("jee_results").insert([dataToSave]);

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

                <div
                  className="border-t pt-6 mb-6"
                  style={{ borderColor: "rgba(100,116,139,0.3)" }}
                >
                  <label className="block text-slate-300 font-semibold mb-2">
                    NTA Response Sheet URL or Content{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={html}
                    onChange={(e) => {
                      setHtml(e.target.value);
                      setError("");
                    }}
                    className="w-full h-32 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2"
                    style={{ border: `1px solid ${borderColor}` }}
                    placeholder="https://jeemain.nta.nic.in/... OR paste full page content"
                  />
                </div>

                {error && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${error.includes("✅") ? "bg-green-900/20 border-green-500/30 text-green-400" : error.includes("🔄") || error.includes("💾") ? "bg-blue-900/20 border-blue-500/30 text-blue-400" : "bg-red-900/20 border-red-500/30 text-red-400"} border`}
                  >
                    <p className="text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCalculateAndSubmit}
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl font-bold text-black text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? "Processing..." : "Calculate & Save Score →"}
                </button>

                {/* Step-by-Step Guide Section - Moved here */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mt-6">
                  <h4 className="text-white font-semibold text-lg mb-3">
                    📋 Step-by-Step Guide: How to Calculate Your JEE Main Percentile
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Follow these simple steps after the exam:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 1: Download Answer Key & Response Sheet
                      </p>
                      <p className="text-xs text-slate-400">
                        Visit the official NTA website and download both.
                      </p>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 2: Calculate Raw Score
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        Use marking scheme:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• +4 for correct answer</li>
                        <li>• -1 for wrong answer</li>
                        <li>• 0 for unattempted</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 3: Use Online Predictor
                      </p>
                      <p className="text-xs text-slate-400">
                        Enter your marks in a trusted JEE Main Percentile
                        Predictor 2026 for quick results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Leaderboard
                  data={leaderboardData}
                  currentUserScore={results ? results.totalScore : undefined}
                />
              </div>
            </div>
          </div>

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
                    ✅ Your results have been saved to our database!
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

          {/* Detailed Information Section - Moved to the end */}
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
                  🎯 What Is JEE Main Percentile Predictor 2026?
                </h3>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  The JEE Main Percentile Predictor 2026 is an online tool
                  designed to help students forecast their likely percentile,
                  rank, and potential college admission prior to the
                  declaration of official results by NTA. Leveraging your raw
                  score, answer key, and historical data, it provides you a
                  near-accurate assessment of your performance in relation to
                  other candidates.
                </p>

                <p className="text-sm text-slate-300 mb-4">
                  JEE Main Percentile Predictor 2026 turns out to be a very
                  handy tool. You can use it to forecast your performance,
                  evaluate your chances, and map out your admission journey
                  smartly.
                </p>

                <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
                  <p className="text-xs text-blue-400 mb-2">
                    <strong>ℹ️ About Normalization:</strong>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The National Testing Agency (NTA) implements a
                    normalization method to derive the percentiles since JEE
                    Main is held in several sessions. As each session might
                    vary in terms of difficulty, normalization is done to
                    guarantee equity.
                  </p>
                </div>

                <h4 className="text-white font-semibold text-sm mb-3 mt-5">
                  ✨ Highlights of JEE Main 2026 Percentile Predictor
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Here are some features of the JEE Main percentile predictor
                  by Edu Next:
                </p>

                <div className="space-y-2 text-xs text-slate-400">
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Estimate your JEE Main 2026 percentile with a score
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Can also be used to find the rank in NTA JEE Main 2026
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Excellent usage of resources to improve performance for
                      upcoming JEE Main attempts
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>Instant results and easy student-friendly use</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Uses the official NTA marking scheme for accurate
                      percentile calculation
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Get an idea of your probability of getting a seat in
                      different colleges and plan your JoSAA counseling
                      strategy
                    </span>
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
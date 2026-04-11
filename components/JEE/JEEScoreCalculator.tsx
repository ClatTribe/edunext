"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";
import Leaderboard from "./Leaderboard";
import JEEScoreGraph from "./JEEScoreGraph";
import PercentileCalculator from "./PercentileCalculator";
import HowToUseGuide from "./Howtouseguide";
import PercentilePredictorInfo from "./Percentilepredictorinfo";

// --- CONFIGURATION ---
const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

const PARSE_API = "/api/parse-jee";

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
  applicationNo: string;
  rollNo: string;
  testDate: string;
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

interface ValidationErrors {
  html?: string;
  mobile?: string;
}

// Main Component
export default function PasteJEEResponse() {
  const [html, setHtml] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParseResult | null>(null);
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
      if (!data) return;

      const calculated = data.map((entry) => {
        const total =
          entry.physics_correct * 4 -
          entry.physics_wrong * 1 +
          (entry.chemistry_correct * 4 - entry.chemistry_wrong * 1) +
          (entry.mathematics_correct * 4 - entry.mathematics_wrong * 1);
        return { name: entry.name, score: total };
      });

      calculated.sort((a, b) => b.score - a.score);
      setLeaderboardData(
        calculated.slice(0, 10).map((e, i) => ({ rank: i + 1, ...e })),
      );
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  };

  // Real-time validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!html.trim()) {
      errors.html = "Please paste your response sheet URL";
    } else if (!html.startsWith("https://cdn3.digialm.com")) {
      errors.html = "URL must start with https://cdn3.digialm.com/...";
    }

    if (!mobileNumber.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      errors.mobile = "Please enter exactly 10 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUrlSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      setError("🔄 Parsing your response sheet...");

      const res = await fetch(PARSE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: html.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return finish(
          "❌ " + (data.error || "Parsing failed. Please try again."),
        );
      }

      const parsed: ParseResult = {
        candidateName: data.candidateName || "Student",
        applicationNo: data.applicationNo || "",
        rollNo: data.rollNo || "",
        testDate: data.testDate || "",
        totalScore: data.total_score,
        totalCorrect: data.total_correct,
        totalWrong: data.total_wrong,
        totalUnattempted: data.total_skipped,
        maxScore: 300,
        sections: data.sections,
      };

      setError("💾 Saving results...");

      const math = parsed.sections.find((s) => s.name === "Mathematics");
      const phys = parsed.sections.find((s) => s.name === "Physics");
      const chem = parsed.sections.find((s) => s.name === "Chemistry");

      await supabase.from("jee_results").insert([
        {
          name: parsed.candidateName,
          mobile: mobileNumber,
          email: "no-email@jee.local",
          category: "General",
          city: "Not Specified",
          cdn_link: html.startsWith("http") ? html : "",
          physics_correct: phys?.correct ?? 0,
          physics_wrong: phys?.wrong ?? 0,
          physics_skipped: phys?.unattempted ?? 0,
          chemistry_correct: chem?.correct ?? 0,
          chemistry_wrong: chem?.wrong ?? 0,
          chemistry_skipped: chem?.unattempted ?? 0,
          mathematics_correct: math?.correct ?? 0,
          mathematics_wrong: math?.wrong ?? 0,
          mathematics_skipped: math?.unattempted ?? 0,
          total_score: parsed.totalScore,
          show_in_leaderboard: true,
        },
      ]);

      setResults(parsed);
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
      finish("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finish = (msg: string) => {
    setError(msg);
    setLoading(false);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: primaryBg }}>
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slide-up {
            from {
              transform: translateY(10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-in {
            animation: fade-in 0.2s ease-out;
          }
          .fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .slide-up {
            animation: slide-up 0.2s ease-out;
          }
          .error-shake {
            animation: shake 0.3s ease-out;
          }
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }
          .animate-shimmer {
            animation: shimmer 2.5s infinite linear;
          }
          .animate-shimmer-delay {
            animation: shimmer 2.5s infinite linear;
            animation-delay: 1.25s;
          }
        `}</style>

        {/* BEFORE RESULTS - CLEAN CENTERED FORM */}
        {!results ? (
          <div className="pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 sm:mb-5 md:mb-6 px-2 leading-tight">
                JEE Main Score Calculator
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-slate-400 text-center px-4 max-w-2xl mx-auto">
                Please enter your response sheet to get the calculated score
                based on NTA's Answer Key
              </p>
            </div>

            {/* Form Box - Centered */}
            <div className="flex justify-center px-4">
              <div
                className="rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg w-full max-w-2xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Response Sheet URL Field */}
                <div className="mb-6 sm:mb-8">
                  <label className="block text-slate-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    Response Sheet URL
                  </label>
                  <p className="text-xs text-slate-500 mb-2 sm:mb-3 break-words">
                    Must start with https://cdn3.digialm.com/...
                  </p>
                  <textarea
                    value={html}
                    onChange={(e) => {
                      setHtml(e.target.value);
                      setValidationErrors({ ...validationErrors, html: "" });
                    }}
                    className={`w-full h-28 sm:h-32 rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-300 bg-[#050818] font-mono focus:outline-none focus:ring-2 resize-none transition-all ${
                      validationErrors.html ? "ring-red-500/50" : ""
                    }`}
                    style={{
                      border: `1px solid ${
                        validationErrors.html
                          ? "rgba(239, 68, 68, 0.5)"
                          : borderColor
                      }`,
                    }}
                    placeholder="Paste the sheet URL here"
                  />
                  {validationErrors.html && (
                    <p className="text-red-400 text-xs mt-2 slide-up break-words">
                      ⚠️ {validationErrors.html}
                    </p>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div className="mb-6 sm:mb-8">
                  <label className="block text-slate-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    Mobile Number
                  </label>
                  <p className="text-xs text-slate-500 mb-2 sm:mb-3">
                    10-digit mobile number to save your results
                  </p>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setMobileNumber(value);
                      setValidationErrors({ ...validationErrors, mobile: "" });
                    }}
                    maxLength={10}
                    disabled={loading}
                    className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all ${
                      validationErrors.mobile ? "ring-red-500/50" : ""
                    }`}
                    style={{
                      border: `1px solid ${
                        validationErrors.mobile
                          ? "rgba(239, 68, 68, 0.5)"
                          : borderColor
                      }`,
                    }}
                    placeholder="10-digit mobile number"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {mobileNumber &&
                      !/^\d{10}$/.test(mobileNumber) &&
                      !validationErrors.mobile && (
                        <p className="text-yellow-400 text-xs">
                          ℹ️ Enter {10 - mobileNumber.length} more digit(s)
                        </p>
                      )}
                    {mobileNumber &&
                      /^\d{10}$/.test(mobileNumber) &&
                      !validationErrors.mobile && (
                        <p className="text-green-400 text-xs">
                          ✓ Mobile number valid
                        </p>
                      )}
                  </div>
                  {validationErrors.mobile && (
                    <p className="text-red-400 text-xs mt-2 slide-up">
                      ⚠️ {validationErrors.mobile}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border text-center slide-up ${
                      error.includes("✅")
                        ? "bg-green-900/20 border-green-500/30 text-green-400"
                        : error.includes("🔄") || error.includes("💾")
                          ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                          : "bg-red-900/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <p className="text-xs sm:text-sm break-words">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUrlSubmit}
                    disabled={loading || !html.trim() || !mobileNumber.trim()}
                    className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-lg font-bold text-black text-base sm:text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    style={{ backgroundColor: accentColor }}
                  >
                    {loading ? "Processing..." : "Check My Score"}
                  </button>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-12">
              <HowToUseGuide accentColor={accentColor} />
              <PercentilePredictorInfo
                accentColor={accentColor}
                secondaryBg={secondaryBg}
                borderColor={borderColor}
              />
            </div>
          </div>
        ) : (
          // AFTER RESULTS - Show results section
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 lg:pt-12 pb-8 sm:pb-12">
            {results && (
              <div
                className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-2xl mt-2 sm:mt-4"
                style={{
                  background: 'linear-gradient(135deg, #0F172B 0%, #080C17 100%)',
                  border: `1px solid rgba(245, 158, 11, 0.3)`,
                  boxShadow: `0 0 30px rgba(245, 158, 11, 0.08)`,
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-80"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F59E0B] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>
                
                <div className="flex flex-col gap-4 sm:gap-6 relative z-10 w-full">
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4 md:gap-5 w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-[#F59E0B] to-orange-600 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-lg border-2 border-[#050818]">
                      🎓
                    </div>
                    <div className="w-full min-w-0">
                      <p className="text-[#F59E0B] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest mb-0.5 sm:mb-1">
                        Welcome back
                      </p>
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight break-words max-w-full overflow-hidden">
                        {results.candidateName}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
                    {[
                      { label: "Application No.", value: results.applicationNo || "—", icon: "📄" },
                      { label: "Roll Number", value: results.rollNo || "—", icon: "🔢" },
                      { label: "Test Date", value: results.testDate || "—", icon: "📅" }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 bg-[#050818]/60 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:border-[#F59E0B]/40 hover:bg-[#050818]/80 transition-all min-w-0">
                        <span className="text-lg sm:text-xl md:text-2xl opacity-80 shrink-0">{item.icon}</span>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">{item.label}</p>
                          <p className="text-white font-semibold text-xs sm:text-sm truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Results */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `2px solid ${accentColor}`,
                  }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 break-words">
                    🎯 Your JEE Main 2026 Results
                  </h2>

                  <div className="relative overflow-hidden p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 border border-[#F59E0B]/30 group" style={{ background: 'linear-gradient(145deg, #0A1128 0%, #050818 100%)', boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.05)' }}>
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500"></div>

                    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 relative z-10 w-full">
                      {/* Top - Total Score */}
                      <div className="flex flex-col items-center text-center w-full">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 mb-3 sm:mb-4 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 w-max">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                          <span className="text-[#F59E0B] text-[10px] sm:text-xs font-bold uppercase tracking-widest">Total Score</span>
                        </div>
                        
                        <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                          <span className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F59E0B] to-orange-400 drop-shadow-sm">
                            {results.totalScore}
                          </span>
                          <span className="text-base sm:text-lg md:text-xl text-slate-500 font-medium">
                            / {results.maxScore}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 font-medium bg-slate-800/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-slate-700/50 inline-block">
                          Based on NTA Answer Key
                        </p>
                      </div>

                      {/* Bottom - Breakdown */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full">
                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 backdrop-blur-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-shadow">
                          <span className="text-lg sm:text-xl md:text-3xl mb-0.5 sm:mb-1 md:mb-2 drop-shadow-md">✅</span>
                          <span className="text-xl sm:text-2xl md:text-3xl font-black text-green-400">{results.totalCorrect}</span>
                          <span className="text-[8px] sm:text-[9px] md:text-xs uppercase font-bold text-green-500/80 tracking-wider mt-0.5 sm:mt-1">Correct</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 backdrop-blur-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-shadow">
                          <span className="text-lg sm:text-xl md:text-3xl mb-0.5 sm:mb-1 md:mb-2 drop-shadow-md">❌</span>
                          <span className="text-xl sm:text-2xl md:text-3xl font-black text-red-400">{results.totalWrong}</span>
                          <span className="text-[8px] sm:text-[9px] md:text-xs uppercase font-bold text-red-500/80 tracking-wider mt-0.5 sm:mt-1">Wrong</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-500/10 to-transparent border border-slate-500/20 backdrop-blur-sm hover:shadow-[0_0_15px_rgba(148,163,184,0.1)] transition-shadow">
                          <span className="text-lg sm:text-xl md:text-3xl mb-0.5 sm:mb-1 md:mb-2 drop-shadow-md opacity-70">➖</span>
                          <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-300">{results.totalUnattempted}</span>
                          <span className="text-[8px] sm:text-[9px] md:text-xs uppercase font-bold text-slate-500 tracking-wider mt-0.5 sm:mt-1">Skipped</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-white mb-4 sm:mb-5 flex items-center gap-2">
                    <span className="text-[#F59E0B]">📚</span> <span className="break-words">Subject-wise Breakdown</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                    {results.sections.map((section, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden p-4 sm:p-5 md:p-6 bg-[#050818] rounded-xl sm:rounded-2xl border border-slate-700 hover:border-[#F59E0B]/50 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group flex flex-col"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#F59E0B]/10 transition-colors pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4 sm:mb-5 md:mb-6 relative z-10">
                          <p className="text-slate-200 font-bold text-base sm:text-lg break-words pr-2">
                            {section.name}
                          </p>
                          <p
                            className="text-3xl sm:text-4xl font-black drop-shadow-md shrink-0"
                            style={{ color: accentColor }}
                          >
                            {section.score}
                          </p>
                        </div>
                        <div className="flex justify-between mt-auto relative z-10 bg-slate-900/60 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-slate-800">
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 sm:mb-1 font-semibold truncate w-full text-center">Correct</span>
                            <span className="text-green-400 font-bold text-xs sm:text-sm">✓ {section.correct}</span>
                          </div>
                          <div className="w-[1px] bg-slate-700/50 self-stretch my-0.5 sm:my-1"></div>
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 sm:mb-1 font-semibold truncate w-full text-center">Wrong</span>
                            <span className="text-red-400 font-bold text-xs sm:text-sm">✗ {section.wrong}</span>
                          </div>
                          <div className="w-[1px] bg-slate-700/50 self-stretch my-0.5 sm:my-1"></div>
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 sm:mb-1 font-semibold truncate w-full text-center">Skipped</span>
                            <span className="text-slate-400 font-bold text-xs sm:text-sm">— {section.unattempted}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-8">
                  <Leaderboard />
                </div>
              </div>
            </div>

            {/* New CTA Section with Shimmer Effect */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <a 
                href="https://jeetribechallenge.getedunext.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300 group border border-blue-500/30"
              >
                <div className="absolute inset-0 w-full h-full animate-shimmer pointer-events-none opacity-50">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                </div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform">🚀</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 sm:mb-2 relative z-10 tracking-wide break-words">Join JEE Tribe Challenge</h3>
                <p className="text-blue-200/80 text-xs sm:text-sm relative z-10 font-medium break-words px-2">Compete, learn, and win exciting rewards!</p>
                <div className="mt-3 sm:mt-4 relative z-10 inline-flex items-center gap-1.5 sm:gap-2 text-blue-300 text-xs sm:text-sm font-bold group-hover:text-white transition-colors">
                  Explore Challenge <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>

              <a 
                href="https://wa.me/9125800871"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-green-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 group border border-green-500/30"
              >
                <div className="absolute inset-0 w-full h-full animate-shimmer-delay pointer-events-none opacity-50">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                </div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform">💬</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 sm:mb-2 relative z-10 tracking-wide break-words">Chat with Counsellor</h3>
                <p className="text-green-200/80 text-xs sm:text-sm relative z-10 font-medium break-words px-2">Get personalized guidance on WhatsApp</p>
                <div className="mt-3 sm:mt-4 relative z-10 inline-flex items-center gap-1.5 sm:gap-2 text-green-300 text-xs sm:text-sm font-bold group-hover:text-white transition-colors">
                  Message Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            </div>

            {/* Percentile Calculator */}
            <div className="mt-6 sm:mt-8">
              <PercentileCalculator
                userScore={results.totalScore}
                userName={results.candidateName || "JEE Taker"}
              />
            </div>

            {/* Chart & Info */}
            <div className="mt-6 sm:mt-8">
              <JEEScoreGraph />
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
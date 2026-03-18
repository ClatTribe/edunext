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
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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
          name: "JEE Taker",
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
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
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
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>

        {/* BEFORE RESULTS - CLEAN CENTERED FORM */}
        {!results ? (
          <div className="pt-20 pb-12">
            <div className="text-center mb-12">
              {/* Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-6">
                JEE Main Score Calculator
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-400 text-center">
                Please enter your response sheet to get the calculated score
                based on NTA's Answer Key
              </p>
            </div>

            {/* Form Box - Centered */}
            <div className="flex justify-center px-4">
              <div
                className="rounded-2xl p-8 shadow-lg w-full max-w-2xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                {/* Response Sheet URL Field */}
                <div className="mb-8">
                  <label className="block text-slate-300 font-semibold mb-3 text-base">
                    Response Sheet URL
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Must start with https://cdn3.digialm.com/...
                  </p>
                  <textarea
                    value={html}
                    onChange={(e) => {
                      setHtml(e.target.value);
                      setValidationErrors({ ...validationErrors, html: "" });
                    }}
                    className={`w-full h-32 rounded-xl p-4 text-sm text-slate-300 bg-[#050818] font-mono focus:outline-none focus:ring-2 resize-none transition-all ${
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
                    <p className="text-red-400 text-xs mt-2 slide-up">
                      ⚠️ {validationErrors.html}
                    </p>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div className="mb-8">
                  <label className="block text-slate-300 font-semibold mb-3 text-base">
                    Mobile Number
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    10-digit mobile number to save your results
                  </p>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setMobileNumber(value);
                      setValidationErrors({ ...validationErrors, mobile: "" });
                    }}
                    maxLength={10}
                    disabled={loading}
                    className={`w-full rounded-xl p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all ${
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
                    {mobileNumber && !/^\d{10}$/.test(mobileNumber) && !validationErrors.mobile && (
                      <p className="text-yellow-400 text-xs">
                        ℹ️ Enter {10 - mobileNumber.length} more digit(s)
                      </p>
                    )}
                    {mobileNumber && /^\d{10}$/.test(mobileNumber) && !validationErrors.mobile && (
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
                    className={`p-4 rounded-lg mb-6 border text-center slide-up ${
                      error.includes("✅")
                        ? "bg-green-900/20 border-green-500/30 text-green-400"
                        : error.includes("🔄") || error.includes("💾")
                          ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                          : "bg-red-900/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUrlSubmit}
                    disabled={loading || !html.trim() || !mobileNumber.trim()}
                    className="px-10 py-3 rounded-lg font-bold text-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: accentColor }}
                  >
                    {loading ? "Processing..." : "Check My Score"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // AFTER RESULTS - Show results section
          <div className="max-w-7xl mx-auto px-6 pt-12 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Results */}
              <div className="lg:col-span-2">
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
                          <span className="text-red-400">
                            ✗ {section.wrong}
                          </span>
                          <span className="text-slate-500">
                            — {section.unattempted}
                          </span>
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

            {/* Percentile Calculator */}
            <div className="mt-8">
              <PercentileCalculator
                userScore={results.totalScore}
                userName="JEE Taker"
              />
            </div>

            {/* Chart & Info */}
            <div className="mt-8">
              <JEEScoreGraph />
            </div>

            <HowToUseGuide accentColor={accentColor} />
            <PercentilePredictorInfo
              accentColor={accentColor}
              secondaryBg={secondaryBg}
              borderColor={borderColor}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
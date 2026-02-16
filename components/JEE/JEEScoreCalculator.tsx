"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";
import Leaderboard from "./Leaderboard";
import JEEScoreGraph from "./JEEScoreGraph";
import PercentileCalculator from "./PercentileCalculator";

// --- CONFIGURATION ---
const accentColor   = "#F59E0B";
const primaryBg     = "#050818";
const secondaryBg   = "#0F172B";
const borderColor   = "rgba(245, 158, 11, 0.15)";


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

export default function PasteJEEResponse() {
  const [html, setHtml]               = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState<ParseResult | null>(null);
  const [name, setName]               = useState("");
  const [mobile, setMobile]           = useState("");
  const [email, setEmail]             = useState("");
  const [category, setCategory]       = useState("General");
  const [city, setCity]               = useState("");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("jee_results")
        .select(
          "name, physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong, physics_skipped, chemistry_skipped, mathematics_skipped"
        )
        .eq("show_in_leaderboard", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return;

      const calculated = data.map((entry) => {
        const total =
          (entry.physics_correct     * 4 - entry.physics_wrong     * 1) +
          (entry.chemistry_correct   * 4 - entry.chemistry_wrong   * 1) +
          (entry.mathematics_correct * 4 - entry.mathematics_wrong * 1);
        return { name: entry.name, score: total };
      });

      calculated.sort((a, b) => b.score - a.score);
      setLeaderboardData(
        calculated.slice(0, 10).map((e, i) => ({ rank: i + 1, ...e }))
      );
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  };

  // ── Main handler: validate → call Python API → save to Supabase ──
  const handleCalculateAndSubmit = async () => {
    setError("");
    setLoading(true);

    // Validation
    if (!name.trim())
      return finish("❌ Please enter your name");
    if (!mobile.trim() || !/^\d{10}$/.test(mobile))
      return finish("❌ Please enter a valid 10-digit mobile number");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return finish("❌ Please enter a valid email address");
    // if (!city.trim())
    //   return finish("❌ Please enter your city");

    const input = html.trim();
    if (!input)
      return finish("⚠️ Please paste your NTA URL or HTML content");

    try {
      setError("🔄 Parsing...");

      const res = await fetch(PARSE_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return finish("❌ " + (data.error || "Parsing failed. Please try again."));
      }

      // ── Map API response → ParseResult shape ──
      const parsed: ParseResult = {
        candidateName:    data.candidateName || name,
        totalScore:       data.total_score,
        totalCorrect:     data.total_correct,
        totalWrong:       data.total_wrong,
        totalUnattempted: data.total_skipped,
        maxScore:         300,
        sections:         data.sections,   // already shaped correctly by Python
      };

      setError("💾 Saving results...");

      // ── Save to Supabase ──
      const math = parsed.sections.find((s) => s.name === "Mathematics");
      const phys = parsed.sections.find((s) => s.name === "Physics");
      const chem = parsed.sections.find((s) => s.name === "Chemistry");

      await supabase.from("jee_results").insert([{
        name,
        mobile,
        email,
        category,
        city,
        cdn_link: input.startsWith("http") ? input : "",
        physics_correct:     phys?.correct     ?? 0,
        physics_wrong:       phys?.wrong       ?? 0,
        physics_skipped:     phys?.unattempted ?? 0,
        chemistry_correct:   chem?.correct     ?? 0,
        chemistry_wrong:     chem?.wrong       ?? 0,
        chemistry_skipped:   chem?.unattempted ?? 0,
        mathematics_correct: math?.correct     ?? 0,
        mathematics_wrong:   math?.wrong       ?? 0,
        mathematics_skipped: math?.unattempted ?? 0,
        total_score:         parsed.totalScore,
        show_in_leaderboard: true,
      }]);

      setResults(parsed);
      setError("✅ Results calculated and saved successfully!");
      await fetchLeaderboard();
      setTimeout(
        () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
        100
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
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">

          {/* ── Header ── */}
          <div className="text-center space-y-2 sm:space-y-3 mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              JEE Main 2026 Score Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Calculate your{" "}
              <span style={{ color: accentColor }}>JEE Main score</span>{" "}
              instantly
            </h1>

            {/* Marquee */}
            <div className="mt-6 relative overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-xl border-2"
                style={{ backgroundColor: "rgba(64,222,93,0.1)", borderColor: "#40de5d" }}
              >
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "#40de5d" }} />
                  <p className="text-sm font-bold text-green-400 uppercase tracking-wide whitespace-nowrap">
                    💯 Result:
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap text-sm text-white font-medium">
                    All Slot Results Are Available: Visit Our JEE Starter Kit for Session 2
                    <a
                      href="/jeestarterkit"
                      className="ml-2 text-xs px-2 py-1 rounded-md font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: accentColor, color: "#000" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View More →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes marquee {
              0%   { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: inline-block;
              animation: marquee 20s linear infinite;
            }
            .animate-marquee:hover { animation-play-state: paused; }
          `}</style>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl p-6 shadow-xl"
                style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
              >
                <h2 className="text-xl font-bold text-white mb-4">📝 Enter Details & Calculate Score</h2>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "NAME",     value: name,   onChange: (v: string) => setName(v),   type: "text",  placeholder: "Full name" },
                    { label: "MOBILE",   value: mobile, onChange: (v: string) => setMobile(v.replace(/\D/g, "")), type: "tel", placeholder: "10 digits", maxLength: 10 },
                    { label: "EMAIL",    value: email,  onChange: (v: string) => setEmail(v),  type: "email", placeholder: "Email address" },
                  ].map(({ label, value, onChange, type, placeholder, maxLength }) => (
                    <div key={label}>
                      <label className="block text-slate-400 text-sm mb-2">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                        style={{ border: `1px solid ${borderColor}` }}
                      />
                    </div>
                  ))}
                </div>

                {/* HTML / URL Input */}
                <div className="border-t pt-6 mb-6" style={{ borderColor: "rgba(100,116,139,0.3)" }}>
                  <label className="block text-slate-300 font-semibold mb-2">
                    NTA Response Sheet URL or Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={html}
                    onChange={(e) => { setHtml(e.target.value); setError(""); }}
                    className="w-full h-32 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2"
                    style={{ border: `1px solid ${borderColor}` }}
                    placeholder="https://jeemain.nta.nic.in/... OR paste full page content"
                  />
                </div>

                {/* Error / Status */}
                {error && (
                  <div
                    className={`p-4 rounded-lg mb-4 border ${
                      error.includes("✅") ? "bg-green-900/20 border-green-500/30 text-green-400"
                      : error.includes("🔄") || error.includes("💾") ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                      : "bg-red-900/20 border-red-500/30 text-red-400"
                    }`}
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

                {/* Step Guide */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mt-6">
                  <h4 className="text-white font-semibold text-lg mb-3">
                    📋 Step-by-Step Guide
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: "Step 1: Get Response Sheet",  desc: "Visit the official NTA website and open your response sheet link." },
                      { title: "Step 2: Paste URL or Content", desc: "Copy the URL or select all (Ctrl+A) and paste the full page content above." },
                      { title: "Step 3: Get Your Score",       desc: "Click Calculate — our backend parses and scores your sheet instantly." },
                    ].map((step) => (
                      <div key={step.title} className="bg-slate-950/50 p-4 rounded-lg">
                        <p className="text-sm text-white font-semibold mb-1">{step.title}</p>
                        <p className="text-xs text-slate-400">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Leaderboard />
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          {results && (
            <div id="results" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div
                className="rounded-2xl p-6 shadow-2xl"
                style={{ backgroundColor: secondaryBg, border: `2px solid ${accentColor}` }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">🎯 Your JEE Main 2026 Results</h2>

                <div
                  className="p-8 rounded-xl border-2 mb-6"
                  style={{ backgroundColor: "#050818", borderColor: accentColor }}
                >
                  <p className="text-slate-400 text-sm mb-2">Total Score</p>
                  <p className="text-6xl font-bold mb-2" style={{ color: accentColor }}>
                    {results.totalScore}
                  </p>
                  <p className="text-sm text-slate-400">out of {results.maxScore} marks</p>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-green-400 text-2xl font-bold">{results.totalCorrect}</p>
                        <p className="text-xs text-slate-500">Correct</p>
                      </div>
                      <div>
                        <p className="text-red-400 text-2xl font-bold">{results.totalWrong}</p>
                        <p className="text-xs text-slate-500">Wrong</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-2xl font-bold">{results.totalUnattempted}</p>
                        <p className="text-xs text-slate-500">Skipped</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-4">Subject-wise Breakdown</h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.sections.map((section, idx) => (
                    <div key={idx} className="p-5 bg-[#050818] rounded-xl border border-slate-700">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-slate-300 font-bold">{section.name}</p>
                        <p className="text-2xl font-bold" style={{ color: accentColor }}>{section.score}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">✓ {section.correct}</span>
                        <span className="text-red-400">✗ {section.wrong}</span>
                        <span className="text-slate-500">— {section.unattempted}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {section.attempted} attempted out of {section.total}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm mb-2">ℹ️ Scoring Pattern:</p>
                  <p className="text-white text-xs">+4 marks for each correct answer</p>
                  <p className="text-white text-xs">-1 mark for each wrong answer</p>
                  <p className="text-white text-xs">0 marks for unattempted questions</p>
                </div>

                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-semibold">
                    ✅ Your results have been saved to our database!
                  </p>
                </div>
              </div>

              <PercentileCalculator userScore={results.totalScore} userName={name} />
            </div>
          )}

          <div className="mt-6">
            <JEEScoreGraph />
          </div>

          {/* Info section */}
          <div className="mt-8">
            <div
              className="rounded-2xl p-6 shadow-xl"
              style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  🎯 What Is JEE Main Percentile Predictor 2026?
                </h3>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  The JEE Main Percentile Predictor 2026 is an online tool designed to help students
                  forecast their likely percentile, rank, and potential college admission prior to the
                  declaration of official results by NTA.
                </p>
                <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
                  <p className="text-xs text-blue-400 mb-2"><strong>ℹ️ About Normalization:</strong></p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    NTA implements a normalization method to derive percentiles since JEE Main is held
                    in several sessions. Normalization ensures equity across sessions of varying difficulty.
                  </p>
                </div>
                <div className="space-y-2 text-xs text-slate-400 mt-4">
                  {[
                    "Estimate your JEE Main 2026 percentile with a score",
                    "Find your rank in NTA JEE Main 2026",
                    "Uses official NTA marking scheme for accurate calculation",
                    "Get an idea of your probability of getting a seat in different colleges",
                    "Plan your JoSAA counseling strategy smartly",
                  ].map((item) => (
                    <p key={item} className="flex items-start gap-2">
                      <span style={{ color: accentColor }}>✓</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DefaultLayout>
  );
}
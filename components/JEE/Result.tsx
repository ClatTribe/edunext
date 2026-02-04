"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DefaultLayout from '@/app/defaultLayout';
import Leaderboard from "./Leaderboard";
import ScoreGraph from "./ScoreGraph";
import { supabase } from "../../lib/supabase";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

// JEE Main scoring: +4 for correct, -1 for wrong
const score = (c: number, w: number) => (c * 4) - (w * 1);

function ResultContent() {
  const p = useSearchParams();

  // Safe parameter extraction with fallbacks
  const [pc, pw] = (p.get("physics") || "0,0").split(",").map(Number);
  const [cc, cw] = (p.get("chemistry") || "0,0").split(",").map(Number);
  const [mc, mw] = (p.get("mathematics") || "0,0").split(",").map(Number);

  // Get user details from URL
  const userName = p.get("name") || "Anonymous";
  const userMobile = p.get("mobile") || "";
  const userEmail = p.get("email") || "";
  const userCategory = p.get("category") || "General";
  const userCity = p.get("city") || "";

  const physics = score(pc, pw);
  const chemistry = score(cc, cw);
  const mathematics = score(mc, mw);
  const total = physics + chemistry + mathematics;

  // Calculate total questions
  const totalCorrect = pc + cc + mc;
  const totalWrong = pw + cw + mw;
  const totalAttempted = totalCorrect + totalWrong;
  const maxPossible = 300; // 90 questions × 4 marks

  // State for leaderboard
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { data, error } = await supabase
          .from("jee_results")
          .select(
            "name, physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong"
          )
          .eq("show_in_leaderboard", true)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        if (!data || data.length === 0) {
          console.log("No data found in database");
          setLeaderboardData([]);
          setLoadingLeaderboard(false);
          return;
        }

        const scoresWithRank = data.map((student: any) => {
          const physicsScore = score(
            student.physics_correct || 0,
            student.physics_wrong || 0
          );
          const chemistryScore = score(
            student.chemistry_correct || 0,
            student.chemistry_wrong || 0
          );
          const mathematicsScore = score(
            student.mathematics_correct || 0,
            student.mathematics_wrong || 0
          );
          const totalScore = physicsScore + chemistryScore + mathematicsScore;

          return {
            name: student.name,
            score: totalScore,
          };
        });

        scoresWithRank.sort((a, b) => b.score - a.score);

        const rankedData = scoresWithRank.map((student, index) => ({
          rank: index + 1,
          name: student.name,
          score: student.score,
        }));

        console.log("Top 10 leaderboard:", rankedData.slice(0, 10));
        setLeaderboardData(rankedData.slice(0, 10));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const graphData = [
    {
      section: "Physics",
      correct: pc,
      wrong: pw,
      score: physics,
      maxScore: 120, // 30 questions × 4 marks
    },
    {
      section: "Chemistry",
      correct: cc,
      wrong: cw,
      score: chemistry,
      maxScore: 120,
    },
    {
      section: "Mathematics",
      correct: mc,
      wrong: mw,
      score: mathematics,
      maxScore: 120,
    },
  ];

  // Calculate percentile (approximate)
  const getPercentile = (score: number) => {
    if (score >= 280) return "99.9+";
    if (score >= 260) return "99.5-99.9";
    if (score >= 240) return "99.0-99.5";
    if (score >= 220) return "98.0-99.0";
    if (score >= 200) return "96.0-98.0";
    if (score >= 180) return "93.0-96.0";
    if (score >= 160) return "88.0-93.0";
    if (score >= 140) return "80.0-88.0";
    if (score >= 120) return "70.0-80.0";
    if (score >= 100) return "55.0-70.0";
    if (score >= 80) return "40.0-55.0";
    return "Below 40";
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">
          {/* Header Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold uppercase tracking-widest mb-3" style={{color: accentColor}}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: accentColor}}></span>
              JEE Main 2026 Results
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Your <span style={{color: accentColor}}>JEE Main</span> Performance
            </h1>
          </div>

          {/* User Info Banner */}
          <div
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: secondaryBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-semibold">{userName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Category:</span>
                <span className="text-white font-semibold">{userCategory}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">City:</span>
                <span className="text-white font-semibold">{userCity}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Overall Score Circle */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Your Overall Score
                  </h2>

                  <div className="flex items-center justify-center">
                    <div className="relative w-[180px] h-[180px]">
                      <svg
                        className="transform -rotate-90"
                        width="180"
                        height="180"
                      >
                        <circle
                          cx="90"
                          cy="90"
                          r="75"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="14"
                          fill="none"
                        />
                        <circle
                          cx="90"
                          cy="90"
                          r="75"
                          stroke={accentColor}
                          strokeWidth="14"
                          fill="none"
                          strokeDasharray={`${(total / maxPossible) * 471} 471`}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {total}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          out of {maxPossible}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Estimated Percentile</p>
                      <p className="text-2xl font-bold" style={{color: accentColor}}>
                        {getPercentile(total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Table */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="p-6 pb-4">
                    <h2 className="text-xl font-semibold text-white">
                      Your Score Card
                    </h2>
                  </div>

                  <div className="px-6 pb-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: "#047857" }}>
                          {["Section", "Overall", "Physics", "Chemistry", "Math"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-3 py-3 text-left text-white font-semibold text-xs whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <td className="px-3 py-3 text-white text-xs">
                            Correct
                          </td>
                          <td className="px-3 py-3 text-white text-xs">
                            {totalCorrect}
                          </td>
                          <td className="px-3 py-3 text-white text-xs">{pc}</td>
                          <td className="px-3 py-3 text-white text-xs">{cc}</td>
                          <td className="px-3 py-3 text-white text-xs">{mc}</td>
                        </tr>

                        <tr
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <td className="px-3 py-3 text-white text-xs">
                            Wrong
                          </td>
                          <td className="px-3 py-3 text-white text-xs">
                            {totalWrong}
                          </td>
                          <td className="px-3 py-3 text-white text-xs">{pw}</td>
                          <td className="px-3 py-3 text-white text-xs">{cw}</td>
                          <td className="px-3 py-3 text-white text-xs">{mw}</td>
                        </tr>

                        <tr
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <td className="px-3 py-3 text-white text-xs">
                            Attempted
                          </td>
                          <td className="px-3 py-3 text-white text-xs">
                            {totalAttempted}
                          </td>
                          <td className="px-3 py-3 text-white text-xs">{pc + pw}</td>
                          <td className="px-3 py-3 text-white text-xs">{cc + cw}</td>
                          <td className="px-3 py-3 text-white text-xs">{mc + mw}</td>
                        </tr>

                        <tr>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            Score
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {total}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {physics}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {chemistry}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {mathematics}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-400 text-xs mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-white">
                    {totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0}%
                  </p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-400 text-xs mb-1">Total Attempted</p>
                  <p className="text-2xl font-bold text-white">
                    {totalAttempted}/90
                  </p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-400 text-xs mb-1">Correct Answers</p>
                  <p className="text-2xl font-bold text-green-400">
                    {totalCorrect}
                  </p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-400 text-xs mb-1">Wrong Answers</p>
                  <p className="text-2xl font-bold text-red-400">
                    {totalWrong}
                  </p>
                </div>
              </div>

              <ScoreGraph data={graphData} />

              {/* Scoring Info */}
              <div
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4">ℹ️ Scoring Pattern</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Correct Answer:</span>
                    <span className="text-green-400 font-bold">+4 marks</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Wrong Answer:</span>
                    <span className="text-red-400 font-bold">-1 mark</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Unattempted:</span>
                    <span className="text-slate-500 font-bold">0 marks</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Maximum Score:</span>
                    <span className="text-white font-bold">{maxPossible} marks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {loadingLeaderboard ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-400">Loading leaderboard...</p>
                </div>
              ) : (
                <Leaderboard/>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

// Main component with Suspense wrapper
export default function JEEResultPage() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: primaryBg }} className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading results...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
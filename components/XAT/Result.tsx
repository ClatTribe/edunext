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

const score = (c: number, w: number) => c - w * 0.25;

function ResultContent() {
  const p = useSearchParams();

  // Safe parameter extraction with fallbacks
  const [vc, vw] = (p.get("valr") || "0,0").split(",").map(Number);
  const [dc, dw] = (p.get("dm") || "0,0").split(",").map(Number);
  const [qc, qw] = (p.get("qa") || "0,0").split(",").map(Number);

  // Get user details from URL
  const userName = p.get("name") || "Anonymous";
  const userMobile = p.get("mobile") || "";
  const userEmail = p.get("email") || "";
  const userCategory = p.get("category") || "General";
  const userCity = p.get("city") || "";

  const valr = score(vc, vw);
  const dm = score(dc, dw);
  const qa = score(qc, qw);
  const total = valr + dm + qa;

  // State for leaderboard
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { data, error } = await supabase
          .from("xat_results")
          .select(
            "name, valr_correct, valr_wrong, dm_correct, dm_wrong, qa_correct, qa_wrong"
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
          const valrScore = score(
            student.valr_correct || 0,
            student.valr_wrong || 0
          );
          const dmScore = score(student.dm_correct || 0, student.dm_wrong || 0);
          const qaScore = score(student.qa_correct || 0, student.qa_wrong || 0);
          const totalScore = valrScore + dmScore + qaScore;

          return {
            name: student.name,
            score: parseFloat(totalScore.toFixed(2)),
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
      section: "VALR",
      correct: vc,
      wrong: vw,
      score: valr,
      maxScore: 26,
    },
    {
      section: "DM",
      correct: dc,
      wrong: dw,
      score: dm,
      maxScore: 22,
    },
    {
      section: "QA & DI",
      correct: qc,
      wrong: qw,
      score: qa,
      maxScore: 28,
    },
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">
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
                          strokeDasharray={`${(total / 100) * 471} 471`}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {total.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          Total Score
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="p-6 pb-4">
                    <h2 className="text-xl font-semibold text-white">
                      Your Score card
                    </h2>
                  </div>

                  <div className="px-6 pb-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: "#047857" }}>
                          {["Edu-Next", "Overall", "VALR", "DM", "QA & DI"].map(
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
                            {vc + dc + qc}
                          </td>
                          <td className="px-3 py-3 text-white text-xs">{vc}</td>
                          <td className="px-3 py-3 text-white text-xs">{dc}</td>
                          <td className="px-3 py-3 text-white text-xs">{qc}</td>
                        </tr>

                        <tr
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <td className="px-3 py-3 text-white text-xs">
                            Wrong
                          </td>
                          <td className="px-3 py-3 text-white text-xs">
                            {vw + dw + qw}
                          </td>
                          <td className="px-3 py-3 text-white text-xs">{vw}</td>
                          <td className="px-3 py-3 text-white text-xs">{dw}</td>
                          <td className="px-3 py-3 text-white text-xs">{qw}</td>
                        </tr>

                        <tr>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            Score
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {total.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {valr.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {dm.toFixed(2)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-white text-xs">
                            {qa.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <ScoreGraph data={graphData} />
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
                <Leaderboard data={leaderboardData} currentUserScore={total} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

// Main component with Suspense wrapper
export default function ZATResultPage() {
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
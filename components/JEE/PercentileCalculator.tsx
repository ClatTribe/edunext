"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface PercentileCalculatorProps {
  userScore: number;
  userName: string;
}

interface PercentileData {
  percentile: number;
  rank: number;
  totalEntries: number;
  scoreDistribution: {
    above: number;
    below: number;
    same: number;
  };
}

export default function PercentileCalculator({
  userScore,
  userName,
}: PercentileCalculatorProps) {
  const [percentileData, setPercentileData] = useState<PercentileData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculatePercentile();
  }, [userScore]);

  const calculatePercentile = async () => {
    try {
      setLoading(true);

      // Fetch all entries from xat_results
      const { data: allResults, error } = await supabase
        .from("xat_results")
        .select(
          "valr_correct, valr_wrong, dm_correct, dm_wrong, qa_correct, qa_wrong, valr_skipped, dm_skipped, qa_skipped",
        );

      if (error) throw error;

      if (!allResults || allResults.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate scores for all entries
      const allScores = allResults
        .map((entry) => {
          const valrScore = entry.valr_correct - entry.valr_wrong * 0.25;
          const dmScore = entry.dm_correct - entry.dm_wrong * 0.25;
          const qaScore = entry.qa_correct - entry.qa_wrong * 0.25;
          const rawScore = valrScore + dmScore + qaScore;

          const totalNA =
            entry.valr_skipped + entry.dm_skipped + entry.qa_skipped;
          const penaltyCount = Math.max(0, totalNA - 8);
          const penaltyScore = penaltyCount * 0.1;

          return rawScore - penaltyScore;
        })
        .sort((a, b) => b - a); // Sort descending

      const totalEntries = allScores.length;

      // Find user's rank (position in sorted array)
      const rank = allScores.findIndex((score) => score <= userScore) + 1;

      // Calculate percentile: ((n - R) / n) × 100
      const percentile = ((totalEntries - rank) / totalEntries) * 100;

      // Calculate distribution
      const above = allScores.filter((s) => s > userScore).length;
      const below = allScores.filter((s) => s < userScore).length;
      const same = allScores.filter((s) => s === userScore).length;

      setPercentileData({
        percentile: Math.round(percentile * 100) / 100,
        rank,
        totalEntries,
        scoreDistribution: { above, below, same },
      });
    } catch (err) {
      console.error("Error calculating percentile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 shadow-xl animate-pulse"
        style={{
          backgroundColor: secondaryBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (!percentileData) return null;

  return (
    <div
      className="rounded-2xl p-6 shadow-xl"
      style={{
        backgroundColor: secondaryBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold text-white">Your Percentile</h2>
      </div>

      {/* Main Percentile Display */}
      <div
        className="bg-[#050818] rounded-xl p-8 mb-6 text-center border-2"
        style={{ borderColor: accentColor }}
      >
        <p className="text-slate-400 text-sm mb-2">You scored better than</p>
        <p className="text-6xl font-bold mb-2" style={{ color: accentColor }}>
          {percentileData.percentile.toFixed(2)}%
        </p>
        {/* <p className="text-slate-400 text-sm">of {percentileData.totalEntries} students</p> */}
      </div>

      {/* Rank and Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#050818] rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Your Rank</p>
          <p className="text-3xl font-bold text-white">{percentileData.rank}</p>
          {/* <p className="text-slate-500 text-xs">out of {percentileData.totalEntries}</p> */}
        </div>
        <div className="bg-[#050818] rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Your Score</p>
          <p className="text-3xl font-bold" style={{ color: accentColor }}>
            {userScore}
          </p>
          {/* <p className="text-slate-500 text-xs">Part 1 Total</p> */}
        </div>
      </div>
      {/* JEE Session 2 Prep CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-300 text-sm mb-1">
              Want to be better prepared for{" "}
              <span className="font-bold text-amber-400">JEE Session 2</span>?
            </p>
            <p className="text-slate-400 text-xs">
              Get our comprehensive starter kit with practice questions,
              strategies & more
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/https://www.getedunext.com/JEEstarterkit")}
            className="ml-4 px-6 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 whitespace-nowrap"
            style={{
              backgroundColor: accentColor,
              color: "#050818",
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
            }}
          >
            Get Starter Kit →
          </button>
        </div>
      </div>
    </div>
  );
}

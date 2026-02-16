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
  above: number;
  below: number;
  same: number;
}

export default function PercentileCalculator({
  userScore,
  userName,
}: PercentileCalculatorProps) {
  const [percentileData, setPercentileData] = useState<PercentileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculatePercentile();
  }, [userScore]);

  const calculatePercentile = async () => {
    try {
      setLoading(true);

      // ── Fetch all JEE results from DB ──
      const { data: allResults, error } = await supabase
        .from("jee_results")
        .select(
          "physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong"
        );

      if (error) throw error;
      if (!allResults || allResults.length === 0) {
        setLoading(false);
        return;
      }

      // ── Calculate total score for each entry using JEE marking scheme ──
      const allScores = allResults
        .map((entry) => {
          const physics     = entry.physics_correct     * 4 - entry.physics_wrong     * 1;
          const chemistry   = entry.chemistry_correct   * 4 - entry.chemistry_wrong   * 1;
          const mathematics = entry.mathematics_correct * 4 - entry.mathematics_wrong * 1;
          return physics + chemistry + mathematics;
        })
        .sort((a, b) => b - a); // descending

      const totalEntries = allScores.length;

      // ── Rank: position of first score <= userScore ──
      const rankIdx = allScores.findIndex((s) => s <= userScore);
      const rank    = rankIdx === -1 ? totalEntries + 1 : rankIdx + 1;

      // ── Percentile: % of students scoring BELOW user ──
      const below      = allScores.filter((s) => s < userScore).length;
      const above      = allScores.filter((s) => s > userScore).length;
      const same       = allScores.filter((s) => s === userScore).length;
      const percentile = (below / totalEntries) * 100;

      setPercentileData({
        percentile:   Math.round(percentile * 100) / 100,
        rank,
        totalEntries,
        above,
        below,
        same,
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
        style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
      >
        <div className="h-8 bg-slate-700 rounded w-1/2 mb-4" />
        <div className="h-32 bg-slate-700 rounded" />
      </div>
    );
  }

  if (!percentileData) return null;

  const { percentile, rank, totalEntries, above, below, same } = percentileData;

  // Progress bar width capped at 100%
  const barWidth = Math.min(percentile, 100);

  return (
    <div
      className="rounded-2xl p-6 shadow-xl"
      style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold text-white">Your Percentile</h2>
        <span className="ml-auto text-xs text-slate-500">
          based on {totalEntries} students
        </span>
      </div>

      {/* Main Percentile Display */}
      <div
        className="bg-[#050818] rounded-xl p-8 mb-4 text-center border-2"
        style={{ borderColor: accentColor }}
      >
        <p className="text-slate-400 text-sm mb-2">You scored better than</p>
        <p className="text-6xl font-bold mb-3" style={{ color: accentColor }}>
          {percentile.toFixed(2)}%
        </p>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${barWidth}%`, backgroundColor: accentColor }}
          />
        </div>
        <p className="text-slate-500 text-xs mt-2">of all students on this platform</p>
      </div>

      {/* Rank and Score */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[#050818] rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Your Rank</p>
          <p className="text-3xl font-bold text-white">#{rank}</p>
          <p className="text-slate-500 text-xs mt-1">out of {totalEntries}</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Your Score</p>
          <p className="text-3xl font-bold" style={{ color: accentColor }}>
            {userScore}
          </p>
          <p className="text-slate-500 text-xs mt-1">out of 300</p>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-[#050818] rounded-xl p-4 border border-slate-700 mb-4">
        <p className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wide">
          Score Distribution
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-red-400 text-lg font-bold">{above}</p>
            <p className="text-slate-500 text-xs">Scored Higher</p>
          </div>
          <div>
            <p className="text-yellow-400 text-lg font-bold">{same}</p>
            <p className="text-slate-500 text-xs">Same Score</p>
          </div>
          <div>
            <p className="text-green-400 text-lg font-bold">{below}</p>
            <p className="text-slate-500 text-xs">Scored Lower</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-300 text-sm mb-1">
              Want to be better prepared for{" "}
              <span className="font-bold text-amber-400">JEE Session 2</span>?
            </p>
            <p className="text-slate-400 text-xs">
              Get our comprehensive starter kit with practice questions & strategies
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/jeestarterkit")}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
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
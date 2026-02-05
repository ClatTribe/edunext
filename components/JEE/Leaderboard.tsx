"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch top 10 students, ordered by total_score descending
      // Only show students who have opted to show in leaderboard
      const { data, error } = await supabase
        .from("jee_results")
        .select("name, total_score, show_in_leaderboard")
        .eq("show_in_leaderboard", true)
        .order("total_score", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("No leaderboard data available");
        setLoading(false);
        return;
      }

      // Add rank to each entry
      const rankedData: LeaderboardEntry[] = data.map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.total_score,
      }));

      setLeaderboardData(rankedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl overflow-hidden sticky top-8"
        style={{
          backgroundColor: secondaryBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="p-6 pb-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-semibold text-white">
              Leaderboard (Top 10)
            </h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl overflow-hidden sticky top-8"
        style={{
          backgroundColor: secondaryBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="p-6 pb-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-semibold text-white">
              Leaderboard (Top 10)
            </h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden sticky top-8"
      style={{
        backgroundColor: secondaryBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b" style={{ borderColor }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-semibold text-white">
            Leaderboard (Top 10)
          </h2>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4">
        <div className="space-y-2">
          {leaderboardData.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between p-3 rounded-lg transition-all bg-[#050818] hover:bg-[#0a0f20]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1
                      ? "bg-yellow-500/20 text-yellow-400"
                      : entry.rank === 2
                      ? "bg-gray-400/20 text-gray-300"
                      : entry.rank === 3
                      ? "bg-amber-700/20 text-amber-600"
                      : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  {entry.rank}
                </div>

                {/* Name */}
                <span className="text-white text-sm truncate flex-1">
                  {entry.name}
                </span>
              </div>

              {/* Score */}
              <span
                className="font-bold text-lg ml-2 shrink-0"
                style={{ color: accentColor }}
              >
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-6 py-4 border-t" style={{ borderColor }}>
        <p className="text-xs text-slate-400 text-center">
          Updated in real-time as students submit scores
        </p>
      </div>
    </div>
  );
}
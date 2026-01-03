"use client";

const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

interface LeaderboardProps {
  data: LeaderboardEntry[];
  currentUserScore?: number;
}

export default function Leaderboard({ data, currentUserScore }: LeaderboardProps) {
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
          {data.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                currentUserScore && Math.round(currentUserScore) === entry.score
                  ? "bg-amber-500/20 border border-amber-500/40"
                  : "bg-[#050818] hover:bg-[#0a0f20]"
              }`}
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
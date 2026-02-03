// components/ScoreGraph.tsx
"use client";

const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface ScoreData {
  section: string;
  correct: number;
  wrong: number;
  score: number;
  maxScore: number;
}

interface ScoreGraphProps {
  data: ScoreData[];
}

export default function ScoreGraph({ data }: ScoreGraphProps) {
  const maxPossibleScore = Math.max(...data.map((d) => d.maxScore));

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: secondaryBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Section-wise Performance
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: accentColor }}
            ></div>
            <span className="text-slate-400">Your Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Max Score</span>
          </div>
        </div>
      </div>

      {/* Vertical Bar Chart Container */}
      <div
        className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 px-2 overflow-x-auto pb-4"
        style={{ height: "300px" }}
      >
        {data.map((item, index) => {
          const heightPercentage = (item.score / item.maxScore) * 100;
          const accuracy =
            item.correct + item.wrong > 0
              ? ((item.correct / (item.correct + item.wrong)) * 100).toFixed(0)
              : 0;

          return (
            <div
              key={index}
              className="flex flex-col items-center w-[70px] sm:w-[90px] md:w-[120px]"
            >
              {/* Label + Bar Wrapper */}
              <div className="flex flex-col items-center h-[190px]">
                {/* Score Label */}
                <div className="mb-2 text-center">
                  <div className="text-white font-bold text-sm sm:text-base md:text-xl leading-tight">
                    {item.score.toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                    / {item.maxScore}
                  </div>
                </div>

                {/* Vertical Bar Container */}
                <div
                  className="relative flex flex-col justify-end items-center w-[45px] sm:w-[60px] md:w-20"
                  style={{ height: "140px" }}
                >
                  {/* Background Bar */}
                  <div className="absolute bottom-0 w-full h-full bg-slate-700/30 rounded-t-lg" />

                  {/* Actual Score Bar */}
                  <div
                    className="relative w-full rounded-t-lg transition-all duration-700 ease-out flex items-center justify-center"
                    style={{
                      height: `${Math.max(heightPercentage, 5)}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 20px ${accentColor}40`,
                    }}
                  >
                    {heightPercentage > 20 && (
                      <span className="text-[10px] sm:text-xs font-bold text-white">
                        {heightPercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Name */}
              <h3 className="mt-3 text-white font-semibold text-xs sm:text-sm">
                {item.section}
              </h3>

              {/* Stats */}
              <div className="mt-2 text-center space-y-1">
                <div className="text-[10px] sm:text-xs">
                  <span className="text-slate-400">C: </span>
                  <span className="text-green-400 font-semibold">
                    {item.correct}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs">
                  <span className="text-slate-400">W: </span>
                  <span className="text-red-400 font-semibold">
                    {item.wrong}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs">
                  <span className="text-slate-400">Acc: </span>
                  <span className="text-blue-400 font-semibold">
                    {accuracy}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div
        className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t"
        style={{ borderColor }}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {data.reduce((sum, d) => sum + d.correct, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
              Total Correct
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {data.reduce((sum, d) => sum + d.wrong, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
              Total Wrong
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-lg sm:text-2xl font-bold"
              style={{ color: accentColor }}
            >
              {data.reduce((sum, d) => sum + d.score, 0).toFixed(2)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
              Total Score
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-slate-800/30">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">💡</span>
          <div>
            <h4 className="text-white font-medium text-xs sm:text-sm mb-1">
              Performance Tip
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
              {data.reduce((sum, d) => sum + d.score, 0) /
                data.reduce((sum, d) => sum + d.maxScore, 0) >
              0.7
                ? "Excellent performance! Keep up the great work across all sections."
                : data.reduce((sum, d) => sum + d.score, 0) /
                      data.reduce((sum, d) => sum + d.maxScore, 0) >
                    0.5
                  ? "Good effort! Focus on improving accuracy in weaker sections."
                  : "There's room for improvement. Practice more in sections with lower scores."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
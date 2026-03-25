// =============================================================
// FILE: app/omr-reader/components/ResultsGrid.tsx
// Displays extracted answers in a color-coded grid
// =============================================================

"use client";

import { OMRResult } from "../../lib/omr";

interface ResultsGridProps {
  result: OMRResult;
}

export default function ResultsGrid({ result }: ResultsGridProps) {
  const copyToClipboard = () => {
    const text = result.answers
      .map((a) => `${a.questionNumber}. ${a.selectedOption || "Unanswered"}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = () => {
    const csv = [
      "Question,Answer,Confidence",
      ...result.answers.map(
        (a) => `${a.questionNumber},${a.selectedOption || "-"},${a.confidence}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "omr-answers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="rounded-2xl p-6 mt-8"
      style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245, 158, 11, 0.15)" }}
    >
      {/* Header + Actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Extracted Answers</h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-all"
          >
            Copy All
          </button>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400 transition-all"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#050818] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{result.totalDetected}</p>
          <p className="text-xs text-slate-400 mt-1">Total Questions</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{result.totalAnswered}</p>
          <p className="text-xs text-slate-400 mt-1">Answered</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{result.totalUnanswered}</p>
          <p className="text-xs text-slate-400 mt-1">Unanswered</p>
        </div>
      </div>

      {/* Answer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {result.answers.map((answer) => {
          let bgClass = "bg-slate-800 border-slate-700"; // unanswered
          if (answer.selectedOption) {
            if (answer.confidence === "high")
              bgClass = "bg-green-900/30 border-green-500/20";
            else if (answer.confidence === "medium")
              bgClass = "bg-yellow-900/30 border-yellow-500/20";
            else bgClass = "bg-red-900/30 border-red-500/20";
          }

          return (
            <div
              key={answer.questionNumber}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${bgClass}`}
            >
              <span className="text-slate-400 font-mono text-xs">
                {answer.questionNumber}.
              </span>
              <span
                className={`font-bold text-base ${
                  answer.selectedOption ? "text-white" : "text-slate-600"
                }`}
              >
                {answer.selectedOption || "-"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-900/50 border border-green-500/30 inline-block" />
          High confidence
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-900/50 border border-yellow-500/30 inline-block" />
          Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-900/50 border border-red-500/30 inline-block" />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
          Unanswered
        </span>
      </div>
    </div>
  );
}
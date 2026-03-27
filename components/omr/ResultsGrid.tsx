"use client";

import { useState } from "react";
import { OMRResult, OMRConfig, DEFAULT_CONFIG } from "../../lib/omr";

interface ResultsGridProps {
  result: OMRResult;
  originalImage?: string;
  config?: OMRConfig;
}

export default function ResultsGrid({ result, originalImage, config = DEFAULT_CONFIG }: ResultsGridProps) {
  const [answers, setAnswers] = useState(result.answers);
  const [editingQ, setEditingQ] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Dynamic options from config + "-" for unanswered
  const options = [...config.optionLabels, "-"];

  const handleEdit = (questionNumber: number, newAnswer: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionNumber === questionNumber
          ? {
              ...a,
              selectedOption: newAnswer === "-" ? null : newAnswer,
              confidence: "high",
            }
          : a
      )
    );
    setEditingQ(null);
  };

  const totalAnswered = answers.filter((a) => a.selectedOption !== null).length;
  const totalUnanswered = answers.length - totalAnswered;

  const copyToClipboard = () => {
    const text = answers
      .map((a) => `${a.questionNumber}. ${a.selectedOption || "Unanswered"}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = () => {
    const csv = [
      "Question,Answer,Confidence",
      ...answers.map(
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Extracted Answers</h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any answer to edit • Options: {config.optionLabels.join(" / ")}
          </p>
        </div>
        <div className="flex gap-2">
          {originalImage && (
            <button
              onClick={() => { setLightboxOpen(true); setZoom(1); }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-all"
            >
              🔍 View Sheet
            </button>
          )}
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
          <p className="text-3xl font-bold text-amber-500">{answers.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Questions</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{totalAnswered}</p>
          <p className="text-xs text-slate-400 mt-1">Answered</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{totalUnanswered}</p>
          <p className="text-xs text-slate-400 mt-1">Unanswered</p>
        </div>
      </div>

      {/* Answer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {answers.map((answer) => {
          const isEditing = editingQ === answer.questionNumber;

          let bgClass = "bg-slate-800 border-slate-700";
          if (answer.selectedOption) {
            if (answer.confidence === "high")
              bgClass = "bg-green-900/30 border-green-500/20";
            else if (answer.confidence === "medium")
              bgClass = "bg-yellow-900/30 border-yellow-500/20";
            else bgClass = "bg-red-900/30 border-red-500/20";
          }

          return (
            <div key={answer.questionNumber} className="relative">
              {/* Answer cell */}
              <div
                onClick={() =>
                  setEditingQ(editingQ === answer.questionNumber ? null : answer.questionNumber)
                }
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border cursor-pointer hover:border-amber-500/50 hover:scale-105 transition-all ${bgClass} ${
                  isEditing ? "border-amber-500 ring-1 ring-amber-500/50" : ""
                }`}
              >
                <span className="text-slate-400 font-mono text-xs">
                  {answer.questionNumber}.
                </span>
                <span className={`font-bold text-base ${
                  answer.selectedOption ? "text-white" : "text-slate-600"
                }`}>
                  {answer.selectedOption || "-"}
                </span>
                <span className="text-slate-600 text-xs">✎</span>
              </div>

              {/* Edit dropdown */}
              {isEditing && (
                <div
                  className="absolute z-50 top-full left-0 mt-1 rounded-xl overflow-hidden shadow-2xl min-w-max"
                  style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245,158,11,0.4)" }}
                >
                  {/* Question number header */}
                  <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">
                      Q<span className="text-amber-400 font-bold">{answer.questionNumber}</span>
                      {" "}— select answer
                    </p>
                    <span className="text-xs text-slate-600">
                      Current: <span className="text-white font-medium">
                        {answer.selectedOption || "—"}
                      </span>
                    </span>
                  </div>

                  {/* Option buttons — dynamic based on config */}
                  <div
                    className="gap-1 p-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {options.map((opt) => {
                      const isSelected =
                        answer.selectedOption === opt ||
                        (opt === "-" && !answer.selectedOption);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleEdit(answer.questionNumber, opt)}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 ${
                            isSelected
                              ? "bg-amber-500 text-black"
                              : "bg-slate-700 text-white hover:bg-slate-600"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Close on outside click */}
      {editingQ !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setEditingQ(null)} />
      )}

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
        <span className="flex items-center gap-1">
          <span className="text-slate-400">✎</span>
          Click to edit
        </span>
      </div>

      {/* Lightbox */}
      {lightboxOpen && originalImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#0F172B",
              border: "1px solid rgba(245,158,11,0.3)",
              width: "min(90vw, 560px)",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 flex-shrink-0">
              <span className="text-white text-sm font-medium">🔍 OMR Sheet</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition-colors">−</button>
                <span className="text-slate-300 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition-colors">+</button>
                <button onClick={() => setZoom(1)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded-lg">Reset</button>
                <button onClick={() => setLightboxOpen(false)}
                  className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-medium">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <img
                src={originalImage}
                alt="OMR Sheet"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: "transform 0.2s ease",
                  width: zoom <= 1 ? "100%" : "auto",
                  maxWidth: "none",
                }}
                className="rounded-lg"
                draggable={false}
              />
            </div>
            <p className="text-center text-xs text-slate-600 py-2 flex-shrink-0">
              Scroll to pan • Click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { OMRResult, OMRConfig, DEFAULT_CONFIG } from "../../lib/omr";

interface ResultsGridProps {
  result: OMRResult;
  originalImage?: string;
  config?: OMRConfig;
}

const SECTION_SIZE = 50;
const SECTION_LABELS = ["Physics", "Chemistry", "Botany", "Zoology"];

// NEET 200 sheet: 180 attempted (35+10 per subject × 4)
// Section A: Q1-35, 51-85, 101-135, 151-185  → all 35 mandatory
// Section B: Q36-50, 86-100, 136-150, 186-200 → any 10 of 15
const TOTAL_SLOTS = 200;
const EXPECTED_ANSWERED = 180;

export default function ResultsGrid({ result, originalImage, config = DEFAULT_CONFIG }: ResultsGridProps) {
  const [answers, setAnswers] = useState(result.answers);
  const [editingQ, setEditingQ] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeSection, setActiveSection] = useState(0);

  const options = [...config.optionLabels, "-"];

  const handleEdit = (questionNumber: number, newAnswer: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionNumber === questionNumber
          ? { ...a, selectedOption: newAnswer === "-" ? null : newAnswer, confidence: "high" }
          : a
      )
    );
    setEditingQ(null);
  };

  // Pad to 200 slots so all grid positions always exist
  const paddedAnswers = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const qNum = i + 1;
    return (
      answers.find((a) => a.questionNumber === qNum) ?? {
        questionNumber: qNum,
        selectedOption: null,
        confidence: "low" as const,
      }
    );
  });

  const totalAnswered   = paddedAnswers.filter((a) => a.selectedOption !== null).length;
  const totalUnanswered = EXPECTED_ANSWERED - totalAnswered; // how many of 180 are still blank
  const lowConf         = paddedAnswers.filter((a) => a.confidence === "low" && a.selectedOption !== null).length;

  // Section B ranges per subject (15 rows, expect exactly 10 filled)
  const sectionBRanges = [
    { label: "Phy B",  start: 36,  end: 50  },
    { label: "Che B",  start: 86,  end: 100 },
    { label: "Bot B",  start: 136, end: 150 },
    { label: "Zoo B",  start: 186, end: 200 },
  ];

  const sectionBWarnings = sectionBRanges
    .map(({ label, start, end }) => {
      const filled = paddedAnswers
        .slice(start - 1, end)
        .filter((a) => a.selectedOption !== null).length;
      return filled > 10 ? `${label}: ${filled}/10` : null;
    })
    .filter(Boolean);

  // Split into 4 subject sections of 50
  const sections = Array.from({ length: 4 }, (_, i) =>
    paddedAnswers.slice(i * SECTION_SIZE, (i + 1) * SECTION_SIZE)
  );

  const copyToClipboard = () => {
    const text = paddedAnswers
      .map((a) => `${a.questionNumber}. ${a.selectedOption || "Unanswered"}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = () => {
    const csv = [
      "Question,Answer,Confidence",
      ...paddedAnswers.map((a) => `${a.questionNumber},${a.selectedOption || "-"},${a.confidence}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "omr-answers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSectionStats = (sectionAnswers: typeof paddedAnswers) => {
    const answered = sectionAnswers.filter((a) => a.selectedOption !== null).length;
    const low      = sectionAnswers.filter((a) => a.confidence === "low" && a.selectedOption !== null).length;
    // Section B block for this subject (last 15 of the 50)
    const secBFilled = sectionAnswers.slice(35).filter((a) => a.selectedOption !== null).length;
    const secBWarn   = secBFilled > 10;
    return { answered, low, total: sectionAnswers.length, secBFilled, secBWarn };
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
            180 attempted of 200 slots • Click any cell to edit
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {originalImage && (
            <button
              onClick={() => { setLightboxOpen(true); setZoom(1); }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-all"
            >
              🔍 View Sheet
            </button>
          )}
          <button onClick={copyToClipboard}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-all">
            Copy All
          </button>
          <button onClick={downloadCSV}
            className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400 transition-all">
            Download CSV
          </button>
        </div>
      </div>

      {/* Section B over-fill warnings */}
      {sectionBWarnings.length > 0 && (
        <div className="mb-4 rounded-xl px-4 py-3 flex items-start gap-2"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span className="text-red-400 text-sm mt-0.5">⚠</span>
          <div>
            <p className="text-red-400 text-sm font-semibold">Section B over-filled — bcz of photo quality or lighting:</p>
            <p className="text-red-300 text-xs mt-0.5">
              {sectionBWarnings.join(" · ")} — each Section B allows max 10 answers
            </p>
          </div>
        </div>
      )}

      {/* Stats — shows 180 context */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-[#050818] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{totalAnswered}</p>
          <p className="text-xs text-slate-400 mt-1">Answered</p>
          <p className="text-[10px] text-slate-600 mt-0.5">of 180 expected</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-3 text-center">
          <p className={`text-2xl font-bold ${totalUnanswered > 0 ? "text-orange-400" : "text-green-400"}`}>
            {Math.max(0, totalUnanswered)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Missing</p>
          <p className="text-[10px] text-slate-600 mt-0.5">of 180 expected</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-500">
            {paddedAnswers.filter((a) => a.selectedOption === null).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Blank slots</p>
          <p className="text-[10px] text-slate-600 mt-0.5">of 200 total</p>
        </div>
        <div className="bg-[#050818] rounded-xl p-3 text-center">
          <p className={`text-2xl font-bold ${lowConf > 0 ? "text-red-400" : "text-green-400"}`}>
            {lowConf}
          </p>
          <p className="text-xs text-slate-400 mt-1">Low Conf</p>
          <p className="text-[10px] text-slate-600 mt-0.5">review needed</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {sections.map((sectionAnswers, idx) => {
          const start = idx * SECTION_SIZE + 1;
          const end   = (idx + 1) * SECTION_SIZE;
          const { answered, low, total, secBFilled, secBWarn } = getSectionStats(sectionAnswers);
          const isActive = activeSection === idx;
          return (
            <button key={idx} onClick={() => setActiveSection(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? "bg-amber-500 text-black border-amber-500"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/50"
              }`}
            >
              <span className="font-bold">{SECTION_LABELS[idx]}</span>
              <span className={`ml-1.5 text-xs ${isActive ? "text-black/70" : "text-slate-500"}`}>
                {start}–{end}
              </span>
              <span className={`ml-1 text-xs ${isActive ? "text-black/60" : "text-slate-600"}`}>
                {answered}/45
              </span>
              {secBWarn && (
                <span className="ml-1 text-xs text-red-400" title={`Sec B: ${secBFilled}/10`}>⚠B</span>
              )}
              {low > 0 && !secBWarn && (
                <span className="ml-1 text-xs text-yellow-400">⚠{low}</span>
              )}
            </button>
          );
        })}
        <button onClick={() => setActiveSection(-1)}
          className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            activeSection === -1
              ? "bg-amber-500 text-black border-amber-500"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/50"
          }`}
        >
          All 200
        </button>
      </div>

      {/* Answer Grid */}
      {activeSection === -1 ? (
        <div className="space-y-6">
          {sections.map((sectionAnswers, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                  {SECTION_LABELS[idx]}
                </span>
                <span className="text-xs text-slate-600">
                  Q{idx * SECTION_SIZE + 1}–{(idx + 1) * SECTION_SIZE}
                </span>
                <span className="text-xs text-slate-700">· Sec A: 35 · Sec B: 10/15</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <AnswerGrid
                sectionAnswers={sectionAnswers}
                sectionStartQ={idx * SECTION_SIZE + 1}
                options={options}
                editingQ={editingQ}
                setEditingQ={setEditingQ}
                handleEdit={handleEdit}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              {SECTION_LABELS[activeSection]}
            </span>
            <span className="text-xs text-slate-600">
              Q{activeSection * SECTION_SIZE + 1}–{(activeSection + 1) * SECTION_SIZE}
            </span>
            <span className="text-xs text-slate-700">· Sec A: first 35 · Sec B: last 15 (10 filled)</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
          <AnswerGrid
            sectionAnswers={sections[activeSection]}
            sectionStartQ={activeSection * SECTION_SIZE + 1}
            options={options}
            editingQ={editingQ}
            setEditingQ={setEditingQ}
            handleEdit={handleEdit}
          />
        </div>
      )}

      {editingQ !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setEditingQ(null)} />
      )}

      {/* Legend */}
      <div className="mt-6 flex gap-4 justify-center flex-wrap text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-900/50 border border-green-500/30 inline-block" />High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-900/50 border border-yellow-500/30 inline-block" />Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-900/50 border border-red-500/30 inline-block" />Low conf
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />Unanswered
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-blue-900/50 border border-blue-500/30 inline-block" />Sec B slot
        </span>
        <span className="flex items-center gap-1">
          <span className="text-amber-400 text-[10px]">✎</span>Click to edit
        </span>
      </div>

      {/* Lightbox */}
      {lightboxOpen && originalImage && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}>
          <div className="flex flex-col rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245,158,11,0.3)", width: "min(90vw, 560px)", maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 flex-shrink-0">
              <span className="text-white text-sm font-medium">🔍 OMR Sheet</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm">−</button>
                <span className="text-slate-300 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(5, z + 0.25))} className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm">+</button>
                <button onClick={() => setZoom(1)} className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded-lg">Reset</button>
                <button onClick={() => setLightboxOpen(false)} className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-medium">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <img src={originalImage} alt="OMR Sheet"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease", width: zoom <= 1 ? "100%" : "auto", maxWidth: "none" }}
                className="rounded-lg" draggable={false} />
            </div>
            <p className="text-center text-xs text-slate-600 py-2 flex-shrink-0">Scroll to pan • Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AnswerGrid ────────────────────────────────────────────────────────────────

interface AnswerGridProps {
  sectionAnswers: { questionNumber: number; selectedOption: string | null; confidence: string }[];
  sectionStartQ: number;  // e.g. 1, 51, 101, 151
  options: string[];
  editingQ: number | null;
  setEditingQ: (q: number | null) => void;
  handleEdit: (questionNumber: number, newAnswer: string) => void;
}

function AnswerGrid({ sectionAnswers, sectionStartQ, options, editingQ, setEditingQ, handleEdit }: AnswerGridProps) {
  // Section B starts at offset 35 within each subject's 50-question block
  const secBStartQ = sectionStartQ + 35;

  return (
    <div className="space-y-2">
      {/* Section A label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
          Sec A — Q{sectionStartQ}–{sectionStartQ + 34} (all 35 mandatory)
        </span>
        <div className="flex-1 h-px bg-slate-800/50" />
      </div>

      {/* Section A grid — Q1–35 of this subject */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1.5 mb-3">
        {sectionAnswers.slice(0, 35).map((answer) => (
          <AnswerCell
            key={answer.questionNumber}
            answer={answer}
            isSecB={false}
            options={options}
            editingQ={editingQ}
            setEditingQ={setEditingQ}
            handleEdit={handleEdit}
          />
        ))}
      </div>

      {/* Section B label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-blue-400/70 uppercase tracking-widest font-semibold">
          Sec B — Q{secBStartQ}–{secBStartQ + 14} (attempt any 10 of 15)
        </span>
        <div className="flex-1 h-px bg-blue-900/30" />
        <span className="text-[10px] text-blue-400/50">
          {sectionAnswers.slice(35).filter((a) => a.selectedOption !== null).length}/10 filled
        </span>
      </div>

      {/* Section B grid — Q36–50 of this subject */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1.5">
        {sectionAnswers.slice(35).map((answer) => (
          <AnswerCell
            key={answer.questionNumber}
            answer={answer}
            isSecB={true}
            options={options}
            editingQ={editingQ}
            setEditingQ={setEditingQ}
            handleEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}

// ── AnswerCell ────────────────────────────────────────────────────────────────

interface AnswerCellProps {
  answer: { questionNumber: number; selectedOption: string | null; confidence: string };
  isSecB: boolean;
  options: string[];
  editingQ: number | null;
  setEditingQ: (q: number | null) => void;
  handleEdit: (questionNumber: number, newAnswer: string) => void;
}

function AnswerCell({ answer, isSecB, options, editingQ, setEditingQ, handleEdit }: AnswerCellProps) {
  const isEditing  = editingQ === answer.questionNumber;
  const isAnswered = answer.selectedOption !== null;

  let bgClass = isSecB
    ? "bg-blue-950/30 border-blue-900/40"   // Section B unanswered — subtle blue tint
    : "bg-slate-800/60 border-slate-700/50"; // Section A unanswered

  if (isAnswered) {
    if (answer.confidence === "high")        bgClass = "bg-green-900/30 border-green-500/20";
    else if (answer.confidence === "medium") bgClass = "bg-yellow-900/30 border-yellow-500/20";
    else                                     bgClass = "bg-red-900/30 border-red-500/20";
  }

  return (
    <div className="relative">
      <div
        onClick={() => setEditingQ(editingQ === answer.questionNumber ? null : answer.questionNumber)}
        className={`group flex flex-col items-center justify-center px-1 pt-2 pb-1.5 rounded-lg border cursor-pointer hover:border-amber-500/60 hover:scale-105 transition-all ${bgClass} ${
          isEditing ? "border-amber-500 ring-1 ring-amber-500/50" : ""
        }`}
      >
        <span className="text-slate-500 font-mono text-[9px] leading-none mb-0.5">
          {answer.questionNumber}
        </span>
        <span className={`font-bold text-sm leading-none ${isAnswered ? "text-white" : "text-slate-600"}`}>
          {answer.selectedOption || "—"}
        </span>
        <span className={`text-[8px] leading-none mt-0.5 transition-colors ${
          isEditing ? "text-amber-400" : "text-slate-700 group-hover:text-amber-500/70"
        }`}>✎</span>
      </div>

      {isEditing && (
        <div className="absolute z-50 top-full left-0 mt-1 rounded-xl overflow-hidden shadow-2xl min-w-max"
          style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245,158,11,0.4)" }}>
          <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Q<span className="text-amber-400 font-bold">{answer.questionNumber}</span>
              {isSecB && <span className="ml-1 text-blue-400 text-[10px]">Sec B</span>}
            </p>
            <span className="text-xs text-slate-600">
              Now: <span className="text-white font-medium">{answer.selectedOption || "—"}</span>
            </span>
          </div>
          <div className="gap-1 p-2"
            style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            {options.map((opt) => {
              const isSelected = answer.selectedOption === opt || (opt === "-" && !answer.selectedOption);
              return (
                <button key={opt} onClick={() => handleEdit(answer.questionNumber, opt)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 ${
                    isSelected ? "bg-amber-500 text-black" : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
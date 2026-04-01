"use client";

import { OMRConfig } from "../../lib/omr";

interface SheetConfigProps {
  config: OMRConfig;
  onChange: (config: OMRConfig) => void;
  disabled?: boolean;
}

const NEET_ABCD: Partial<OMRConfig> = {
  totalQuestions: 120,
  optionsPerQuestion: 4,
  optionLabels: ["A", "B", "C", "D"],
};

const NEET_1234: Partial<OMRConfig> = {
  totalQuestions: 120,
  optionsPerQuestion: 4,
  optionLabels: ["1", "2", "3", "4"],
};

export default function SheetConfig({ config, onChange, disabled }: SheetConfigProps) {
  const isABCD = config.optionLabels[0] === "A";

  return (
    <div
      className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
      style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245, 158, 11, 0.15)" }}
    >
      <div>
        <p className="text-sm font-semibold text-white">NEET OMR — 120 Questions</p>
        <p className="text-xs text-slate-500 mt-0.5">4 columns × 30 rows · 4 options per question</p>
      </div>

      {/* Toggle: ABCD vs 1234 */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700">
        {[NEET_ABCD, NEET_1234].map((preset) => {
          const label = preset.optionLabels![0] === "A" ? "A / B / C / D" : "1 / 2 / 3 / 4";
          const active = isABCD === (preset.optionLabels![0] === "A");
          return (
            <button
              key={label}
              disabled={disabled}
              onClick={() => onChange({ ...config, ...preset } as OMRConfig)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? "bg-amber-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
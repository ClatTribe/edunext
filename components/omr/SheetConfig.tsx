// =============================================================
// FILE: app/omr-reader/components/SheetConfig.tsx
// Configurable question count + options selector
// =============================================================

"use client";

import { OMRConfig, QUESTION_PRESETS } from "../../lib/omr";

interface SheetConfigProps {
  config: OMRConfig;
  onChange: (config: OMRConfig) => void;
  disabled?: boolean;
}

const OPTION_SETS = [
  { n: 4, labels: ["A", "B", "C", "D"], display: "4 (A/B/C/D)" },
  { n: 5, labels: ["A", "B", "C", "D", "E"], display: "5 (A/B/C/D/E)" },
];

export default function SheetConfig({ config, onChange, disabled }: SheetConfigProps) {
  return (
    <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
      <h2 className="text-lg font-semibold text-white mb-4">Sheet Configuration</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Questions */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Total Questions</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {QUESTION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                disabled={disabled}
                onClick={() => onChange({ ...config, totalQuestions: preset.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  config.totalQuestions === preset.value
                    ? "bg-amber-500 text-black"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                } disabled:opacity-50`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={300}
              value={config.totalQuestions}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...config, totalQuestions: parseInt(e.target.value) || 120 })
              }
              className="w-28 px-3 py-2 rounded-lg bg-[#050818] text-white border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              placeholder="Custom"
            />
            <span className="text-xs text-slate-500">or type custom count</span>
          </div>
        </div>

        {/* Options Per Question */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Options per Question</label>
          <div className="flex gap-2">
            {OPTION_SETS.map((opt) => (
              <button
                key={opt.n}
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...config,
                    optionsPerQuestion: opt.n,
                    optionLabels: opt.labels,
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.optionsPerQuestion === opt.n
                    ? "bg-amber-500 text-black"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                } disabled:opacity-50`}
              >
                {opt.display}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
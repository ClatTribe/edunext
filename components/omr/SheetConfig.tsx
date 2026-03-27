"use client";

import { SHEET_TYPE_PRESETS, QUESTION_PRESETS, OMRConfig } from "../../lib/omr";

interface SheetConfigProps {
  config: OMRConfig;
  onChange: (config: OMRConfig) => void;
  disabled?: boolean;
}

export default function SheetConfig({ config, onChange, disabled }: SheetConfigProps) {
  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245, 158, 11, 0.15)" }}
    >
      <h2 className="text-lg font-semibold text-white mb-4">Sheet Configuration</h2>

      <div className="flex flex-col gap-6">

        {/* Sheet Type */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Sheet Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SHEET_TYPE_PRESETS.map((preset) => {
              const isActive =
                JSON.stringify(config.optionLabels) ===
                JSON.stringify([...preset.optionLabels]);
              return (
                <button
                  key={preset.id}
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...config,
                      optionsPerQuestion: preset.optionsPerQuestion,
                      optionLabels: [...preset.optionLabels],
                    })
                  }
                  className={`px-3 py-2 rounded-lg text-left transition-all border ${
                    isActive
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <p className="font-semibold text-xs">{preset.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

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
              <span className="text-xs text-slate-500">or type custom</span>
            </div>
          </div>

          {/* Current Config Summary */}
          {/* <div>
            <label className="block text-sm text-slate-400 mb-2">Current Setup</label>
            <div
              className="rounded-xl p-4 h-full flex flex-col justify-center gap-2"
              style={{ backgroundColor: "#050818", border: "1px solid rgba(245,158,11,0.1)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Questions</span>
                <span className="text-amber-400 font-bold text-sm">
                  {config.totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Options</span>
                <span className="text-amber-400 font-bold text-sm">
                  {config.optionLabels.join(" / ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Bubbles</span>
                <span className="text-amber-400 font-bold text-sm">
                  {config.totalQuestions * config.optionsPerQuestion}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
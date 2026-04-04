"use client";

import { OMRConfig, NEET_200_CONFIG } from "../../lib/omr";

interface SheetConfigProps {
  config: OMRConfig;
  onChange: (config: OMRConfig) => void;
  disabled?: boolean;
}

type FormatKey = "200-ABCD" | "200-1234";

const PRESETS: Record<FormatKey, { label: string; sub: string; config: OMRConfig }> = {
  "200-ABCD": {
    label: "200 Q  —  A / B / C / D",
    sub: "4 subjects · Sec-A 35 + Sec-B 10/15",
    config: { ...NEET_200_CONFIG, optionLabels: ["A", "B", "C", "D"] },
  },
  "200-1234": {
    label: "200 Q  —  1 / 2 / 3 / 4",
    sub: "4 subjects · Sec-A 35 + Sec-B 10/15",
    config: { ...NEET_200_CONFIG, optionLabels: ["1", "2", "3", "4"] },
  },
};

function getActiveKey(config: OMRConfig): FormatKey {
  const o = config.optionLabels[0] === "1" ? "1234" : "ABCD";
  return `200-${o}` as FormatKey;
}

export default function SheetConfig({ config, onChange, disabled }: SheetConfigProps) {
  const activeKey = getActiveKey(config);

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ backgroundColor: "#0F172B", border: "1px solid rgba(245, 158, 11, 0.15)" }}
    >
      <p className="text-sm font-semibold text-white mb-3">Sheet Format</p>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(PRESETS) as [FormatKey, typeof PRESETS[FormatKey]][]).map(
          ([key, preset]) => {
            const active = activeKey === key;
            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => onChange(preset.config)}
                className={`rounded-xl px-4 py-3 text-left transition-all border ${
                  active
                    ? "bg-amber-500 border-amber-400 text-black"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <p className="text-sm font-semibold leading-tight">{preset.label}</p>
                <p className={`text-xs mt-0.5 ${active ? "text-black/70" : "text-slate-500"}`}>
                  {preset.sub}
                </p>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
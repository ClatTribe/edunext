import React, { useState } from "react";
import CuetCutoffTable from "./CuetCutoffTable";

const yearsData = {
  cuet: {
    name: "CUET",
    years: [2025, 2024, 2023],
  },
};

const UnifiedCutoffsPage = () => {
  const [selectedExam] = useState<keyof typeof yearsData>("cuet");
  const [selectedYear, setSelectedYear] = useState(2025);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 mb-4">
            CUET
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Cutoff <span className="text-emerald-400">Analysis</span>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-800/50">
            <label className="block text-sm font-bold mb-4 text-slate-300 uppercase tracking-wider">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-6 py-4 rounded-xl border-2 bg-slate-800/80 text-white font-semibold text-lg"
              style={{ borderColor: "#F59E0B" }}
            >
              {yearsData[selectedExam].years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <div className="rounded-2xl p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800/50">
            <p className="text-center text-base text-slate-300">
              <span className="font-bold text-amber-400">Currently Viewing:</span>{" "}
              <span className="text-white font-semibold">
                {yearsData[selectedExam].name} - {selectedYear}
              </span>
            </p>
          </div>
        </div>

        <CuetCutoffTable selectedYear={selectedYear} />
      </div>
    </div>
  );
};

export default UnifiedCutoffsPage;

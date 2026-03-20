import React, { useState } from "react";
import NEETCutoffTable from "./Neetadvancedcutofftable";
 
const primaryColor = "#F59E0B"; // Amber/Orange
const secondaryColor = "#10B981"; // Emerald
const accentColor = "#F59E0B"; // Amber
 
// Define available years for NEET
const neetYearsData = {
  neet_ug: {
    name: "NEET UG",
    years: [2025, 2024, 2023, 2022, 2021, 2020],
  },
};
 
const UnifiedNEETCutoffsPage = () => {
  const [selectedExam] = useState<keyof typeof neetYearsData>("neet_ug");
  const [selectedYear, setSelectedYear] = useState(2025);
 
  // Render the appropriate component based on selection
  const renderCutoffComponent = () => {
    return <NEETCutoffTable selectedYear={selectedYear} />;
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Animated Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 mb-4 relative animate-fade-in">
            NEET UG
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white relative">
            Cutoff <span style={{ color: secondaryColor }}>Analysis</span>
          </h2>
          <p className="text-slate-400 text-sm mt-3 font-medium tracking-wide">
            Historical Data & Trends • 2020-2025
          </p>
 
          {/* Decorative Line */}
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
          </div>
        </div>
 
        {/* Year Selector with Modern Design */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-800/50">
            <label className="block text-sm font-bold mb-4 text-slate-300 uppercase tracking-wider">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all bg-slate-800/80 text-white font-semibold text-lg cursor-pointer hover:bg-slate-800 shadow-lg"
              style={{
                borderColor: primaryColor,
              }}
            >
              {neetYearsData[selectedExam].years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
 
        {/* Info Card with Gradient Border */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative rounded-2xl p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800/50">
              <p className="text-center text-base text-slate-300">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Currently Viewing:
                </span>{" "}
                <span className="text-white font-semibold">
                  {neetYearsData[selectedExam].name} - {selectedYear}
                </span>
              </p>
            </div>
          </div>
        </div>
 
        {/* Render Selected Component */}
        <div className="animate-fade-in">{renderCutoffComponent()}</div>
      </div>
 
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
 
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};
 
export default UnifiedNEETCutoffsPage;
 
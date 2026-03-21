import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const yearlyData = {
  2025: {
    cutoffs: [
      { category: "General", score: 98.0 },
      { category: "OBC", score: 95.5 },
      { category: "SC", score: 90.0 },
      { category: "ST", score: 86.5 },
      { category: "EWS", score: 94.0 },
    ],
  },
  2024: {
    cutoffs: [
      { category: "General", score: 97.2 },
      { category: "OBC", score: 94.7 },
      { category: "SC", score: 89.1 },
      { category: "ST", score: 85.4 },
      { category: "EWS", score: 93.2 },
    ],
  },
  2023: {
    cutoffs: [
      { category: "General", score: 96.5 },
      { category: "OBC", score: 93.8 },
      { category: "SC", score: 88.0 },
      { category: "ST", score: 84.1 },
      { category: "EWS", score: 92.1 },
    ],
  },
} as const;

const trendData = [
  { year: "2023", General: 96.5, OBC: 93.8, SC: 88.0, ST: 84.1, EWS: 92.1 },
  { year: "2024", General: 97.2, OBC: 94.7, SC: 89.1, ST: 85.4, EWS: 93.2 },
  { year: "2025", General: 98.0, OBC: 95.5, SC: 90.0, ST: 86.5, EWS: 94.0 },
];

type YearKey = keyof typeof yearlyData;

type Props = {
  selectedYear?: number | YearKey;
};

const CuetCutoffTable = ({ selectedYear = 2025 }: Props) => {
  const yearKey = (selectedYear as YearKey) in yearlyData ? (selectedYear as YearKey) : (2025 as YearKey);
  const currentData = yearlyData[yearKey];

  return (
    <div className="space-y-8">
      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
        <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
          Category-wise CUET Cutoff Snapshot - {yearKey}
        </h2>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={currentData.cutoffs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="category" tick={{ fill: "#cbd5e1", fontSize: 13, fontWeight: 600 }} />
            <YAxis tick={{ fill: "#cbd5e1", fontSize: 13 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="Indicative Percentile" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
        <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          CUET Cutoff Trend (2023-2025)
        </h2>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="year" tick={{ fill: "#cbd5e1", fontSize: 13, fontWeight: 600 }} />
            <YAxis tick={{ fill: "#cbd5e1", fontSize: 13 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="General" stroke="#F59E0B" strokeWidth={3} />
            <Line type="monotone" dataKey="EWS" stroke="#FBBF24" strokeWidth={3} />
            <Line type="monotone" dataKey="OBC" stroke="#10B981" strokeWidth={3} />
            <Line type="monotone" dataKey="SC" stroke="#F97316" strokeWidth={3} />
            <Line type="monotone" dataKey="ST" stroke="#EF4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CuetCutoffTable;

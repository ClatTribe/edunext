import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
 
const primaryColor = '#F59E0B'; // Amber/Orange
const secondaryColor = '#10B981'; // Emerald
const accentYellow = '#FBBF24'; // Yellow
const accentOrange = '#F97316'; // Orange
const accentRed = '#EF4444'; // Red
 
// NEET UG Qualifying Cutoff Marks (out of 720)
const yearlyData = {
  2025: {
    cutoffs: [
      { category: 'General (UR)', score: 164 },
      { category: 'Gen-EWS', score: 164 },
      { category: 'OBC-NCL', score: 129 },
      { category: 'SC', score: 129 },
      { category: 'ST', score: 129 },
      { category: 'PwD (UR)', score: 129 },
    ]
  },
  2024: {
    cutoffs: [
      { category: 'General (UR)', score: 164 },
      { category: 'Gen-EWS', score: 164 },
      { category: 'OBC-NCL', score: 129 },
      { category: 'SC', score: 129 },
      { category: 'ST', score: 129 },
      { category: 'PwD (UR)', score: 129 },
    ]
  },
  2023: {
    cutoffs: [
      { category: 'General (UR)', score: 137 },
      { category: 'Gen-EWS', score: 137 },
      { category: 'OBC-NCL', score: 107 },
      { category: 'SC', score: 107 },
      { category: 'ST', score: 107 },
      { category: 'PwD (UR)', score: 107 },
    ]
  },
  2022: {
    cutoffs: [
      { category: 'General (UR)', score: 117 },
      { category: 'Gen-EWS', score: 117 },
      { category: 'OBC-NCL', score: 93 },
      { category: 'SC', score: 93 },
      { category: 'ST', score: 93 },
      { category: 'PwD (UR)', score: 93 },
    ]
  },
  2021: {
    cutoffs: [
      { category: 'General (UR)', score: 138 },
      { category: 'Gen-EWS', score: 138 },
      { category: 'OBC-NCL', score: 108 },
      { category: 'SC', score: 108 },
      { category: 'ST', score: 108 },
      { category: 'PwD (UR)', score: 108 },
    ]
  },
  2020: {
    cutoffs: [
      { category: 'General (UR)', score: 147 },
      { category: 'Gen-EWS', score: 147 },
      { category: 'OBC-NCL', score: 113 },
      { category: 'SC', score: 113 },
      { category: 'ST', score: 113 },
      { category: 'PwD (UR)', score: 113 },
    ]
  },
};
 
// Trend data for line chart
const trendData = [
  { year: '2020', 'General': 147, 'EWS': 147, 'OBC': 113, 'SC': 113, 'ST': 113 },
  { year: '2021', 'General': 138, 'EWS': 138, 'OBC': 108, 'SC': 108, 'ST': 108 },
  { year: '2022', 'General': 117, 'EWS': 117, 'OBC': 93, 'SC': 93, 'ST': 93 },
  { year: '2023', 'General': 137, 'EWS': 137, 'OBC': 107, 'SC': 107, 'ST': 107 },
  { year: '2024', 'General': 164, 'EWS': 164, 'OBC': 129, 'SC': 129, 'ST': 129 },
  { year: '2025', 'General': 164, 'EWS': 164, 'OBC': 129, 'SC': 129, 'ST': 129 },
];
 
type YearKey = keyof typeof yearlyData;
 
type NEETCutoffTableProps = {
  selectedYear?: number | YearKey;
};
 
const NEETCutoffTable = ({
  selectedYear = 2025,
}: NEETCutoffTableProps) => {
  const yearKey = (selectedYear as YearKey) in yearlyData
    ? (selectedYear as YearKey)
    : (2025 as YearKey);
  const currentData = yearlyData[yearKey];
 
  type TooltipPayloadEntry = {
    color?: string;
    dataKey?: string;
    name?: string;
    value?: unknown;
  };
 
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border-2 border-amber-500">
          <p className="font-bold mb-2 text-amber-400 text-base">
            {label || payload[0]?.name}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm font-semibold"
              style={{ color: entry.color ?? undefined }}
            >
              {entry.dataKey || entry.name}:{" "}
              {typeof entry.value === "number"
                ? entry.value
                : String(entry.value ?? "")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
 
  return (
    <div className="space-y-8">
      {/* Bar Chart Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
          <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            Category-wise Qualifying Cutoff - {yearKey}
          </h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={currentData.cutoffs} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
                angle={-25}
                textAnchor="end"
                height={100}
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 13 }}
                label={{
                  value: 'Marks (out of 720)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#fbbf24', fontSize: 14, fontWeight: 'bold' }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar
                dataKey="score"
                name="Cutoff Marks"
                fill="url(#barGradient)"
                radius={[12, 12, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Trend Line Chart */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
          <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            NEET UG Cutoff Trends (2020-2025)
          </h2>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="year"
                tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 13 }}
                label={{
                  value: 'Marks (out of 720)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#34d399', fontSize: 14, fontWeight: 'bold' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line type="monotone" dataKey="General" stroke={primaryColor} strokeWidth={3} dot={{ r: 6, fill: primaryColor }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="EWS" stroke={accentYellow} strokeWidth={3} dot={{ r: 6, fill: accentYellow }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="OBC" stroke={secondaryColor} strokeWidth={3} dot={{ r: 6, fill: secondaryColor }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="SC" stroke={accentOrange} strokeWidth={3} dot={{ r: 6, fill: accentOrange }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="ST" stroke={accentRed} strokeWidth={3} dot={{ r: 6, fill: accentRed }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Detailed Cutoff Table */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-800/50">
          <div className="p-8 border-b border-slate-800/50 bg-slate-900/80">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              NEET UG {yearKey} - Qualifying Cutoff
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">Official Category-wise Qualifying Marks (out of 720)</p>
          </div>
 
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900">
                  <th className="px-8 py-5 text-left text-white font-black text-base tracking-wide border-r border-slate-700">
                    Category
                  </th>
                  <th className="px-8 py-5 text-center text-white font-black text-base tracking-wide">
                    Qualifying Marks
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.cutoffs.map((row, index) => (
                  <tr
                    key={row.category}
                    className={`border-b border-slate-800/50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'
                    } hover:bg-slate-800/60`}
                  >
                    <td className="px-8 py-5 font-bold text-slate-100 text-base border-r border-slate-800/50">
                      {row.category}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-block px-4 py-2 font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                        {row.score} / 720
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 
      {/* Footer Note */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 rounded-xl blur opacity-20"></div>
        <div className="relative p-6 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-800/50">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Note:</span> All cutoff marks are based on official NEET UG data released by NTA.
            These are qualifying cutoffs — the minimum marks required to be eligible for counselling. Actual admission cutoffs for top colleges like AIIMS Delhi are significantly higher (700+).
            PwD (Persons with Disabilities) category has special provisions with separate cutoff criteria.
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default NEETCutoffTable;
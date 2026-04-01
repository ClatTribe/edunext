import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const primaryColor = '#F59E0B'; // Amber/Orange
const secondaryColor = '#10B981'; // Emerald
const accentYellow = '#FBBF24'; // Yellow
const accentOrange = '#F97316'; // Orange
const accentRed = '#EF4444'; // Red

// Data from the Excel screenshot
const yearlyData = {
  2025: {
    cutoffs: [
      { category: 'General (UR)', score: 93.1023262 },
      { category: 'Gen-EWS', score: 80.3830119 },
      { category: 'OBC-NCL', score: 79.4313582 },
      { category: 'SC', score: 61.1526933 },
      { category: 'ST', score: 47.9026465 },
      { category: 'PwD', score: 0.0079349 },
    ]
  },
  2024: {
    cutoffs: [
      { category: 'General (UR)', score: 93.2362181 },
      { category: 'Gen-EWS', score: 81.3265412 },
      { category: 'OBC-NCL', score: 79.6757881 },
      { category: 'SC', score: 60.0923182 },
      { category: 'ST', score: 46.697584 },
      { category: 'PwD', score: 0.00187 },
    ]
  },
  2023: {
    cutoffs: [
      { category: 'General (UR)', score: 90.7788642 },
      { category: 'Gen-EWS', score: 75.6229025 },
      { category: 'OBC-NCL', score: 73.6114227 },
      { category: 'SC', score: 51.9776027 },
      { category: 'ST', score: 37.2348772 },
      { category: 'PwD', score: 0.0013527 },
    ]
  },
  2022: {
    cutoffs: [
      { category: 'General (UR)', score: 88.4121383 },
      { category: 'Gen-EWS', score: 63.1114141 },
      { category: 'OBC-NCL', score: 67.0090297 },
      { category: 'SC', score: 43.0820954 },
      { category: 'ST', score: 26.7771328 },
      { category: 'PwD', score: 0.0031029 },
    ]
  },
  2021: {
    cutoffs: [
      { category: 'General (UR)', score: 87.8992241 },
      { category: 'Gen-EWS', score: 66.2214845 },
      { category: 'OBC-NCL', score: 68.0234447 },
      { category: 'SC', score: 46.8825338 },
      { category: 'ST', score: 34.6728999 },
      { category: 'PwD', score: 0.0096375 },
    ]
  },
  2020: {
    cutoffs: [
      { category: 'General (UR)', score: 90.3765335 },
      { category: 'Gen-EWS', score: 70.2435518 },
      { category: 'OBC-NCL', score: 72.8887969 },
      { category: 'SC', score: 50.1760245 },
      { category: 'ST', score: 39.0696101 },
      { category: 'PwD', score: 0.0618524 },
    ]
  },
};

// Trend data for line chart
const trendData = [
  { year: '2020', 'General': 90.38, 'EWS': 70.24, 'OBC': 72.89, 'SC': 50.18, 'ST': 39.07 },
  { year: '2021', 'General': 87.90, 'EWS': 66.22, 'OBC': 68.02, 'SC': 46.88, 'ST': 34.67 },
  { year: '2022', 'General': 88.41, 'EWS': 63.11, 'OBC': 67.01, 'SC': 43.08, 'ST': 26.78 },
  { year: '2023', 'General': 90.78, 'EWS': 75.62, 'OBC': 73.61, 'SC': 51.98, 'ST': 37.23 },
  { year: '2024', 'General': 93.24, 'EWS': 81.33, 'OBC': 79.68, 'SC': 60.09, 'ST': 46.70 },
  { year: '2025', 'General': 93.10, 'EWS': 80.38, 'OBC': 79.43, 'SC': 61.15, 'ST': 47.90 },
];

type YearKey = keyof typeof yearlyData;

type JEEAdvancedCutoffTableProps = {
  selectedYear?: number | YearKey;
};

const JEEAdvancedCutoffTable = ({
  selectedYear = 2025,
}: JEEAdvancedCutoffTableProps) => {
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
                ? entry.value.toFixed(2)
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
            Category-wise Cutoff Distribution - {yearKey}
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
                  value: 'Percentile Score', 
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
                name="Cutoff Percentile" 
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
            Cutoff Trends Across Years (2020-2025)
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
                  value: 'Percentile', 
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
              JEE Advanced {yearKey} - Detailed Cutoff
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">Official Category-wise Percentile Scores</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900">
                  <th className="px-8 py-5 text-left text-white font-black text-base tracking-wide border-r border-slate-700">
                    Category
                  </th>
                  <th className="px-8 py-5 text-center text-white font-black text-base tracking-wide">
                    Cut-off Percentile
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
                        {row.score.toFixed(2)}
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
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Note:</span> All cutoff percentiles are based on official JEE Advanced data released by IIT. 
            The cutoffs represent the minimum percentile scores required for admission across different categories. 
            PwD (Persons with Disabilities) category has special provisions with separate cutoff criteria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JEEAdvancedCutoffTable;
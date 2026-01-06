import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';
const accentPurple = '#9B59B6';
const accentGreen = '#48C9B0';

// Data for all years
const yearlyData = {
  2025: [
    { category: 'General', score: 177 },
    { category: 'EWS', score: 138 },
    { category: 'OBC', score: 120 },
    { category: 'SC', score: 95 },
    { category: 'ST', score: 49 },
    { category: 'PwD/DAP', score: 62 },
  ],
  2024: [
    { category: 'General', score: 186 },
    { category: 'EWS', score: 155 },
    { category: 'OBC', score: 130 },
    { category: 'SC', score: 98 },
    { category: 'ST', score: 60 },
    { category: 'PwD/DAP', score: 23 },
  ],
  2023: [
    { category: 'General', score: 187 },
    { category: 'EWS', score: 153 },
    { category: 'OBC', score: 131 },
    { category: 'SC', score: 90 },
    { category: 'ST', score: 43 },
    { category: 'PwD/DAP', score: 34 },
  ],
};

// Trend data for line chart
const trendData = [
  { year: '2023', General: 187, EWS: 153, OBC: 131, SC: 90, ST: 43, 'PwD/DAP': 34 },
  { year: '2024', General: 186, EWS: 155, OBC: 130, SC: 98, ST: 60, 'PwD/DAP': 23 },
  { year: '2025', General: 177, EWS: 138, OBC: 120, SC: 95, ST: 49, 'PwD/DAP': 62 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey?: string;
  }>;
  label?: string;
}

interface IIMRanchiCutoffProps {
  selectedYear?: number;
}

const IIMRanchiCutoff = ({ selectedYear: propYear }: IIMRanchiCutoffProps = {}) => {
  const selectedYear = propYear ?? 2025;
  const currentData = yearlyData[selectedYear as keyof typeof yearlyData];

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2" style={{ borderColor: primaryColor }}>
          <p className="font-semibold mb-1" style={{ color: primaryColor }}>
            {label || payload[0].name}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey || entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: primaryColor }}>
            IIM Ranchi IPM Cutoff Data
          </h1>
          <p className="text-gray-600 text-lg">Historical Cutoff Analysis (2023-2025)</p>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: primaryColor }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
            Category-wise Cutoff Distribution - {selectedYear}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                label={{ value: 'Final Score', angle: -90, position: 'insideLeft', style: { fill: primaryColor } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="score" name="Final Score" fill={secondaryColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: secondaryColor }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
            Cutoff Trends Across Years (2023-2025)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: primaryColor } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line type="monotone" dataKey="General" stroke={primaryColor} strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="EWS" stroke={accentPurple} strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="OBC" stroke={accentGreen} strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="SC" stroke="#E74C3C" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="ST" stroke="#3498DB" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="PwD/DAP" stroke={secondaryColor} strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Year Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4" style={{ borderColor: secondaryColor }}>
          <div className="p-6 border-b" style={{ backgroundColor: `${secondaryColor}10` }}>
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
              IIM Ranchi IPM {selectedYear} Cutoff Details
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="px-6 py-4 text-left text-white font-semibold text-sm">Category</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">Final Score</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, index) => (
                  <tr
                    key={row.category}
                    className={`border-b transition-colors ${
                      index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'
                    } hover:bg-yellow-100`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-lg" style={{ color: secondaryColor }}>
                        {row.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-gray-700">
            <span className="font-semibold" style={{ color: primaryColor }}>Note:</span> All cutoff scores are based on official IIM Ranchi data. The final score is calculated based on a composite of IPMAT scores, academic performance, and other parameters as per IIM Ranchi's admission criteria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IIMRanchiCutoff;
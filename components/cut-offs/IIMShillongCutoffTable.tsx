import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';
const accentPurple = '#9B59B6';
const accentGold = '#FFC107';

// Data for the chart
const chartData = [
  { category: 'General', qaSa: 12, qaMcq: 24, verbal: 36 },
  { category: 'EWS', qaSa: 12, qaMcq: 24, verbal: 36 },
  { category: 'SC', qaSa: 8, qaMcq: 18, verbal: 27 },
  { category: 'ST', qaSa: 4, qaMcq: 12, verbal: 18 },
  { category: 'PwD', qaSa: 4, qaMcq: 12, verbal: 18 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { category: string };
  }>;
}

const IIMShillongCutoff = () => {
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border-2" style={{ borderColor: primaryColor }}>
          <p className="font-semibold mb-1" style={{ color: primaryColor }}>{payload[0].payload.category}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
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
            IIM Shillong IPM Cutoff 2025
          </h1>
          <p className="text-gray-600 text-lg">Section-wise Cutoff Analysis</p>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: primaryColor }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
            Sectional Cutoff Distribution - 2025
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                label={{ value: 'Marks', angle: -90, position: 'insideLeft', style: { fill: primaryColor } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="qaSa" name="QA (SA)" fill={accentPurple} radius={[8, 8, 0, 0]} />
              <Bar dataKey="qaMcq" name="QA (MCQ)" fill="#48C9B0" radius={[8, 8, 0, 0]} />
              <Bar dataKey="verbal" name="Verbal Ability" fill={secondaryColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentPurple }}></div>
              <span>QA (SA): Quantitative Ability - Short Answer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#48C9B0' }}></div>
              <span>QA (MCQ): Quantitative Ability - Multiple Choice</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
              <span>VA: Verbal Ability</span>
            </div>
          </div>
        </div>

        {/* Cutoff Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4" style={{ borderColor: secondaryColor }}>
          <div className="p-6 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
              IIM Shillong IPM 2025 Cutoff Details (Section-wise)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="px-6 py-4 text-left text-white font-semibold text-sm">Category</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">QA-SA</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">QA-MCQ</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">VA</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr
                    key={row.category}
                    className={`border-b transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-purple-50`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.category}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.qaSa}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.qaMcq}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-lg" style={{ color: secondaryColor }}>
                        {row.verbal}
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
            <span className="font-semibold" style={{ color: primaryColor }}>Note:</span> All cutoff marks are based on official IIM Shillong data for the year 2025. The cutoffs represent the minimum marks required in each section to qualify for the next stage of selection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IIMShillongCutoff;
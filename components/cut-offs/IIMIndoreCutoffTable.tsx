import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';
const accentPurple = '#9B59B6';

// Define types for different year data structures
type Data2025 = {
  category: string;
  qaSa: number;
  qaMcq: number;
  verbal: number;
  female: number;
  male: number;
  total: number;
};

type DataOtherYears = {
  category: string;
  qaSa: number;
  qaMcq: number;
  verbal: number;
  overallCutoff: number;
};

// Data for all years
const yearlyData = {
  2025: [
    { category: 'EWS', qaSa: 16, qaMcq: 18, verbal: 87, female: 13, male: 62, total: 75 },
    { category: 'General', qaSa: 24, qaMcq: 28, verbal: 112, female: 78, male: 223, total: 301 },
    { category: 'NC-OBC', qaSa: 12, qaMcq: 15, verbal: 78, female: 77, male: 168, total: 245 },
    { category: 'PwD', qaSa: 8, qaMcq: 5, verbal: 47, female: 13, male: 20, total: 33 },
    { category: 'SC', qaSa: 12, qaMcq: 10, verbal: 65, female: 47, male: 66, total: 113 },
    { category: 'ST', qaSa: 8, qaMcq: 6, verbal: 48, female: 12, male: 39, total: 51 },
  ] as Data2025[],
  2024: [
    { category: 'General', qaSa: 24, qaMcq: 35, verbal: 113, overallCutoff: 172 },
    { category: 'EWS', qaSa: 16, qaMcq: 26, verbal: 89, overallCutoff: 131 },
    { category: 'NC-OBC', qaSa: 12, qaMcq: 23, verbal: 78, overallCutoff: 113 },
    { category: 'SC', qaSa: 12, qaMcq: 18, verbal: 60, overallCutoff: 90 },
    { category: 'ST', qaSa: 8, qaMcq: 13, verbal: 40, overallCutoff: 61 },
    { category: 'PwD', qaSa: 8, qaMcq: 13, verbal: 40, overallCutoff: 61 },
  ] as DataOtherYears[],
  2023: [
    { category: 'General', qaSa: 12, qaMcq: 39, verbal: 125, overallCutoff: 176 },
    { category: 'EWS', qaSa: 8, qaMcq: 30, verbal: 98, overallCutoff: 128 },
    { category: 'NC-OBC', qaSa: 8, qaMcq: 28, verbal: 98, overallCutoff: 118 },
    { category: 'SC', qaSa: 4, qaMcq: 15, verbal: 69, overallCutoff: 88 },
    { category: 'ST', qaSa: 4, qaMcq: 5, verbal: 43, overallCutoff: 52 },
    { category: 'PwD', qaSa: 4, qaMcq: 5, verbal: 43, overallCutoff: 52 },
  ] as DataOtherYears[],
  2022: [
    { category: 'General', qaSa: 20, qaMcq: 43, verbal: 112, overallCutoff: 175 },
    { category: 'EWS', qaSa: 8, qaMcq: 29, verbal: 86, overallCutoff: 123 },
    { category: 'NC-OBC', qaSa: 8, qaMcq: 21, verbal: 70, overallCutoff: 99 },
    { category: 'SC', qaSa: 4, qaMcq: 14, verbal: 50, overallCutoff: 80 },
    { category: 'ST', qaSa: 4, qaMcq: 8, verbal: 34, overallCutoff: 50 },
    { category: 'PwD', qaSa: 4, qaMcq: 8, verbal: 34, overallCutoff: 46 },
  ] as DataOtherYears[],
  2021: [
    { category: 'General', qaSa: 16, qaMcq: 21, verbal: 70, overallCutoff: 150 },
    { category: 'EWS', qaSa: 8, qaMcq: 11, verbal: 48, overallCutoff: 100 },
    { category: 'NC-OBC', qaSa: 8, qaMcq: 9, verbal: 44, overallCutoff: 90 },
    { category: 'SC', qaSa: 4, qaMcq: 4, verbal: 31, overallCutoff: 70 },
    { category: 'ST', qaSa: 4, qaMcq: 1, verbal: 25, overallCutoff: 50 },
    { category: 'PwD', qaSa: 4, qaMcq: 2, verbal: 25, overallCutoff: 46 },
  ] as DataOtherYears[],
  2020: [
    { category: 'General', qaSa: 25, qaMcq: 28, verbal: 72, overallCutoff: 125 },
    { category: 'EWS', qaSa: 12, qaMcq: 20, verbal: 38, overallCutoff: 70 },
    { category: 'NC-OBC', qaSa: 12, qaMcq: 20, verbal: 38, overallCutoff: 70 },
    { category: 'SC', qaSa: 7, qaMcq: 12, verbal: 32, overallCutoff: 51 },
    { category: 'ST', qaSa: 4, qaMcq: 5, verbal: 16, overallCutoff: 25 },
    { category: 'PwD', qaSa: 5, qaMcq: 5, verbal: 14, overallCutoff: 24 },
  ] as DataOtherYears[],
  2019: [
    { category: 'General', qaSa: 25, qaMcq: 28, verbal: 72, overallCutoff: 125 },
  ] as DataOtherYears[],
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { category: string };
  }>;
}

interface IIMIndoreCutoffProps {
  selectedYear?: number;
}

const IIMIndoreCutoff = ({ selectedYear: propYear }: IIMIndoreCutoffProps = {}) => {
  const selectedYear = propYear ?? 2025;
  const currentData = yearlyData[selectedYear as keyof typeof yearlyData];

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

  // Calculate totals for 2025
  const totalCandidates = selectedYear === 2025 
    ? (currentData as Data2025[]).reduce((sum, item) => sum + item.total, 0)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: primaryColor }}>
            IIM Indore IPM Cutoff Data
          </h1>
          <p className="text-gray-600 text-lg">Historical Cutoff Analysis & Trends</p>
        </div>

        {/* Stats Card - Only for 2025 */}
        {/* {selectedYear === 2025 && totalCandidates && (
          <div className="max-w-md mx-auto mb-8">
            <div className="rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                 style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentPurple})` }}>
              <p className="text-white text-sm font-medium mb-1">Total Qualified Candidates</p>
              <p className="text-white text-4xl font-bold">{totalCandidates.toLocaleString()}</p>
            </div>
          </div>
        )} */}

        {/* Bar Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: primaryColor }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
            Sectional Cutoff Distribution - {selectedYear}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              IIM Indore IPM {selectedYear} Cutoff Details
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="px-6 py-4 text-left text-white font-semibold text-sm">Category</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">QA (SA)</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">QA (MCQ)</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">Verbal Ability</th>
                  {selectedYear === 2025 ? (
                    <>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Female</th>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Male</th>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Total</th>
                    </>
                  ) : (
                    <th className="px-6 py-4 text-center text-white font-semibold text-sm">Overall Cutoff</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, index) => (
                  <tr
                    key={row.category}
                    className={`border-b transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-purple-50`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.category}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.qaSa}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.qaMcq}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.verbal}</td>
                    {selectedYear === 2025 ? (
                      <>
                        <td className="px-6 py-4 text-center text-gray-700">{(row as Data2025).female}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{(row as Data2025).male}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg" style={{ color: secondaryColor }}>
                            {(row as Data2025).total}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full font-bold text-white text-sm"
                              style={{ backgroundColor: primaryColor }}>
                          {(row as DataOtherYears).overallCutoff}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-gray-700">
            <span className="font-semibold" style={{ color: primaryColor }}>Note:</span> All cutoff marks are based on official IIM Indore data. 
            {selectedYear >= 2020 && selectedYear <= 2022 && ' Overall cutoff values marked with "~" are approximate.'} 
            {selectedYear === 2019 && ' The 2019 data shows General category cutoff range of approximately 125-130.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IIMIndoreCutoff;
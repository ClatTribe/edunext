import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';
const accentPurple = '#9B59B6';
const accentGold = '#FFC107';

// Define types for different year data structures
type Data2025 = {
  category: string;
  cutoff: number;
  SA?: number;
  MCQ?: number;
  VA?: number;
  female: number;
  male: number;
  total: number;
};

type DataOtherYears = {
  category: string;
  cutoff: number;
};

// Data for all years
const yearlyData = {
  2025: [
    { category: 'General', cutoff: 381, SA: 24, MCQ: 28, VA: 112, female: 144, male: 310, total: 454 },
    { category: 'EWS', cutoff: 331, SA: 16, MCQ: 18, VA: 87, female: 17, male: 71, total: 88 },
    { category: 'NC-OBC', cutoff: 297, SA: 12, MCQ: 15, VA: 78, female: 80, male: 164, total: 244 },
    { category: 'SC', cutoff: 230, SA: 12, MCQ: 10, VA: 65, female: 61, male: 75, total: 136 },
    { category: 'ST', cutoff: 138, SA: 8, MCQ: 6, VA: 49, female: 26, male: 43, total: 69 },
    { category: 'DAP-General', cutoff: 274, SA: 8, MCQ: 5, VA: 47, female: 5, male: 10, total: 15 },
    { category: 'DAP-EWS', cutoff: 236, female: 1, male: 1, total: 2 },
    { category: 'DAP-NCOBC', cutoff: 196, female: 1, male: 2, total: 3 },
    { category: 'DAP-SC', cutoff: 202, female: 1, male: 0, total: 1 },
    { category: 'DAP-ST', cutoff: 171, female: 0, male: 1, total: 1 },
  ] as Data2025[],
  2024: [
    { category: 'General', cutoff: 301 },
    { category: 'EWS', cutoff: 264 },
    { category: 'NC-OBC', cutoff: 225 },
    { category: 'SC', cutoff: 167 },
    { category: 'ST', cutoff: 118 },
  ] as DataOtherYears[],
  2023: [
    { category: 'General', cutoff: 409 },
    { category: 'EWS', cutoff: 376 },
    { category: 'NC-OBC', cutoff: 349 },
    { category: 'SC', cutoff: 274 },
    { category: 'ST', cutoff: 201 },
  ] as DataOtherYears[],
  2022: [
    { category: 'General', cutoff: 306 },
    { category: 'EWS', cutoff: 261 },
    { category: 'NC-OBC', cutoff: 219 },
    { category: 'SC', cutoff: 154 },
    { category: 'ST', cutoff: 66 },
  ] as DataOtherYears[],
  2021: [
    { category: 'General', cutoff: 265 },
    { category: 'EWS', cutoff: 197 },
    { category: 'NC-OBC', cutoff: 80 },
    { category: 'SC', cutoff: 119 },
    { category: 'ST', cutoff: 52 },
  ] as DataOtherYears[],
};

const years = [2025, 2024, 2023, 2022, 2021] as const;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { category: string };
  }>;
}

const IIMRohtakCutoff = () => {
  const [selectedYear, setSelectedYear] = useState<typeof years[number]>(2025);
  const currentData = yearlyData[selectedYear];

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
            IIM Rohtak IPM Cutoff Data
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive Analysis of Admission Statistics</p>
        </div>

        {/* Year Dropdown */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-semibold mb-2" style={{ color: primaryColor }}>
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value) as typeof years[number])}
            className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
            style={{ 
              borderColor: primaryColor,
              backgroundColor: 'white'
            }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Stats Card - Only for 2025 */}
        {selectedYear === 2025 && totalCandidates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                 style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentPurple})` }}>
              <p className="text-white text-sm font-medium mb-1">Applicants (Positive Score)</p>
              <p className="text-white text-4xl font-bold">{totalCandidates.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                 style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${accentGold})` }}>
              <p className="text-white text-sm font-medium mb-1">Total Qualified</p>
              <p className="text-white text-4xl font-bold">{totalCandidates.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Bar Chart Section - Only for 2025 */}
        {selectedYear === 2025 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: primaryColor }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
              Sectional Cutoff Distribution - {selectedYear}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={(currentData as Data2025[]).filter(item => item.SA && item.MCQ && item.VA)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
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
                <Bar dataKey="SA" name="Short Answer" fill={accentPurple} radius={[8, 8, 0, 0]} />
                <Bar dataKey="MCQ" name="Multiple Choice" fill="#48C9B0" radius={[8, 8, 0, 0]} />
                <Bar dataKey="VA" name="Verbal Ability" fill={secondaryColor} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentPurple }}></div>
                <span>SA: Short Answer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#48C9B0' }}></div>
                <span>MCQ: Multiple Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                <span>VA: Verbal Ability</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4" style={{ borderColor: primaryColor }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
              Cutoff Trends - {selectedYear}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={currentData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  tick={{ fill: '#666', fontSize: 12 }}
                  label={{ value: 'Cutoff Marks', angle: -90, position: 'insideLeft', style: { fill: primaryColor } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: `2px solid ${primaryColor}`, borderRadius: '8px' }}
                  labelStyle={{ color: primaryColor, fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar dataKey="cutoff" name="Minimum Cutoff" fill={primaryColor} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <span>Overall Cutoff Marks by Category</span>
              </div>
            </div>
          </div>
        )}

        {/* Cutoff Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4" style={{ borderColor: secondaryColor }}>
          <div className="p-6 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
              IIM Rohtak IPM {selectedYear} Cutoff Details
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="px-6 py-4 text-left text-white font-semibold text-sm">Category</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-sm">Min. Cutoff</th>
                  {selectedYear === 2025 && (
                    <>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Female</th>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Male</th>
                      <th className="px-6 py-4 text-center text-white font-semibold text-sm">Total Seats</th>
                    </>
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
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full font-bold text-white text-sm"
                            style={{ backgroundColor: primaryColor }}>
                        {row.cutoff}
                      </span>
                    </td>
                    {selectedYear === 2025 && (
                      <>
                        <td className="px-6 py-4 text-center text-gray-700">{(row as Data2025).female}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{(row as Data2025).male}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg" style={{ color: secondaryColor }}>
                            {(row as Data2025).total}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              {selectedYear === 2025 && (
                <tfoot>
                  <tr style={{ backgroundColor: `${secondaryColor}20` }}>
                    <td className="px-6 py-4 font-bold text-gray-800">Grand Total</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-600">—</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">336</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">677</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-2xl" style={{ color: secondaryColor }}>
                        1,013
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-gray-700">
            <span className="font-semibold" style={{ color: primaryColor }}>Note:</span> The cutoff marks are subject to final verification.
            {selectedYear === 2025 && ' DAP stands for Differently Abled Persons category.'} All figures are based on official IIM Rohtak data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IIMRohtakCutoff;
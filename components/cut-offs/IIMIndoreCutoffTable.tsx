'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const cutOffData = [
  {
    category: 'EWS',
    qaSa: 16,
    qaMcq: 18,
    verbal: 87,
    female: 13,
    male: 62,
    total: 75,
  },
  {
    category: 'General',
    qaSa: 24,
    qaMcq: 28,
    verbal: 112,
    female: 78,
    male: 223,
    total: 301,
  },
  {
    category: 'NC-OBC',
    qaSa: 12,
    qaMcq: 15,
    verbal: 78,
    female: 77,
    male: 168,
    total: 245,
  },
  {
    category: 'PwD',
    qaSa: 8,
    qaMcq: 5,
    verbal: 47,
    female: 13,
    male: 20,
    total: 33,
  },
  {
    category: 'SC',
    qaSa: 12,
    qaMcq: 10,
    verbal: 65,
    female: 47,
    male: 66,
    total: 113,
  },
  {
    category: 'ST',
    qaSa: 8,
    qaMcq: 6,
    verbal: 48,
    female: 12,
    male: 39,
    total: 51,
  },
];

const IIMIndoreCutoffTable = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Title */}
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Indore IPM 2025 Cut-Off
      </h1>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              {[
                'Category',
                'Quantitative Ability (SA)',
                'Quantitative Ability (MCQ)',
                'Verbal Ability',
                'Female',
                'Male',
                'Total Candidates',
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-white font-semibold whitespace-nowrap text-center"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cutOffData.map((row, index) => (
              <tr
                key={row.category}
                className={`border-b ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-yellow-50 transition`}
              >
                <td className="px-4 py-3 font-medium text-gray-800 text-center">
                  {row.category}
                </td>
                <td className="px-4 py-3 text-center">{row.qaSa}</td>
                <td className="px-4 py-3 text-center">{row.qaMcq}</td>
                <td className="px-4 py-3 text-center">{row.verbal}</td>
                <td className="px-4 py-3 text-center">{row.female}</td>
                <td className="px-4 py-3 text-center">{row.male}</td>
                <td
                  className="px-4 py-3 text-center font-semibold"
                  style={{ color: secondaryColor }}
                >
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IIMIndoreCutoffTable;

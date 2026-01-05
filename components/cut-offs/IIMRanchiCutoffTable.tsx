'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const cutOffData = [
  { category: 'General', score: 88.5 },
  { category: 'EWS (Economically Weaker Section)', score: 69 },
  { category: 'NC-OBC (Non-Creamy Other Backward Classes)', score: 60 },
  { category: 'SC (Scheduled Caste)', score: 47.5 },
  { category: 'ST (Scheduled Tribe)', score: 24.5 },
  { category: 'DAP (PWD)', score: 31 },
];

const IIMRanchiCutoffTable = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Ranchi IPM 2025 Cut-Off
      </h1>

      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              <th className="py-4 px-6 text-white font-semibold text-center">
                Category
              </th>
              <th className="py-4 px-6 text-white font-semibold text-center w-40">
                Final Score
              </th>
            </tr>
          </thead>

          <tbody>
            {cutOffData.map((row, index) => (
              <tr
                key={row.category}
                className={`border-t ${
                  index % 2 === 0 ? 'bg-yellow-50/40' : 'bg-white'
                } hover:bg-yellow-100/40 transition`}
              >
                <td className="py-4 px-6 text-center font-medium text-gray-800">
                  {row.category}
                </td>

                <td
                  className="py-4 px-6 text-center font-bold text-base"
                  style={{ color: secondaryColor }}
                >
                  {row.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IIMRanchiCutoffTable;

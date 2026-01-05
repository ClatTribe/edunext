'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const cutOffData = [
  { category: 'General', cutoff: 55 },
  { category: 'EWS (Economically Weaker Section)', cutoff: 25 },
  { category: 'NC-OBC', cutoff: 20 },
  { category: 'SC/ST', cutoff: 17 },
  { category: 'PWD', cutoff: 16 },
];

const IIMSirmaurCutoffTable = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Title */}
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Sirmaur BMS 2025 Cut-Off
      </h1>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              <th className="py-4 px-6 text-white font-semibold text-center">
                Category
              </th>
              <th className="py-4 px-6 text-white font-semibold text-center w-40">
                Cut-Off
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
                  {row.cutoff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IIMSirmaurCutoffTable;

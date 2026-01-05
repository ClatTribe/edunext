'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const cutOffData = [
  { category: 'General', cutoff: 381, female: 144, male: 310, total: 454 },
  { category: 'EWS', cutoff: 331, female: 17, male: 71, total: 88 },
  { category: 'NC-OBC', cutoff: 297, female: 80, male: 164, total: 244 },
  { category: 'SC', cutoff: 230, female: 61, male: 75, total: 136 },
  { category: 'ST', cutoff: 138, female: 26, male: 43, total: 69 },
  { category: 'DAP-General', cutoff: 274, female: 5, male: 10, total: 15 },
  { category: 'DAP-EWS', cutoff: 236, female: 1, male: 1, total: 2 },
  { category: 'DAP-NCOBC', cutoff: 196, female: 1, male: 2, total: 3 },
  { category: 'DAP-SC', cutoff: 202, female: 1, male: 0, total: 1 },
  { category: 'DAP-ST', cutoff: 171, female: 0, male: 1, total: 1 },
];

const IIMRohtakCutoffTable = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Title */}
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Rohtak IPM 2025 Cut-Off
      </h1>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              {[
                'Category',
                'Minimum Cutoff Marks',
                'Female',
                'Male',
                'Total',
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-white font-semibold text-center whitespace-nowrap"
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
                <td className="px-4 py-3 text-center font-semibold">
                  {row.cutoff}
                </td>
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

          {/* Footer Total */}
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-3 text-center">Total</td>
              <td className="px-4 py-3 text-center">—</td>
              <td className="px-4 py-3 text-center">336</td>
              <td className="px-4 py-3 text-center">677</td>
              <td
                className="px-4 py-3 text-center"
                style={{ color: secondaryColor }}
              >
                1013
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default IIMRohtakCutoffTable;

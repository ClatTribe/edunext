'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const cutOffData = [
  {
    parameter: 'IPMAT – Quantitative Ability (SA)',
    totalMarks: 60,
    others: '20% i.e. 12 Marks',
    sc: '15% i.e. 9 Marks',
    st: '10% i.e. 6 Marks',
  },
  {
    parameter: 'IPMAT – Quantitative Ability (MCQ)',
    totalMarks: 120,
    others: '20% i.e. 24 Marks',
    sc: '15% i.e. 18 Marks',
    st: '10% i.e. 12 Marks',
  },
  {
    parameter: 'IPMAT – Verbal Ability',
    totalMarks: 180,
    others: '20% i.e. 36 Marks',
    sc: '15% i.e. 27 Marks',
    st: '10% i.e. 18 Marks',
  },
];

const IIMShillongCutoffTable = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Title */}
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Shillong IPM 2025 Cut-Off
      </h1>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              {[
                'Parameter',
                'Others & EWS',
                'SC',
                'ST & DA',
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
                key={row.parameter}
                className={`border-b ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-yellow-50 transition`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  <div>{row.parameter}</div>
                  <div className="text-xs text-gray-500">
                    Total Marks: {row.totalMarks}
                  </div>
                </td>

                <td className="px-4 py-3 text-center font-medium">
                  {row.others}
                </td>

                <td className="px-4 py-3 text-center">{row.sc}</td>

                <td
                  className="px-4 py-3 text-center font-semibold"
                  style={{ color: secondaryColor }}
                >
                  {row.st}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IIMShillongCutoffTable;

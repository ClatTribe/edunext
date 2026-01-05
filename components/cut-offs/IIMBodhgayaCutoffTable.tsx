'use client';

import React from 'react';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

const data = [
  {
    category: 'General',
    p1: 70, p2: 70, p3: 70, p4: 76,
    t3: 290, t2: 275, t1: 333,
  },
  {
    category: 'EWS (Economically Weaker Section)',
    p1: 50, p2: 50, p3: 50, p4: 63,
    t3: 245, t2: 184, t1: 300,
  },
  {
    category: 'NC-OBC',
    p1: 50, p2: 50, p3: 50, p4: 52,
    t3: 220, t2: 195, t1: 280,
  },
  {
    category: 'SC',
    p1: 35, p2: 35, p3: 35, p4: 40,
    t3: 146, t2: 146, t1: 235,
  },
  {
    category: 'ST (Scheduled Tribe)',
    p1: 30, p2: 25, p3: 25, p4: 36,
    t3: 140, t2: 140, t1: 190,
  },
  {
    category: 'PwD-GEN',
    p1: null, p2: null, p3: null, p4: null,
    t3: null, t2: null, t1: 230,
  },
  {
    category: 'PwD-EWS',
    p1: null, p2: null, p3: null, p4: null,
    t3: null, t2: null, t1: 180,
  },
  {
    category: 'PwD-NCOBC',
    p1: 30, p2: 25, p3: 25, p4: 36,
    t3: 140, t2: 140, t1: 0,
  },
  {
    category: 'PwD-SC',
    p1: null, p2: null, p3: null, p4: null,
    t3: null, t2: null, t1: 154,
  },
  {
    category: 'PwD-ST',
    p1: null, p2: null, p3: null, p4: null,
    t3: null, t2: null, t1: 0,
  },
];

const Cell = ({ value }: { value: number | null }) => (
  <td className="py-3 px-3 text-center">
    {value !== null ? value : '—'}
  </td>
);

const IIMBodhgayaCutoffTable = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        IIM Bodh Gaya IPM 2025 Cut-Off
      </h1>

      <div className="bg-white rounded-2xl shadow-md border overflow-x-auto">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              <th rowSpan={2} className="text-white px-4 py-3 text-center">
                Category
              </th>
              <th colSpan={4} className="text-white px-4 py-3 text-center">
                Percentile Cut-Off (Type III)
              </th>
              <th colSpan={3} className="text-white px-4 py-3 text-center">
                Cut-Off Score
              </th>
            </tr>

            <tr style={{ backgroundColor: primaryColor }}>
              {['P1', 'P2', 'P3', 'P4', 'Type III – GN', 'Type II', 'Type I'].map(
                (h) => (
                  <th key={h} className="text-white px-3 py-2 text-center text-xs">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.category}
                className={`border-t ${
                  i % 2 === 0 ? 'bg-yellow-50/40' : 'bg-white'
                } hover:bg-yellow-100/40`}
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {row.category}
                </td>
                <Cell value={row.p1} />
                <Cell value={row.p2} />
                <Cell value={row.p3} />
                <Cell value={row.p4} />
                <Cell value={row.t3} />
                <Cell value={row.t2} />
                <td
                  className="py-3 px-3 text-center font-bold"
                  style={{ color: secondaryColor }}
                >
                  {row.t1 ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IIMBodhgayaCutoffTable;

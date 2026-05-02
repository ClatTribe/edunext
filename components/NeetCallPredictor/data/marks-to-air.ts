// NEET 2025 marks → All India Rank conversion.
//
// Source: NTA NEET 2025 official result PDF + Careers360/Shiksha/CollegeDekho
// interpolations consolidated in our research compilation.
//
// IMPORTANT: NEET 2025 paper was significantly tougher than 2024 — same AIRs
// now correspond to ~50–130 fewer raw marks. This curve reflects 2025 anchors,
// so it should be re-validated each year against the official result PDF.

export interface MarksAnchor {
  marks: number;
  air: number;
}

// Anchors in DESCENDING order of marks (highest score first)
const ANCHORS: MarksAnchor[] = [
  { marks: 686, air: 1 },
  { marks: 682, air: 2 },
  { marks: 681, air: 3 },
  { marks: 678, air: 8 },
  { marks: 650, air: 77 },
  { marks: 632, air: 200 },
  { marks: 615, air: 600 },
  { marks: 604, air: 1100 },
  { marks: 600, air: 1260 },
  { marks: 583, air: 3000 },
  { marks: 567, air: 6000 },
  { marks: 559, air: 9000 },
  { marks: 549, air: 12860 },
  { marks: 540, air: 17370 },
  { marks: 528, air: 25541 },
  { marks: 520, air: 32000 },
  { marks: 498, air: 56000 },
  { marks: 478, air: 80336 },
  { marks: 459, air: 107944 },
  { marks: 442, air: 138000 },
  { marks: 418, air: 175000 },
  { marks: 400, air: 215000 },
  { marks: 350, air: 270000 },
  { marks: 300, air: 440000 },
  { marks: 250, air: 600000 },
  { marks: 200, air: 800000 },
  { marks: 150, air: 1050000 },
  { marks: 100, air: 1450000 },
  { marks: 50, air: 1900000 },
  { marks: 0, air: 2200000 },
];

/**
 * Convert NEET 2025 marks (out of 720) to expected All India Rank.
 * Uses linear interpolation between adjacent anchor points.
 */
export function marksToAir(marks: number): number {
  const m = Math.max(0, Math.min(720, Math.round(marks)));
  if (m >= 686) return 1;
  if (m <= 0) return 2200000;

  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const hi = ANCHORS[i];
    const lo = ANCHORS[i + 1];
    if (m <= hi.marks && m >= lo.marks) {
      const span = hi.marks - lo.marks || 1;
      const t = (hi.marks - m) / span;
      return Math.round(hi.air + t * (lo.air - hi.air));
    }
  }
  return 2200000;
}

/** Round AIR to a friendly display string. */
export function formatAir(air: number): string {
  if (air < 1000) return air.toString();
  if (air < 100000) return `${(air / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(air / 100000).toFixed(1).replace(/\.0$/, "")}L`;
}

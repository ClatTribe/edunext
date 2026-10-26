// Minimum CAT percentiles for shortlisting at all 22 IIMs, from each IIM's
// admission policy (CAT 2025 cycle unless the IIM has published CAT 2026).
// Same source data as the /college/<iim>/cutoff pages (updated 26 Oct 2026).
// Update once per cycle when IIMs publish new admission policies.

export type IimCategory = "General" | "EWS" | "NC-OBC" | "SC" | "ST" | "PwD"
export const IIM_CATEGORIES: IimCategory[] = ["General", "EWS", "NC-OBC", "SC", "ST", "PwD"]

export interface IimCutoff {
  overall: number | null // null = IIM sets no overall minimum
  varc: number | null    // null = no sectional minimum
  dilr: number | null
  qa: number | null
}

export interface IimCutoffEntry {
  slug: string
  name: string
  process: "Own" | "CAP" | "JAP"
  cycle: string
  official: boolean // false = reported by news sites, official PDF not accessible
  note: string | null
  cutoffs: Record<IimCategory, IimCutoff | null>
}

export const IIM_CUTOFF_UPDATED = "26 October 2026"

export const IIM_CUTOFFS: IimCutoffEntry[] = [
  {
    slug: "iim-ahmedabad", name: "IIM Ahmedabad", process: "Own", cycle: "CAT 2026", official: true,
    note: "PwD shown for General/EWS PwD",
    cutoffs: {
      General: { overall: 95, varc: 85, dilr: 85, qa: 85 },
      EWS: { overall: 95, varc: 85, dilr: 85, qa: 85 },
      "NC-OBC": { overall: 90, varc: 80, dilr: 80, qa: 80 },
      SC: { overall: 85, varc: 75, dilr: 75, qa: 75 },
      ST: { overall: 75, varc: 65, dilr: 65, qa: 65 },
      PwD: { overall: 85, varc: 75, dilr: 75, qa: 75 },
    },
  },
  {
    slug: "iim-bangalore", name: "IIM Bangalore", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 85, varc: 80, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 70, dilr: 65, qa: 65 },
      "NC-OBC": { overall: 75, varc: 70, dilr: 65, qa: 65 },
      SC: { overall: 70, varc: 65, dilr: 60, qa: 60 },
      ST: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      PwD: { overall: 60, varc: 50, dilr: 50, qa: 50 },
    },
  },
  {
    slug: "iim-calcutta", name: "IIM Calcutta", process: "Own", cycle: "CAT 2026", official: true,
    note: null,
    cutoffs: {
      General: { overall: 85, varc: 80, dilr: 80, qa: 75 },
      EWS: { overall: 75, varc: 70, dilr: 65, qa: 65 },
      "NC-OBC": { overall: 75, varc: 70, dilr: 65, qa: 65 },
      SC: { overall: 70, varc: 65, dilr: 60, qa: 60 },
      ST: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      PwD: { overall: 55, varc: 45, dilr: 45, qa: 45 },
    },
  },
  {
    slug: "iim-lucknow", name: "IIM Lucknow", process: "Own", cycle: "2025-27 policy", official: true,
    note: null,
    cutoffs: {
      General: { overall: 90, varc: 85, dilr: 85, qa: 85 },
      EWS: { overall: 82, varc: 77, dilr: 77, qa: 77 },
      "NC-OBC": { overall: 82, varc: 77, dilr: 77, qa: 77 },
      SC: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      ST: { overall: 60, varc: 50, dilr: 50, qa: 50 },
      PwD: { overall: 60, varc: 50, dilr: 50, qa: 50 },
    },
  },
  {
    slug: "iim-kozhikode", name: "IIM Kozhikode", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 85, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 65, dilr: 65, qa: 65 },
      "NC-OBC": { overall: 75, varc: 65, dilr: 65, qa: 65 },
      SC: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      ST: { overall: 55, varc: 45, dilr: 45, qa: 45 },
      PwD: { overall: 55, varc: 45, dilr: 45, qa: 45 },
    },
  },
  {
    slug: "iim-indore", name: "IIM Indore", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 90, varc: 80, dilr: 80, qa: 80 },
      EWS: { overall: 90, varc: 80, dilr: 80, qa: 80 },
      "NC-OBC": { overall: 80, varc: 70, dilr: 70, qa: 70 },
      SC: { overall: 60, varc: 55, dilr: 55, qa: 55 },
      ST: { overall: 45, varc: 40, dilr: 40, qa: 40 },
      PwD: { overall: 45, varc: 40, dilr: 40, qa: 40 },
    },
  },
  {
    slug: "iim-shillong", name: "IIM Shillong", process: "Own", cycle: "CAT 2025", official: true,
    note: "Only sectional minimums; NC-OBC grouped with General",
    cutoffs: {
      General: { overall: null, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: null, varc: 75, dilr: 75, qa: 75 },
      "NC-OBC": { overall: null, varc: 75, dilr: 75, qa: 75 },
      SC: { overall: null, varc: 60, dilr: 60, qa: 60 },
      ST: { overall: null, varc: 50, dilr: 50, qa: 50 },
      PwD: { overall: null, varc: 50, dilr: 50, qa: 50 },
    },
  },
  {
    slug: "iim-mumbai", name: "IIM Mumbai", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 85, varc: 80, dilr: 80, qa: 75 },
      EWS: { overall: 75, varc: 70, dilr: 65, qa: 65 },
      "NC-OBC": { overall: 75, varc: 70, dilr: 65, qa: 65 },
      SC: { overall: 70, varc: 65, dilr: 60, qa: 60 },
      ST: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      PwD: { overall: 55, varc: 45, dilr: 45, qa: 45 },
    },
  },
  {
    slug: "iim-rohtak", name: "IIM Rohtak", process: "Own", cycle: "CAT 2025", official: false,
    note: "Reported figures; official PDF not accessible",
    cutoffs: {
      General: { overall: 97, varc: null, dilr: null, qa: null },
      EWS: { overall: 93, varc: null, dilr: null, qa: null },
      "NC-OBC": { overall: 83, varc: null, dilr: null, qa: null },
      SC: { overall: 60, varc: null, dilr: null, qa: null },
      ST: { overall: 50, varc: null, dilr: null, qa: null },
      PwD: { overall: 87, varc: null, dilr: null, qa: null },
    },
  },
  {
    slug: "iim-ranchi", name: "IIM Ranchi", process: "JAP", cycle: "CAT 2025", official: true,
    note: "JAP interview shortlist: 95.25 overall (General)",
    cutoffs: {
      General: { overall: 90, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 60, dilr: 60, qa: 60 },
      "NC-OBC": { overall: 75, varc: 60, dilr: 60, qa: 60 },
      SC: { overall: 50, varc: 45, dilr: 45, qa: 45 },
      ST: { overall: 30, varc: 25, dilr: 25, qa: 25 },
      PwD: { overall: 30, varc: 25, dilr: 25, qa: 25 },
    },
  },
  {
    slug: "iim-raipur", name: "IIM Raipur", process: "JAP", cycle: "CAT 2025", official: true,
    note: "JAP interview shortlist: 95.25 overall (General)",
    cutoffs: {
      General: { overall: 90, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 60, dilr: 60, qa: 60 },
      "NC-OBC": { overall: 75, varc: 60, dilr: 60, qa: 60 },
      SC: { overall: 50, varc: 45, dilr: 45, qa: 45 },
      ST: { overall: 30, varc: 25, dilr: 25, qa: 25 },
      PwD: { overall: 30, varc: 25, dilr: 25, qa: 25 },
    },
  },
  {
    slug: "iim-trichy", name: "IIM Trichy", process: "JAP", cycle: "CAT 2025", official: true,
    note: "JAP interview shortlist: 95.25 overall (General)",
    cutoffs: {
      General: { overall: 90, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 60, dilr: 60, qa: 60 },
      "NC-OBC": { overall: 75, varc: 60, dilr: 60, qa: 60 },
      SC: { overall: 50, varc: 45, dilr: 45, qa: 45 },
      ST: { overall: 30, varc: 25, dilr: 25, qa: 25 },
      PwD: { overall: 30, varc: 25, dilr: 25, qa: 25 },
    },
  },
  {
    slug: "iim-kashipur", name: "IIM Kashipur", process: "JAP", cycle: "CAT 2025", official: true,
    note: "JAP interview shortlist: 95.25 overall (General)",
    cutoffs: {
      General: { overall: 90, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 75, varc: 60, dilr: 60, qa: 60 },
      "NC-OBC": { overall: 75, varc: 60, dilr: 60, qa: 60 },
      SC: { overall: 50, varc: 45, dilr: 45, qa: 45 },
      ST: { overall: 30, varc: 25, dilr: 25, qa: 25 },
      PwD: { overall: 30, varc: 25, dilr: 25, qa: 25 },
    },
  },
  {
    slug: "iim-udaipur", name: "IIM Udaipur", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 94, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 81, varc: 55, dilr: 55, qa: 55 },
      "NC-OBC": { overall: 81, varc: 52, dilr: 52, qa: 52 },
      SC: { overall: 66, varc: 45, dilr: 45, qa: 45 },
      ST: { overall: 42, varc: 25, dilr: 25, qa: 30 },
      PwD: { overall: 42, varc: 25, dilr: 25, qa: 30 },
    },
  },
  {
    slug: "iim-nagpur", name: "IIM Nagpur", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 95, varc: 70, dilr: 70, qa: 70 },
      EWS: { overall: 85, varc: 55, dilr: 55, qa: 55 },
      "NC-OBC": { overall: 85, varc: 55, dilr: 55, qa: 55 },
      SC: { overall: 65, varc: 40, dilr: 40, qa: 40 },
      ST: { overall: 40, varc: 30, dilr: 30, qa: 30 },
      PwD: { overall: 40, varc: 25, dilr: 25, qa: 25 },
    },
  },
  {
    slug: "iim-visakhapatnam", name: "IIM Visakhapatnam", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 82, varc: 70, dilr: 70, qa: 70 },
      EWS: { overall: 72, varc: 63, dilr: 63, qa: 63 },
      "NC-OBC": { overall: 72, varc: 63, dilr: 63, qa: 63 },
      SC: { overall: 50, varc: 40, dilr: 40, qa: 40 },
      ST: { overall: 40, varc: 30, dilr: 30, qa: 30 },
      PwD: { overall: 40, varc: 30, dilr: 30, qa: 30 },
    },
  },
  {
    slug: "iim-bodh-gaya", name: "IIM Bodh Gaya", process: "CAP", cycle: "CAT 2025", official: true,
    note: "Female / transgender candidates: 5 percentile lower overall",
    cutoffs: {
      General: { overall: 90, varc: 65, dilr: 65, qa: 65 },
      EWS: { overall: 75, varc: 50, dilr: 50, qa: 50 },
      "NC-OBC": { overall: 75, varc: 45, dilr: 45, qa: 45 },
      SC: { overall: 60, varc: 40, dilr: 40, qa: 40 },
      ST: { overall: 38, varc: 25, dilr: 30, qa: 30 },
      PwD: { overall: 38, varc: 25, dilr: 30, qa: 30 },
    },
  },
  {
    slug: "iim-amritsar", name: "IIM Amritsar", process: "Own", cycle: "CAT 2025", official: true,
    note: null,
    cutoffs: {
      General: { overall: 90, varc: 80, dilr: 75, qa: 80 },
      EWS: { overall: 90, varc: 77, dilr: 75, qa: 80 },
      "NC-OBC": { overall: 80, varc: 65, dilr: 60, qa: 65 },
      SC: { overall: 55, varc: 52, dilr: 50, qa: 55 },
      ST: { overall: 40, varc: 37, dilr: 35, qa: 40 },
      PwD: { overall: 40, varc: 37, dilr: 35, qa: 40 },
    },
  },
  {
    slug: "iim-sambalpur", name: "IIM Sambalpur", process: "Own", cycle: "CAT 2025", official: false,
    note: "Reported figures; no sectional cutoff",
    cutoffs: {
      General: { overall: 90, varc: null, dilr: null, qa: null },
      EWS: { overall: 80, varc: null, dilr: null, qa: null },
      "NC-OBC": { overall: 75, varc: null, dilr: null, qa: null },
      SC: { overall: 55, varc: null, dilr: null, qa: null },
      ST: { overall: 40, varc: null, dilr: null, qa: null },
      PwD: { overall: 40, varc: null, dilr: null, qa: null },
    },
  },
  {
    slug: "iim-sirmaur", name: "IIM Sirmaur", process: "CAP", cycle: "CAT 2025", official: true,
    note: "Female / transgender candidates: 5 percentile lower overall",
    cutoffs: {
      General: { overall: 90, varc: 65, dilr: 65, qa: 65 },
      EWS: { overall: 75, varc: 50, dilr: 50, qa: 50 },
      "NC-OBC": { overall: 75, varc: 45, dilr: 45, qa: 45 },
      SC: { overall: 60, varc: 40, dilr: 40, qa: 40 },
      ST: { overall: 38, varc: 25, dilr: 30, qa: 30 },
      PwD: { overall: 38, varc: 25, dilr: 30, qa: 30 },
    },
  },
  {
    slug: "iim-jammu", name: "IIM Jammu", process: "CAP", cycle: "CAT 2025", official: true,
    note: "Female / transgender candidates: 5 percentile lower overall",
    cutoffs: {
      General: { overall: 90, varc: 65, dilr: 65, qa: 65 },
      EWS: { overall: 75, varc: 50, dilr: 50, qa: 50 },
      "NC-OBC": { overall: 75, varc: 45, dilr: 45, qa: 45 },
      SC: { overall: 60, varc: 40, dilr: 40, qa: 40 },
      ST: { overall: 38, varc: 25, dilr: 30, qa: 30 },
      PwD: { overall: 38, varc: 25, dilr: 30, qa: 30 },
    },
  },
  {
    slug: "iim-guwahati", name: "IIM Guwahati", process: "Own", cycle: "CAT 2025", official: true,
    note: "First batch 2026-28; no interview round",
    cutoffs: {
      General: { overall: 85, varc: 75, dilr: 75, qa: 75 },
      EWS: { overall: 85, varc: 75, dilr: 75, qa: 75 },
      "NC-OBC": { overall: 80, varc: 70, dilr: 70, qa: 70 },
      SC: { overall: 75, varc: 65, dilr: 65, qa: 65 },
      ST: { overall: 65, varc: 55, dilr: 55, qa: 55 },
      PwD: { overall: 75, varc: 65, dilr: 65, qa: 65 },
    },
  },
]

/**
 * categoryTone — single source of truth for category color mapping.
 *
 * Deploy to: components/magazine/categoryTone.ts
 *
 * Maps the category string from edu_news (e.g. "NEET / Medical") to a
 * tone object with bg/text/border CSS values + a short label for the
 * category chip.
 *
 * Per the redesign brief:
 *   Medical / Admissions  → green  (#10b981)
 *   Engineering           → indigo (#6366f1)
 *   Law / Management      → amber  (#f59e0b)
 */

export interface CategoryTone {
  label: string;
  text: string;
  bg: string;
  border: string;
}

const GREEN: Omit<CategoryTone, 'label'> = {
  text: '#10b981',
  bg: 'rgba(16,185,129,0.12)',
  border: 'rgba(16,185,129,0.3)',
};

const INDIGO: Omit<CategoryTone, 'label'> = {
  text: '#6366f1',
  bg: 'rgba(99,102,241,0.12)',
  border: 'rgba(99,102,241,0.3)',
};

const AMBER: Omit<CategoryTone, 'label'> = {
  text: '#f59e0b',
  bg: 'rgba(245,158,11,0.12)',
  border: 'rgba(245,158,11,0.3)',
};

export function categoryTone(category: string): CategoryTone {
  const c = (category || '').toLowerCase();

  if (c.includes('medical') || c.includes('neet') || c.includes('admission') || c.includes('cbse') || c.includes('boards')) {
    return { ...GREEN, label: shortLabel(category) };
  }
  if (c.includes('engineering') || c.includes('jee') || c.includes('iit') || c.includes('ai & edtech')) {
    return { ...INDIGO, label: shortLabel(category) };
  }
  if (c.includes('law') || c.includes('clat') || c.includes('mba') || c.includes('cat') || c.includes('management') || c.includes('ipmat')) {
    return { ...AMBER, label: shortLabel(category) };
  }
  // default → amber (Scholarships / Govt Exams / Study Abroad / etc.)
  return { ...AMBER, label: shortLabel(category) };
}

/** Strip the "X / Y" prefix and return a short, uppercase-friendly label */
function shortLabel(category: string): string {
  if (!category) return 'Article';
  // "NEET / Medical" -> "Medical"
  // "MBA / CAT" -> "Management"
  const parts = category.split('/').map((s) => s.trim());
  const last = parts[parts.length - 1] || category;
  // remap to friendly noun
  const map: Record<string, string> = {
    Engineering: 'Engineering',
    Medical: 'Medical',
    Law: 'Law',
    CAT: 'Management',
    CBSE: 'Boards',
    Exams: 'Govt Exams',
    Scholarships: 'Scholarships',
    Abroad: 'Study Abroad',
    EdTech: 'AI & EdTech',
  };
  return map[last] || last;
}

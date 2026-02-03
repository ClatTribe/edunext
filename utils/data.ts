// --- SECTION 1: PERCENTILE CALCULATOR DATA & LOGIC ---

type ScoreMap = Record<number, number>;

export const vaData: ScoreMap = {
  "-10": 17.28, "-9": 19.07, "-8": 20.85, "-7": 22.64, "-6": 24.42, "-5": 26.21, "-4": 28.0, "-3": 29.78, "-2": 31.57, "-1": 33.36,
  0: 35.14, 1: 36.93, 2: 38.71, 3: 40.5, 4: 42.29, 5: 44.07, 6: 45.86, 7: 47.64, 8: 49.43, 9: 51.22, 10: 53.0,
  11: 54.79, 12: 56.58, 13: 58.36, 14: 60.15, 15: 61.93, 16: 63.72, 17: 65.51, 18: 67.29, 19: 69.08, 20: 70.86,
  21: 72.65, 22: 74.44, 23: 76.22, 24: 78.01, 25: 79.8, 26: 81.58, 27: 83.37, 28: 85.15, 29: 86.94, 30: 88.73,
  31: 90.51, 32: 92.3, 33: 94.08, 34: 95.87, 35: 97.66, 36: 99.44, 37: 99.49, 38: 99.54, 39: 99.59, 40: 99.64,
  41: 99.69, 42: 99.74, 43: 99.79, 44: 99.84, 45: 99.89, 46: 99.94, 47: 99.99, 48: 100
};

export const qaData: ScoreMap = {
  "-10": 16.47, "-9": 18.32, "-8": 20.16, "-7": 22.01, "-6": 23.85, "-5": 25.7, "-4": 27.54, "-3": 29.39, "-2": 31.23, "-1": 33.08,
  0: 34.92, 1: 36.77, 2: 38.61, 3: 40.46, 4: 42.3, 5: 44.15, 6: 45.99, 7: 47.84, 8: 49.68, 9: 51.53, 10: 53.37,
  11: 55.22, 12: 57.06, 13: 58.91, 14: 60.75, 15: 62.6, 16: 64.44, 17: 66.29, 18: 68.13, 19: 69.98, 20: 71.82,
  21: 73.67, 22: 75.51, 23: 77.36, 24: 79.2, 25: 81.05, 26: 82.89, 27: 84.74, 28: 86.58, 29: 88.43, 30: 90.27,
  31: 92.12, 32: 93.96, 33: 95.81, 34: 97.65, 35: 99.5, 36: 99.55, 37: 99.6, 38: 99.65, 39: 99.7, 40: 99.75,
  41: 99.8, 42: 99.85, 43: 99.9, 44: 99.95, 45: 100
};

export const dilrData: ScoreMap = {
  "-10": 20.98, "-9": 22.65, "-8": 24.33, "-7": 26.0, "-6": 27.68, "-5": 29.35, "-4": 31.03, "-3": 32.7, "-2": 34.38, "-1": 36.05,
  0: 37.72, 1: 39.4, 2: 41.07, 3: 42.75, 4: 44.42, 5: 46.1, 6: 47.77, 7: 49.45, 8: 51.12, 9: 52.8, 10: 54.47,
  11: 56.15, 12: 57.82, 13: 59.5, 14: 61.17, 15: 62.85, 16: 64.52, 17: 66.2, 18: 67.87, 19: 69.55, 20: 71.22,
  21: 72.9, 22: 74.57, 23: 76.25, 24: 77.92, 25: 79.6, 26: 81.27, 27: 82.95, 28: 84.62, 29: 86.3, 30: 87.97,
  31: 89.65, 32: 91.32, 33: 93.0, 34: 94.67, 35: 96.35, 36: 98.02, 37: 99.7, 38: 99.75, 39: 99.8, 40: 99.85,
  41: 99.9, 42: 99.95, 43: 100
};

export const overallData: ScoreMap = {
  "-10": 15.0, "-9": 16.5, "-8": 18.0, "-7": 19.5, "-6": 21.0, "-5": 22.5, "-4": 24.0, "-3": 25.5, "-2": 27.0, "-1": 28.5,
  0: 30.0, 1: 31.5, 2: 33.0, 3: 34.5, 4: 36.0, 5: 37.5, 6: 39.0, 7: 40.5, 8: 42.0, 9: 43.5, 10: 45.0,
  11: 46.5, 12: 48.0, 13: 49.5, 14: 51.0, 15: 52.5, 16: 54.0, 17: 55.5, 18: 57.0, 19: 58.5, 20: 60.0,
  21: 61.5, 22: 63.0, 23: 64.5, 24: 66.0, 25: 67.5, 26: 69.0, 27: 70.5, 28: 72.0, 29: 73.5, 30: 75.0,
  31: 75.5, 32: 76.0, 33: 76.5, 34: 77.0, 35: 77.5, 36: 78.0, 37: 78.5, 38: 79.0, 39: 79.5, 40: 80.0,
  41: 81.0, 42: 82.0, 43: 83.0, 44: 84.0, 45: 85.0, 46: 85.6, 47: 86.1, 48: 86.7, 49: 87.2, 50: 87.8,
  51: 88.3, 52: 88.9, 53: 89.4, 54: 90.0, 55: 90.91, 56: 91.36, 57: 91.82, 58: 92.27, 59: 92.73, 60: 93.64,
  61: 94.0, 62: 94.4, 63: 94.8, 64: 95.0, 65: 95.0, 66: 95.3, 67: 95.6, 68: 95.9, 69: 96.2, 70: 96.5,
  71: 96.8, 72: 97.1, 73: 97.4, 74: 97.7, 75: 98.0, 76: 98.1, 77: 98.2, 78: 98.2, 79: 98.3, 80: 98.4,
  81: 98.5, 82: 98.5, 83: 98.6, 84: 98.7, 85: 98.8, 86: 98.8, 87: 98.9, 88: 99.0, 89: 99.0, 90: 99.1,
  91: 99.1, 92: 99.2, 93: 99.2, 94: 99.3, 95: 99.3, 96: 99.3, 97: 99.4, 98: 99.4, 99: 99.5, 100: 99.5,
  101: 99.5, 102: 99.5, 103: 99.6, 104: 99.6, 105: 99.6, 106: 99.6, 107: 99.6, 108: 99.7, 109: 99.7, 110: 99.7,
  111: 99.7, 112: 99.7, 113: 99.8, 114: 99.8, 115: 99.8, 116: 99.8, 117: 99.8, 118: 99.9, 119: 99.9, 120: 99.9,
  121: 99.92, 122: 99.94, 123: 99.96, 124: 99.98, 125: 100
};

export const getPercentile = (type: 'VA' | 'QA' | 'DILR' | 'Overall', score: number): number => {
  let map: ScoreMap;
  let maxScore: number;
  
  switch (type) {
    case 'VA': map = vaData; maxScore = 48; break;
    case 'QA': map = qaData; maxScore = 45; break;
    case 'DILR': map = dilrData; maxScore = 43; break;
    case 'Overall': map = overallData; maxScore = 125; break;
  }

  if (score < -10) return map["-10"];
  const lookupScore = Math.round(score);
  if (map[lookupScore] !== undefined) return map[lookupScore];
  if (lookupScore >= maxScore) return 100;
  return 0; 
};

// --- SECTION 2: SERVER-SIDE SEARCH QUERY BUILDER ---

export interface ParsedFilters {
  searchText?: string
  cities: string[]
  states: string[]
  budgetRanges: string[]
  courses: string[]
  entranceExams: string[]
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Delhi NCR", "Jammu and Kashmir", "Ladakh"
];

const COMMON_COURSES = [
  'MBA', 'BBA', 'BCA', 'MCA', 'B.Tech', 'M.Tech', 'B.Com', 'M.Com', 'B.Sc', 'M.Sc',
  'Finance', 'Marketing', 'HR', 'Business Analytics', 'Data Science', 'Computer Science',
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Biotechnology'
];

const COMMON_EXAMS = [
  'CAT', 'XAT', 'CMAT', 'MAT', 'GMAT', 'NMAT', 'SNAP', 'ATMA', 'JEE', 'GATE', 'TANCET'
];

export const parseSearchQuery = (query: string): ParsedFilters => {
  const lowerQuery = query.toLowerCase().trim();
  const filters: ParsedFilters = { 
    cities: [], 
    states: [], 
    budgetRanges: [], 
    courses: [],
    entranceExams: []
  };

  COMMON_COURSES.forEach(course => {
    if (lowerQuery.includes(course.toLowerCase())) filters.courses.push(course);
  });

  COMMON_EXAMS.forEach(exam => {
    if (lowerQuery.includes(exam.toLowerCase())) filters.entranceExams.push(exam);
  });

  INDIAN_STATES.forEach(state => {
    if (lowerQuery.includes(state.toLowerCase())) filters.states.push(state);
  });

  const budgetPatterns = [
    { keywords: ['under 5', 'below 5', 'less than 5', 'upto 5', 'up to 5'], range: "Less than 5 Lakh" },
    { keywords: ['5-10', '5 to 10', 'between 5 and 10', '5 lakh to 10'], range: "5 - 10 Lakh" },
    { keywords: ['10-15', '10 to 15', 'between 10 and 15', '10 lakh to 15'], range: "10 - 15 Lakh" },
    { keywords: ['15-20', '15 to 20', 'between 15 and 20', '15 lakh to 20'], range: "15 - 20 Lakh" },
    { keywords: ['above 20', 'more than 20', 'over 20', '20+', '20 plus'], range: "Above 20 Lakh" },
  ];

  budgetPatterns.forEach(({ keywords, range }) => {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) filters.budgetRanges.push(range);
  });

  const budgetMatch = lowerQuery.match(/(\d+)\s*(lakh|lakhs?|l)/i);
  if (budgetMatch && filters.budgetRanges.length === 0) {
    const amount = parseInt(budgetMatch[1]);
    if (amount <= 5) filters.budgetRanges.push("Less than 5 Lakh");
    else if (amount <= 10) filters.budgetRanges.push("5 - 10 Lakh");
    else if (amount <= 15) filters.budgetRanges.push("10 - 15 Lakh");
    else if (amount <= 20) filters.budgetRanges.push("15 - 20 Lakh");
    else filters.budgetRanges.push("Above 20 Lakh");
  }

  if (Object.values(filters).every(f => Array.isArray(f) ? f.length === 0 : !f)) {
    filters.searchText = query;
  }

  return filters;
};

// --- SECTION 3: IMPROVED BUDGET FILTERING (THE KEY FIX) ---

const parseFeeToLakhs = (feeStr: string): number | null => {
  if (!feeStr) return null;
  let cleaned = feeStr.replace(/₹|Rs\.?|INR|,/gi, '').replace(/Check Details|undefined/gi, '').trim();
  if (!cleaned) return null;
  
  const match = cleaned.match(/([\d,]+\.?\d*)\s*(Lakh|Lac|L|K|Thousand)?/i);
  if (!match) return null;
  
  const num = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();
  
  if (isNaN(num)) return null;
  
  if (unit?.includes('lakh') || unit?.includes('lac') || unit === 'l') return num;
  if (unit === 'k' || unit?.includes('thousand')) return num / 100;
  return num >= 100000 ? num / 100000 : num >= 100 ? num / 100 : num;
};

export const parseBudgetToLakhs = (budgetStr: string | null | undefined): { min: number; max: number } | null => {
  if (!budgetStr) return null;
  const feeParts = budgetStr.split(/[-–—]/).map(part => parseFeeToLakhs(part)).filter(v => v !== null && v > 0) as number[];
  if (feeParts.length === 0) return null;
  return { min: Math.min(...feeParts), max: Math.max(...feeParts) };
};

/**
 * FIXED LOGIC: Uses Overlap Detection
 */
export const isBudgetInRange = (budgetStr: string | null | undefined, selectedRanges: string[]): boolean => {
  if (selectedRanges.length === 0) return true;
  
  const feeRange = parseBudgetToLakhs(budgetStr);
  if (!feeRange) return false;
  
  const { min: feeMin, max: feeMax } = feeRange;
  
  return selectedRanges.some(range => {
    let rangeMin: number, rangeMax: number;
    
    switch (range) {
      case "Less than 5 Lakh": rangeMin = 0; rangeMax = 5; break;
      case "5 - 10 Lakh": rangeMin = 5; rangeMax = 10; break;
      case "10 - 15 Lakh": rangeMin = 10; rangeMax = 15; break;
      case "15 - 20 Lakh": rangeMin = 15; rangeMax = 20; break;
      case "Above 20 Lakh": rangeMin = 20; rangeMax = Infinity; break;
      default: return false;
    }
    
    // OVERLAP LOGIC: 
    // College is shown if its fee range touches or crosses the filter range.
    // College [2.94 - 7.18] touches Filter [5 - 10] because 2.94 <= 10 and 7.18 >= 5.
    return feeMin <= rangeMax && feeMax >= rangeMin;
  });
};

export const applyBudgetFilter = (colleges: any[], budgetRanges: string[]): any[] => {
  if (budgetRanges.length === 0) return colleges;
  return colleges.filter(college => {
    const fees = college.card_detail?.fees || college["Course Fees"];
    return isBudgetInRange(fees, budgetRanges);
  });
};
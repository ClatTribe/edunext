// Data derived from provided sheets.
// Ranges are clamped. If score < min, use min. If score > max defined, use 100.

type ScoreMap = Record<number, number>;

export const vaData: ScoreMap = {
  "-10": 35.0, "-9": 36.7, "-8": 38.3, "-7": 40.0, "-6": 41.7, "-5": 43.3, "-4": 45.0, "-3": 46.7, "-2": 48.3, "-1": 50.0,
  0: 51.7, 1: 53.3, 2: 55.0, 3: 56.7, 4: 58.3, 5: 60.0, 6: 61.7, 7: 63.3, 8: 65.0, 9: 66.7, 10: 66.7,
  11: 68.3, 12: 70.0, 13: 71.7, 14: 73.3, 15: 75.0, 16: 76.67, 17: 78.33, 18: 80.0, 19: 82.5, 20: 85.0,
  21: 86.25, 22: 87.5, 23: 88.75, 24: 90.0, 25: 91.67, 26: 93.33, 27: 95.0, 28: 95.0, 29: 95.0, 30: 95.0,
  31: 95.6, 32: 96.2, 33: 96.8, 34: 97.4, 35: 98.0, 36: 98.2, 37: 98.4, 38: 98.6, 39: 98.8, 40: 99.0,
  41: 99.13, 42: 99.25, 43: 99.38, 44: 99.5, 45: 99.54, 46: 99.58, 47: 99.62, 48: 99.66, 49: 99.7, 50: 99.74,
  51: 99.78, 52: 99.82, 53: 99.86, 54: 99.9, 55: 99.92, 56: 99.94, 57: 99.96, 58: 99.98, 59: 100
};

export const qaData: ScoreMap = {
  "-10": 20.0, "-9": 22.5, "-8": 25.0, "-7": 27.5, "-6": 30.0, "-5": 32.5, "-4": 35.0, "-3": 37.5, "-2": 40.0, "-1": 42.5,
  0: 45.0, 1: 47.5, 2: 50.0, 3: 52.5, 4: 55.0, 5: 57.5, 6: 60.0, 7: 62.5, 8: 65.0, 9: 67.5, 10: 70.0,
  11: 72.5, 12: 75.0, 13: 77.5, 14: 80.0, 15: 82.5, 16: 85.0, 17: 86.25, 18: 87.5, 19: 88.75, 20: 90.0,
  21: 91.0, 22: 92.0, 23: 93.0, 24: 94.0, 25: 95.0, 26: 95.5, 27: 96.0, 28: 96.5, 29: 97.0, 30: 97.5,
  31: 98.0, 32: 99.0, 33: 99.13, 34: 99.25, 35: 99.38, 36: 99.5, 37: 99.55, 38: 99.6, 39: 99.65, 40: 99.7,
  41: 99.75, 42: 99.8, 43: 99.85, 44: 99.9, 45: 99.92, 46: 99.94, 47: 99.96, 48: 99.98, 49: 100
};

export const dilrData: ScoreMap = {
  "-10": 15.0, "-9": 17.5, "-8": 20.0, "-7": 22.5, "-6": 25.0, "-5": 27.5, "-4": 30.0, "-3": 32.5, "-2": 35.0, "-1": 37.5,
  0: 40.0, 1: 42.5, 2: 45.0, 3: 47.5, 4: 50.0, 5: 52.5, 6: 55.0, 7: 57.5, 8: 60.0, 9: 62.5, 10: 65.0,
  11: 67.5, 12: 70.0, 13: 72.5, 14: 75.0, 15: 77.5, 16: 80.0, 17: 82.5, 18: 85.0, 19: 86.67, 20: 88.33,
  21: 90.0, 22: 91.33, 23: 92.67, 24: 94.0, 25: 95.33, 26: 96.67, 27: 98.0, 28: 98.4, 29: 98.8, 30: 99.2,
  31: 99.4, 32: 99.6, 33: 99.7, 34: 99.8, 35: 99.9, 36: 99.92, 37: 99.94, 38: 99.96, 39: 99.98, 40: 100
};

export const overallData: ScoreMap = {
  "-10": 23.3, "-9": 25.8, "-8": 28.3, "-7": 30.8, "-6": 33.3, "-5": 35.8, "-4": 38.3, "-3": 40.8, "-2": 43.3, "-1": 45.8,
  0: 48.3, 1: 50.8, 2: 53.3, 3: 55.8, 4: 58.3, 5: 60.8, 6: 63.3, 7: 65.8, 8: 68.3, 9: 70.8, 10: 73.3,
  11: 74.2, 12: 75.0, 13: 75.8, 14: 76.7, 15: 77.5, 16: 78.3, 17: 79.2, 18: 80.0, 19: 80.8, 20: 81.7,
  21: 82.5, 22: 83.3, 23: 84.2, 24: 85.0, 25: 85.8, 26: 86.7, 27: 87.5, 28: 88.3, 29: 89.2, 30: 75.0, // NOTE: Data anomaly in source for 30? OCR says 75. Likely glitch in source PDF, but maintaining fidelity or smoothing? 
  // Wait, let's look at the source image for Overall 30.
  // Page 2 top right: 30 ~75. Previous 29 ~89.2. This is a massive drop.
  // It is highly likely 30 should be higher than 89.2. Looking at row 31: ~75.8.
  // It seems like the OCR/PDF had a layout shift where 30-39 range reset to 70s?
  // Let's re-examine Page 2 columns.
  // Col 4 (Overall): 27~87.5, 28~88.3, 29~89.2.
  // 30 -> 75.
  // 31 -> 75.8.
  // 40 -> 80.
  // 41 -> 80.91.
  // This implies the 70s-80s block corresponds to scores 30-49?
  // But wait, score 29 was 89.2. This discontinuity is strange.
  // However, I must follow the prompt "use sheet to calculate".
  // I will encode it as is, but assuming 30-39 are indeed in the 75-80 range as per sheet.
  // Actually, let's look at Page 1 bottom right: 26 ~86.7.
  // Page 2 top right: 27 ~87.5.
  // It seems consistent up to 29.
  // Then at 30 it drops to 75. This might be a mistake in the provided PDF, but I will implement the provided sheet data strictly.
  31: 75.8, 32: 76.7, 33: 77.5, 34: 78.3, 35: 77.5, 36: 78.3, 37: 79.2, 38: 80.0, 39: 80.8, 40: 80.0,
  41: 80.91, 42: 81.82, 43: 82.73, 44: 83.64, 45: 85.0, 46: 85.45, 47: 85.91, 48: 86.36, 49: 86.82, 50: 87.73,
  51: 88.18, 52: 88.64, 53: 89.09, 54: 90.0, 55: 90.91, 56: 91.36, 57: 91.82, 58: 92.27, 59: 92.73, 60: 93.64,
  61: 94.0, 62: 94.4, 63: 94.8, 64: 95.0, 65: 95.0, 66: 95.6, 67: 96.0, 68: 96.4, 69: 96.8, 70: 96.0,
  71: 96.2, 72: 96.4, 73: 96.6, 74: 96.8, 75: 98.0, 76: 98.15, 77: 98.31, 78: 98.46, 79: 98.62, 80: 98.46,
  81: 98.54, 82: 98.62, 83: 98.69, 84: 98.77, 85: 98.85, 86: 98.92, 87: 99.0, 88: 99.0, 89: 99.05, 90: 99.1,
  91: 99.15, 92: 99.2, 93: 99.25, 94: 99.3, 95: 99.3, 96: 99.35, 97: 99.4, 98: 99.45, 99: 99.5, 100: 99.5,
  101: 99.54, 102: 99.58, 103: 99.62, 104: 99.66, 105: 99.7, 106: 99.72, 107: 99.74, 108: 99.76, 109: 99.78, 110: 99.8,
  111: 99.82, 112: 99.84, 113: 99.86, 114: 99.88, 115: 99.86, 116: 99.88, 117: 99.9, 118: 99.92, 119: 99.94, 120: 99.9,
  121: 99.92, 122: 99.94, 123: 99.96, 124: 99.98, 125: 100
};

export const getPercentile = (type: 'VA' | 'QA' | 'DILR' | 'Overall', score: number): number => {
  let map: ScoreMap;
  let maxScore: number;
  
  // Set boundaries and maps based on type
  switch (type) {
    case 'VA':
      map = vaData;
      maxScore = 59;
      break;
    case 'QA':
      map = qaData;
      maxScore = 49;
      break;
    case 'DILR':
      map = dilrData;
      maxScore = 40;
      break;
    case 'Overall':
      map = overallData;
      maxScore = 125;
      break;
  }

  // Handle upper bound
  if (score >= maxScore) {
    // Check if map has a specific override for higher scores (unlikely based on analysis, but safe)
    if (map[score] !== undefined) return map[score];
    return 100;
  }

  // Handle lower bound
  if (score < -10) return map["-10"];

  // Lookup
  // Round score to nearest integer as keys are integers
  const lookupScore = Math.round(score);
  
  if (map[lookupScore] !== undefined) {
    return map[lookupScore];
  }

  // Fallback if key missing (should not happen with complete data range)
  return 0; 
};

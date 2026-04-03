import { StudentProfile, CollegeProfile, DnaType } from '../types'
import { DNA_COMPATIBILITY_MATRIX } from './dnaMatch'

export function computeFitScore(student: StudentProfile, college: CollegeProfile): number {
  let score = 0

  // 1. Academic alignment (max 40pts)
  score += computeAcademicAlignment(student, college)

  // 2. DNA compatibility (max 25pts)
  if (student.dnaType && college.dnaType) {
    score += DNA_COMPATIBILITY_MATRIX[student.dnaType][college.dnaType]
  } else {
    score += 12
  }

  // 3. Interest alignment (max 20pts)
  score += computeInterestAlignment(student, college)

  // 4. Engagement / profile quality (max 15pts)
  score += Math.round((student.profileCompletenessPct / 100) * 15)

  return Math.min(100, Math.round(score))
}

function computeAcademicAlignment(student: StudentProfile, college: CollegeProfile): number {
  // Simple heuristic: board percentage maps to academic quality expectation
  const bp = student.boardPercentage || 0

  // Higher board % and higher NIRF rank = better fit
  let academicScore = 0

  if (bp >= 90) academicScore = 35
  else if (bp >= 80) academicScore = 30
  else if (bp >= 70) academicScore = 22
  else if (bp >= 60) academicScore = 15
  else academicScore = 8

  // Bonus for entrance score if applicable
  if (student.entranceScore && student.entranceScore !== 'N/A') {
    academicScore = Math.min(40, academicScore + 5)
  }

  return Math.min(40, academicScore)
}

function computeInterestAlignment(student: StudentProfile, college: CollegeProfile): number {
  let score = 0

  // Degree type match (12pts max)
  const studentDegree = student.targetDegree?.toLowerCase() || ''
  const collegePrograms = college.programs?.map(p => p.degree?.toLowerCase() || '') || []

  if (collegePrograms.some(p => p.includes(studentDegree) || studentDegree.includes(p))) {
    score += 12
  } else if (collegePrograms.length > 0) {
    score += 4 // some programs available
  }

  // Region match (8pts max)
  if (student.cityPreference === 'anywhere') {
    score += 6
  } else if (student.cityPreference === 'nearby' && student.state === college.state) {
    score += 8
  } else if (student.city === college.city) {
    score += 8
  } else {
    score += 3
  }

  return Math.min(20, score)
}

export function computeProfileCompleteness(student: Partial<StudentProfile>): number {
  let pct = 0
  if (student.fullName && student.city) pct += 20
  if (student.boardPercentage) pct += 15
  if (student.dnaType) pct += 25
  if (student.sopPolished && student.sopPolished.length > 100) pct += 20
  if (student.extracurriculars && student.extracurriculars.length >= 3) pct += 10
  if (student.achievements && student.achievements.length >= 1) pct += 5
  if (student.videoResumeUrl) pct += 5
  return Math.min(100, pct)
}

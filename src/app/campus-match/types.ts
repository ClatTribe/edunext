export type DnaType = 'Explorer' | 'Builder' | 'Scholar' | 'Leader' | 'Creator' | 'Connector'
export type SignalType = 'like' | 'scholarship_watch' | 'priority_interview' | 'under_review'
export type SwipeDirection = 'left' | 'right'
export type MatchType = 'mutual' | 'college_led' | 'student_led'

export interface StudentProfile {
  id: string
  userId: string
  fullName: string
  city: string
  state: string
  classYear: string
  stream: string
  board: string
  boardPercentage: number
  entranceExam: string
  entranceScore: string
  targetDegree: string
  cityPreference: string
  hostelNeeded: string
  sopRaw: string
  sopPolished: string
  bioShort: string
  dnaType: DnaType | null
  dnaQuizScores: Record<string, number> | null
  extracurriculars: { tag: string; role: string; duration: string; level: string }[]
  achievements: { name: string; level: string }[]
  videoResumeUrl: string | null
  videoResumeTranscript: string | null
  fitScoreCache: Record<string, number>
  ghostMode: boolean
  profileComplete: boolean
  profileCompletenessPct: number
  createdAt: string
  updatedAt: string
}

export interface CollegeProfile {
  id: string
  name: string
  city: string
  state: string
  type: string
  programs: { name: string; degree: string; duration: string; feesPerYearInr: number }[]
  dnaType: DnaType | null
  dnaDescription: string
  nirfRank: number | null
  naacGrade: string | null
  logoUrl: string | null
  bannerUrl: string | null
  website: string | null
  aboutShort: string
  placementAvgLpa: number
  placementHighestLpa: number
  totalIntake: number
  campusAreaAcres: number
  hostelAvailable: boolean
  vibeScoreCache: Record<string, number>
  vibeRatingCount: number
  featured: boolean
  active: boolean
  createdAt: string
}

export interface Swipe {
  id: string
  studentId: string
  collegeId: string
  direction: SwipeDirection
  createdAt: string
}

export interface CollegeSignal {
  id: string
  collegeId: string
  studentId: string
  signalType: SignalType
  note: string | null
  createdAt: string
}

export interface Match {
  id: string
  studentId: string
  collegeId: string
  matchType: MatchType
  signalType: SignalType | null
  icebreakerText: string | null
  icebreakerSentAt: string | null
  studentResponded: boolean
  collegeResponded: boolean
  applicationReady: boolean
  createdAt: string
  // Joined data
  student?: StudentProfile
  college?: CollegeProfile
}

export interface VibeScore {
  academicQuality: number
  placementReality: number
  campusSafety: number
  foodHostel: number
  studentLife: number
  facultyAccessibility: number
  mentalHealthSupport: number
  lgbtqFriendliness: number
}

export interface DnaQuizQuestion {
  id: number
  dimension: string
  text: string
  leftAnchor: string
  rightAnchor: string
  subtext?: string
}

export interface OnboardingData {
  fullName: string
  city: string
  state: string
  classYear: string
  stream: string
  board: string
  boardPercentage: number | null
  entranceExam: string
  entranceScore: string
  targetDegree: string
  cityPreference: string
  hostelNeeded: string
}

import React, { useState, useEffect } from "react"
import { Sparkles, Trophy, Award, Target, AlertCircle } from "lucide-react"
import { supabase } from "../../lib/supabase"

interface Course {
  id: number
  Rank?: string | null
  "College Name": string | null
  Location?: string | null
  City?: string | null
  State?: string | null
  Approvals?: string | null
  "CD Score"?: string | null
  "Course Fees"?: string | null
  "Average Package"?: string | null
  "Highest Package"?: string | null
  "Placement %"?: string | null
  "Placement Score"?: string | null
  "User Rating"?: string | null
  "User Reviews"?: string | null
  Ranking?: string | null
  Specialization?: string | null
  "Application Link"?: string | null
  scholarship?: string | null
  entrance_exam?: string | null
  matchScore?: number
}

interface TestScore {
  exam: string
  percentile?: string
  score?: string
}

interface UserProfile {
  target_state: string[]
  degree: string
  test_scores: TestScore[]
}

interface ClgsRecommendProps {
  user: unknown
  viewMode: "all" | "recommended"
  onRecommendedCoursesChange: (courses: Course[]) => void
  onLoadingChange: (loading: boolean) => void
  onErrorChange: (error: string | null) => void
}

const ClgsRecommend: React.FC<ClgsRecommendProps> = ({
  user,
  viewMode,
  onRecommendedCoursesChange,
  onLoadingChange,
  onErrorChange,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  useEffect(() => {
    if (!loadingProfile && viewMode === "recommended") {
      fetchRecommendedCourses()
    }
  }, [loadingProfile, viewMode])

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true)
      if (!user || typeof user !== 'object' || !('id' in user)) {
        setUserProfile(null)
        setLoadingProfile(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from("admit_profiles")
        .select("target_state, degree, test_scores")
        .eq("user_id", (user as { id: string }).id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        setUserProfile(null)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setUserProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  const normalizeStateName = (state: string): string => {
    return state.toLowerCase().trim().replace(/\s+/g, " ")
  }

  const calculateMatchScore = (course: Course): number => {
    if (!userProfile) return 0
    let score = 0

    // 1. Test Score Matching (65 points - MOST IMPORTANT)
    if (userProfile.test_scores && Array.isArray(userProfile.test_scores) && userProfile.test_scores.length > 0) {
      let bestTestScore = 0
      
      for (const testScore of userProfile.test_scores) {
        const exam = testScore.exam?.toLowerCase() || ""
        const percentile = parseFloat(testScore.percentile || "0")
        const scoreValue = parseFloat(testScore.score || "0")
        
        // Check if course accepts this entrance exam
        const courseEntrance = course.entrance_exam?.toLowerCase() || ""
        
        // Broad matching for common exams
        const examMatches = 
          (exam.includes("cat") && courseEntrance.includes("cat")) ||
          (exam.includes("gate") && courseEntrance.includes("gate")) ||
          (exam.includes("gmat") && courseEntrance.includes("gmat")) ||
          (exam.includes("gre") && courseEntrance.includes("gre")) ||
          (exam.includes("jee") && courseEntrance.includes("jee")) ||
          (exam.includes("neet") && courseEntrance.includes("neet")) ||
          (exam.includes("cmat") && courseEntrance.includes("cmat")) ||
          (exam.includes("xat") && courseEntrance.includes("xat")) ||
          courseEntrance.includes("all") ||
          courseEntrance.includes("any")

        if (examMatches || !courseEntrance) {
          // Score based on percentile/score
          let testPoints = 0
          
          if (percentile > 0) {
            if (percentile >= 99) testPoints = 65
            else if (percentile >= 95) testPoints = 60
            else if (percentile >= 90) testPoints = 55
            else if (percentile >= 85) testPoints = 50
            else if (percentile >= 80) testPoints = 45
            else if (percentile >= 75) testPoints = 40
            else if (percentile >= 70) testPoints = 35
            else if (percentile >= 60) testPoints = 30
            else if (percentile >= 50) testPoints = 25
            else testPoints = 20
          } else if (scoreValue > 0) {
            // Normalize score (assuming most exams are out of 100 or percentile-like)
            const normalizedScore = scoreValue > 100 ? scoreValue / 10 : scoreValue
            if (normalizedScore >= 90) testPoints = 60
            else if (normalizedScore >= 80) testPoints = 50
            else if (normalizedScore >= 70) testPoints = 40
            else if (normalizedScore >= 60) testPoints = 30
            else testPoints = 20
          }
          
          bestTestScore = Math.max(bestTestScore, testPoints)
        }
      }
      
      score += bestTestScore
      
      // If no test scores matched any entrance exam, give partial credit
      if (bestTestScore === 0 && userProfile.test_scores.length > 0) {
        score += 10
      }
    }

    // 2. Degree Matching (25 points)
    if (userProfile.degree && course.Specialization) {
      const userDegree = userProfile.degree.toLowerCase().trim()
      const specialization = course.Specialization.toLowerCase()
      
      // Extract degree keywords
      const degreeKeywords = ["mba", "mtech", "btech", "bba", "bca", "mca", "phd", "pgdm", "be", "me", "ms", "ma", "ba", "bsc", "msc"]
      const userDegreeType = degreeKeywords.find(kw => userDegree.includes(kw))
      const courseDegreeType = degreeKeywords.find(kw => specialization.includes(kw))
      
      if (userDegreeType && courseDegreeType && userDegreeType === courseDegreeType) {
        score += 25
      } else if (userDegreeType && courseDegreeType) {
        // Partial match for related degrees (e.g., BE and BTech, MBA and PGDM)
        const relatedDegrees: Record<string, string[]> = {
          "btech": ["be", "btech"],
          "be": ["be", "btech"],
          "mtech": ["me", "mtech", "ms"],
          "me": ["me", "mtech", "ms"],
          "ms": ["me", "mtech", "ms"],
          "mba": ["mba", "pgdm"],
          "pgdm": ["mba", "pgdm"]
        }
        
        const userRelated = relatedDegrees[userDegreeType] || [userDegreeType]
        if (userRelated.includes(courseDegreeType)) {
          score += 25
        } else {
          score += 10
        }
      }
    }

    // 3. State/Location Matching (10 points)
    if (userProfile.target_state && userProfile.target_state.length > 0 && course.State) {
      const courseState = normalizeStateName(course.State)
      const matchesState = userProfile.target_state.some((state) => {
        const targetState = normalizeStateName(state)
        return courseState.includes(targetState) || targetState.includes(courseState)
      })
      
      if (matchesState) {
        score += 10
      }
    }

    return Math.min(score, 100)
  }

  const fetchRecommendedCourses = async () => {
    try {
      onLoadingChange(true)
      onErrorChange(null)

      if (!userProfile) {
        onErrorChange("Please complete your profile to see personalized recommendations")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      if (!userProfile.degree) {
        onErrorChange("Please select your target degree in your profile")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      // Fetch all courses in batches
      let allCourses: Course[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from("courses")
          .select(
            'id, Rank, "College Name", Location, City, State, Approvals, "CD Score", "Course Fees", "Average Package", "Highest Package", "Placement %", "Placement Score", "User Rating", "User Reviews", Ranking, Specialization, "Application Link", scholarship, entrance_exam'
          )
          .order("id", { ascending: true })
          .range(from, from + batchSize - 1)

        if (supabaseError) throw supabaseError

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data]
          hasMore = data.length === batchSize
          from += batchSize
        } else {
          hasMore = false
        }
      }

      // Filter out courses without a college name
      const filtered = allCourses.filter((course) => {
        if (!course["College Name"]) return false
        return true
      })

      // Calculate match scores for all courses
      const scoredCourses = filtered.map((course) => ({
        ...course,
        matchScore: calculateMatchScore(course),
      }))

      // Filter for relevant courses (score > 15)
      const relevantCourses = scoredCourses.filter((c) => (c.matchScore || 0) > 15)

      // Get top 10 recommendations sorted by match score
      const topRecommendations = relevantCourses
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 10)

      // If we don't have 10 recommendations, fill with the best remaining courses
      if (topRecommendations.length < 10) {
        const remaining = scoredCourses
          .filter((c) => !topRecommendations.find((t) => t.id === c.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10 - topRecommendations.length)

        topRecommendations.push(...remaining)
      }

      onRecommendedCoursesChange(topRecommendations)
    } catch (err) {
      onErrorChange(err instanceof Error ? err.message : "Failed to fetch recommended courses")
      console.error("Error fetching recommended courses:", err)
    } finally {
      onLoadingChange(false)
    }
  }

  const getMatchBadge = (matchScore?: number) => {
    if (!matchScore) return null

    if (matchScore >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          Perfect Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          Excellent Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          Great Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
          Good Match ({matchScore}%)
        </span>
      )
    }

    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
        Relevant ({matchScore}%)
      </span>
    )
  }

  const hasProfileData = userProfile && userProfile.degree

  return (
    <>
      {viewMode === "recommended" && userProfile && hasProfileData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                Showing your top 10 personalized recommendations
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on: <strong>{userProfile.degree}</strong> degree
                {userProfile.test_scores && userProfile.test_scores.length > 0 && (
                  <>
                    {" "}
                    | Test Scores: <strong>{userProfile.test_scores.map(t => t.exam).join(", ")}</strong>
                  </>
                )}
                {userProfile.target_state && userProfile.target_state.length > 0 && (
                  <>
                    {" "}
                    | Preferred States: <strong>{userProfile.target_state.join(", ")}</strong>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ClgsRecommend
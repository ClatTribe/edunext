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
  "Average Package"?: string | null
  "Highest Package"?: string | null
  "Placement %"?: string | null
  "Placement Score"?: string | null
  "User Rating"?: string | null
  "User Reviews"?: string | null
  Ranking?: string | null
  Specialization?: string | null
  "Application Link"?: string | null
  matchScore?: number
}

interface UserProfile {
  target_state: string[]
  degree: string
  program: string
  budget: string | null
  twelfth_score: string | null
  ug_score: string | null
  pg_score: string | null
  test_scores: Array<{ exam: string; percentile: string }>
  has_experience: string | null
  experience_years: string | null
}

interface ClgsRecommendProps {
  user: any
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
      if (!user) {
        setUserProfile(null)
        setLoadingProfile(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from("admit_profiles")
        .select(
          "target_state, degree, program, budget, twelfth_score, ug_score, pg_score, test_scores, has_experience, experience_years"
        )
        .eq("user_id", user.id)
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

  const calculateMatchScore = (course: Course): number => {
    if (!userProfile) return 0
    let score = 0

    // Program/Specialization matching (max 50 points)
    if (userProfile.program && course.Specialization) {
      const userProgram = userProfile.program.toLowerCase().trim()
      const specialization = course.Specialization.toLowerCase()
      const commonWords = ["in", "of", "and", "the", "for", "with", "on", "at", "to", "a", "an"]
      const userKeywords = userProgram.split(/[\s,\-/]+/).filter((k) => k.length > 2 && !commonWords.includes(k))

      // Exact or substring match
      if (specialization.includes(userProgram)) {
        score += 50
      } else {
        // Keyword-based matching
        let keywordMatches = 0
        const totalKeywords = userKeywords.length || 1

        for (const keyword of userKeywords) {
          if (specialization.includes(keyword)) {
            keywordMatches++
          }
        }

        const matchPercentage = keywordMatches / totalKeywords

        if (matchPercentage >= 0.8) score += 45
        else if (matchPercentage >= 0.6) score += 38
        else if (matchPercentage >= 0.4) score += 30
        else if (matchPercentage >= 0.2) score += 20
        else if (keywordMatches > 0) score += 10
      }

      // Field group matching (bonus points)
      const fieldGroups: Record<string, string[]> = {
        cs: [
          "computer",
          "software",
          "data",
          "artificial",
          "intelligence",
          "machine",
          "learning",
          "cyber",
          "information",
          "technology",
        ],
        business: ["business", "management", "mba", "finance", "accounting", "marketing", "economics"],
        engineering: ["engineering", "mechanical", "electrical", "civil", "chemical", "industrial"],
        science: ["science", "biology", "chemistry", "physics", "mathematics", "statistics"],
        arts: ["art", "design", "music", "theatre", "media", "communication", "journalism"],
      }

      for (const group of Object.values(fieldGroups)) {
        const userInGroup = group.some((term) => userProgram.includes(term))
        const courseInGroup = group.some((term) => specialization.includes(term))

        if (userInGroup && courseInGroup && score < 30) {
          score += 15
          break
        }
      }
    }

    // Degree matching (20 points)
    if (userProfile.degree) {
      score += 20
    }

    // Location/State matching (10 points)
    if (userProfile.target_state && userProfile.target_state.length > 0 && course.State) {
      const courseState = course.State.toLowerCase().trim()
      const matchesState = userProfile.target_state.some((state) => {
        const targetState = state.toLowerCase().trim()
        return courseState.includes(targetState) || targetState.includes(courseState)
      })
      if (matchesState) {
        score += 10
      }
    }

    // Budget matching (10 points) - if course fees data available
    // This is a placeholder - you may need to adjust based on your actual fee data
    if (userProfile.budget && course["Average Package"]) {
      score += 5
    }

    // Academic score matching (10 points)
    if (userProfile.ug_score || userProfile.twelfth_score) {
      score += 5
    }

    return Math.min(score, 100) // Cap at 100
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

      if (!userProfile.program) {
        onErrorChange("Please select your field of study in your profile")
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
            'id, Rank, "College Name", Location, City, State, Approvals, "CD Score", "Average Package", "Highest Package", "Placement %", "Placement Score", "User Rating", "User Reviews", Ranking, Specialization, "Application Link"'
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

      // Filter for relevant courses (score > 10)
      const relevantCourses = scoredCourses.filter((c) => (c.matchScore || 0) > 10)

      // Get top 10 recommendations
      const topRecommendations = relevantCourses.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 10)

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

  const hasProfileData = userProfile && userProfile.degree && userProfile.program

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
                {userProfile.program && (
                  <>
                    {" "}
                    | Program: <strong>{userProfile.program}</strong>
                  </>
                )}
                {userProfile.target_state && userProfile.target_state.length > 0 && (
                  <>
                    {" "}
                    | Preferred: <strong>{userProfile.target_state.join(", ")}</strong>
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
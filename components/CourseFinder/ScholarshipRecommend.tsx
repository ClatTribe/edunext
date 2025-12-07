import React, { useState, useEffect } from "react"
import { Sparkles, Trophy, Award, Target } from "lucide-react"
import { supabase } from "../../lib/supabase"

interface Scholarship {
  id: number
  scholarship_name: string
  organisation: string
  eligibility: string
  benefit: string
  deadline: string
  link: string
  created_at?: string
  matchScore?: number
  country_region?: string
  provider?: string
  degree_level?: string
  detailed_eligibility?: string
  price?: string
  isFeatured?: boolean
}

interface UserProfile {
  target_state: string[]
  degree: string
  program: string
}

interface ScholarshipRecommendProps {
  user: unknown
  viewMode: "all" | "recommended"
  featuredScholarship: Scholarship
  onRecommendedScholarshipsChange: (scholarships: Scholarship[]) => void
  onLoadingChange: (loading: boolean) => void
  onErrorChange: (error: string | null) => void
}

const ScholarshipRecommend: React.FC<ScholarshipRecommendProps> = ({
  user,
  viewMode,
  featuredScholarship,
  onRecommendedScholarshipsChange,
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
      fetchRecommendedScholarships()
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
        .select("target_state, degree, program")
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

  const calculateMatchScore = (scholarship: Scholarship): number => {
    if (scholarship.isFeatured) return 100
    if (!userProfile) return 0
    let score = 0

    if (userProfile.program && scholarship.scholarship_name) {
      const userProgram = userProfile.program.toLowerCase()
      const scholarshipName = (scholarship.scholarship_name || "").toLowerCase()
      const eligibility = (scholarship.eligibility || "").toLowerCase()
      const programKeywords = userProgram.split(/[\s,\-/]+/).filter((k) => k.length > 2)
      let keywordMatches = 0

      for (const keyword of programKeywords) {
        if (scholarshipName.includes(keyword) || eligibility.includes(keyword)) {
          keywordMatches++
        }
      }

      const matchPercentage = keywordMatches / (programKeywords.length || 1)
      if (matchPercentage >= 0.5) score += 60
      else if (matchPercentage >= 0.3) score += 40
      else if (keywordMatches > 0) score += 20
    }

    if (scholarship.eligibility) {
      const eligibility = scholarship.eligibility.toLowerCase()
      score += Math.min(40, eligibility.length / 10)
    }

    return Math.min(100, score)
  }

  const fetchRecommendedScholarships = async () => {
    try {
      onLoadingChange(true)
      onErrorChange(null)

      if (!userProfile || !userProfile.degree) {
        onErrorChange("Please complete your profile to see personalized recommendations")
        onRecommendedScholarshipsChange([featuredScholarship])
        onLoadingChange(false)
        return
      }

      const { data, error: supabaseError } = await supabase
        .from("scholarship")
        .select("*")
        .order("deadline", { ascending: true })

      if (supabaseError) throw supabaseError

      const filtered = (data || []).filter((scholarship) => scholarship.scholarship_name)
      const scoredScholarships = filtered.map((scholarship) => ({
        ...scholarship,
        matchScore: calculateMatchScore(scholarship),
      }))

      const relevantScholarships = scoredScholarships.filter((s) => (s.matchScore || 0) > 10)
      const topRecommendations = relevantScholarships
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 9)

      if (topRecommendations.length < 9) {
        const remaining = scoredScholarships
          .filter((s) => !topRecommendations.find((t) => t.id === s.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 9 - topRecommendations.length)
        topRecommendations.push(...remaining)
      }

      onRecommendedScholarshipsChange([featuredScholarship, ...topRecommendations])
    } catch (err) {
      onErrorChange(err instanceof Error ? err.message : "Failed to fetch recommended scholarships")
      console.error("Error fetching recommended scholarships:", err)
    } finally {
      onLoadingChange(false)
    }
  }

  const getMatchBadge = (matchScore?: number) => {
    if (!matchScore) return null

    if (matchScore >= 90) {
      return (
        <span className="text-xs bg-gradient-to-r from-[#fac300] to-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Perfect ({matchScore.toFixed(0)}%)</span>
          <span className="sm:hidden">{matchScore.toFixed(0)}%</span>
        </span>
      )
    } else if (matchScore >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-[#2f61ce] px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Excellent ({matchScore.toFixed(0)}%)</span>
          <span className="sm:hidden">{matchScore.toFixed(0)}%</span>
        </span>
      )
    } else if (matchScore >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Great ({matchScore.toFixed(0)}%)</span>
          <span className="sm:hidden">{matchScore.toFixed(0)}%</span>
        </span>
      )
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold">{matchScore.toFixed(0)}%</span>
  }

  const hasProfileData = userProfile && userProfile.degree && userProfile.program

  return (
    <>
      {viewMode === "recommended" && userProfile && hasProfileData && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-yellow-50 border-2 border-[#fac300] rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="text-[#fac300] mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                Showing your top 10 personalized recommendations (including our featured opportunity).
              </p>
              <p className="text-xs text-gray-700 mt-1 break-words">
                Based on: <strong>{userProfile.degree}</strong>
                {userProfile.program && <> | Program: <strong>{userProfile.program}</strong></>}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { ScholarshipRecommend }
export type { Scholarship, UserProfile }
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  ChevronDown,
  Heart,
  Calendar,
  Award,
  ExternalLink,
  Filter,
  X,
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  Globe,
  GraduationCap,
  IndianRupee,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"

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
}

interface UserProfile {
  target_state: string[]
  degree: string
  program: string
}

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedScholarships, setSavedScholarships] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrganisation, setSelectedOrganisation] = useState("")
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
    if (user) {
      loadSavedScholarships()
    }
  }, [user])

  useEffect(() => {
    if (!loadingProfile) {
      if (viewMode === "all") {
        fetchScholarships()
      } else {
        fetchRecommendedScholarships()
      }
    }
  }, [loadingProfile, viewMode])

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [searchQuery, selectedOrganisation, scholarships, viewMode])

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
        .select("target_state, degree, program")
        .eq("user_id", user.id)
        .single()

      if (profileError) {
        setUserProfile(null)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (err) {
      setUserProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadSavedScholarships = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("shortlist_builder")
        .select("scholarship_id")
        .eq("user_id", user.id)
        .eq("item_type", "scholarship")

      if (error) return
      if (data) {
        const scholarshipIds = new Set(data.map((item) => item.scholarship_id).filter(Boolean))
        setSavedScholarships(scholarshipIds)
      }
    } catch (error) {
      console.error("Error loading saved scholarships:", error)
    }
  }

  const toggleSaveScholarship = async (scholarshipId: number) => {
    if (!user) {
      alert("Please login to save scholarships")
      return
    }

    try {
      const isSaved = savedScholarships.has(scholarshipId)
      if (isSaved) {
        const { error } = await supabase
          .from("shortlist_builder")
          .delete()
          .eq("user_id", user.id)
          .eq("scholarship_id", scholarshipId)
          .eq("item_type", "scholarship")

        if (error) throw error
        setSavedScholarships((prev) => {
          const newSet = new Set(prev)
          newSet.delete(scholarshipId)
          return newSet
        })
      } else {
        const { error } = await supabase.from("shortlist_builder").insert({
          user_id: user.id,
          item_type: "scholarship",
          scholarship_id: scholarshipId,
          status: "interested",
        })

        if (error) throw error
        setSavedScholarships((prev) => new Set([...prev, scholarshipId]))
      }
    } catch (error) {
      alert("Failed to update shortlist. Please try again.")
    }
  }

  const calculateMatchScore = (scholarship: Scholarship): number => {
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
      setLoading(true)
      setError(null)

      if (!userProfile || !userProfile.degree) {
        setError("Please complete your profile to see personalized recommendations")
        setFilteredScholarships([])
        setLoading(false)
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
        .slice(0, 10)

      if (topRecommendations.length < 10) {
        const remaining = scoredScholarships
          .filter((s) => !topRecommendations.find((t) => t.id === s.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10 - topRecommendations.length)
        topRecommendations.push(...remaining)
      }

      setFilteredScholarships(topRecommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommended scholarships")
    } finally {
      setLoading(false)
    }
  }

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: supabaseError } = await supabase
        .from("scholarship")
        .select("*")
        .order("deadline", { ascending: true })

      if (supabaseError) throw supabaseError
      const validScholarships = (data || []).filter((s) => s.scholarship_name !== null)
      setScholarships(validScholarships)
      setFilteredScholarships(validScholarships)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scholarships")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...scholarships]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (scholarship) =>
          scholarship.scholarship_name?.toLowerCase().includes(query) ||
          scholarship.organisation?.toLowerCase().includes(query) ||
          scholarship.eligibility?.toLowerCase().includes(query),
      )
    }

    if (selectedOrganisation) {
      filtered = filtered.filter((s) => s.organisation === selectedOrganisation)
    }

    setFilteredScholarships(filtered)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedOrganisation("")
  }

  const clearFilter = (filterName: string) => {
    if (filterName === "organisation") setSelectedOrganisation("")
    if (filterName === "search") setSearchQuery("")
  }

  const getMatchBadge = (scholarship: Scholarship) => {
    if (viewMode !== "recommended" || !scholarship.matchScore) return null
    const score = scholarship.matchScore

    if (score >= 90) {
      return (
        <span className="text-xs bg-gradient-to-r from-[#fac300] to-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Perfect ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-[#2f61ce] px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Excellent ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Great ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold">{score.toFixed(0)}%</span>
  }

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website"
    if (
      dateString.toLowerCase().includes("varies") ||
      dateString.toLowerCase().includes("rolling") ||
      dateString.toLowerCase().includes("typically")
    ) {
      return dateString
    }

    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      }
      return dateString
    } catch {
      return dateString
    }
  }

  const getUniqueOrganisations = () => {
    const organisations = scholarships.map((s) => s.organisation)
    return [...new Set(organisations)].filter(Boolean).sort()
  }

  const activeFiltersCount = [searchQuery, selectedOrganisation].filter(Boolean).length
  const hasProfileData = userProfile && userProfile.degree && userProfile.program
  const canShowRecommendations = hasProfileData && !loadingProfile

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2f61ce] mb-1 sm:mb-2">
              Find Scholarships to Fuel Your Dreams
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Discover scholarships from top universities and institutions Nationwide
            </p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                resetFilters()
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "all"
                  ? "bg-[#2f61ce] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <Award size={18} className="sm:w-5 sm:h-5" />
              All Scholarships
            </button>
            <button
              onClick={() => {
                if (canShowRecommendations) {
                  setViewMode("recommended")
                  resetFilters()
                }
              }}
              disabled={!canShowRecommendations}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "recommended"
                  ? "bg-[#2f61ce] text-white shadow-lg"
                  : canShowRecommendations
                    ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Recommended For You</span>
              <span className="sm:hidden">Recommended</span>
              {!loadingProfile && !hasProfileData && <span className="hidden sm:inline text-xs ml-1">(Complete profile)</span>}
            </button>
          </div>

          {viewMode === "recommended" && userProfile && hasProfileData && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-yellow-50 border-2 border-[#fac300] rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="text-[#fac300] mt-0.5 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Showing your top 10 personalized recommendations
                  </p>
                  <p className="text-xs text-gray-700 mt-1 break-words">
                    Based on: <strong>{userProfile.degree}</strong>
                    {userProfile.program && <> | Program: <strong>{userProfile.program}</strong></>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {viewMode === "all" && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2f61ce] text-white rounded-lg text-sm sm:text-base font-medium hover:bg-[#2451a8] transition whitespace-nowrap"
                  >
                    <Filter size={18} className="sm:w-5 sm:h-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-[#fac300] text-gray-900 px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <div className="bg-blue-100 text-[#2f61ce] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">Search: {searchQuery}</span>
                        <button onClick={() => clearFilter("search")} className="hover:bg-blue-200 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {selectedOrganisation && (
                      <div className="bg-blue-100 text-[#2f61ce] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedOrganisation}</span>
                        <button onClick={() => clearFilter("organisation")} className="hover:bg-blue-200 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <button onClick={resetFilters} className="text-xs sm:text-sm text-[#2f61ce] font-medium px-2">
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {showFilters && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                    <Filter size={18} className="sm:w-5 sm:h-5 text-[#2f61ce]" />
                    Refine Your Search
                  </h3>
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      <Globe size={14} className="sm:w-4 sm:h-4 text-[#2f61ce]" />
                      Organisation
                    </label>
                    <div className="relative">
                      <select
                        className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                        value={selectedOrganisation}
                        onChange={(e) => setSelectedOrganisation(e.target.value)}
                      >
                        <option value="">All Organisations</option>
                        {getUniqueOrganisations().map((organisation) => (
                          <option key={organisation} value={organisation}>
                            {organisation}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-500" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-[#2f61ce] flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-800 text-sm sm:text-base">Notice</h3>
                <p className="text-[#2f61ce] text-xs sm:text-sm break-words">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Award className="text-[#2f61ce] flex-shrink-0" size={20} />
              <span className="font-semibold text-sm sm:text-base md:text-lg">
                {filteredScholarships.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}scholarships
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[#2f61ce]" size={16} />
              <span className="text-xs sm:text-sm text-gray-600">{savedScholarships.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#2f61ce]"></div>
                <p className="text-sm sm:text-base">Loading...</p>
              </div>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm px-4">
              <Award size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-2">No scholarships found</h3>
              <p className="text-xs sm:text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredScholarships.map((s, index) => {
                const isBlurred = viewMode === "recommended" && index >= 2

                return (
                  <div
                    key={s.id}
                    className={`bg-white border-2 ${
                      viewMode === "recommended" && index < 2 ? "border-[#fac300]" : "border-gray-200"
                    } rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow relative ${isBlurred ? "overflow-hidden" : ""}`}
                  >
                    {isBlurred && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center p-4 sm:p-6 rounded-xl">
                        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 text-center max-w-sm border-2 border-[#fac300]">
                          <div className="mb-4 flex justify-center">
                            <div className="bg-gradient-to-br from-[#2f61ce] to-[#fac300] rounded-full p-3 sm:p-4">
                              <AlertCircle className="text-white" size={24} />
                            </div>
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3">
                            Unlock More Recommendations
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6">
                            Talk to our experts to view {10 - index - 1} more personalized recommendations
                          </p>
                          <button className="bg-[#fac300] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold w-full flex items-center justify-center gap-2">
                            <Sparkles size={16} />
                            Contact Experts
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 leading-tight mb-2 sm:mb-3 break-words">
                          {s.scholarship_name || "Scholarship"}
                        </h3>

                        {s.organisation && (
                          <div className="flex items-center gap-2 mb-2 sm:mb-3 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                            <Globe size={14} className="sm:w-4 sm:h-4 text-[#2f61ce] flex-shrink-0" />
                            <p className="text-gray-700 font-medium text-xs sm:text-sm truncate">{s.organisation}</p>
                          </div>
                        )}

                        {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(s)}</div>}
                      </div>

                      <button
                        onClick={() => toggleSaveScholarship(s.id)}
                        disabled={isBlurred}
                        className={`transition-colors ml-2 flex-shrink-0 ${
                          isBlurred
                            ? "opacity-50 cursor-not-allowed"
                            : savedScholarships.has(s.id)
                              ? "text-[#2f61ce]"
                              : "text-gray-400 hover:text-[#2f61ce]"
                        }`}
                      >
                        <Heart size={20} className="sm:w-6 sm:h-6" fill={savedScholarships.has(s.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {s.eligibility && (
                      <div className="mb-3 sm:mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                          <GraduationCap size={16} className="sm:w-4 sm:h-4 text-[#2f61ce] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#2f61ce] mb-1 uppercase tracking-wide">Eligibility</p>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">{s.eligibility}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {s.benefit && (
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-[#fac300] rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex items-start gap-2">
                          <IndianRupee size={16} className="sm:w-4 sm:h-4 text-[#fac300] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wide">Benefits</p>
                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">{s.benefit}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700 mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <Calendar size={16} className="sm:w-4 sm:h-4 text-[#2f61ce] flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <strong className="font-semibold">Deadline:</strong>{" "}
                        <span className="text-gray-600">{formatDeadline(s.deadline)}</span>
                      </span>
                    </div>

                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 bg-[#2f61ce] text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                          isBlurred ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-[#2451a8]"
                        }`}
                      >
                        Apply Now
                        <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default ScholarshipFinder
"use client"
import React, { useState, useEffect, useCallback } from "react"
import { cacheData } from '../../../lib/cache'
import {
  GraduationCap,
  Sparkles,
  Heart,
  AlertCircle,
  MapPin,
  Award,
  Trophy,
  Globe,
  Target,
  Flame,
  IndianRupee,
  CheckCircle,
  BookOpen,
  Star,
  GitCompare,
  Eye,
  Phone,
  Mail,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from 'next/navigation'
import DefaultLayout from "../defaultLayout"
import Pagination from "../../../components/CourseFinder/Pagination"
import FilterComponent from "../../../components/CourseFinder/Filtering"
import useSavedMicrositeCourses from "../../../components/microsite/SavedCollegeMicrosites"
import ClgsRecommend from "../../../components/CourseFinder/ClgsRecommend"
import useCollegeMicrositeComparison, { CompareBadge, CompareFloatingButton } from "../../../components/microsite/CollegeMicrositesComparison"
import { parseSearchQuery, applyBudgetFilter, doesCollegeMatchCourse, doesCollegeMatchLocation } from "../../../utils/data"
import type { ManualFilters } from "../../../components/CourseFinder/Filtering"

interface College {
  id: number
  slug?: string
  card_detail?: {
    college_name?: string
    location?: string
    url?: string
    contact?: string
    email?: string
    rating?: string
    review_count?: string
    avg_package?: string
    high_package?: string
    fees?: string
    ranking?: string
    approvals?: string
    scholarship?: string
    entrance_exam?: string
    courses?: string[]
  }
  "College Name": string | null
  college_name?: string
  Location?: string | null
  location?: string
  City?: string | null
  State?: string | null
  url?: string
  contact?: string
  email?: string
  Approvals?: string | null
  "CD Score"?: string | null
  "Course Fees"?: string | null
  "Average Package"?: string | null
  "Highest Package"?: string | null
  "Placement Score"?: string | null
  "User Rating"?: string | null
  "User Reviews"?: string | null
  Ranking?: string | null
  Specialization?: string | null
  "Application Link"?: string | null
  scholarship?: string | null
  entrance_exam?: string | null
  is_priority?: boolean
  matchScore?: number
}

const CollegeMicrositesPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [displayedColleges, setDisplayedColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")
  const [totalColleges, setTotalColleges] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [manualFilters, setManualFilters] = useState<ManualFilters>({
    states: [],
    cities: [],
    city: "",
    collegeName: "",
    budgets: [],
    exams: [],
    courses: []
  })
  const [hasBudgetFilter, setHasBudgetFilter] = useState(false)

  // Color scheme matching the home page
  const accentColor = '#F59E0B'
  const primaryBg = '#050818'
  const secondaryBg = '#0F172B'
  const borderColor = 'rgba(245, 158, 11, 0.15)'

  const { savedMicrositeCourses, toggleSavedMicrosite } = useSavedMicrositeCourses(user)
  
  const {
    compareColleges,
    toggleCompare,
    removeFromCompare,
    isInCompare,
    goToComparison,
  } = useCollegeMicrositeComparison({ user, colleges })

  const perPage = 100  // Display 100 colleges per page

  // Read URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryParam = params.get('q')
    if (queryParam) {
      setSearchQuery(queryParam)
    }
  }, [])

  // Fetch total count once on mount (only when no budget filter)
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const { count, error: countError } = await supabase
          .from("college_microsites")
          .select("*", { count: "exact", head: true })

        if (countError) throw countError
        setTotalColleges(count || 0)
      } catch (err) {
        console.error("Error fetching total count:", err)
      }
    }

    // Only fetch total count if no budget filter is active
    if (!hasBudgetFilter) {
      fetchTotalCount()
    }
  }, [hasBudgetFilter])

  // Fetch colleges when search or filters change
  useEffect(() => {
    if (viewMode === "all") {
      const timer = setTimeout(() => {
      fetchColleges()
    }, 300)
    return () => clearTimeout(timer)
  }
  }, [viewMode, searchQuery, manualFilters, currentPage])


 //cache logic start here
 const fetchColleges = async () => {
  try {
    setLoading(true)
    setError(null)

    // Check if budget filter is active
    const budgetRanges = [...manualFilters.budgets]
    if (searchQuery.trim()) {
      const parsed = parseSearchQuery(searchQuery)
      parsed.budgetRanges.forEach(r => {
        if (!budgetRanges.includes(r)) budgetRanges.push(r)
      })
    }
    const hasBudget = budgetRanges.length > 0
    setHasBudgetFilter(hasBudget)

    // ⭐ CREATE CACHE KEY - This identifies what you're caching
    const cacheKey = `colleges:search:${searchQuery || 'all'}:filters:${JSON.stringify({
      states: manualFilters.states,
      cities: manualFilters.cities,
      city: manualFilters.city,
      courses: manualFilters.courses,
      budgets: manualFilters.budgets,
      exams: manualFilters.exams,
    })}`

    // ⭐ WRAP YOUR SUPABASE QUERY WITH CACHE
    const { data, error: supabaseError, count } = await cacheData(
      cacheKey,
      async () => {
        // This function runs ONLY if data is NOT in cache
        console.log('⏳ Cache MISS - Fetching from Supabase...')

        // Your existing filter logic
        const parsed = searchQuery.trim() ? parseSearchQuery(searchQuery) : null

        // Combine parsed + manual (deduplicated)
        const allLocations = [...new Set([
          ...(parsed?.cities || []),
          ...(parsed?.states || []),
          ...manualFilters.cities,
          ...manualFilters.states,
          ...(manualFilters.city ? [manualFilters.city] : [])
        ])]
        const allCourses = [...new Set([
          ...(parsed?.courses || []),
          ...manualFilters.courses
        ])]
        const allExams = [...new Set([
          ...(parsed?.entranceExams || []),
          ...manualFilters.exams
        ])]
        const searchText = parsed?.searchText || manualFilters.collegeName || ""

        // Build your Supabase query
        let query = supabase
          .from("college_microsites")
          .select("id, slug, card_detail", { count: "exact" })
          .order("order_position", { ascending: true })
          .order("id", { ascending: true })


        // Build OR conditions within each group, AND between groups
        if (searchText) {
          query = query.or(`card_detail->>college_name.ilike.%${searchText}%`)
        }

        if (allLocations.length > 0) {
          const locationConditions = allLocations.map(loc =>
            `card_detail->>location.ilike.%${loc}%`
          )
          query = query.or(locationConditions.join(','))
        }

        if (allCourses.length > 0) {
          const courseConditions = allCourses.map(course =>
            `card_detail->>courses.ilike.%${course.replace(/[%_]/g, '\\$&')}%`
          )
          query = query.or(courseConditions.join(','))
        }

        if (allExams.length > 0) {
          const examConditions = allExams.map(exam =>
            `card_detail->>entrance_exam.ilike.%${exam}%`
          )
          query = query.or(examConditions.join(','))
        }

        // HYBRID APPROACH FOR BUDGET FILTER
        let fetchMultiplier = 1
        if (hasBudget) {
          fetchMultiplier = 5
        }

        // Pagination
        const from = currentPage * 100 * fetchMultiplier
        const to = from + (100 * fetchMultiplier) - 1
        query = query.range(from, to)

        // Execute the query
        return await query
      },
      { ttl: 3600 } // Cache for 1 hour
    )

    // Handle errors
    if (supabaseError) throw supabaseError

    if (data && data.length > 0) {
      // Map card_detail to College interface
      let mappedData = data.map((college: any) => ({
        id: college.id,
        slug: college.slug,
        card_detail: college.card_detail,
        "College Name": college.card_detail?.college_name || null,
        college_name: college.card_detail?.college_name || null,
        Location: college.card_detail?.location || null,
        location: college.card_detail?.location || null,
        url: college.card_detail?.url || null,
        contact: college.card_detail?.contact || null,
        email: college.card_detail?.email || null,
        "User Rating": college.card_detail?.rating || null,
        "User Reviews": college.card_detail?.review_count || null,
        "Average Package": college.card_detail?.avg_package || null,
        "Highest Package": college.card_detail?.high_package || null,
        "Course Fees": college.card_detail?.fees || null,
        Ranking: college.card_detail?.ranking || null,
        Approvals: college.card_detail?.approvals || null,
        scholarship: college.card_detail?.scholarship || null,
        entrance_exam: college.card_detail?.entrance_exam || null,
        "Application Link": college.card_detail?.url || null,
      }))

      // Apply budget filter client-side if active
      if (hasBudget) {
        mappedData = applyBudgetFilter(mappedData, budgetRanges)
        mappedData = mappedData.slice(0, 100)
      }

      const validColleges = mappedData.filter((college) => college["College Name"] !== null)

      setColleges(validColleges)
      setDisplayedColleges(validColleges)
      
      // Update total count
      if (hasBudget) {
        setTotalColleges(validColleges.length > 0 ? 500 : 0)
      } else if (count !== null) {
        setTotalColleges(count)
      }
    } else {
      setColleges([])
      setDisplayedColleges([])
      setTotalColleges(0)
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch colleges")
    console.error("Error fetching colleges:", err)
  } finally {
    setLoading(false)
  }
}

//cache logic end here

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
    
    // Update URL
    const params = new URLSearchParams(window.location.search)
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [])

const handleManualFilterChange = useCallback((filters: ManualFilters) => {
  setManualFilters(prev => {
    // Force new object reference to trigger useEffect
    return JSON.parse(JSON.stringify(filters))
  })
  setCurrentPage(0)
}, [])

  const handleRecommendedCoursesChange = useCallback((recommendedCourses: College[]) => {
    setDisplayedColleges(recommendedCourses)
    setCurrentPage(0)
  }, [])

  const handleViewMore = (slug?: string) => {
    if (slug) {
      router.push(`/college/${slug}`)
    }
  }

  const getMatchBadge = (course: College) => {
    if (viewMode !== "recommended" || !course.matchScore) return null

    const score = course.matchScore

    if (score >= 90) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <Trophy size={14} />
          <span className="hidden sm:inline">Perfect Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Award size={14} />
          <span className="hidden sm:inline">Excellent Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <Target size={14} />
          <span className="hidden sm:inline">Great Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 40) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)', color: '#fbbf24', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
          <span className="hidden sm:inline">Good Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    }

    return (
      <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
        <span className="hidden sm:inline">Relevant ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>
    )
  }

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              <span className="text-white">Find Your</span> <span className="text-[#F59E0B]">Perfect College</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Explore programs and institutes across India</p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                setCurrentPage(0)
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "all" 
                ? { backgroundColor: accentColor, color: 'white', }
                : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
              }
            >
              <GraduationCap size={18} className="sm:w-5 sm:h-5" />
              All Colleges
            </button>

            <button
              onClick={() => {
                setViewMode("recommended")
                setCurrentPage(0)
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "recommended"
                ? { backgroundColor: accentColor, color: 'white', }
                : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
              }
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              Recommended For You
            </button>
          </div>

          {viewMode === "recommended" && (
            <ClgsRecommend
              user={user}
              viewMode={viewMode}
              onRecommendedCoursesChange={handleRecommendedCoursesChange}
              onLoadingChange={setLoading}
              onErrorChange={setError}
            />
          )}

          {viewMode === "all" && (
            <FilterComponent 
              onSearchChange={handleSearchChange}
              onManualFilterChange={handleManualFilterChange}
              initialQuery={searchQuery}
              allColleges={colleges}
            />
          )}

          {error && (
            <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={20} />
              <div>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#fca5a5' }}>Notice</h3>
                <p className="text-xs sm:text-sm" style={{ color: '#fecaca' }}>{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <GraduationCap className="flex-shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-base sm:text-lg text-white">
                {hasBudgetFilter ? `${totalColleges}+` : totalColleges.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}
                college{totalColleges !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart style={{ color: accentColor }} size={16} />
                <span className="text-xs sm:text-sm text-slate-400">{savedMicrositeCourses.size} saved</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCompare className="text-purple-400" size={16} />
                <span className="text-xs sm:text-sm text-slate-400 font-medium">{compareColleges.length}/3 to compare</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-slate-400">Loading courses...</p>
              </div>
            </div>
          ) : displayedColleges.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <GraduationCap size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {viewMode === "recommended" ? "No recommended colleges found" : "No colleges found"}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 px-4">
                {viewMode === "recommended"
                  ? "Try updating your profile or check back later for more options"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <>
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-20">
                {displayedColleges.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const inCompare = isInCompare(course.id)

                  return (
                    <div
  key={course.id}
  className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all relative backdrop-blur-xl cursor-pointer ${
    isBlurred ? "overflow-hidden" : ""
  }`}
  onClick={() => course.slug && handleViewMore(course.slug)}
  style={{
    backgroundColor: secondaryBg,
    border: inCompare 
      ? '2px solid rgba(168, 85, 247, 0.5)' 
      : course.is_priority 
      ? `2px solid ${accentColor}` 
      : `1px solid ${borderColor}`,
  }}
>
                      {/* Priority Badges */}
                      {course.is_priority && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)' }}>
                            <Flame size={12} className="sm:w-3.5 sm:h-3.5 animate-bounce" />
                            <span className="hidden sm:inline">FAST FILLING - LIMITED SEATS!</span>
                            <span className="sm:hidden">LIMITED SEATS!</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' }}>
                            <Star size={12} className="sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                            <span>FEATURED</span>
                          </span>
                        </div>
                      )}

                      {/* Compare Badge */}
                      <CompareBadge show={inCompare} />

                      {/* Course Card Content */}
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-base sm:text-lg text-white break-words pr-2">
                              {course["College Name"] || "Institute Information Not Available"}
                            </h3>
                            {course.Specialization && (
                              <span className="text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: accentColor }}>
                                {course.Specialization}
                              </span>
                            )}
                          </div>
                          
                          {course.Location && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                              <MapPin size={12} className="flex-shrink-0" />
                              <span className="truncate">{course.Location}</span>
                            </div>
                          )}
                          
                          {course["User Rating"] && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star size={14} style={{ color: accentColor }} fill={accentColor} />
                              <span className="text-sm font-semibold text-white">{course["User Rating"]}/5</span>
                              {course["User Reviews"] && (
                                <span className="text-xs text-slate-400">({course["User Reviews"]} reviews)</span>
                              )}
                            </div>
                          )}
                          
                          {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(course)}</div>}
                        </div>

                        {/* Compare Checkbox + Heart Button */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Compare Checkbox */}
                          <label className="flex items-center gap-1.5 cursor-pointer group" title="Add to compare">
                            <input 
                              type="checkbox"
                              checked={inCompare}
                              onChange={() => toggleCompare(course)}
                              disabled={isBlurred}
                              className="w-4 h-4 accent-purple-600 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                              Compare
                            </span>
                          </label>

                          {/* Heart Button */}
                          <button
                            onClick={() => toggleSavedMicrosite(course)}
                            disabled={isBlurred}
                            className={`transition-colors flex-shrink-0 ${
                              isBlurred
                                ? "opacity-50 cursor-not-allowed"
                                : savedMicrositeCourses.has(course.id)
                                  ? ""
                                  : "text-slate-500"
                            }`}
                            style={savedMicrositeCourses.has(course.id) ? { color: accentColor } : {}}
                            title={
                              isBlurred
                                ? "Contact experts to unlock"
                                : savedMicrositeCourses.has(course.id)
                                  ? "Remove from shortlist"
                                  : "Add to shortlist"
                            }
                          >
                            <Heart size={18} className="sm:w-5 sm:h-5" fill={savedMicrositeCourses.has(course.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="space-y-3 sm:space-y-4">
                        {/* Fees Grid */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {course["Course Fees"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Tuition Fees</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Course Fees"]}</p>
                            </div>
                          )}
                          {course["Average Package"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Avg Package</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Average Package"]}</p>
                            </div>
                          )}
                          {course["Highest Package"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <Trophy size={12} className="flex-shrink-0" />
                                <span>Highest Package</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Highest Package"]}</p>
                            </div>
                          )}
                        </div>

                        {/* Two Column Grid for Details */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {/* Left Column */}
                          <div className="space-y-3">
                            {course.scholarship && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                  <CheckCircle size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                  Scholarship
                                </h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-slate-300">Available</span>
                                    {course.scholarship.toLowerCase() !== "availabale" && course.scholarship.toLowerCase() !== "available" && (
                                      <a
                                        href={course.scholarship.startsWith("http") ? course.scholarship : `https://${course.scholarship}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline break-all hover:opacity-80"
                                        style={{ color: accentColor }}
                                      >
                                        Learn More
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {course.Ranking && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                  <Trophy size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                  Ranking
                                </h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <p className="text-xs text-slate-300 break-words">{course.Ranking}</p>
                                </div>
                              </div>
                            )}

                            {course.contact && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                  <Phone size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                  Contact
                                </h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <p className="text-xs text-slate-300 break-words">{course.contact}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            {course.entrance_exam && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                  <BookOpen size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                  Exam Accepted
                                </h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <p className="text-xs text-slate-300 break-words">{course.entrance_exam}</p>
                                </div>
                              </div>
                            )}

                            {course.Approvals && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Approvals</h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <p className="text-xs text-slate-300 break-words">{course.Approvals}</p>
                                </div>
                              </div>
                            )}

                            {course.email && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                  <Mail size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                  Email
                                </h4>
                                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                  <p className="text-xs text-slate-300 break-all">{course.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                          {course.slug && (
                            <button
                              onClick={() => handleViewMore(course.slug)}
                              className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg cursor-pointer"
                              style={{ backgroundColor: accentColor }}
                            >
                              <Eye size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>View Details</span>
                            </button>
                          )}
                          {course.card_detail?.url && (
                            <button
                              onClick={() => course.card_detail?.url && window.open(course.card_detail.url, '_blank', 'noopener,noreferrer')}
                              className="flex-1 rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg cursor-pointer"
                              style={{ 
                                backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                              }}
                            >
                              <Globe size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Visit Website</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Component */}
              {viewMode === "all" && !hasBudgetFilter && (
                <Pagination
                  totalItems={totalColleges}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                />
              )}

              {viewMode === "all" && hasBudgetFilter && displayedColleges.length > 0 && (
  <div className="text-center py-4 rounded-lg" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
    <p className="text-sm text-slate-400">
      Showing results filtered by budget. <button onClick={() => setCurrentPage(currentPage + 1)} className="underline hover:opacity-80" style={{ color: accentColor }}>Load more colleges</button>
    </p>
  </div>
)}
            </>
          )}
        </div>
        <CompareFloatingButton 
          compareCount={compareColleges.length}
          onCompareClick={goToComparison}
        />
      </div>
    </DefaultLayout>
  )
}

export default CollegeMicrositesPage
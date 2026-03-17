"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
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
  ChevronRight,
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

// ─── TYPE DEFINITIONS ───────────────────────────────────────────────────
// Keep existing interface but extend it for ranking data

interface RankingRow {
  value: number
  category: string
}

interface RankingEntry {
  heading: string
  rows: RankingRow[]
}

interface TopRanking {
  source: string        // e.g. "NIRF"
  category: string      // e.g. "B.Tech" or "Overall"
  value: number         // e.g. 1
}

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
    ranking?: RankingEntry[] | string  // Support both types
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
  Ranking?: RankingEntry[] | string | null
  Specialization?: string | null
  "Application Link"?: string | null
  scholarship?: string | null
  entrance_exam?: string | null
  is_priority?: boolean
  matchScore?: number
  // NEW: Enriched data
  rankingByCategory?: Map<string, TopRanking>
  bestRankOverall?: TopRanking | null
}

// ─── RANKING PRIORITY ───────────────────────────────────────────────────
// Priority: NIRF > EduNext > QS > Indiatoday > The Week > Outlook > IIRF > TOI

const RANKING_PRIORITY: string[] = [
  "NIRF Ranking",
  "EduNext Ranking",
  "QS Ranking",
  "Indiatoday Ranking",
  "The Week Ranking",
  "Outlook Ranking",
  "IIRF Ranking",
  "TOI Ranking",
]

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────

function isRankingArray(ranking: any): ranking is RankingEntry[] {
  return Array.isArray(ranking) && ranking.length > 0 && 'heading' in ranking[0]
}

// ✅ FIXED: Only 4 categories - no auto-extraction
function getAllRankingCategories(ranking: RankingEntry[] | string | null | undefined): Set<string> {
  // Return only these 4 categories - ignore all others
  return new Set(["Overall", "MBA", "B.Tech", "Medical"])
}

// Get ranking for a specific category from all sources
// Returns array of rankings sorted by source priority, with duplicates removed
function getRankingsByCategory(
  ranking: RankingEntry[] | string | null | undefined,
  category: string
): TopRanking[] {
  if (!ranking || typeof ranking === 'string' || !isRankingArray(ranking)) {
    return []
  }

  const rankings: TopRanking[] = []
  const seenSources = new Set<string>()

  // Build map of heading → entry
  const map = new Map<string, RankingEntry>()
  for (const entry of ranking) {
    if (entry.heading && Array.isArray(entry.rows) && entry.rows.length > 0) {
      map.set(entry.heading, entry)
    }
  }

  // Walk through priority and collect rankings for this category
  for (const heading of RANKING_PRIORITY) {
    const entry = map.get(heading)
    if (entry) {
      const matchingRow = entry.rows.find((row: RankingRow) => row.category === category)
      if (matchingRow && !seenSources.has(heading)) {
        const source = heading.replace(/ Ranking$/i, "")
        rankings.push({
          source,
          category,
          value: matchingRow.value
        })
        seenSources.add(heading)
      }
    }
  }

  // If no priority match found, check remaining sources
  for (const entry of ranking) {
    if (entry.heading) {
      const source = entry.heading.replace(/ Ranking$/i, "")
      if (!seenSources.has(entry.heading)) {
        const matchingRow = entry.rows.find((row: RankingRow) => row.category === category)
        if (matchingRow) {
          rankings.push({
            source,
            category,
            value: matchingRow.value
          })
          seenSources.add(entry.heading)
        }
      }
    }
  }

  return rankings
}

// Get single best ranking for a college (for fallback)
function getBestRanking(ranking: RankingEntry[] | string | null | undefined): TopRanking | null {
  if (!ranking || typeof ranking === 'string' || !isRankingArray(ranking)) {
    return null
  }

  const map = new Map<string, RankingEntry>()
  for (const entry of ranking) {
    if (entry.heading && Array.isArray(entry.rows) && entry.rows.length > 0) {
      map.set(entry.heading, entry)
    }
  }

  // Walk through priority
  for (const heading of RANKING_PRIORITY) {
    const entry = map.get(heading)
    if (entry) {
      const bestRow = entry.rows.reduce((best: RankingRow, row: RankingRow) =>
        row.value < best.value ? row : best
        , entry.rows[0])

      const source = heading.replace(/ Ranking$/i, "")
      return { source, category: bestRow.category, value: bestRow.value }
    }
  }

  // Fallback to first available
  for (const entry of ranking) {
    if (entry.heading && Array.isArray(entry.rows) && entry.rows.length > 0) {
      const bestRow = entry.rows.reduce((best: RankingRow, row: RankingRow) =>
        row.value < best.value ? row : best
        , entry.rows[0])
      const source = entry.heading.replace(/ Ranking$/i, "")
      return { source, category: bestRow.category, value: bestRow.value }
    }
  }

  return null
}

// ────────────────────────────────────────────────────────────────────────

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
  const [selectedCategory, setSelectedCategory] = useState<string>("MBA")
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set(["Overall"]))
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

  // Color scheme
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
  } = useCollegeMicrositeComparison({ user, colleges: colleges as any })

  const perPage = 20           // Cards rendered per page (fast DOM)
  const FETCH_SIZE = 1000      // Rows fetched from Supabase (enough for correct ranking)

  // Read URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryParam = params.get('q')
    if (queryParam) {
      setSearchQuery(queryParam)
    }
  }, [])

  // Fetch total count
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

    if (!hasBudgetFilter) {
      fetchTotalCount()
    }
  }, [hasBudgetFilter])

  // Fetch colleges — only when filters/search change, NOT on page change
  // Pagination is now client-side (slice sortedColleges)
  useEffect(() => {
    if (viewMode === "all") {
      setCurrentPage(0) // Reset to first page on any filter change
      const timer = setTimeout(() => {
        fetchColleges()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [viewMode, searchQuery, manualFilters])

  const fetchColleges = async () => {
    try {
      setLoading(true)
      setError(null)

      const budgetRanges = [...manualFilters.budgets]
      if (searchQuery.trim()) {
        const parsed = parseSearchQuery(searchQuery)
        parsed.budgetRanges.forEach(r => {
          if (!budgetRanges.includes(r)) budgetRanges.push(r)
        })
      }
      const hasBudget = budgetRanges.length > 0
      setHasBudgetFilter(hasBudget)

      const cacheKey = `colleges:search:${searchQuery || 'all'}:filters:${JSON.stringify({
        states: manualFilters.states,
        cities: manualFilters.cities,
        city: manualFilters.city,
        courses: manualFilters.courses,
        budgets: manualFilters.budgets,
        exams: manualFilters.exams,
      })}`

      const { data, error: supabaseError, count } = await cacheData(
        cacheKey,
        async () => {
          const parsed = searchQuery.trim() ? parseSearchQuery(searchQuery) : null

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

          let query = supabase
            .from("college_microsites")
            .select("id, slug, college_name, card_detail", { count: "exact" })
            .order("id", { ascending: true })

          // ✅ If no search/filters, filter by MBA ranking (default)
          if (!searchText && allLocations.length === 0 && allCourses.length === 0 && allExams.length === 0) {
            // Default case: get colleges with MBA rankings
            query = query.or(`card_detail->>ranking.ilike.%MBA%`)
          }

          if (searchText || allLocations.length > 0) {
            const conditions = []

            if (searchText) {
              conditions.push(`college_name.eq."${searchText}"`)
              conditions.push(`college_name.ilike.%${searchText}%`)
            }

            if (allLocations.length > 0) {
              allLocations.forEach(loc => {
                conditions.push(`card_detail->>location.ilike.%${loc}%`)
              })
            }

            query = query.or(conditions.join(','))
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

          // Fetch a large batch for correct ranking order
          // Client-side sorting + pagination handles the rest
          query = query.range(0, FETCH_SIZE - 1)

          return await query
        },
        { ttl: 3600 }
      )

      if (supabaseError) throw supabaseError

      if (data && data.length > 0) {
        let mappedData = data.map((college: any) => ({
          id: college.id,
          slug: college.slug,
          card_detail: college.card_detail,
          "College Name": college.college_name || null,
          college_name: college.college_name || null,
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

        if (hasBudget) {
          mappedData = applyBudgetFilter(mappedData, budgetRanges)
        }

        const validColleges = mappedData.filter((college) => college["College Name"] !== null)

        // ✅ Store raw data — NO enrichment here (deferred to render-time useMemo)
        // Sorting uses getRankingsByCategory() directly on raw Ranking field
        setColleges(validColleges)
        setDisplayedColleges(validColleges)

        // Always display all 4 tabs
        setAvailableCategories(new Set(["Overall", "MBA", "B.Tech", "Medical"]))

        if (hasBudget) {
          setTotalColleges(validColleges.length > 0 ? 500 : 0)
        } else if (count !== null) {
          setTotalColleges(count)
        }
      } else {
        setColleges([])
        setDisplayedColleges([])
        setTotalColleges(0)
        setAvailableCategories(new Set(["Overall", "MBA", "B.Tech", "Medical"]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch colleges")
      console.error("Error fetching colleges:", err)
    } finally {
      setLoading(false)
    }
  }

  // ★ STEP 1: Sort all colleges by ranking (lightweight — no enrichment)
  const sortedColleges = useMemo(() => {
    return [...displayedColleges].sort((a, b) => {
      const rankingsA = getRankingsByCategory(a.Ranking, selectedCategory)
      const rankingsB = getRankingsByCategory(b.Ranking, selectedCategory)

      if (rankingsA.length > 0 && rankingsB.length > 0) {
        const priorityA = RANKING_PRIORITY.findIndex(p =>
          p.toLowerCase().includes(rankingsA[0].source.toLowerCase())
        )
        const priorityB = RANKING_PRIORITY.findIndex(p =>
          p.toLowerCase().includes(rankingsB[0].source.toLowerCase())
        )

        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }

        return rankingsA[0].value - rankingsB[0].value
      }

      if (rankingsA.length > 0 && rankingsB.length === 0) return -1
      if (rankingsA.length === 0 && rankingsB.length > 0) return 1

      return 0
    })
  }, [displayedColleges, selectedCategory])

  // ★ STEP 2: Paginate + enrich ONLY the visible cards (20 instead of 1000)
  const paginatedColleges = useMemo(() => {
    const pageSlice = sortedColleges.slice(currentPage * perPage, (currentPage + 1) * perPage)

    // Enrich only these 20 cards with ranking maps (heavy computation)
    return pageSlice.map(college => {
      const rankingByCategory = new Map<string, TopRanking>()
      const categories = getAllRankingCategories(college.Ranking)

      for (const cat of categories) {
        const rankings = getRankingsByCategory(college.Ranking, cat)
        if (rankings.length > 0) {
          rankingByCategory.set(cat, rankings[0])
        }
      }

      return {
        ...college,
        rankingByCategory,
        bestRankOverall: getBestRanking(college.Ranking),
      } as College
    })
  }, [sortedColleges, currentPage, perPage])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
    setSelectedCategory("MBA") // Reset to MBA when searching

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
      return JSON.parse(JSON.stringify(filters))
    })
    setCurrentPage(0)
    setSelectedCategory("MBA") // Reset to MBA when filtering
  }, [])

  const handleRecommendedCoursesChange = useCallback((recommendedCourses: any[]) => {
    setDisplayedColleges(recommendedCourses as College[])
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
              allColleges={colleges as any}
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

          {/* Colleges found Tab */}
          {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
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
          </div> */}

          {/* ★★★ PERMANENT CATEGORY TABS - ALWAYS VISIBLE ★★★ */}
          {viewMode === "all" && availableCategories.size > 0 && (
            <div className="sticky top-0 z-40 mb-6 rounded-lg p-3 sm:p-4 backdrop-blur-xl overflow-x-auto" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="flex gap-2 sm:gap-3 min-w-max">
                {Array.from(availableCategories).sort((a, b) => {
                  // Custom sort: MBA, B.Tech, Medical, Overall
                  const order = ["MBA", "B.Tech", "Medical", "Overall"]
                  return order.indexOf(a) - order.indexOf(b)
                }).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setCurrentPage(0) // Reset to page 1 when switching category
                    }}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2"
                    style={selectedCategory === category
                      ? {
                        backgroundColor: accentColor,
                        color: 'white',
                      }
                      : {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        border: `1px solid ${borderColor}`
                      }
                    }
                  >
                    <BookOpen size={14} className="sm:w-4 sm:h-4" />
                    {category}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Colleges ranked by <strong>{selectedCategory}</strong> → NIRF, EduNext, QS (ranked colleges first)
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-slate-400">Loading colleges...</p>
              </div>
            </div>
          ) : sortedColleges.length === 0 ? (
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
                {paginatedColleges.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const inCompare = isInCompare(course.id)
                  const rankings = getRankingsByCategory(course.Ranking, selectedCategory)
                  const primaryRanking = rankings.length > 0 ? rankings[0] : null

                  return (
                    <div
                      key={course.id}
                      className={`rounded-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 relative backdrop-blur-xl cursor-pointer group ${isBlurred ? "overflow-hidden" : ""
                        }`}
                      onClick={() => course.slug && handleViewMore(course.slug)}
                      style={{
                        backgroundColor: inCompare
                          ? 'rgba(168, 85, 247, 0.1)'
                          : course.is_priority
                            ? 'rgba(245, 158, 11, 0.08)'
                            : secondaryBg,
                        border: inCompare
                          ? '2px solid rgba(168, 85, 247, 0.5)'
                          : course.is_priority
                            ? `2px solid ${accentColor}`
                            : `1px solid ${borderColor}`,
                        boxShadow: inCompare ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none'
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
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          {/* ★ Ranking Badge - PRIMARY ONLY (NIRF) */}
                          {rankings.length > 0 && (
                            <div className="mb-3">
                              <span
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(251, 191, 36, 0.15) 100%)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.15)',
                                }}
                              >
                                <Trophy size={13} className="flex-shrink-0" />
                                {/* Show ONLY the first (primary) ranking */}
                                <span>{rankings[0].source} {selectedCategory} #{rankings[0].value}</span>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h3 className="font-bold text-base sm:text-lg text-white break-words pr-2 group-hover:text-amber-300 transition-colors">
                              {course["College Name"] || "Institute Information Not Available"}
                            </h3>
                            {course.Specialization && (
                              <span className="text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: accentColor }}>
                                {course.Specialization}
                              </span>
                            )}
                          </div>

                          {course.Location && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                              <MapPin size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                              <span className="truncate">{course.Location}</span>
                            </div>
                          )}

                          {course["User Rating"] && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                <Star size={14} style={{ color: accentColor }} fill={accentColor} />
                                <span className="text-sm font-bold text-white">{course["User Rating"]}/5</span>
                              </div>
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
                          <label className="flex items-center gap-1.5 cursor-pointer group/compare hover:opacity-80 transition-opacity" title="Add to compare">
                            <input
                              type="checkbox"
                              checked={inCompare}
                              onChange={() => toggleCompare(course as any)}
                              disabled={isBlurred}
                              className="w-4 h-4 accent-purple-600 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-slate-400 group-hover/compare:text-slate-300 transition-colors">
                              Compare
                            </span>
                          </label>

                          {/* Heart Button */}
                          <button
                            onClick={() => toggleSavedMicrosite(course as any)}
                            disabled={isBlurred}
                            className={`transition-all flex-shrink-0 transform hover:scale-110 ${isBlurred
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
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {course["Course Fees"] && (
                            <div className="group/info">
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5 font-semibold">
                                <IndianRupee size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                                <span>Fees</span>
                              </div>
                              <p className="font-bold text-white text-xs sm:text-sm break-words group-hover/info:text-amber-300 transition-colors">{course["Course Fees"]}</p>
                            </div>
                          )}
                          {course["Average Package"] && (
                            <div className="group/info">
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5 font-semibold">
                                <IndianRupee size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                                <span>Avg Package</span>
                              </div>
                              <p className="font-bold text-white text-xs sm:text-sm break-words group-hover/info:text-amber-300 transition-colors">{course["Average Package"]}</p>
                            </div>
                          )}
                          {course["Highest Package"] && (
                            <div className="group/info">
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5 font-semibold">
                                <Trophy size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                                <span>Highest</span>
                              </div>
                              <p className="font-bold text-white text-xs sm:text-sm break-words group-hover/info:text-amber-300 transition-colors">{course["Highest Package"]}</p>
                            </div>
                          )}
                        </div>

                        {/* Scholarship & Exam Details */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {/* Scholarship */}
                          {course.scholarship && (
                            <div className="group/card">
                              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1 group-hover/card:text-amber-300 transition-colors">
                                <CheckCircle size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                                Scholarship
                              </h4>
                              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <span className="text-xs font-semibold text-green-400">✓ Available</span>
                              </div>
                            </div>
                          )}

                          {/* Exam Accepted */}
                          {course.entrance_exam && (
                            <div className="group/card">
                              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1 group-hover/card:text-amber-300 transition-colors">
                                <BookOpen size={13} className="flex-shrink-0" style={{ color: accentColor }} />
                                Exam Accepted
                              </h4>
                              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <p className="text-xs text-slate-300 break-words font-medium">{course.entrance_exam}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons - View Details & Website */}
                        <div className="flex items-center gap-3 pt-4 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {course.slug && (
                            <button
                              onClick={() => handleViewMore(course.slug)}
                              className="flex-1 text-white rounded-lg py-2.5 px-4 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                              style={{
                                backgroundColor: accentColor,
                                boxShadow: `0 4px 15px rgba(245, 158, 11, 0.3)`
                              }}
                            >
                              <Eye size={16} className="flex-shrink-0" />
                              <span>View Full Details</span>
                            </button>
                          )}

                          {course.card_detail?.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                course.card_detail?.url && window.open(course.card_detail.url, '_blank', 'noopener,noreferrer')
                              }}
                              className="flex-1 rounded-lg py-2.5 px-4 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                boxShadow: `0 4px 15px rgba(59, 130, 246, 0.2)`
                              }}
                            >
                              <Globe size={16} className="flex-shrink-0" />
                              <span>Website</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Component — paginate the sorted client-side list */}
              {viewMode === "all" && sortedColleges.length > perPage && (
                <Pagination
                  totalItems={sortedColleges.length}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                />
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
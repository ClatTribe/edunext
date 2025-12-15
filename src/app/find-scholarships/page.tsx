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
  Globe,
  GraduationCap,
  IndianRupee,
  Star,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"
import { ScholarshipRecommend } from "../../../components/CourseFinder/ScholarshipRecommend"
import type { Scholarship } from "../../../components/CourseFinder/ScholarshipRecommend"

// Color scheme matching the home page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';

// Featured Scholarship Definition
const FEATURED_SCHOLARSHIP: Scholarship = {
  id: -1,
  scholarship_name: "Pt. R.S. Mishra Memorial Scholarship",
  organisation: "EduNext",
  eligibility: "High-achieving Indian students facing significant economic barriers; program highlights inclusion for persons with disabilities and displaced youth; leadership & community impact valued",
  benefit: "₹5 Lakh+ financial aid, mentorship, and career support.",
  deadline: "Varies by university",
  link: "/pt-rs-mishra-memorial-scholarship",
  matchScore: 100,
  isFeatured: true,
  country_region: "All",
  provider: "EduNext",
  degree_level: "Undergraduate / Postgraduate",
  detailed_eligibility: "High-achieving Indian students facing significant economic barriers; program highlights inclusion for persons with disabilities and displaced youth; leadership & community impact valued",
  price: "5 Lakh+",
}

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedScholarships, setSavedScholarships] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrganisation, setSelectedOrganisation] = useState("")
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")

  useEffect(() => {
    if (user) {
      loadSavedScholarships()
    }
  }, [user])

  useEffect(() => {
    if (viewMode === "all") {
      fetchScholarships()
    }
  }, [viewMode])

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [searchQuery, selectedOrganisation, scholarships, viewMode])

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

    if (scholarshipId === FEATURED_SCHOLARSHIP.id) return

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
      
      const allScholarships = [FEATURED_SCHOLARSHIP, ...validScholarships]
      
      setScholarships(allScholarships)
      setFilteredScholarships(allScholarships)
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
          scholarship.isFeatured ||
          scholarship.scholarship_name?.toLowerCase().includes(query) ||
          scholarship.organisation?.toLowerCase().includes(query) ||
          scholarship.eligibility?.toLowerCase().includes(query),
      )
    }

    if (selectedOrganisation) {
      filtered = filtered.filter((s) => s.isFeatured || s.organisation === selectedOrganisation)
    }

    const featured = filtered.find(s => s.isFeatured)
    const nonFeatured = filtered.filter(s => !s.isFeatured)
    
    if (featured) {
        setFilteredScholarships([featured, ...nonFeatured])
    } else {
        setFilteredScholarships(nonFeatured)
    }
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
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: '#1f2937', border: '1px solid rgba(251, 191, 36, 0.5)' }}>
          <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Perfect ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Award size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Excellent ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <Star size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Great ({score.toFixed(0)}%)</span>
          <span className="sm:hidden">{score.toFixed(0)}%</span>
        </span>
      )
    }
    return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}>{score.toFixed(0)}%</span>
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

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Find Scholarships to Fuel Your Dreams
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Discover scholarships from top universities and institutions Nationwide
            </p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                resetFilters()
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "all"
                ? { backgroundColor: accentColor, color: 'white',  }
                : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
              }
            >
              <Award size={18} className="sm:w-5 sm:h-5" />
              All Scholarships
            </button>
            <button
              onClick={() => {
                setViewMode("recommended")
                resetFilters()
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "recommended"
                ? { backgroundColor: accentColor, color: 'white',  }
                : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
              }
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Recommended For You</span>
              <span className="sm:hidden">Recommended</span>
            </button>
          </div>

          <ScholarshipRecommend
            user={user}
            viewMode={viewMode}
            featuredScholarship={FEATURED_SCHOLARSHIP}
            onRecommendedScholarshipsChange={setFilteredScholarships}
            onLoadingChange={setLoading}
            onErrorChange={setError}
          />

          {viewMode === "all" && (
            <>
              <div className="rounded-xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg text-sm sm:text-base font-medium transition hover:shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Filter size={18} className="sm:w-5 sm:h-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold" style={{ backgroundColor: '#fbbf24', color: '#1f2937' }}>
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">Search: {searchQuery}</span>
                        <button onClick={() => clearFilter("search")} className="hover:bg-white/10 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {selectedOrganisation && (
                      <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedOrganisation}</span>
                        <button onClick={() => clearFilter("organisation")} className="hover:bg-white/10 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <button onClick={resetFilters} className="text-xs sm:text-sm font-medium px-2" style={{ color: accentColor }}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {showFilters && (
                <div className="rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-white">
                    <Filter size={18} className="sm:w-5 sm:h-5" style={{ color: accentColor }} />
                    Refine Your Search
                  </h3>
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      <Globe size={14} className="sm:w-4 sm:h-4" style={{ color: accentColor }} />
                      Organisation
                    </label>
                    <div className="relative">
                      <select
                        className="appearance-none w-full rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-white"
                        style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                        value={selectedOrganisation}
                        onChange={(e) => setSelectedOrganisation(e.target.value)}
                      >
                        <option value="" style={{ backgroundColor: secondaryBg }}>All Organisations</option>
                        {getUniqueOrganisations().map((organisation) => (
                          <option key={organisation} value={organisation} style={{ backgroundColor: secondaryBg }}>
                            {organisation}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 backdrop-blur-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={18} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#fca5a5' }}>Notice</h3>
                <p className="text-xs sm:text-sm wrap-break-word" style={{ color: '#fecaca' }}>{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Award className="shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-sm sm:text-base md:text-lg text-white">
                {filteredScholarships.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}scholarships
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart style={{ color: accentColor }} size={16} />
              <span className="text-xs sm:text-sm text-slate-400">{savedScholarships.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-slate-400">Loading...</p>
              </div>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm px-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <Award size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">No scholarships found</h3>
              <p className="text-xs sm:text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredScholarships.map((s) => {
                const isFeatured = s.isFeatured

                return (
                  <div
                    key={s.id}
                    className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow relative backdrop-blur-xl"
                    style={{
                      backgroundColor: secondaryBg,
                      border: isFeatured ? '2px solid #f59e0b' : `1px solid ${borderColor}`,
                      boxShadow: isFeatured ? '0 0 30px rgba(245, 158, 11, 0.2)' : 'none'
                    }}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 right-0 text-xs font-bold px-3 py-1.5 rounded-bl-lg flex items-center gap-1 shadow-md" style={{ backgroundColor: '#fbbf24', color: '#1f2937' }}>
                        <Star size={14} style={{ color: '#1f2937' }} fill="currentColor" />
                        FEATURED
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-white leading-tight mb-2 sm:mb-3 wrap-break-word">
                          {s.scholarship_name || "Scholarship"}
                          {isFeatured && <span className="text-xs text-amber-400 ml-2">(Top Pick)</span>}
                        </h3>

                        {s.organisation && (
                          <div className="flex items-center gap-2 mb-2 sm:mb-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                            <Globe size={14} className="sm:w-4 sm:h-4 shrink-0" style={{ color: accentColor }} />
                            <p className="text-slate-300 font-medium text-xs sm:text-sm truncate">{s.organisation}</p>
                          </div>
                        )}

                        {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(s)}</div>}
                      </div>

                      <button
                        onClick={() => toggleSaveScholarship(s.id)}
                        disabled={isFeatured}
                        className={`transition-colors ml-2 shrink-0 ${
                          isFeatured
                            ? "opacity-50 cursor-not-allowed"
                            : savedScholarships.has(s.id)
                              ? ""
                              : "text-slate-500"
                        }`}
                        style={savedScholarships.has(s.id) && !isFeatured ? { color: accentColor } : {}}
                      >
                        <Heart size={20} className="sm:w-6 sm:h-6" fill={savedScholarships.has(s.id) && !isFeatured ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {(s.eligibility || s.detailed_eligibility) && (
                      <div className="mb-3 sm:mb-4 rounded-lg p-3 sm:p-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}>
                        <div className="flex items-start gap-2">
                          <GraduationCap size={16} className="sm:w-4 sm:h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: accentColor }}>Eligibility</p>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed wrap-break-word">{s.detailed_eligibility || s.eligibility}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(s.benefit || s.price) && (
                      <div className="rounded-lg p-3 sm:p-4 mb-3 sm:mb-4" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)', border: '2px solid rgba(251, 191, 36, 0.3)' }}>
                        <div className="flex items-start gap-2">
                          <IndianRupee size={16} className="sm:w-4 sm:h-4 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold mb-1 uppercase tracking-wide text-amber-400">Benefits</p>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed wrap-break-word">{s.benefit || s.price}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-300 mb-3 sm:mb-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                      <Calendar size={16} className="sm:w-4 sm:h-4 shrink-0" style={{ color: accentColor }} />
                      <span className="text-xs sm:text-sm">
                        <strong className="font-semibold">Deadline:</strong>{" "}
                        <span className="text-slate-400">{formatDeadline(s.deadline)}</span>
                      </span>
                    </div>

                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all hover:shadow-lg"
                        style={{ backgroundColor: accentColor }}
                      >
                        {isFeatured ? "Explore Scholarship" : "Apply Now"}
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
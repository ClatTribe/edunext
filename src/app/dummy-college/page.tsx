"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  GraduationCap,
  Heart,
  AlertCircle,
  MapPin,
  Award,
  Trophy,
  Globe,
  IndianRupee,
  Star,
  Loader2,
  Eye,
  Phone,
  Mail,
  ArrowLeftRight, // Added for comparison
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from 'next/navigation'
import DefaultLayout from "../defaultLayout"
import Pagination from "../../../components/CourseFinder/Pagination"
// Added Comparison Imports
import CollegeComparison, { CompareBadge, CompareFloatingButton } from "../../../components/CourseFinder/CollegeComparison"

interface College {
  id: number
  slug: string
  college_name: string
  location?: string
  url?: string
  contact?: string
  email?: string
  microsite_data?: {
    ranking?: any[]
    placement?: any[]
    fees?: any[]
    reviews?: {
      aggregate_rating?: {
        ratingValue?: number
        reviewCount?: string
      }
    }
  }
}

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function DummyColleges() {
  const { user } = useAuth()
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [savedColleges, setSavedColleges] = useState<Set<number>>(new Set())
  
  // NEW: Comparison States
  const [selectedForCompare, setSelectedForCompare] = useState<College[]>([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  const perPage = 12

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("college_microsites")
        .select("id, slug, college_name, location, url, contact, email, microsite_data")
        .order("id", { ascending: true })

      if (supabaseError) throw supabaseError

      setColleges(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch colleges")
      console.error("Error fetching colleges:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSaved = (collegeId: number) => {
    setSavedColleges(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collegeId)) {
        newSet.delete(collegeId)
      } else {
        newSet.add(collegeId)
      }
      return newSet
    })
  }

  // NEW: Comparison Toggle Logic
  const handleCompareToggle = (college: College) => {
    setSelectedForCompare(prev => {
      const isSelected = prev.find(c => c.id === college.id)
      if (isSelected) return prev.filter(c => c.id !== college.id)
      if (prev.length >= 4) return prev
      return [...prev, college]
    })
  }

  const handleViewMore = (slug: string) => {
    router.push(`/college/${slug}`)
  }

  const paginatedColleges = useMemo(() => {
    return colleges.slice(currentPage * perPage, (currentPage + 1) * perPage)
  }, [colleges, currentPage, perPage])

  const getAveragePackage = (college: College) => {
    const placement = college.microsite_data?.placement?.[0]
    if (!placement) return null
    const headers = placement.headers || {}
    const rows = placement.rows || []
    if (headers["Average package"]) return headers["Average package"]
    const avgRow = rows.find((row: any[]) => row[0]?.toLowerCase().includes("average"))
    return avgRow ? avgRow[1] : null
  }

  const getHighestPackage = (college: College) => {
    const placement = college.microsite_data?.placement?.[0]
    if (!placement) return null
    const headers = placement.headers || {}
    const rows = placement.rows || []
    if (headers["High package"] || headers["Highest package"]) {
      return headers["High package"] || headers["Highest package"]
    }
    const highRow = rows.find((row: any[]) => row[0]?.toLowerCase().includes("high"))
    return highRow ? highRow[1] : null
  }

  const getFees = (college: College) => {
    const fees = college.microsite_data?.fees?.[0]
    if (!fees) return null
    const rows = fees.rows || []
    const totalFeeRow = rows.find((row: any[]) => row[0]?.toLowerCase().includes("total"))
    return totalFeeRow ? totalFeeRow[1] : null
  }

  const getRanking = (college: College) => {
    const ranking = college.microsite_data?.ranking?.[0]
    if (!ranking) return null
    const rows = ranking.rows || []
    return rows.length > 0 ? rows[0][1] : null
  }

  const getRating = (college: College) => {
    return college.microsite_data?.reviews?.aggregate_rating?.ratingValue || null
  }

  const getReviewCount = (college: College) => {
    return college.microsite_data?.reviews?.aggregate_rating?.reviewCount || null
  }

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              <span className="text-white">Explore</span> <span className="text-[#F59E0B]">Top Colleges</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Discover the best institutions across India</p>
          </div>

          {error && (
            <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={20} />
              <div>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#fca5a5' }}>Error</h3>
                <p className="text-xs sm:text-sm" style={{ color: '#fecaca' }}>{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <GraduationCap className="flex-shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-base sm:text-lg text-white">
                {colleges.length.toLocaleString()} colleges found
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* NEW: Comparison Badge added to header bar */}
              <CompareBadge show={selectedForCompare.length > 0} />
              
              <div className="flex items-center gap-2">
                <Heart style={{ color: accentColor }} size={16} />
                <span className="text-xs sm:text-sm text-slate-400">{savedColleges.size} saved</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin h-10 w-10 sm:h-12 sm:w-12" style={{ color: accentColor }} />
                <p className="text-sm sm:text-base text-slate-400">Loading colleges...</p>
              </div>
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <GraduationCap size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No colleges found</h3>
              <p className="text-sm sm:text-base text-slate-400 px-4">Check back later for more options</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-20">
                {paginatedColleges.map((college) => {
                  const avgPackage = getAveragePackage(college)
                  const highPackage = getHighestPackage(college)
                  const fees = getFees(college)
                  const ranking = getRanking(college)
                  const rating = getRating(college)
                  const reviewCount = getReviewCount(college)
                  
                  // NEW: Check if this college is selected for compare
                  const isCompareSelected = selectedForCompare.some(c => c.id === college.id)

                  return (
                    <div
                      key={college.id}
                      className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all relative backdrop-blur-xl"
                      style={{
                        backgroundColor: secondaryBg,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-base sm:text-lg text-white break-words mb-2">
                            {college.college_name}
                          </h3>
                          {college.location && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                              <MapPin size={12} className="flex-shrink-0" />
                              <span className="truncate">{college.location}</span>
                            </div>
                          )}
                          {rating && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star size={14} style={{ color: accentColor }} fill={accentColor} />
                              <span className="text-sm font-semibold text-white">{rating}/5</span>
                              {reviewCount && (
                                <span className="text-xs text-slate-400">({reviewCount} reviews)</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* NEW: Compare Toggle Button */}
                          <button
                            onClick={() => handleCompareToggle(college)}
                            className="p-1.5 rounded-lg transition-colors cursor-pointer"
                            style={{ 
                              backgroundColor: isCompareSelected ? accentColor : 'rgba(255,255,255,0.05)',
                              color: isCompareSelected ? '#fff' : '#64748b'
                            }}
                            title="Compare College"
                          >
                            <ArrowLeftRight size={18} />
                          </button>

                          <button
                            onClick={() => toggleSaved(college.id)}
                            className="transition-colors flex-shrink-0 cursor-pointer"
                            style={savedColleges.has(college.id) ? { color: accentColor } : { color: '#64748b' }}
                            title={savedColleges.has(college.id) ? "Remove from saved" : "Save college"}
                          >
                            <Heart size={18} className="sm:w-5 sm:h-5" fill={savedColleges.has(college.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {fees && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Total Fees</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{fees}</p>
                            </div>
                          )}
                          {avgPackage && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Avg Package</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{avgPackage}</p>
                            </div>
                          )}
                          {highPackage && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <Trophy size={12} className="flex-shrink-0" />
                                <span>Highest</span>
                              </div>
                              <p className="font-semibold text-white text-xs sm:text-sm break-words">{highPackage}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {ranking && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                <Trophy size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                Ranking
                              </h4>
                              <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                <p className="text-xs text-slate-300 break-words">{ranking}</p>
                              </div>
                            </div>
                          )}
                          {college.contact && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                <Phone size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                                Contact
                              </h4>
                              <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                <p className="text-xs text-slate-300 break-words">{college.contact}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                          <button
                            onClick={() => handleViewMore(college.slug)}
                            className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg cursor-pointer active:opacity-80"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>View More</span>
                          </button>

                          {college.url && (
                            <a
                              href={college.url.startsWith("http") ? college.url : `https://${college.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            >
                              <Globe size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Visit Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Pagination
                totalItems={colleges.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* NEW: Comparison Bottom Components Added Here */}
      <CompareFloatingButton 
        compareCount={selectedForCompare.length} 
        onCompareClick={() => setIsCompareModalOpen(true)} 
      />

      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0F172B] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Compare Colleges</h2>
              <button 
                onClick={() => setIsCompareModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            {/* Since your CollegeComparison.tsx seems to return a Hook or has specific props, 
                you might need to adjust this part to match how your comparison UI looks.
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedForCompare.map(c => (
                <div key={c.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-white font-bold text-sm mb-2">{c.college_name}</p>
                  <button 
                    onClick={() => handleCompareToggle(c)}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Remove from Comparison
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
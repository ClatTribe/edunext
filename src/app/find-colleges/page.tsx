"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react" // <--- IMPORTED useCallback
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
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"
import Pagination from "../../../components/CourseFinder/Pagination"
import FilterComponent from "../../../components/CourseFinder/Filtering"
import useSavedCourses from "../../../components/CourseFinder/SavedCourses"
import ClgsRecommend from "../../../components/CourseFinder/ClgsRecommend"

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

const CourseFinder: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")

  const { savedCourses, toggleSaved } = useSavedCourses(user)

  const perPage = 15

  // Shuffle priority colleges with consistent positions using useMemo
  const shuffledCourses = useMemo(() => {
    if (filteredCourses.length === 0) return []

    const priorityCourses = filteredCourses.filter((c) => c.is_priority)
    const normalCourses = filteredCourses.filter((c) => !c.is_priority)

    if (priorityCourses.length === 0) return filteredCourses

    const result: Course[] = []
    let priorityIndex = 0
    let normalIndex = 0

    // Create a deterministic seed based on course IDs for consistent shuffling
    const seed = priorityCourses.reduce((acc, c) => acc + c.id, 0)
    const random = (min: number, max: number, offset: number) => {
      const x = Math.sin(seed + offset) * 10000
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
    }

    while (priorityIndex < priorityCourses.length || normalIndex < normalCourses.length) {
      // Add priority course
      if (priorityIndex < priorityCourses.length) {
        result.push(priorityCourses[priorityIndex])
        priorityIndex++

        // Add 1-2 normal courses (with occasional 0 for consecutive priorities)
        const gap = random(0, 2, priorityIndex)
        for (let i = 0; i < gap && normalIndex < normalCourses.length; i++) {
          result.push(normalCourses[normalIndex])
          normalIndex++
        }
      } else {
        // Add remaining normal courses
        result.push(normalCourses[normalIndex])
        normalIndex++
      }
    }

    return result
  }, [filteredCourses])

  useEffect(() => {
    if (viewMode === "all") {
      fetchCourses()
    }
  }, [viewMode])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      let allCourses: Course[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from("courses")
          .select(
            'id, Rank, "College Name", Location, City, State, Approvals, "CD Score", "Course Fees", "Average Package", "Highest Package", "Placement Score", "User Rating", "User Reviews", Ranking, Specialization, "Application Link", scholarship, entrance_exam, is_priority'
          )
          .order("id", { ascending: true })
          .range(from, from + batchSize - 1)

        if (supabaseError) throw supabaseError

        if (data && data.length > 0) {
          // FIX: Cast data to Course[]
          allCourses = [...allCourses, ...(data as Course[])]
          hasMore = data.length === batchSize
          from += batchSize
        } else {
          hasMore = false
        }
      }

      const validCourses = allCourses.filter((course) => course["College Name"] !== null)

      setCourses(validCourses)
      // Only set filteredCourses if viewMode is 'all' upon initial load
      if (viewMode === "all") {
        setFilteredCourses(validCourses)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  // CRITICAL FIX: Wrap in useCallback to stabilize the prop passed to ClgsRecommend
  const handleRecommendedCoursesChange = useCallback((recommendedCourses: Course[]) => {
    setFilteredCourses(recommendedCourses)
    setCurrentPage(0)
  }, []) // Empty dependency array ensures the function is stable

  // CRITICAL FIX: Wrap in useCallback to stabilize the prop passed to FilterComponent
  const handleFilterChange = useCallback((filtered: Course[]) => {
    setFilteredCourses(filtered)
    setCurrentPage(0)
  }, []) // Empty dependency array ensures the function is stable

  const getMatchBadge = (course: Course) => {
    if (viewMode !== "recommended" || !course.matchScore) return null

    const score = course.matchScore

    if (score >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          <span className="hidden sm:inline">Perfect Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          <span className="hidden sm:inline">Excellent Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          <span className="hidden sm:inline">Great Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full font-semibold">
          <span className="hidden sm:inline">Good Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      )
    }

    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold">
        <span className="hidden sm:inline">Relevant ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>
    )
  }

  const paginatedCourses = shuffledCourses.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#005de6] mb-1 sm:mb-2">
              Find Your Perfect College
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Explore programs and institutes across India</p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                setCurrentPage(0)
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "all"
                  ? "bg-[#005de6] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <GraduationCap size={18} className="sm:w-5 sm:h-5" />
              All Colleges
            </button>

            <button
              onClick={() => {
                setViewMode("recommended")
                setCurrentPage(0)
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "recommended"
                  ? "bg-[#005de6] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              Recommended For You
            </button>
          </div>

          {/* Recommendation Component */}
          <ClgsRecommend
            user={user}
            viewMode={viewMode}
            onRecommendedCoursesChange={handleRecommendedCoursesChange}
            onLoadingChange={setLoading}
            onErrorChange={setError}
          />

          {/* Filter Component */}
          {/* Note: handleFilterChange is now stable via useCallback */}
          <FilterComponent courses={courses} viewMode={viewMode} onFilterChange={handleFilterChange} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 text-sm sm:text-base">Notice</h3>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#005de6] flex-shrink-0" size={20} />
              <span className="font-semibold text-base sm:text-lg">
                {filteredCourses.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}
                college{filteredCourses.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[#005de6]" size={16} />
              <span className="text-xs sm:text-sm text-gray-600">{savedCourses.size} saved</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#005de6]"></div>
                <p className="text-sm sm:text-base">Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
              <GraduationCap size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {viewMode === "recommended" ? "No recommended colleges found" : "No colleges found"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {viewMode === "recommended"
                  ? "Try updating your profile or check back later for more options"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <>
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {paginatedCourses.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const courseIndex = currentPage * perPage + index

                  return (
                    <div
                      key={course.id}
                      className={`bg-white border ${
                        course.is_priority ? "border-blue-300 shadow-blue-100" : "border-gray-200"
                      } rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow relative ${
                        isBlurred ? "overflow-hidden" : ""
                      }`}
                    >
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl">
                          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 text-center max-w-sm border-2 border-blue-100">
                            <div className="mb-4 flex justify-center">
                              <div className="bg-blue-100 rounded-full p-3 sm:p-4">
                                <AlertCircle className="text-[#005de6]" size={28} />
                              </div>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                              Unlock More Recommendations
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">
                              Talk to our experts to view detailed information about this and {
                                // Calculate remaining recommendations if total is limited (e.g., to 10)
                                Math.max(0, 10 - courseIndex - 1)
                              }{" "} 
                              more personalized course recommendations
                            </p>
                            <button className="bg-[#005de6] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-2">
                              <Sparkles size={16} />
                              Contact Our Experts
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Priority Badges */}
                      {course.is_priority && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse">
                            <Flame size={12} className="sm:w-3.5 sm:h-3.5 animate-bounce" />
                            <span className="hidden sm:inline">FAST FILLING - LIMITED SEATS!</span>
                            <span className="sm:hidden">LIMITED SEATS!</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse">
                            <Star size={12} className="sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                            <span>FEATURED</span>
                          </span>
                        </div>
                      )}

                      {/* Course Card Content */}
                      <div className="flex items-start justify-between mb-4 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-xl text-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg mb-2 sm:mb-3 break-words">
                            {course["College Name"] || "Institute Information Not Available"}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                            <span className="text-xs font-semibold text-white bg-[#005de6] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full break-words">
                              {course.Specialization || "Specialization N/A"}
                            </span>
                          </div>
                          {course.City && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <MapPin size={12} className="flex-shrink-0" />
                              <span className="truncate">
                                {course.City}, {course.State}
                              </span>
                            </div>
                          )}
                          {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(course)}</div>}
                        </div>

                        <button
                          onClick={() => toggleSaved(course)}
                          disabled={isBlurred}
                          className={`transition-colors flex-shrink-0 ${
                            isBlurred
                              ? "opacity-50 cursor-not-allowed"
                              : savedCourses.has(course.id)
                                ? "text-[#005de6]"
                                : "text-gray-400 hover:text-[#005de6]"
                          }`}
                          title={
                            isBlurred
                              ? "Contact experts to unlock"
                              : savedCourses.has(course.id)
                                ? "Remove from shortlist"
                                : "Add to shortlist"
                          }
                        >
                          <Heart size={18} className="sm:w-5 sm:h-5" fill={savedCourses.has(course.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                          {course["Course Fees"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Tuition Fees</span>
                              </div>
                              <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{course["Course Fees"]}</p>
                            </div>
                          )}
                          {course["Average Package"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <IndianRupee size={12} className="flex-shrink-0" />
                                <span>Avg Package</span>
                              </div>
                              <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{course["Average Package"]}</p>
                            </div>
                          )}
                          {course["Highest Package"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Trophy size={12} className="flex-shrink-0" />
                                <span>Highest Package</span>
                              </div>
                              <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{course["Highest Package"]}</p>
                            </div>
                          )}
                        </div>

                        {/* Scholarship Section */}
                        {course.scholarship && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
                              Scholarship
                            </h4>
                            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-medium text-blue-700">Available</span>
                                {course.scholarship.toLowerCase() !== "availabale" && course.scholarship.toLowerCase() !== "available" && (
                                  <a
                                    href={course.scholarship.startsWith("http") ? course.scholarship : `https://${course.scholarship}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                                  >
                                    Learn More
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Entrance Exam Section */}
                        {course.entrance_exam && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <BookOpen size={12} className="sm:w-3.5 sm:h-3.5 text-[#005de6] flex-shrink-0" />
                              Exam Accepted
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs sm:text-sm text-gray-700 break-words">{course.entrance_exam}</p>
                            </div>
                          </div>
                        )}

                        {course.Ranking && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Trophy size={12} className="sm:w-3.5 sm:h-3.5 text-[#005de6] flex-shrink-0" />
                              Ranking
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs sm:text-sm text-gray-700 break-words">{course.Ranking}</p>
                            </div>
                          </div>
                        )}

                        {course["User Rating"] && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Award size={12} className="sm:w-3.5 sm:h-3.5 text-[#005de6] flex-shrink-0" />
                              User Rating
                            </h4>
                            <div className="bg-yellow-50 rounded-lg p-2">
                              <p className="text-xs sm:text-sm text-yellow-700">{course["User Rating"]}</p>
                            </div>
                          </div>
                        )}

                        {course.Approvals && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Approvals</h4>
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-xs sm:text-sm text-blue-700 break-words">{course.Approvals}</p>
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                          {course["Application Link"] ? (
                            <a
                              href={
                                course["Application Link"].startsWith("http")
                                  ? course["Application Link"]
                                  : `https://${course["Application Link"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#005de6] hover:bg-blue-700 text-white rounded-lg py-2 px-3 sm:px-4 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md"
                            >
                              <Globe size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                              Apply Now
                            </a>
                          ) : (
                            course.is_priority && (
                              <button
                                className="flex-1 bg-[#005de6] hover:bg-blue-700 text-white rounded-lg py-2 px-3 sm:px-4 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md"
                                onClick={() => {
                                  alert("Contact our experts for fast admission!")
                                }}
                              >
                                <Sparkles size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                Contact for Admission
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Component */}
              <Pagination
                totalItems={filteredCourses.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default CourseFinder
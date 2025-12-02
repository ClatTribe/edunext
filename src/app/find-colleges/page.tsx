"use client"
import React, { useState, useEffect } from "react"
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
  "Placement %"?: string | null
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
            'id, Rank, "College Name", Location, City, State, Approvals, "CD Score", "Course Fees", "Placement %", "Placement Score", "User Rating", "User Reviews", Ranking, Specialization, "Application Link", scholarship, entrance_exam, is_priority'
          )
          .order("is_priority", { ascending: false })
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

      const validCourses = allCourses.filter((course) => course["College Name"] !== null)

      setCourses(validCourses)
      setFilteredCourses(validCourses)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendedCoursesChange = (recommendedCourses: Course[]) => {
    setFilteredCourses(recommendedCourses)
    setCurrentPage(0)
  }

  const handleFilterChange = (filtered: Course[]) => {
    setFilteredCourses(filtered)
    setCurrentPage(0)
  }

  const getMatchBadge = (course: Course) => {
    if (viewMode !== "recommended" || !course.matchScore) return null

    const score = course.matchScore

    if (score >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          Perfect Match ({score}%)
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          Excellent Match ({score}%)
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          Great Match ({score}%)
        </span>
      )
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
          Good Match ({score}%)
        </span>
      )
    }

    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
        Relevant ({score}%)
      </span>
    )
  }

  const paginatedCourses = filteredCourses.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#005de6] mb-2">Find Your Perfect College</h1>
            <p className="text-gray-600">Explore programs and institutes across India</p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                setCurrentPage(0)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-[#005de6] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <GraduationCap size={20} />
              All Colleges
            </button>

            <button
              onClick={() => {
                setViewMode("recommended")
                setCurrentPage(0)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === "recommended"
                  ? "bg-[#005de6] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <Sparkles size={20} />
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
          <FilterComponent courses={courses} viewMode={viewMode} onFilterChange={handleFilterChange} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Notice</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#005de6]" size={24} />
              <span className="font-semibold text-lg">
                {filteredCourses.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}
                college found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[#005de6]" size={18} />
              <span className="text-sm text-gray-600">{savedCourses.size} saved</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005de6]"></div>
                <p>Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {viewMode === "recommended" ? "No recommended college found" : "No college found"}
              </h3>
              <p className="text-gray-500">
                {viewMode === "recommended"
                  ? "Try updating your profile or check back later for more options"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <>
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedCourses.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const courseIndex = currentPage * perPage + index

                  return (
                    <div
                      key={course.id}
                      className={`bg-white border ${
                        course.is_priority ? "border-red-300 shadow-red-100" : "border-gray-200"
                      } rounded-xl p-6 hover:shadow-lg transition-shadow relative ${
                        isBlurred ? "overflow-hidden" : ""
                      }`}
                    >
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 rounded-xl">
                          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm border-2 border-blue-100">
                            <div className="mb-4 flex justify-center">
                              <div className="bg-blue-100 rounded-full p-4">
                                <AlertCircle className="text-[#005de6]" size={32} />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Unlock More Recommendations</h3>
                            <p className="text-gray-600 mb-6">
                              Talk to our experts to view detailed information about this and {10 - courseIndex - 1}{" "}
                              more personalized course recommendations
                            </p>
                            <button className="bg-[#005de6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-2">
                              <Sparkles size={18} />
                              Contact Our Experts
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Priority Badge */}
                      {course.is_priority && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            <Flame size={14} className="animate-bounce" />
                            FAST FILLING - LIMITED SEATS!
                          </span>
                        </div>
                      )}

                      {/* Course Card Content */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-black px-4 py-2.5 rounded-lg mb-3 w-fit">
                            {course["College Name"] || "Institute Information Not Available"}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-white bg-[#005de6] px-3 py-1.5 rounded-full">
                              {course.Specialization || "Specialization N/A"}
                            </span>
                          </div>
                          {course.City && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <MapPin size={12} />
                              <span>
                                {course.City}, {course.State}
                              </span>
                            </div>
                          )}
                          {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(course)}</div>}
                        </div>

                        <button
                          onClick={() => toggleSaved(course)}
                          disabled={isBlurred}
                          className={`transition-colors ${
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
                          <Heart size={20} fill={savedCourses.has(course.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                          {course["Course Fees"] && (
                            <div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <IndianRupee size={14} />
                                <span>Tuition Fees</span>
                              </div>
                              <p className="font-semibold text-gray-800 text-sm">{course["Course Fees"]}</p>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <GraduationCap size={14} />
                              <span>Placement %</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{course["Placement %"] || "N/A"}</p>
                          </div>
                        </div>

                        {/* Scholarship Section */}
                        {course.scholarship && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <CheckCircle size={14} className="text-blue-600" />
                              Scholarship
                            </h4>
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-700">Availabale</span>
                                {course.scholarship.toLowerCase() !== "Availabale" && course.scholarship.toLowerCase() !== "available" && (
                                  <a
                                    href={course.scholarship.startsWith("http") ? course.scholarship : `https://${course.scholarship}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
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
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <BookOpen size={14} className="text-[#005de6]" />
                              Exam Accepted
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-sm text-gray-700">{course.entrance_exam}</p>
                            </div>
                          </div>
                        )}

                        {course.Ranking && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Trophy size={14} className="text-[#005de6]" />
                              Ranking
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-sm text-gray-700">{course.Ranking}</p>
                            </div>
                          </div>
                        )}

                        {course["User Rating"] && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Award size={14} className="text-[#005de6]" />
                              User Rating
                            </h4>
                            <div className="bg-yellow-50 rounded-lg p-2">
                              <p className="text-sm text-yellow-700">{course["User Rating"]}</p>
                            </div>
                          </div>
                        )}

                        {course.Approvals && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Approvals</h4>
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-sm text-blue-700">{course.Approvals}</p>
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <div className="flex items-center gap-4 pt-4">
                          {course["Application Link"] ? (
                            <a
                              href={
                                course["Application Link"].startsWith("http")
                                  ? course["Application Link"]
                                  : `https://${course["Application Link"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#005de6] hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-md"
                            >
                              <Globe size={16} />
                              Apply Now
                            </a>
                          ) : (
                            course.is_priority && (
                              <button
                                className="flex-1 bg-[#005de6] hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-md"
                                onClick={() => {
                                  alert("Contact our experts for fast admission!")
                                }}
                              >
                                <Sparkles size={16} />
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
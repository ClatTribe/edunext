// "use client"
// import React, { useState, useEffect, useMemo, useCallback } from "react"
// import {
//   GraduationCap,
//   Sparkles,
//   Heart,
//   AlertCircle,
//   MapPin,
//   Award,
//   Trophy,
//   Globe,
//   Target,
//   Flame,
//   IndianRupee,
//   CheckCircle,
//   BookOpen,
//   Star,
//   GitCompare,
// } from "lucide-react"
// import { supabase } from "../../../lib/supabase"
// import { useAuth } from "../../../contexts/AuthContext"
// import { useRouter } from 'next/navigation';
// import DefaultLayout from "../defaultLayout"
// import Pagination from "../../../components/CourseFinder/Pagination"
// import FilterComponent from "../../../components/CourseFinder/Filtering"
// import useSavedCourses from "../../../components/CourseFinder/SavedCourses"
// import ClgsRecommend from "../../../components/CourseFinder/ClgsRecommend"
// import CollegeComparison, { CompareBadge, CompareFloatingButton } from "../../../components/CourseFinder/CollegeComparison"

// interface Course {
//   id: number
//   Rank?: string | null
//   "College Name": string | null
//   Location?: string | null
//   City?: string | null
//   State?: string | null
//   Approvals?: string | null
//   "CD Score"?: string | null
//   "Course Fees"?: string | null
//   "Average Package"?: string | null
//   "Highest Package"?: string | null
//   "Placement Score"?: string | null
//   "User Rating"?: string | null
//   "User Reviews"?: string | null
//   Ranking?: string | null
//   Specialization?: string | null
//   "Application Link"?: string | null
//   scholarship?: string | null
//   entrance_exam?: string | null
//   is_priority?: boolean
//   matchScore?: number
// }

// const CourseFinder: React.FC = () => {
//   const { user } = useAuth()
//   const [courses, setCourses] = useState<Course[]>([])
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(0)
//   const [viewMode, setViewMode] = useState<"all" | "recommended">("all")

//   // Color scheme matching the home page
// const accentColor = '#F59E0B';
// const primaryBg = '#050818'; // Very dark navy blue
// const secondaryBg = '#0F172B'; // Slightly lighter navy
// const borderColor = 'rgba(245, 158, 11, 0.15)';

//   const { savedCourses, toggleSaved } = useSavedCourses(user)
  
//   const {
//     compareColleges,
//     toggleCompare,
//     removeFromCompare,
//     isInCompare,
//     goToComparison,
//   } = CollegeComparison({ user, courses })

//   const perPage = 15

//   const router = useRouter();

// // useEffect(() => {
// //   if (!loading && !user) {
// //     router.push('/register');
// //   }
// // }, [user, loading, router]);

//   const shuffledCourses = useMemo(() => {
//     if (filteredCourses.length === 0) return []

//     const priorityCourses = filteredCourses.filter((c) => c.is_priority)
//     const normalCourses = filteredCourses.filter((c) => !c.is_priority)

//     if (priorityCourses.length === 0) return filteredCourses

//     const result: Course[] = []
//     let priorityIndex = 0
//     let normalIndex = 0

//     const seed = priorityCourses.reduce((acc, c) => acc + c.id, 0)
//     const random = (min: number, max: number, offset: number) => {
//       const x = Math.sin(seed + offset) * 10000
//       return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
//     }

//     while (priorityIndex < priorityCourses.length || normalIndex < normalCourses.length) {
//       if (priorityIndex < priorityCourses.length) {
//         result.push(priorityCourses[priorityIndex])
//         priorityIndex++

//         const gap = random(0, 2, priorityIndex)
//         for (let i = 0; i < gap && normalIndex < normalCourses.length; i++) {
//           result.push(normalCourses[normalIndex])
//           normalIndex++
//         }
//       } else {
//         result.push(normalCourses[normalIndex])
//         normalIndex++
//       }
//     }

//     return result
//   }, [filteredCourses])

//   useEffect(() => {
//     if (viewMode === "all") {
//       fetchCourses()
//     }
//   }, [viewMode])

//   const fetchCourses = async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       let allCourses: Course[] = []
//       let from = 0
//       const batchSize = 1000
//       let hasMore = true

//       while (hasMore) {
//         const { data, error: supabaseError } = await supabase
//           .from("courses")
//           .select(
//             'id, Rank, "College Name", Location, City, State, Approvals, "CD Score", "Course Fees", "Average Package", "Highest Package", "Placement Score", "User Rating", "User Reviews", Ranking, Specialization, "Application Link", scholarship, entrance_exam, is_priority'
//           )
//           .order("id", { ascending: true })
//           .range(from, from + batchSize - 1)

//         if (supabaseError) throw supabaseError

//         if (data && data.length > 0) {
//           allCourses = [...allCourses, ...(data as Course[])]
//           hasMore = data.length === batchSize
//           from += batchSize
//         } else {
//           hasMore = false
//         }
//       }

//       const validCourses = allCourses.filter((course) => course["College Name"] !== null)

//       setCourses(validCourses)
//       if (viewMode === "all") {
//         setFilteredCourses(validCourses)
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch courses")
//       console.error("Error fetching courses:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleRecommendedCoursesChange = useCallback((recommendedCourses: Course[]) => {
//     setFilteredCourses(recommendedCourses)
//     setCurrentPage(0)
//   }, [])

//   const handleFilterChange = useCallback((filtered: Course[]) => {
//     setFilteredCourses(filtered)
//     setCurrentPage(0)
//   }, [])

//   const getMatchBadge = (course: Course) => {
//     if (viewMode !== "recommended" || !course.matchScore) return null

//     const score = course.matchScore

//     if (score >= 90) {
//       return (
//         <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
//           <Trophy size={14} />
//           <span className="hidden sm:inline">Perfect Match ({score}%)</span>
//           <span className="sm:hidden">{score}%</span>
//         </span>
//       )
//     } else if (score >= 75) {
//       return (
//         <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
//           <Award size={14} />
//           <span className="hidden sm:inline">Excellent Match ({score}%)</span>
//           <span className="sm:hidden">{score}%</span>
//         </span>
//       )
//     } else if (score >= 60) {
//       return (
//         <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
//           <Target size={14} />
//           <span className="hidden sm:inline">Great Match ({score}%)</span>
//           <span className="sm:hidden">{score}%</span>
//         </span>
//       )
//     } else if (score >= 40) {
//       return (
//         <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)', color: '#fbbf24', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
//           <span className="hidden sm:inline">Good Match ({score}%)</span>
//           <span className="sm:hidden">{score}%</span>
//         </span>
//       )
//     }

//     return (
//       <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
//         <span className="hidden sm:inline">Relevant ({score}%)</span>
//         <span className="sm:hidden">{score}%</span>
//       </span>
//     )
//   }

//   const paginatedCourses = shuffledCourses.slice(currentPage * perPage, (currentPage + 1) * perPage)

//   return (
//     <DefaultLayout>
//       <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0" style={{ backgroundColor: primaryBg }}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-4 sm:mb-6 md:mb-8">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
//               <span className="text-white">Find Your</span> <span className="text-[#F59E0B]">Perfect College</span>
//             </h1>
//             <p className="text-sm sm:text-base text-slate-400">Explore programs and institutes across India</p>
//           </div>

//           {/* View Mode Toggle */}
//           <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
//             <button
//               onClick={() => {
//                 setViewMode("all")
//                 setCurrentPage(0)
//               }}
//               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
//               style={viewMode === "all" 
//                 ? { backgroundColor: accentColor, color: 'white', }
//                 : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
//               }
//             >
//               <GraduationCap size={18} className="sm:w-5 sm:h-5" />
//               All Colleges
//             </button>

//             <button
//               onClick={() => {
//                 setViewMode("recommended")
//                 setCurrentPage(0)
//               }}
//               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
//               style={viewMode === "recommended"
//                 ? { backgroundColor: accentColor, color: 'white', }
//                 : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
//               }
//             >
//               <Sparkles size={18} className="sm:w-5 sm:h-5" />
//               Recommended For You
//             </button>
//           </div>

//           <ClgsRecommend
//             user={user}
//             viewMode={viewMode}
//             onRecommendedCoursesChange={handleRecommendedCoursesChange}
//             onLoadingChange={setLoading}
//             onErrorChange={setError}
//           />

//           <FilterComponent courses={courses} viewMode={viewMode} onFilterChange={handleFilterChange} />

//           {error && (
//             <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
//               <AlertCircle className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={20} />
//               <div>
//                 <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#fca5a5' }}>Notice</h3>
//                 <p className="text-xs sm:text-sm" style={{ color: '#fecaca' }}>{error}</p>
//               </div>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
//             <div className="flex items-center gap-2">
//               <GraduationCap className="flex-shrink-0" style={{ color: accentColor }} size={20} />
//               <span className="font-semibold text-base sm:text-lg text-white">
//                 {filteredCourses.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}
//                 college{filteredCourses.length !== 1 ? "s" : ""} found
//               </span>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Heart style={{ color: accentColor }} size={16} />
//                 <span className="text-xs sm:text-sm text-slate-400">{savedCourses.size} saved</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <GitCompare className="text-purple-400" size={16} />
//                 <span className="text-xs sm:text-sm text-slate-400 font-medium">{compareColleges.length}/3 to compare</span>
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
//                 <p className="text-sm sm:text-base text-slate-400">Loading courses...</p>
//               </div>
//             </div>
//           ) : filteredCourses.length === 0 ? (
//             <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
//               <GraduationCap size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
//               <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
//                 {viewMode === "recommended" ? "No recommended colleges found" : "No colleges found"}
//               </h3>
//               <p className="text-sm sm:text-base text-slate-400 px-4">
//                 {viewMode === "recommended"
//                   ? "Try updating your profile or check back later for more options"
//                   : "Try adjusting your filters or search query"}
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Course Cards Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-20">
//                 {paginatedCourses.map((course, index) => {
//                   const isBlurred = viewMode === "recommended" && index >= 2
//                   const inCompare = isInCompare(course.id)

//                   return (
//                     <div
//                       key={course.id}
//                       className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all relative backdrop-blur-xl ${
//                         isBlurred ? "overflow-hidden" : ""
//                       }`}
//                       style={{
//                         backgroundColor: secondaryBg,
//                         border: inCompare 
//                           ? '2px solid rgba(168, 85, 247, 0.5)' 
//                           : course.is_priority 
//                           ? `2px solid ${accentColor}` 
//                           : `1px solid ${borderColor}`,
//                       }}
//                     >
//                       {/* Priority Badges */}
//                       {course.is_priority && (
//                         <div className="mb-3 flex flex-wrap gap-2">
//                           <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)' }}>
//                             <Flame size={12} className="sm:w-3.5 sm:h-3.5 animate-bounce" />
//                             <span className="hidden sm:inline">FAST FILLING - LIMITED SEATS!</span>
//                             <span className="sm:hidden">LIMITED SEATS!</span>
//                           </span>
//                           <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' }}>
//                             <Star size={12} className="sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
//                             <span>FEATURED</span>
//                           </span>
//                         </div>
//                       )}

//                       {/* Compare Badge */}
//                       <CompareBadge show={inCompare} />

//                       {/* Course Card Content */}
//                       <div className="flex items-start justify-between mb-3 gap-3">
//   <div className="flex-1 min-w-0 pr-2">
//     <div className="flex items-center gap-2 mb-2 flex-wrap">
//       <h3 className="font-bold text-base sm:text-lg text-white break-words pr-2">
//         {course["College Name"] || "Institute Information Not Available"}
//       </h3>
//       {course.Specialization && (
//         <span className="text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: accentColor }}>
//           {course.Specialization}
//         </span>
//       )}
//     </div>
    
//     {course.City && (
//       <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
//         <MapPin size={12} className="flex-shrink-0" />
//         <span className="truncate">
//           {course.City}, {course.State}
//         </span>
//       </div>
//     )}
//     {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(course)}</div>}
//   </div>

//   {/* Compare Checkbox + Heart Button */}
//   <div className="flex items-center gap-3 flex-shrink-0">
//   {/* Compare Checkbox */}
//   <label className="flex items-center gap-1.5 cursor-pointer group" title="Add to compare">
//     <input 
//       type="checkbox"
//       checked={inCompare}
//       onChange={() => toggleCompare(course)}
//       disabled={isBlurred}
//       className="w-4 h-4 accent-purple-600 cursor-pointer disabled:opacity-50"
//     />
//     <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
//       Compare
//     </span>
//   </label>

//   {/* Heart Button */}
//   <button
//     onClick={() => toggleSaved(course)}
//     disabled={isBlurred}
//     className={`transition-colors flex-shrink-0 ${
//       isBlurred
//         ? "opacity-50 cursor-not-allowed"
//         : savedCourses.has(course.id)
//           ? ""
//           : "text-slate-500"
//     }`}
//     style={savedCourses.has(course.id) ? { color: accentColor } : {}}
//     title={
//       isBlurred
//         ? "Contact experts to unlock"
//         : savedCourses.has(course.id)
//           ? "Remove from shortlist"
//           : "Add to shortlist"
//     }
//   >
//     <Heart size={18} className="sm:w-5 sm:h-5" fill={savedCourses.has(course.id) ? "currentColor" : "none"} />
//   </button>
// </div>
// </div>

//                       {/* Course Details */}
//                       <div className="space-y-3 sm:space-y-4">
//                         {/* Fees Grid */}
//                         <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
//                           {course["Course Fees"] && (
//                             <div>
//                               <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
//                                 <IndianRupee size={12} className="flex-shrink-0" />
//                                 <span>Tuition Fees</span>
//                               </div>
//                               <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Course Fees"]}</p>
//                             </div>
//                           )}
//                           {course["Average Package"] && (
//                             <div>
//                               <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
//                                 <IndianRupee size={12} className="flex-shrink-0" />
//                                 <span>Avg Package</span>
//                               </div>
//                               <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Average Package"]}</p>
//                             </div>
//                           )}
//                           {course["Highest Package"] && (
//                             <div>
//                               <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
//                                 <Trophy size={12} className="flex-shrink-0" />
//                                 <span>Highest Package</span>
//                               </div>
//                               <p className="font-semibold text-white text-xs sm:text-sm break-words">{course["Highest Package"]}</p>
//                             </div>
//                           )}
//                         </div>

//                         {/* Two Column Grid for Details */}
//                         <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
//                           {/* Left Column */}
//                           <div className="space-y-3">
//                             {course.scholarship && (
//                               <div>
//                                 <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
//                                   <CheckCircle size={12} className="flex-shrink-0" style={{ color: accentColor }} />
//                                   Scholarship
//                                 </h4>
//                                 <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
//                                   <div className="flex flex-col gap-1">
//                                     <span className="text-xs font-medium text-slate-300">Available</span>
//                                     {course.scholarship.toLowerCase() !== "availabale" && course.scholarship.toLowerCase() !== "available" && (
//                                       <a
//                                         href={course.scholarship.startsWith("http") ? course.scholarship : `https://${course.scholarship}`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-xs underline break-all hover:opacity-80"
//                                         style={{ color: accentColor }}
//                                       >
//                                         Learn More
//                                       </a>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             )}

//                             {course.Ranking && (
//                               <div>
//                                 <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
//                                   <Trophy size={12} className="flex-shrink-0" style={{ color: accentColor }} />
//                                   Ranking
//                                 </h4>
//                                 <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
//                                   <p className="text-xs text-slate-300 break-words">{course.Ranking}</p>
//                                 </div>
//                               </div>
//                             )}

//                             {course["User Rating"] && (
//                               <div>
//                                 <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
//                                   <Award size={12} className="flex-shrink-0" style={{ color: accentColor }} />
//                                   User Rating
//                                 </h4>
//                                 <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
//                                   <p className="text-xs text-yellow-400">{course["User Rating"]}</p>
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                           {/* Right Column */}
//                           <div className="space-y-3">
//                             {course.entrance_exam && (
//                               <div>
//                                 <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
//                                   <BookOpen size={12} className="flex-shrink-0" style={{ color: accentColor }} />
//                                   Exam Accepted
//                                 </h4>
//                                 <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
//                                   <p className="text-xs text-slate-300 break-words">{course.entrance_exam}</p>
//                                 </div>
//                               </div>
//                             )}

//                             {course.Approvals && (
//                               <div>
//                                 <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Approvals</h4>
//                                 <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
//                                   <p className="text-xs text-slate-300 break-words">{course.Approvals}</p>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* CTA Buttons */}
//                         <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
//                           {course["Application Link"] ? (
//                             <a
//                               href={
//                                 course["Application Link"].startsWith("http")
//                                   ? course["Application Link"]
//                                   : `https://${course["Application Link"]}`
//                               }
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
//                               style={{ backgroundColor: accentColor }}
//                             >
//                               <Globe size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
//                               <span>Apply Now</span>
//                             </a>
//                           ) : (
//                             course.is_priority && (
//                               <button
//                                 className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
//                                 style={{ backgroundColor: accentColor }}
//                                 onClick={() => {
//                                   alert("Contact our experts for fast admission!")
//                                 }}
//                               >
//                                 <Sparkles size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
//                                 <span>Contact</span>
//                               </button>
//                             )
//                           )}
                          
//                           {/* <CompareButton
//                             course={course}
//                             isInCompare={inCompare}
//                             onToggle={toggleCompare}
//                           /> */}
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>

//               <Pagination
//                 totalItems={filteredCourses.length}
//                 currentPage={currentPage}
//                 perPage={perPage}
//                 onPageChange={setCurrentPage}
//               />
//             </>
//           )}
//         </div>
//         <CompareFloatingButton 
//           compareCount={compareColleges.length}
//           onCompareClick={goToComparison}
//         />
//       </div>
//     </DefaultLayout>
//   )
// }

// export default CourseFinder
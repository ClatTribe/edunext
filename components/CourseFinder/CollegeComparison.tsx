import React, { useState, useEffect } from "react"
import { GitCompare, X } from "lucide-react"
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

interface CollegeComparisonProps {
  user: any
  courses: Course[]
}

// Changed from React.FC to a regular hook function
const useCollegeComparison = ({ user, courses }: CollegeComparisonProps) => {
  const [compareColleges, setCompareColleges] = useState<Course[]>([])

  // Load compare colleges on mount
  useEffect(() => {
    if (user) {
      fetchCompareCollegesFromDB()
    } else {
      fetchCompareCollegesFromLocalStorage()
    }
  }, [user, courses])

  // Fetch compare colleges from database (for logged-in users)
  const fetchCompareCollegesFromDB = async () => {
    if (!user || courses.length === 0) return

    try {
      const { data: compareData, error: compareError } = await supabase
        .from("compare_colleges")
        .select("college_id")
        .eq("user_id", user.id)

      if (compareError) throw compareError

      if (compareData && compareData.length > 0) {
        const collegeIds = compareData.map(item => item.college_id)
        const selectedColleges = courses.filter(c => collegeIds.includes(c.id))
        setCompareColleges(selectedColleges)
      }
    } catch (err) {
      console.error("Error fetching compare colleges:", err)
    }
  }

  // Fetch compare colleges from localStorage (for non-logged-in users)
  const fetchCompareCollegesFromLocalStorage = () => {
    if (courses.length === 0) return

    try {
      const storedCompareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
      if (storedCompareIds.length > 0) {
        const selectedColleges = courses.filter(c => storedCompareIds.includes(c.id))
        setCompareColleges(selectedColleges)
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err)
    }
  }

  // Toggle compare (add/remove college)
  const toggleCompare = async (course: Course) => {
    const exists = compareColleges.find(c => c.id === course.id)

    if (exists) {
      // Remove from compare
      if (user) {
        try {
          const { error } = await supabase
            .from("compare_colleges")
            .delete()
            .eq("user_id", user.id)
            .eq("college_id", course.id)

          if (error) throw error

          setCompareColleges(prev => prev.filter(c => c.id !== course.id))
        } catch (err) {
          console.error("Error removing from compare:", err)
          alert("Failed to remove from comparison. Please try again.")
        }
      } else {
        // Remove from localStorage
        const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
        const updatedIds = storedIds.filter((id: number) => id !== course.id)
        localStorage.setItem('compareColleges', JSON.stringify(updatedIds))
        setCompareColleges(prev => prev.filter(c => c.id !== course.id))
      }
    } else {
      // Add to compare (max 3)
      if (compareColleges.length >= 3) {
        alert('You can compare maximum 3 colleges at a time')
        return
      }

      if (user) {
        try {
          const { error } = await supabase
            .from("compare_colleges")
            .insert({
              user_id: user.id,
              college_id: course.id
            })

          if (error) {
            // Check if it's a duplicate error
            if (error.code === '23505') {
              console.log("College already in comparison")
              return
            }
            throw error
          }

          setCompareColleges(prev => [...prev, course])
        } catch (err) {
          console.error("Error adding to compare:", err)
          alert("Failed to add to comparison. Please try again.")
        }
      } else {
        // Add to localStorage
        const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
        storedIds.push(course.id)
        localStorage.setItem('compareColleges', JSON.stringify(storedIds))
        
        // Also cache all courses for comparison page
        localStorage.setItem('allColleges', JSON.stringify(courses))
        
        setCompareColleges(prev => [...prev, course])
      }
    }
  }

  const removeFromCompare = async (courseId: number) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("compare_colleges")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", courseId)

        if (error) throw error

        setCompareColleges(prev => prev.filter(c => c.id !== courseId))
      } catch (err) {
        console.error("Error removing from compare:", err)
      }
    } else {
      const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
      const updatedIds = storedIds.filter((id: number) => id !== courseId)
      localStorage.setItem('compareColleges', JSON.stringify(updatedIds))
      setCompareColleges(prev => prev.filter(c => c.id !== courseId))
    }
  }

  const isInCompare = (courseId: number) => {
    return compareColleges.some(c => c.id === courseId)
  }

  const goToComparison = () => {
    // For non-logged-in users, also save to localStorage before navigation
    if (!user && courses.length > 0) {
      localStorage.setItem('allColleges', JSON.stringify(courses))
    }
    window.location.href = '/compare-your-college'
  }

  return {
    compareColleges,
    toggleCompare,
    removeFromCompare,
    isInCompare,
    goToComparison,
  }
}

// Compare Button Component (for individual cards)
export const CompareButton: React.FC<{
  course: Course
  isInCompare: boolean
  onToggle: (course: Course) => void
}> = ({ course, isInCompare, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(course)}
      className={`flex-1 rounded-lg py-2 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md ${
        isInCompare
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
      }`}
    >
      <GitCompare size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
      <span>{isInCompare ? "Remove" : "Add to Compare"}</span>
    </button>
  )
}

// Compare Badge Component (for cards)
export const CompareBadge: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null

  return (
    <div className="mb-3">
      <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-300">
        <GitCompare size={12} />
        Added to Compare
      </span>
    </div>
  )
}

export default useCollegeComparison
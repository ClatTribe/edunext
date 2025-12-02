import { useState, useEffect } from "react"
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

export const useSavedCourses = (user: unknown) => {
  const [savedCourses, setSavedCourses] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadSavedCourses()
    }
  }, [user])

  const loadSavedCourses = async () => {
    if (!user || typeof user !== 'object' || !('id' in user)) return
    
    try {
      const { data, error } = await supabase
        .from("shortlist_builder")
        .select("course_id")
        .eq("user_id", (user as { id: string }).id)
        .eq("item_type", "course")

      if (error) {
        console.error("Error loading saved courses:", error)
        return
      }

      if (data) {
        const courseIds = new Set(data.map((item) => item.course_id).filter(Boolean))
        setSavedCourses(courseIds)
      }
    } catch (error) {
      console.error("Error loading saved courses:", error)
    }
  }

  const toggleSaved = async (course: Course) => {
    if (!user || typeof user !== 'object' || !('id' in user)) {
      alert("Please login to save courses")
      return
    }

    const userId = (user as { id: string }).id

    try {
      const isSaved = savedCourses.has(course.id)
      if (isSaved) {
        const { error } = await supabase
          .from("shortlist_builder")
          .delete()
          .eq("user_id", userId)
          .eq("course_id", course.id)
          .eq("item_type", "course")

        if (error) throw error

        setSavedCourses((prev) => {
          const newSet = new Set(prev)
          newSet.delete(course.id)
          return newSet
        })
      } else {
        const { error } = await supabase.from("shortlist_builder").insert({
          user_id: userId,
          item_type: "course",
          course_id: course.id,
          status: "interested",
        })

        if (error) throw error

        setSavedCourses((prev) => new Set([...prev, course.id]))
      }
    } catch (error) {
      console.error("Error toggling saved course:", error)
      alert("Failed to update shortlist. Please try again.")
    }
  }

  return { savedCourses, toggleSaved }
}

export default useSavedCourses
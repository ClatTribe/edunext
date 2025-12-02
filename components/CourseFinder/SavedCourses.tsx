import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

interface Course {
  id: number
  [key: string]: any
}

export const useSavedCourses = (user: any) => {
  const [savedCourses, setSavedCourses] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadSavedCourses()
    }
  }, [user])

  const loadSavedCourses = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("shortlist_builder")
        .select("course_id")
        .eq("user_id", user.id)
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
    if (!user) {
      alert("Please login to save courses")
      return
    }

    try {
      const isSaved = savedCourses.has(course.id)
      if (isSaved) {
        const { error } = await supabase
          .from("shortlist_builder")
          .delete()
          .eq("user_id", user.id)
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
          user_id: user.id,
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
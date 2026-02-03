import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

interface CollegeMicrosite {
  id: number
  slug?: string
  college_name?: string
  "College Name"?: string | null
  location?: string
  Location?: string | null
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
  microsite_data?: any
}

export const useSavedMicrositeCourses = (user: unknown) => {
  const [savedMicrositeCourses, setSavedMicrositeCourses] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadSavedMicrositeCourses()
    }
  }, [user])

  const loadSavedMicrositeCourses = async () => {
    if (!user || typeof user !== 'object' || !('id' in user)) return
    
    try {
      const { data, error } = await supabase!
        .from("shortlist_builder_microsite")
        .select("college_microsite_id")
        .eq("user_id", (user as { id: string }).id)

      if (error) {
        console.error("Error loading saved microsite courses:", error)
        return
      }

      if (data) {
        const courseIds = new Set(data.map((item) => item.college_microsite_id).filter(Boolean))
        setSavedMicrositeCourses(courseIds)
      }
    } catch (error) {
      console.error("Error loading saved microsite courses:", error)
    }
  }

  const toggleSavedMicrosite = async (college: CollegeMicrosite) => {
    if (!user || typeof user !== 'object' || !('id' in user)) {
      alert("Please login to save colleges")
      return
    }

    const userId = (user as { id: string }).id

    try {
      const isSaved = savedMicrositeCourses.has(college.id)
      if (isSaved) {
        const { error } = await supabase!
          .from("shortlist_builder_microsite")
          .delete()
          .eq("user_id", userId)
          .eq("college_microsite_id", college.id)

        if (error) throw error

        setSavedMicrositeCourses((prev) => {
          const newSet = new Set(prev)
          newSet.delete(college.id)
          return newSet
        })
      } else {
        const { error } = await supabase!.from("shortlist_builder_microsite").insert({
          user_id: userId,
          college_microsite_id: college.id,
          status: "interested",
        })

        if (error) throw error

        setSavedMicrositeCourses((prev) => new Set([...prev, college.id]))
      }
    } catch (error) {
      console.error("Error toggling saved microsite college:", error)
      alert("Failed to update shortlist. Please try again.")
    }
  }

  return { savedMicrositeCourses, toggleSavedMicrosite }
}

export default useSavedMicrositeCourses
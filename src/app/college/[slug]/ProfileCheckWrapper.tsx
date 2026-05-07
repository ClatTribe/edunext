"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import CollegeMatchCard from "../../../../components/CollegeMatchCard"

interface ProfileCheckWrapperProps {
  college: any;
  micrositeData: any;
}

export default function ProfileCheckWrapper({ college, micrositeData }: ProfileCheckWrapperProps) {
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from("admit_profiles")
          .select("name, degree, city")
          .eq("user_id", user.id)
          .single()
        if (profile?.name && profile?.degree) {
          setIsProfileComplete(true)
        }
      } catch {
        // Not logged in or no profile — stays false
      }
    }
    checkProfile()
  }, [])

  return (
    <CollegeMatchCard
      college={college}
      micrositeData={micrositeData}
      isProfileComplete={isProfileComplete}
    />
  )
}

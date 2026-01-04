"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { TrendingUp, Trophy, Loader2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function PlacementPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollege()
  }, [slug])

  const fetchCollege = async () => {
    try {
      const { data } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()
      setCollege(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-12 w-12" style={{ color: accentColor }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={32} style={{ color: accentColor }} />
          Placements
        </h1>

        <div className="rounded-xl p-6 sm:p-8 backdrop-blur-xl text-center" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
          <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Placement Data Coming Soon</h3>
          <p className="text-slate-400">We're working on adding detailed placement statistics for this college.</p>
        </div>
      </div>
    </div>
  )
}
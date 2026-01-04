"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useParams } from "next/navigation"
import { MapPin, Award, Globe, AlertCircle, Loader2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function CollegePage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollege()
  }, [slug])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()

      if (supabaseError) throw supabaseError
      if (!data) throw new Error("College not found")

      setCollege(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch college")
      console.error("Error fetching college:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-12 w-12" style={{ color: accentColor }} />
          <p className="text-slate-400">Loading college details...</p>
        </div>
      </div>
    )
  }

  if (error || !college) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle style={{ color: '#ef4444' }} size={20} />
            <div>
              <h3 className="font-semibold text-red-400">Error</h3>
              <p className="text-sm text-red-300">{error || "College not found"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const micrositeData = typeof college.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college.microsite_data

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-xl p-6 sm:p-8 mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            {college.college_name}
          </h1>
          
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <MapPin size={18} style={{ color: accentColor }} />
            <span className="text-sm sm:text-base">{college.location}</span>
          </div>

          {college.url && (
            <a
              href={college.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white rounded-lg py-2 px-4 transition-all text-sm font-medium"
              style={{ backgroundColor: accentColor }}
            >
              <Globe size={16} />
              Visit Official Website
            </a>
          )}
        </div>

        {/* About Section */}
        <div className="rounded-xl p-6 sm:p-8 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Award size={24} style={{ color: accentColor }} />
            About College
          </h2>
          
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {micrositeData?.about_section?.full_text || "Information not available"}
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Building2, CheckCircle, Loader2, Globe } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function AdmissionPage() {
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

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 size={32} style={{ color: accentColor }} />
          Admission Process
        </h1>

        <div className="rounded-xl p-6 sm:p-8 backdrop-blur-xl mb-6" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
          <div className="prose prose-invert max-w-none">
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {micrositeData?.about_section?.full_text || "Admission information not available"}
            </div>
          </div>
        </div>

        {college?.url && (
          <div className="rounded-xl p-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle style={{ color: accentColor }} size={20} />
              Ready to Apply?
            </h3>
            <a
              href={college.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white rounded-lg py-3 px-6 transition-all font-medium"
              style={{ backgroundColor: accentColor }}
            >
              <Globe size={18} />
              Apply Now
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
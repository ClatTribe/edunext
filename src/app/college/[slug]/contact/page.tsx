"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Phone, MapPin, Globe, Mail, Loader2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function ContactPage() {
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
          <Phone size={32} style={{ color: accentColor }} />
          Contact Information
        </h1>

        <div className="space-y-6">
          {/* Location */}
          {college?.location && (
            <div className="rounded-xl p-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-3">
                <MapPin size={24} style={{ color: accentColor }} className="shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                  <p className="text-slate-300">{college.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Website */}
          {college?.url && (
            <div className="rounded-xl p-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-3">
                <Globe size={24} style={{ color: accentColor }} className="shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Website</h3>
                  <a 
                    href={college.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm break-all hover:underline"
                    style={{ color: accentColor }}
                  >
                    {college.url}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* General Contact Card */}
          <div className="rounded-xl p-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold text-white mb-4">Need More Information?</h3>
            <p className="text-slate-300 mb-4">For admission inquiries and detailed information, please visit the official website or contact the admission office directly.</p>
            {college?.url && (
              <a
                href={college.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white rounded-lg py-3 px-6 transition-all font-medium"
                style={{ backgroundColor: accentColor }}
              >
                <Globe size={18} />
                Visit Official Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
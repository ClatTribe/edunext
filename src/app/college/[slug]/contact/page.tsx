"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Phone, MapPin, Globe, Mail, Loader2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

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
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-5xl mx-auto space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
            <Phone className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: accentColor }} />
            Contact Information
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.6em]">
            Get in Touch
          </p>
        </div>

        <div className="space-y-10">
          {/* Location Card */}
          {college?.location && (
            <div className="flex items-center space-x-8 sm:space-x-10 p-10 sm:p-14 bg-white/5 border border-white/10 rounded-[5rem] hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 transition-all group shadow-2xl">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#F59E0B] group-hover:text-[#060818] transition-all duration-500" style={{ color: accentColor }}>
                <MapPin className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] font-black block uppercase tracking-[0.3em]">
                  Campus Locale
                </span>
                <span className="text-white font-bold text-base sm:text-lg leading-relaxed">
                  {college.location}
                </span>
              </div>
            </div>
          )}

          {/* Website Card */}
          {college?.url && (
            <div className="flex items-center space-x-8 sm:space-x-10 p-10 sm:p-14 bg-white/5 border border-white/10 rounded-[5rem] hover:bg-blue-600/5 hover:border-blue-500/30 transition-all group shadow-2xl">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 text-blue-500">
                <Globe className="w-10 h-10" />
              </div>
              <div className="space-y-2 flex-1">
                <span className="text-slate-400 text-[10px] font-black block uppercase tracking-[0.3em]">
                  Official Website
                </span>
                <a 
                  href={college.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white font-bold text-base sm:text-lg break-all hover:underline block"
                  style={{ color: accentColor }}
                >
                  {college.url}
                </a>
              </div>
            </div>
          )}

          {/* CTA Card */}
          <div className="p-12 sm:p-16 rounded-[5rem] border border-white/10 space-y-10 shadow-2xl backdrop-blur-3xl" style={{ backgroundColor: accentColor, color: primaryBg }}>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Need More Information?
            </h3>
            
            <p className="text-sm sm:text-base font-semibold leading-relaxed opacity-90">
              For admission inquiries and detailed information, please visit the official website or contact the admission office directly.
            </p>
            
            {college?.url && (
              <a
                href={college.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 py-5 px-10 bg-[#060818] text-white rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all font-black text-sm uppercase tracking-widest"
              >
                <Globe className="w-5 h-5" />
                Visit Official Website
              </a>
            )}
            
            <div className="pt-6 text-[10px] font-black uppercase tracking-widest opacity-60 text-center border-t border-black/10">
              Ambition से Admission तक
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
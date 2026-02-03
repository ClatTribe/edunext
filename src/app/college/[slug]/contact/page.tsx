"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Phone, MapPin, Globe, Loader2, ArrowUpRight } from "lucide-react"

const accentColor = '#F59E0B'
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
      const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
      setCollege(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Get In Touch
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Contact <span style={{ color: accentColor }}>Information.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Location Card */}
        {college?.location && (
          <div className="flex items-start gap-6 p-6 md:p-8 bg-[#0F172B] border border-white/10 rounded-[2rem] hover:border-amber-500/30 transition-all group shadow-xl">
            <div className="w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300" style={{ color: accentColor }}>
              <MapPin size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[9px] font-black block uppercase tracking-widest">
                Campus Locale
              </span>
              <p className="text-white font-bold text-sm md:text-base leading-relaxed">
                {college.location}
              </p>
            </div>
          </div>
        )}

        {/* Website Card */}
        {college?.url && (
          <div className="flex items-start gap-6 p-6 md:p-8 bg-[#0F172B] border border-white/10 rounded-[2rem] hover:border-blue-500/30 transition-all group shadow-xl">
            <div className="w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 text-blue-500">
              <Globe size={24} />
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-slate-500 text-[9px] font-black block uppercase tracking-widest">
                Official Channels
              </span>
              <a 
                href={college.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-bold text-sm md:text-base break-all hover:text-amber-500 transition-colors flex items-center gap-2"
              >
                {college.url.replace('https://', '').replace('www.', '')}
                <ArrowUpRight size={14} className="opacity-50" />
              </a>
            </div>
          </div>
        )}

        {/* Major CTA Card - Amber Focus */}
        <div className="relative p-8 md:p-12 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" 
             style={{ backgroundColor: accentColor }}>
          {/* Decorative background icon */}
          <Phone className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 -rotate-12 text-black" />
          
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-3xl font-black leading-none text-[#050818] uppercase tracking-tighter">
              Ready to take <br />the next step?
            </h3>
            
            <p className="text-xs md:text-sm font-bold leading-relaxed text-[#050818]/80 max-w-md">
              For personalized admission counseling and detailed campus tours, connect with the official administration desk.
            </p>
            
            {college?.url && (
              <a
                href={college.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 py-4 px-8 bg-[#050818] text-white rounded-xl shadow-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Connect Now
              </a>
            )}
            
            <div className="pt-6 text-[9px] font-black uppercase tracking-[0.4em] text-[#050818]/40 border-t border-black/5">
              Ambition से Admission तक
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
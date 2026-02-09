"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Phone, MapPin, Globe, Loader2, ArrowUpRight, Headset } from "lucide-react"

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

      <div className="grid grid-cols-1 gap-5">
        {/* Location Card */}
        {college?.location && (
          <div className="group relative flex items-start gap-6 p-6 md:p-8 bg-[#0F172B] border rounded-[2rem] transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-1.5 shadow-2xl overflow-hidden"
               style={{ borderColor: borderColor }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:border-amber-500/30 group-hover:scale-110 transition-all duration-500" style={{ color: accentColor }}>
              <MapPin size={24} className="group-hover:text-white transition-colors" />
            </div>
            
            <div className="relative z-10 space-y-1">
              <span className="text-slate-500 text-[9px] font-black block uppercase tracking-[0.2em] group-hover:text-amber-500/60 transition-colors">
                Campus Locale
              </span>
              <p className="text-white font-bold text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                {college.location}
              </p>
            </div>
          </div>
        )}

        {/* Website Card */}
        {college?.url && (
          <div className="group relative flex items-start gap-6 p-6 md:p-8 bg-[#0F172B] border rounded-[2rem] transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-1.5 shadow-2xl overflow-hidden"
               style={{ borderColor: borderColor }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:border-amber-500/30 group-hover:scale-110 transition-all duration-500" style={{ color: accentColor }}>
              <Globe size={24} className="group-hover:text-white transition-colors" />
            </div>
            
            <div className="relative z-10 space-y-1 overflow-hidden">
              <span className="text-slate-500 text-[9px] font-black block uppercase tracking-[0.2em] group-hover:text-amber-500/60 transition-colors">
                Official Channels
              </span>
              <a 
                href={college.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-black text-sm md:text-base break-all hover:text-amber-400 transition-colors flex items-center gap-2"
              >
                {college.url.replace('https://', '').replace('www.', '')}
                <ArrowUpRight size={16} className="text-amber-500 animate-pulse" />
              </a>
            </div>
          </div>
        )}

        {/* Admission CTA Card - REPLACED THE SOLID YELLOW */}
        <div className="group relative p-8 md:p-10 rounded-[2.5rem] border border-white/5 bg-[#050818] overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-500/30">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Headset size={20} style={{ color: accentColor }} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  Admission <span style={{ color: accentColor }}>Desk.</span>
                </h3>
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-400 max-w-sm leading-relaxed">
                Connect with the official administration for personalized counseling and direct admission queries.
              </p>
            </div>

            <div className="flex flex-col gap-4 shrink-0">
              {college?.url && (
                <a
                  href={college.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 py-4 px-10 bg-amber-500 text-[#050818] rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest"
                >
                  Apply Directly
                  <ArrowUpRight size={18} />
                </a>
              )}
              <div className="text-[10px] font-black text-center text-slate-600 uppercase tracking-[0.4em]">
                Ambition से Admission तक
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
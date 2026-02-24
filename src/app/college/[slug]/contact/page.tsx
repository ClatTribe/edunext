"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Phone, MapPin, Globe, Loader2, ArrowUpRight, Headset, Target } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function ContactPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
        setCollege(data)
      } finally {
        setLoading(false)
      }
    }
    fetchCollege()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header Section (Matches Cutoff Style) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Official Channels</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Contact <span className="text-amber-500">Information.</span>
        </h1>
      </div>

      <div className="space-y-6">
        {/* Location Card */}
        {college?.location && (
          <div
            className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B]
                       hover:border-amber-500/40 hover:-translate-y-1"
            style={{ borderColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                           group-hover:scale-110 transition-transform duration-500 shrink-0"
                   style={{ borderColor, color: accentColor }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                Campus Locale
              </h3>
            </div>

            <div className="relative z-10 px-6 md:px-8 py-6">
              <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                {college.location}
              </p>
            </div>
          </div>
        )}

        {/* Website Card */}
        {college?.url && (
          <div
            className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B]
                       hover:border-amber-500/40 hover:-translate-y-1"
            style={{ borderColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                           group-hover:scale-110 transition-transform duration-500 shrink-0"
                   style={{ borderColor, color: accentColor }}>
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                Digital Portal
              </h3>
            </div>
            
            <div className="relative z-10 px-6 md:px-8 py-6">
              <a 
                href={college.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 font-medium text-sm md:text-base hover:text-amber-400 transition-colors"
              >
                {college.url.replace('https://', '').replace('www.', '')}
                <ArrowUpRight size={16} className="text-amber-500" />
              </a>
            </div>
          </div>
        )}

        {/* CTA Card (Refined to match card weights) */}
        <div className="group relative p-8 md:p-10 rounded-[2rem] border border-white/5 bg-[#050818] overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Headset size={20} className="text-amber-500" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  Admission <span className="text-amber-500">Desk.</span>
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
                Official Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
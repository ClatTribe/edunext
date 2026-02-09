"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, Quote, GraduationCap, FileText, ShieldCheck, Zap } from "lucide-react"

const accentColor = '#F59E0B';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

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

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const admissionTables = micrositeData?.admission || []
  const basicInfo = admissionTables[0]?.rows || []
  
  const admissionMode = basicInfo.find((row: any[]) => row[0] === "Mode of Application")?.[1] || "Offline"
  const admissionBasis = basicInfo.find((row: any[]) => row[0] === "Basis of Admission")?.[1] || "Merit Based"
  const scholarshipAvailable = basicInfo.find((row: any[]) => row[0] === "Scholarship")?.[1] || "No"

  const courseAdmissions = admissionTables[1]?.rows || []

  return (
    <div className="space-y-12">
      {/* Top Section */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Enrollment 2026
              </span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
              Selection <span style={{ color: accentColor }}>Protocol.</span>
            </h3>
          </div>
          
          <p className="text-base text-slate-400 leading-relaxed font-medium">
            Admissions are strictly merit-based, evaluating the latest qualifying exam scores. 
            We maintain a high standard of transparency for a <span className="text-white">fair selection process</span>.
          </p>
          
          <div className="group relative p-6 rounded-2xl border-l-4 overflow-hidden bg-[#0F172B] transition-all duration-300 hover:bg-[#161e35]" 
               style={{ borderColor: accentColor }}>
            <Quote className="absolute -top-1 -right-1 w-12 h-12 opacity-5 text-white group-hover:opacity-10 transition-opacity" />
            <p className="italic text-slate-200 text-sm font-medium relative z-10">
              "Merit-driven enrollment with full transparency in the admission process."
            </p>
          </div>
        </div>
        
        {/* Overview Card */}
        <div className="group relative p-6 rounded-[2rem] border backdrop-blur-3xl shadow-xl space-y-6 transition-all duration-500 hover:border-amber-500/30 hover:-translate-y-1.5"
             style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
          
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck size={18} className="transition-transform duration-500 group-hover:scale-110" style={{ color: accentColor }} />
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
               Admission Overview
             </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
            {[
              { l: 'Mode', v: admissionMode, icon: FileText },
              { l: 'Basis', v: admissionBasis, icon: GraduationCap },
              { l: 'Scholarship', v: scholarshipAvailable, icon: Zap }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border bg-[#050818]/50 border-white/5 transition-all duration-300 hover:bg-[#050818] hover:border-amber-500/20 group/item">
                <item.icon className="w-4 h-4 mb-2 opacity-40 transition-opacity group-hover/item:opacity-100" style={{ color: accentColor }} />
                <p className="text-slate-500 font-bold text-[8px] uppercase tracking-tighter mb-1">{item.l}</p>
                <p className="text-white text-xs font-black truncate">{item.v}</p>
              </div>
            ))}
          </div>

          {/* Background Glow */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[40px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: accentColor }}></div>
        </div>
      </div>

      {/* Detailed Criteria Section */}
      {courseAdmissions.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
              Program Eligibility
            </h2>
            <div className="w-12 h-[2px]" style={{ backgroundColor: accentColor }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            {courseAdmissions.map((course: any[], i: number) => (
              <div key={i} className="group relative p-6 rounded-[2rem] border transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1.5 shadow-lg bg-[#0F172B] overflow-hidden"
                   style={{ borderColor: borderColor }}>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border bg-[#050818] transition-transform duration-500 group-hover:scale-110" 
                       style={{ borderColor: borderColor, color: accentColor }}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors duration-300 line-clamp-1">
                      {course[0] || 'N/A'}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-amber-500/60">Eligibility Criteria</p>
                  </div>
                </div>
                
                <div className="relative z-10 space-y-4">
                  {course[1] && (
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 transition-colors group-hover:bg-black/50 group-hover:border-white/10">
                      <p className="text-slate-300 text-xs leading-relaxed font-medium">
                        {course[1]}
                      </p>
                    </div>
                  )}
                  {course[2] && (
                    <p className="text-slate-500 text-[10px] leading-relaxed px-1 italic group-hover:text-slate-400 transition-colors">
                      Selection: {course[2]}
                    </p>
                  )}
                </div>

                {/* Corner Decor */}
                <div className="absolute -right-6 -bottom-6 w-16 h-16 blur-2xl rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: accentColor }}></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, Quote, GraduationCap, FileText, Calendar, ShieldCheck, Zap } from "lucide-react"

// Consistent Color Palette
const accentColor = '#F59E0B';
const primaryBg = '#050818'; 
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

  const admissionTables = micrositeData?.admission || []
  const basicInfo = admissionTables[0]?.rows || []
  
  const admissionMode = basicInfo.find((row: any[]) => row[0] === "Mode of Application")?.[1] || "Offline"
  const admissionBasis = basicInfo.find((row: any[]) => row[0] === "Basis of Admission")?.[1] || "Merit Based"
  const scholarshipAvailable = basicInfo.find((row: any[]) => row[0] === "Scholarship")?.[1] || "No"

  const courseAdmissionTable = admissionTables[1] || { headers: [], rows: [] }
  const courseAdmissions = courseAdmissionTable.rows || []

  return (
    <div className="min-h-screen p-6 sm:p-12" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Top Section: Hero & Stats */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-12" style={{ backgroundColor: accentColor }}></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accentColor }}>
                  Enrollment 2025
                </span>
              </div>
              <h3 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                Selection <br />
                <span style={{ color: accentColor }}>Protocol.</span>
              </h3>
            </div>
            
            <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-xl">
              Admissions are strictly merit-based, evaluating the latest qualifying exam scores. We maintain a high standard of transparency to ensure a <span className="text-white">fair selection process</span> for all candidates.
            </p>
            
            <div className="relative p-10 rounded-[3rem] border-l-[8px] overflow-hidden" 
                 style={{ backgroundColor: secondaryBg, borderColor: accentColor }}>
              <Quote className="absolute -top-2 -right-2 w-24 h-24 opacity-5 text-white" />
              <p className="italic text-slate-200 text-lg font-medium leading-relaxed relative z-10">
                "Merit-driven enrollment at {(college?.title || college?.college_name)?.split(':')[0]} with full transparency in the admission process."
              </p>
            </div>
          </div>
          
          {/* Overview Card */}
          <div className="p-8 sm:p-12 rounded-[4rem] border backdrop-blur-3xl shadow-2xl space-y-8"
               style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
            <div className="flex items-center gap-4 mb-4">
               <ShieldCheck style={{ color: accentColor }} />
               <h4 className="text-sm font-black text-white uppercase tracking-[0.3em]">
                 Admission Overview
               </h4>
            </div>
            
            <div className="space-y-4">
              {[
                { l: 'Application Mode', v: admissionMode, icon: FileText },
                { l: 'Selection Basis', v: admissionBasis, icon: GraduationCap },
                { l: 'Scholarship Available', v: scholarshipAvailable, icon: Zap }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-6 rounded-3xl border transition-all duration-300 group hover:bg-white/5"
                  style={{ backgroundColor: primaryBg, borderColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 opacity-40" style={{ color: accentColor }} />
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                      {item.l}
                    </span>
                  </div>
                  <span className="text-white font-black group-hover:text-amber-400 transition-colors">
                    {item.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Criteria Section */}
        {courseAdmissions.length > 0 && (
          <section className="space-y-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-[2px]" style={{ backgroundColor: accentColor }}></div>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                Program Eligibility
              </h2>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase">
                Detailed Selection Criteria by Faculty
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {courseAdmissions.map((course: any[], i: number) => (
                <div 
                  key={i} 
                  className="group relative p-10 rounded-[3rem] border transition-all duration-500 hover:border-amber-500/40 shadow-xl overflow-hidden"
                  style={{ backgroundColor: secondaryBg, borderColor: borderColor }}
                >
                  {/* Subtle Background Icon */}
                  <GraduationCap className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />

                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3" 
                         style={{ backgroundColor: primaryBg, borderColor: borderColor, color: accentColor }}>
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white group-hover:text-amber-400 transition-colors">
                        {course[0] || 'N/A'}
                      </h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Major Program</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    {course[1] && (
                      <div className="p-5 rounded-2xl bg-black/30 border border-white/5">
                        <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500"></span> Eligibility
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                          {course[1]}
                        </p>
                      </div>
                    )}
                    
                    {course[2] && (
                      <div className="px-2">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">
                          Selection Process
                        </p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {course[2]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
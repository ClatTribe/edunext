"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Loader2, Eye, Target, Phone, Mail, Globe, Quote, GraduationCap, FileText, ShieldCheck, Zap, MapPin, ArrowUpRight, ArrowRight, BarChart3, ChevronRight, IndianRupee, Wallet, Info, Trophy, Award, Building2, TrendingUp, Star, MessageSquare } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function CollegeOverviewPage() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    fetchCollege()
  }, [slug])

  useEffect(() => {
    // Extract section from URL
    const urlParts = pathname.split('/')
    const section = urlParts[urlParts.length - 1]
    
    // Valid sections
    const sections = ['overview', 'courses', 'fees', 'admission', 'placement', 'cutoff', 'ranking', 'reviews', 'contact']
    const targetSection = sections.includes(section) ? section : 'overview'
    
    setActiveSection(targetSection)
    
    // Scroll to section after a short delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById(targetSection)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [pathname])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()

      if (data) setCollege(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
      </div>
    )
  }

  if (!college) return null

  const micrositeData = college.microsite_data || {}
  const advantages = micrositeData?.advantages || []
  const aboutText = college.about || micrositeData?.about || "Information not available"

  // Courses data
  const coursesData = college?.courses
  const popularCourses = coursesData === "See Fees Section" 
    ? (college?.microsite_data?.fees?.[0]?.rows?.map((row: any) => ({
        course_name: row[0],
        eligibility: row[1],
        fees: row[2]
      })) || [])
    : (micrositeData?.popular_courses_table || [])

  // Fees data
  const feesData = micrositeData?.fees?.[0] || { headers: [], rows: [] }
  const feesRows = feesData.rows || []
  const courses = feesRows.map((row: any[]) => ({
    course: row[0] || 'N/A',
    eligibility: row[1] || 'N/A',
    fees: row[2] || 'N/A',
    hostelFees: row[3] || undefined
  }))

  // Admission data
  const admissionTables = micrositeData?.admission || []
  const basicInfo = admissionTables[0]?.rows || []
  const admissionMode = basicInfo.find((row: any[]) => row[0] === "Mode of Application")?.[1] || "Offline"
  const admissionBasis = basicInfo.find((row: any[]) => row[0] === "Basis of Admission")?.[1] || "Merit Based"
  const scholarshipAvailable = basicInfo.find((row: any[]) => row[0] === "Scholarship")?.[1] || "No"
  const courseAdmissions = admissionTables[1]?.rows || []

  // Placement data
  const placementData = micrositeData?.placement || []
  const mainPlacementTable = placementData[0] || { headers: [], rows: [] }
  const highestPackage = mainPlacementTable.headers?.[1] || 'N/A'
  const averagePackage = mainPlacementTable.rows?.[0]?.[1] || 'N/A'
  const topRecruitersString = mainPlacementTable.rows?.[1]?.[1] || '' 
  const recruitersFromTable = (placementData[1]?.rows || []).flat().filter(Boolean)
  const companiesFromTable = (placementData[2]?.rows || []).flat().filter(Boolean)
  const uniqueRecruiters = [...new Set([
    ...topRecruitersString.split(',').map((r: string) => r.trim()).filter(Boolean),
    ...recruitersFromTable,
    ...companiesFromTable
  ])]
  const hasPlacementData = highestPackage !== 'N/A' || averagePackage !== 'N/A' || uniqueRecruiters.length > 0

  // Cutoff data
  const cutoffData = micrositeData?.cutoff || college?.cutoff || []

  // Ranking data
  const rankingData = micrositeData?.ranking || college?.ranking || []

  // Reviews data
  const reviewsData = college?.reviews || college?.microsite_data?.reviews
  const aggregateRating = reviewsData?.aggregate_rating

  return (
    <div className="space-y-16">
      {/* OVERVIEW SECTION */}
      <section id="overview" className="scroll-mt-28">
        <div className="space-y-8">
          <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">
            Institutional <span style={{ color: accentColor }}>Vision.</span>
          </h3>
          <p className="text-lg sm:text-xl text-slate-400 leading-loose font-medium italic pl-6 sm:pl-10" style={{ borderLeft: `10px solid ${accentColor}` }}>
            {aboutText}
          </p>
        </div>
        
        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-10 mt-8">
          <div className="p-8 sm:p-12 rounded-[4rem] bg-white/5 border border-white/10 space-y-6 hover:bg-[#F59E0B]/5 transition-all">
            <Eye className="w-8 h-8" style={{ color: accentColor }} />
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Growth Vision</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              {micrositeData?.about_section?.vision || "To be a center of excellence fostering innovation and professional ethics."}
            </p>
          </div>
          
          <div className="p-8 sm:p-12 rounded-[4rem] bg-white/5 border border-white/10 space-y-6 hover:bg-blue-600/5 transition-all">
            <Target className="text-blue-500 w-8 h-8" />
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Academic Mission</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              {micrositeData?.about_section?.mission || "Providing value-based education and practical skills through modern pedagogy."}
            </p>
          </div>
        </div>

        {/* Advantages Section */}
        {advantages.length > 0 && (
          <div className="space-y-12 mt-16">
            <div className="text-center space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: accentColor }}>The Advantage</h3>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                Why {college.college_name?.split(' ')[0]}?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {advantages.map((adv: any, i: number) => (
                <div key={i} className="p-8 sm:p-12 rounded-[4.5rem] bg-[#060818] border border-white/5 hover:border-[#F59E0B]/40 transition-all text-center space-y-8 group shadow-inner">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl group-hover:scale-110 transition-all" style={{ color: accentColor }}>
                    <span className="text-4xl">{adv.icon || '⭐'}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-4">{adv.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{adv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* COURSES SECTION */}
      <section id="courses" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Available Programs
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              Academic <span style={{ color: accentColor }}>Portfolio.</span>
            </h3>
          </div>

          {popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
              {popularCourses.map((c: any, i: number) => (
                <div 
                  key={i} 
                  className="group relative p-6 rounded-[2rem] border transition-all duration-300 hover:border-amber-500/50 overflow-hidden shadow-xl"
                  style={{ 
                    backgroundColor: secondaryBg,
                    borderColor: borderColor
                  }}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" 
                        style={{ 
                          backgroundColor: '#050818', 
                          borderColor: borderColor,
                          color: accentColor 
                        }}>
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white/10 text-white/50 bg-white/5">
                        {c.eligibility || 'N/A'}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-6 group-hover:text-amber-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {c.course_name}
                    </h4>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1 text-white/30">
                          Estimated Fees
                        </p>
                        <p className="text-lg font-black text-white">
                          {c.fees || 'TBD'}
                        </p>
                      </div>
                      
                      <button 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10 bg-white/5 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[50px] rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: accentColor }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: accentColor }} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No curriculum data found</p>
            </div>
          )}
        </div>
      </section>

      {/* FEES SECTION */}
      <section id="fees" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Financial Breakdown
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              Fee <span style={{ color: accentColor }}>Structure.</span>
            </h1>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {courses.map((course: any, index: number) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-[2rem] border transition-all duration-300 hover:border-amber-500/40 overflow-hidden shadow-xl flex flex-col"
                  style={{ 
                    backgroundColor: secondaryBg,
                    borderColor: borderColor
                  }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border bg-[#050818]" 
                      style={{ 
                        borderColor: borderColor,
                        color: accentColor 
                      }}>
                      <Wallet size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                      {course.course}
                    </h3>
                  </div>
                  
                  <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:bg-amber-500/[0.03] transition-colors">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                      Total Course Fee
                    </p>
                    <p className="text-2xl font-black text-white flex items-center gap-1">
                      <span className="text-xs text-amber-500">₹</span>
                      {course.fees}
                    </p>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {course.eligibility && course.eligibility !== '-' && (
                      <div className="flex items-start gap-2 px-1">
                        <Info className="w-3.5 h-3.5 mt-0.5 text-amber-500/50" />
                        <div>
                          <p className="text-[11px] text-slate-400 leading-tight">{course.eligibility}</p>
                        </div>
                      </div>
                    )}

                    {course.hostelFees && (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] text-slate-300 font-medium">Hostel: {course.hostelFees}</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 blur-2xl rounded-full opacity-5 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: accentColor }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <IndianRupee className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fee structure is being updated</p>
            </div>
          )}
        </div>
      </section>

      {/* ADMISSION SECTION */}
      <section id="admission" className="scroll-mt-28">
        <div className="space-y-12">
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
              
              <div className="relative p-6 rounded-2xl border-l-4 overflow-hidden bg-[#0F172B]" 
                   style={{ borderColor: accentColor }}>
                <Quote className="absolute -top-1 -right-1 w-12 h-12 opacity-5 text-white" />
                <p className="italic text-slate-200 text-sm font-medium relative z-10">
                  "Merit-driven enrollment with full transparency in the admission process."
                </p>
              </div>
            </div>
            
            <div className="p-6 rounded-[2rem] border backdrop-blur-3xl shadow-xl space-y-6"
                 style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
              <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck size={18} style={{ color: accentColor }} />
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
                  <div key={i} className="p-4 rounded-xl border bg-[#050818]/50 border-white/5">
                    <item.icon className="w-4 h-4 mb-2 opacity-40" style={{ color: accentColor }} />
                    <p className="text-slate-500 font-bold text-[8px] uppercase tracking-tighter mb-1">{item.l}</p>
                    <p className="text-white text-xs font-black truncate">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {courseAdmissions.length > 0 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  Program Eligibility
                </h2>
                <div className="w-12 h-[2px]" style={{ backgroundColor: accentColor }}></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {courseAdmissions.map((course: any[], i: number) => (
                  <div key={i} className="group relative p-6 rounded-[2rem] border transition-all duration-300 hover:border-amber-500/30 shadow-lg bg-[#0F172B]"
                       style={{ borderColor: borderColor }}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border bg-[#050818]" 
                           style={{ borderColor: borderColor, color: accentColor }}>
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {course[0] || 'N/A'}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Eligibility Criteria</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {course[1] && (
                        <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                          <p className="text-slate-300 text-xs leading-relaxed font-medium">
                            {course[1]}
                          </p>
                        </div>
                      )}
                      {course[2] && (
                        <p className="text-slate-500 text-[10px] leading-relaxed px-1 italic">
                          Selection: {course[2]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PLACEMENT SECTION */}
      <section id="placement" className="scroll-mt-28">
        <div className="space-y-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Career Outcomes
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              Placement <span style={{ color: accentColor }}>Metrics.</span>
            </h1>
          </div>

          {hasPlacementData ? (
            <div className="space-y-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { label: 'Highest Package', val: highestPackage, icon: Award, color: accentColor },
                  { label: 'Average Package', val: averagePackage, icon: BarChart3, color: '#3B82F6' },
                  { label: 'Total Recruiters', val: `${uniqueRecruiters.length}+`, icon: Building2, color: '#A855F7' }
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="group relative p-6 rounded-[1.5rem] border transition-all duration-300 bg-[#0F172B]"
                    style={{ borderColor: borderColor }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#050818]" 
                        style={{ borderColor: 'rgba(255,255,255,0.05)', color: stat.color }}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-white">{stat.val}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {uniqueRecruiters.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                      Industry <span style={{ color: accentColor }}>Partners.</span>
                    </h3>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {uniqueRecruiters.map((recruiter: string, i: number) => (
                      <div 
                        key={i}
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-center hover:bg-white/5 transition-colors"
                      >
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wide truncate">
                          {recruiter}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Updating Stats</h3>
              <p className="text-slate-500 text-xs mt-1">Verifying latest 2024-25 placement data.</p>
            </div>
          )}
        </div>
      </section>

      {/* CUTOFF SECTION */}
      <section id="cutoff" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Entrance Benchmarks
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              Admission <span style={{ color: accentColor }}>Thresholds.</span>
            </h1>
          </div>

          {cutoffData.length > 0 ? (
            <div className="space-y-10">
              {cutoffData.map((cutoff: any, index: number) => (
                <div
                  key={index}
                  className="group relative p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-xl overflow-hidden bg-[#0F172B]"
                  style={{ borderColor: borderColor }}
                >
                  {cutoff.headers && cutoff.headers.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]" style={{ borderColor: borderColor }}>
                           <Target size={18} style={{ color: accentColor }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase">
                            {cutoff.headers[0]}
                          </h3>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score Analysis</p>
                        </div>
                      </div>
                      {cutoff.headers[1] && (
                        <div className="px-4 py-1.5 rounded-lg border border-white/5 bg-white/5 self-start sm:self-center">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">
                            {cutoff.headers[1]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {cutoff.rows && cutoff.rows.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {cutoff.rows.map((row: any[], rowIndex: number) => (
                        <div
                          key={rowIndex}
                          className="flex items-center justify-between p-4 rounded-xl border bg-[#050818]/40 border-white/5 hover:border-amber-500/20 transition-all"
                        >
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <ChevronRight size={14} className="text-amber-500 shrink-0" />
                            <span className="text-slate-300 font-medium text-xs uppercase tracking-tight truncate">
                              {row[0]}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-black text-lg block">
                              {row[1]}
                            </span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">Closing</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Processing Data</h3>
              <p className="text-slate-500 text-xs mt-1">Processing recent examination results.</p>
            </div>
          )}
        </div>
      </section>

      {/* RANKING SECTION */}
      <section id="ranking" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Excellence Benchmarks
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-3">
              Rankings & <span style={{ color: accentColor }}>Recognition.</span>
            </h1>
          </div>

          {rankingData.length > 0 ? (
            <div className="space-y-8">
              {rankingData.map((ranking: any, index: number) => (
                <div
                  key={index}
                  className="p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-xl bg-[#0F172B]"
                  style={{ borderColor: borderColor }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center border border-white/5 shrink-0" style={{ color: accentColor }}>
                      <Award size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-none">
                        {ranking.headers?.[0] || "Overall Ranking"}
                      </h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                        {ranking.headers?.[1] || "Latest Cycle"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {ranking.rows?.map((row: any[], i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-4 rounded-xl bg-[#050818]/50 border border-white/5 hover:border-amber-500/20 transition-all group"
                      >
                        <span className="text-slate-400 font-bold text-xs group-hover:text-slate-200 transition-colors">
                          {row[0]}
                        </span>
                        <div className="flex flex-col items-end">
                           <span className="text-white font-black text-lg" style={{ color: accentColor }}>
                            #{row[1]}
                          </span>
                          <span className="text-[8px] text-slate-600 font-bold uppercase">Rank</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <Star className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Ranking data being verified</p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                Student Feedback
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-3">
              Campus <span style={{ color: accentColor }}>Reviews.</span>
            </h1>
          </div>

          {aggregateRating ? (
            <div className="space-y-8">
              <div className="p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-xl overflow-hidden relative bg-[#0F172B]"
                   style={{ background: 'linear-gradient(135deg, rgba(15, 23, 43, 1) 0%, rgba(245, 158, 11, 0.03) 100%)' }}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill={i < Math.floor(parseFloat(aggregateRating.ratingValue)) ? accentColor : 'transparent'}
                          style={{ color: accentColor }}
                        />
                      ))}
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tighter">
                      {aggregateRating.ratingValue}<span className="text-2xl text-slate-600">/{aggregateRating.bestRating}</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                      Verified feedback from <span className="text-white font-bold">{aggregateRating.reviewCount}</span> students.
                    </p>
                  </div>

                  <div className="space-y-3 bg-black/20 p-6 rounded-2xl border border-white/5">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 w-4">{stars}★</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                              backgroundColor: accentColor,
                              width: stars === 5 ? '75%' : stars === 4 ? '15%' : '5%'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Reviews', value: aggregateRating.reviewCount, icon: MessageSquare },
                  { label: 'Avg Rating', value: `${aggregateRating.ratingValue}/5`, icon: Star },
                  { label: 'Sentiment', value: 'Positive', icon: TrendingUp },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-4">
                    <item.icon size={18} className="text-slate-500" />
                    <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-black text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No Student Reviews Yet</p>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="scroll-mt-28">
        <div className="space-y-10">
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

            <div className="relative p-8 md:p-12 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" 
                 style={{ backgroundColor: accentColor }}>
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
      </section>
    </div>
  )
}
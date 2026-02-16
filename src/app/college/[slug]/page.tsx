"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useParams, usePathname, useRouter } from "next/navigation"
import { 
  Loader2, Eye, Target, Phone, Globe, Quote, GraduationCap, 
  FileText, ShieldCheck, Zap, MapPin, ArrowUpRight, 
  BarChart3, ChevronRight, IndianRupee, Wallet, Info, Trophy, 
  Award, Building2, TrendingUp, Star, MessageSquare 
} from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function CollegeOverviewPage() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    fetchCollege()
  }, [slug])

  useEffect(() => {
    const urlParts = pathname.split('/')
    const section = urlParts[urlParts.length - 1]
    const sections = ['overview', 'courses', 'fees', 'admission', 'placement', 'cutoff', 'ranking', 'reviews', 'contact']
    const targetSection = sections.includes(section) ? section : 'overview'
    setActiveSection(targetSection)
    
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
      const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
      if (data) setCollege(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
    </div>
  )

  if (!college) return null

  // Data Extraction
  const micrositeData = college.microsite_data || {}
  const advantages = micrositeData?.advantages || []
  const aboutText = college.about || micrositeData?.about || "Information not available"

  // Courses Parsing
  const popularCourses = (college?.courses === "See Fees Section") 
    ? (micrositeData?.fees?.[0]?.rows?.map((row: any) => ({ course_name: row[0], eligibility: row[1], fees: row[2] })) || [])
    : (micrositeData?.popular_courses_table || [])

  // Fees Parsing
  const feesRows = micrositeData?.fees?.[0]?.rows || []
  const courseFees = feesRows.map((row: any[]) => ({
    course: row[0] || 'N/A',
    eligibility: row[1] || 'N/A',
    fees: row[2] || 'N/A',
    hostelFees: row[3] || undefined
  }))

  // Admission Parsing
  const admissionTables = micrositeData?.admission || []
  const basicInfo = admissionTables[0]?.rows || []
  const admissionMode = basicInfo.find((row: any[]) => row[0] === "Mode of Application")?.[1] || "Offline"
  const admissionBasis = basicInfo.find((row: any[]) => row[0] === "Basis of Admission")?.[1] || "Merit Based"
  const scholarshipAvailable = basicInfo.find((row: any[]) => row[0] === "Scholarship")?.[1] || "No"
  const courseAdmissions = admissionTables[1]?.rows || []

  // Placement Parsing
  const placementData = micrositeData?.placement || []
  const highestPackage = placementData[0]?.headers?.[1] || 'N/A'
  const averagePackage = placementData[0]?.rows?.[0]?.[1] || 'N/A'
  const uniqueRecruiters = [...new Set([
    ...(placementData[0]?.rows?.[1]?.[1] || '').split(',').map((r: string) => r.trim()).filter(Boolean),
    ...(placementData[1]?.rows || []).flat().filter(Boolean),
    ...(placementData[2]?.rows || []).flat().filter(Boolean)
  ])]

  // Cutoff & Ranking Parsing
  const cutoffData = micrositeData?.cutoff || college?.cutoff || []
  const rankingData = micrositeData?.ranking || college?.ranking || []
  const aggregateRating = (college?.reviews || micrositeData?.reviews)?.aggregate_rating

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
        
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="relative p-8 rounded-[3rem] border transition-all duration-500 hover:border-amber-500/40 overflow-hidden group" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 space-y-4">
              <Eye className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" style={{ color: accentColor }} />
              <h4 className="text-white font-black uppercase text-xs tracking-widest">Growth Vision</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{micrositeData?.about_section?.vision || "To be a center of excellence fostering innovation and professional ethics."}</p>
            </div>
          </div>
          <div className="relative p-8 rounded-[3rem] border transition-all duration-500 hover:border-blue-500/40 overflow-hidden group" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 space-y-4">
              <Target className="text-blue-500 w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
              <h4 className="text-white font-black uppercase text-xs tracking-widest">Academic Mission</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{micrositeData?.about_section?.mission || "Providing value-based education and practical skills through modern pedagogy."}</p>
            </div>
          </div>
        </div>

        {advantages.length > 0 && (
          <div className="space-y-12 mt-16">
            <div className="text-center space-y-2">
               <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: accentColor }}>The Edge</span>
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Why Choose <span style={{ color: accentColor }}>Us?</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {advantages.map((adv: any, i: number) => (
                <div key={i} className="relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:border-amber-500/40 text-center space-y-4 group overflow-hidden" style={{ backgroundColor: '#060818', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">{adv.icon || '⭐'}</div>
                    <h4 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">{adv.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{adv.description}</p>
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
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>Programs Offered</span>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">Academic <span style={{ color: accentColor }}>Portfolio.</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCourses.map((c: any, i: number) => (
              <div key={i} className="relative group p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1 overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 border border-white/10 px-2 py-1 rounded uppercase tracking-wider group-hover:border-amber-500/30 transition-colors">{c.eligibility || 'N/A'}</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-4 line-clamp-1">{c.course_name}</h4>
                  <div className="pt-4 border-t border-white/5 flex flex-col">
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1 group-hover:text-amber-500/50 transition-colors">Estimated Fees</span>
                    <span className="text-lg font-black text-white group-hover:scale-105 origin-left transition-transform">{c.fees || 'TBD'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEES SECTION */}
      <section id="fees" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>Investment</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Fee <span style={{ color: accentColor }}>Structure.</span></h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseFees.map((course: any, i: number) => (
              <div key={i} className="relative group p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1 overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 text-amber-500 group-hover:scale-110 transition-transform duration-500"><Wallet size={18} /></div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">{course.course}</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/5 mb-4 group-hover:border-amber-500/20 transition-colors">
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Total Course Fee</p>
                    <p className="text-xl font-black text-white flex items-center gap-1"><span className="text-xs text-amber-500">₹</span>{course.fees}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {course.hostelFees && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[9px] text-amber-200/70 font-bold uppercase tracking-wider">Hostel: {course.hostelFees}</p>
                      </div>
                    )}
                    {course.eligibility && course.eligibility !== '-' && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Info size={12} />
                        <span className="text-[9px] font-medium italic">{course.eligibility.slice(0, 20)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADMISSION SECTION */}
      <section id="admission" className="scroll-mt-28">
        <div className="space-y-12">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
              <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>Admissions 2026</span>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Selection <span style={{ color: accentColor }}>Protocol.</span></h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { l: 'Mode', v: admissionMode, icon: FileText },
              { l: 'Basis', v: admissionBasis, icon: GraduationCap },
              { l: 'Scholarship', v: scholarshipAvailable, icon: Zap }
            ].map((item, i) => (
              <div key={i} className="relative p-5 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 group overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center sm:text-left">
                  <item.icon className="w-5 h-5 mb-3 mx-auto sm:mx-0 opacity-40 text-amber-500 group-hover:scale-110 transition-transform" />
                  <p className="text-slate-500 font-bold text-[8px] uppercase tracking-widest mb-1 group-hover:text-amber-500/50 transition-colors">{item.l}</p>
                  <p className="text-white text-xs font-black uppercase">{item.v}</p>
                </div>
              </div>
            ))}
          </div>

          {courseAdmissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseAdmissions.map((course: any[], i: number) => (
                <div key={i} className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/20 group overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-4">
                      <GraduationCap size={16} className="text-amber-500 mt-1 group-hover:rotate-12 transition-transform" />
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{course[0]}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">{course[1]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PLACEMENT SECTION */}
      <section id="placement" className="scroll-mt-28">
        <div className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>Career Outcomes</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Placement <span style={{ color: accentColor }}>Metrics.</span></h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 hover:-translate-y-1 overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
              <Award className="w-5 h-5 mb-4 text-amber-500 group-hover:scale-110" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Highest Package</p>
              <p className="text-xl font-black text-white">{highestPackage}</p>
            </div>
            <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-blue-500/30 hover:-translate-y-1 overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
              <BarChart3 className="w-5 h-5 mb-4 text-blue-500" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Average Package</p>
              <p className="text-xl font-black text-white">{averagePackage}</p>
            </div>
            <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-purple-500/30 hover:-translate-y-1 overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
              <Building2 className="w-5 h-5 mb-4 text-purple-500" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Recruiters</p>
              <p className="text-xl font-black text-white">{uniqueRecruiters.length}+</p>
            </div>
          </div>
          
          {uniqueRecruiters.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {uniqueRecruiters.slice(0, 12).map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-default group">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate group-hover:text-white transition-colors">{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CUTOFF SECTION */}
      <section id="cutoff" className="scroll-mt-28">
        <div className="space-y-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Entrance <span style={{ color: accentColor }}>Thresholds.</span></h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cutoffData.map((cutoff: any, idx: number) => (
              <div key={idx} className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 group overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Target size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-amber-400 transition-colors">{cutoff.headers?.[0]}</h3>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{cutoff.headers?.[1]}</span>
                  </div>
                  <div className="space-y-2">
                    {cutoff.rows?.map((row: any[], i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{row[0]}</span>
                        <span className="text-sm font-black text-amber-500">{row[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RANKING SECTION */}
      <section id="ranking" className="scroll-mt-28">
        <div className="space-y-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Rankings & <span style={{ color: accentColor }}>Recognition.</span></h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rankingData.map((ranking: any, idx: number) => (
              <div key={idx} className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 group overflow-hidden" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Award size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                    <h3 className="text-xs font-black text-white uppercase group-hover:text-amber-400 transition-colors">{ranking.headers?.[0]}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {ranking.rows?.map((row: any[], i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{row[0]}</span>
                        <span className="text-sm font-black text-white">#{row[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="scroll-mt-28">
        <div className="space-y-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Campus <span style={{ color: accentColor }}>Reviews.</span></h1>
          {aggregateRating ? (
            <div className="relative p-8 rounded-[2rem] border transition-all duration-500 hover:border-amber-500/30 overflow-hidden group" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:text-left space-y-2">
                  <div className="flex justify-center md:justify-start gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < 4 ? accentColor : 'transparent'} className="text-amber-500" />)}
                  </div>
                  <h2 className="text-5xl font-black text-white">{aggregateRating.ratingValue}<span className="text-xl text-slate-600">/5</span></h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">From {aggregateRating.reviewCount} students</p>
                </div>
                <div className="flex-1 space-y-2 w-full max-w-xs">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-slate-500 w-4">{s}★</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: s === 5 ? '80%' : s === 4 ? '15%' : '5%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Data being verified by alumni</p>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="scroll-mt-28">
        <div className="space-y-8">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Contact <span style={{ color: accentColor }}>Info.</span></h1>
          <div className="grid grid-cols-1 gap-4">
            {college?.location && (
              <div className="flex items-center gap-4 p-6 bg-[#0F172B] border border-white/5 rounded-2xl group hover:border-amber-500/30 transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 w-10 h-10 rounded-lg bg-black flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500"><MapPin size={20} /></div>
                <div className="relative z-10">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-amber-500/50 transition-colors">Campus Address</span>
                  <p className="text-white font-bold text-sm">{college.location}</p>
                </div>
              </div>
            )}
            {college?.url && (
              <div className="flex items-center gap-4 p-6 bg-[#0F172B] border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 w-10 h-10 rounded-lg bg-black flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500"><Globe size={20} /></div>
                <div className="relative z-10">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-500/50 transition-colors">Official Website</span>
                  <a href={college.url} target="_blank" className="text-white font-bold text-sm flex items-center gap-2 hover:text-amber-500 transition-colors">
                    {college.url.replace('https://', '').replace('www.', '')} <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            )}
            <div className="p-10 rounded-[2.5rem] bg-amber-500 relative overflow-hidden group shadow-2xl">
              <Phone className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 -rotate-12 text-black group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-black text-[#050818] uppercase leading-tight">Ready for Admission?</h3>
                <p className="text-[10px] font-bold text-[#050818]/60 uppercase tracking-widest max-w-xs">Connect with our counseling desk for immediate assistance and campus tours.</p>
                {college?.url && (
                  <a href={college.url} target="_blank" className="inline-block py-3 px-8 bg-[#050818] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300">Connect Now</a>
                )}
                <div className="pt-4 text-[9px] font-black uppercase tracking-[0.4em] text-[#050818]/40 border-t border-black/5">Ambition से Admission तक</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
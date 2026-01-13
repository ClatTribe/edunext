"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle, Eye, Target, Phone, Mail, Globe } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function CollegePage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollege()
  }, [slug])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: supabaseError } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()

      if (supabaseError) throw supabaseError
      if (!data) throw new Error("College not found")
      setCollege(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch college")
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

  if (error || !college) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle style={{ color: '#ef4444' }} size={20} />
            <p className="text-red-300">{error || "College not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  const micrositeData = typeof college.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college.microsite_data

  const advantages = micrositeData?.advantages || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-32">
        
        <section className="grid lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-8 space-y-16">
            
            <div className="space-y-8">
              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">
                Institutional <span style={{ color: accentColor }}>Vision.</span>
              </h3>
              <p className="text-lg sm:text-xl text-slate-400 leading-loose font-medium italic pl-6 sm:pl-10" style={{ borderLeft: `10px solid ${accentColor}` }}>
                {micrositeData?.about_section?.full_text || "Information not available"}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
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
          </div>

          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="p-8 sm:p-12 rounded-[4rem] shadow-2xl space-y-8 relative overflow-hidden" style={{ backgroundColor: accentColor, color: primaryBg }}>
              <h4 className="text-2xl font-black leading-tight border-b border-black/10 pb-4">
                Admission Spotlight
              </h4>
              
              <div className="space-y-6">
                <div className="bg-white/20 p-5 rounded-2xl flex items-center space-x-4 border border-white/10">
                  <Phone className="w-5 h-5" />
                  <span className="font-black text-sm">Contact Admissions</span>
                </div>
                <div className="bg-white/20 p-5 rounded-2xl flex items-center space-x-4 border border-white/10">
                  <Mail className="w-5 h-5" />
                  <span className="font-black text-xs">admissions@college.edu</span>
                </div>
                {college.url && (
                  <a 
                    href={college.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-[#060818] text-white font-black rounded-3xl shadow-xl hover:translate-x-2 transition-transform uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2"
                  >
                    Apply Now 2025 <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              <div className="pt-6 text-[10px] font-black uppercase tracking-widest opacity-60 text-center italic">
                Ambition से Admission तक
              </div>
            </div>
          </aside>
        </section>

        {advantages.length > 0 && (
          <section className="space-y-20">
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
          </section>
        )}
      </div>
    </div>
  )
}
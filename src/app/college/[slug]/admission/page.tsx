"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle, Quote } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

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

  const faqs = micrositeData?.extracted_faqs || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-32">
        
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
              Merit <br/> <span style={{ color: accentColor }}>Selection.</span>
            </h3>
            
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-medium">
              Admissions are strictly merit-based, evaluating latest qualifying exam scores. We benchmark against <span className="text-white">top b schools in india</span> for selection excellence.
            </p>
            
            <div className="p-12 sm:p-16 bg-amber-900/10 border border-amber-500/20 rounded-[4.5rem] italic text-slate-200 font-semibold leading-loose shadow-2xl relative" style={{ borderLeft: `15px solid ${accentColor}` }}>
              <Quote className="absolute top-8 left-8 w-10 h-10 opacity-10" />
              "Edunext facilitates merit-driven enrollment cycles at {college?.college_name?.split(' ')[0]} with full transparency in cutoff rankings."
            </div>
          </div>
          
          <div className="bg-white/5 p-12 sm:p-16 rounded-[6rem] border border-white/10 space-y-12 shadow-2xl backdrop-blur-3xl">
            <h4 className="text-xl font-black text-white uppercase tracking-[0.5em] text-center border-b border-white/10 pb-10">
              Criteria overview
            </h4>
            
            <div className="space-y-8">
              {[
                { l: 'Undergraduate Path', v: '10+2 Merit' },
                { l: 'Postgraduate Hub', v: 'Graduation Merit' },
                { l: 'Special Programs', v: 'Entrance/Portfolio' }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-6 sm:p-8 bg-[#060818] rounded-[2.5rem] border border-white/5 group hover:border-[#F59E0B]/50 transition-all"
                >
                  <span className="text-slate-500 font-black text-[11px] uppercase tracking-widest">
                    {item.l}
                  </span>
                  <span className="text-white font-black group-hover:text-[#F59E0B] transition-colors">
                    {item.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <section className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">
                Quick Resolution FAQs
              </h2>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.6em] uppercase">
                Helping you reach your goal.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {faqs.map((f: any, i: number) => (
                <div 
                  key={i} 
                  className="bg-white/5 p-8 sm:p-12 rounded-[4rem] border border-white/10 hover:border-white/20 transition-all shadow-inner"
                >
                  <div className="font-black text-base sm:text-lg mb-6" style={{ color: accentColor }}>
                    Q: {f.question}
                  </div>
                  <div className="text-slate-400 text-sm leading-relaxed font-medium">
                    A: {f.answer}
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
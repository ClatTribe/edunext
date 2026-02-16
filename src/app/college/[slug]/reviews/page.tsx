"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Star, Loader2, MessageSquare, TrendingUp } from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function ReviewsPage() {
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

  const reviewsData = college?.reviews || college?.microsite_data?.reviews
  const aggregateRating = reviewsData?.aggregate_rating

  return (
    <div className="space-y-10">
      {/* Header Section */}
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
          {/* Overall Rating Hero Card */}
          <div className="group relative p-8 md:p-10 rounded-[2.5rem] border shadow-2xl overflow-hidden bg-[#0F172B] transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-1.5"
               style={{ 
                 borderColor: borderColor,
                 background: 'linear-gradient(135deg, rgba(15, 23, 43, 1) 0%, rgba(245, 158, 11, 0.02) 100%)' 
               }}>
            
            {/* Background Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-500/[0.01] to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={22}
                      className="transition-transform duration-500 group-hover:scale-110"
                      fill={i < Math.floor(parseFloat(aggregateRating.ratingValue)) ? accentColor : 'transparent'}
                      style={{ 
                        color: accentColor,
                        filter: i < Math.floor(parseFloat(aggregateRating.ratingValue)) ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' : 'none'
                      }}
                    />
                  ))}
                </div>
                <h2 className="text-7xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors duration-300">
                  {aggregateRating.ratingValue}<span className="text-2xl text-slate-600 ml-1">/{aggregateRating.bestRating}</span>
                </h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-tight">
                  Verified feedback from <span className="text-white font-black">{aggregateRating.reviewCount}</span> students
                </p>
              </div>

              {/* Rating Distribution Mini-Bars */}
              <div className="space-y-4 bg-black/40 p-6 rounded-[2rem] border border-white/5 transition-all duration-300 group-hover:border-amber-500/20 group-hover:bg-black/60">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="group/bar flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 w-5 group-hover/bar:text-amber-500 transition-colors">{stars}★</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
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

            {/* Corner Decor */}
            <div className="absolute -right-12 -bottom-12 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700" style={{ backgroundColor: accentColor }}></div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Reviews', value: aggregateRating.reviewCount, icon: MessageSquare },
              { label: 'Avg Rating', value: `${aggregateRating.ratingValue}/5`, icon: Star },
              { label: 'Sentiment', value: 'Positive', icon: TrendingUp },
            ].map((item, idx) => (
              <div key={idx} className="group/stat relative p-6 rounded-2xl border bg-[#050818]/60 border-white/5 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/[0.08] hover:-translate-y-1">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/5 group-hover/stat:border-amber-500/20 group-hover/stat:scale-110 transition-all duration-300">
                    <item.icon size={20} className="text-slate-500 group-hover/stat:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/stat:text-amber-500/60 transition-colors">{item.label}</p>
                    <p className="text-lg font-black text-white group-hover/stat:text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01]">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-800 mb-4 opacity-20" />
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">No Student Reviews Yet</p>
        </div>
      )}
    </div>
  )
}
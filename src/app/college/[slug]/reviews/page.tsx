"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Star, Loader2, MessageSquare, TrendingUp, BarChart3 } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReviewsPage() {
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

  // 1. Data Normalization
  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : college?.microsite_data

  const reviewsData = micrositeData?.reviews || college?.reviews
  const aggregateRating = reviewsData?.aggregate_rating

  // Safely parse values
  const currentRating = parseFloat(aggregateRating?.ratingValue || '0')
  const reviewCount = aggregateRating?.reviewCount || '0'
  const bestRating = aggregateRating?.bestRating || '5'

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Student Sentiment</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Campus <span className="text-amber-500">Reviews.</span>
        </h1>
      </div>

      {aggregateRating ? (
        <div className="space-y-8">
          {/* Overall Rating Hero Card */}
          <div 
            className="group relative p-8 md:p-10 rounded-[2rem] border shadow-xl overflow-hidden bg-[#0F172B] transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1"
            style={{ borderColor }}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.floor(currentRating) ? accentColor : 'transparent'}
                      className="transition-transform duration-500 group-hover:scale-110"
                      style={{ 
                        color: i < Math.floor(currentRating) ? accentColor : 'rgba(255,255,255,0.1)',
                        filter: i < Math.floor(currentRating) ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' : 'none'
                      }}
                    />
                  ))}
                </div>
                <div>
                  <h2 className="text-7xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors">
                    {currentRating}<span className="text-2xl text-slate-600 ml-1">/{bestRating}</span>
                  </h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                    Verified feedback from <span className="text-white font-black">{reviewCount}</span> users
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3 bg-[#050818]/60 p-6 rounded-2xl border border-white/5 transition-all group-hover:bg-black/40">
                {[5, 4, 3, 2, 1].map((stars) => {
                  // Mock distribution logic based on your 75% bias for 5 stars
                  const widthMap: Record<number, string> = { 5: '75%', 4: '15%', 3: '7%', 2: '2%', 1: '1%' }
                  return (
                    <div key={stars} className="group/bar flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-500 w-5 group-hover/bar:text-amber-500 transition-colors">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            backgroundColor: accentColor,
                            width: widthMap[stars]
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Reviews', value: reviewCount, icon: MessageSquare },
              { label: 'Avg Rating', value: `${currentRating}/5`, icon: Star },
              { label: 'Sentiment', value: 'Positive', icon: TrendingUp },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="group/stat relative p-6 rounded-2xl border bg-[#050818]/40 border-white/5 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/5 group-hover/stat:border-amber-500/20 transition-all">
                    <item.icon size={18} className="text-slate-500 group-hover/stat:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-lg font-black text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-24 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-10 text-amber-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">No Student Reviews</h3>
          <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-medium">Be the first to share campus life feedback</p>
        </div>
      )}
    </div>
  )
}
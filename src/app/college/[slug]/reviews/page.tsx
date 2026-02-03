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
          {/* Overall Rating Hero: Compact Grid for Sidebar */}
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

              {/* Rating Distribution Mini-Bars */}
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

          {/* Quick Stats Grid */}
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
  )
}
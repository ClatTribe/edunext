"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Star, Loader2, MessageSquare } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

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

  const reviewsData = college?.reviews
  const aggregateRating = reviewsData?.aggregate_rating

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-5xl mx-auto space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: accentColor }} />
            Student Reviews
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.6em]">
            What Students Say
          </p>
        </div>

        {aggregateRating ? (
          <div className="space-y-12">
            {/* Overall Rating Card */}
            <div className="p-12 sm:p-16 rounded-[5rem] bg-white/5 border border-white/10 text-center space-y-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)' }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-8 h-8"
                    fill={i < Math.floor(parseFloat(aggregateRating.ratingValue)) ? accentColor : 'none'}
                    style={{ color: accentColor }}
                  />
                ))}
              </div>
              
              <div>
                <p className="text-6xl sm:text-7xl font-black mb-4" style={{ color: accentColor }}>
                  {aggregateRating.ratingValue}
                </p>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">
                  Out of {aggregateRating.bestRating}
                </p>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-slate-300 font-semibold">
                  Based on <span className="font-black" style={{ color: accentColor }}>{aggregateRating.reviewCount}</span> student reviews
                </p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[4rem] bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Rating Details</h3>
                
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <Star className="w-4 h-4" fill={accentColor} style={{ color: accentColor }} />
                        <span className="text-white font-bold">{stars}</span>
                      </div>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all" 
                          style={{ 
                            backgroundColor: accentColor,
                            width: stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : '5%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[4rem] bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Quick Stats</h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Total Reviews</span>
                    <span className="text-2xl font-black text-white">{aggregateRating.reviewCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Highest Rating</span>
                    <span className="text-2xl font-black" style={{ color: accentColor }}>{aggregateRating.bestRating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Lowest Rating</span>
                    <span className="text-2xl font-black text-white">{aggregateRating.worstRating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 rounded-[4rem] bg-white/5 border border-white/10">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-600 mb-6" />
            <p className="text-slate-400 font-semibold text-lg">No reviews available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
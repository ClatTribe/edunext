// "use client"
// import React, { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { supabase } from '../../lib/supabase'

// interface College {
//   id: number
//   slug: string
//   college_name: string
//   location?: string
//   microsite_data?: {
//     ranking?: any[]
//   }
// }

// interface RelatedCollegesProps {
//   currentCollegeId: number
//   currentLocation?: string
//   currentState?: string
// }

// export default function RelatedColleges({ 
//   currentCollegeId, 
//   currentLocation,
//   currentState 
// }: RelatedCollegesProps) {
//   const [relatedColleges, setRelatedColleges] = useState<College[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetchRelatedColleges()
//   }, [currentCollegeId, currentLocation])

//   const fetchRelatedColleges = async () => {
//     try {
//       setLoading(true)

//       // Extract state from location if not provided
//       const state = currentState || currentLocation?.split(',').pop()?.trim()

//       let query = supabase
//         .from('college_microsites')
//         .select('id, slug, college_name, location, microsite_data')
//         .neq('id', currentCollegeId)
//         .limit(5)

//       // Try to get colleges from same state/location
//       if (state) {
//         query = query.ilike('location', `%${state}%`)
//       }

//       const { data, error } = await query

//       if (error) throw error

//       setRelatedColleges(data || [])

//       // If we got less than 5 colleges, fetch more random ones
//       if (data && data.length < 5) {
//         const { data: moreColleges } = await supabase
//           .from('college_microsites')
//           .select('id, slug, college_name, location, microsite_data')
//           .neq('id', currentCollegeId)
//           .limit(5 - data.length)

//         if (moreColleges) {
//           setRelatedColleges([...data, ...moreColleges])
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching related colleges:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getRanking = (college: College) => {
//     const ranking = college.microsite_data?.ranking?.[0]
//     if (!ranking) return null
//     const rows = ranking.rows || []
//     return rows.length > 0 ? rows[0][1] : null
//   }

//   if (loading) {
//     return (
//       <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl">
//         <div className="animate-pulse space-y-4">
//           <div className="h-6 bg-white/5 rounded w-3/4"></div>
//           <div className="h-4 bg-white/5 rounded w-1/2"></div>
//           {[1, 2, 3].map(i => (
//             <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (relatedColleges.length === 0) return null

//   return (
//     <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-bold text-white">
//           Top Colleges{' '}
//           <span className="text-gray-500 text-sm font-normal block mt-1">
//             in {currentState || currentLocation?.split(',').pop()?.trim() || 'India'}
//           </span>
//         </h3>
//         <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20">
//           Recommended
//         </span>
//       </div>

//       <div className="flex flex-col gap-3">
//         {relatedColleges.map((col, idx) => {
//           const ranking = getRanking(col)
          
//           return (
//             <Link key={col.id} href={`/college/${col.slug}`} className="group block">
//               <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all duration-300">
//                 <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-400 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
//                   {idx + 1}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h4 className="text-sm font-semibold text-gray-200 group-hover:text-amber-400 transition-colors truncate">
//                     {col.college_name}
//                   </h4>
//                   <div className="flex justify-between items-center mt-1">
//                     <span className="text-[10px] text-gray-500 flex items-center gap-1">
//                       <span className="w-1 h-1 rounded-full bg-gray-600"></span>
//                       {col.location?.split(',')[0] || 'India'}
//                     </span>
//                     {ranking && (
//                       <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
//                         {ranking.split(' ')[0]}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           )
//         })}
//       </div>

//       <Link 
//         href="/dummy-college" 
//         className="block mt-6 text-center text-xs font-medium text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-4"
//       >
//         View Full List <span className="ml-1">→</span>
//       </Link>
//     </div>
//   )
// }


"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

interface College {
  id: number
  slug: string
  college_name: string
  location: string | null
  microsite_data: {
    ranking?: any[]
  } | null
}

interface RelatedCollegesProps {
  currentCollegeId: number
  currentLocation?: string
  currentState?: string
}

// ── Priority college that must always appear (at a random position 1–5) ──
const PRIORITY_SLUG = "upes"

export default function RelatedColleges({
  currentCollegeId,
  currentLocation,
  currentState
}: RelatedCollegesProps) {
  const [relatedColleges, setRelatedColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedColleges()
  }, [currentCollegeId, currentLocation])

  // Shuffle helper (Fisher-Yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const fetchRelatedColleges = async () => {
    try {
      setLoading(true)

      const state = currentState || currentLocation?.split(',').pop()?.trim()

      // 1. Always fetch the priority college first (unless we're ON that page)
      let priorityCollege: College | null = null
      const { data: priorityData } = await supabase
        .from('college_microsites')
        .select('id, slug, college_name, location, microsite_data')
        .eq('slug', PRIORITY_SLUG)
        .single()

      // Only use it if it's not the current college
      if (priorityData && priorityData.id !== currentCollegeId) {
        priorityCollege = priorityData
      }

      // 2. Fetch location-based colleges (exclude current + priority)
      const slotsNeeded = priorityCollege ? 4 : 5
      let query = supabase
        .from('college_microsites')
        .select('id, slug, college_name, location, microsite_data')
        .neq('id', currentCollegeId)
        .neq('slug', PRIORITY_SLUG)
        .limit(slotsNeeded)

      if (state) {
        query = query.ilike('location', `%${state}%`)
      }

      const { data, error } = await query
      if (error) throw error

      let others = data || []

      // 3. Backfill if not enough
      if (others.length < slotsNeeded) {
        const existingIds = others.map(c => c.id)
        const excludeIds = [currentCollegeId, ...(priorityCollege ? [priorityCollege.id] : []), ...existingIds]

        const { data: moreColleges } = await supabase
          .from('college_microsites')
          .select('id, slug, college_name, location, microsite_data')
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .limit(slotsNeeded - others.length)

        if (moreColleges) {
          others = [...others, ...moreColleges]
        }
      }

      // 4. Combine: shuffle others, then insert priority at a random position
      let finalList = shuffleArray(others)

      if (priorityCollege) {
        const randomIndex = Math.floor(Math.random() * (finalList.length + 1))
        finalList.splice(randomIndex, 0, priorityCollege)
      }

      // Cap at 5
      setRelatedColleges(finalList.slice(0, 5))
    } catch (err) {
      console.error('Error fetching related colleges:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRanking = (college: College) => {
    const ranking = college.microsite_data?.ranking?.[0]
    if (!ranking) return null
    const rows = ranking.rows || []
    return rows.length > 0 ? rows[0][1] : null
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-3/4"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedColleges.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          Top Colleges{' '}
          <span className="text-gray-500 text-sm font-normal block mt-1">
            in {currentState || currentLocation?.split(',').pop()?.trim() || 'India'}
          </span>
        </h3>
        <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20">
          Recommended
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {relatedColleges.map((col, idx) => {
          const ranking = getRanking(col)
          
          return (
            <Link key={col.id} href={`/college/${col.slug}`} className="group block">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-400 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-amber-400 transition-colors truncate">
                    {col.college_name}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      {col.location?.split(',')[0] || 'India'}
                    </span>
                    {ranking && (
                      <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                        {ranking.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Link 
        href="/find-colleges" 
        className="block mt-6 text-center text-xs font-medium text-gray-500 hover:text-white transition-colors border-t border-white/5 pt-4"
      >
        View Full List <span className="ml-1">→</span>
      </Link>
    </div>
  )
}
import React, { useState, useEffect } from "react"
import { GitCompare, ArrowRight } from "lucide-react"
import { supabase } from "../../lib/supabase"

interface College {
  id: number
  slug?: string
  "College Name": string | null
  college_name?: string
  Location?: string | null
  location?: string
  City?: string | null
  State?: string | null
  url?: string
  contact?: string
  email?: string
  Approvals?: string | null
  "CD Score"?: string | null
  "Course Fees"?: string | null
  "Average Package"?: string | null
  "Highest Package"?: string | null
  "Placement Score"?: string | null
  "User Rating"?: string | null
  "User Reviews"?: string | null
  Ranking?: string | null
  Specialization?: string | null
  "Application Link"?: string | null
  scholarship?: string | null
  entrance_exam?: string | null
  is_priority?: boolean
  matchScore?: number
  microsite_data?: {
    ranking?: any[]
    placement?: any[]
    fees?: any[]
    reviews?: {
      aggregate_rating?: {
        ratingValue?: number
        reviewCount?: string
      }
    }
  }
}

interface CollegeMicrositeComparisonProps {
  user: any
  colleges: College[]
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// Build a stub College object just from an ID so the count is always accurate
// even when the full colleges[] array doesn't contain that college
// (e.g. on a microsite page where colleges[] = [currentCollege] only)
function makeStub(id: number): College {
  return { id, "College Name": null }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
const useCollegeMicrositeComparison = ({ user, colleges }: CollegeMicrositeComparisonProps) => {
  const [compareColleges, setCompareColleges] = useState<College[]>([])

  // Load compare colleges on mount / when user or colleges change
  useEffect(() => {
    if (user) {
      fetchCompareCollegesFromDB()
    } else {
      fetchCompareCollegesFromLocalStorage()
    }
  }, [user, colleges])

  // ── DB fetch (logged-in users) ────────────────────────────────────────────
  // KEY FIX: we no longer filter against colleges[] for the count.
  // We fetch all saved IDs from DB, match what we can from colleges[],
  // and fill the rest with stubs so the count is always accurate.
  const fetchCompareCollegesFromDB = async () => {
    if (!user) return

    try {
      const { data: compareData, error: compareError } = await supabase!
        .from("compare_college_microsites")
        .select("college_id")
        .eq("user_id", user.id)

      if (compareError) throw compareError

      if (compareData && compareData.length > 0) {
        const collegeIds: number[] = compareData.map(item => item.college_id)

        // Match full objects from colleges[] where available
        const matched = colleges.filter(c => collegeIds.includes(c.id))
        const matchedIds = new Set(matched.map(c => c.id))

        // For IDs not found in colleges[], create stubs (microsite page case)
        const stubs = collegeIds
          .filter(id => !matchedIds.has(id))
          .map(makeStub)

        setCompareColleges([...matched, ...stubs])
      } else {
        setCompareColleges([])
      }
    } catch (err) {
      console.error("Error fetching compare colleges:", err)
    }
  }

  // ── localStorage fetch (guest users) ─────────────────────────────────────
  // Same fix: match what we can, stub the rest for accurate count.
  const fetchCompareCollegesFromLocalStorage = () => {
    try {
      const storedCompareIds: number[] = JSON.parse(
        localStorage.getItem('compareCollegeMicrosites') || '[]'
      )

      if (storedCompareIds.length > 0) {
        const matched = colleges.filter(c => storedCompareIds.includes(c.id))
        const matchedIds = new Set(matched.map(c => c.id))

        const stubs = storedCompareIds
          .filter(id => !matchedIds.has(id))
          .map(makeStub)

        setCompareColleges([...matched, ...stubs])
      } else {
        setCompareColleges([])
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err)
    }
  }

  // ── Toggle compare (add / remove) ─────────────────────────────────────────
  const toggleCompare = async (college: College) => {
    const exists = compareColleges.find(c => c.id === college.id)

    if (exists) {
      // ── REMOVE ──
      if (user) {
        try {
          const { error } = await supabase!
            .from("compare_college_microsites")
            .delete()
            .eq("user_id", user.id)
            .eq("college_id", college.id)

          if (error) throw error
          setCompareColleges(prev => prev.filter(c => c.id !== college.id))
        } catch (err) {
          console.error("Error removing from compare:", err)
          alert("Failed to remove from comparison. Please try again.")
        }
      } else {
        const storedIds: number[] = JSON.parse(
          localStorage.getItem('compareCollegeMicrosites') || '[]'
        )
        const updatedIds = storedIds.filter(id => id !== college.id)
        localStorage.setItem('compareCollegeMicrosites', JSON.stringify(updatedIds))
        setCompareColleges(prev => prev.filter(c => c.id !== college.id))
      }
    } else {
      // ── ADD (max 3) ──
      if (compareColleges.length >= 3) {
        alert('You can compare maximum 3 colleges at a time')
        return
      }

      if (user) {
        try {
          const { error } = await supabase!
            .from("compare_college_microsites")
            .insert({ user_id: user.id, college_id: college.id })

          if (error) {
            if (error.code === '23505') {
              // Already exists — just make sure local state reflects it
              setCompareColleges(prev =>
                prev.some(c => c.id === college.id) ? prev : [...prev, college]
              )
              return
            }
            throw error
          }

          setCompareColleges(prev => [...prev, college])
        } catch (err) {
          console.error("Error adding to compare:", err)
          alert("Failed to add to comparison. Please try again.")
        }
      } else {
        const storedIds: number[] = JSON.parse(
          localStorage.getItem('compareCollegeMicrosites') || '[]'
        )
        storedIds.push(college.id)
        localStorage.setItem('compareCollegeMicrosites', JSON.stringify(storedIds))

        // Cache full colleges list for the battle-mode comparison page
        if (colleges.length > 1) {
          localStorage.setItem('allCollegeMicrosites', JSON.stringify(colleges))
        }

        setCompareColleges(prev => [...prev, college])
      }
    }
  }

  // ── Remove by ID ──────────────────────────────────────────────────────────
  const removeFromCompare = async (collegeId: number) => {
    if (user) {
      try {
        const { error } = await supabase!
          .from("compare_college_microsites")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", collegeId)

        if (error) throw error
        setCompareColleges(prev => prev.filter(c => c.id !== collegeId))
      } catch (err) {
        console.error("Error removing from compare:", err)
      }
    } else {
      const storedIds: number[] = JSON.parse(
        localStorage.getItem('compareCollegeMicrosites') || '[]'
      )
      const updatedIds = storedIds.filter(id => id !== collegeId)
      localStorage.setItem('compareCollegeMicrosites', JSON.stringify(updatedIds))
      setCompareColleges(prev => prev.filter(c => c.id !== collegeId))
    }
  }

  // ── isInCompare ───────────────────────────────────────────────────────────
  const isInCompare = (collegeId: number) =>
    compareColleges.some(c => c.id === collegeId)

  // ── Navigate to battle-mode ───────────────────────────────────────────────
  const goToComparison = () => {
    if (!user && colleges.length > 1) {
      localStorage.setItem('allCollegeMicrosites', JSON.stringify(colleges))
    }
    window.location.href = '/battle-mode'
  }

  return {
    compareColleges,
    toggleCompare,
    removeFromCompare,
    isInCompare,
    goToComparison,
  }
}

// ─── Compare Badge (on cards) ─────────────────────────────────────────────────
export const CompareBadge: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null
  return (
    <div className="mb-3">
      <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-300">
        <GitCompare size={12} />
        Added to Compare
      </span>
    </div>
  )
}

// ─── Floating Compare Button ──────────────────────────────────────────────────
export const CompareFloatingButton: React.FC<{
  compareCount: number
  onCompareClick: () => void
}> = ({ compareCount, onCompareClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  if (compareCount === 0) return null

  const handleClick = () => {
    if (compareCount < 2) {
      alert('Please select at least 2 colleges for comparison')
      return
    }
    onCompareClick()
  }

  return (
    <div
      className="fixed right-6 z-50 transition-all duration-300"
      style={{ bottom: '90px' }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes comparePing {
            75%, 100% { transform: scale(1.3); opacity: 0; }
          }
          .compare-ping-animation {
            animation: comparePing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `
      }} />

      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 rounded-full px-5 py-3 hover:scale-105 active:scale-95"
      >
        <GitCompare
          size={20}
          className={`transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}
        />
        <span className="font-bold text-sm whitespace-nowrap">
          Compare ({compareCount})
        </span>
        <ArrowRight
          size={18}
          className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
        />

        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-purple-600 compare-ping-animation opacity-20 pointer-events-none" />

        {/* Max badge */}
        {compareCount === 3 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            ✓
          </div>
        )}
      </button>
    </div>
  )
}

export default useCollegeMicrositeComparison
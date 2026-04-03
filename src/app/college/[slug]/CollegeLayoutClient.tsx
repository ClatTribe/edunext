"use client"
import React, { useState, useEffect, useRef } from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { supabase } from "../../../../lib/supabase"
import {
  BookOpen, Building2, Phone, Home,
  TrendingUp, BarChart3, Trophy, Star, Loader2,
  ArrowLeft
} from "lucide-react"
import RelatedColleges from "../../../../components/microsite/RelatedColleges"
import MicrositeHero from "../../../../components/microsite/MicrositeHero"
import Navbar from "../../../../components/Navbar"

// Total Black Aesthetic
const primaryBg = '#020205'

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Scroll to top on mount so mobile always starts at the hero
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    fetchCollege()
  }, [slug])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()

      if (supabaseError) throw supabaseError
      if (!data) throw new Error("College not found")
      setCollege(data)
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Failed to fetch college")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </div>
    )
  }

  const micrositeData = college?.microsite_data || {}

  const allNavItems = [
    { name: 'Overview', path: '', icon: Home, show: true },
    {
      name: 'Courses & Fees',
      path: '/course-&-fees',
      icon: BookOpen,
      show: !!(micrositeData.fees?.length || micrositeData.courses?.length)
    },
    {
      name: 'Admission',
      path: '/admission',
      icon: Building2,
      show: !!micrositeData.admission
    },
    {
      name: 'Placement',
      path: '/placement',
      icon: TrendingUp,
      show: !!micrositeData.placement?.length
    },
    {
      name: 'Cutoff',
      path: '/cutoff',
      icon: BarChart3,
      show: !!micrositeData.cutoff?.length
    },
    {
      name: 'Ranking',
      path: '/ranking',
      icon: Trophy,
      show: !!micrositeData.ranking?.length
    },
    {
      name: 'Reviews',
      path: '/reviews',
      icon: Star,
      show: !!micrositeData.reviews?.length
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: Phone,
      show: true
    },
  ]

  const navItems = allNavItems.filter(item => item.show)

  return (
    <div className="min-h-screen text-slate-300" style={{ backgroundColor: primaryBg }}>

      {/* ── Global Navbar (fixed) ── */}
      <Navbar />

      {/* ── Spacer: pushes content below the fixed navbar ── */}
      <div className="h-16 sm:h-[72px] lg:h-20" />

      {/* ── HERO SECTION ── */}
      <div className="relative">
        <MicrositeHero
          collegeId={college.id}               
          slug={slug}                            
          collegeName={college.college_name}
          location={college.location}
          image={college.image}
          video={college.video}
          podcast={college.podcast}
          fees={micrositeData?.fees?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("total"))?.[1]}
          avgPackage={micrositeData?.placement?.[0]?.headers?.["Average package"] || micrositeData?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("average"))?.[1]}
          highestPackage={micrositeData?.placement?.[0]?.headers?.["Highest package"] || micrositeData?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1]}
          ranking={micrositeData?.ranking?.[0]?.rows?.[0]?.[1]}
        />
      </div>

      {/* ── SUB-NAVBAR (sticky below the main navbar) ── */}
      <nav className="sticky top-16 sm:top-[72px] lg:top-20 z-40 bg-[#020205]/90 backdrop-blur-xl border-b border-white/5 w-full">
        <div className="flex gap-1 md:gap-3 overflow-x-auto px-4 py-3 no-scrollbar items-center md:justify-center">
          {navItems.map((item) => {
            const fullPath = `/college/${slug}${item.path}`
            const isActive = pathname === fullPath
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={fullPath}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap font-bold uppercase tracking-wider flex-shrink-0 border ${
                  isActive
                    ? 'border-amber-500/40 bg-amber-500/5 text-amber-500 shadow-lg shadow-amber-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
                style={{ fontSize: '11px' }}
              >
                <Icon size={14} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <main className="w-full">
              {children}
            </main>
          </div>

          <aside className="w-full lg:w-[350px] shrink-0">
            {/* top offset = navbar height + sub-navbar height (~48px) + gap */}
            <div className="lg:sticky lg:top-[136px]">
              <RelatedColleges
                currentCollegeId={college.id}
                currentLocation={college.location}
              />
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
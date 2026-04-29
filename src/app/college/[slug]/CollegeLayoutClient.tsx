"use client"
import React, { useState, useEffect, useRef } from "react"
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { supabase } from "../../../../lib/supabase"
import {
  BookOpen, Building2, Phone, Home,
  TrendingUp, BarChart3, Trophy, Star, Loader2,
  ArrowLeft
} from "lucide-react"
import RelatedColleges from "../../../../components/microsite/RelatedColleges"
import MicrositeHero from "../../../../components/microsite/MicrositeHero"
import Navbar from "../../../../components/Navbar"
// import ReactMarkdown from 'react-markdown'

// Total Black Aesthetic
const primaryBg = '#020205'

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()

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

  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college?.microsite_data || {})

  const getSubData = (key: string) => {
    return micrositeData?.[key] || college?.[key] || []
  }

  const allNavItems = [
    { name: 'Overview', path: '', icon: Home, show: true },
    {
      name: 'Courses & Fees',
      path: '/course-&-fees',
      icon: BookOpen,
      show: getSubData('fees').length > 0 || getSubData('courses').length > 0
    },
    {
      name: 'Admission',
      path: '/admission',
      icon: Building2,
      show: getSubData('admission').length > 0
    },
    {
      name: 'Placement',
      path: '/placement',
      icon: TrendingUp,
      show: getSubData('placement').length > 0
    },
    {
      name: 'Cutoff',
      path: '/cutoff',
      icon: BarChart3,
      show: getSubData('cutoff').length > 0
    },
    {
      name: 'Ranking',
      path: '/ranking',
      icon: Trophy,
      show: getSubData('ranking').length > 0
    },
    {
      name: 'Reviews',
      path: '/reviews',
      icon: Star,
      show: getSubData('reviews').length > 0
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: Phone,
      show: true
    },
  ]

  const navItems = allNavItems.filter(item => item.show)

  // Redirect handling: If user manually navigates to a missing subpage
  const activeTab = allNavItems.find(item => item.path !== '' && pathname.endsWith(item.path))
  if (activeTab && !activeTab.show) {
    router.replace(`/college/${slug}`)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </div>
    )
  }

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
          fees={getSubData('fees')?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("total"))?.[1]}
          avgPackage={getSubData('placement')?.[0]?.headers?.["Average package"] || getSubData('placement')?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("average"))?.[1]}
          highestPackage={getSubData('placement')?.[0]?.headers?.["Highest package"] || getSubData('placement')?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1]}
          ranking={getSubData('ranking')?.[0]?.rows?.[0]?.[1]}
        />
      </div>

      {/* ── SUB-NAVBAR (sticky below the main navbar) ── */}
      <nav className="sticky top-16 sm:top-[72px] lg:top-20 z-40 bg-[#020205]/90 backdrop-blur-xl border-b border-white/5 w-full">
        <div className="flex gap-1 md:gap-3 overflow-x-auto px-4 py-3 no-scrollbar items-center md:justify-center">
          {navItems.map((item) => {
            const fullPath = `/college/${slug}${item.path}`
            const isActive = item.path === '' ? pathname === `/college/${slug}` : pathname.endsWith(item.path)
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
  
{college.description && (
  <div className="mt-8 p-6 rounded-xl border border-white/10 bg-white/5">
    <h2 className="text-amber-500 font-bold text-xl mb-4">About</h2>
    <div className="space-y-2">
      {college.description.split('\n').map((line: string, i: number) => {
        if (!line.trim()) return null
        if (line.startsWith('- ')) {
          const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '|||$1|||')
          return (
            <div key={i} className="flex items-start gap-2 text-slate-300">
              <span className="text-amber-500 mt-1">•</span>
              <span>{content.split('|||').map((part, j) =>
                j % 2 === 1
                  ? <strong key={j} className="text-amber-400">{part}</strong>
                  : part
              )}</span>
            </div>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-amber-400 font-bold">{line.replace(/\*\*/g, '')}</p>
        }
        const content = line.replace(/\*\*(.*?)\*\*/g, '|||$1|||')
        return (
          <p key={i} className="text-slate-300">
            {content.split('|||').map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="text-amber-400">{part}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  </div>
)}
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
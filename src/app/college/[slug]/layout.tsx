"use client"
import React, { useState, useEffect } from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { supabase } from "../../../../lib/supabase"
import { BookOpen, DollarSign, Building2, Phone, Home, TrendingUp, BarChart3, Trophy, Star, Loader2 } from "lucide-react"
import RelatedColleges from "../../../../components/microsite/RelatedColleges"
import MicrositeHero from "../../../../components/microsite/MicrositeHero"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const navItems = [
    { name: 'Overview', path: '', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Fees', path: '/fees', icon: DollarSign },
    { name: 'Admission', path: '/admission', icon: Building2 },
    { name: 'Placement', path: '/placement', icon: TrendingUp },
    { name: 'Cutoff', path: '/cutoff', icon: BarChart3 },
    { name: 'Ranking', path: '/ranking', icon: Trophy },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Contact', path: '/contact', icon: Phone },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </div>
    )
  }

  const micrositeData = college?.microsite_data || {}

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
      <MicrositeHero
        collegeName={college.college_name}
        location={college.location}
        image={college.image}
        fees={micrositeData?.fees?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("total"))?.[1]}
        avgPackage={micrositeData?.placement?.[0]?.headers?.["Average package"] || micrositeData?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("average"))?.[1]}
        highestPackage={micrositeData?.placement?.[0]?.headers?.["Highest package"] || micrositeData?.placement?.[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1]}
        ranking={micrositeData?.ranking?.[0]?.rows?.[0]?.[1]}
      />

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-[#060818]/90 backdrop-blur-xl border-b border-white/10 w-full overflow-hidden">
        {/* Centered on big screens with md:justify-center */}
        <div className="flex gap-1 md:gap-3 overflow-x-auto px-4 py-3 no-scrollbar scroll-smooth items-center md:justify-center">
          {navItems.map((item) => {
            const fullPath = `/college/${slug}${item.path}`
            const isActive = pathname === fullPath
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={fullPath}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap font-bold uppercase tracking-wider flex-shrink-0 ${
                  isActive ? 'shadow-lg shadow-amber-500/20' : 'hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  color: isActive ? primaryBg : '#94a3b8',
                  fontSize: '12px' // Increased font size for better readability
                }}
              >
                <Icon size={14} className="shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Main Content */}
          <div className="flex-1 min-w-0">
            <main className="w-full">
              {children}
            </main>
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="w-full lg:w-[350px] shrink-0">
            <div className="lg:sticky lg:top-28">
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
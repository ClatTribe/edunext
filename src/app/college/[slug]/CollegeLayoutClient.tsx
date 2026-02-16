"use client"
import React, { useState, useEffect } from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { supabase } from "../../../../lib/supabase"
import { 
  BookOpen, DollarSign, Building2, Phone, Home, 
  TrendingUp, BarChart3, Trophy, Star, Loader2, 
  ArrowLeft, Glasses 
} from "lucide-react"
import RelatedColleges from "../../../../components/microsite/RelatedColleges"
import MicrositeHero from "../../../../components/microsite/MicrositeHero"

// Total Black Aesthetic
const accentColor = '#F59E0B'
const primaryBg = '#020205' 

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
    <div className="min-h-screen text-slate-300" style={{ backgroundColor: primaryBg }}>
      
      {/* HEADER SECTION */}
      <div className="relative">
        <nav className="sticky top-0 z-50 bg-[#020205]/95 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-0 py-2.5">
            
            {/* Left: Incognito Mode Button */}
            <div className="group">
              <div className="relative">
                {/* Subtle Amber Glow */}
                <div className="absolute -inset-1 bg-amber-600/10 rounded-r-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative flex items-center bg-zinc-900/40 border border-white/5 rounded-r-full shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden group-hover:pr-6 pl-0">
                  
                  {/* Icon Container: Chrome-style Incognito Spy */}
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-zinc-800 to-zinc-700 group-hover:from-amber-500 group-hover:to-amber-600 transition-colors duration-500 rounded-r-full">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-white group-hover:text-black transition-colors"
                    >
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                      <path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/>
                      <path d="M17 17l-1.5-1.5M7 17l1.5-1.5"/>
                    </svg>
                  </div>

                  {/* Sliding Text Area */}
                  <div className="max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out overflow-hidden opacity-0 group-hover:opacity-100 whitespace-nowrap hidden md:block">
                    <div className="pl-4">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-0.5">Stealth Active</span>
                      <span className="text-[12px] font-bold text-slate-100">Incognito Browsing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Back Button */}
            <div className="px-4">
              <Link 
                href="/find-colleges" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05] hover:border-amber-500/30 transition-all duration-300 group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-amber-500" />
                <span className="text-[11px] font-black uppercase tracking-widest">Back to Colleges</span>
              </Link>
            </div>
          </div>
        </nav>

        <MicrositeHero
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

      {/* SUB-NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#020205]/90 backdrop-blur-xl border-b border-white/5 w-full">
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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <main className="w-full">
              {children}
            </main>
          </div>

          <aside className="w-full lg:w-[350px] shrink-0">
            <div className="lg:sticky lg:top-24">
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
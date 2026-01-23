"use client"
import React from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { BookOpen, DollarSign, Building2, Phone, Home, TrendingUp, BarChart3, Trophy, Star } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-[#060818]/95 backdrop-blur-3xl border-b border-white/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {navItems.map((item) => {
              const fullPath = `/college/${slug}${item.path}`
              const isActive = pathname === fullPath
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={fullPath}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-3xl transition-all whitespace-nowrap font-black uppercase tracking-widest flex-shrink-0 ${
                    isActive 
                      ? 'shadow-lg' 
                      : 'hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: accentColor, color: primaryBg, fontSize: '10px' }
                      : { backgroundColor: 'transparent', color: '#64748b', fontSize: '10px' }
                  }
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  )
}
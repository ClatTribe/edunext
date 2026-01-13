"use client"
import React from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { BookOpen, DollarSign, Building2, Phone, Home, TrendingUp } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

  const navItems = [
    { name: 'Overview', path: '', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Admission', path: '/admission', icon: Building2 },
    { name: 'Fees', path: '/fees', icon: DollarSign },
    { name: 'Placement', path: '/placement', icon: TrendingUp },
    { name: 'Contact', path: '/contact', icon: Phone },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
      {/* Sticky Navigation - New UI Style */}
      <nav className="sticky top-0 z-50 bg-[#060818]/95 backdrop-blur-3xl border-b border-white/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const fullPath = `/college/${slug}${item.path}`
              const isActive = pathname === fullPath
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={fullPath}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-3xl transition-all whitespace-nowrap font-black uppercase tracking-widest ${
                    isActive 
                      ? 'shadow-lg scale-105' 
                      : 'hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: accentColor, color: primaryBg, fontSize: '11px' }
                      : { backgroundColor: 'transparent', color: '#64748b', fontSize: '11px' }
                  }
                >
                  <Icon size={16} className="shrink-0" />
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
"use client"
import React from "react"
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { BookOpen, DollarSign, Building2, Phone, Home, TrendingUp } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

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
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ backgroundColor: `${secondaryBg}ee`, borderBottom: `1px solid ${borderColor}` }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2">
            {navItems.map((item) => {
              const fullPath = `/college/${slug}${item.path}`
              const isActive = pathname === fullPath
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={fullPath}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
                    isActive ? 'shadow-lg' : ''
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: accentColor, color: 'white' }
                      : { backgroundColor: 'transparent', color: '#94a3b8' }
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
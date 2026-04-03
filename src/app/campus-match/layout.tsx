import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import React from 'react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CampusMatch â Find Your Perfect College',
  description: 'Two-sided matching platform connecting students with their perfect colleges through DNA-based compatibility scoring.',
}

export default function CampusMatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/campus-match" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-white">
                Campus<span className="text-[#a855f7]">Match</span>
              </span>
              <span className="text-[#a855f7] text-lg sm:text-xl">â¦</span>
            </Link>

            {/* Center Navigation - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-8">
              <Link
                href="/campus-match/dashboard"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/campus-match/matches"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                Matches
              </Link>
              <Link
                href="/campus-match/profile"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                Profile
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/campus-match/college-dashboard"
                className="hidden sm:inline-block text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                For Colleges
              </Link>

              {/* User Avatar Placeholder */}
              <button className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:border-[#a855f7] transition-colors flex-shrink-0">
                <span className="text-white font-medium text-sm">U</span>
              </button>

              {/* Mobile menu button */}
              <button className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - with padding for fixed nav */}
      <main className="min-h-screen bg-[#0f0f0f] pt-16 sm:pt-20">
        {children}
      </main>
    </div>
  )
}

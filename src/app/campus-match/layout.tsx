'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

export default function CampusMatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/campus-match/dashboard', label: 'Dashboard' },
    { href: '/campus-match/matches', label: 'Matches' },
    { href: '/campus-match/profile', label: 'Profile' },
  ]

  const isActive = (href: string) => pathname === href

  // Dynamic page titles
  const getPageTitle = () => {
    if (pathname === '/campus-match') return 'CampusMatch â Find Your Perfect College'
    if (pathname?.includes('/onboarding')) return 'Get Started â CampusMatch'
    if (pathname?.includes('/dashboard')) return 'Dashboard â CampusMatch'
    if (pathname?.includes('/matches')) return 'Matches â CampusMatch'
    if (pathname?.includes('/profile')) return 'Profile â CampusMatch'
    if (pathname?.includes('/college-dashboard')) return 'College Dashboard â CampusMatch'
    return 'CampusMatch â Find Your Perfect College'
  }

  return (
    <div className="font-sans">
      {/* Dynamic title */}
      <title>{getPageTitle()}</title>
      <meta name="description" content="Two-sided matching platform connecting students with their perfect colleges through DNA-based compatibility scoring." />

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#a855f7] focus:text-white focus:rounded focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#2a2a2a]" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/campus-match" className="flex items-center gap-2 flex-shrink-0 min-h-[44px]">
              <span className="text-xl sm:text-2xl font-bold text-white">
                Campus<span className="text-[#a855f7]">Match</span>
              </span>
              <span className="text-[#a855f7] text-lg sm:text-xl" aria-hidden="true">â¦</span>
            </Link>

            {/* Center Navigation - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 min-h-[44px] flex items-center rounded-lg transition-colors font-medium text-sm ${
                    isActive(link.href)
                      ? 'text-[#a855f7] bg-[#a855f7]/10'
                      : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/campus-match/college-dashboard"
                className={`hidden sm:inline-flex items-center px-4 py-3 min-h-[44px] rounded-lg transition-colors font-medium text-sm ${
                  isActive('/campus-match/college-dashboard')
                    ? 'text-[#a855f7] bg-[#a855f7]/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                For Colleges
              </Link>

              {/* User Avatar Placeholder */}
              <Link
                href="/campus-match/profile"
                className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:border-[#a855f7] transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
                aria-label="Your profile"
              >
                <span className="text-white font-medium text-sm">U</span>
              </Link>

              {/* Mobile menu button */}
              <button
                className="sm:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#0f0f0f] border-t border-[#2a2a2a] px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-medium text-sm ${
                  isActive(link.href)
                    ? 'text-[#a855f7] bg-[#a855f7]/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/campus-match/college-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-medium text-sm ${
                isActive('/campus-match/college-dashboard')
                  ? 'text-[#a855f7] bg-[#a855f7]/10'
                  : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              For Colleges
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content - with padding for fixed nav */}
      <main id="main-content" className="min-h-screen bg-[#0f0f0f] pt-16 sm:pt-20" role="main">
        {children}
      </main>
    </div>
  )
}

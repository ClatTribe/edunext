'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CampusMatchLanding() {
  const [hoveredCta, setHoveredCta] = useState<'student' | 'college' | null>(null)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28" aria-labelledby="hero-heading">
        <div className="text-center">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Find Your Perfect
            <br />
            <span className="text-[#a855f7]">College Match</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Two-sided matching powered by DNA compatibility scores. Connect with colleges that truly align with your values, goals, and aspirations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link
              href="/campus-match/onboarding"
              onMouseEnter={() => setHoveredCta('student')}
              onMouseLeave={() => setHoveredCta(null)}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] rounded-lg font-bold text-lg transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
            >
              <div className="absolute inset-0 bg-[#a855f7] group-hover:bg-[#9333ea] transition-colors" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"
                style={{
                  transform: hoveredCta === 'student' ? 'translateX(100%)' : 'translateX(-100%)',
                  transition: 'transform 0.6s',
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <span aria-hidden="true">&#x1F468;&#x200D;&#x1F393;</span> I&apos;m a Student
              </span>
            </Link>

            <Link
              href="/campus-match/college-dashboard"
              onMouseEnter={() => setHoveredCta('college')}
              onMouseLeave={() => setHoveredCta(null)}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] rounded-lg font-bold text-lg border-2 border-[#a855f7] text-white hover:bg-[#a855f7] hover:bg-opacity-10 transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"
                style={{
                  transform: hoveredCta === 'college' ? 'translateX(100%)' : 'translateX(-100%)',
                  transition: 'transform 0.6s',
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <span aria-hidden="true">&#x1F3EB;</span> I&apos;m a College
              </span>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Link href="/campus-match/onboarding" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#a855f7] transition-colors text-left group">
              <div className="text-4xl mb-4" aria-hidden="true">&#x1F9EC;</div>
              <h2 className="text-lg font-bold mb-2 group-hover:text-[#a855f7] transition-colors">DNA Quiz</h2>
              <p className="text-gray-400 text-sm">
                Answer 50 questions about your values, goals, and personality to generate your unique DNA profile.
              </p>
            </Link>

            <Link href="/campus-match/dashboard" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#a855f7] transition-colors text-left group">
              <div className="text-4xl mb-4" aria-hidden="true">&#x1F30C;</div>
              <h2 className="text-lg font-bold mb-2 group-hover:text-[#a855f7] transition-colors">Solar System View</h2>
              <p className="text-gray-400 text-sm">
                Visualize college matches in an interactive solar system where orbits represent fit scores.
              </p>
            </Link>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#a855f7] transition-colors text-left">
              <div className="text-4xl mb-4" aria-hidden="true">&#x1F47B;</div>
              <h2 className="text-lg font-bold mb-2">Ghost Mode</h2>
              <p className="text-gray-400 text-sm">
                Browse colleges anonymously. Colleges only see your interest when you like them back.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#a855f7] transition-colors text-left">
              <div className="text-4xl mb-4" aria-hidden="true">&#x2728;</div>
              <h2 className="text-lg font-bold mb-2">Vibe Scores</h2>
              <p className="text-gray-400 text-sm">
                Get compatibility percentages showing how well you align with each college&apos;s DNA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#1a1a1a] border-t border-[#2a2a2a] py-16 sm:py-24" aria-labelledby="how-it-works">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="how-it-works" className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center mx-auto mb-4 font-bold text-lg" aria-hidden="true">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Your DNA</h3>
              <p className="text-gray-400">
                Take our comprehensive quiz to define your educational DNA and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center mx-auto mb-4 font-bold text-lg" aria-hidden="true">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Discover Matches</h3>
              <p className="text-gray-400">
                Browse colleges in our solar system and see compatibility scores instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center mx-auto mb-4 font-bold text-lg" aria-hidden="true">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Connected</h3>
              <p className="text-gray-400">
                When both you and a college match, real connections happen. Explore opportunities together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" aria-labelledby="cta-heading">
        <div className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-lg p-8 sm:p-12 text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Match?</h2>
          <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
            Join students and colleges using CampusMatch to find perfect matches based on real compatibility â not just rankings.
          </p>
          <Link
            href="/campus-match/onboarding"
            className="inline-block px-8 py-4 min-h-[48px] bg-white text-[#a855f7] font-bold rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#a855f7]"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050818] border-t border-[#2a2a2a] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">CampusMatch</h3>
              <p className="text-gray-400 text-sm">
                Two-sided matching for students and colleges.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For Students</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/campus-match/dashboard" className="text-gray-400 hover:text-white transition-colors py-1 inline-block">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/campus-match/matches" className="text-gray-400 hover:text-white transition-colors py-1 inline-block">
                    Matches
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For Colleges</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/campus-match/college-dashboard" className="text-gray-400 hover:text-white transition-colors py-1 inline-block">
                    College Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors py-1 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/campus-match" className="text-gray-400 hover:text-white transition-colors py-1 inline-block">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2a2a2a] pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 CampusMatch. All rights reserved. Part of the <Link href="/" className="text-gray-300 hover:text-white underline">EduNext</Link> ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

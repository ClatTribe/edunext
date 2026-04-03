'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../contexts/AuthContext'
import { StudentProfile, CollegeProfile, Swipe, CollegeSignal, SwipeDirection } from '../types'
import { computeFitScore } from '../lib/fitScore'
import SwipeCard from '../components/shared/SwipeCard'

const RING_RADII = { inner: 140, mid: 220, outer: 300 }

type FilterType = 'all' | 'liked_me' | 'shortlist'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [colleges, setColleges] = useState<CollegeProfile[]>([])
  const [swipes, setSwipes] = useState<Swipe[]>([])
  const [signals, setSignals] = useState<CollegeSignal[]>([])
  const [fitScores, setFitScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCollege, setSelectedCollege] = useState<CollegeProfile | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'Discover' | 'Matches' | 'Profile'>('Discover')

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load student profile
  useEffect(() => {
    if (!user) return

    const loadStudentProfile = async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setStudent(data)
      }
    }

    loadStudentProfile()
  }, [user])

  // Load colleges, swipes, and signals
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)

      // Fetch active colleges
      const { data: collegesData } = await supabase
        .from('colleges')
        .select('*')
        .eq('active', true)

      if (collegesData) {
        setColleges(collegesData)
      }

      // Fetch swipes for this student
      const { data: swipesData } = await supabase
        .from('swipes')
        .select('*')
        .eq('student_id', user.id)

      if (swipesData) {
        setSwipes(swipesData)
      }

      // Fetch signals (colleges that liked this student)
      const { data: signalsData } = await supabase
        .from('college_signals')
        .select('*')
        .eq('student_id', user.id)

      if (signalsData) {
        setSignals(signalsData)
      }

      setLoading(false)
    }

    loadData()
  }, [user])

  // Compute fit scores
  useEffect(() => {
    if (!student || colleges.length === 0) return

    const scores: Record<string, number> = {}
    colleges.forEach((college) => {
      scores[college.id] = computeFitScore(student, college)
    })
    setFitScores(scores)
  }, [student, colleges])

  const getOrbit = (fitScore: number): 'inner' | 'mid' | 'outer' => {
    if (fitScore >= 80) return 'inner'
    if (fitScore >= 60) return 'mid'
    return 'outer'
  }

  const getOrbitRadius = (orbit: 'inner' | 'mid' | 'outer'): number => {
    return RING_RADII[orbit]
  }

  const getOrbitColleges = (orbit: 'inner' | 'mid' | 'outer'): CollegeProfile[] => {
    return colleges.filter((college) => {
      const fitScore = fitScores[college.id] || 0
      return getOrbit(fitScore) === orbit
    })
  }

  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    return {
      x: Math.round(radius * Math.cos(angle)),
      y: Math.round(radius * Math.sin(angle)),
    }
  }

  const filteredColleges = colleges.filter((college) => {
    const fitScore = fitScores[college.id] || 0

    if (filter === 'all') return true
    if (filter === 'liked_me') {
      return signals.some((s) => s.collegeId === college.id)
    }
    if (filter === 'shortlist') {
      return swipes.some((s) => s.collegeId === college.id && s.direction === 'right')
    }
    return true
  })

  const sortedColleges = [...filteredColleges].sort((a, b) => {
    const scoreA = fitScores[a.id] || 0
    const scoreB = fitScores[b.id] || 0
    return scoreB - scoreA
  })

  const averageFitScore =
    Object.values(fitScores).length > 0
      ? Math.round(Object.values(fitScores).reduce((a, b) => a + b, 0) / Object.values(fitScores).length)
      : 0

  const handleSwipe = async (college: CollegeProfile, direction: SwipeDirection) => {
    if (!user) return

    // Create swipe record
    const { error } = await supabase.from('swipes').insert([
      {
        student_id: user.id,
        college_id: college.id,
        direction,
      },
    ])

    if (!error) {
      // Update local state
      setSwipes([
        ...swipes,
        {
          id: `${user.id}-${college.id}`,
          studentId: user.id,
          collegeId: college.id,
          direction,
          createdAt: new Date().toISOString(),
        },
      ])
    }

    setSelectedCollege(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a855f7] mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-[#a855f7]">Campus</span>Match
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-400">{student?.fullName || 'Student'}</p>
              <p className="text-2xl font-bold text-[#a855f7]">{averageFitScore}%</p>
              <p className="text-xs text-gray-400">Avg. Fit Score</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-6 border-b border-gray-700">
            {(['Discover', 'Matches', 'Profile'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#a855f7] border-b-2 border-[#a855f7]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'Discover' && (
          <>
            {/* Filter Buttons */}
            <div className="flex gap-3 mb-8 flex-wrap sm:flex-nowrap">
              {(['all', 'liked_me', 'shortlist'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-[#a855f7] text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {f === 'all' && 'All colleges'}
                  {f === 'liked_me' && 'Liked me'}
                  {f === 'shortlist' && 'My shortlist'}
                </button>
              ))}
            </div>

            {isMobile ? (
              // Mobile: Card list view
              <div className="space-y-4">
                {sortedColleges.map((college) => {
                  const fitScore = fitScores[college.id] || 0
                  const signal = signals.find((s) => s.collegeId === college.id)

                  return (
                    <div
                      key={college.id}
                      onClick={() => setSelectedCollege(college)}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-[#a855f7] cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{college.name}</h3>
                          <p className="text-sm text-gray-400">{college.city}</p>
                        </div>
                        {signal && (
                          <div className="bg-[#a855f7] bg-opacity-20 border border-[#a855f7] rounded px-2 py-1">
                            <p className="text-xs text-[#a855f7] font-medium">Likes you</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {college.dnaType && (
                            <div className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                              {college.dnaType}
                            </div>
                          )}
                          <p className="text-sm text-gray-400 line-clamp-2">{college.aboutShort}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="text-3xl font-bold text-[#a855f7]">{fitScore}</div>
                          <p className="text-xs text-gray-400">Fit Score</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Desktop: Solar system view
              <div className="flex items-center justify-center min-h-[800px]">
                <div className="relative w-[900px] h-[900px] mx-auto">
                  {/* Orbit rings */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 900">
                    <circle cx="450" cy="450" r={RING_RADII.inner} fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
                    <circle cx="450" cy="450" r={RING_RADII.mid} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.2" strokeDasharray="5,5" />
                    <circle cx="450" cy="450" r={RING_RADII.outer} fill="none" stroke="#666666" strokeWidth="1" opacity="0.15" strokeDasharray="5,5" />
                  </svg>

                  {/* Center: Student profile */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{student?.fullName?.charAt(0).toUpperCase() || 'S'}</span>
                    </div>
                    <h3 className="font-bold text-sm">{student?.fullName || 'You'}</h3>
                    <p className="text-xs text-gray-400">Avg. {averageFitScore}%</p>
                  </div>

                  {/* Orbital colleges */}
                  {(['inner', 'mid', 'outer'] as const).map((orbit) => {
                    const orbitColleges = getOrbitColleges(orbit)
                    const radius = getOrbitRadius(orbit)

                    return (
                      <React.Fragment key={orbit}>
                        {orbitColleges.map((college, index) => {
                          const position = getPosition(index, orbitColleges.length, radius)
                          const fitScore = fitScores[college.id] || 0
                          const hasSignal = signals.some((s) => s.collegeId === college.id)

                          return (
                            <div
                              key={college.id}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0"
                              style={{
                                left: `calc(50% + ${position.x}px)`,
                                top: `calc(50% + ${position.y}px)`,
                              }}
                            >
                              <button
                                onClick={() => setSelectedCollege(college)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xs transition-all hover:scale-110 cursor-pointer ${
                                  hasSignal
                                    ? 'bg-[#a855f7] ring-2 ring-[#a855f7] ring-offset-2 ring-offset-[#0f0f0f]'
                                    : orbit === 'inner'
                                      ? 'bg-[#a855f7] shadow-lg shadow-[#a855f7]/50'
                                      : orbit === 'mid'
                                        ? 'bg-gray-700'
                                        : 'bg-gray-800'
                                }`}
                              >
                                {college.name.substring(0, 2).toUpperCase()}
                              </button>
                              <div className="mt-2 text-center text-xs">
                                <p className="font-medium">{college.name.split(' ')[0]}</p>
                                <p className="text-gray-400">{fitScore}%</p>
                              </div>
                            </div>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'Matches' && (
          <div className="text-center py-16">
            <p className="text-gray-400">Your matches will appear here</p>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="text-center py-16">
            <p className="text-gray-400">Edit your profile</p>
          </div>
        )}
      </main>

      {/* Side Panel: College Detail */}
      {selectedCollege && !isMobile && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => setSelectedCollege(null)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <span className="text-2xl">Ã</span>
          </button>

          <div className="p-6 space-y-6">
            {/* College header */}
            <div>
              {selectedCollege.bannerUrl && (
                <img
                  src={selectedCollege.bannerUrl}
                  alt={selectedCollege.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{selectedCollege.name}</h2>
              <p className="text-gray-400 mb-2">{selectedCollege.city}, {selectedCollege.state}</p>
              {selectedCollege.dnaType && (
                <div className="inline-block bg-[#a855f7] bg-opacity-20 border border-[#a855f7] rounded px-3 py-1 text-sm font-medium text-[#a855f7]">
                  {selectedCollege.dnaType}
                </div>
              )}
            </div>

            {/* About */}
            <div>
              <h3 className="font-bold text-lg mb-2">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedCollege.aboutShort}</p>
            </div>

            {/* Programs */}
            {selectedCollege.programs && selectedCollege.programs.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Programs</h3>
                <div className="space-y-2">
                  {selectedCollege.programs.slice(0, 5).map((prog, idx) => (
                    <div key={idx} className="bg-gray-800 rounded p-3 text-sm">
                      <p className="font-medium">{prog.name}</p>
                      <p className="text-gray-400 text-xs">
                        {prog.degree} | {prog.duration} | â¹{(prog.feesPerYearInr / 100000).toFixed(1)}L/yr
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded p-3 text-center">
                <p className="text-gray-400 text-xs mb-1">Placement</p>
                <p className="font-bold text-lg">â¹{(selectedCollege.placementAvgLpa / 1).toFixed(1)}L</p>
                <p className="text-gray-500 text-xs">Avg LPA</p>
              </div>
              <div className="bg-gray-800 rounded p-3 text-center">
                <p className="text-gray-400 text-xs mb-1">Fit Score</p>
                <p className="font-bold text-lg text-[#a855f7]">{fitScores[selectedCollege.id] || 0}%</p>
              </div>
            </div>

            {/* Fit breakdown */}
            <div>
              <h3 className="font-bold text-lg mb-3">Why this fit?</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Academic Alignment</span>
                  <span className="text-[#a855f7] font-medium">Strong</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Program Match</span>
                  <span className="text-[#a855f7] font-medium">Available</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Location Preference</span>
                  <span className="text-[#a855f7] font-medium">Match</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => handleSwipe(selectedCollege, 'left')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
              >
                Pass
              </button>
              <button
                onClick={() => handleSwipe(selectedCollege, 'right')}
                className="flex-1 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-lg transition-colors"
              >
                Like
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile side panel */}
      {selectedCollege && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col" onClick={() => setSelectedCollege(null)}>
          <div
            className="bg-gray-900 mt-auto rounded-t-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-center">
              <button
                onClick={() => setSelectedCollege(null)}
                className="text-gray-400 hover:text-white"
              >
                <span className="block w-12 h-1 bg-gray-700 rounded-full"></span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedCollege.name}</h2>
                <p className="text-gray-400 mb-2">{selectedCollege.city}, {selectedCollege.state}</p>
                {selectedCollege.dnaType && (
                  <div className="inline-block bg-[#a855f7] bg-opacity-20 border border-[#a855f7] rounded px-3 py-1 text-sm font-medium text-[#a855f7]">
                    {selectedCollege.dnaType}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">About</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedCollege.aboutShort}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleSwipe(selectedCollege, 'left')}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                >
                  Pass
                </button>
                <button
                  onClick={() => handleSwipe(selectedCollege, 'right')}
                  className="flex-1 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-lg transition-colors"
                >
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

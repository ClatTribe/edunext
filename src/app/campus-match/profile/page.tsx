'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { supabase } from '../../../../lib/supabase'
import { StudentProfile, DnaType } from '../types'
import { DNA_DESCRIPTIONS, DNA_COLORS } from '../lib/dnaMatch'
import { User, MapPin, BookOpen, GraduationCap, Eye, EyeOff, Edit3, LogOut, Shield } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [ghostMode, setGhostMode] = useState(false)
  const [togglingGhost, setTogglingGhost] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/register')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('userId', user.id)
        .single()

      if (data && !error) {
        setProfile(data as StudentProfile)
        setGhostMode(data.ghostMode || false)
      }
      setLoadingProfile(false)
    }

    fetchProfile()
  }, [user])

  const toggleGhostMode = async () => {
    if (!profile) return
    setTogglingGhost(true)

    const newGhostMode = !ghostMode
    const { error } = await supabase
      .from('students')
      .update({ ghostMode: newGhostMode, updatedAt: new Date().toISOString() })
      .eq('id', profile.id)

    if (!error) {
      setGhostMode(newGhostMode)
    }
    setTogglingGhost(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // No profile yet â redirect to onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">No Profile Yet</h1>
          <p className="text-gray-400 mb-8">
            Complete your onboarding to set up your CampusMatch profile and start discovering colleges.
          </p>
          <button
            onClick={() => router.push('/campus-match/onboarding')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {profile.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.fullName}</h1>
              <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}, {profile.state}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{profile.stream} &middot; {profile.board} &middot; {profile.classYear}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/campus-match/onboarding')}
              className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Edit profile"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DNA Type */}
        {profile.dnaType && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your DNA Type</h2>
            <div className={`rounded-lg p-4 border ${DNA_COLORS[profile.dnaType]}`}>
              <h3 className="text-xl font-bold mb-1">{profile.dnaType}</h3>
              <p className="text-sm opacity-80">{DNA_DESCRIPTIONS[profile.dnaType]}</p>
            </div>
          </div>
        )}

        {/* Academic Info */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Academics</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Board %</span>
              <p className="text-white font-semibold mt-1">
                {profile.boardPercentage ? `${profile.boardPercentage}%` : 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Entrance Exam</span>
              <p className="text-white font-semibold mt-1">
                {profile.entranceExam || 'Not selected'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Entrance Score</span>
              <p className="text-white font-semibold mt-1">
                {profile.entranceScore || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Target Degree</span>
              <p className="text-white font-semibold mt-1">
                {profile.targetDegree || 'Not selected'}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Ghost Mode */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Privacy</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium">Ghost Mode</p>
                <p className="text-sm text-gray-400">
                  {ghostMode
                    ? 'Your identity is hidden from colleges until you match'
                    : 'Colleges can see your full profile'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleGhostMode}
              disabled={togglingGhost}
              className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                ghostMode ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              role="switch"
              aria-checked={ghostMode}
              aria-label="Toggle ghost mode"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  ghostMode ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile Completeness</h2>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
              style={{ width: `${profile.profileCompletenessPct || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">{profile.profileCompletenessPct || 0}% complete</p>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-red-400 hover:border-red-400/30 transition font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

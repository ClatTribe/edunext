'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Match, CollegeProfile } from '../types'

// Types
interface Message {
  id: string
  matchId: string
  senderId: 'student' | 'college' | 'ai'
  senderName: string
  content: string
  timestamp: string
  isAiGenerated?: boolean
}

interface ExtendedMatch extends Match {
  college?: CollegeProfile & {
    lastMessageTime?: string
    unreadCount?: number
  }
}

// Mock data for development
const MOCK_MATCHES: ExtendedMatch[] = [
  {
    id: 'match-1',
    studentId: 'student-1',
    collegeId: 'college-1',
    matchType: 'mutual',
    signalType: null,
    icebreakerText: 'Hey! We noticed you are interested in Computer Science...',
    icebreakerSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    studentResponded: true,
    collegeResponded: true,
    applicationReady: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    college: {
      id: 'college-1',
      name: 'Delhi Institute of Technology',
      city: 'Delhi',
      state: 'Delhi',
      type: 'Government',
      programs: [],
      dnaType: 'Scholar',
      dnaDescription: 'Academic excellence focused',
      nirfRank: 25,
      naacGrade: 'A++',
      logoUrl: null,
      bannerUrl: null,
      website: null,
      aboutShort: 'Premier engineering institute in India',
      placementAvgLpa: 12,
      placementHighestLpa: 45,
      totalIntake: 1000,
      campusAreaAcres: 25,
      hostelAvailable: true,
      vibeScoreCache: {},
      vibeRatingCount: 150,
      featured: true,
      active: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
    },
  },
  {
    id: 'match-2',
    studentId: 'student-1',
    collegeId: 'college-2',
    matchType: 'college_led',
    signalType: 'like',
    icebreakerText: null,
    icebreakerSentAt: null,
    studentResponded: false,
    collegeResponded: false,
    applicationReady: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    college: {
      id: 'college-2',
      name: 'BITS Pilani',
      city: 'Pilani',
      state: 'Rajasthan',
      type: 'Private',
      programs: [],
      dnaType: 'Builder',
      dnaDescription: 'Innovation and entrepreneurship',
      nirfRank: 15,
      naacGrade: 'A+',
      logoUrl: null,
      bannerUrl: null,
      website: null,
      aboutShort: 'Leading private engineering university',
      placementAvgLpa: 15,
      placementHighestLpa: 50,
      totalIntake: 800,
      campusAreaAcres: 30,
      hostelAvailable: true,
      vibeScoreCache: {},
      vibeRatingCount: 200,
      featured: true,
      active: true,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessageTime: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      unreadCount: 2,
    },
  },
  {
    id: 'match-3',
    studentId: 'student-1',
    collegeId: 'college-3',
    matchType: 'student_led',
    signalType: 'scholarship_watch',
    icebreakerText: 'Congratulations on being shortlisted for our merit scholarship!',
    icebreakerSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    studentResponded: true,
    collegeResponded: false,
    applicationReady: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    college: {
      id: 'college-3',
      name: 'IIT Bombay',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Government',
      programs: [],
      dnaType: 'Scholar',
      dnaDescription: 'Research and academic excellence',
      nirfRank: 3,
      naacGrade: 'A++',
      logoUrl: null,
      bannerUrl: null,
      website: null,
      aboutShort: 'India\'s top engineering institute',
      placementAvgLpa: 20,
      placementHighestLpa: 80,
      totalIntake: 1200,
      campusAreaAcres: 50,
      hostelAvailable: true,
      vibeScoreCache: {},
      vibeRatingCount: 500,
      featured: true,
      active: true,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
    },
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  'match-1': [
    {
      id: 'msg-1',
      matchId: 'match-1',
      senderId: 'ai',
      senderName: 'AI Icebreaker',
      content: 'Hey! We noticed you are interested in Computer Science. Your profile aligns well with our curriculum. Would you like to learn more about our program?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isAiGenerated: true,
    },
    {
      id: 'msg-2',
      matchId: 'match-1',
      senderId: 'student',
      senderName: 'You',
      content: 'Thanks for reaching out! I\'d love to know more about the placement statistics.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3',
      matchId: 'match-1',
      senderId: 'college',
      senderName: 'Delhi Institute of Technology',
      content: 'Our average placement is â¹12 LPA with highest being â¹45 LPA. We have a 95% placement record. Feel free to ask anything else!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-4',
      matchId: 'match-1',
      senderId: 'student',
      senderName: 'You',
      content: 'That sounds great! What about hostel facilities?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-5',
      matchId: 'match-1',
      senderId: 'college',
      senderName: 'Delhi Institute of Technology',
      content: 'We have excellent hostel facilities with modern amenities. First and second year students are guaranteed hostel seats. Would you like to schedule a campus visit?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'match-2': [
    {
      id: 'msg-6',
      matchId: 'match-2',
      senderId: 'ai',
      senderName: 'AI Icebreaker',
      content: 'BITS Pilani noticed your strong performance in physics and mathematics. We think you\'d be a great fit for our program!',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      isAiGenerated: true,
    },
  ],
  'match-3': [
    {
      id: 'msg-7',
      matchId: 'match-3',
      senderId: 'ai',
      senderName: 'AI Icebreaker',
      content: 'Congratulations on being shortlisted for our merit scholarship! Your academic excellence has impressed our admissions team.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isAiGenerated: true,
    },
    {
      id: 'msg-8',
      matchId: 'match-3',
      senderId: 'student',
      senderName: 'You',
      content: 'Thank you so much! I\'m very interested in IIT Bombay and would love to know more about the scholarship amount.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    },
  ],
}

// Helper functions
function getMatchBadgeColor(matchType: string): string {
  switch (matchType) {
    case 'mutual':
      return 'bg-[#a855f7] text-white'
    case 'college_led':
      return 'bg-[#a855f7] bg-opacity-20 text-[#a855f7]'
    case 'student_led':
      return 'bg-amber-500 bg-opacity-20 text-amber-500'
    default:
      return 'bg-red-500 bg-opacity-20 text-red-500'
  }
}

function getMatchBadgeLabel(matchType: string, signalType: string | null): string {
  if (matchType === 'mutual') return 'Mutual Match'
  if (signalType === 'like') return 'They Liked You'
  if (signalType === 'scholarship_watch') return 'Scholarship Watch'
  if (signalType === 'priority_interview') return 'Priority Interview'
  return 'Match'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return then.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function getCollegeAvatar(collegeName: string): string {
  return collegeName.split(' ')[0][0].toUpperCase()
}

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<ExtendedMatch | null>(MOCK_MATCHES[0])
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[MOCK_MATCHES[0].id] || [])
  const [newMessage, setNewMessage] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load messages when match changes
  useEffect(() => {
    if (selectedMatch) {
      setMessages(MOCK_MESSAGES[selectedMatch.id] || [])
    }
  }, [selectedMatch])

  // Sort matches by most recent activity
  const sortedMatches = [...MOCK_MATCHES].sort((a, b) => {
    const timeA = new Date(a.college?.lastMessageTime || a.icebreakerSentAt || a.createdAt).getTime()
    const timeB = new Date(b.college?.lastMessageTime || b.icebreakerSentAt || b.createdAt).getTime()
    return timeB - timeA
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedMatch || isSending) return

    setIsSending(true)

    // Create new message
    const message: Message = {
      id: `msg-${Date.now()}`,
      matchId: selectedMatch.id,
      senderId: 'student',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    // Update messages
    setMessages([...messages, message])
    setNewMessage('')

    // TODO: Send to Supabase
    // const { error } = await supabase
    //   .from('match_messages')
    //   .insert([{
    //     match_id: selectedMatch.id,
    //     sender_id: 'student',
    //     sender_name: 'You',
    //     content: newMessage,
    //   }])
    // if (error) console.error('Failed to send message:', error)

    // TODO: Set up Supabase Realtime subscription for messages
    // const subscription = supabase
    //   .channel(`match:${selectedMatch.id}`)
    //   .on(
    //     'postgres_changes',
    //     { event: 'INSERT', schema: 'public', table: 'match_messages', filter: `match_id=eq.${selectedMatch.id}` },
    //     (payload) => {
    //       setMessages(prev => [...prev, payload.new as Message])
    //     }
    //   )
    //   .subscribe()

    setIsSending(false)
  }

  const MatchListItem = ({ match }: { match: ExtendedMatch }) => (
    <button
      onClick={() => setSelectedMatch(match)}
      className={`w-full p-4 text-left transition-all border-l-4 ${
        selectedMatch?.id === match.id
          ? 'bg-[#1a1a1a] border-l-[#a855f7] shadow-lg shadow-[#a855f7]/20'
          : 'bg-[#0f0f0f] border-l-transparent hover:bg-[#1a1a1a] border-l-[#2a2a2a]'
      }`}
    >
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
          {getCollegeAvatar(match.college?.name || '')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white truncate text-sm">{match.college?.name}</h3>
            {match.college?.unreadCount && match.college.unreadCount > 0 && (
              <div className="w-2 h-2 rounded-full bg-[#a855f7] flex-shrink-0 mt-1.5"></div>
            )}
          </div>

          {/* Badge */}
          <div className="mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${getMatchBadgeColor(match.matchType)}`}>
              {getMatchBadgeLabel(match.matchType, match.signalType)}
            </span>
          </div>

          {/* Last message preview */}
          <p className="text-xs text-gray-400 line-clamp-1 mb-1">
            {messages.find((m) => m.matchId === match.id)?._?.content ||
              match.icebreakerText ||
              'No messages yet'}
          </p>

          {/* Time */}
          <p className="text-xs text-gray-500">
            {formatTimeAgo(match.college?.lastMessageTime || match.icebreakerSentAt || match.createdAt)}
          </p>
        </div>
      </div>
    </button>
  )

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No matches selected</p>
            <p className="text-gray-500 text-sm">Select a match to start chatting</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Match List */}
        {(!isMobile || !selectedMatch) && (
          <div className="w-full md:w-80 bg-[#0f0f0f] border-r border-[#2a2a2a] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#2a2a2a] sticky top-0 bg-[#0f0f0f]">
              <h2 className="text-lg font-bold">Your Matches</h2>
              <p className="text-xs text-gray-400 mt-1">{sortedMatches.length} active conversations</p>
            </div>

            {/* Match List */}
            {sortedMatches.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {sortedMatches.map((match) => (
                  <div key={match.id} className="border-b border-[#2a2a2a] last:border-b-0">
                    <MatchListItem match={match} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <p className="text-gray-400 text-center">No matches yet.</p>
                <p className="text-gray-500 text-sm text-center mt-2">
                  Keep exploring colleges in your Solar System!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Right Panel - Conversation */}
        {(!isMobile || selectedMatch) && (
          <div className="flex-1 bg-[#0f0f0f] flex flex-col relative">
            {/* Header */}
            <div className="border-b border-[#2a2a2a] p-4 sm:p-6 bg-[#0f0f0f] flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="p-2 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{selectedMatch.college?.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getMatchBadgeColor(selectedMatch.matchType)}`}>
                      {getMatchBadgeLabel(selectedMatch.matchType, selectedMatch.signalType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fit Score */}
              <div className="text-right">
                <p className="text-xs text-gray-400">Fit Score</p>
                <p className="text-xl sm:text-2xl font-bold text-[#a855f7]">85%</p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isStudent = message.senderId === 'student'
                    const isAI = message.senderId === 'ai'
                    const prevMessage = index > 0 ? messages[index - 1] : null
                    const showTimestamp =
                      !prevMessage ||
                      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Timestamp separator */}
                        {showTimestamp && (
                          <div className="flex justify-center py-2">
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg text-sm ${
                              isStudent
                                ? 'bg-[#a855f7] text-white'
                                : isAI
                                  ? 'bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a]'
                                  : 'bg-[#2a2a2a] text-gray-100'
                            }`}
                          >
                            {isAI && (
                              <div className="text-xs font-semibold text-[#a855f7] mb-1">
                                AI Generated
                              </div>
                            )}
                            <p className="leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isStudent ? 'text-white/70' : 'text-gray-400'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-[#2a2a2a] p-4 sm:p-6 bg-[#0f0f0f] sticky bottom-0">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isSending ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6h6m0 0h6" />
                      </svg>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>

                {/* Character count */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span></span>
                  <span>{newMessage.length}/500</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Empty state when no matches */}
      {sortedMatches.length === 0 && !selectedMatch && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">ð</div>
            <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
            <p className="text-gray-400 mb-6">
              Keep exploring colleges in your Solar System to find your perfect match!
            </p>
            <a
              href="/campus-match/dashboard"
              className="inline-block px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold rounded-lg transition-colors"
            >
              Explore Colleges
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

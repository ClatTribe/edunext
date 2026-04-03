'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StudentProfile, CollegeProfile } from '../../types'

interface MatchCelebrationProps {
  student: StudentProfile
  college: CollegeProfile
  icebreakerText?: string
  onClose: () => void
  onReply: () => void
}

export default function MatchCelebration({
  student,
  college,
  icebreakerText,
  onClose,
  onReply,
}: MatchCelebrationProps) {
  const [showParticles, setShowParticles] = useState(true)

  useEffect(() => {
    // Auto-hide particles after animation
    const timer = setTimeout(() => setShowParticles(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Confetti particles */}
      {showParticles && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#a855f7] rounded-full"
              initial={{
                x: Math.random() * window.innerWidth - window.innerWidth / 2,
                y: -10,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random(),
                ease: 'easeIn',
              }}
              style={{
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </>
      )}

      {/* Main celebration card */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-[#a855f7] border-opacity-30 max-w-md w-full overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-[#a855f7] to-[#7c3aed] p-8 text-center overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <motion.h1
            className="text-4xl font-black text-white relative z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            It's a Match! ð
          </motion.h1>
        </div>

        {/* Content section */}
        <div className="p-8 space-y-6">
          {/* Mini cards side by side */}
          <motion.div
            className="flex gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Student card */}
            <div className="flex-1 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">
                  {student.fullName?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <p className="text-sm font-bold text-center text-white line-clamp-1">{student.fullName}</p>
              <p className="text-xs text-gray-400 text-center">{student.city}</p>
            </div>

            {/* Heart separator */}
            <div className="flex items-center px-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-2xl text-[#a855f7]"
              >
                ð
              </motion.div>
            </div>

            {/* College card */}
            <div className="flex-1 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">
                  {college.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-bold text-center text-white line-clamp-1">{college.name}</p>
              <p className="text-xs text-gray-400 text-center">{college.city}</p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-30" />

          {/* Icebreaker message */}
          {icebreakerText && (
            <motion.div
              className="bg-gray-800/50 rounded-xl p-4 border border-[#a855f7] border-opacity-30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">ð¬</span>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">
                    AI Icebreaker
                  </p>
                  <p className="text-sm text-gray-100 leading-relaxed italic">"{icebreakerText}"</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            className="flex gap-3 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all active:scale-95"
            >
              View Later
            </button>
            <button
              onClick={onReply}
              className="flex-1 py-3 bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] text-white font-bold rounded-lg transition-all active:scale-95"
            >
              Reply to {college.name.split(' ')[0]}
            </button>
          </motion.div>

          {/* Secondary action */}
          <motion.button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            or continue browsing
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

'use client'

import React, { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { CollegeProfile, CollegeSignal, SwipeDirection } from '../../types'
import { computeFitScore } from '../../lib/fitScore'

interface SwipeCardProps {
  college: CollegeProfile
  fitScore: number
  signal?: CollegeSignal
  onSwipe: (direction: SwipeDirection) => void
}

export default function SwipeCard({ college, fitScore, signal, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const SWIPE_THRESHOLD = 100

    if (info.offset.x > SWIPE_THRESHOLD) {
      setExitX(500)
      onSwipe('right')
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExitX(-500)
      onSwipe('left')
    }
  }

  const isLiked = signal?.signalType === 'like'

  return (
    <motion.div
      ref={containerRef}
      drag="x"
      dragConstraints={{ left: -500, right: 500 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative w-full max-w-md h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden border border-gray-700"
    >
      {/* Background image or color */}
      {college.bannerUrl && (
        <div className="absolute inset-0 opacity-50 bg-cover bg-center" style={{ backgroundImage: `url(${college.bannerUrl})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 z-10">
        {/* Overlay text that fades in on drag */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -500, right: 500 }}
          initial={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <motion.div
            className="text-5xl font-black text-white opacity-0 drop-shadow-lg"
            animate={{ opacity: exitX > 100 ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl border-4 border-green-500">
              LIKE
            </div>
          </motion.div>

          <motion.div
            className="text-5xl font-black text-white opacity-0 drop-shadow-lg absolute"
            animate={{ opacity: exitX < -100 ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl border-4 border-red-500">
              PASS
            </div>
          </motion.div>
        </motion.div>

        {/* Top section: College info */}
        <div>
          {/* Badge for "Likes you" */}
          {isLiked && (
            <div className="inline-flex items-center gap-2 bg-[#a855f7] bg-opacity-90 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <p className="text-sm font-bold text-white">They like you!</p>
            </div>
          )}

          <h2 className="text-3xl font-bold text-white mb-1">{college.name}</h2>
          <p className="text-gray-200 text-lg mb-3">{college.city}, {college.state}</p>

          {/* DNA Badge */}
          {college.dnaType && (
            <div className="inline-block bg-[#a855f7] bg-opacity-30 border border-[#a855f7] px-3 py-1 rounded-lg mb-3">
              <p className="text-sm font-semibold text-[#a855f7]">{college.dnaType}</p>
            </div>
          )}

          {/* About text */}
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mt-3">{college.aboutShort}</p>
        </div>

        {/* Middle section: Quick stats */}
        <div className="grid grid-cols-3 gap-3 bg-black/40 rounded-lg p-3 backdrop-blur">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Fees/Year</p>
            {college.programs && college.programs.length > 0 ? (
              <p className="font-bold text-white">
                â¹{(college.programs[0].feesPerYearInr / 100000).toFixed(1)}L
              </p>
            ) : (
              <p className="font-bold text-white">N/A</p>
            )}
          </div>
          <div className="text-center border-l border-r border-gray-600">
            <p className="text-xs text-gray-400 mb-1">Placement</p>
            <p className="font-bold text-white">â¹{(college.placementAvgLpa / 1).toFixed(1)}L</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Fit Score</p>
            <p className="font-bold text-[#a855f7] text-lg">{fitScore}%</p>
          </div>
        </div>

        {/* Bottom section: Tags and actions */}
        <div className="space-y-3">
          {/* Tags/Culture */}
          <div className="flex flex-wrap gap-2">
            {college.dnaDescription && (
              <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full">
                {college.dnaDescription.split('\n')[0].substring(0, 20)}...
              </span>
            )}
            {college.hostelAvailable && (
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
                Hostel Available
              </span>
            )}
            {college.naacGrade && (
              <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full">
                NAAC {college.naacGrade}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onSwipe('left')}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all active:scale-95"
            >
              Pass
            </button>
            <button
              onClick={() => onSwipe('right')}
              className="flex-1 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-lg transition-all active:scale-95"
            >
              Like
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

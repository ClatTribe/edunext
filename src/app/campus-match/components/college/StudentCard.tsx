"use client";

import { StudentProfile, CollegeSignal, SignalType } from '../../types';
import { DNA_COLORS } from '../../lib/dnaMatch';
import { Heart, Trophy, Zap, Eye, Play, Verified } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface StudentCardProps {
  student: StudentProfile;
  fitScore: number;
  existingSignal?: CollegeSignal;
  onSignal: (type: SignalType) => void;
  ghostMode: boolean;
}

const SIGNAL_BUTTONS = [
  { type: 'like' as SignalType, icon: Heart, label: 'Like', color: 'border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10' },
  { type: 'scholarship_watch' as SignalType, icon: Trophy, label: 'Scholarship', color: 'border-amber-500 text-amber-500 hover:bg-amber-500/10' },
  { type: 'priority_interview' as SignalType, icon: Zap, label: 'Interview', color: 'border-red-500 text-red-500 hover:bg-red-500/10' },
  { type: 'under_review' as SignalType, icon: Eye, label: 'Review', color: 'border-blue-500 text-blue-500 hover:bg-blue-500/10' },
];

export function StudentCard({
  student,
  fitScore,
  existingSignal,
  onSignal,
  ghostMode,
}: StudentCardProps) {
  const [sendingSignal, setSendingSignal] = useState(false);
  const hasVideo = !!student.videoResumeUrl;
  const hasSOP = !!student.sopPolished && student.sopPolished.length > 0;
  const isVerified = hasVideo && hasSOP;

  // Extract first two sentences from SOP
  const getSopPreview = (sop: string): string => {
    const sentences = sop.split('.').slice(0, 2).join('.') + '.';
    return sentences.length > 200 ? sentences.substring(0, 200) + '...' : sentences;
  };

  const handleSignal = async (signalType: SignalType) => {
    setSendingSignal(true);
    try {
      await onSignal(signalType);
    } finally {
      setSendingSignal(false);
    }
  };

  return (
    <div className="w-full max-w-[380px] bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden hover:border-[#3a3a3a] transition-colors">
      {/* Header with avatar and name */}
      <div className="relative p-4 border-b border-[#2a2a2a]">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            {ghostMode ? (
              <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur flex items-center justify-center">
                <div className="text-xs text-[#888] text-center font-medium">
                  Ghost Profile
                </div>
              </div>
            ) : student.videoResumeUrl ? (
              <img
                src={student.videoResumeUrl}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {student.fullName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Name and location */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">
              {ghostMode ? 'Anonymous Student' : student.fullName}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-[#888]">
                {student.stream} {student.board}
              </span>
            </div>
            {!ghostMode && (
              <p className="text-xs text-[#666] mt-1">{student.city}</p>
            )}
          </div>

          {/* DNA badge top-right */}
          {student.dnaType && (
            <div
              className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${
                DNA_COLORS[student.dnaType]
              }`}
            >
              {student.dnaType}
            </div>
          )}
        </div>

        {/* Verified badge */}
        {isVerified && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[#a855f7]">
            <Verified className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* Scores row */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#0f0f0f]/50">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[#888]">Board %</span>
            <p className="text-white font-semibold">{student.boardPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-[#888]">Entrance</span>
            <p className="text-white font-semibold">{student.entranceScore || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[#888]">Fit Score</span>
            <p className={`font-semibold ${fitScore >= 80 ? 'text-[#a855f7]' : 'text-white'}`}>
              {fitScore}/100
            </p>
            {fitScore >= 80 && (
              <div className="text-[#a855f7] text-[10px] mt-0.5">â¨ High match</div>
            )}
          </div>
        </div>
      </div>

      {/* SOP Preview */}
      {student.sopPolished && (
        <div className="px-4 py-3 border-b border-[#2a2a2a] border-l-2 border-l-[#a855f7]">
          <p className="text-sm text-[#aaa] italic leading-relaxed">
            {getSopPreview(student.sopPolished)}
          </p>
        </div>
      )}

      {/* Extracurricular tags */}
      {student.extracurriculars && student.extracurriculars.length > 0 && (
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <p className="text-xs text-[#888] mb-2">Activities</p>
          <div className="flex flex-wrap gap-1">
            {student.extracurriculars.slice(0, 3).map((ec, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full bg-[#2a2a2a] text-xs text-[#aaa]"
              >
                {ec.tag}
              </span>
            ))}
            {student.extracurriculars.length > 3 && (
              <span className="px-2 py-1 rounded-full bg-[#2a2a2a] text-xs text-[#888]">
                +{student.extracurriculars.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Video resume thumbnail */}
      {student.videoResumeUrl && (
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <div className="relative group cursor-pointer">
            <div className="aspect-video bg-[#0f0f0f] rounded border border-[#2a2a2a] overflow-hidden">
              <img
                src={student.videoResumeUrl}
                alt="Video resume"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors rounded">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          {student.videoResumeTranscript && (
            <p className="text-xs text-[#666] mt-2">Video transcript available</p>
          )}
        </div>
      )}

      {/* Signal buttons grid (2x2) */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {SIGNAL_BUTTONS.map((btn) => {
            const isActive = existingSignal?.signalType === btn.type;
            const Icon = btn.icon;

            return (
              <button
                key={btn.type}
                onClick={() => handleSignal(btn.type)}
                disabled={sendingSignal}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border transition-all ${
                  isActive
                    ? `${btn.color} border-current bg-[#2a2a2a]`
                    : `${btn.color} border`
                } disabled:opacity-50`}
                title={btn.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

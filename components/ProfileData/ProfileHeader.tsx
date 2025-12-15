import React from "react"
import { Edit2, Trash2, CheckCircle } from "lucide-react"

// Color scheme matching the college compare page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


interface ProfileHeaderProps {
  userInitial: string
  hasProfile: boolean
  isEditing: boolean
  eduScore: number
  scoreInfo: { color: string; label: string }
  successMessage: string
  error: string
  onEdit: () => void
  onDelete: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userInitial,
  hasProfile,
  isEditing,
  eduScore,
  scoreInfo,
  successMessage,
  error,
  onEdit,
  onDelete,
}) => {
  return (
    <div 
      className="rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 backdrop-blur-xl"
      style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
    >
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0"
              style={{ background: accentColor }}
            >
              {userInitial}
            </div>
            {/* Title - visible on all screens */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                {hasProfile ? "My Profile" : "Create Your Profile"}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 truncate">
                {hasProfile ? "Manage your academic information" : "Tell us about yourself"}
              </p>
            </div>
          </div>
          {/* EduScore Circle - hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-col items-center flex-shrink-0">
            <div className="relative w-20 lg:w-24 h-20 lg:h-24">
              <svg className="w-20 lg:w-24 h-20 lg:h-24 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="7" fill="none" className="lg:hidden" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={scoreInfo.color}
                  strokeWidth="7"
                  fill="none"
                  strokeDasharray={`${(eduScore / 90) * 213.6} 213.6`}
                  strokeLinecap="round"
                  className="transition-all duration-500 lg:hidden"
                />
                <circle cx="48" cy="48" r="40" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="8" fill="none" className="hidden lg:block" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={scoreInfo.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(eduScore / 90) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-500 hidden lg:block"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl lg:text-2xl font-bold" style={{ color: scoreInfo.color }}>
                  {eduScore}
                </span>
                <span className="text-xs text-slate-500">/ 90</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-slate-400">EduScore</div>
              <div className="text-xs" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </div>
            </div>
          </div>
        </div>
        
        {/* EduScore for mobile - shown below header */}
        <div className="flex md:hidden justify-center">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={scoreInfo.color}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(eduScore / 90) * 175.8} 175.8`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold" style={{ color: scoreInfo.color }}>
                  {eduScore}
                </span>
                <span className="text-xs text-slate-500">/ 90</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-400">EduScore</div>
              <div className="text-sm" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        {hasProfile && !isEditing && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base hover:opacity-90"
              style={{ background: accentColor }}
            >
              <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              Edit Profile
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', border: `2px solid ${accentColor}` }}
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              Delete
            </button>
          </div>
        )}
      </div>
      {successMessage && (
        <div 
          className="mb-4 p-3 sm:p-4 rounded-lg flex items-center gap-2 text-sm sm:text-base backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
        >
          <CheckCircle size={18} className="flex-shrink-0 text-green-400" />
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}
      {error && (
        <div 
          className="mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ProfileHeader
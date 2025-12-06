import React from "react"
import { Edit2, Trash2, CheckCircle } from "lucide-react"

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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2f61ce] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
              {userInitial}
            </div>
            {/* Title - visible on all screens */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                {hasProfile ? "My Profile" : "Create Your Profile"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {hasProfile ? "Manage your academic information" : "Tell us about yourself"}
              </p>
            </div>
          </div>
          {/* EduScore Circle - hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-col items-center flex-shrink-0">
            <div className="relative w-20 lg:w-24 h-20 lg:h-24">
              <svg className="w-20 lg:w-24 h-20 lg:h-24 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#e5e7eb" strokeWidth="7" fill="none" className="lg:hidden" />
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
                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" className="hidden lg:block" />
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
                <span className="text-xs text-gray-500">/ 90</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-gray-600">EduScore</div>
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
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
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
                <span className="text-xs text-gray-500">/ 90</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">EduScore</div>
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
              className="flex items-center justify-center gap-2 bg-[#2f61ce] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#254da6] transition-all text-sm sm:text-base"
            >
              <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              Edit Profile
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 bg-white border-2 border-[#2f61ce] text-[#2f61ce] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#eef3fc] transition-all text-sm sm:text-base"
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              Delete
            </button>
          </div>
        )}
      </div>
      {successMessage && (
        <div className="mb-4 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2 text-sm sm:text-base">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm sm:text-base">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default ProfileHeader
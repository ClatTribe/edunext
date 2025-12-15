"use client"
import React from "react"
import DefaultLayout from "../defaultLayout" 
import {
  GraduationCap,
  Sparkles,
  MapPin,
  Trophy,
  Globe,
  Calendar,
  BookOpen,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react"

// Color scheme matching the college compare page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


// Define the data structure for type safety
interface ApplicationDeadline {
  examName: string
  registrationStarts: string
  registrationEnds: string
  admitCardDate: string
  examDate: string
  linkToApply: string
}

// Convert the provided data into a structured array
const applicationData: ApplicationDeadline[] = [
  {
    examName: "CAT",
    registrationStarts: "1st August 2025",
    registrationEnds: "20th September 2025",
    admitCardDate: "5th November 2025",
    examDate: "30th November 2025",
    linkToApply: "https://iimcat.ac.in",
  },
  {
    examName: "XAT",
    registrationStarts: "10th July 2025 (Open)",
    registrationEnds: "5th December 2025",
    admitCardDate: "25th December 2025",
    examDate: "4th January 2026",
    linkToApply: "https://xatonline.in",
  },
  {
    examName: "MAT",
    registrationStarts: "Dec 2025 (Feb MAT)",
    registrationEnds: "Jan 2026",
    admitCardDate: "Feb 2026",
    examDate: "Feb-May 2026",
    linkToApply: "https://aima.in",
  },
  {
    examName: "NMAT",
    registrationStarts: "1st August 2025 (Open)",
    registrationEnds: "18th October 2025",
    admitCardDate: "48 hrs before the exam",
    examDate: "5th Nov - 19th Dec 2025",
    linkToApply: "https://nmat.org",
  },
  {
    examName: "SNAP",
    registrationStarts: "1st August 2025 (Open)",
    registrationEnds: "20th November 2025",
    admitCardDate: "28th Nov, 8 and 15th Dec 2025",
    examDate: "6, 14 and 20 December 2025",
    linkToApply: "https://snaptest.org",
  },
  {
    examName: "MAH CET",
    registrationStarts: "January 2026",
    registrationEnds: "February 2026",
    admitCardDate: "March 2026",
    examDate: "15–16 March 2026",
    linkToApply: "https://cetcell.mahacet.org",
  },
  {
    examName: "CMAT",
    registrationStarts: "February 2026",
    registrationEnds: "March 2026",
    admitCardDate: "April 2026",
    examDate: "5 May 2026",
    linkToApply: "https://nbsa.gov.in",
  },
  {
    examName: "CUET PG",
    registrationStarts: "November 2025",
    registrationEnds: "December 2025",
    admitCardDate: "December 2025",
    examDate: "January 2026",
    linkToApply: "https://cuet.nta.nic.in",
  },
  {
    examName: "SRCC GBO",
    registrationStarts: "December 2025",
    registrationEnds: "January 2026",
    admitCardDate: "February 2026",
    examDate: "February 2026",
    linkToApply: "https://srccgbo.edu.in",
  },
]

// Component to render a single exam card
const ExamCard: React.FC<{ data: ApplicationDeadline }> = ({ data }) => {
  const isRegistrationOpen = data.registrationStarts.includes("Open")
  const isLinkAvailable = data.linkToApply && data.linkToApply !== "N/A"

  return (
    <div 
      className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all backdrop-blur-xl relative"
      style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
    >
      {/* Exam Name and Status */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-xl text-white mb-2 sm:mb-3 wrap-break-words">
            <GraduationCap size={20} className="inline mr-2" style={{ color: accentColor }} />
            {data.examName}
          </h3>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Registration Dates */}
        <div className="pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Clock size={12} className="shrink-0" />
                <span>Registration Starts</span>
              </div>
              <p className="font-semibold text-white text-xs sm:text-sm wrap-break-words">
                {data.registrationStarts || "TBA"}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Calendar size={12} className="shrink-0" />
                <span>Registration Ends</span>
              </div>
              <p className="font-semibold text-white text-xs sm:text-sm wrap-break-words">
                {data.registrationEnds || "TBA"}
              </p>
            </div>
          </div>
        </div>

        {/* Admit Card and Exam Date */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <FileText size={12} className="shrink-0" />
              <span>Admit Card Date</span>
            </div>
            <p className="font-semibold text-white text-xs sm:text-sm wrap-break-words">
              {data.admitCardDate || "TBA"}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Trophy size={12} className="shrink-0" />
              <span>Exam Date</span>
            </div>
            <p className="font-semibold text-white text-xs sm:text-sm wrap-break-words">
              {data.examDate || "TBA"}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          {isLinkAvailable ? (
            <a
              href={data.linkToApply.startsWith("http") ? data.linkToApply : `https://${data.linkToApply}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-white rounded-lg py-2 px-3 sm:px-4 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md hover:opacity-90"
              style={{ background: accentColor }}
            >
              <Globe size={14} className="sm:w-4 sm:h-4 shrink-0" />
              Visit Official Website
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </a>
          ) : (
            <button
              disabled
              className="flex-1 text-slate-500 rounded-lg py-2 px-3 sm:px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium cursor-not-allowed"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
            >
              <Sparkles size={14} className="sm:w-4 sm:h-4 shrink-0" />
              Link N/A
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main page component
const ApplicationDeadlinesPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              📅 MBA Entrance Exam Dates & Deadlines 2025-26
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Check registration dates, admit card release, and exam schedules for top MBA entrance exams.
            </p>
          </div>

          {/* Results Count */}
          <div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 rounded-lg shadow-lg p-3 sm:p-4 backdrop-blur-xl"
            style={{ backgroundColor: secondaryBg, borderLeft: `4px solid ${accentColor}` }}
          >
            <div className="flex items-center gap-2">
              <Calendar style={{ color: accentColor }} className="shrink-0" size={20} />
              <span className="font-semibold text-base sm:text-lg text-white">
                {applicationData.length} exams listed
              </span>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {applicationData.map((data, index) => (
              <ExamCard key={index} data={data} />
            ))}
          </div>

          {/* Note Section */}
          <div 
            className="mt-8 p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              borderLeft: `4px solid ${accentColor}`,
              border: `1px solid ${borderColor}`
            }}
          >
            <h3 className="font-bold text-sm sm:text-base mb-2 flex items-center gap-2" style={{ color: accentColor }}>
              <MapPin size={16} /> Important Note
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              The dates provided are based on official announcements. Please regularly check the official exam websites for the most accurate and updated information. Registration windows may vary and some dates are tentative.
            </p>
          </div>

        </div>
      </div>
    </DefaultLayout>
  )
}

export default ApplicationDeadlinesPage
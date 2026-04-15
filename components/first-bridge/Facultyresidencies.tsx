"use client"
import React from "react"

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Global Professors",
    desc: "Courses delivered by professors from partner universities.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Joint Seminars",
    desc: "Masterclasses and joint seminars on cutting-edge topics.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h.01M10 8h4M7 12h10" />
      </svg>
    ),
    title: "Industry Connect",
    desc: "Research and industry interactions with global leaders.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M12 12v4M8 20h8" />
        <path d="M9 16c0 0 1 2 3 2s3-2 3-2" />
        <circle cx="12" cy="8" r="1" fill="#10B981" />
      </svg>
    ),
    title: "Mentorship",
    desc: "Guidance for students pursuing global pathways.",
  },
]

export default function FacultyResidencies() {
  return (
    <section className="bg-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Top: label + heading + description */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16 items-start">
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#F97316]">
              World-Class Teaching
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1B3A6B] leading-tight">
              Faculty Residencies<br />
              from{" "}
              <span className="text-[#F97316]">Global Universities</span>
            </h2>
          </div>
          <div className="flex items-center lg:pt-10">
            <p className="text-gray-500 text-[15px] leading-relaxed">
              International faculty visit Firstbridge through structured residencies, bringing world-class teaching directly to campus. This ensures students experience global education without even leaving campus.
            </p>
          </div>
        </div>

        {/* Feature cards row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-gray-100 bg-white cursor-pointer
                transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-100 hover:border-gray-200"
            >
              <div className="mb-5 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center
                group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-[15px] font-black text-[#1B3A6B] mb-2 group-hover:text-[#F97316] transition-colors duration-200">
                {f.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
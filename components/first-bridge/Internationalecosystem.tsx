"use client"
import React from "react"

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "Short-term Immersions",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Visiting Faculty",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    label: "Semester Exchanges",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49" />
      </svg>
    ),
    label: "Global Markets",
  },
]

export default function InternationalEcosystem() {
  return (
    <section className="bg-[#F9FAFB] py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Image + overlay card ── */}
          <div className="relative">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
                alt="International lecture hall"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay card — bottom right */}
            <div className="absolute bottom-0 right-0 translate-x-2 translate-y-4
              bg-white rounded-2xl shadow-xl border border-gray-100 p-5 max-w-[260px]">
              <p className="font-black text-[#1B3A6B] text-[15px] mb-1">Beyond Gurgaon</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your education extends far beyond the classroom walls.
              </p>
            </div>
          </div>

          {/* ── Right: Copy + feature grid ── */}
          <div className="space-y-8 lg:pl-4">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl font-black text-[#1B3A6B] leading-tight">
                An International
              </h2>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-[#F97316]">
                Ecosystem
              </h2>
            </div>

            <p className="text-gray-500 text-[15px] leading-relaxed">
              Firstbridge's international ecosystem gives students the opportunity to experience global markets, global teaching, and global ways of thinking. From short-term immersions to semester-long exchanges and visiting faculty from leading institutions.
            </p>

            {/* 2×2 feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer
                    transition-all duration-250 hover:-translate-y-1 hover:shadow-md hover:border-orange-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0
                    group-hover:bg-orange-100 transition-colors duration-200">
                    {f.icon}
                  </div>
                  <span className="text-sm font-bold text-[#1B3A6B] group-hover:text-[#F97316] transition-colors duration-200 leading-tight">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
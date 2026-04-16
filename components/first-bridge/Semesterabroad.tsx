"use client"
import React from "react"

const CARDS = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
        <path d="M9 4v13M15 7v13" />
      </svg>
    ),
    label: "New Places",
    accent: false,
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "New Network",
    accent: false,
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    label: "New Credits",
    accent: false,
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    label: "Global Degree",
    accent: true,
  },
]

const BULLETS = [
  "Attending courses alongside international students",
  "Exposure to new teaching styles and global business culture",
  "Access to international career services and networks",
  "Building friendships and connections across continents",
]

export default function SemesterAbroad() {
  return (
    <section
      style={{ background: "#1B4DB8" }}
      className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* subtle background texture circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(-40%, 40%)" }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left ── */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-white/30 text-white/90 text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
              Exchange Term
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight">Semester</h2>
              <h2 className="text-5xl sm:text-6xl font-black leading-tight" style={{ color: "#F97316" }}>Abroad</h2>
            </div>

            {/* Description */}
            <p className="text-white/80 text-[15px] leading-relaxed max-w-md">
              Spend a term at a partner institution abroad with credit transfer. Immerse yourself fully in a new academic culture.
            </p>

            {/* Bullet list */}
            <ul className="space-y-3.5">
              {BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#F97316" }}>
                    <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-white/85 text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: 2×2 card grid ── */}
          <div className="grid grid-cols-2 gap-4">
            {CARDS.map((card, i) => (
              <div
                key={i}
                className="group relative rounded-2xl p-6 cursor-pointer transition-all duration-300"
                style={{
                  background: card.accent ? "#F97316" : "rgba(255,255,255,0.1)",
                  border: card.accent ? "none" : "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  if (card.accent) {
                    el.style.background = "#EA6C0A"
                    el.style.transform = "translateY(-6px) scale(1.02)"
                    el.style.boxShadow = "0 20px 40px rgba(249,115,22,0.4)"
                  } else {
                    el.style.background = "rgba(255,255,255,0.18)"
                    el.style.transform = "translateY(-6px) scale(1.02)"
                    el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)"
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = card.accent ? "#F97316" : "rgba(255,255,255,0.1)"
                  el.style.transform = "translateY(0) scale(1)"
                  el.style.boxShadow = "none"
                }}
              >
                <div className="mb-4 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                  {card.icon}
                </div>
                <p className="text-white font-bold text-[15px]">{card.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
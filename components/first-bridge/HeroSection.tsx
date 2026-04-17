"use client"
import React, { useState } from "react"
import { Calendar, Phone, Mail, ArrowRight, ChevronDown } from "lucide-react"
import { supabase } from "../../lib/supabase";


// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[2px]">
        {[18, 24, 30, 24, 18].map((h, i) => (
          <div
            key={i}
            className="w-[5px] rounded-sm"
            style={{
              height: h,
              background:
                i % 2 === 0
                  ? "linear-gradient(to top, #1B3A6B, #2563EB)"
                  : "linear-gradient(to top, #F97316, #FB923C)",
            }}
          />
        ))}
      </div>
      <div className="flex flex-col leading-none ml-1">
        <span className="text-[14px] font-black text-[#1B3A6B] tracking-tight uppercase">
          First Bridge
        </span>
        <span className="text-[8px] font-bold tracking-[0.18em] text-[#F97316] uppercase">
          Business School
        </span>
      </div>
    </div>
  )
}

// ─── Lead Form ────────────────────────────────────────────────────────────────


function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", program: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const programs = [
    "PGP",
    "PGP - X",
    "Online Certificate",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase
      .from("first_bridge")
      .insert({
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        program: form.program,
      })

    setLoading(false)

    if (error) {
      setError("Something went wrong. Please try again.")
      return
    }

    setSubmitted(true)
  }

  return (
    <div id="apply" className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 p-8 w-full max-w-md">
      <div className="mb-5"><Logo /></div>

      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Applications Open
      </div>

      <h2 className="text-2xl font-black text-[#1B3A6B] mb-1">Get Started Today</h2>
      <p className="text-sm text-gray-500 mb-6">Join the Class of 2027</p>

      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <p className="font-bold text-[#1B3A6B] text-lg">We'll be in touch soon!</p>
          <p className="text-sm text-gray-500 mt-1">Expect a reply within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <input
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <div className="relative">
            <select
              required
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white pr-10"
            >
              <option value="" disabled>Select Program</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-orange-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Request Information"} {!loading && <ArrowRight size={16} />}
          </button>

          <p className="text-center text-[11px] text-gray-400">
            By submitting, you agree to our{" "}
            <a href="#" className="text-[#F97316] hover:underline">Privacy Policy</a>
          </p>
        </form>
      )}
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  const contacts = [
    {
      icon: <Calendar size={18} className="text-[#F97316]" />,
      label: "Schedule a Visit",
      sub: "Book a campus tour",
    },
    {
      icon: <Phone size={18} className="text-[#F97316]" />,
      label: "+91 8299470392",
      sub: "Mon–Sat, 9AM–6PM",
    },
    {
      icon: <Mail size={18} className="text-[#F97316]" />,
      label: "edunextweb@gmail.com",
      sub: "24-hour response time",
    },
  ]

  return (
    <>
      {/* Announcement Bar (replaces full Navbar) */}
      <div className="bg-[#1B3A6B] text-white text-center text-xs sm:text-sm font-semibold py-2.5 tracking-wide">
        🎓 Applications Open for Batch 2026–28 &nbsp;|&nbsp;{" "}
        <a href="#apply" className="text-[#F97316] underline underline-offset-2 hover:opacity-80">
          Apply Now
        </a>
      </div>

      {/* Hero */}
      <section className="relative bg-[#F5F7FA] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 bg-orange-100 rounded-full opacity-50 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#F97316]">
                Start Your Journey
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B3A6B] leading-[1.08]">
                Ready to{" "}
                <span className="text-[#F97316] relative inline-block">
                  Transform
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    height="6"
                    viewBox="0 0 200 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 3 Q50 0 100 3 Q150 6 200 3"
                      stroke="#F97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.5"
                    />
                  </svg>
                </span>
                <br />
                Your Future?
              </h1>

              <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
                Take the first step towards becoming a business leader. Connect
                with our admissions team and discover how First Bridge can
                accelerate your career.
              </p>

              {/* Contact cards */}
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B3A6B] group-hover:text-[#F97316] transition-colors">
                        {c.label}
                      </p>
                      <p className="text-xs text-gray-400">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="flex justify-center lg:justify-end">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
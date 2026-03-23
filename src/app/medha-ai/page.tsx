"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Sparkles,
  ChevronRight,
  GraduationCap,
  FileCheck,
  Award,
  Zap,
  MessageCircle,
  Brain,
  RefreshCw,
} from "lucide-react";

// College matchmaking data
const COLLEGES = [
  { name: "IIT Bombay", category: "AMBITIOUS", branch: "CS" },
  { name: "NIT Trichy", category: "TARGET", branch: "ECE" },
  { name: "BITS Pilani", category: "SAFETY", branch: "DUAL DEGREE" },
];

// Application timeline data
const TIMELINE_EVENTS = [
  {
    date: "APR 15, 2024",
    title: "JEE Advanced Registration Closes",
    subtitle: "Action Required: Upload EWS Cert",
    urgent: true,
  },
  {
    date: "MAY 02, 2024",
    title: "VITEEE Slot Booking",
    subtitle: "Scheduled for Automated Alert",
    urgent: false,
  },
  {
    date: "JUN 10, 2024",
    title: "JoSAA Counseling Phase 1",
    subtitle: "",
    urgent: false,
  },
];

// Scholarships data
const SCHOLARSHIPS = [
  {
    type: "STATE MERIT",
    name: "UP State Scholarship",
    amount: "‚Çπ50,000",
    period: "/ ANNUM",
  },
  {
    type: "CORPORATE",
    name: "Reliance Foundation",
    amount: "‚Çπ2.0L",
    period: "/ FULL COURSE",
  },
];

// Next Steps data
const NEXT_STEPS = [
  {
    number: "01",
    title: "Refine Category Certificate",
    description:
      "Your OBC-NCL certificate needs renewal for the 2024-25 session. AI recommends completing this by April 10th to avoid registration delays.",
  },
  {
    number: "02",
    title: "Analyze Mock Test 4",
    description:
      "Your chemistry percentile is dragging the overall score. Focus on 'Organic Synthesis' modules in the Resource library to bridge the 15-mark gap.",
  },
  {
    number: "03",
    title: "Schedule Mentor Call",
    description:
      "Book a slot with Expert Mentor 'Dr. Sharma' to finalize your NIT priority list before the JoSAA mock allotment begins.",
  },
];

// Progress steps
const PROGRESS_STEPS = [
  { label: "JEE Registration", completed: true },
  { label: "Profile Verification", completed: true },
  { label: "Choice Filling", completed: false },
  { label: "Seat Allotment", completed: false },
];

export default function MedhaAIPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#050818" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading Medha AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/register");
    return null;
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  return (
    <div
      className="min-h-screen overflow-y-auto px-4 py-6 md:px-8 md:py-8"
      style={{ background: "#050818", color: "#f0f0f8" }}
    >
      {/* ===== WELCOME SECTION ===== */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-400 text-sm">
            Your AI journey to the top Indian engineering colleges is underway.
          </p>
        </div>
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider flex-shrink-0"
          style={{
            background: "rgba(245,158,11,0.12)",
            color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <Zap size={14} />
          AI ENGINE ACTIVE
        </div>
      </div>

      {/* ===== DOMESTIC ADMISSION NAVIGATOR ===== */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Domestic Admission Navigator
            </h2>
            <p className="text-[11px] tracking-widest text-slate-500 mt-1">
              TARGETING IIT/NIT ADMISSION
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">45%</span>
            <p className="text-[10px] tracking-widest text-slate-500">
              COMPLETE
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-2 rounded-full mb-5"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: "45%",
              background: "linear-gradient(90deg, #f59e0b, #d97706)",
            }}
          />
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-6 flex-wrap">
          {PROGRESS_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: step.completed ? "#f59e0b" : "transparent",
                  border: step.completed
                    ? "none"
                    : "1.5px solid #475569",
                }}
              >
                {step.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="#050818"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs ${
                  step.completed ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== COUNSEL & PROFILE + COLLEGE MATCHMAKING ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Counsel & Profile Card */}
        <div
          className="lg:col-span-3 rounded-xl p-6"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest mb-4"
            style={{
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#f59e0b",
            }}
          >
            AI INSIGHT
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-white mb-3">
                Counsel & Profile
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your academic trajectory aligns 92% with the top-tier NIT
                mechanical engineering programs based on recent mock trends.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)",
                  }}
                >
                  DEEP DIVE COUNSEL
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105"
                  style={{
                    background: "transparent",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  UPDATE MOCK SCORES
                </button>
              </div>
            </div>

            {/* 92% Circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "2px solid rgba(245,158,11,0.3)",
              }}
            >
              <span className="text-lg font-bold" style={{ color: "#f59e0b" }}>
                92%
              </span>
            </div>
          </div>
        </div>

        {/* College Matchmaking Card */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">
              College Matchmaking
            </h2>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <RefreshCw size={14} className="text-slate-500" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {COLLEGES.map((college, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.1)" }}
                >
                  <GraduationCap size={16} style={{ color: "#f59e0b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {college.name}
                  </p>
                  <p className="text-[10px] tracking-wider text-slate-500">
                    {college.category} &bull; {college.branch}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-600 flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== APPLICATION TRACKER + SCHOLARSHIP GUIDANCE ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Tracker */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <FileCheck size={16} className="text-white" />
            <h2 className="text-base font-bold text-white">
              Application Tracker
            </h2>
            <div
              className="w-2 h-2 rounded-full ml-auto"
              style={{ background: "#f59e0b" }}
            />
          </div>

          <div className="relative pl-4">
            {/* Timeline line */}
            <div
              className="absolute left-[7px] top-2 bottom-2 w-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            <div className="flex flex-col gap-5">
              {TIMELINE_EVENTS.map((event, i) => (
                <div key={i} className="relative pl-5">
                  <div
                    className="absolute left-[-13px] top-1.5 w-3 h-3 rounded-full"
                    style={{
                      background: event.urgent
                        ? "#f59e0b"
                        : "rgba(255,255,255,0.1)",
                      border: event.urgent
                        ? "none"
                        : "1.5px solid #475569",
                    }}
                  />
                  <p className="text-[10px] tracking-wider text-slate-500 mb-1">
                    {event.date}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: event.urgent ? "#f59e0b" : "#64748b",
                      }}
                    >
                      {event.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scholarship Guidance */}
        <div
          className="rounded-xl p-6 relative"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-white" />
            <h2 className="text-base font-bold text-white">
              Scholarship Guidance
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {SCHOLARSHIPS.map((sch, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[10px] tracking-widest font-bold mb-2"
                  style={{ color: i === 0 ? "#f59e0b" : "#94a3b8" }}
                >
                  {sch.type}
                </p>
                <p className="text-sm font-semibold text-white mb-1">
                  {sch.name}
                </p>
                <p className="text-white">
                  <span className="text-lg font-bold">{sch.amount}</span>
                  <span className="text-[10px] tracking-wider text-slate-500 ml-1">
                    {sch.period}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Chat bubble icon */}
          <div
            className="absolute right-6 top-14 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <MessageCircle size={18} style={{ color: "#f59e0b" }} />
          </div>

          <button
            className="w-full py-3 rounded-lg text-xs font-bold tracking-wider mt-2 transition-all hover:bg-white/5"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            EXPLORE 12 MORE MATCHES
          </button>
        </div>
      </div>

      {/* ===== NEXT STEPS BY EDUNEXT AI ===== */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "#0f172a",
          border: "1px solid rgba(245,158,11,0.15)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.12)" }}
          >
            <Sparkles size={16} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Next Steps by EduNext AI
            </h2>
            <p className="text-xs text-slate-500">
              Personalized roadmap based on your profile completion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {NEXT_STEPS.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="text-2xl font-bold flex-shrink-0"
                style={{ color: "rgba(245,158,11,0.3)" }}
              >
                {step.number}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between mt-6 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] text-slate-600 italic">
            AI Advice updated 2 hours ago based on your latest activity.
          </p>
          <button
            className="px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105"
            style={{ background: "#f59e0b", color: "#050818" }}
          >
            EXECUTE AI ROADMAP
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Download,
  CalendarDays,
  BarChart3,
  Target,
} from "lucide-react";

const PURPLE = "#823588";
const YELLOW = "#F4B400";

const examDate = new Date("May 4, 2026 09:00:00");

export default function HourglassSystemPage() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [activePhase, setActivePhase] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    if (month <= 2) setActivePhase(0);
    else if (month === 3) setActivePhase(1);
    else if (month === 4) setActivePhase(2);
    else setActivePhase(3);
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 px-4">
      <div className="max-w-5xl mx-auto pt-10 pb-24">
        {/* Header */}
        <header className="text-center mb-16">
          <span
            className="inline-block px-5 py-2 rounded-full text-white text-sm font-semibold shadow"
            style={{ backgroundColor: PURPLE }}
          >
            IPMAT 2026 COUNTDOWN SYSTEM
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mt-6"
            style={{ color: PURPLE }}
          >
            The Hourglass System
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mt-4">
            AIR 1&apos;s 4-Month Countdown Planner for IPMAT 2026
          </p>
        </header>

        {/* Countdown */}
        <section
          className="rounded-3xl p-10 text-center mb-16 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${PURPLE}, #5a1b61)`,
            color: "white",
          }}
        >
          <p className="opacity-90 mb-6">Countdown to IPMAT 2026</p>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            <TimerBlock label="Days" value={timeLeft.days} />
            <TimerBlock label="Hours" value={timeLeft.hours} />
            <TimerBlock label="Minutes" value={timeLeft.minutes} />
            <TimerBlock label="Seconds" value={timeLeft.seconds} />
          </div>

          <p className="font-semibold text-yellow-300">
            May 4, 2026 • Saturday
          </p>
        </section>

        {/* Hero */}
        <section className="bg-white border-2 border-purple-200 rounded-3xl p-10 mb-16 shadow">
          <h2 className="text-3xl font-bold mb-4" style={{ color: PURPLE }}>
            4-Month Sprint to Success
          </h2>
          <p className="text-gray-600 max-w-xl mb-6">
            AIR 1&apos;s exact preparation timeline compressed for IPMAT 2026.
          </p>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold shadow-lg hover:scale-105 transition"
            style={{ backgroundColor: PURPLE }}
          >
            <Download />
            {downloading ? "Preparing..." : "Download Excel Template"}
          </button>
        </section>

        {/* Timeline */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 relative">
          <div className="absolute md:top-1/2 md:left-0 md:right-0 md:h-1 bg-purple-200 hidden md:block" />

          {["Foundation", "Advanced", "Mock Analysis", "Final Revision"].map(
            (label, index) => (
              <div
                key={index}
                className="text-center cursor-pointer z-10"
                onClick={() => {
                  setActivePhase(index);
                  document
                    .getElementById(`phase-${index}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 transition ${
                    activePhase === index
                      ? "scale-110"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      activePhase === index ? YELLOW : "white",
                    border: "4px solid",
                    borderColor:
                      activePhase === index ? YELLOW : "#e9d5ff",
                  }}
                >
                  {index + 1}
                </div>
                <p className="font-semibold" style={{ color: PURPLE }}>
                  {label}
                </p>
              </div>
            )
          )}
        </section>

        {/* Phases */}
        <div className="space-y-10">
          {phases.map((phase, i) => (
            <div
              key={i}
              id={`phase-${i}`}
              className={`rounded-2xl border-2 p-8 transition ${
                phase.critical
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-purple-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3
                  className="text-2xl font-bold"
                  style={{ color: phase.critical ? "#b45309" : PURPLE }}
                >
                  {phase.title}
                </h3>
                <span
                  className="px-4 py-1 rounded-full text-sm font-bold text-white"
                  style={{
                    backgroundColor: phase.critical ? YELLOW : PURPLE,
                  }}
                >
                  {phase.duration}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Info label="Focus Area" value={phase.focus} />
                <Info label="Weekly Hours" value={phase.hours} />
                <Info label="Key Metric" value={phase.metric} />
              </div>

              <div className="border-l-4 pl-4 italic font-semibold">
                “{phase.milestone}”
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <footer className="text-center mt-24 pt-16 border-t">
          <h3
            className="text-3xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, ${PURPLE}, ${YELLOW})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Start Your 4-Month Sprint
          </h3>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold shadow-lg hover:scale-105 transition"
            style={{ backgroundColor: PURPLE }}
          >
            <Download />
            Download 4-Month Planner
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function TimerBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 min-w-[90px]">
      <div className="text-3xl font-bold text-yellow-300">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500 font-semibold">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function getTimeLeft() {
  const now = new Date().getTime();
  const diff = examDate.getTime() - now;

  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const phases = [
  {
    title: "Phase 1: Foundation & Speed Building",
    duration: "Jan – Feb",
    focus: "Concept Mastery",
    hours: "30 hrs/week",
    metric: "Accuracy > Speed",
    milestone: "Complete Syllabus Coverage",
    critical: false,
  },
  {
    title: "Phase 2: Advanced Pattern Recognition",
    duration: "March",
    focus: "Speed + Accuracy",
    hours: "35 hrs/week",
    metric: "Pattern Recognition",
    milestone: "Solve 500+ PYQs",
    critical: false,
  },
  {
    title: "Phase 3: Mock Analysis & Speed",
    duration: "April",
    focus: "Test Simulation",
    hours: "40 hrs/week",
    metric: "Score Progression",
    milestone: "Score Plateau Broken",
    critical: true,
  },
  {
    title: "Phase 4: Final Revision & Mindset",
    duration: "May 1–3",
    focus: "Weakness Elimination",
    hours: "25 hrs/week",
    metric: "Confidence Level",
    milestone: "Exam Mindset Activated",
    critical: false,
  },
];

"use client";

import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Bell,
  AlertCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import CollegeBellButton from "../CollegeBellButton";
import { FORMS_BY_TAB, ExamTab, type ExamFormEntry } from "./constants";
import { createClient } from "@supabase/supabase-js";

/* ─── TYPES ─── */
interface FormsPageClientProps {
  examTab: ExamTab;
  examLabel: string;
}
interface BellNotificationProps {
  examLabel: string;
  examTab: ExamTab;
  forms: ExamFormEntry[];
}

/* ─── HELPERS ─── */
function getActualStatus(form: ExamFormEntry): ExamFormEntry["status"] {
  if (form.status !== "Open") return form.status;

  if (!form.endDate) return form.status;

  const now = new Date();
  
  // Try exact date match first (e.g. "Apr 10, 2026")
  const exactDateMatch = form.endDate.match(/[a-zA-Z]{3,}\s+\d{1,2},?\s+\d{4}/);
  if (exactDateMatch) {
    const endDate = new Date(exactDateMatch[0]);
    endDate.setHours(23, 59, 59, 999); // End of the day
    if (endDate.getTime() < now.getTime()) {
      return "Closed";
    }
    return "Open";
  }

  // Try month/year match (e.g. "Mar 2026")
  const monthMatch = form.endDate.match(/[a-zA-Z]{3,}\s+\d{4}/);
  if (monthMatch) {
    const endDate = new Date(monthMatch[0]);
    // Set to the end of the month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); 
    endDate.setHours(23, 59, 59, 999);
    if (endDate.getTime() < now.getTime()) {
      return "Closed";
    }
    return "Open";
  }

  return "Open";
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* ─── COMPONENT: THE GREEN BLOOPER ─── */
const GreenBlooper: React.FC = () => (
  <>
    {/* Custom style tag to sync animations globally */}
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @keyframes sync-ping {
        0% { transform: scale(1); opacity: 0.8; }
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      .animate-sync-ping {
        animation: sync-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    `,
      }}
    />

    {/* 1. Large Ping: Anchored at corner, synced across all cards */}
    <span className="absolute -top-2 -right-2 h-20 w-20 animate-sync-ping rounded-full bg-green-500/20" />

    {/* 2. Fixed Dot */}
    <div className="absolute top-6 right-6">
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,1)] border border-green-300/50" />
    </div>
  </>
);

/* ─── COMPONENT: STATUS BADGE ─── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isOpen = status === "Open";
  const isClosed = status === "Closed";
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
        isOpen
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : isClosed
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : "bg-slate-800 text-slate-500 border-slate-700"
      }`}
    >
      {status}
    </span>
  );
};

/* ─── COMPONENT: BELL NOTIFICATION ─── */

const BellNotification: React.FC<BellNotificationProps> = ({
  examLabel,
  examTab,
  forms,
}) => {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const handleClick = async () => {
    if (state === "loading" || state === "done") return;
    setState("loading");

    try {
      // Refresh session first to ensure Google OAuth token is loaded
      await supabase.auth.refreshSession();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("[bell] session:", session?.user?.email); // debug — remove later

      const res = await fetch("/api/reminders/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id ?? null,
          examLabel,
          examTab,
          forms: forms.map((f) => ({ name: f.name, endDate: f.endDate })),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setState("done");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading" || state === "done"}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 disabled:hover:scale-100
        ${
          state === "done"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : state === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}
    >
      {state === "done" ? (
        <>
          <CheckCircle2 size={16} />
          <span className="hidden md:inline">Reminder Set</span>
        </>
      ) : state === "loading" ? (
        <>
          <Bell size={16} className="animate-pulse" />
          <span className="hidden md:inline">Saving...</span>
        </>
      ) : state === "error" ? (
        <>
          <Bell size={16} />
          <span className="hidden md:inline">Try Again</span>
        </>
      ) : (
        <>
          <Bell size={16} />
          <span className="hidden md:inline">Remind Me</span>
        </>
      )}
    </button>
  );
};

/* ─── COMPONENT: FORM CARD ─── */
const FormCard: React.FC<{ form: ExamFormEntry }> = ({ form }) => {
  const isLinkAvailable = form.link && form.link.startsWith("http");
  const isOpen = form.status === "Open";
  const isActive = isOpen || form.status === "Coming Soon";

  return (
    <div
      className="group relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 
                    transition-all duration-500 hover:border-green-500/50 hover:bg-slate-900/60 
                    hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)] overflow-hidden"
    >
      {isActive && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
      )}
      {isActive && <GreenBlooper />}

      <div className="flex flex-col h-full relative z-10">
        <div className="mb-6 pr-12">
          <h3 className="text-xl font-extrabold text-white group-hover:text-green-400 transition-colors leading-tight">
            {form.name}
          </h3>
          {form.courses && (
            <p className="text-[10px] font-black text-slate-500 mt-2 tracking-widest uppercase opacity-70">
              {form.courses}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-sm group-hover:translate-x-1 transition-transform">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" /> Registration Starts
            </span>
            <span className="text-slate-200 font-bold">
              {form.startDate || "TBA"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm group-hover:translate-x-1 transition-transform delay-75">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4" /> Last Date
            </span>
            <span className="text-red-400 font-bold underline decoration-red-400/20 underline-offset-8">
              {form.endDate || "TBA"}
            </span>
          </div>
        </div>

        {/* ========== UPDATED SECTION: Added support for subLinks ========== */}
        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={form.status} />
            <CollegeBellButton collegeName={form.name} saveType="form" />
          </div>

          {/* Check if form has subLinks (multiple course links) */}
          {form.subLinks && form.subLinks.length > 0 ? (
            <div className="flex flex-col gap-2 w-full">
              {form.subLinks.map((subLink, index) => (
                <Link
                  key={index}
                  href={subLink.url}
                  target="_blank"
                  className="text-xs font-bold flex items-center justify-between px-3 py-2 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 transition-all"
                >
                  <span>{subLink.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          ) : isLinkAvailable ? (
            <Link
              href={form.link}
              target="_blank"
              className={`text-sm font-bold flex items-center gap-1 transition-colors ${
                isOpen
                  ? "text-[#f9a01b] hover:text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isOpen ? "Official Website" : "Official Website"}{" "}
              <ExternalLink className="w-4 h-4" />
            </Link>
          ) : (
            <span className="text-xs font-bold text-slate-600 italic">
              TBA
            </span>
          )}
        </div>
        {/* ========== END OF UPDATED SECTION ========== */}
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
export default function FormsPageClient({
  examTab,
  examLabel,
}: FormsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Open" | "Coming Soon"
  >("all");

  const rawForms = FORMS_BY_TAB[examTab] || [];
  const forms = useMemo(() => {
    return rawForms.map((form) => ({
      ...form,
      status: getActualStatus(form),
    }));
  }, [rawForms]);

  const filteredForms = useMemo(() => {
    let result = forms;
    if (statusFilter !== "all") {
      result = result.filter((f: ExamFormEntry) => f.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f: ExamFormEntry) =>
          f.name.toLowerCase().includes(q) ||
          (f.courses && f.courses.toLowerCase().includes(q)),
      );
    }
    const order: Record<string, number> = {
      Open: 0,
      "Coming Soon": 1,
      Closed: 2,
    };
    return [...result].sort(
      (a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9),
    );
  }, [forms, statusFilter, searchQuery]);

  const openCount = forms.filter(
    (f: ExamFormEntry) => f.status === "Open",
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── SINGLE LINE SEARCH & HEADER SECTION ── */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-12 p-4 lg:p-3 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl border-l-4 border-l-amber-500">
        <div className="flex items-center gap-3 px-4 shrink-0 border-r border-slate-800/50 hidden lg:flex">
          <Calendar className="text-amber-500" size={20} />
          <span className="font-bold text-white text-sm whitespace-nowrap">
            {filteredForms.length} Forms
          </span>
          {openCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-tighter">
              {openCount} Open
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-slate-800 focus-within:border-amber-500/40 transition-all flex-1 w-full">
          <Search size={18} className="text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={`Search ${examLabel} forms...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 lg:flex-initial px-4 py-2.5 rounded-2xl text-sm bg-slate-900 text-white border border-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
          <BellNotification
            examLabel={examLabel}
            examTab={examTab}
            forms={forms}
          />{" "}
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      {filteredForms.length > 0 ? (
        <div className="space-y-16">
          {filteredForms.filter(f => f.status === "Open").length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">🔥 Currently Open</h2>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                  {filteredForms.filter(f => f.status === "Open").length} Forms
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredForms.filter(f => f.status === "Open").map((form, i) => (
                  <FormCard key={i} form={form} />
                ))}
              </div>
            </div>
          )}

          {filteredForms.filter(f => f.status === "Coming Soon").length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">⏳ Coming Soon</h2>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {filteredForms.filter(f => f.status === "Coming Soon").length} Forms
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredForms.filter(f => f.status === "Coming Soon").map((form, i) => (
                  <FormCard key={i} form={form} />
                ))}
              </div>
            </div>
          )}

          {filteredForms.filter(f => f.status === "Closed").length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-slate-400 tracking-tight">🔒 Past Deadlines</h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {filteredForms.filter(f => f.status === "Closed").length} Forms
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
                {filteredForms.filter(f => f.status === "Closed").map((form, i) => (
                  <FormCard key={i} form={form} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 rounded-[3rem] border border-dashed border-slate-800">
          <Filter size={48} className="mx-auto mb-4 text-slate-700" />
          <p className="text-slate-500 font-medium">No results found.</p>
        </div>
      )}

      {/* ── SEO / BLOG CONTENT SECTION ── */}
      {examTab === ExamTab.JEE && (
        <div className="mt-24 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-12 text-slate-300 leading-relaxed">
            
            {/* Header section */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                B.Tech Forms and Deadlines 2026 – <span className="text-amber-500">Everything You Need to Know</span>
              </h2>
              <p className="text-lg text-slate-400">
                Getting into a B.Tech program in India starts with one critical step: submitting the right application form before the deadline. With multiple entrance exams running on different schedules, staying on top of B.Tech forms and deadlines 2026 can make the difference between securing your seat and missing out entirely. Here's a quick guide to help you stay ahead.
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8" />

            {/* Section 1 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertCircle className="text-amber-500 w-6 h-6" /> 
                Why B.Tech Application Deadlines Matter
              </h3>
              <p>
                Every year, thousands of students lose their chance at top engineering colleges — not because of poor scores, but because they missed a registration window. Unlike college admissions in some countries, Indian engineering entrance exams have strict, non-extendable deadlines. Once a form closes, there is no second chance.
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8" />

            {/* Section 2 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="text-green-400 w-6 h-6" />
                Key B.Tech Entrance Exams and Their 2026 Registration Timelines
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-2">JEE Main 2026</h4>
                  <p className="text-sm">JEE Main is the gateway to NITs, IIITs, and Government Funded Technical Institutes (GFTIs). Conducted by the National Testing Agency (NTA), it is held in two sessions — typically January and April. Session 1 registration usually opens in November, while Session 2 registration opens around February. Students must keep an eye on the official NTA portal for exact dates.</p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-2">JEE Advanced 2026</h4>
                  <p className="text-sm">Only the top 2.5 lakh JEE Main qualifiers are eligible to register for JEE Advanced — the exam for IIT admissions. Registration opens for a very short window (usually 1–2 weeks) after JEE Main results are declared. Missing this window means waiting another full year, so this is arguably the most time-sensitive deadline on this list.</p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-2">BITSAT 2026</h4>
                  <p className="text-sm">BITSAT is conducted by BITS Pilani for admissions to its Pilani, Goa, and Hyderabad campuses. Registration typically opens in January and closes around April. Slots for the test fill up fast, so early registration is strongly advisable.</p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-2">State-Level Exams</h4>
                  <p className="text-sm">Students targeting state government engineering colleges must also track state-level entrance exam deadlines (MHT CET, KCET, WBJEE, etc.), which vary by state. These often run parallel to JEE Main, so managing multiple registrations at the same time is common.</p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8" />

            {/* Section 3 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <CheckCircle2 className="text-amber-500 w-6 h-6" />
                General Tips to Never Miss a Deadline
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p><strong className="text-white">Bookmark official portals</strong> – Always rely on official NTA, JoSAA, and exam board websites for dates.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p><strong className="text-white">Set multiple reminders</strong> – Add key dates to your phone calendar at least 2 weeks in advance.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p><strong className="text-white">Keep documents ready</strong> – Class 10 & 12 marksheets, passport photo, signature, and Aadhaar card should be scanned and saved beforehand.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p><strong className="text-white">Pay fees early</strong> – Online payment failures near deadlines are common. Don't wait for the last day.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p><strong className="text-white">Check eligibility before applying</strong> – Age limit, qualifying marks, and subject combinations differ across exams.</p>
                </li>
              </ul>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8" />

            {/* Footer section */}
            <div className="bg-gradient-to-r from-amber-500/10 to-green-500/10 p-8 rounded-3xl border border-slate-700/50 text-center space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                <Sparkles className="text-amber-400 w-6 h-6" />
                Stay Updated with EduNext
              </h3>
              <p>
                Keeping track of every exam's open/close dates, correction windows, admit card releases, and result dates is overwhelming when you're also preparing. That's exactly why we've built the B.Tech Forms and Deadlines 2026 tracker on this page — so you get all critical dates for JEE Main, JEE Advanced, BITSAT, and more in one place, updated in real time.
              </p>
              <p className="font-bold text-white mt-4">
                Bookmark this page and check back regularly so you never miss a single deadline on your road to a B.Tech seat in 2026.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
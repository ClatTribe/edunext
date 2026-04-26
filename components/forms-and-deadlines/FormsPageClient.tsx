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
function isUpcoming(form: ExamFormEntry): boolean {
  if (form.status === "Closed") return false;
  const now = new Date();
  const parsed = new Date(form.endDate);
  if (!isNaN(parsed.getTime())) {
    const diff = parsed.getTime() - now.getTime();
    return diff / (1000 * 60 * 60 * 24) <= 15;
  }
  return form.status === "Open";
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

  return (
    <div
      className="group relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 
                    transition-all duration-500 hover:border-green-500/50 hover:bg-slate-900/60 
                    hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)] overflow-hidden"
    >
      {isOpen && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
      )}
      {isOpen && <GreenBlooper />}

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

  const forms = FORMS_BY_TAB[examTab] || [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredForms.map((form, i) => (
            <FormCard key={i} form={form} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-[3rem] border border-dashed border-slate-800">
          <Filter size={48} className="mx-auto mb-4 text-slate-700" />
          <p className="text-slate-500 font-medium">No results found.</p>
        </div>
      )}
    </div>
  );
}
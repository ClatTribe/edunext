"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Globe,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Bell,
} from "lucide-react";
import CollegeBellButton from "../CollegeBellButton";
import {
  FORMS_BY_TAB,
  ExamTab,
  type ExamFormEntry,
} from "./constants";

// ─── Design tokens ──────────────────────────────────────────────────────
const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";
const greenAccent = "#22c55e";

// ─── Helpers ────────────────────────────────────────────────────────────

function isUpcoming(form: ExamFormEntry): boolean {
  if (form.status === "Closed") return false;
  const now = new Date();
  const parsed = new Date(form.endDate);
  if (!isNaN(parsed.getTime())) {
    const diff = parsed.getTime() - now.getTime();
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 15;
  }
  return form.status === "Open";
}

// ─── Status badge ───────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; upcoming: boolean }> = ({
  status,
  upcoming,
}) => {
  const isOpen = status === "Open";
  const isClosed = status === "Closed";
  return (
    <span className="relative flex items-center gap-1.5">
      {(upcoming || isOpen) && !isClosed && (
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: greenAccent }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: greenAccent }}
          />
        </span>
      )}
      <span
        className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
        style={{
          backgroundColor: isOpen
            ? "rgba(34,197,94,0.15)"
            : isClosed
            ? "rgba(239,68,68,0.15)"
            : "rgba(245,158,11,0.15)",
          color: isOpen ? greenAccent : isClosed ? "#ef4444" : accentColor,
        }}
      >
        {status}
      </span>
    </span>
  );
};

// ─── Bell popup (notification subscription) ─────────────────────────────

const BellNotification: React.FC<{ examLabel: string }> = ({ examLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.25)",
          color: accentColor,
        }}
        title="Get deadline reminders"
      >
        <Bell size={16} />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Remind Me
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl p-5 shadow-2xl"
            style={{
              backgroundColor: secondaryBg,
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
                  <Sparkles size={20} style={{ color: greenAccent }} />
                </div>
                <p className="text-white font-semibold text-sm">You are all set!</p>
                <p className="text-slate-400 text-xs mt-1">
                  We will remind you before {examLabel} deadlines.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={16} style={{ color: accentColor }} />
                  <h4 className="text-white font-bold text-sm">
                    Get {examLabel} Deadline Alerts
                  </h4>
                </div>
                <p className="text-slate-400 text-xs mb-4">
                  Never miss a registration deadline. We will send you a reminder before forms close.
                </p>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none mb-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: accentColor, color: "#000" }}
                >
                  Set Reminder
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Single form card ───────────────────────────────────────────────────

const FormCard: React.FC<{ form: ExamFormEntry }> = ({ form }) => {
  const upcoming = isUpcoming(form);
  const isLinkAvailable = form.link && form.link.startsWith("http");

  return (
    <div
      className="relative rounded-xl p-5 hover:shadow-xl transition-all duration-300 backdrop-blur-xl group"
      style={{
        backgroundColor: secondaryBg,
        border: `1px solid ${upcoming ? greenAccent + "55" : borderColor}`,
      }}
    >
      {upcoming && (
        <div
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ backgroundColor: greenAccent }}
        />
      )}

      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors">
            {form.name}
          </h3>
          {form.courses && (
            <p className="text-xs text-slate-400 mt-1">{form.courses}</p>
          )}
        </div>
        <CollegeBellButton collegeName={form.name} saveType="form" />
        <StatusBadge status={form.status} upcoming={upcoming} />
      </div>

      <div
        className="grid grid-cols-2 gap-4 pt-3"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <Clock size={12} className="shrink-0" />
            <span>Registration Opens</span>
          </div>
          <p className="font-semibold text-white text-xs sm:text-sm">
            {form.startDate || "TBA"}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <Calendar size={12} className="shrink-0" />
            <span>Deadline</span>
          </div>
          <p className="font-semibold text-white text-xs sm:text-sm">
            {form.endDate || "TBA"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {isLinkAvailable ? (
          <a
            href={form.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-black rounded-lg py-2.5 px-4 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:opacity-90 hover:shadow-lg"
            style={{ background: accentColor }}
          >
            <Globe size={14} className="shrink-0" />
            {form.status === "Open" ? "Apply Now" : "Visit Website"}
            <ArrowRight size={14} />
          </a>
        ) : (
          <button
            disabled
            className="w-full text-slate-500 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium cursor-not-allowed"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <Sparkles size={14} className="shrink-0" />
            Link Coming Soon
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main client component ──────────────────────────────────────────────

interface FormsPageClientProps {
  examTab: ExamTab;
  examLabel: string;
}

export default function FormsPageClient({ examTab, examLabel }: FormsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Open" | "Coming Soon">("all");

  const forms = FORMS_BY_TAB[examTab] || [];

  const filteredForms = useMemo(() => {
    let result = forms;
    if (statusFilter !== "all") {
      result = result.filter((f) => f.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.courses && f.courses.toLowerCase().includes(q))
      );
    }
    const order: Record<string, number> = { Open: 0, "Coming Soon": 1, Closed: 2 };
    return [...result].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [forms, statusFilter, searchQuery]);

  const openCount = forms.filter((f) => f.status === "Open").length;
  const comingSoonCount = forms.filter((f) => f.status === "Coming Soon").length;

  return (
    <div>
      {/* ── Stats bar + search + bell ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 rounded-xl shadow-lg p-4 backdrop-blur-xl"
        style={{
          backgroundColor: secondaryBg,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar style={{ color: accentColor }} className="shrink-0" size={20} />
            <span className="font-semibold text-base text-white">
              {filteredForms.length} forms
            </span>
          </div>
          {openCount > 0 && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(34,197,94,0.15)", color: greenAccent }}
            >
              {openCount} Open Now
            </span>
          )}
          {comingSoonCount > 0 && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(245,158,11,0.15)", color: accentColor }}
            >
              {comingSoonCount} Coming Soon
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 sm:flex-initial sm:w-56"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-sm placeholder-slate-500 outline-none w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "Open" | "Coming Soon")}
            className="px-3 py-2 rounded-lg text-sm text-white outline-none cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <option value="all" style={{ backgroundColor: secondaryBg }}>All Status</option>
            <option value="Open" style={{ backgroundColor: secondaryBg }}>Open</option>
            <option value="Coming Soon" style={{ backgroundColor: secondaryBg }}>Coming Soon</option>
          </select>
          <BellNotification examLabel={examLabel} />
        </div>
      </div>

      {/* ── Cards grid ── */}
      {filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredForms.map((form, i) => (
            <FormCard key={`${examTab}-${form.name}-${i}`} form={form} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl" style={{ backgroundColor: secondaryBg }}>
          <Filter size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 text-sm">
            No forms match your search. Try a different query or filter.
          </p>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div
        className="mt-8 p-4 sm:p-5 rounded-xl shadow-lg backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(99, 102, 241, 0.06)",
          borderLeft: `4px solid ${accentColor}`,
          border: `1px solid ${borderColor}`,
        }}
      >
        <h3 className="font-bold text-sm mb-1.5 flex items-center gap-2" style={{ color: accentColor }}>
          <Sparkles size={14} /> Important Note
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Dates shown are based on official announcements and past-year trends.
          Always verify on the official exam website before applying. Some dates are tentative and subject to change.
        </p>
      </div>
    </div>
  );
}
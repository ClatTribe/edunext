"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DefaultLayout from "../defaultLayout";
import {
  Cpu,
  BookOpen,
  HeartPulse,
  Briefcase,
  TrendingUp,
  Scale,
} from "lucide-react";
import { EXAM_TABS } from "../../../components/forms-and-deadlines/constants";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const borderColor = "rgba(245, 158, 11, 0.15)";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  BookOpen,
  HeartPulse,
  Briefcase,
  TrendingUp,
  Scale,
};

function resolveIcon(key: string) {
  return ICON_MAP[key] ?? BookOpen;
}

export default function FormsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <DefaultLayout>
      <div
        className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="max-w-7xl mx-auto">
          {/* ── Header ── */}
          <div className="mb-6">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              style={{ color: accentColor }}
            >
              Forms & Deadlines
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              All entrance exam forms and registration deadlines in one place.
              Never miss a deadline again.
            </p>
          </div>

          {/* ── Tab Bar (links — each is a route) ── */}
          <div className="mb-6 -mx-3 px-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {EXAM_TABS.map((tab) => {
                const href = `/forms-and-deadlines/${tab.slug}`;
                const isActive = pathname === href;
                const Icon = resolveIcon(tab.iconKey);

                return (
                  <Link
                    key={tab.id}
                    href={href}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive ? "shadow-lg scale-[1.02]" : "hover:bg-white/5"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: accentColor, color: "#000" }
                        : {
                            backgroundColor: "rgba(255,255,255,0.04)",
                            color: "#94a3b8",
                            border: `1px solid ${borderColor}`,
                          }
                    }
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Page content (jee/cuet/law renders here) ── */}
          {children}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </DefaultLayout>
  );
}
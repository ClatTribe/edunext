"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Trophy,
  Target,
  Flame,
  Sparkles,
  ChevronRight,
  IndianRupee,
  GraduationCap,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";

import type { Category } from "./data/colleges";
import { COLLEGE_COUNT } from "./data/colleges";
import { STATES } from "./data/states";
import { marksToAir, formatAir } from "./data/marks-to-air";
import { predict, type Match, type Bucket } from "./lib/predictor";
import { resolveMicrositeSlugs } from "./lib/microsite";

// ─── THEME ────────────────────────────────────────────────────────────────────
const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ValidationErrors {
  name?: string;
  phone?: string;
  category?: string;
  state?: string;
  score?: string;
}

interface FormState {
  name: string;
  phone: string;
  score: string;
  category: Category | "";
  state: string;
}

interface ResultsState {
  matches: Match[];
  userAir: number;
  marks: number;
  category: Category;
  state: string;
  name: string;
  micrositeSlugs: Map<string, string>;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "ur", label: "GEN — General / UR" },
  { value: "ews", label: "EWS — Economically Weaker Section" },
  { value: "obc", label: "OBC — Other Backward Class" },
  { value: "sc", label: "SC — Scheduled Caste" },
  { value: "st", label: "ST — Scheduled Tribe" },
];

const BUCKET_META: Record<
  Bucket,
  { label: string; tone: string; bg: string; border: string; emoji: string; sub: string }
> = {
  safe: {
    label: "Safe Bets",
    tone: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.35)",
    emoji: "🟢",
    sub: "Strong confidence — closing AIRs comfortably above your rank",
  },
  moderate: {
    label: "Moderate Calls",
    tone: "#fbbf24",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    emoji: "🟡",
    sub: "Likely calls — your AIR is close to last year's closing",
  },
  reach: {
    label: "Reach / Stretch",
    tone: "#f97316",
    bg: "rgba(249, 115, 22, 0.12)",
    border: "rgba(249, 115, 22, 0.35)",
    emoji: "🟠",
    sub: "Possible in stray rounds — slightly above last year's cutoff",
  },
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function NeetCallPredictor() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    score: "",
    category: "",
    state: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [results, setResults] = useState<ResultsState | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { count: c } = await supabase
        .from("neet_call_predictor")
        .select("id", { count: "exact", head: true });
      if (c && c > 0) setCount(200 + c);
    })();
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function validate(): boolean {
    const e: ValidationErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Enter your full name (at least 2 characters)";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!form.category) e.category = "Please select your category";
    if (!form.state) e.state = "Please select your domicile state";
    const sc = parseFloat(form.score);
    if (Number.isNaN(sc) || sc < 0 || sc > 720)
      e.score = "Enter a valid NEET score between 0 and 720";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitErr("");
    if (!validate()) return;
    setLoading(true);

    try {
      const marks = parseFloat(form.score);
      const userAir = marksToAir(marks);
      const category = form.category as Category;

      // Lead capture (soft-fail; doesn't block prediction)
      try {
        await supabase.from("neet_call_predictor").insert({
          name: form.name,
          phone: form.phone,
          category,
          score: marks,
          domicile_state: form.state,
        });
      } catch {
        /* swallow — we still want to show predictions */
      }

      const matches = predict({ userAir, category, domicileState: form.state });

      // Resolve microsite slugs in parallel with rendering
      const names = matches.map((m) => m.college.name);
      const micrositeSlugs = await resolveMicrositeSlugs(names);

      setResults({
        matches,
        userAir,
        marks,
        category,
        state: form.state,
        name: form.name,
        micrositeSlugs,
      });

      setTimeout(() => {
        document.getElementById("neet-results")?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } catch (err) {
      console.error(err);
      setSubmitErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setResults(null);
    setForm({
      name: "",
      phone: "",
      score: "",
      category: "",
      state: "",
    });
    setErrors({});
  }

  if (results) {
    return (
      <DefaultLayout>
        <ResultsView results={results} onReset={resetAll} />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <FormView
        form={form}
        errors={errors}
        loading={loading}
        submitErr={submitErr}
        count={count}
        updateField={updateField}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}

// ─── FORM VIEW ────────────────────────────────────────────────────────────────
function FormView({
  form,
  errors,
  loading,
  submitErr,
  count,
  updateField,
  onSubmit,
}: {
  form: FormState;
  errors: ValidationErrors;
  loading: boolean;
  submitErr: string;
  count: number;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: primaryBg }}>
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slide-up { animation: slide-up 0.2s ease-out; }
      `}</style>

      <div className="pt-12 sm:pt-16 md:pt-20 pb-12 px-4">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              color: accentColor,
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            Free Tool · {count > 0 ? `${count}+ students` : `${COLLEGE_COUNT}+ MBBS colleges`}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-4 leading-tight px-2">
            NEET{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-orange-500 to-[#B45309]">
              Call Predictor
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Enter your NEET marks, category and domicile state — we'll match you against
            <span className="font-bold text-white"> {COLLEGE_COUNT}+ MBBS colleges</span> across AIIMS, AIQ, state quota, private and deemed pools.
          </p>
        </div>

        {/* Form Card */}
        <div className="flex justify-center px-4">
          <div
            className="rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg w-full max-w-2xl"
            style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
          >
            <FormField label="Full Name" error={errors.name}>
              <input
                type="text"
                className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: `1px solid ${errors.name ? "rgba(239,68,68,0.5)" : borderColor}`,
                }}
                placeholder="Write your full name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </FormField>

            <FormField label="Mobile Number" error={errors.phone}>
              <input
                type="tel"
                maxLength={10}
                className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: `1px solid ${errors.phone ? "rgba(239,68,68,0.5)" : borderColor}`,
                }}
                placeholder="10-digit number"
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <FormField label="Category" error={errors.category}>
                <select
                  className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all appearance-none"
                  style={{
                    border: `1px solid ${errors.category ? "rgba(239,68,68,0.5)" : borderColor}`,
                  }}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value as Category | "")}
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Domicile State" error={errors.state}>
                <select
                  className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all appearance-none"
                  style={{
                    border: `1px solid ${errors.state ? "rgba(239,68,68,0.5)" : borderColor}`,
                  }}
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                >
                  <option value="">Select Domicile State</option>
                  {STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Your Expected NEET Marks (out of 720)"
              error={errors.score}
            >
              <input
                type="number"
                min={0}
                max={720}
                className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: `1px solid ${errors.score ? "rgba(239,68,68,0.5)" : borderColor}`,
                }}
                placeholder="e.g. 620"
                value={form.score}
                onChange={(e) => updateField("score", e.target.value)}
              />
              {form.score && !errors.score && (
                <p className="text-xs mt-1.5 slide-up" style={{ color: accentColor }}>
                  ✓ {form.score} marks → expected AIR ~{formatAir(marksToAir(parseFloat(form.score) || 0))}
                </p>
              )}
            </FormField>

            {submitErr && (
              <div className="p-3 rounded-lg mb-4 border bg-red-900/20 border-red-500/30 text-red-400 text-xs sm:text-sm text-center slide-up">
                ⚠️ {submitErr}
              </div>
            )}

            <div className="flex justify-center mt-2">
              <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? "Predicting..." : "🩺 Predict My Calls"}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 max-w-lg mx-auto px-4">
          Predictions use NEET 2025 closing AIRs from MCC, NTA & state authorities.
          Indicative only — actual cutoffs vary by counselling round, state quotas, and seat availability.
        </p>

        <SeoContent />
      </div>
    </div>
  );
}

// ─── SEO CONTENT (rendered below form for search indexing) ───────────────────
function SeoContent() {
  return (
    <article
      className="max-w-3xl mx-auto mt-12 sm:mt-16 px-5 sm:px-8 py-8 sm:py-10 rounded-2xl"
      style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
    >
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
        What is the{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-orange-500">
          NEET Call Predictor?
        </span>
      </h2>
      <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
        <p>
          The EduNext <strong>NEET Call Predictor</strong> is a free, data-driven
          tool that maps your expected <strong>NEET 2025 marks</strong> to a
          personalised list of MBBS colleges you can realistically expect an
          admission call from. We score your profile against closing All India
          Ranks for <strong>{COLLEGE_COUNT}+ medical colleges</strong> — every
          AIIMS, JIPMER Puducherry & Karaikal, top central institutes (MAMC, VMMC
          Safdarjung, IMS BHU, KGMU), 240+ government medical colleges, GMERS in
          Gujarat, ESIC colleges, 85+ private colleges and 50+ deemed
          universities counselled via MCC.
        </p>
        <p>
          Unlike basic score-to-college lookups, our predictor evaluates the two
          NEET counselling pools <em>separately</em> — the{" "}
          <strong>15% All India Quota (AIQ)</strong> open to every domicile, and
          the <strong>85% state quota</strong> restricted to your home state — so
          your matches reflect real seat availability under MCC and state
          counselling rules. Each result is bucketed as a{" "}
          <strong style={{ color: "#22c55e" }}>Safe Bet</strong>,{" "}
          <strong style={{ color: "#fbbf24" }}>Moderate Call</strong>, or{" "}
          <strong style={{ color: "#f97316" }}>Reach</strong> based on your AIR
          versus last year's closing AIR. Category-aware multipliers for OBC,
          EWS, SC and ST mean predictions reflect actual reservation-pool
          dynamics rather than blanket cutoffs.
        </p>
        <p>
          Predictions are indicative — final admission depends on counselling
          round, seat availability and verified state quotas. Always cross-check
          with{" "}
          <a
            href="https://mcc.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accentColor }}
            className="underline underline-offset-2 hover:opacity-80"
          >
            mcc.nic.in
          </a>{" "}
          and your state authority before locking your choice. Explore more on
          our{" "}
          <a
            href="/find-colleges"
            style={{ color: accentColor }}
            className="underline underline-offset-2 hover:opacity-80"
          >
            college finder
          </a>{" "}
          and{" "}
          <a
            href="/neet-starter-kit"
            style={{ color: accentColor }}
            className="underline underline-offset-2 hover:opacity-80"
          >
            NEET starter kit
          </a>
          .
        </p>
      </div>
    </article>
  );
}

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────
function ResultsView({
  results,
  onReset,
}: {
  results: ResultsState;
  onReset: () => void;
}) {
  const { matches, userAir, marks, category, state, name, micrositeSlugs } = results;

  const grouped = useMemo(() => {
    const g: Record<Bucket, Match[]> = { safe: [], moderate: [], reach: [] };
    for (const m of matches) g[m.bucket].push(m);
    return g;
  }, [matches]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: primaryBg }}>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .card-in { animation: slideIn 0.4s ease forwards; opacity: 0; }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12" id="neet-results">
        {/* Heading */}
        <div className="text-center mt-4 sm:mt-2 mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-orange-500 to-[#B45309]">
            NEET Call Predictor
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Based on{" "}
            <span className="font-bold" style={{ color: accentColor }}>{marks}</span> marks
            {" · "}{category.toUpperCase()}
            {" · "}{state}
          </p>
        </div>

        {/* Hero Score Card */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0F172B 0%, #080C17 100%)",
            border: "1px solid rgba(245,158,11,0.3)",
            boxShadow: "0 0 30px rgba(245,158,11,0.08)",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-80" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F59E0B] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
            <div className="sm:col-span-2 flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-[#050818] shrink-0"
                style={{ background: "linear-gradient(135deg, #F59E0B, #B45309)" }}
              >
                🩺
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                  Your Prediction
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">{name}</h2>
                <p className="text-slate-400 text-xs mt-1">
                  {marks}/720 · Expected AIR ~{formatAir(userAir)}
                </p>
              </div>
            </div>
            <ScoreStat label="Safe Bets" value={grouped.safe.length} tone="#22c55e" />
            <ScoreStat label="Moderate Calls" value={grouped.moderate.length} tone="#fbbf24" />
          </div>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
            <ScoreStat label="Reach Calls" value={grouped.reach.length} tone="#f97316" />
            <ScoreStat label="Total Matches" value={matches.length} tone={accentColor} />
            <div className="sm:col-span-2 text-xs text-slate-500 sm:text-right">
              From {COLLEGE_COUNT}+ colleges across AIIMS, AIQ, state quota, private & deemed.
            </div>
          </div>
        </div>

        {/* No matches */}
        {matches.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
          >
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-2">No colleges matched</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              At {marks} marks ({category.toUpperCase()}, {state} domicile), we couldn't find an AIQ or
              state-quota match. Consider re-attempting NEET, exploring BDS / BAMS / BHMS, or speaking
              to a counsellor about NRI / private options.
            </p>
            <button
              onClick={onReset}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              ← Try Different Marks
            </button>
          </div>
        ) : (
          <>
            {(["safe", "moderate", "reach"] as Bucket[]).map((bucket) => (
              <BucketSection
                key={bucket}
                bucket={bucket}
                matches={grouped[bucket]}
                micrositeSlugs={micrositeSlugs}
              />
            ))}

            {/* CTA cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 mb-8">
              <a
                href="https://wa.me/918299470392"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300 group border"
                style={{
                  background: "linear-gradient(135deg, #451a03, #1c0a00)",
                  borderColor: "rgba(245,158,11,0.3)",
                  boxShadow: "0 0 30px rgba(245,158,11,0.08)",
                }}
              >
                <div className="absolute inset-0 w-full h-full animate-shimmer pointer-events-none opacity-40">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                </div>
                <span className="text-4xl mb-3 relative z-10 group-hover:scale-110 transition-transform">💬</span>
                <h3 className="text-xl font-black text-white mb-1.5 relative z-10">Talk to a Counsellor</h3>
                <p className="text-orange-200/80 text-xs relative z-10">
                  Get personalised NEET guidance on WhatsApp
                </p>
                <div className="mt-3 relative z-10 flex items-center gap-1.5 text-sm font-bold group-hover:text-white transition-colors" style={{ color: accentColor }}>
                  Message Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>

              <div
                className="relative overflow-hidden p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center border"
                style={{
                  background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <span className="text-4xl mb-3">🔁</span>
                <h3 className="text-xl font-black text-white mb-1.5">Predict Again</h3>
                <p className="text-slate-400 text-xs mb-4">Try with different marks, category or state</p>
                <button
                  onClick={onReset}
                  className="px-5 py-2 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  ← Start Over
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
            >
              <p className="text-slate-500 text-xs">
                ⚠️ Predictions use NEET 2025 closing AIRs from MCC, NTA & state counselling authorities,
                with category-multiplier extrapolation where granular data is unavailable. Actual cutoffs
                vary by round and seat availability — always verify with mcc.nic.in and your state authority.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── BUCKET SECTION ───────────────────────────────────────────────────────────
function BucketSection({
  bucket,
  matches,
  micrositeSlugs,
}: {
  bucket: Bucket;
  matches: Match[];
  micrositeSlugs: Map<string, string>;
}) {
  if (matches.length === 0) return null;
  const meta = BUCKET_META[bucket];

  return (
    <div className="mb-10">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">{meta.label}</h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                backgroundColor: meta.bg,
                color: meta.tone,
                border: `1px solid ${meta.border}`,
              }}
            >
              {matches.length}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{meta.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m, idx) => (
          <CollegeTile
            key={`${m.college.name}-${idx}`}
            match={m}
            idx={idx}
            slug={micrositeSlugs.get(m.college.name)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── COLLEGE TILE ─────────────────────────────────────────────────────────────
function CollegeTile({
  match,
  idx,
  slug,
}: {
  match: Match;
  idx: number;
  slug: string | undefined;
}) {
  const router = useRouter();
  const { college, cutoffAir, pool, bucket } = match;
  const meta = BUCKET_META[bucket];
  const clickable = Boolean(slug);

  const onClick = clickable
    ? () => router.push(`/college/${slug}`)
    : undefined;

  return (
    <div
      onClick={onClick}
      className={`card-in relative overflow-hidden rounded-2xl flex flex-col transition-all duration-300 ${
        clickable ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl group" : "opacity-95"
      }`}
      style={{
        backgroundColor: secondaryBg,
        border: `1.5px solid ${clickable ? meta.border : borderColor}`,
        animationDelay: `${Math.min(idx, 12) * 50}ms`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.tone}, transparent)`, opacity: 0.7 }}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-2.5">
        {/* badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: meta.bg,
              color: meta.tone,
              border: `1px solid ${meta.border}`,
            }}
          >
            {pool === "AIQ" ? "AIQ 15%" : "State Quota"}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {college.type}
          </span>
          {clickable && (
            <span
              className="ml-auto text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(245,158,11,0.12)",
                color: accentColor,
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <Sparkles size={10} /> Microsite
            </span>
          )}
        </div>

        {/* College name */}
        <h4 className="text-white font-extrabold text-sm sm:text-base leading-tight group-hover:text-amber-300 transition-colors">
          {college.name}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin size={12} className="flex-shrink-0" style={{ color: accentColor }} />
          <span className="truncate">
            {college.city ? `${college.city}, ${college.state}` : college.state}
          </span>
        </div>

        {/* Closing AIR */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Target size={12} className="flex-shrink-0" style={{ color: meta.tone }} />
          <span>
            Closing AIR ~<span className="font-bold text-white">{formatAir(cutoffAir)}</span>
          </span>
        </div>

        {/* Fees */}
        {college.fees && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <IndianRupee size={12} className="flex-shrink-0" style={{ color: accentColor }} />
            <span className="truncate">{college.fees}</span>
          </div>
        )}

        {/* CTA strip */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: meta.bg,
              color: meta.tone,
              border: `1px solid ${meta.border}`,
            }}
          >
            <Trophy size={11} /> {meta.label.split(" ")[0]} Call
          </span>
          {clickable ? (
            <span
              className="text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              style={{ color: accentColor }}
            >
              View <ChevronRight size={12} />
            </span>
          ) : (
            <span className="text-[10px] text-slate-600">Microsite coming soon</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="block text-slate-300 font-semibold mb-2 text-sm">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">⚠️ {error}</p>}
    </div>
  );
}

function ScoreStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">
        {label}
      </p>
      <p className="text-3xl font-black" style={{ color: tone }}>{value}</p>
    </div>
  );
}

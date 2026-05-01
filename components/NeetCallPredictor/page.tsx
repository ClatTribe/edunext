"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface CollegeResult {
  name: string;
  location: string;
  type: "government" | "private";
  picture: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  gender?: string;
  score?: string;
}

// ─── COLLEGES DATA ────────────────────────────────────────────────────────────
const collegesData: Record<string, Omit<CollegeResult, "name">> = {
  "AIIMS Delhi": {
    location: "New Delhi",
    type: "government",
    picture: "/colleges/aiims-delhi.png",
  },
  "AIIMS Nagpur": {
    location: "Nagpur, Maharashtra",
    type: "government",
    picture: "/colleges/aiims-nagpur.png",
  },
  "AIIMS Bhopal": {
    location: "Bhopal, Madhya Pradesh",
    type: "government",
    picture: "/colleges/aiims-bhopal.png",
  },
  "AIIMS Jodhpur": {
    location: "Jodhpur, Rajasthan",
    type: "government",
    picture: "/colleges/aiims-jodhpur.png",
  },
  "AIIMS Rishikesh": {
    location: "Rishikesh, Uttarakhand",
    type: "government",
    picture: "/colleges/aiims-rishikesh.png",
  },
  "Maulana Azad Medical College": {
    location: "New Delhi",
    type: "government",
    picture: "/colleges/mamc.png",
  },
  "Lady Hardinge Medical College": {
    location: "New Delhi",
    type: "government",
    picture: "/colleges/lady-hardinge.png",
  },
  "King George's Medical University": {
    location: "Lucknow, Uttar Pradesh",
    type: "government",
    picture: "/colleges/kgmu.png",
  },
  "Grant Medical College": {
    location: "Mumbai, Maharashtra",
    type: "government",
    picture: "/colleges/grant-medical.png",
  },
  "Kasturba Medical College Manipal": {
    location: "Manipal, Karnataka",
    type: "private",
    picture: "/colleges/kmc-manipal.png",
  },
  "Christian Medical College Vellore": {
    location: "Vellore, Tamil Nadu",
    type: "private",
    picture: "/colleges/cmc-vellore.png",
  },
  "St. John's Medical College": {
    location: "Bangalore, Karnataka",
    type: "private",
    picture: "/colleges/stjohns.png",
  },
  "Amrita Institute of Medical Sciences": {
    location: "Kochi, Kerala",
    type: "private",
    picture: "/colleges/amrita.png",
  },
  "JSS Medical College": {
    location: "Mysuru, Karnataka",
    type: "private",
    picture: "/colleges/jss-medical.png",
  },
  "MS Ramaiah Medical College": {
    location: "Bangalore, Karnataka",
    type: "private",
    picture: "/colleges/ramaiah.png",
  },
};

// ─── CUTOFFS ─────────────────────────────────────────────────────────────────
const cutoffs: Record<string, Record<string, number>> = {
  "AIIMS Delhi": { gen: 700, ews: 685, obc: 680, sc: 650, st: 630, pwd: 650 },
  "AIIMS Nagpur": { gen: 660, ews: 640, obc: 630, sc: 600, st: 570, pwd: 600 },
  "AIIMS Bhopal": { gen: 650, ews: 630, obc: 620, sc: 590, st: 560, pwd: 590 },
  "AIIMS Jodhpur": { gen: 645, ews: 625, obc: 615, sc: 585, st: 555, pwd: 585 },
  "AIIMS Rishikesh": {
    gen: 640,
    ews: 620,
    obc: 610,
    sc: 580,
    st: 550,
    pwd: 580,
  },
  "Maulana Azad Medical College": {
    gen: 630,
    ews: 610,
    obc: 590,
    sc: 540,
    st: 510,
    pwd: 540,
  },
  "Lady Hardinge Medical College": {
    gen: 620,
    ews: 600,
    obc: 580,
    sc: 530,
    st: 500,
    pwd: 530,
  },
  "King George's Medical University": {
    gen: 600,
    ews: 580,
    obc: 560,
    sc: 510,
    st: 480,
    pwd: 510,
  },
  "Grant Medical College": {
    gen: 580,
    ews: 560,
    obc: 540,
    sc: 490,
    st: 460,
    pwd: 490,
  },
  "Kasturba Medical College Manipal": {
    gen: 560,
    ews: 540,
    obc: 520,
    sc: 470,
    st: 440,
    pwd: 470,
  },
  "Christian Medical College Vellore": {
    gen: 570,
    ews: 550,
    obc: 530,
    sc: 480,
    st: 450,
    pwd: 480,
  },
  "St. John's Medical College": {
    gen: 550,
    ews: 530,
    obc: 510,
    sc: 460,
    st: 430,
    pwd: 460,
  },
  "Amrita Institute of Medical Sciences": {
    gen: 540,
    ews: 520,
    obc: 500,
    sc: 450,
    st: 420,
    pwd: 450,
  },
  "JSS Medical College": {
    gen: 520,
    ews: 500,
    obc: 480,
    sc: 430,
    st: 400,
    pwd: 430,
  },
  "MS Ramaiah Medical College": {
    gen: 510,
    ews: 490,
    obc: 470,
    sc: 420,
    st: 390,
    pwd: 420,
  },
};

function predictColleges(score: number, category: string): string[] {
  const cat = category.toLowerCase();
  return Object.entries(cutoffs)
    .filter(([, c]) => score >= (c[cat] ?? c["gen"]))
    .map(([name]) => name);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function NeetCallPredictor() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    gender: "",
    score: "",
  });
  const [results, setResults] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [error, setError] = useState("");
  const [count, setCount] = useState<number>(0);

  const categories = [
    { value: "gen", label: "GEN — General" },
    { value: "ews", label: "EWS — Economically Weaker Section" },
    { value: "obc", label: "OBC — Other Backward Class" },
    { value: "sc", label: "SC — Scheduled Caste" },
    { value: "st", label: "ST — Scheduled Tribe" },
    { value: "pwd", label: "PWD — Person with Disability" },
  ];

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Prefer not to say" },
  ];

  useEffect(() => {
    getCount();
  }, []);

  async function getCount() {
    const { count: c } = await supabase
      .from("neet_call_predictor")
      .select("id", { count: "exact", head: true });
    if (c) setCount(200 + c);
  }

  function validate(): boolean {
    const errors: ValidationErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errors.name = "Enter your full name (at least 2 characters)";
    if (!/^[6-9]\d{9}$/.test(formData.phone))
      errors.phone = "Enter a valid 10-digit mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Enter a valid email address";
    if (!formData.category) errors.category = "Please select your category";
    if (!formData.gender) errors.gender = "Please select your gender";
    const sc = parseFloat(formData.score);
    if (isNaN(sc) || sc < 0 || sc > 720)
      errors.score = "Enter a valid NEET score between 0 and 720";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setError("");
    if (!validate()) return;
    setLoading(true);
    const score = parseFloat(formData.score);
    await supabase.from("neet_call_predictor").insert({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      category: formData.category,
      gender: formData.gender,
      score,
    });
    setResults(predictColleges(score, formData.category));
    setLoading(false);
    setTimeout(
      () =>
        document
          .getElementById("neet-results")
          ?.scrollIntoView({ behavior: "smooth" }),
      300,
    );
  }

  const updateField = (key: keyof typeof formData, value: string) => {
    setValidationErrors((prev) => ({ ...prev, [key]: "" }));
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ── RESULTS VIEW ────────────────────────────────────────────────────────────
  if (results !== null) {
    const govtColleges = results.filter(
      (n) => collegesData[n]?.type === "government",
    );
    const privateColleges = results.filter(
      (n) => collegesData[n]?.type === "private",
    );

    return (
      <DefaultLayout>
        <div
          className="min-h-screen overflow-x-hidden"
          style={{ backgroundColor: primaryBg }}
        >
          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(200%);
              }
            }
            .card-in {
              animation: slideIn 0.4s ease forwards;
              opacity: 0;
            }
            .animate-shimmer {
              animation: shimmer 2.5s infinite linear;
            }
            .animate-shimmer-delay {
              animation: shimmer 2.5s infinite linear;
              animation-delay: 1.25s;
            }
          `}</style>

          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12"
            id="neet-results"
          >
            {/* ── Page Heading ── */}
            <div className="text-center mt-4 sm:mt-2 mb-8 md:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-orange-500 to-[#B45309]">
                NEET Call Predictor
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Based on your score of{" "}
                <span className="font-bold" style={{ color: accentColor }}>
                  {formData.score}
                </span>{" "}
                ({formData.category.toUpperCase()})
              </p>
            </div>

            {/* ── Hero Score Card ── */}
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

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg border-2 border-[#050818] shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #B45309)",
                  }}
                >
                  🩺
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: accentColor }}
                  >
                    Your Prediction
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                    {formData.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    NEET Score:{" "}
                    <span
                      className="font-bold text-lg"
                      style={{ color: accentColor }}
                    >
                      {formData.score} / 720
                    </span>
                    {" · "}
                    {formData.category.toUpperCase()} · {formData.gender}
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-1"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: accentColor }}
                    >
                      Likely Calls
                    </span>
                  </div>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F59E0B] to-orange-400">
                    {results.length}
                  </p>
                  <p className="text-slate-500 text-xs">colleges matched</p>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  No colleges matched
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                  Based on your score, we couldn't find matching colleges. Don't
                  give up — consider reappearing or exploring other medical
                  streams.
                </p>
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  ← Try Again
                </button>
              </div>
            ) : (
              <>
                {/* ── Government Colleges ── */}
                {govtColleges.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">🏛️</span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white">
                        Government Colleges
                      </h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: "rgba(245,158,11,0.15)",
                          color: accentColor,
                          border: "1px solid rgba(245,158,11,0.3)",
                        }}
                      >
                        {govtColleges.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {govtColleges.map((name, idx) => (
                        <CollegeCard
                          key={name}
                          name={name}
                          idx={idx}
                          accentColor={accentColor}
                          secondaryBg={secondaryBg}
                          borderColor={borderColor}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Private Colleges ── */}
                {privateColleges.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">🏥</span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white">
                        Private Colleges
                      </h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: "rgba(245,158,11,0.12)",
                          color: "#FBBF24",
                          border: "1px solid rgba(245,158,11,0.3)",
                        }}
                      >
                        {privateColleges.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {privateColleges.map((name, idx) => (
                        <CollegeCard
                          key={name}
                          name={name}
                          idx={idx}
                          accentColor="#FBBF24"
                          secondaryBg={secondaryBg}
                          borderColor="rgba(251,191,36,0.2)"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── CTA Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <a
                    href="https://wa.me/YOUR_NUMBER"
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
                    <span className="text-4xl mb-3 relative z-10 group-hover:scale-110 transition-transform">
                      💬
                    </span>
                    <h3 className="text-xl font-black text-white mb-1.5 relative z-10">
                      Talk to a Counsellor
                    </h3>
                    <p className="text-orange-200/80 text-xs relative z-10">
                      Get personalised NEET guidance on WhatsApp
                    </p>
                    <div
                      className="mt-3 relative z-10 flex items-center gap-1.5 text-sm font-bold group-hover:text-white transition-colors"
                      style={{ color: accentColor }}
                    >
                      Message Now{" "}
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </a>

                  <div
                    className="relative overflow-hidden p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300 group border"
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
                      borderColor: "rgba(245,158,11,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 w-full h-full animate-shimmer-delay pointer-events-none opacity-40">
                      <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                    </div>
                    <span className="text-4xl mb-3 relative z-10 group-hover:scale-110 transition-transform">
                      🔁
                    </span>
                    <h3 className="text-xl font-black text-white mb-1.5 relative z-10">
                      Predict Again
                    </h3>
                    <p className="text-slate-400 text-xs mb-4 relative z-10">
                      Try with a different score or category
                    </p>
                    <button
                      onClick={() => {
                        setResults(null);
                        setFormData({
                          name: "",
                          phone: "",
                          email: "",
                          category: "",
                          gender: "",
                          score: "",
                        });
                      }}
                      className="px-5 py-2 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 relative z-10"
                      style={{ backgroundColor: accentColor }}
                    >
                      ← Start Over
                    </button>
                  </div>
                </div>

                {/* ── Disclaimer ── */}
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    backgroundColor: secondaryBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <p className="text-slate-500 text-xs">
                    ⚠️ Predictions are based on approximate 2026 cutoff data and
                    are indicative only. Actual cutoffs may vary. Always verify
                    with official NTA / college websites.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  return (
    <DefaultLayout>
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: primaryBg }}
      >
        <style jsx>{`
          @keyframes slide-up {
            from {
              transform: translateY(10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .slide-up {
            animation: slide-up 0.2s ease-out;
          }
        `}</style>

        <div className="pt-12 sm:pt-16 md:pt-20 pb-12 px-4">
          {/* ── Hero Text ── */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                color: accentColor,
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              Free Tool · {count > 0 ? `${count}+ students` : "AI Powered"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-4 leading-tight px-2">
              NEET{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-orange-500 to-[#B45309]">
                Call Predictor
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Enter your NEET score and profile to instantly find out which
              government and private medical colleges are likely to shortlist
              you.
            </p>
          </div>

          {/* ── Form Card ── */}
          <div className="flex justify-center px-4">
            <div
              className="rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg w-full max-w-2xl"
              style={{
                backgroundColor: secondaryBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <FormField label="Full Name" error={validationErrors.name}>
                <input
                  type="text"
                  className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    border: `1px solid ${validationErrors.name ? "rgba(239,68,68,0.5)" : borderColor}`,
                  }}
                  placeholder="Write your full name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <FormField label="Mobile Number" error={validationErrors.phone}>
                  <input
                    type="tel"
                    maxLength={10}
                    className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                    style={{
                      border: `1px solid ${validationErrors.phone ? "rgba(239,68,68,0.5)" : borderColor}`,
                    }}
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                  />
                </FormField>
                <FormField label="Email Address" error={validationErrors.email}>
                  <input
                    type="email"
                    className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                    style={{
                      border: `1px solid ${validationErrors.email ? "rgba(239,68,68,0.5)" : borderColor}`,
                    }}
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <FormField label="Category" error={validationErrors.category}>
                  <select
                    className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      border: `1px solid ${validationErrors.category ? "rgba(239,68,68,0.5)" : borderColor}`,
                    }}
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Gender" error={validationErrors.gender}>
                  <select
                    className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      border: `1px solid ${validationErrors.gender ? "rgba(239,68,68,0.5)" : borderColor}`,
                    }}
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    {genders.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField
                label="Your NEET Score (out of 720)"
                error={validationErrors.score}
              >
                <input
                  type="number"
                  min={0}
                  max={720}
                  className="w-full rounded-xl p-3 sm:p-4 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    border: `1px solid ${validationErrors.score ? "rgba(239,68,68,0.5)" : borderColor}`,
                  }}
                  placeholder="e.g. 620"
                  value={formData.score}
                  onChange={(e) => updateField("score", e.target.value)}
                />
                {formData.score && !validationErrors.score && (
                  <p
                    className="text-xs mt-1.5 slide-up"
                    style={{ color: accentColor }}
                  >
                    ✓ Score entered: {formData.score} / 720
                  </p>
                )}
              </FormField>

              {error && (
                <div className="p-3 rounded-lg mb-4 border bg-red-900/20 border-red-500/30 text-red-400 text-xs sm:text-sm text-center slide-up">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex justify-center mt-2">
                <button
                  onClick={handleSubmit}
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
            Predictions are based on 2026 NEET cutoff trends and are indicative
            only. Actual results depend on seat availability, state quotas, and
            official NTA cutoffs.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

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
      <label className="block text-slate-300 font-semibold mb-2 text-sm">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">⚠️ {error}</p>}
    </div>
  );
}

function CollegeCard({
  name,
  idx,
  accentColor,
  secondaryBg,
  borderColor,
}: {
  name: string;
  idx: number;
  accentColor: string;
  secondaryBg: string;
  borderColor: string;
}) {
  const c = collegesData[name];
  if (!c) return null;
  return (
    <div
      className="card-in relative overflow-hidden rounded-2xl flex flex-col hover:-translate-y-1 transition-all duration-300 group"
      style={{
        backgroundColor: secondaryBg,
        border: `1.5px solid ${borderColor}`,
        animationDelay: `${idx * 70}ms`,
      }}
    >
      <div className="relative h-36 overflow-hidden rounded-t-2xl">
        <img
          src={c.picture}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/400x150/0F172B/F59E0B?text=${encodeURIComponent(name.slice(0, 10))}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050818]/80 to-transparent" />
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(245,158,11,0.2)",
            color: "#F59E0B",
            border: "1px solid rgba(245,158,11,0.4)",
          }}
        >
          {c.type === "government" ? "Govt" : "Private"}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1">
        <p className="text-white font-bold text-sm leading-tight">{name}</p>
        <p className="text-slate-500 text-xs">📍 {c.location}</p>
        <div className="mt-auto pt-3">
          <span
            className="inline-block text-[11px] font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            Likely Call ✓
          </span>
        </div>
      </div>
    </div>
  );
}

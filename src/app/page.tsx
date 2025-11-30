"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  Target,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { CourseMatcherVisual } from "../../components/CourseMatcherVisual";
import { ScholarshipVisual } from "../../components/ScholarshipVisual";
import { AdmitFinderVisual } from "../../components/AdmitFinderVisual";
import { TrustSection } from "../../components/TrustSection";
import { PainPoints } from "../../components/PainPoints";

// BRAND COLORS
const primary = "[#fac300]";
const secondary = "#fac300"; // 10–15% yellow usage

const features = [
  {
    id: "courses",
    title: "Course Matcher",
    description:
      "Find your perfect stream based on your actual grades and interests.",
    icon: BookOpen,
    component: CourseMatcherVisual,
    cta: "Find Courses",
  },
  {
    id: "scholarships",
    title: "Scholarship Finder",
    description: "Match with thousands of financial aid opportunities instantly.",
    icon: GraduationCap,
    component: ScholarshipVisual,
    cta: "Find Scholarships",
  },
  {
    id: "admits",
    title: "Admit Finder",
    description: "See real profiles of students who got into your dream colleges.",
    icon: Target,
    component: AdmitFinderVisual,
    cta: "See Admits",
  },
];

// Navbar Component
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2 mb-2">
            <img
              src="/EduNext.svg"
              alt="EduNext Logo"
              width={32}
              height={32}
              className="h-10 w-32 object-contain"
            />
            {/* <div className="text-2xl font-bold text-[#2f61ce]">EduNext</div> */}
          </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-[#fac300] transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-sm font-medium text-slate-600 hover:text-[#fac300] transition-colors cursor-pointer"
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-sm font-medium text-slate-600 hover:text-[#fac300] transition-colors cursor-pointer"
          >
            Why Us
          </a>

          {user ? (
            <>
              <Link
                href="/home"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "#e7edff" }}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="group px-4 py-2 text-sm font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: "#d32f2f" }}
              >
                Logout <LogOut size={14} />
              </button>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: "#e7edff",
                  borderColor: "#c8d4ff",
                }}
              >
                <User size={16} style={{ color: primary }} />
                <span className="text-sm font-medium text-slate-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "#e7edff" }}
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="group px-4 py-2 text-sm font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                Get Started <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 cursor-pointer"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
          {user && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-2"
              style={{ backgroundColor: "#e7edff" }}
            >
              <User size={20} style={{ color: primary }} />
              <span className="text-sm font-medium text-slate-700">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          )}

          <a
            href="#features"
            className="text-lg font-medium text-slate-800 cursor-pointer"
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-lg font-medium text-slate-800 cursor-pointer"
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-lg font-medium text-slate-800 cursor-pointer"
          >
            Why Us
          </a>

          <hr className="border-slate-100" />

          {user ? (
            <>
              <Link
                href="/home"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "#e7edff" }}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: "#d32f2f" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "#e7edff" }}
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
    setAutoPlay(false);
  };

  const ActiveComponent = features[activeFeature].component;

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-20">
            {/* LABEL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm mb-6"
              style={{
                backgroundColor: "#fff8e5", // Soft yellow tint (part of 10–15%)
                borderColor: secondary,
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: secondary }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: secondary }}
                ></span>
              </span>

              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                New: Admit Finder 2.0 is live
              </span>

              <ArrowRight size={12} className="text-slate-400" />
            </motion.div>

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6"
            >
              Your Future. <br />
              <span style={{ color: "#2f61ce" }}>Without the Noise.</span>
            </motion.h1>

            {/* SUBTEXT */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              EduNext helps you find the right course, secure scholarships, and
              connect with alumni—all while keeping your data 100% private.
            </motion.p>

            {/* CTA BUTTON */}
            <Link href={user ? "/home" : "/register"}>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 cursor-pointer shadow-xl hover:-translate-y-1 transition-all"
                style={{ backgroundColor: "#2f61ce", color: "white" }}
              >
                {user ? "Go to Dashboard" : "Get Started for Free"}{" "}
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>

          {/* FEATURES + PREVIEW */}
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* LEFT FEATURE LIST */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(index)}
                  className={`text-left p-6 rounded-2xl transition-all duration-300 group relative overflow-hidden border cursor-pointer ${
                    activeFeature === index
                      ? "bg-white shadow-xl border-slate-200 scale-[1.02]"
                      : "bg-transparent hover:bg-slate-50 border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* YELLOW LEFT BAR */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all rounded-l-2xl"
                    style={{
                      backgroundColor:
                        activeFeature === index ? secondary : "transparent",
                      transform:
                        activeFeature === index ? "scaleY(1)" : "scaleY(0)",
                    }}
                  />

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{
                        backgroundColor:
                          activeFeature === index ? "#fff4cc" : "#f1f1f1",
                        color:
                          activeFeature === index ? primary : "rgb(90,90,90)",
                      }}
                    >
                      <feature.icon size={22} />
                    </div>

                    <h3
                      className={`font-bold text-lg ${
                        activeFeature === index
                          ? "text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed pl-1">
                    {feature.description}
                  </p>
                </button>
              ))}
            </div>

            {/* RIGHT PREVIEW */}
            <div className="lg:col-span-8 h-[480px] sm:h-[520px] lg:h-[600px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <TrustSection />
      <PainPoints />
    </>
  );
}

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
import {Features} from "../../components/Features";
import TrustSection from "../../components/TrustSection";
import { PainPoints } from "../../components/PainPoints";
import TrainRoadmap from "../../components/TrainRoadmap";
import BackgroundImage from '../../components/BackgroundImage'

// BRAND COLORS - Updated to match provided scheme
const primary = "#F59E0B"; // Indigo
const secondary = "#C77808"; // Sky Blue
const bgDark = "#050818"; // Very Dark Blue/Almost Black
// const accentColor = '#F59E0B';
// const primaryBg = '#050818'; // Very dark navy blue
// const secondaryBg = '#0F172B'; // Slightly lighter navy
// const borderColor = 'rgba(245, 158, 11, 0.15)';


const features = [
  {
    id: "courses",
    title: "Find MBA Colleges",
    description: "Find your perfect stream based on your actual grades and interests.",
    icon: BookOpen,
    component: () => <Features activeTab="courses" />,
    cta: "Find Courses",
  },
  {
    id: "scholarships",
    title: "Find Scholarships",
    description: "Match with thousands of financial aid opportunities instantly.",
    icon: GraduationCap,
    component: () => <Features activeTab="scholarships" />,
    cta: "Find Scholarships",
  },
  {
    id: "admits",
    title: "Previous Year Students",
    description: "See real profiles of students who got into your dream colleges.",
    icon: Target,
    component: () => <Features activeTab="admits" />,
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
          ? "backdrop-blur-md border-b py-3"
          : "bg-transparent py-5"
      }`}
      style={{
        backgroundColor: isScrolled || mobileMenuOpen ? "rgba(2, 6, 23, 0.9)" : "transparent",
        borderColor: isScrolled || mobileMenuOpen ? "rgba(99, 102, 241, 0.1)" : "transparent",
      }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <img
            src="/whitelogo.svg"
            alt="EduNext Logo"
            width={32}
            height={32}
            className="h-12 w-40  object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            Why Us
          </a>

          {user ? (
            <>
              <Link
                href="/home"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
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
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  borderColor: "rgba(99, 102, 241, 0.2)",
                }}
              >
                <User size={16} style={{ color: primary }} />
                <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
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
            className="p-2 cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden absolute top-full left-0 right-0 border-b p-6 flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: "rgba(2, 6, 23, 0.95)",
            borderColor: "rgba(99, 102, 241, 0.1)"
          }}
        >
          {user && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-2"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
            >
              <User size={20} style={{ color: primary }} />
              <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          )}

          <a
            href="#features"
            className="text-lg font-medium cursor-pointer"
            style={{ color: "#f8fafc" }}
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-lg font-medium cursor-pointer"
            style={{ color: "#f8fafc" }}
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-lg font-medium cursor-pointer"
            style={{ color: "#f8fafc" }}
          >
            Why Us
          </a>

          <hr style={{ borderColor: "rgba(99, 102, 241, 0.1)" }} />

          {user ? (
            <>
              <Link
                href="/home"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
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
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
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
      <BackgroundImage/>
      {/* HERO SECTION */}
      <section className=" relative pt-5 sm:pt-36 pb-20 overflow-hidden" style={{ backgroundColor: bgDark }}>
        <div className="absolute hidden sm:block inset-0 z-0 pointer-events-none opacity-20" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <div className="sm:flex hidden flex-col md:flex-row items-center gap-10 mb-12 sm:mb-20">
  {/* LEFT SIDE - Text Content */}
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="md:w-1/2 text-left"
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm mb-6"
      style={{
        backgroundColor: "rgba(14, 165, 233, 0.1)",
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
      <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "#f8fafc" }}>
        New: Admit Finder 2.0 is live
      </span>
      <ArrowRight size={12} style={{ color: "#94a3b8" }} />
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight whitespace-nowrap sm:whitespace-normal"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      Your Dream MBA College
      <br />
      <span style={{ 
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>Without the Noise.</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-base sm:text-lg md:text-xl max-w-lg leading-relaxed mb-8"
      style={{ color: "#94a3b8" }}
    >
      EduNext helps you find the right course, secure scholarships, and
      connect with alumni—all while keeping your data 100% private.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Link href={user ? "/home" : "/register"}>
        <button
          className="px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-2 cursor-pointer shadow-xl hover:-translate-y-1 transition-all"
          style={{ backgroundColor: primary, color: "white" }}
        >
          {user ? "Go to Dashboard" : "Get Started for Free"}
          <ArrowRight size={20} />
        </button>
      </Link>
    </motion.div>
  </motion.div>

  {/* RIGHT SIDE - Image */}
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="md:w-1/2 flex justify-center relative"
  >
    <div className="relative w-80 h-80 md:w-[500px] md:h-[500px]">
      {/* Decorative Frame */}
      <div
        className="absolute inset-0 border-2 rounded-2xl transform rotate-3 scale-105"
        style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
      ></div>

      <img
        src="https://res.cloudinary.com/daetdadtt/image/upload/v1765957021/en_ntufks.webp"
        alt="MBA Student Success"
        className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700"
      />
    </div>
  </motion.div>
</div>

          <TrainRoadmap />

            
          {/* LEFT FEATURE LIST */}
          {/* FEATURES + PREVIEW */}
          <div className="text-center mt-5 mb-10 relative z-10">
           <h2 className="text-4xl  md:text-5xl lg:text-6xl font-extrabold leading-tight max-w-5xl mx-auto
  bg-linear-to-r from-[#FCD34D] to-[#F59E0B]
  bg-clip-text text-transparent">
  Our features
</h2>
          </div>
           <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 flex flex-col gap-3">
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(index)}
                  className={`text-left p-6 rounded-2xl transition-all duration-300 group relative overflow-hidden border cursor-pointer ${
                    activeFeature === index
                      ? "shadow-xl scale-[1.02]"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: activeFeature === index ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.01)",
                    borderColor: activeFeature === index ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* BLUE LEFT BAR */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all rounded-l-2xl"
                    style={{
                      backgroundColor: activeFeature === index ? secondary : "transparent",
                      transform: activeFeature === index ? "scaleY(1)" : "scaleY(0)",
                    }}
                  />

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{
                        backgroundColor: activeFeature === index ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.05)",
                        color: activeFeature === index ? primary : "#94a3b8",
                      }}
                    >
                      <feature.icon size={22} />
                    </div>

                    <h3
                      className="font-bold text-lg"
                      style={{
                        color: activeFeature === index ? "#f8fafc" : "#94a3b8"
                      }}
                    >
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed pl-1" style={{ color: "#64748b" }}>
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
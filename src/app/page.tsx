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
// import { supabase } from '../lib/supabase';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Features } from "../../components/Features";
import TrustSection from "../../components/TrustSection";
import { PainPoints } from "../../components/PainPoints";
import TrainRoadmap from "../../components/TrainRoadmap";
// import BackgroundImage from '../../components/BackgroundImage'
import Navbar from "../../components/Navbar";
import HeroSection from "../../components/HeroSection";
import Footer from "../../components/Footer";

const primary = "#F59E0B"; // Indigo
const secondary = "#C77808"; // Sky Blue
const bgDark = "#050818"; // Very Dark Blue/Almost Black

const features = [
  {
    id: "courses",
    title: "Find Colleges",
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

export default function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { user } = useAuth();
  const [coursesData, setCoursesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses') // Replace with your actual table name
          .select('*');

        if (error) throw error;
        setCoursesData(data || []);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    fetchCourses();
  }, []);

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
      {/* <BackgroundImage/> */}
      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-24 pb-20 overflow-hidden" style={{ backgroundColor: bgDark }}>
        <div className="absolute hidden sm:block inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        {/* Changed max-w-7xl to max-w-[1440px] and adjusted px for wider screens */}
        <div className="container mx-auto px-4 sm:px-8 relative z-10 max-w-[1440px]">
          <HeroSection courses={coursesData} />

          {/* we have to add that div content here */}
          <TrainRoadmap />

          {/* LEFT FEATURE LIST */}
          {/* FEATURES + PREVIEW */}
          <div className="text-center mt-12 mb-10 relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight max-w-5xl mx-auto
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
            <div className="lg:col-span-8 h-[480px] sm:h-[520px] lg:h-[650px] relative">
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
      <Footer />
    </>
  );
}
"use client"

import * as React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, LineChart, Shield, Bot, CheckCircle2 } from "lucide-react";

// --- Color Constants (Matching CTA) ---
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

const features = [
  {
    id: "user-management",
    title: "Multi-Center Operations",
    description: "Manage multiple branches from a single dashboard. Granular control for Center Heads, Faculty, and Staff.",
    icon: Users,
    details: ["Branch-wise analytics", "Staff attendance tracking", "Centralized fee management"],
  },
  {
    id: "teaching-experience",
    title: "Hybrid Learning Engine",
    description: "Seamlessly blend offline and online learning. Live classes, recorded lectures, and offline batch management.",
    icon: GraduationCap,
    details: ["JEE/NEET/CLAT Mock Tests", "OMR & Digital Grading", "Lecture Recording DRM"],
  },
  {
    id: "analytics",
    title: "Rank & Revenue Analytics",
    description: "Turn data into AIRs. Track performance trends to predict ranks and identify revenue leakage.",
    icon: LineChart,
    details: ["Rank prediction models", "Fee collection forecasting", "Student drop-off alerts"],
  },
  {
    id: "security",
    title: "Anti-Piracy & Content Security",
    description: "Protect your proprietary material. Advanced DRM, screen-recording prevention, and device restriction.",
    icon: Shield,
    details: ["Video encryption", "Screenshot prevention", "Device login limits"],
  },
  {
    id: "ai",
    title: "24/7 AI Doubt Solving",
    description: "Scale your doubt support without hiring more faculty. AI Tutor resolves 80% of student queries instantly.",
    icon: Bot,
    details: ["Instant doubt resolution", "Personalized quizzes", "Homework assistance"],
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
      
      {/* Background Glow (Similar to CTA) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] z-0 pointer-events-none opacity-20" 
           style={{ backgroundColor: accentColor }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full border mb-4"
            style={{ borderColor: borderColor, backgroundColor: 'rgba(245, 158, 11, 0.05)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              Platform Features
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Built for the <br />
            <span style={{ color: accentColor }}>Indian Education Ecosystem</span>
          </h2>
          <p className="text-slate-400 text-lg">
            From single-center coaching to national chains, EduNext Nexus scales with your ambition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2"
              style={{ 
                backgroundColor: 'rgba(15, 23, 43, 0.4)', 
                borderColor: borderColor 
              }}
            >
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                   style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: `1px solid ${borderColor}` }}>
                <feature.icon className="w-7 h-7" style={{ color: accentColor }} />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white">
                {feature.title}
              </h3>
              
              <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>

              <div className="space-y-3 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {feature.details.map((detail, i) => (
                  <div key={i} className="flex items-center text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 mr-3 shrink-0" style={{ color: accentColor }} />
                    {detail}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
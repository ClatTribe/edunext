"use client"

import { motion } from "framer-motion";
import { Brain, Users, GraduationCap, ShieldCheck, Zap } from "lucide-react";

// Color scheme matching the reference page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';

export function CentralSystem() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: `1px solid ${borderColor}` }}
          >
            <Zap className="w-4 h-4" style={{ color: accentColor }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              The Central Nervous System
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            AI-Powered <span style={{ color: accentColor }}>Intelligence Core</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Data doesn't just sit there. It flows intelligently between students, teachers, and admins, processed by our AI engine to deliver real-time insights.
          </motion.p>
        </div>

        <div className="relative w-full min-h-[600px] md:min-h-[500px] flex items-center justify-center">
          
          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0)" />
                <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
              </linearGradient>
            </defs>
            
            <motion.path
              d="M 200,150 Q 400,150 512,300" 
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="hidden md:block"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5 }}
            />
            
            <motion.path
              d="M 824,150 Q 624,150 512,300"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="hidden md:block"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5 }}
            />

            <motion.path
              d="M 512,500 Q 512,400 512,300"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="hidden md:block"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5 }}
            />
          </svg>

          {/* Data Particles - Fixed Duplicate Style Attributes */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <motion.div
              className="absolute w-2 h-2 rounded-full"
              animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 0] }}
              style={{ 
                backgroundColor: accentColor, 
                boxShadow: `0 0 10px ${accentColor}`,
                offsetPath: "path('M 200,150 Q 400,150 512,300')" 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute w-2 h-2 rounded-full"
              animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 0] }}
              style={{ 
                backgroundColor: accentColor, 
                boxShadow: `0 0 10px ${accentColor}`,
                offsetPath: "path('M 824,150 Q 624,150 512,300')" 
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            />

            <motion.div
              className="absolute w-2 h-2 rounded-full"
              animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 0] }}
              style={{ 
                backgroundColor: accentColor, 
                boxShadow: `0 0 10px ${accentColor}`,
                offsetPath: "path('M 512,500 Q 512,400 512,300')" 
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 1 }}
            />
          </div>

          {/* Central Brain Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                boxShadow: [
                  `0 0 20px rgba(245, 158, 11, 0.1)`,
                  `0 0 50px rgba(245, 158, 11, 0.4)`,
                  `0 0 20px rgba(245, 158, 11, 0.1)`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center relative backdrop-blur-xl mb-4"
              style={{ backgroundColor: secondaryBg, border: `1px solid ${accentColor}` }}
            >
              <Brain className="w-16 h-16" style={{ color: accentColor }} />
              
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] rounded-full border border-dashed"
                style={{ borderColor: borderColor }}
              />
            </motion.div>
            <div className="text-center backdrop-blur-xl px-4 py-2 rounded-xl shadow-xl z-30" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <h3 className="text-lg font-bold text-white">Nexus AI Core</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Intelligence Hub</p>
            </div>
          </div>

          {/* Nodes */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute top-[5%] md:top-[15%] left-[5%] md:left-[15%] z-20 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group mb-3 backdrop-blur-xl"
                 style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <ShieldCheck className="w-7 h-7 text-slate-400 group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <div className="text-center backdrop-blur-xl px-3 py-1 rounded-lg shadow-lg" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <h4 className="font-bold text-xs text-white">Center Ops</h4>
              <p className="text-[10px] text-slate-400">Admin Control</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute top-[5%] md:top-[15%] right-[5%] md:right-[15%] z-20 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group mb-3 backdrop-blur-xl"
                 style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <Users className="w-7 h-7 text-slate-400 group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <div className="text-center backdrop-blur-xl px-3 py-1 rounded-lg shadow-lg" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <h4 className="font-bold text-xs text-white">Faculty</h4>
              <p className="text-[10px] text-slate-400">Expert Insights</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute bottom-[5%] md:bottom-[10%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          >
            <div className="text-center backdrop-blur-xl px-3 py-1 rounded-lg shadow-lg mb-3" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <h4 className="font-bold text-xs text-white">Aspirants</h4>
              <p className="text-[10px] text-slate-400">Personalized Learning</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group backdrop-blur-xl"
                 style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <GraduationCap className="w-7 h-7 text-slate-400 group-hover:text-[#F59E0B] transition-colors" />
            </div>
          </motion.div>

          {/* Floating Data Decorators */}
          <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[40%] left-[25%] px-3 py-1 rounded-full text-[10px] hidden md:block"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: `1px solid ${borderColor}`, color: accentColor }}
          >
            Real-time Performance
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-[40%] right-[25%] px-3 py-1 rounded-full text-[10px] hidden md:block"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: `1px solid ${borderColor}`, color: accentColor }}
          >
            Adaptive Curriculum
          </motion.div>

        </div>
      </div>
    </section>
  );
}
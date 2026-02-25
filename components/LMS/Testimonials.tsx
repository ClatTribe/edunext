"use client"

import * as React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

// --- Color Constants ---
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

const testimonials = [
  {
    id: 1,
    name: "IPMCareers",
    role: "Leading IPM Institute",
    content: "We scaled from 2 to 10 centers in a year. EduNext's hybrid management allowed us to maintain quality across all branches while automating fee collection.",
    image: "https://picsum.photos/seed/ipm/200/200",
  },
  {
    id: 2,
    name: "ClatTribe",
    role: "Premier CLAT Coaching",
    content: "The mock test engine is exactly what we needed for CLAT prep. It handles 5,000+ concurrent students seamlessly, and the rank analytics are spot on.",
    image: "https://picsum.photos/seed/clat/200/200",
  },
  {
    id: 3,
    name: "JEETribe",
    role: "Top JEE Preparation",
    content: "Content piracy was killing our revenue. EduNext's DRM and device restrictions stopped unauthorized sharing immediately. Our paid enrollments went up by 40%.",
    image: "https://picsum.photos/seed/jee/200/200",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${accentColor} 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10" 
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
              Success Stories
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Trusted by India's <br />
            <span style={{ color: accentColor }}>Top Educators</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Join the elite coaching brands already powering their growth with EduNext Nexus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 rounded-[2rem] border relative group transition-all duration-500 hover:-translate-y-2"
              style={{ 
                backgroundColor: 'rgba(15, 23, 43, 0.4)', 
                borderColor: borderColor 
              }}
            >
              {/* Decorative Quote Icon */}
              <Quote className="absolute top-8 right-8 w-10 h-10 opacity-10 transition-opacity group-hover:opacity-20" 
                     style={{ color: accentColor }} />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" 
                       style={{ backgroundColor: accentColor }} />
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full border-2 relative z-10 object-cover"
                    style={{ borderColor: borderColor }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <p className="text-slate-300 italic leading-relaxed text-lg relative z-10">
                "{testimonial.content}"
              </p>

              {/* Bottom Accent Line */}
              <div className="mt-8 h-1 w-0 group-hover:w-16 transition-all duration-500 rounded-full" 
                   style={{ backgroundColor: accentColor }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
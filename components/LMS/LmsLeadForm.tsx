"use client"

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { supabase } from "../../lib/supabase";

// --- Utility Logic ---
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Style Constants ---
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const borderColor = 'rgba(245, 158, 11, 0.15)';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-black",
        outline: "border text-white hover:bg-white/5",
      },
      size: {
        default: "h-12 px-6 py-2",
        lg: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export default function LmsLeadForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    phone_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("lms_enquiry")
      .insert([formData]);

    if (!error) {
      setSubmitted(true);
      setFormData({ student_name: "", email: "", phone_number: "" });
    } else {
      console.error("Supabase Error:", error);
      alert("Submission failed. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <section id="enquiry" className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* FORM SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 p-8 md:p-12 rounded-[2.5rem] border backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(15, 23, 43, 0.4)', borderColor: borderColor }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-2">Book a Demo</h3>
                <p className="text-slate-400 mb-8">Fill in your details and our team will get back to you.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Student Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border rounded-xl px-4 py-4 text-white focus:outline-none transition-all mt-2 focus:border-amber-500/50"
                      style={{ borderColor: borderColor }}
                      placeholder="Your Name"
                      value={formData.student_name}
                      onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-white/5 border rounded-xl px-4 py-4 text-white focus:outline-none transition-all mt-2 focus:border-amber-500/50"
                      style={{ borderColor: borderColor }}
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-white/5 border rounded-xl px-4 py-4 text-white focus:outline-none transition-all mt-2 focus:border-amber-500/50"
                      style={{ borderColor: borderColor }}
                      placeholder="+91 00000 00000"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className={cn(buttonVariants({ variant: "default" }), "w-full shadow-lg")}
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {loading ? "Processing..." : "Submit Enquiry"}
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Success!</h3>
                <p className="text-slate-400">Our representative will call you shortly.</p>
              </div>
            )}
          </motion.div>

          {/* TEXT SIDE */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Ready to <span style={{ color: accentColor }}>Scale?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our LMS is built specifically for the Indian coaching ecosystem. Whether you are handling 50 or 50,000 students, we provide the stability and security you need.
            </p>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-white">
                 <div className="p-2 rounded-lg bg-white/5 border border-white/10"><Phone size={20} style={{color: accentColor}}/></div>
                 <span>+91 8299470392</span>
               </div>
               {/* <div className="flex items-center gap-3 text-white">
                 <div className="p-2 rounded-lg bg-white/5 border border-white/10"><Mail size={20} style={{color: accentColor}}/></div>
                 <span>contact@edunext.com</span>
               </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
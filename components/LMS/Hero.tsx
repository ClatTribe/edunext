"use client"

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, BookOpen, ShieldCheck } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// --- 1. Inlined Utility Logic ---
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 2. Color Constants ---
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const borderColor = 'rgba(245, 158, 11, 0.15)';

// --- 3. Inlined Button Logic ---
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "text-black font-bold",
        outline: "border text-white hover:bg-white/5",
        glow: "text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// --- 4. Hero Component ---
export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden" style={{ backgroundColor: primaryBg }}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[80px] md:blur-[120px] opacity-20" 
             style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-blue-600/10 blur-[80px] md:blur-[100px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6"
                   style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: borderColor }}>
                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                  Powering IPMCareers, ClatTribe, JEETribe
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white">
                The Operating System for <br className="hidden md:block" />
                <span style={{ color: accentColor }}>High-Growth Institutes</span>
              </h1>

              <p className="text-base md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Scale from one center to one hundred. Seamlessly manage offline batches, online courses, and hybrid learning with the tech stack chosen by India's top educators.
              </p>

              {/* <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  style={{ backgroundColor: accentColor }}
                >
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  style={{ borderColor: borderColor, backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <Play className="mr-2 w-5 h-5 fill-current" style={{ color: accentColor }} /> Watch Demo
                </Button>
              </div> */}
            </motion.div>
          </div>

          {/* Responsive Dashboard Mockup */}
          <div className="flex-1 w-full relative mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-[550px] lg:max-w-none"
            >
              {/* Main Container with overflow-visible to show floating cards */}
              <div className="relative z-10 border rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-md"
                   style={{ backgroundColor: 'rgba(15, 23, 43, 0.6)', borderColor: borderColor }}>
                
                {/* Header */}
                <div className="h-10 md:h-12 border-b flex items-center px-4 md:px-6 gap-2"
                     style={{ backgroundColor: 'rgba(15, 23, 43, 0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-4 md:p-8 grid grid-cols-12 gap-4 md:gap-8">
                  {/* Sidebar (Hidden on very small screens) */}
                  <div className="hidden sm:block col-span-3 space-y-4">
                    <div className="h-8 w-full rounded-lg border" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: borderColor }} />
                    <div className="h-3 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                  </div>
                  
                  {/* Main Display */}
                  <div className="col-span-12 sm:col-span-9 space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="h-6 md:h-8 w-1/3 bg-white/10 rounded-lg" />
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shadow-lg"
                           style={{ backgroundColor: accentColor }}>
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-black" />
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      {['JEE', 'NEET', 'Rev'].map((label, i) => (
                        <div key={i} className="bg-white/5 p-2 md:p-4 rounded-xl border border-white/5">
                          <div className="h-4 w-8 md:w-12 bg-white/10 rounded mb-2" />
                          <div className="h-2 w-10 md:w-16 bg-white/5 rounded" />
                        </div>
                      ))}
                    </div>

                    {/* Bars - Hidden on mobile to save space, or use fewer bars */}
                    <div className="h-24 md:h-36 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden flex items-end justify-between px-3 md:px-6 pb-4 gap-1 md:gap-2">
                      {[40, 70, 50, 90, 60, 80, 50, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: 0.8 + i * 0.05 }}
                          className="w-full rounded-t-sm md:rounded-t-md"
                          style={{ background: `linear-gradient(to top, ${accentColor}22, ${accentColor}BB)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Adjusted positioning and sizing for mobile */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-2 md:-top-8 md:-right-8 p-3 md:p-5 rounded-xl md:rounded-2xl border shadow-2xl z-20 backdrop-blur-xl scale-75 md:scale-100"
                style={{ backgroundColor: 'rgba(15, 23, 43, 0.8)', borderColor: borderColor }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-1.5 md:p-2.5 bg-green-500/20 rounded-lg md:rounded-xl">
                    <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="whitespace-nowrap">
                    <p className="text-[8px] md:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Security</p>
                    <p className="text-xs md:text-sm font-bold text-white">DRM Active</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-2 md:-bottom-8 md:-left-8 p-3 md:p-5 rounded-xl md:rounded-2xl border shadow-2xl z-20 backdrop-blur-xl scale-75 md:scale-100"
                style={{ backgroundColor: 'rgba(15, 23, 43, 0.8)', borderColor: borderColor }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-1.5 md:p-2.5 bg-blue-500/20 rounded-lg md:rounded-xl">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="whitespace-nowrap">
                    <p className="text-[8px] md:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Batches</p>
                    <p className="text-xs md:text-sm font-bold text-white">24 Active</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
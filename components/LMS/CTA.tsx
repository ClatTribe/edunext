"use client"

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// 1. Inlined Utility Logic (Replacing @/lib/utils)
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 2. Color Constants
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

// 3. Inlined Button Logic
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

// 4. Main CTA Component
export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0 opacity-50" 
        style={{ background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})` }} 
      />
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px]" 
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.07)' }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto rounded-[2.5rem] p-12 md:p-20 backdrop-blur-xl shadow-2xl"
          style={{ 
            backgroundColor: 'rgba(15, 23, 43, 0.3)', 
            border: `1px solid ${borderColor}` 
          }}
        >
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: `1px solid ${borderColor}` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              Ready to transform your institute?
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.15] text-white">
            Ready to Scale Your <br />
            <span style={{ color: accentColor }}>Coaching Empire?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join India's fastest-growing institutes. Digitize your operations, protect your content, and grow your revenue with EduNext Nexus.
          </p>
          
          {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              style={{ backgroundColor: accentColor }}
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              style={{ 
                borderColor: borderColor, 
                backgroundColor: 'rgba(255, 255, 255, 0.02)' 
              }}
            >
              Schedule Demo
            </Button>
          </div> */}
          
          <div className="mt-10 flex items-center justify-center gap-4 text-slate-500">
            <div className="h-px w-8 bg-slate-800" />
            <p className="text-sm font-medium">
              No credit card required • <span style={{ color: accentColor }}>SOC2 Certified</span>
            </p>
            <div className="h-px w-8 bg-slate-800" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
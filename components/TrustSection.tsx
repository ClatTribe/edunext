import React from 'react';
import { ShieldCheck, UserX, Database, Zap, ArrowRight, MousePointerClick } from 'lucide-react';

export default function TrustSection() {
  return (
    <section id="trust" className="py-32 relative overflow-hidden bg-slate-950">
      {/* Glow Effects */}
      <div className="absolute w-[800px] h-[800px] bg-indigo-600/20 top-[-300px] left-1/2 -translate-x-1/2 blur-[120px] rounded-full" />
      <div className="absolute w-[500px] h-[500px] bg-sky-500/10 bottom-[-100px] right-[-100px] blur-[120px] rounded-full" />
      
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Full Width Header */}
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            The New Standard
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white max-w-5xl mx-auto">
            We fixed what is broken in MBA College search.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Privacy */}
          <div 
            className="rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/10 bg-slate-900/40 backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-6">
                  Data Sovereign
                </span>
                <h3 className="text-3xl font-extrabold mb-4 text-white">Zero Spam Calls. Your Data Your Control.</h3>
                <p className="text-lg max-w-md text-slate-400">
                  We never sell your phone number. Unlike other platforms that trigger 200+ spam calls, EduNext keeps your data 100% private until you choose to share it.
                </p>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2 rounded-lg border bg-white/5 text-slate-300 border-white/10"
                >
                  <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
                  Data Protection Active
                </div>
              </div>
            </div>
            <ShieldCheck className="absolute -right-12 -bottom-12 w-96 h-96 group-hover:scale-110 transition-transform duration-700 text-emerald-500/5" />
          </div>

          {/* Card 2: Verification */}
          <div 
            className="rounded-3xl p-8 md:p-12 relative overflow-hidden group bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500"
          >
            <div className="relative z-10 h-full flex flex-col">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mb-6 w-fit">
                Verified Success
              </span>
              <h3 className="text-3xl font-extrabold mb-4 text-white">Verified Admits</h3>
              <p className="text-lg text-slate-300">We verify every admit profile via university email or acceptance letter. No fake stats.</p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 to-transparent"
            />
          </div>

          {/* Card 3: Speed */}
          <div 
            className="rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500"
          >
            <div className="relative z-10 h-full flex flex-col">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-6 w-fit">
                Financial Freedom
              </span>
              <h3 className="text-3xl font-extrabold mb-4 text-white">Scholarship For All</h3>
              <p className="text-lg text-slate-300">Tuition fees and deadlines synced daily from university portals.</p>
            </div>
          </div>

          {/* Card 4: 3 Clicks Promise */}
          <div 
            className="rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-white/10 bg-slate-900/40 backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500"
          >
            <div className="relative z-10 h-full flex flex-col">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mb-6 w-fit">
                Extreme Speed
              </span>
              <h3 className="text-3xl font-extrabold mb-4 text-white">3 Clicks Promise</h3>
              <p className="text-lg max-w-md text-slate-400">
                Get your information in 3 Clicks. No endless forms, no complicated steps. Just three simple clicks to access everything you need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
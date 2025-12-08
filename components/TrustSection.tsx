import React from 'react';
import { ShieldCheck, UserX, Database, Zap, ArrowRight, MousePointerClick } from 'lucide-react';

export default function TrustSection() {
  return (
    <section id="trust" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2f61ce' }}></span>
              The New Standard
            </div>
            <h2 
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: '#0f172a' }}
            >
              We fixed what is broken in MBA College search.
            </h2>
          </div>
          <div className="md:mb-2">
            <p className="text-lg max-w-sm" style={{ color: '#64748b' }}>
              No spam. No sold data. Just the tools you need to succeed on your own terms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto">
          {/* Card 1: Privacy */}
          <div 
            className="md:col-span-4 rounded-3xl p-8 md:p-12 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6" style={{ backgroundColor: '#FFFFFF', color: '#2f61ce' }}>
                  <UserX size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: '#0f172a' }}>Zero Spam Calls. Your Data Your Control.</h3>
                <p className="text-lg max-w-md" style={{ color: '#475569' }}>
                  We never sell your phone number. Unlike other platforms that trigger 200+ spam calls, EduNext keeps your data 100% private until you choose to share it.
                </p>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', color: '#64748b', borderColor: '#e2e8f0' }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }}></span>
                  Data Protection Active
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full pointer-events-none" 
              style={{ background: 'linear-gradient(to left, rgba(255, 255, 255, 0.5), transparent)' }} 
            />
            <ShieldCheck className="absolute -right-12 -bottom-12 w-96 h-96 group-hover:scale-110 transition-transform duration-700" style={{ color: 'rgba(226, 232, 240, 0.3)' }} />
          </div>

          {/* Card 2: Verification */}
          <div 
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
                <Database size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Verified Admits</h3>
              <p style={{ color: '#94a3b8' }}>We verify every admit profile via university email or acceptance letter. No fake stats.</p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ background: 'linear-gradient(135deg, rgba(47, 97, 206, 0.2), transparent)' }}
            />
          </div>

          {/* Card 3: Speed */}
          <div 
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#dbeafe', color: '#2f61ce' }}>
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#0f172a' }}>Scholarship For All</h3>
              <p style={{ color: '#475569' }}>Tuition fees and deadlines synced daily from university portals.</p>
            </div>
          </div>

          {/* Card 4: 3 Clicks Promise */}
          <div 
            className="md:col-span-4 rounded-3xl p-8 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6" style={{ backgroundColor: '#FFFFFF', color: '#2f61ce' }}>
                  <MousePointerClick size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: '#0f172a' }}>3 Clicks Promise</h3>
                <p className="text-lg max-w-md" style={{ color: '#475569' }}>
                  Get your information in 3 Clicks. No endless forms, no complicated steps. Just three simple clicks to access everything you need.
                </p>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full pointer-events-none" 
              style={{ background: 'linear-gradient(to left, rgba(226, 232, 240, 0.5), transparent)' }} 
            />
          </div>

          {/* Card 5: CTA */}
          <div 
            className="md:col-span-6 rounded-3xl p-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all group cursor-pointer"
            style={{ backgroundColor: '#2f61ce', boxShadow: '0 20px 25px -5px rgba(47, 97, 206, 0.2)' }}
          >
            <div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Ready to find your dream College?</h3>
              <p className="text-lg" style={{ color: '#dbeafe' }}>Join 10,000+ students who switched to EduNext today.</p>
            </div>
            <button className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 group-hover:gap-4 transition-all shadow-lg"
              style={{ backgroundColor: '#FFFFFF', color: '#2f61ce' }}
            >
              Get Started Free <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
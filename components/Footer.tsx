import React from 'react';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer
      className="pt-12 pb-10 px-6 border-t"
      style={{ borderColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: '#050818' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Tools + Resources grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* NEET Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              NEET Tools
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/neet-call-predictor"
                  className="hover:text-white transition-colors"
                >
                  NEET Call Predictor
                </Link>
              </li>
              <li>
                <Link
                  href="/neet-call-predictor"
                  className="hover:text-white transition-colors"
                >
                  NEET College Predictor
                </Link>
              </li>
              <li>
                <Link
                  href="/neet-call-predictor"
                  className="hover:text-white transition-colors"
                >
                  NEET Rank Predictor
                </Link>
              </li>
              <li>
                <Link
                  href="/neet-score-calculator"
                  className="hover:text-white transition-colors"
                >
                  NEET Score Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/neet-starter-kit"
                  className="hover:text-white transition-colors"
                >
                  NEET Starter Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Other Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Other Tools
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/jee-score-calculator"
                  className="hover:text-white transition-colors"
                >
                  JEE Score Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/xat-score-calculator-2026"
                  className="hover:text-white transition-colors"
                >
                  XAT Score Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/cat-college-predictor"
                  className="hover:text-white transition-colors"
                >
                  CAT College Predictor
                </Link>
              </li>
              <li>
                <Link
                  href="/cat-percentile-predictor"
                  className="hover:text-white transition-colors"
                >
                  CAT Percentile Predictor
                </Link>
              </li>
            </ul>
          </div>

          {/* Discovery */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Discover
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li>
                <Link href="/find-colleges" className="hover:text-white transition-colors">
                  Find Colleges
                </Link>
              </li>
              <li>
                <Link
                  href="/find-scholarships"
                  className="hover:text-white transition-colors"
                >
                  Find Scholarships
                </Link>
              </li>
              <li>
                <Link
                  href="/forms-and-deadlines/jee"
                  className="hover:text-white transition-colors"
                >
                  Forms & Deadlines
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Company
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li>
                <Link href="/blogs" className="hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <div className="flex items-center gap-2 opacity-50">
            <GraduationCap className="w-6 h-6" style={{ color: '#F59E0B' }} />
            <span className="text-lg font-bold tracking-tight text-white">EduNext</span>
          </div>

          <div className="text-xs text-slate-600">
            © 2026 EduNext Platforms. All data 100% private.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

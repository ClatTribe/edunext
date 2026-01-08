import React from 'react';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: '#050818' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2 opacity-50">
          <GraduationCap className="w-6 h-6" style={{ color: '#F59E0B' }} />
          <span className="text-lg font-bold tracking-tight text-white">EduNext</span>
        </div>

        {/* Links Section */}
        <div className="flex gap-8 text-sm text-slate-500">
          {/* <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link> */}
          {/* <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link> */}
          {/* <Link href="/about" className="hover:text-white transition-colors">
            About Us
          </Link> */}
          <Link href="/contact-us" className="hover:text-white transition-colors">
            Contact Us
          </Link>
          <Link href="/blogs" className="hover:text-white transition-colors">
            Blogs
          </Link>
        </div>

        {/* Copyright Section */}
        <div className="text-xs text-slate-600">
          © 2025 EduNext Platforms. All data 100% private.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 bg-[#2f61ce] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            EduNext
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-[#2f61ce] transition-colors"
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-sm font-medium text-slate-600 hover:text-[#2f61ce] transition-colors"
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-sm font-medium text-slate-600 hover:text-[#2f61ce] transition-colors"
          >
            Why Us
          </a>

          {/* AUTH BLOCK */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="px-4 py-2 text-sm font-medium text-[#2f61ce] bg-blue-50 hover:bg-[#fac300] rounded-full transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="group px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition flex items-center gap-1"
              >
                Logout
                <LogOut
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
                <User size={16} className="text-[#2f61ce]" />
                <span className="text-sm font-medium text-slate-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-[#2f61ce] bg-blue-50 hover:bg-[#fac300] rounded-full transition"
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition group"
              >
                Get Started
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl p-6 flex flex-col gap-5">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <User size={22} className="text-[#2f61ce]" />
              <span className="text-sm font-medium text-slate-800">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          )}

          <a
            href="#features"
            className="text-lg font-medium text-slate-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#mission"
            className="text-lg font-medium text-slate-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            Our Mission
          </a>
          <a
            href="#trust"
            className="text-lg font-medium text-slate-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            Why Us
          </a>

          <hr className="border-slate-200" />

          {user ? (
            <>
              <Link
                href="/home"
                className="w-full py-3 text-center text-[#2f61ce] bg-blue-50 hover:bg-[#fac300] rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full py-3 text-center flex items-center justify-center gap-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full py-3 text-center text-[#2f61ce] bg-blue-50 hover:bg-[#fac300] rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="w-full py-3 text-center text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
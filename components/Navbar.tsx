"use client";
import React, { useState, useEffect } from "react";
import { LogOut, User, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// BRAND COLORS
const primary = "#F59E0B";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
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
          ? "backdrop-blur-md border-b py-3"
          : "bg-transparent py-5"
      }`}
      style={{
        backgroundColor: isScrolled || mobileMenuOpen ? "rgba(2, 6, 23, 0.9)" : "transparent",
        borderColor: isScrolled || mobileMenuOpen ? "rgba(99, 102, 241, 0.1)" : "transparent",
      }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <img
            src="/whitelogo.svg"
            alt="EduNext Logo"
            width={32}
            height={32}
            className="h-12 w-40 object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/blogs"
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            Blogs
          </a>
          <a
            href="/contact-us"
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            Contact Us
          </a>

          {user ? (
            <>
              <Link
                href="/home"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="group px-4 py-2 text-sm font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: "#d32f2f" }}
              >
                Logout <LogOut size={14} />
              </button>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  borderColor: "rgba(99, 102, 241, 0.2)",
                }}
              >
                <User size={16} style={{ color: primary }} />
                <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="group px-4 py-2 text-sm font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                Get Started <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 cursor-pointer"
            style={{ color: "#94a3b8" }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden absolute top-full left-0 right-0 border-b p-6 flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: "rgba(2, 6, 23, 0.95)",
            borderColor: "rgba(99, 102, 241, 0.1)"
          }}
        >
          {user && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-2"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
            >
              <User size={20} style={{ color: primary }} />
              <span className="text-sm font-medium" style={{ color: "#f8fafc" }}>
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          )}

          <a
            href="/blogs"
            className="text-lg font-medium cursor-pointer"
            style={{ color: "#f8fafc" }}
          >
            Blogs
          </a>

          <hr style={{ borderColor: "rgba(99, 102, 241, 0.1)" }} />

          {user ? (
            <>
              <Link
                href="/home"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: "#d32f2f" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer"
                style={{ backgroundColor: primary }}
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

export default Navbar;
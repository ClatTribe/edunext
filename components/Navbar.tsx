"use client";
import React, { useState, useEffect } from "react";
import { LogOut, User, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// âââ BRAND COLORS ââââââââââââââââââââââââââââââââââââââââââââ
const primary = "#F59E0B";
const darkBg = "rgba(2, 6, 23, 0.95)";
const borderSubtle = "rgba(99, 102, 241, 0.1)";
const textMuted = "#94a3b8";
const textBright = "#f8fafc";

// âââ PRODUCT ECOSYSTEM ââââââââââââââââââââââââââââââââââââââ
// Each product in the EduNext family. `active` is set per-deployment.
// When you copy this navbar to PrepTribe or SchoolTribe, just change
// the `CURRENT_PRODUCT` constant below.
const CURRENT_PRODUCT = "edunext"; // change to "preptribe" | "schooltribe"

interface Product {
  id: string;
  label: string;
  url: string;
}

const PRODUCTS: Product[] = [
  { id: "edunext", label: "EDUNEXT", url: "https://getedunext.com" },
  { id: "preptribe", label: "PREPTRIBE", url: "https://jeetribechallenge.getedunext.com" },
  { id: "schooltribe", label: "SCHOOLTRIBE", url: "https://vidyaa-rho.vercel.app" },
];

// âââ NAV LINKS (per product) ââââââââââââââââââââââââââââââââ
// Each product can define its own set of navigation links.
interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const NAV_LINKS: Record<string, NavLink[]> = {
  edunext: [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact Us", href: "/contact-us" },
  ],
  preptribe: [
    { label: "Home", href: "/" },
    { label: "Challenges", href: "/challenges" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  schooltribe: [
    { label: "Home", href: "/" },
    { label: "Schools", href: "/schools" },
    { label: "Compare", href: "/compare" },
  ],
};

// âââ COMPONENT ââââââââââââââââââââââââââââââââââââââââââââââ
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = NAV_LINKS[CURRENT_PRODUCT] || NAV_LINKS.edunext;

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
          ? "backdrop-blur-md border-b"
          : "bg-transparent"
      }`}
      style={{
        backgroundColor: isScrolled || mobileMenuOpen ? darkBg : "transparent",
        borderColor: isScrolled || mobileMenuOpen ? borderSubtle : "transparent",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between max-w-7xl h-14">
        {/* ââ Logo ââ */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/whitelogo.svg"
            alt="EduNext Logo"
            width={32}
            height={32}
            className="h-10 w-32 sm:h-12 sm:w-40 object-contain"
          />
        </Link>

        {/* ââ Desktop: Nav Links ââ */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors hover:text-white cursor-pointer"
                style={{ color: textMuted }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-white cursor-pointer"
                style={{ color: textMuted }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* ââ Desktop: Product Switcher + Auth ââ */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Product Tabs */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: `1px solid ${borderSubtle}` }}
          >
            {PRODUCTS.map((product) => {
              const isActive = product.id === CURRENT_PRODUCT;
              return (
                <a
                  key={product.id}
                  href={product.url}
                  className="px-3 py-1.5 text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer"
                  style={{
                    color: isActive ? primary : textMuted,
                    backgroundColor: isActive ? "rgba(245, 158, 11, 0.1)" : "transparent",
                    borderBottom: isActive ? `2px solid ${primary}` : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = textBright;
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = textMuted;
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {product.label}
                </a>
              );
            })}
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/medha-ai"
                className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full transition-all cursor-pointer"
                style={{ color: textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = textMuted;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  color: primary,
                  border: `1px solid rgba(245, 158, 11, 0.3)`,
                }}
                title={user.user_metadata?.full_name || user.email || ""}
              >
                {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="group px-4 py-1.5 text-sm font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                Get Started <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* ââ Mobile: Toggle ââ */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 cursor-pointer"
            style={{ color: textMuted }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ââ Mobile Menu ââ */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 border-b p-5 flex flex-col gap-3 shadow-xl"
          style={{ backgroundColor: darkBg, borderColor: borderSubtle }}
        >
          {/* User badge */}
          {user && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-1"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.08)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: primary }}
              >
                {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate" style={{ color: textBright }}>
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          )}

          {/* Nav Links */}
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium py-1 cursor-pointer"
                style={{ color: textBright }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium py-1 cursor-pointer"
                style={{ color: textBright }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}

          <hr style={{ borderColor: borderSubtle }} />

          {/* Product Switcher â horizontal row */}
          <div className="flex gap-2">
            {PRODUCTS.map((product) => {
              const isActive = product.id === CURRENT_PRODUCT;
              return (
                <a
                  key={product.id}
                  href={product.url}
                  className="flex-1 py-2 text-center text-xs font-bold tracking-wider rounded-lg transition-all cursor-pointer"
                  style={{
                    color: isActive ? primary : textMuted,
                    backgroundColor: isActive ? "rgba(245, 158, 11, 0.1)" : "transparent",
                    border: isActive
                      ? `1px solid ${primary}`
                      : `1px solid ${borderSubtle}`,
                  }}
                >
                  {product.label}
                </a>
              );
            })}
          </div>

          <hr style={{ borderColor: borderSubtle }} />

          {/* Auth */}
          {user ? (
            <>
              <Link
                href="/medha-ai"
                className="w-full py-2.5 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 text-center font-medium text-white rounded-xl cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: "#d32f2f" }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full py-2.5 text-center font-medium rounded-xl cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-center font-medium text-white rounded-xl cursor-pointer"
                style={{ backgroundColor: primary }}
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

export default Navbar;

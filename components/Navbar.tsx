"use client";
import React, { useState, useEffect } from "react";
import { LogOut, Menu, X, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// ——— BRAND COLORS ————————————————————————————————————————————
const primary = "#F59E0B";
const borderSubtle = "rgba(99, 102, 241, 0.1)";
const textMuted = "#94a3b8";
const textBright = "#f8fafc";

// ——— NAVBAR BACKGROUNDS ——————————————————————————————————————
const navBgDefault = "rgba(15, 23, 42, 0.6)";
const navBgScrolled = "rgba(15, 23, 42, 0.92)";
const navBorderDefault = "rgba(99, 102, 241, 0.08)";
const navBorderScrolled = "rgba(99, 102, 241, 0.15)";
const mobilePanelBg = "rgba(15, 23, 42, 0.97)";

// ——— PRODUCT ECOSYSTEM ——————————————————————————————————————
const CURRENT_PRODUCT = "edunext";

interface Product {
  id: string;
  label: string;
  url: string;
}

const PRODUCTS: Product[] = [
  { id: "edunext", label: "EduNext", url: "https://getedunext.com" },
  { id: "preptribe", label: "PrepTribe", url: "https://preptribe.getedunext.com" },
  { id: "schooltribe", label: "SchoolTribe", url: "https://schooltribe.getedunext.com" },
];

// ——— NAV LINKS (per product) ————————————————————————————————
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

// ——— NAV LINK COMPONENT (with hover underline) ——————————————
const NavItem: React.FC<{ link: NavLink }> = ({ link }) => {
  const baseClass =
    "relative text-sm lg:text-[15px] font-medium transition-colors cursor-pointer py-1 group";

  const underline = (
    <span
      className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-full"
      style={{ backgroundColor: primary }}
    />
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        style={{ color: textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = textBright)}
        onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
      >
        {link.label}
        {underline}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={baseClass}
      style={{ color: textMuted }}
      onMouseEnter={(e) => (e.currentTarget.style.color = textBright)}
      onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
    >
      {link.label}
      {underline}
    </Link>
  );
};

// ——— COMPONENT ——————————————————————————————————————————————
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, signOut, signInWithGoogle } = useAuth();

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

  // Direct Google OAuth — no /register page
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setMobileMenuOpen(false);
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google sign-in error:", error);
        setIsSigningIn(false);
      }
      // If no error, user gets redirected to Google — no need to reset state
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setIsSigningIn(false);
    }
  };

  // Thin vertical divider between right-side sections
  const Divider = () => (
    <div
      className="hidden lg:block w-px h-6 mx-1"
      style={{ backgroundColor: "rgba(99, 102, 241, 0.15)" }}
    />
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "backdrop-blur-md border-b shadow-lg shadow-black/20"
          : "backdrop-blur-sm border-b"
      }`}
      style={{
        backgroundColor: isScrolled || mobileMenuOpen ? navBgScrolled : navBgDefault,
        borderColor: isScrolled || mobileMenuOpen ? navBorderScrolled : navBorderDefault,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between max-w-7xl h-16 sm:h-18 lg:h-20">

        {/* ══════ LEFT: Logo ══════ */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/whitelogo.svg"
            alt="EduNext Logo"
            width={32}
            height={32}
            className="h-10 w-32 sm:h-11 sm:w-36 lg:h-12 lg:w-40 object-contain"
          />
        </Link>

        {/* ══════ RIGHT: Everything else (desktop) ══════ */}
        <div className="hidden lg:flex items-center gap-5">

          {/* ── Nav Links ── */}
          {navLinks.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}

          <Divider />

          {/* ── Product Switcher ── */}
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

          <Divider />

          {/* ── Auth ── */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/medha-ai"
                className="px-4 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-[15px] font-medium rounded-full transition-colors cursor-pointer"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 lg:p-2.5 rounded-full transition-all cursor-pointer"
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
                <LogOut size={18} />
              </button>
              <div
                className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold"
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
            <div className="flex items-center gap-2">
              {/* Log In — direct Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-4 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-[15px] font-medium rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                {isSigningIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
              {/* Get Started — direct Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="group px-4 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-[15px] font-medium text-white rounded-full transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary }}
              >
                Get Started <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ══════ Mobile: Toggle ══════ */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 cursor-pointer"
            style={{ color: textMuted }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ══════ Mobile Menu ══════ */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 border-b p-5 flex flex-col gap-3 shadow-xl"
          style={{ backgroundColor: mobilePanelBg, borderColor: borderSubtle }}
        >
          {/* User badge */}
          {user && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-1"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.08)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
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
                className="text-base font-medium py-2 px-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: textBright }}
                onClick={() => setMobileMenuOpen(false)}
                onTouchStart={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                onTouchEnd={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium py-2 px-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: textBright }}
                onClick={() => setMobileMenuOpen(false)}
                onTouchStart={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                onTouchEnd={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {link.label}
              </Link>
            )
          )}

          <hr style={{ borderColor: borderSubtle }} />

          {/* Product Switcher — horizontal row */}
          <div className="flex gap-2">
            {PRODUCTS.map((product) => {
              const isActive = product.id === CURRENT_PRODUCT;
              return (
                <a
                  key={product.id}
                  href={product.url}
                  className="flex-1 py-2.5 text-center text-xs font-bold tracking-wider rounded-lg transition-all cursor-pointer"
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
            <div className="flex flex-col gap-2">
              <Link
                href="/medha-ai"
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer text-base"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer flex items-center justify-center gap-2 text-base"
                style={{ backgroundColor: "#d32f2f" }}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Mobile: Log In — direct Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 text-center font-medium rounded-xl cursor-pointer text-base disabled:opacity-50"
                style={{ color: primary, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                {isSigningIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
              {/* Mobile: Get Started — direct Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 text-center font-medium text-white rounded-xl cursor-pointer text-base disabled:opacity-50"
                style={{ backgroundColor: primary }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
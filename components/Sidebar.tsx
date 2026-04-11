"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  IndianRupee,
  Users,
  Building2,
  GraduationCap,
  LogOut,
  ThumbsUp,
  Menu,
  X,
  FileCheck,
  TrendingUp,
  SearchCheck,
  Calculator,
  ChevronDown,
  Sparkles,
  Rocket,
  School,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onSignOut }) => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Color scheme matching the TrustSection component
  const accentColor = "#F59E0B";
  const primaryBg = "#050818"; // Very dark navy blue
  const secondaryBg = "#0F172B"; // Slightly lighter navy
  const borderColor = "rgba(245, 158, 11, 0.15)";

  const navItems = {
    main: [
      { icon: Sparkles, label: "Medha AI", path: "/medha-ai" },
      { icon: User, label: "Profile", path: "/profile" },
    ],
    ecosystem: [
      {
        icon: Rocket,
        label: "PrepTribe",
        url: "https://preptribe.getedunext.com",
        description: "JEE / NEET / CUET",
      },
      {
        icon: School,
        label: "SchoolTribe",
        url: "https://schooltribe.getedunext.com",
        description: "Your 8th, 9th, 10th",
      },
    ],
    explore: [
      { icon: BookOpen, label: "Find Colleges", path: "/find-colleges" },
      {
        icon: Users,
        label: "Previous Year Students",
        path: "/previous-year-students",
      },
      {
        icon: IndianRupee,
        label: "Find Scholarships",
        path: "/find-scholarships",
      },
      { icon: Building2, label: "Your Shortlist", path: "/your-shortlist" },
      { icon: Building2, label: "Battle Mode", path: "/battle-mode" },
    ],
    highlighted: {
      icon: CalendarClock,
      label: "Forms & Deadlines",
      path: "/forms-and-deadlines",
    },
  };

  const toolOptions = [
    {
      icon: TrendingUp,
      label: "CAT Percentile Predictor",
      path: "/cat-percentile-predictor",
    },
    {
      icon: SearchCheck,
      label: "CAT College Predictor",
      path: "/cat-college-predictor",
    },
    {
      icon: Calculator,
      label: "XAT Score Calculator",
      path: "/xat-score-calculator-2026",
    },
    {
      icon: Calculator,
      label: "JEE Score Calculator",
      path: "/jee-score-calculator",
    },
    {
      icon: FileCheck,
      label: "Exam & Deadline",
      path: "/exams-and-deadline",
    },
    {
      icon: GraduationCap,
      label: "Study Material",
      path: "/study-material",
    },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await onSignOut();
      router.push("/register");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const isAtTool = [
      "/cat-percentile-predictor",
      "/cat-college-predictor",
      "/xat-score-calculator-2026",
      "/jee-tool",
      "/exams-and-deadline",
      "/study-material",
      "/forms-and-deadlines",
    ].includes(pathname);
    if (isAtTool) {
      setIsToolsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Reusable nav button for internal routes
  const NavButton: React.FC<{
    item: { icon: React.ElementType; label: string; path: string };
  }> = ({ item }) => (
    <button
      onClick={() => handleNavClick(item.path)}
      className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
        isActive(item.path) ? "shadow-lg" : "hover:bg-white/5"
      }`}
      style={
        isActive(item.path)
          ? {
              backgroundColor: secondaryBg,
              borderLeft: `4px solid ${accentColor}`,
              color: accentColor,
            }
          : { color: "#cbd5e1" }
      }
    >
      <item.icon
        size={18}
        className="transition-colors"
        style={{ color: isActive(item.path) ? accentColor : "#94a3b8" }}
      />
      <span
        className={`text-sm transition-colors ${
          isActive(item.path) ? "font-semibold" : ""
        }`}
        style={{ color: isActive(item.path) ? accentColor : "#cbd5e1" }}
      >
        {item.label}
      </span>
    </button>
  );

  // Section header component
  const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-2 mb-2 px-2">
      <div
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {label}
      </div>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: borderColor }}
      ></div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 border-b shadow-lg z-40"
        style={{
          background: `linear-gradient(to right, ${primaryBg}, ${secondaryBg})`,
          borderColor: borderColor,
        }}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <img
              src="/whitelogo.svg"
              alt="EduNext Logo"
              width={32}
              height={32}
              className="h-10 w-32 object-contain brightness-110"
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isMobileMenuOpen
                ? "rgba(255, 255, 255, 0.05)"
                : "transparent",
            }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} style={{ color: accentColor }} />
            ) : (
              <Menu size={24} style={{ color: accentColor }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 transition-all duration-300"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            backgroundColor: "rgba(2, 6, 23, 0.8)",
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 h-screen
          w-64 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})`,
          borderRight: `1px solid ${borderColor}`,
        }}
      >
        {/* Sidebar Content Container */}
        <div className="flex flex-col h-full">
          {/* Header - Hidden on mobile */}
          <div className="mb-6 hidden md:block p-4 pb-0">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <img
                src="/whitelogo.svg"
                alt="EduNext Logo"
                width={32}
                height={32}
                className="h-12 w-32 object-contain brightness-110"
              />
            </Link>
            <div
              className="h-1 w-16 rounded-full"
              style={{ backgroundColor: accentColor }}
            ></div>
          </div>

          {/* Mobile: Close button */}
          <div className="md:hidden p-4 flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              aria-label="Close menu"
            >
              <X size={20} style={{ color: accentColor }} />
            </button>
          </div>

          {/* Welcome Message */}
          <div className="px-4 pb-4">
            <div
              className="rounded-lg p-3 shadow-lg border"
              style={{
                backgroundColor: secondaryBg,
                borderColor: borderColor,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm text-slate-400 shrink-0">Welcome,</div>
                <div
                  className="font-semibold truncate lowercase first-letter:uppercase"
                  style={{ color: accentColor }}
                >
                  {userName}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
            <nav className="space-y-2">
              {/* Main Navigation */}
              {navItems.main.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}

              {/* Forms & Deadlines – shimmer highlight (always visible) */}
              <button
                onClick={() => handleNavClick(navItems.highlighted.path)}
                className={`relative flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group overflow-hidden ${
                  isActive(navItems.highlighted.path) ? "shadow-lg" : ""
                }`}
                style={
                  isActive(navItems.highlighted.path)
                    ? {
                        backgroundColor: secondaryBg,
                        borderLeft: `4px solid ${accentColor}`,
                        color: accentColor,
                      }
                    : {
                        color: "#fbbf24",
                        background: "rgba(251, 191, 36, 0.06)",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                      }
                }
              >
                {/* Shimmer sweep – shows on both active and inactive, lighter when active */}
                <span
                  className={`shimmer-sweep absolute inset-0 pointer-events-none ${
                    isActive(navItems.highlighted.path) ? "shimmer-light" : ""
                  }`}
                />
                <navItems.highlighted.icon
                  size={18}
                  className="transition-colors shrink-0"
                  style={{
                    color: isActive(navItems.highlighted.path)
                      ? accentColor
                      : "#fbbf24",
                  }}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(navItems.highlighted.path)
                      ? "font-semibold"
                      : "font-medium"
                  }`}
                  style={{
                    color: isActive(navItems.highlighted.path)
                      ? accentColor
                      : "#fbbf24",
                  }}
                >
                  {navItems.highlighted.label}
                </span>
                {!isActive(navItems.highlighted.path) && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400">
                    New
                  </span>
                )}
              </button>

              {/* ── Our Ecosystem ── */}
              <div className="pt-4">
                <SectionHeader label="Our Ecosystem" />
                <div className="flex flex-col gap-1">
                  {navItems.ecosystem.map((product) => (
                    <a
                      key={product.label}
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 w-full rounded-lg transition-all duration-200 group hover:bg-white/5"
                      style={{ color: "#cbd5e1" }}
                    >
                      <product.icon
                        size={18}
                        className="transition-colors flex-shrink-0"
                        style={{ color: "#94a3b8" }}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-sm transition-colors group-hover:text-white"
                            style={{ color: "#cbd5e1" }}
                          >
                            {product.label}
                          </span>
                          <ExternalLink
                            size={12}
                            className="opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0"
                            style={{ color: "#94a3b8" }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 truncate">
                          {product.description}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* ── Explore Section ── */}
              <div className="pt-4">
                <SectionHeader label="Explore" />
                {navItems.explore.map((item) => (
                  <NavButton key={item.path} item={item} />
                ))}
              </div>
              {/* starter-kit */}
              {/* <div className="pt-4">
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className="w-full flex items-center gap-2 mb-2 px-2 group cursor-pointer transition-all focus:outline-none"
                  aria-expanded={isToolsOpen}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider group-hover:opacity-80 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    Starter Kit
                  </div>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: borderColor }}
                  ></div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ease-in-out ${
                      isToolsOpen ? "rotate-180" : "rotate-0"
                    }`}
                    style={{ color: accentColor }}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isToolsOpen ? "1fr" : "0fr",
                    opacity: isToolsOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      {toolOptions.map((tool) => (
                        <NavButton key={tool.path} item={tool} />
                      ))}
                    </div>
                  </div>
                </div>
              </div> */}
              {/* ── Tools Section ── */}
              <div className="pt-4">
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className="w-full flex items-center gap-2 mb-2 px-2 group cursor-pointer transition-all focus:outline-none"
                  aria-expanded={isToolsOpen}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider group-hover:opacity-80 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    Our Tools
                  </div>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: borderColor }}
                  ></div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ease-in-out ${
                      isToolsOpen ? "rotate-180" : "rotate-0"
                    }`}
                    style={{ color: accentColor }}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isToolsOpen ? "1fr" : "0fr",
                    opacity: isToolsOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      {toolOptions.map((tool) => (
                        <NavButton key={tool.path} item={tool} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Logout Button */}
          <div
            className="p-3 pt-0 border-t"
            style={{
              borderColor: borderColor,
              background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})`,
            }}
          >
            <button
              onClick={async (e) => {
                e.preventDefault();
                await handleLogout();
              }}
              disabled={isLoggingOut}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(false)}
              className="flex mt-3 items-center justify-between gap-3 p-3 w-full text-left rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: secondaryBg,
                borderColor: borderColor,
                border: `1px solid ${borderColor}`,
                color: accentColor,
              }}
            >
              <div className="flex items-center gap-3">
                {isLoggingOut ? (
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-b-2"
                    style={{ borderColor: accentColor }}
                  ></div>
                ) : (
                  <LogOut
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                    style={{ color: accentColor }}
                  />
                )}
                <span className="font-semibold" style={{ color: accentColor }}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </div>
              {!isLoggingOut && (
                <ThumbsUp
                  size={16}
                  className={`transition-all duration-300 ${
                    isLogoutHovered
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  }`}
                  style={{ color: accentColor }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-16 md:hidden"></div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Yellow shimmer sweep for Forms & Deadlines */
        .shimmer-sweep::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.15),
            rgba(251, 191, 36, 0.25),
            rgba(251, 191, 36, 0.15),
            transparent
          );
          animation: shimmer-slide 2.5s ease-in-out infinite;
        }
        /* Lighter shimmer when page is active */
        .shimmer-light::before {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.06),
            rgba(251, 191, 36, 0.12),
            rgba(251, 191, 36, 0.06),
            transparent
          );
          animation: shimmer-slide 3s ease-in-out infinite;
        }
        @keyframes shimmer-slide {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;

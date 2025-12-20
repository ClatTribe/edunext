"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
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
  const router = useRouter();
  const pathname = usePathname();

  // Color scheme matching the TrustSection component
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';

  const navItems = {
    main: [
      { icon: Home, label: "Home", path: "/home" },
      { icon: User, label: "Profile", path: "/profile" },
    ],
    explore: [
      { icon: BookOpen, label: "Find Colleges", path: "/find-colleges" },
      { icon: Users, label: "Previous Year Students", path: "/previous-year-students" },
      { icon: IndianRupee, label: "Find Scholarships", path: "/find-scholarships" },
      { icon: Building2, label: "Your Shortlist", path: "/your-shortlist" },
      { icon: Building2, label: "Compare Your College", path: "/compare-your-college" },
    ],
    applications: [
      { icon: BookOpen, label: "Application Builder", path: "/application-builder" },
      { icon: GraduationCap, label: "Document Upload", path: "/document" },
    ],
  };

  const toolOptions = [
    {
      icon: TrendingUp,
      label: "Cat Percentile Predictor",
      path: "/cat-percentile-predictor",
    },
    {
      icon: SearchCheck,
      label: "Cat College Predictor",
      path: "/cat-college-predictor",
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
      await onSignOut();
      setIsLoggingOut(true);
      router.push("/register");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div 
        className="md:hidden fixed top-0 left-0 right-0 border-b shadow-lg z-40"
        style={{ 
          background: `linear-gradient(to right, ${primaryBg}, ${secondaryBg})`,
          borderColor: borderColor 
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
              backgroundColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
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
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(2, 6, 23, 0.8)'
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
          borderRight: `1px solid ${borderColor}`
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
                borderColor: borderColor 
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

          {/* Scrollable Navigation - Takes remaining space */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
            <nav className="space-y-2">
              {/* Main Navigation */}
              {navItems.main.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? "shadow-lg"
                      : "hover:bg-white/5"
                  }`}
                  style={
                    isActive(item.path)
                      ? {
                          backgroundColor: secondaryBg,
                          borderLeft: `4px solid ${accentColor}`,
                          color: accentColor,
                        }
                      : { color: '#cbd5e1' }
                  }
                >
                  <item.icon
                    size={18}
                    className="transition-colors"
                    style={{
                      color: isActive(item.path) ? accentColor : '#94a3b8',
                    }}
                  />
                  <span
                    className={`text-sm transition-colors ${
                      isActive(item.path) ? "font-semibold" : ""
                    }`}
                    style={{
                      color: isActive(item.path) ? accentColor : '#cbd5e1',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}

              {/* Explore Section */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: accentColor }}
                  >
                    Explore
                  </div>
                  <div 
                    className="flex-1 h-px"
                    style={{ backgroundColor: borderColor }}
                  ></div>
                </div>
                {navItems.explore.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                      isActive(item.path)
                        ? "shadow-lg"
                        : "hover:bg-white/5"
                    }`}
                    style={
                      isActive(item.path)
                        ? {
                            backgroundColor: secondaryBg,
                            borderLeft: `4px solid ${accentColor}`,
                            color: accentColor,
                          }
                        : { color: '#cbd5e1' }
                    }
                  >
                    <item.icon
                      size={18}
                      className="transition-colors"
                      style={{
                        color: isActive(item.path) ? accentColor : '#94a3b8',
                      }}
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isActive(item.path) ? "font-semibold" : ""
                      }`}
                      style={{
                        color: isActive(item.path) ? accentColor : '#cbd5e1',
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tools Section */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: accentColor }}
                  >
                    Tools
                  </div>
                  <div 
                    className="flex-1 h-px"
                    style={{ backgroundColor: borderColor }}
                  ></div>
                </div>
                {toolOptions.map((tool) => (
                  <button
                    key={tool.path}
                    onClick={() => handleNavClick(tool.path)}
                    className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                      isActive(tool.path)
                        ? "shadow-lg"
                        : "hover:bg-white/5"
                    }`}
                    style={
                      isActive(tool.path)
                        ? {
                            backgroundColor: secondaryBg,
                            borderLeft: `4px solid ${accentColor}`,
                            color: accentColor,
                          }
                        : { color: '#cbd5e1' }
                    }
                  >
                    <tool.icon
                      size={18}
                      className="transition-colors"
                      style={{
                        color: isActive(tool.path) ? accentColor : '#94a3b8',
                      }}
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isActive(tool.path) ? "font-semibold" : ""
                      }`}
                      style={{
                        color: isActive(tool.path) ? accentColor : '#cbd5e1',
                      }}
                    >
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Logout Button - Always visible at bottom */}
          <div 
            className="p-3  pt-0 border-t"
            style={{ 
              borderColor: borderColor,
              background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})`
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
              className="flex  mt-3 items-center justify-between gap-3 p-3 w-full text-left rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: secondaryBg,
                borderColor: borderColor,
                border: `1px solid ${borderColor}`,
                color: accentColor,
              }}
            >
              <div className="flex items-center gap-3 ">
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
                    isLogoutHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                  style={{ color: accentColor }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile spacer - pushes content below fixed header */}
      <div className="h-16 md:hidden"></div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </> 
  );
};

export default Sidebar;
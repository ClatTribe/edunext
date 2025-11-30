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
  Award,
  Trophy,
  LogOut,
  ThumbsUp,
  Menu,
  X,
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

  const navItems = {
    main: [
      { icon: Home, label: "Home", path: "/home" },
      { icon: User, label: "Profile", path: "/profile" },
    ],
    explore: [
      { icon: BookOpen, label: "Find Colleges", path: "/find-colleges" },
      { icon: Users, label: "Similar Students", path: "/similar-students" },
      { icon: IndianRupee, label: "Find Scholarships", path: "/find-scholarships" },
      { icon: Building2, label: "Your Shortlist", path: "/your-shortlist" },
    ],
    applications: [
      { icon: BookOpen, label: "Application Builder", path: "/application-builder" },
      { icon: GraduationCap, label: "Document Upload", path: "/document" },
    ],
    postAdmit: [
      { icon: GraduationCap, label: "Dashboard", path: "/" },
    ],
  };

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
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-200 shadow-md z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/EduNext.svg"
              alt="EduNext Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-[#2f61ce]">EduNext</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-[#2f61ce]" />
            ) : (
              <Menu size={24} className="text-[#2f61ce]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 h-screen
          w-64 bg-gradient-to-b from-blue-50 to-sky-50 
          p-4 border-r border-blue-200 flex flex-col shadow-lg 
          transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header - Hidden on mobile */}
        <div className="mb-8 hidden md:block">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <img
              src="/EduNext.svg"
              alt="EduNext Logo"
              width={32}
              height={32}
              className="h-12 w-32 object-contain"
            />
            {/* <div className="text-2xl font-bold text-[#2f61ce]">EduNext</div> */}
          </Link>
          <div className="h-1 w-16 bg-[#fac300] rounded-full"></div>
        </div>

        {/* Mobile: Add padding top */}
        <div className="md:hidden h-4"></div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-white rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-[#2f61ce]" />
        </button>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-3 mb-6 shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-sm text-gray-600 flex-shrink-0">Welcome,</div>
            <div className="text-[#2f61ce] font-semibold truncate">{userName}</div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {/* Main Navigation */}
          {navItems.main.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-white shadow-md border-l-4 border-[#2f61ce] text-[#2f61ce]"
                  : "hover:bg-white hover:shadow-sm text-gray-700"
              }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-[#2f61ce]"
                    : "text-gray-600 group-hover:text-[#2f61ce]"
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? "font-semibold text-[#2f61ce]"
                    : "text-gray-700 group-hover:text-[#2f61ce]"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* Explore Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-[#2f61ce] uppercase tracking-wider">
                Explore
              </div>
              <div className="flex-1 h-px bg-blue-200"></div>
            </div>
            {navItems.explore.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-[#2f61ce] text-[#2f61ce]"
                    : "hover:bg-white hover:shadow-sm text-gray-700"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-[#2f61ce]"
                      : "text-gray-600 group-hover:text-[#2f61ce]"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold text-[#2f61ce]"
                      : "text-gray-700 group-hover:text-[#2f61ce]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Post Admit Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-[#2f61ce] uppercase tracking-wider">
                Dashboard
              </div>
              <div className="flex-1 h-px bg-blue-200"></div>
            </div>
            {navItems.postAdmit.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-[#2f61ce] text-[#2f61ce]"
                    : "hover:bg-white hover:shadow-sm text-gray-700"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-[#2f61ce]"
                      : "text-gray-600 group-hover:text-[#2f61ce]"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold text-[#2f61ce]"
                      : "text-gray-700 group-hover:text-[#2f61ce]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-blue-200">
          <button
            onClick={async (e) => {
              e.preventDefault();
              await handleLogout();
            }}
            disabled={isLoggingOut}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            className="flex items-center justify-between gap-3 p-3 w-full text-left bg-white hover:bg-blue-50 rounded-lg text-[#2f61ce] transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2f61ce]"></div>
              ) : (
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </div>
            {!isLoggingOut && (
              <ThumbsUp
                size={16}
                className={`transition-all duration-300 ${
                  isLogoutHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </> 
  );
};

export default Sidebar;
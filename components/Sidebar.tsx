"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  BookOpen,
  DollarSign,
  Users,
  Building2,
  GraduationCap,
  Award,
  Trophy,
  LogOut,
  ThumbsUp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onSignOut }) => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = {
    main: [
      { icon: Home, label: "Home", path: "/" },
      { icon: User, label: "Ask AI", path: "/ask-ai" },
      { icon: User, label: "Profile Analyzer", path: "/profile-analyzer" },
    ],
    explore: [
      { icon: BookOpen, label: "Course Finder", path: "/course-finder" },
      { icon: Users, label: "Admit Finder", path: "/admit-finder" },
      { icon: DollarSign, label: "Scholarship Finder", path: "/scholarship-finder" },
      { icon: Building2, label: "Shortlist Builder", path: "/shortlist-builder" },
    ],
    applications: [
      { icon: BookOpen, label: "Application Builder", path: "/application-builder" },
      { icon: GraduationCap, label: "Manage Shortlist", path: "/manage-shortlist" },
      { icon: Award, label: "Manage Applications", path: "/manage-apps" },
      { icon: Trophy, label: "Guidance", path: "/guidance" },
    ],
    postAdmit: [
      { icon: GraduationCap, label: "Finalise Admits", path: "/finalise-admits" },
    ],
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    // First redirect to register page
    router.replace("/register");
    // Then sign out (this will clear the auth state)
    await onSignOut();
  };

  // Check if current path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
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
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-pink-50 to-red-50 border-b border-pink-200 shadow-md z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div className="text-xl font-bold text-red-600">EduAbroad</div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-red-600" />
            ) : (
              <Menu size={24} className="text-red-600" />
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
          w-64 bg-gradient-to-b from-pink-50 to-red-50 
          p-4 border-r border-pink-200 flex flex-col shadow-lg 
          transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header - Hidden on mobile (shown in mobile header instead) */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div className="text-2xl font-bold text-red-600">EduAbroad</div>
          </div>
          <div className="h-1 w-16 bg-red-600 rounded-full"></div>
        </div>

        {/* Mobile: Add padding top to account for fixed header */}
        <div className="md:hidden h-4"></div>

        {/* Close button for mobile (inside sidebar) */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-white rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-red-600" />
        </button>

        {/* Welcome Message with Dropdown */}
        <div className="bg-white rounded-lg p-3 mb-6 shadow-sm border border-pink-100 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm text-gray-600 flex-shrink-0">Welcome,</div>
              <div className="text-red-600 font-semibold truncate">{userName}</div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-pink-100 rounded-lg shadow-md py-2 z-20 transition-all duration-300 ease-out animate-fadeInScale">
              <button
                onClick={handleProfileClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-red-600 transition-all"
              >
                Profile
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
          {/* Main Navigation */}
          {navItems.main.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-white shadow-md border-l-4 border-red-600 text-red-600"
                  : "hover:bg-white hover:shadow-sm"
              }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-red-600"
                    : "text-gray-600 group-hover:text-red-600"
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? "font-semibold"
                    : "group-hover:text-red-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* Explore Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Explore
              </div>
              <div className="flex-1 h-px bg-red-200"></div>
            </div>
            {navItems.explore.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-red-600 text-red-600"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-red-600"
                      : "text-gray-600 group-hover:text-red-600"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-red-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Applications Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Applications
              </div>
              <div className="flex-1 h-px bg-red-200"></div>
            </div>
            {navItems.applications.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-red-600 text-red-600"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-red-600"
                      : "text-gray-600 group-hover:text-red-600"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-red-600"
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
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Post Admit
              </div>
              <div className="flex-1 h-px bg-red-200"></div>
            </div>
            {navItems.postAdmit.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-red-600 text-red-600"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-red-600"
                      : "text-gray-600 group-hover:text-red-600"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-red-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-pink-200">
          <button
            onClick={handleLogout}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            className="flex items-center justify-between gap-3 p-3 w-full text-left bg-white hover:bg-red-50 rounded-lg text-red-600 transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Logout</span>
            </div>
            <ThumbsUp
              size={16}
              className={`transition-all duration-300 ${
                isLogoutHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
            />
          </button>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeInScale {
            animation: fadeInScale 0.2s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
"use client";
import React, { useState } from 'react';
import { Home, User, BookOpen, DollarSign, Users, Building2, GraduationCap, Award, Trophy, LogOut, ThumbsUp } from 'lucide-react';

interface SidebarProps {
  activeSection: 'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder';
  setActiveSection: (section: 'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder') => void;
  userName: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, userName, onSignOut }) => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const navItems = {
    main: [
      { icon: Home, label: 'Home', action: 'home' },
      { icon: User, label: 'Ask AI', action: 'ask-ai' },
      { icon: User, label: 'Profile Analyzer', action: 'profile-analyzer' },
    ],
    explore: [
      { icon: BookOpen, label: 'Course Finder', action: 'course-finder' },
      { icon: Users, label: 'Admit Finder', action: 'admit-finder' },
      { icon: DollarSign, label: 'Scholarship Finder', action: 'scholarship-finder' },
      { icon: Building2, label: 'Shortlist Builder', action: 'shortlist-builder' },
    ],
    applications: [
      { icon: GraduationCap, label: 'Manage Shortlist', action: 'manage-shortlist' },
      { icon: BookOpen, label: 'Application Builder', action: 'app-builder' },
      { icon: Award, label: 'Manage Applications', action: 'manage-apps' },
      { icon: Trophy, label: 'Guidance', action: 'guidance' },
    ],
    postAdmit: [
      { icon: GraduationCap, label: 'Finalise Admits', action: 'finalise-admits' },
    ]
  };

  const handleNavClick = (action: string) => {
    if (['course-finder', 'admit-finder', 'scholarship-finder', 'shortlist-builder'].includes(action)) {
      setActiveSection(action as 'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder');
    }
    // Add other navigation logic here
  };

  return (
    <div className="w-64 bg-gradient-to-b from-pink-50 to-red-50 h-screen p-4 border-r border-pink-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <div className="text-2xl font-bold text-red-600">EduPortal</div>
        </div>
        <div className="h-1 w-16 bg-red-600 rounded-full"></div>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-white rounded-lg p-3 mb-6 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Welcome,</div>
          <div className="text-red-600 font-semibold truncate">{userName}</div>
        </div>
        <div className="text-xs text-gray-400 mt-1">Explore your opportunities</div>
      </div>
      
      {/* Navigation - Scrollable Area */}
      <nav className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
        {/* Main Navigation */}
        {navItems.main.map((item) => (
          <button
            key={item.action}
            onClick={() => handleNavClick(item.action)}
            className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
          >
            <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
            <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
          </button>
        ))}
        
        {/* Explore Section */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Explore</div>
            <div className="flex-1 h-px bg-red-200"></div>
          </div>
          {navItems.explore.map((item) => (
            <button
              key={item.action}
              onClick={() => handleNavClick(item.action)}
              className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                activeSection === item.action 
                  ? 'bg-white shadow-md border-l-4 border-red-600 text-red-600' 
                  : 'hover:bg-white hover:shadow-sm'
              }`}
            >
              <item.icon 
                size={18} 
                className={`transition-colors ${
                  activeSection === item.action 
                    ? 'text-red-600' 
                    : 'text-gray-600 group-hover:text-red-600'
                }`} 
              />
              <span className={`text-sm transition-colors ${
                activeSection === item.action 
                  ? 'font-semibold' 
                  : 'group-hover:text-red-600'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* Applications Section */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Applications</div>
            <div className="flex-1 h-px bg-red-200"></div>
          </div>
          {navItems.applications.map((item) => (
            <button
              key={item.action}
              onClick={() => handleNavClick(item.action)}
              className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
            >
              <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
              <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Post Admit Section */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Post Admit</div>
            <div className="flex-1 h-px bg-red-200"></div>
          </div>
          {navItems.postAdmit.map((item) => (
            <button
              key={item.action}
              onClick={() => handleNavClick(item.action)}
              className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
            >
              <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
              <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="pt-4 mt-4 border-t border-pink-200">
        <button 
          onClick={onSignOut}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          className="flex items-center justify-between gap-3 p-3 w-full text-left bg-white hover:bg-red-50 rounded-lg text-red-600 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Logout</span>
          </div>
          <ThumbsUp 
            size={16} 
            className={`transition-all duration-300 ${
              isLogoutHovered 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-2'
            }`} 
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
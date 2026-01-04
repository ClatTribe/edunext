"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, FileText, Video, Users, CreditCard, BookOpen, Calculator } from 'lucide-react';

interface LightLayoutProps {
  children: React.ReactNode;
}

const LightLayout: React.FC<LightLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Light theme colors
  const primaryColor = '#823588'; // Purple
  const secondaryColor = '#F2AD00'; // Yellow/Golden (active state)
  const lightBg = '#FFFFFF'; // White background
  const sidebarBg = '#F8FAFC'; // Very light gray
  const navbarBg = '#823588'; // Purple navbar

  const sidebarItems = [
    { 
      href: '/try/quantitative-analysis', 
      label: 'Quantitative Analysis', 
      icon: <Calculator className="w-5 h-5" />
    },
    { 
      href: '/try/numbers', 
      label: 'Numbers', 
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      href: '/try/averages', 
      label: 'Averages', 
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      href: '/try/reading-comprehension', 
      label: 'Reading Comprehension', 
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      href: '/try/root-words', 
      label: 'Root Words', 
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: lightBg }}>
      {/* Navigation Bar */}
      <nav 
        className="fixed w-full z-50 shadow-md"
        style={{ 
          backgroundColor: navbarBg
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/try" className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                L
              </div>
              <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
                LEARNING HUB
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white">
            <Link 
              href="/try" 
              className="hover:text-yellow-300 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/try/courses" 
              className="hover:text-yellow-300 transition-colors"
            >
              Courses
            </Link>
            <Link 
              href="/try/resources" 
              className="hover:text-yellow-300 transition-colors"
            >
              Resources
            </Link>
            <Link 
              href="/try/about" 
              className="hover:text-yellow-300 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden border-t shadow-lg"
            style={{ 
              backgroundColor: navbarBg,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
              <Link 
                href="/try" 
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/try/courses" 
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                href="/try/resources" 
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                href="/try/about" 
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <div className="border-t border-white/20 my-2"></div>

              <div className="text-xs font-bold uppercase tracking-wider text-white/70 px-4 py-2">
                Learning Modules
              </div>
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-gray-900 shadow-lg'
                      : 'text-white'
                  }`}
                  style={isActive(item.href) ? { 
                    backgroundColor: secondaryColor,
                    boxShadow: `0 4px 14px ${secondaryColor}40`
                  } : {}}
                  onClick={() => setMobileMenuOpen(false)}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:block fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 shadow-lg border-r z-40 overflow-y-auto"
        style={{ 
          backgroundColor: sidebarBg,
          borderColor: '#E2E8F0'
        }}
      >
        <div className="p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 px-3">
            Learning Modules
          </div>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'text-gray-900 shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={isActive(item.href) ? { 
                backgroundColor: secondaryColor,
                boxShadow: `0 4px 14px ${secondaryColor}40`
              } : {}}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-[73px] min-h-screen" style={{ backgroundColor: lightBg }}>
        {children}
      </main>
    </div>
  );
};

export default LightLayout;
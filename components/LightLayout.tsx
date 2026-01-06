"use client";

import React, { useState } from 'react';
import { 
  Menu, X, BarChart3, FileText, BookOpen, Calculator, Play, AudioLines, Clock
} from 'lucide-react';

interface LightLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (path: string) => void;
}

export const LightLayout: React.FC<LightLayoutProps> = ({ children, activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryColor = '#823588';
  const secondaryColor = '#F2AD00';
  const lightBg = '#FFFFFF';
  const sidebarBg = '#F8FAFC';
  const navbarBg = '#823588';

  const sidebarItems = [
    { 
      href: '/try/video-analysis', 
      label: 'Video Analysis', 
      icon: <Play className="w-5 h-5" />
    },
    { 
      href: '/try/study-materials', 
      label: 'Study Materials', 
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      href: '/try/cut-offs', 
      label: 'Cut-offs', 
      icon: <Calculator className="w-5 h-5" />
    },
    { 
      href: '/try/AIR1mind-journals', 
      label: 'AIR1mindjournals', 
      icon: <AudioLines className="w-5 h-5" />
    },
    { 
      href: '/try/Hourglass-System', 
      label: 'Hourglass System', 
      icon: <Clock className="w-5 h-5" />
    },
    { 
      href: '/try/forms-deadlines', 
      label: 'Forms and Deadlines', 
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

  const isActive = (path: string) => activePage === path;

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: lightBg }}>
      {/* Navbar */}
      <nav 
        className="fixed w-full z-50 shadow-md"
        style={{ backgroundColor: navbarBg }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={() => handleNavClick('/try')} className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                I
              </div>
              <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
                IPM CAREERS
              </span>
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white">
            <button onClick={() => handleNavClick('/try')} className="hover:text-yellow-300 transition-colors">
              Home
            </button>
            <button onClick={() => handleNavClick('/try/courses')} className="hover:text-yellow-300 transition-colors">
              Courses
            </button>
            <button onClick={() => handleNavClick('/try/resources')} className="hover:text-yellow-300 transition-colors">
              Resources
            </button>
            <button onClick={() => handleNavClick('/try/about')} className="hover:text-yellow-300 transition-colors">
              About
            </button>
          </div>

          <button 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden border-t shadow-lg"
            style={{ 
              backgroundColor: navbarBg,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
              <button 
                onClick={() => handleNavClick('/try')}
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors text-left"
              >
                Home
              </button>
              <button 
                onClick={() => handleNavClick('/try/courses')}
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors text-left"
              >
                Courses
              </button>
              <button 
                onClick={() => handleNavClick('/try/resources')}
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors text-left"
              >
                Resources
              </button>
              <button 
                onClick={() => handleNavClick('/try/about')}
                className="text-white py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors text-left"
              >
                About
              </button>

              <div className="border-t border-white/20 my-2"></div>

              <div className="text-xs font-bold uppercase tracking-wider text-white/70 px-4 py-2">
                Learning Modules
              </div>
              {sidebarItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 text-left ${
                    isActive(item.href)
                      ? 'text-gray-900 shadow-lg'
                      : 'text-white'
                  }`}
                  style={isActive(item.href) ? { 
                    backgroundColor: secondaryColor,
                    boxShadow: `0 4px 14px ${secondaryColor}40`
                  } : {}}
                >
                  {item.icon}
                  {item.label}
                </button>
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
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 text-left ${
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
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
     <main className="md:ml-64 pt-[73px] min-h-screen flex flex-col" style={{ backgroundColor: lightBg }}>
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <footer 
          className="py-8 text-center border-t"
          style={{ 
            // backgroundColor: '#1a1a2e',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <p className="text-gray-600 text-sm font-medium">
            BY IPM CAREERS • DESIGNED FOR THE NEXT AIR 1
          </p>
        </footer>
      </main>
    </div>
  );
};

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <nav className="h-20 border-b border-slate-800/50 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#f9a01b] transition-colors" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9a01b]/50 focus:border-[#f9a01b] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Capsules</a>
          <a href="#" className="hover:text-white transition-colors">Flashcards</a>
          <a href="#" className="hover:text-white transition-colors">Blogs</a>
        </div>
        
        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full hover:bg-slate-800 transition-colors relative">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#05070a]"></span>
          </button>
          <button className="flex items-center gap-2 p-1 pl-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full transition-all">
            <span className="text-sm font-semibold text-white">Student Hub</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

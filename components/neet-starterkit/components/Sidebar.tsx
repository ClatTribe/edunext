import React from 'react';
import { SIDEBAR_ITEMS } from '../constant';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-[#0d111d] border-r border-slate-800 hidden xl:flex flex-col h-full">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <img src="https://picsum.photos/40/40" alt="Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-black tracking-tighter text-white">CLAT <span className="text-[#f9a01b]">TRIBE</span></span>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-4">Analysis Tools</h3>
            <div className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    item.active 
                      ? 'bg-gradient-to-r from-[#f9a01b] to-[#f98b1b] text-slate-900 font-bold shadow-lg shadow-orange-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className={item.active ? 'text-slate-900' : 'text-slate-500 group-hover:text-[#f9a01b]'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className="p-4 rounded-2xl bg-[#161b2a] border border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-2">Ready to level up?</p>
          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  );
};
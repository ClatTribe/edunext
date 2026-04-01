
import React from 'react';
import { Download, ChevronRight, FileText } from 'lucide-react';

export const PYQSection: React.FC = () => {
  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map((year) => (
          <div key={year} className="group p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-[#f9a01b]/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#f9a01b]">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">UG Exam</span>
            </div>
            <h3 className="text-xl font-bold mb-2">CLAT {year} Question Paper</h3>
            <p className="text-slate-400 text-sm mb-6">Complete question paper with official answer key and detailed explanations for all sections.</p>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#f9a01b] hover:bg-[#e08e15] text-slate-900 text-sm font-bold py-3 rounded-xl transition-colors">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-slate-800 hover:border-slate-700 rounded-xl transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


import React from 'react';
import { COLLEGES_DATA } from '../../constant';
import { MapPin, Trophy, Briefcase, Users, ChevronRight } from 'lucide-react';

export const CollegeSection: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Explore NLUs</h2>
          <p className="text-slate-500 text-sm">Find your dream college and understand its metrics.</p>
        </div>
        <button className="text-sm font-bold text-[#f9a01b] hover:underline">Compare All Colleges</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {COLLEGES_DATA.map((college, i) => (
          <div key={i} className="group bg-[#0d111d] rounded-[2rem] border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col">
            <div className="h-48 relative overflow-hidden">
              <img src={`https://picsum.photos/600/400?random=${i+10}`} alt={college.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d111d] to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="bg-[#f9a01b] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md">RANK #{college.rank}</span>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-[#f9a01b] transition-colors">{college.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin className="w-3 h-3" /> {college.location}
                  </div>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                {college.description}
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="p-3 bg-slate-900/50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Seats</p>
                  <p className="text-sm font-black text-white">{college.stats.seats}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Median</p>
                  <p className="text-sm font-black text-white">{college.stats.medianPackage}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cut-off</p>
                  <p className="text-[10px] font-black text-white whitespace-nowrap">{college.stats.cutOff}</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-[#f9a01b] hover:text-slate-900 text-white font-bold rounded-2xl transition-all">
                Full Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

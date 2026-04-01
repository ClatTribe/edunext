import React from "react";
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";
import { History, TrendingUp } from "lucide-react";

const data = [
  { year: "2022", applicants: 1480000 },
  { year: "2023", applicants: 1600000 },
  { year: "2024", applicants: 1730000 },
  { year: "2025", applicants: 1800000 },
  { year: "2026", applicants: 1900000 },
];

export const DeskSection: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-[#f9a01b]/10 flex items-center justify-center text-[#f9a01b] mb-6">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black mb-6 leading-tight">From the Desk of CUET</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed text-lg">
            <p>
              CUET has transformed undergraduate admissions by introducing a standardized national-level entry route
              for central and participating universities.
            </p>
            <p>
              With multiple sections (language, domain subjects, and general test), students now need focused strategy,
              mock practice, and smart selection of subject combinations.
            </p>
          </div>
        </div>
        <div className="bg-[#0d111d] p-8 rounded-[2rem] border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Applicant Growth
            </h4>
            <span className="text-xs text-slate-500">Recent Years</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f9a01b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f9a01b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#f9a01b" }}
                />
                <Area type="monotone" dataKey="applicants" stroke="#f9a01b" fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-4">
              CUET participation continues to rise as more universities adopt it for UG admissions.
            </p>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Universities</p>
          <div className="text-4xl font-black text-white">250+</div>
          <p className="text-xs text-slate-500 mt-2">Participating institutions</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Competition</p>
          <div className="text-4xl font-black text-white">High</div>
          <p className="text-xs text-slate-500 mt-2">Top programs require strong percentile</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Preparation Focus</p>
          <div className="text-4xl font-black text-white">Consistent</div>
          <p className="text-xs text-slate-500 mt-2">Daily practice + mock analysis</p>
        </div>
      </div>
    </div>
  );
};

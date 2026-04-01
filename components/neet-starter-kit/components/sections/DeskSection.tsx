import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { History, Target, TrendingUp } from "lucide-react";
 
const data = [
  { year: "2020", applicants: 1597435 },
  { year: "2021", applicants: 1614777 },
  { year: "2022", applicants: 1872343 },
  { year: "2023", applicants: 2087462 },
  { year: "2024", applicants: 2406079 },
];
 
export const DeskSection: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      {/* Historical Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-[#f9a01b]/10 flex items-center justify-center text-[#f9a01b] mb-6">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black mb-6 leading-tight">
            History & Evolution of NEET UG
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed text-lg">
            <p>
              NEET (National Eligibility cum Entrance Test) was introduced in
              2013 to replace multiple state-level and institution-level medical
              entrance exams with a single national examination. After legal
              challenges, it became the sole gateway for MBBS and BDS admissions
              across India from 2016, conducted by the National Testing Agency
              (NTA).
            </p>
            <p>
              Over the years, NEET has evolved from a controversial reform to
              India's largest undergraduate entrance exam. It now governs
              admissions to all government and private medical colleges,
              including AIIMS and JIPMER (merged into NEET from 2020), making it
              the single most important exam for aspiring doctors in India.
            </p>
          </div>
        </div>
        <div className="bg-[#0d111d] p-8 rounded-[2rem] border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Applicant Growth
            </h4>
            <span className="text-xs text-slate-500">Last 5 Years</span>
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
                <Area
                  type="monotone"
                  dataKey="applicants"
                  stroke="#f9a01b"
                  fillOpacity={1}
                  fill="url(#colorApp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
 
          {/* Applicant Data Table */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-4">
              NEET UG is India's largest undergraduate entrance exam by volume.
              With 24 lakh+ registrations in 2024, competition intensifies every
              year as demand for MBBS seats continues to soar across government
              and private medical colleges.
            </p>
          </div>
        </div>
      </section>
 
      {/* Stats Grid - Updated with correct NEET data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">
            Total MBBS Seats
          </p>
          <div className="text-4xl font-black text-white">~1,08,000+</div>
          <p className="text-xs text-slate-500 mt-2">
            Across Govt, Private & Deemed Medical Colleges
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">
            Selection %
          </p>
          <div className="text-4xl font-black text-white">~4.5%</div>
          <p className="text-xs text-slate-500 mt-2">
            For government medical college seats
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">
            Ideal Score
          </p>
          <div className="text-4xl font-black text-white">650 - 700+</div>
          <p className="text-xs text-slate-500 mt-2">
            Out of 720 (For Top AIIMS & Govt Colleges)
          </p>
        </div>
      </div>
    </div>
  );
};
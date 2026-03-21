import React from "react";
import { ShieldCheck, Scale, Globe, BookOpen, Eye, Download, type LucideIcon } from "lucide-react";

export const CheatSheetsSection: React.FC = () => {
  const sheets = [
    {
      title: "Language Section Sheet",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      subtitle: "Reading comprehension strategies and grammar quick rules",
      driveLink: "https://drive.google.com/file/d/1PbN4RJYwpbitjvvCeLUqr-gNQ0_87YD3/view?usp=drive_link",
      downloadLink: "https://drive.google.com/uc?export=download&id=1PbN4RJYwpbitjvvCeLUqr-gNQ0_87YD3",
    },
    {
      title: "Domain Subjects Sheet",
      icon: Scale,
      color: "text-[#f9a01b]",
      bg: "bg-orange-400/10",
      subtitle: "High-yield chapter pointers for domain-specific preparation",
      driveLink: "https://drive.google.com/file/d/16czfTrntD7G1C9Kc-rmsZFXYh2UOl1_w/view?usp=drive_link",
      downloadLink: "https://drive.google.com/uc?export=download&id=16czfTrntD7G1C9Kc-rmsZFXYh2UOl1_w",
    },
    {
      title: "General Test Sheet",
      icon: BookOpen,
      color: "text-green-400",
      bg: "bg-green-400/10",
      subtitle: "Quant, logical reasoning, and current affairs revision map",
      driveLink: "https://drive.google.com/file/d/1T4uvNxAhdPOQeHBtJPAOM4T4Xt4QiNPV/view?usp=drive_link",
      downloadLink: "https://drive.google.com/uc?export=download&id=1T4uvNxAhdPOQeHBtJPAOM4T4Xt4QiNPV",
    },
    {
      title: "CUET Syllabus Checklist",
      icon: ShieldCheck,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      subtitle: "Topic-wise checklist to track preparation progress",
      driveLink: "https://drive.google.com/file/d/18Qhphnj8KSlzW3vyjQt1W2x-e_hj8jzL/view?usp=drive_link",
      downloadLink: "https://drive.google.com/uc?export=download&id=18Qhphnj8KSlzW3vyjQt1W2x-e_hj8jzL",
    },
  ] as const satisfies readonly {
    title: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    subtitle: string;
    driveLink: string;
    downloadLink: string;
  }[];

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <p className="text-slate-400 leading-relaxed">
            These CUET quick sheets condense your prep into high-recall notes so you can revise language, domain, and
            general test sections efficiently.
          </p>
        </div>
        <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:scale-105 transition-transform shrink-0">
          BELOW
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sheets.map((sheet, i) => (
          <div
            key={i}
            className="group flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-slate-800/50 hover:border-slate-700/50 transition-all"
          >
            <div className={`w-16 h-16 rounded-2xl ${sheet.bg} ${sheet.color} flex items-center justify-center shrink-0`}>
              <sheet.icon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-white mb-1">{sheet.title}</h4>
              <p className="text-sm text-slate-400">{sheet.subtitle}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => window.open(sheet.driveLink, "_blank")}
                className="w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center group/btn"
                title="View"
              >
                <Eye className="w-5 h-5 text-slate-400 group-hover/btn:text-white transition-colors" />
              </button>
              <button
                onClick={() => window.open(sheet.downloadLink, "_blank")}
                className="w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center group/btn"
                title="Download"
              >
                <Download className="w-5 h-5 text-slate-400 group-hover/btn:text-white transition-colors" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

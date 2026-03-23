import React from "react";
import { ShieldCheck, Scale, Globe, GlassWater, Eye, Download, Dna, type LucideIcon } from "lucide-react";
 
export const CheatSheetsSection: React.FC = () => {
  const sheets = [
    {
      title: "Physics Sheet",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      subtitle: "Key Laws, Derivations & Formula summaries",
      driveLink:
        "https://www.selfstudys.com/books/neet-formula/english/physics",
      downloadLink:
        "",
    },
    {
      title: "Biology Sheet",
      icon: Dna,
      color: "text-[#f9a01b]",
      bg: "bg-orange-400/10",
      subtitle: "NCERT-based diagrams, processes & key terms",
      driveLink:
        "https://www.vedantu.com/neet/neet-biology-revision-notes",
      downloadLink:
        "",
    },
    {
      title: "Chemistry Sheet",
      icon: GlassWater,
      color: "text-green-400",
      bg: "bg-green-400/10",
      subtitle: "Organic Reactions, Periodic trends & Inorganic mnemonics",
      driveLink:
        "https://www.selfstudys.com/books/neet-formula",
      downloadLink:
        "",
    },
    {
      title: "Syllabus for NEET",
      icon: ShieldCheck,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      subtitle: "High-weightage topics & priority list for NEET UG",
      driveLink:
        "https://www.nta.ac.in/Download/Notice/Notice_20260108180635.pdf",
      downloadLink:
        "",
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
 
  const handleView = (driveLink: string) => {
    window.open(driveLink, "_blank");
  };
 
  const handleDownload = (downloadLink: string) => {
    window.open(downloadLink, "_blank");
  };
 
  return (
    <div className="space-y-8">
      <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <p className="text-slate-400 leading-relaxed">
            Our hand-crafted cheat sheets condense complex theories into
            high-yield formulas and visual maps. Perfect for cracking NEET UG
            with focused revision across Physics, Chemistry & Biology.
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
            {/* Icon Section */}
            <div
              className={`w-16 h-16 rounded-2xl ${sheet.bg} ${sheet.color} flex items-center justify-center shrink-0`}
            >
              <sheet.icon className="w-8 h-8" />
            </div>
 
            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-white mb-1">
                {sheet.title}
              </h4>
              <p className="text-sm text-slate-400">
                {sheet.subtitle}
              </p>
            </div>
 
            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => handleView(sheet.driveLink)}
                className="w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center group/btn"
                title="View"
              >
                <Eye className="w-5 h-5 text-slate-400 group-hover/btn:text-white transition-colors" />
              </button>
 
              <button
                onClick={() => handleDownload(sheet.downloadLink)}
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
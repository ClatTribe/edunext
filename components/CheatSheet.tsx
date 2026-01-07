"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  FileText,
  Download,
  Eye,
  Star,
  Zap,
} from "lucide-react";

interface CheatSheet {
  id: string;
  title: string;
  fileName: string;
  description: string;
  uploadDate: string;
  size: string;
  featured?: boolean;
}

export const CheatSheetsPage: React.FC = () => {
  const [cheatSheets, setCheatSheets] = useState<CheatSheet[]>([]);
  const [loading, setLoading] = useState(true);

  const accentColor = "#823588";

  useEffect(() => {
    loadCheatSheets();
  }, []);

  const loadCheatSheets = async () => {
    setLoading(true);

    const sheets: CheatSheet[] = [
      {
        id: "1",
        title: "Cheat Sheet – Quantitative Ability",
        fileName: "Cheat Sheet QA.pdf",
        description: "Quick revision formulas for Quantitative Ability.",
        uploadDate: "2024-03-10",
        size: "30 MB",
        featured: true,
      },
      {
        id: "2",
        title: "Cheat Sheet – Verbal Ability",
        fileName: "Cheat Sheet VA.pdf",
        description: "Quick revision notes for Verbal Ability.",
        uploadDate: "2024-03-10",
        size: "30 MB",
        featured: true,
      },
    ];

    setCheatSheets(sheets);
    setLoading(false);
  };

  const openPDF = (fileName: string) => {
    window.open(`/${fileName}`, "_blank");
  };

  const downloadPDF = (fileName: string) => {
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
            <Zap size={40} className="text-purple-700" />
            Cheat Sheets
          </h1>
          <p className="text-gray-600 text-lg">
            Quick revision resources for last-minute preparation
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cheatSheets.map((sheet) => (
              <div
                key={sheet.id}
                className="rounded-xl shadow-lg hover:shadow-2xl transition-all bg-white border-2 border-purple-200 hover:border-yellow-400 overflow-hidden"
              >
                <div
                  className="p-6 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  }}
                >
                  <div className="flex justify-between mb-3">
                    <FileText size={28} />
                    {sheet.featured && (
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star size={12} /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{sheet.title}</h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    {sheet.description}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPDF(sheet.fileName)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => downloadPDF(sheet.fileName)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl p-6 bg-white border border-purple-200 shadow-md">
          <div className="flex items-start gap-4">
            <Lightbulb className="text-yellow-500" size={24} />
            <div>
              <h3 className="font-semibold mb-2">Pro Tip</h3>
              <p className="text-sm text-gray-600">
                Use these cheat sheets for quick revision 24-48 hours before your exam. They contain only the most essential formulas and concepts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetsPage;
"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  Star,
  Lightbulb,
} from "lucide-react";

interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  section: "PYQ_TOPIC" | "PYQ_YEAR" | "CHEAT_SHEET";
  description: string;
  uploadDate: string;
  size: string;
  featured?: boolean;
}

export const StudyMaterialsPage: React.FC = () => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const accentColor = "#823588";

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);

    const materials: StudyMaterial[] = [
      // ================= PYQ TOPIC WISE =================
      {
        id: "1",
        title: "PYQ Quantitative Ability",
        fileName: "PYQ TOPIC WISE.pdf",
        section: "PYQ_TOPIC",
        description: "Topic-wise previous year questions for structured practice.",
        uploadDate: "2024-03-15",
        size: "30 MB",
        featured: true,
      },
      {
        id: "2",
        title: "PYQ Verbal Ability",
        fileName: "PYQ TOPIC WISE.pdf",
        section: "PYQ_TOPIC",
        description: "Topic-wise previous year questions for structured practice.",
        uploadDate: "2024-03-15",
        size: "30 MB",
        featured: true,
      },

      // ================= PYQ YEAR WISE =================
      {
        id: "3",
        title: "IPMAT 2019 Question Paper",
        fileName: "ipmat_2019_Question_Paper-1.pdf",
        section: "PYQ_YEAR",
        description: "Official IPMAT 2019 question paper.",
        uploadDate: "2024-03-10",
        size: "30 MB",
      },
      {
        id: "4",
        title: "IPMAT 2020 Question Paper",
        fileName: "ipmat_2020_Question_Paper-1.pdf",
        section: "PYQ_YEAR",
        description: "Official IPMAT 2020 question paper.",
        uploadDate: "2024-03-10",
        size: "30 MB",
      },
      {
        id: "5",
        title: "IPMAT 2021 Question Paper",
        fileName: "ipmat_2021_Question_Paper-1.pdf",
        section: "PYQ_YEAR",
        description: "Official IPMAT 2021 question paper.",
        uploadDate: "2024-03-10",
        size: "30 MB",
      },
      {
        id: "6",
        title: "IPMAT Indore 2022 Question Paper",
        fileName: "ipmat_indore_2022_Question_Paper-1.pdf",
        section: "PYQ_YEAR",
        description: "Official IPMAT 2022 question paper.",
        uploadDate: "2024-03-10",
        size: "30 MB",
      },
      {
        id: "7",
        title: "IPMAT Indore 2023 Question Paper",
        fileName: "ipmat_indore_2023_Question_Paper-1.pdf",
        section: "PYQ_YEAR",
        description: "Official IPMAT 2023 question paper.",
        uploadDate: "2024-03-10",
        size: "30 MB",
      },

      // ================= CHEAT SHEETS =================
      {
        id: "8",
        title: "Cheat Sheet – Quantitative Ability",
        fileName: "Cheat Sheet QA.pdf",
        section: "CHEAT_SHEET",
        description: "Quick revision formulas for Quantitative Ability.",
        uploadDate: "2024-03-10",
        size: "30 MB",
        featured: true,
      },
      {
        id: "9",
        title: "Cheat Sheet – Verbal Ability",
        fileName: "Cheat Sheet VA.pdf",
        section: "CHEAT_SHEET",
        description: "Quick revision notes for Verbal Ability.",
        uploadDate: "2024-03-10",
        size: "30 MB",
        featured: true,
      },
    ];

    setStudyMaterials(materials);
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

  const renderSection = (
    title: string,
    section: StudyMaterial["section"]
  ) => {
    const items = studyMaterials.filter((m) => m.section === section);
    if (!items.length) return null;

    return (
      <div className="mb-14">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((material) => (
            <div
              key={material.id}
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
                  {material.featured && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star size={12} /> Featured
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg">{material.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  {material.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPDF(material.fileName)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => downloadPDF(material.fileName)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-yellow-50">
      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
            <BookOpen size={40} className="text-purple-700" />
            Study Materials
          </h1>
          <p className="text-gray-600 text-lg">
            Section-wise curated preparation resources
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700" />
          </div>
        ) : (
          <>
            {renderSection("PYQ – Topic Wise", "PYQ_TOPIC")}
            {renderSection("PYQ – Year Wise", "PYQ_YEAR")}
            {renderSection("Cheat Sheets", "CHEAT_SHEET")}
          </>
        )}

        <div className="mt-10 rounded-xl p-6 bg-white border border-purple-200 shadow-md">
          <div className="flex items-start gap-4">
            <Lightbulb className="text-yellow-500" size={24} />
            <div>
              <h3 className="font-semibold mb-2">Study Tip</h3>
              <p className="text-sm text-gray-600">
                Practice PYQs year-wise after completing topic-wise revision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialsPage;

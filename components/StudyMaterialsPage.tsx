"use client";

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, Eye, Star, 
  AlertCircle, Lightbulb
} from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  category: string;
  description: string;
  uploadDate: string;
  size: string;
  pages?: number;
  featured?: boolean;
}

export const StudyMaterialsPage: React.FC = () => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const accentColor = '#823588';

  useEffect(() => {
    fetchPDFFiles();
  }, []);

  const fetchPDFFiles = async () => {
    try {
      setLoading(true);
      
      const defaultMaterials: StudyMaterial[] = [
        {
          id: "1",
          title: "PYQ TOPIC WISE",
          fileName: "PYQ TOPIC WISE.pdf",
          category: "Mathematics",
          description: "Comprehensive collection of essential formulas for competitive exams.",
          uploadDate: "2024-03-15",
          size: "2.5 MB",
          pages: 45,
          featured: true
        },
        {
          id: "2",
          title: "PYQ VERBAL ABILITY",
          fileName: "PYQ VERBAL ABILITY.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "3",
          title: "ipmat_2019_Question_Paper-1",
          fileName: "ipmat_2019_Question_Paper-1.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "4",
          title: "ipmat_2020_Question_Paper-1",
          fileName: "ipmat_2020_Question_Paper-1.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "5",
          title: "ipmat_2021_Question_Paper-1",
          fileName: "ipmat_2021_Question_Paper-1.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "6",
          title: "ipmat_indore_2022_Question_Paper-1",
          fileName: "ipmat_indore_2022_Question_Paper-1.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "7",
          title: "ipmat_indore_2023_Question_Paper-1",
          fileName: "ipmat_indore_2023_Question_Paper-1.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "8",
          title: "Cheat Sheet QA",
          fileName: "Cheat Sheet QA.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        },
        {
          id: "9",
          title: "Cheat Sheet VA",
          fileName: "Cheat Sheet VA.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions.",
          uploadDate: "2024-03-10",
          size: "30 MB",
        //   pages: 32,
          featured: true
        }
      ];
      
      setStudyMaterials(defaultMaterials);
    } catch (error) {
      console.error('Error loading study materials:', error);
      setStudyMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const openPDF = (fileName: string) => {
    window.open(`/${fileName}`, '_blank');
  };

  const downloadPDF = (fileName: string) => {
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white border border-purple-200 shadow-sm text-xs font-semibold uppercase tracking-widest text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            Study Resources
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3 text-gray-900">
            <BookOpen size={40} className="text-purple-700" />
            Study Materials
          </h1>
          <p className="text-gray-600 text-lg">Access comprehensive study resources</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        )}

        {!loading && studyMaterials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyMaterials.map((material) => (
              <div
                key={material.id}
                className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white border-2 border-purple-200 hover:border-yellow-400"
              >
                <div 
                  className="p-6 text-white" 
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText size={32} />
                    {material.featured && (
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{material.title}</h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {material.description}
                  </p>

                  <div className="space-y-2 mb-4 pb-4 border-b border-purple-200">
                    {material.pages && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen size={14} />
                        {material.pages} pages
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPDF(material.fileName)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => downloadPDF(material.fileName)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm font-medium transition"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl p-6 bg-white border border-purple-200 shadow-md">
          <div className="flex items-start gap-4">
            <Lightbulb className="flex-shrink-0 text-yellow-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Study Tips</h3>
              <p className="text-gray-600 text-sm">
                Download materials for offline study and combine with practice tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
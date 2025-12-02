"use client";
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, ExternalLink, 
  Search, Filter, Calendar, Eye, Star,
  GraduationCap, Lightbulb, Award, AlertCircle
} from 'lucide-react';
import DefaultLayout from "../defaultLayout";

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

const StudyMaterialPage: React.FC = () => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPDFFiles();
  }, []);

  const fetchPDFFiles = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from JSON file first
      try {
        const response = await fetch('/study-materials.json');
        if (response.ok) {
          const data = await response.json();
          setStudyMaterials(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('JSON file not found, using default materials');
      }
      
      // Fallback: Use the existing PDFs in public folder
      const defaultMaterials: StudyMaterial[] = [
        {
          id: "1",
          title: "Formula Book",
          fileName: "Formula Book.pdf",
          category: "Mathematics",
          description: "Comprehensive collection of essential formulas for competitive exams including JEE, NEET, and engineering entrance tests. Covers algebra, calculus, geometry, and trigonometry.",
          uploadDate: "2024-03-15",
          size: "2.5 MB",
          pages: 45,
          featured: true
        },
        {
          id: "2",
          title: "PI Kit 2024",
          fileName: "PI Kit 2024.pdf",
          category: "Interview Preparation",
          description: "Complete Personal Interview preparation kit for MBA admissions, including common questions, sample answers, do's and don'ts, and expert tips for success.",
          uploadDate: "2024-03-10",
          size: "1.8 MB",
          pages: 32,
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

  const categories = ["all", ...Array.from(new Set(studyMaterials.map(m => m.category)))];

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openPDF = (fileName: string) => {
    // Open PDF in new tab
    window.open(`/${fileName}`, '_blank');
  };

  const downloadPDF = (fileName: string, title: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#005de6] mb-2 flex items-center gap-3">
              <BookOpen size={36} />
              Study Materials
            </h1>
            <p className="text-gray-600">Access comprehensive study resources and preparation materials</p>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#005de6]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Materials</p>
                  <p className="text-3xl font-bold text-gray-900">{studyMaterials.length}</p>
                </div>
                <FileText className="text-[#005de6]" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length - 1}</p>
                </div>
                <Filter className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Featured</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {studyMaterials.filter(m => m.featured).length}
                  </p>
                </div>
                <Star className="text-purple-500" size={40} />
              </div>
            </div>
          </div> */}

          {/* Search and Filter */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search study materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005de6]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005de6] bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div> */}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005de6]"></div>
                <p>Loading study materials...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && studyMaterials.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Study Materials Available</h3>
              <p className="text-gray-500 mb-4">
                Please add study materials to the public folder and update the study-materials.json file
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <p className="text-sm text-gray-600 mb-2"><strong>Setup Instructions:</strong></p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Add PDF files to the <code className="bg-gray-200 px-1 rounded">/public</code> folder</li>
                  <li>Create <code className="bg-gray-200 px-1 rounded">/public/study-materials.json</code></li>
                  <li>Add material metadata in JSON format</li>
                </ol>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && studyMaterials.length > 0 && filteredMaterials.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Materials Grid */}
          {!loading && filteredMaterials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#005de6] to-[#003d99] p-6 text-white">
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
                    {/* <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
                      {material.category}
                    </span> */}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {material.description}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {/* <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(material.uploadDate)}
                        </span> */}
                        {/* <span>{material.size}</span> */}
                      </div>
                      {material.pages && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <BookOpen size={14} />
                          {material.pages} pages
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPDF(material.fileName)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#005de6] text-white rounded-lg text-sm font-medium hover:bg-[#003d99] transition"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => downloadPDF(material.fileName, material.title)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-[#005de6] text-[#005de6] rounded-lg text-sm font-medium hover:bg-[#005de6] hover:text-white transition"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Lightbulb className="text-blue-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Study Tips</h3>
                <p className="text-blue-700 text-sm">
                  Download materials for offline study, take notes, and revisit challenging topics regularly. 
                  Combine these resources with practice tests for best results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default StudyMaterialPage;
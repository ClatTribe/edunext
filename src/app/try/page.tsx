"use client";

import React, { useState } from "react";
import { LightLayout } from "../../../components/LightLayout";
import { VideoAnalysisPage } from "../../../components/VideoAnalysisPage";
import { StudyMaterialsPage } from "../../../components/StudyMaterialsPage";
import UnifiedCutoffsPage from "../../../components/cut-offs/UnifiedCutoffsPage"; // NEW IMPORT

export default function App() {
  const [currentPage, setCurrentPage] = useState("/try/video-analysis");

  const renderPage = () => {
    switch (currentPage) {
      case "/try/video-analysis":
        return <VideoAnalysisPage />;
      case "/try/study-materials":
        return <StudyMaterialsPage />;
      case "/try/cut-offs": // SINGLE ROUTE NOW
        return <UnifiedCutoffsPage />;
      case "/try/numbers":
      case "/try/averages":
      case "/try/reading-comprehension":
      case "/try/root-words":
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-600">This module is under development</p>
            </div>
          </div>
        );
      default:
        return <VideoAnalysisPage />;
    }
  };

  return (
    <LightLayout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </LightLayout>
  );
}
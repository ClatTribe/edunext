"use client";

import React, { useState } from "react";
import { LightLayout } from "../../../components/LightLayout";
import { VideoAnalysisPage } from "../../../components/VideoAnalysisPage";
import { StudyMaterialsPage } from "../../../components/StudyMaterialsPage";
<<<<<<< HEAD
import IIMIndoreCutoffTable from "../../../components/cut-offs/IIMIndoreCutoffTable";
import IIMRohtakCutoffTable from "../../../components/cut-offs/IIMRohtakCutoffTable";
import IIMShillongCutoffTable from "../../../components/cut-offs/IIMShillongCutoffTable";
import IIMRanchiCutoffTable from "../../../components/cut-offs/IIMRanchiCutoffTable";
import IIMBodhgayaCutoffTable from "../../../components/cut-offs/IIMBodhgayaCutoffTable";
import IIMSirmaurCutoffTable from "../../../components/cut-offs/IIMSirmaurCutoffTable";
import MindsetLogsPage from "../../../components/AIR1mindjournals";
import HourglassSystemPage from "../../../components/HourglassSystem";
import FormandanddeadlinesPage from "../../../components/FormsandDeadlines";
=======
import UnifiedCutoffsPage from "../../../components/cut-offs/UnifiedCutoffsPage"; // NEW IMPORT
>>>>>>> 16f3d916a127d368a80e198ceccd322d88e9ee8e

export default function App() {
  const [currentPage, setCurrentPage] = useState("/try/video-analysis");

  const renderPage = () => {
    switch (currentPage) {
      case "/try/video-analysis":
        return <VideoAnalysisPage />;
      case "/try/study-materials":
        return <StudyMaterialsPage />;
<<<<<<< HEAD
      case "/try/Cut-offs":
      case "/try/cut-offs/iim-indore":
        return <IIMIndoreCutoffTable />;
      case "/try/cut-offs/iim-rohtak":
        return <IIMRohtakCutoffTable />;
      case "/try/cut-offs/iim-shillong":
        return <IIMShillongCutoffTable />;
      case "/try/cut-offs/iim-ranchi":
        return <IIMRanchiCutoffTable />;
      case "/try/cut-offs/iim-bodhgaya":
        return <IIMBodhgayaCutoffTable />;
      case "/try/cut-offs/iim-sirmaur":
        return <IIMSirmaurCutoffTable />;
      case "/try/AIR1mind-journals":
        return <MindsetLogsPage />;
      case "/try/Hourglass-System":
        return <HourglassSystemPage />;
      case "/try/forms-deadlines":
        return <FormandanddeadlinesPage />;
=======
      case "/try/cut-offs": // SINGLE ROUTE NOW
        return <UnifiedCutoffsPage />;
      case "/try/numbers":
      case "/try/averages":
>>>>>>> 16f3d916a127d368a80e198ceccd322d88e9ee8e
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
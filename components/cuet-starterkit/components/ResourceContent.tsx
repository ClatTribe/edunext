import React from "react";
import { ResourceTab } from "../types";
import { PYQSection } from "./sections/PYQSection";
import { CheatSheetsSection } from "./sections/CheatSheetsSection";
import { FormsSection } from "./sections/FormsSection";
import { DeskSection } from "./sections/DeskSection";
import MindJournalsSection from "./sections/MindJournalsSection";
import UnifiedCutoffsPage from "./cut-offs/UnifiedCutoffsPage";
import ContactSection from "./sections/ContactSection";

interface Props {
  activeTab: ResourceTab;
}

export const ResourceContent: React.FC<Props> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case ResourceTab.PYQ:
        return <PYQSection />;
      case ResourceTab.CHEATSHEETS:
        return <CheatSheetsSection />;
      case ResourceTab.FORMS:
        return <FormsSection />;
      case ResourceTab.DESK:
        return <DeskSection />;
      case ResourceTab.COLLEGES:
        return <UnifiedCutoffsPage />;
      case ResourceTab.MIND_JOURNALS:
        return <MindJournalsSection />;
      case ResourceTab.CONTACTS:
        return <ContactSection />;
      default:
        return <div className="text-white">Content for {activeTab} is coming soon!</div>;
    }
  };

  return <div className="animate-in fade-in zoom-in-95 duration-500">{renderContent()}</div>;
};

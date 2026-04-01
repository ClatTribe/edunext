import React, { useState } from "react";
import { ResourceTabs } from "./components/ResourceTabs";
import { ResourceContent } from "./components/ResourceContent";
import { ResourceTab } from "./types";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResourceTab>(ResourceTab.PYQ);

  return (
    <div className="flex h-screen bg-[#05070a] text-slate-200 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10"></div>

        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-16 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                CUET FREE LEARNING RESOURCES
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                CUET <span className="text-[#f9a01b]">Starter Kit.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                Prepare smarter for CUET with structured practice resources, exam updates, and university-focused
                guidance to boost your admission chances.
              </p>
            </div>

            <ResourceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-8">
              <ResourceContent activeTab={activeTab} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Users, School, FileCheck, TrendingUp } from "lucide-react";

interface Station {
  id: number;
  title: string;
  emoji: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  position: "left" | "right";
  icon: React.ElementType;
}

const TrainRoadmap: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const roadmapRef = useRef<HTMLDivElement>(null);

  const stations: Station[] = [
    {
      id: 1,
      title: "Research",
      emoji: "✨",
      description: "Explore 2000+ Dream MBA Colleges",
      buttonText: "Try Course Finder",
      buttonLink: "/find-colleges",
      position: "right",
      icon: Search,
    },
    {
      id: 2,
      title: "Discuss",
      emoji: "✨",
      description: "Get 1-on-1 Counselling from our experts",
      buttonText: "Book Free Counselling",
      buttonLink: "/counselling",
      position: "left",
      icon: Users,
    },
    {
      id: 3,
      title: "Ideate",
      emoji: "✨",
      description: "Find the perfect College",
      buttonText: "Get University Shortlist",
      buttonLink: "/your-shortlist",
      position: "right",
      icon: School,
    },
    {
      id: 4,
      title: "Apply",
      emoji: "✨",
      description: "Complete your applications with guidance",
      buttonText: "Start Application",
      buttonLink: "/application-builder",
      position: "left",
      icon: FileCheck,
    },
    {
      id: 5,
      title: "Success",
      emoji: "✨",
      description: "Track your progress and celebrate achievements",
      buttonText: "View Dashboard",
      buttonLink: "/home",
      position: "right",
      icon: TrendingUp,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(s => (s + 1) % stations.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleButtonClick = (link: string) => {
    window.location.href = link;
  };

  return (
    <div ref={roadmapRef} className="relative w-full bg-slate-950 py-32 px-6 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute w-[800px] h-[800px] bg-indigo-600/20 top-[-300px] left-1/2 -translate-x-1/2 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-sky-500/10 bottom-[-100px] right-[-100px] blur-[120px] rounded-full" />

      {/* Header */}
      <div className="text-center mb-24 relative z-10">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Roadmap
          </span>
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">Your future. Without the noise.</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 text-white leading-tight">
          Your Dream MBA Journey
        </h1>
        <h2 className="text-lg md:text-xl text-slate-400 leading-relaxed">
          A perfectly orchestrated path to your dream admit
        </h2>
      </div>

      {/* Desktop Horizontal Layout */}
      <div className="hidden md:block max-w-7xl mx-auto relative">
        {/* Horizontal Progress Line */}
        <div className="absolute top-[75px] left-0 w-full h-0.5 bg-slate-800/50 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-1000 ease-in-out" 
            style={{ width: `${(activeStep / (stations.length - 1)) * 100}%` }}
          />
        </div>

        {/* Horizontal Stations */}
        <div className="flex justify-between relative">
          {stations.map((station, i) => (
            <div 
              key={i} 
              onMouseEnter={() => setActiveStep(i)}
              className="flex flex-col items-center text-center cursor-pointer transition-all duration-500 relative"
              style={{ width: `${100 / stations.length}%` }}
            >
              {/* Icon Circle with Background Box */}
              <div className={`relative mb-12 transition-all duration-500 ${activeStep === i ? 'scale-110' : ''}`}>
                {/* Background Box */}
                <div className={`absolute inset-0 rounded-[2rem] transition-all duration-500 ${activeStep === i ? 'bg-indigo-600/10 border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.3)]' : 'bg-transparent'}`} 
                     style={{ 
                       width: '120px', 
                       height: '120px',
                       left: '50%',
                       top: '50%',
                       transform: 'translate(-50%, -50%)',
                       padding: '10px'
                     }} 
                />
                
                {/* Icon Circle */}
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center relative z-10 backdrop-blur-xl border-2 transition-all duration-500 ${activeStep === i ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-900/50 border-slate-700'}`}>
                  <station.icon className={`w-10 h-10 ${activeStep === i ? 'text-indigo-400' : 'text-slate-600'}`} />
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-xl font-black mb-2 transition-colors duration-500 ${activeStep === i ? 'text-white' : 'text-slate-600'}`}>
                {station.title}
              </h3>

              {/* Subtitle - Always uppercase */}
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] max-w-[180px] px-2 transition-colors duration-500 ${activeStep === i ? 'text-slate-400' : 'text-slate-700'}`}>
                {station.description.replace('Explore 2000+ Dream MBA Colleges', 'EXPLORE 2000+ PROGRAMS')
                  .replace('Get 1-on-1 Counselling from our experts', 'EXPERT CONSULTATIONS')
                  .replace('Find the perfect College', 'STRATEGY & SHORTLISTING')
                  .replace('Complete your applications with guidance', 'APPLICATION MASTERY')
                  .replace('Track your progress and celebrate achievements', 'FINAL ADMISSIONS')}
              </p>

              {/* Description Card - Shows below on active */}
              {activeStep === i && (
                <div className="absolute top-72 left-1/2 -translate-x-1/2 w-80 bg-transparent animate-in fade-in slide-in-from-top-4 duration-500 z-20">
                  <p className="text-sm text-slate-300 leading-relaxed text-center">{station.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Vertical Layout */}
      <div className="md:hidden max-w-2xl mx-auto relative">
        {/* Vertical Progress Line */}
        <div className="absolute left-[60px] top-0 w-1 bg-slate-800 overflow-hidden rounded-full" style={{ height: '100%' }}>
          <div 
            className="w-full bg-gradient-to-b from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-1000 ease-in-out" 
            style={{ height: `${(activeStep / (stations.length - 1)) * 100}%` }}
          />
        </div>

        {/* Vertical Stations */}
        <div className="space-y-24 py-8">
          {stations.map((station, i) => (
            <div 
              key={i} 
              onClick={() => setActiveStep(i)}
              className="flex items-start gap-6 cursor-pointer relative"
            >
              {/* Icon Circle */}
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 backdrop-blur-xl border transition-all duration-500 ${activeStep === i ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-110' : 'bg-white/5 border-white/10'}`}>
                <station.icon className={`w-10 h-10 ${activeStep === i ? 'text-indigo-400' : 'text-slate-500'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-2xl font-black ${activeStep === i ? 'text-white' : 'text-slate-400'}`}>
                    {station.title}
                  </h3>
                  <span className="text-lg">{station.emoji}</span>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {station.description}
                </p>

                {activeStep === i && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick(station.buttonLink);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 animate-in fade-in slide-in-from-left-4 duration-500"
                  >
                    {station.buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainRoadmap;
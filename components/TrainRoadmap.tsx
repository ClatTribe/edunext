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
  const [scrollProgress, setScrollProgress] = useState(0);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stations: Station[] = [
    {
      id: 1,
      title: "Research",
      emoji: "✨",
      description: "Explore 75k+ Courses across 1k Universities",
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
      description: "Find the perfect Universities for you",
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
    const handleScroll = () => {
      if (roadmapRef.current && stationRefs.current.length > 0) {
        const roadmapTop = roadmapRef.current.getBoundingClientRect().top;
        const roadmapHeight = roadmapRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const lastStationRef = stationRefs.current[stationRefs.current.length - 1];
        let maxProgress = 80;
        
        if (lastStationRef && roadmapRef.current) {
          const roadmapRect = roadmapRef.current.getBoundingClientRect();
          const lastStationRect = lastStationRef.getBoundingClientRect();
          const lastStationRelativeTop = lastStationRect.top - roadmapRect.top + roadmapRef.current.scrollTop;
          maxProgress = (lastStationRelativeTop / roadmapHeight) * 100;
        }
        
        const viewportProgress = Math.max(0, Math.min(1, -roadmapTop / (roadmapHeight - windowHeight)));
        setScrollProgress(Math.min(viewportProgress * 100, maxProgress));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollProgress]);

  const handleButtonClick = (link: string) => {
    window.location.href = link;
  };

  return (
    <div ref={roadmapRef} className="relative w-full bg-gradient-to-b from-blue-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2f61ce] mb-4">
          Your Dream MBA Journey
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-600">
          Start With Us
        </h2>
      </div>

      {/* Roadmap Container */}
      <div className="max-w-6xl mx-auto relative pb-32">
        {/* Vertical Line - Desktop */}
        <div 
          className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 bg-[#e0e0e0]"
          style={{ 
            height: `${Math.min(scrollProgress, 100)}%`,
            maxHeight: '100%'
          }}
        />
        
        {/* Vertical Line - Mobile */}
        <div 
          className="md:hidden absolute left-8 top-0 w-0.5 bg-[#e0e0e0]"
          style={{ 
            height: `${Math.min(scrollProgress, 100)}%`,
            maxHeight: '100%'
          }}
        />

        {/* Animated Train - Desktop */}
        <div
          className="hidden md:block absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-30 pointer-events-none"
          style={{ top: `${scrollProgress}%` }}
        >
          <div className="text-5xl filter drop-shadow-lg">
            🚂
          </div>
        </div>

        {/* Animated Train - Mobile */}
        <div
          className="md:hidden absolute left-8 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-30 pointer-events-none"
          style={{ top: `${scrollProgress}%` }}
        >
          <div className="text-4xl filter drop-shadow-lg">
            🚂
          </div>
        </div>

        {/* Stations */}
        <div className="relative space-y-24 md:space-y-28">
          {stations.map((station, index) => (
            <div
              key={station.id}
              ref={(el) => {
                stationRefs.current[index] = el;
              }}
              className="relative min-h-[120px]"
            >
              {/* Station Circle on Track - Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 transform -translate-x-1/2 z-20">
                <div className="w-14 h-14 rounded-full border-3 bg-[#fac300] border-[#fac300] flex items-center justify-center">
                  <station.icon size={24} className="text-[#2f61ce]" />
                </div>
              </div>

              {/* Station Circle on Track - Mobile */}
              <div className="md:hidden absolute left-8 top-0 transform -translate-x-1/2 z-20">
                <div className="w-12 h-12 rounded-full border-3 bg-[#fac300] border-[#fac300] flex items-center justify-center">
                  <station.icon size={20} className="text-[#2f61ce]" />
                </div>
              </div>

              {/* Content Card - Right Side */}
              {station.position === "right" && (
                <div className="ml-16 md:ml-0 md:absolute md:left-1/2 md:pl-20 md:top-0 md:w-[400px]">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2f61ce]">
                      {station.title}
                    </h3>
                    <span className="text-lg">{station.emoji}</span>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg mb-4 leading-relaxed font-medium">
                    {station.description}
                  </p>
                  <button
                    onClick={() => handleButtonClick(station.buttonLink)}
                    className="inline-block px-6 py-2.5 border-2 border-[#2f61ce] text-[#2f61ce] font-semibold rounded-full hover:bg-[#2f61ce] hover:text-white transition-all duration-300"
                  >
                    {station.buttonText}
                  </button>
                </div>
              )}

              {/* Content Card - Left Side */}
              {station.position === "left" && (
                <div className="ml-16 md:ml-0 md:absolute md:right-1/2 md:pr-20 md:top-0 md:w-[400px] md:text-right">
                  <div className="flex items-center gap-2 mb-3 md:justify-end">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2f61ce]">
                      {station.title}
                    </h3>
                    <span className="text-lg">{station.emoji}</span>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg mb-4 leading-relaxed font-medium">
                    {station.description}
                  </p>
                  <div className="md:flex md:justify-end">
                    <button
                      onClick={() => handleButtonClick(station.buttonLink)}
                      className="inline-block px-6 py-2.5 border-2 border-[#2f61ce] text-[#2f61ce] font-semibold rounded-full hover:bg-[#2f61ce] hover:text-white transition-all duration-300"
                    >
                      {station.buttonText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* End of Journey Indicator */}
        {/* <div className="text-center pt-20">
          <div className="inline-block bg-[#2f61ce] text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <p className="text-lg sm:text-xl font-bold">🎓 Start Your Journey Today! 🎓</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default TrainRoadmap;
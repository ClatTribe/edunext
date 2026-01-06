"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Crown } from "lucide-react";

export const AIR1CommandCenter: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const accentColor = "#823588";

  const comparisonImages = [
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691350/1_kiwmno.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691432/2_ow8cnm.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691468/3_hfgvl6.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691494/4_mehnyw.jpg",
  ];

  const openPDF = (fileName: string) => {
    window.open(`/${fileName}`, "_blank");
  };

  const nextSlide = () => {
    if (currentSlide < comparisonImages.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Crown size={40} className="text-yellow-500" />
            AIR 1 Command Center
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Exclusive insights from the top ranker's journey
          </p>
        </div>

        {/* Tag 1: Study Materials Used */}
        <div className="mb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ color: accentColor }}
          >
            Study Materials Used
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Left: Phone Screenshot */}
            <div className="w-full md:w-auto flex justify-center">
              <img
                src="https://res.cloudinary.com/daetdadtt/image/upload/v1767689500/WhatsApp_Image_2026-01-06_at_14.14.55_lwhwnk.jpg"
                alt="Study Materials"
                className="rounded-xl shadow-lg max-w-xs w-full h-auto border-2 border-purple-200"
              />
            </div>

            {/* Right: Resource */}
            <div className="w-full md:w-96">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: accentColor }}
                  ></div>
                  <span className="text-4xl text-yellow-500 font-bold">550</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  PYQs practiced from this resource
                </p>
                <button
                  onClick={() => openPDF("ipmat_2019_Question_Paper-1.pdf")}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  <ExternalLink size={18} />
                  View PDF Resource
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tag 2: Questions He Found Challenging */}
        <div className="mb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ color: accentColor }}
          >
            Questions He Found Challenging
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Left: Phone Screenshot */}
            <div className="w-full md:w-auto flex justify-center">
              <img
                src="https://res.cloudinary.com/daetdadtt/image/upload/v1767691017/WhatsApp_Image_2026-01-06_at_14.17.06_k1bdpw.jpg"
                alt="Challenging Questions"
                className="rounded-xl shadow-lg max-w-xs w-full h-auto border-2 border-purple-200"
              />
            </div>

            {/* Right: Resource */}
            <div className="w-full md:w-96">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: accentColor }}
                  ></div>
                  <span className="text-4xl">💡</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Questions that tested him the most
                </p>
                <button
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  <ExternalLink size={18} />
                  Access Resource
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tag 3: Time Table */}
        <div className="mb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ color: accentColor }}
          >
            Time Table
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Left: Phone Screenshot */}
            <div className="w-full md:w-auto flex justify-center">
              <img
                src="https://res.cloudinary.com/daetdadtt/image/upload/v1767691018/WhatsApp_Image_2026-01-06_at_14.17.21_xyzjtt.jpg"
                alt="Time Table"
                className="rounded-xl shadow-lg max-w-xs w-full h-auto border-2 border-purple-200"
              />
            </div>

            {/* Right: Resource */}
            <div className="w-full md:w-96">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: accentColor }}
                  ></div>
                  <span className="text-4xl">📅</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Daily schedule followed by AIR 1
                </p>
                <button
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  <ExternalLink size={18} />
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tag 4: AIR 1 vs You */}
        <div className="mb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ color: accentColor }}
          >
            AIR 1 vs You
          </h2>
          <div className="flex flex-col items-center">
            {/* Swipeable Carousel */}
            <div className="relative w-full max-w-2xl mb-6">
              <img
                src={comparisonImages[currentSlide]}
                alt={`Comparison ${currentSlide + 1}`}
                className="rounded-xl shadow-lg w-full h-auto border-2 border-purple-200"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-100 transition-all"
                style={{
                  color: accentColor,
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlide === comparisonImages.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-100 transition-all"
                style={{
                  color: accentColor,
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {comparisonImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor:
                        currentSlide === index ? accentColor : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom: Simple Button */}
            <div className="w-full max-w-md">
              <button
                className="w-full px-6 py-3 text-white rounded-lg text-base font-semibold hover:opacity-90 transition-all shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                View Detailed Comparison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIR1CommandCenter;
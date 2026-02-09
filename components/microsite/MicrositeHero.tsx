"use client"
import React from 'react'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MicrositeHeroProps {
  collegeName: string
  location?: string
  fees?: string
  avgPackage?: string
  highestPackage?: string
  ranking?: string
  image?: string
}

const primaryBg = '#060818'

export default function MicrositeHero({
  collegeName,
  location,
  fees,
  avgPackage,
  ranking,
  image
}: MicrositeHeroProps) {
  
  const details = [
    fees && 'Fees',
    'Admission',
    'Courses',
    avgPackage && 'Placement',
    ranking && 'Ranking',
    'Cutoff'
  ].filter(Boolean)

  return (
    <div 
      className="relative overflow-hidden pt-6 pb-6 md:pt-12 md:pb-10 px-4 sm:px-8 md:px-12 flex items-center"
      style={{ backgroundColor: primaryBg }}
    >
      {/* Background Pattern - Increased contrast slightly for depth */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>

      {/* Static Radial Glow for focus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-center">
          
          {/* Text Content Area */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left order-2 md:order-1">
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-6">
              {location && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 cursor-default">
                  <MapPin size={12} className="text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Admissions Open 2026</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-t from-slate-500 via-slate-300 to-white bg-clip-text text-transparent">
                  {collegeName}
                </span>
                <span className="bg-gradient-to-t from-slate-400 via-slate-200 to-white/80 bg-clip-text text-transparent text-lg md:text-2xl lg:text-3xl font-bold block mt-3 md:mt-4">
                  {details.length > 0 && `Explore ${details.join(', ')}`}
                </span>
              </h1>
            </div>
          </div>

          {/* Image Section - Enhanced Hover/Styling */}
          {image && (
            <div className="w-full md:w-[45%] lg:w-[42%] shrink-0 order-1 md:order-2">
              <div className="relative group">
                {/* Fixed Glow Effect behind image */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                  <img 
                    src={image} 
                    alt={collegeName}
                    className="relative object-cover w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Subtle overlay on hover to make the image "pop" */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
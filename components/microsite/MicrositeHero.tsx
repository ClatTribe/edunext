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
      className="relative overflow-hidden pt-10 pb-10 md:pt-20 md:pb-16 px-4 sm:px-8 md:px-12 flex items-center"
      style={{ backgroundColor: primaryBg }}
    >
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-center">
          
          {/* Text Content Area */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left order-2 md:order-1">
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {location && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
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
                <span className="bg-gradient-to-t from-slate-400 via-slate-200 to-white/80 bg-clip-text text-transparent text-lg md:text-2xl lg:text-3xl font-bold block mt-4">
                  {details.length > 0 && `Explore ${details.join(', ')}`}
                </span>
              </h1>
            </div>

            {/* Big Action Button */}
            <div className="mt-10">
              <Link 
                href="/find-colleges"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft size={22} className="transition-transform group-hover:-translate-x-2 text-amber-500" />
                <span className="text-sm md:text-base font-bold uppercase tracking-widest">Back to All Colleges</span>
              </Link>
            </div>
          </div>

          {/* Image Section */}
          {image && (
            <div className="w-full md:w-[45%] lg:w-[42%] shrink-0 order-1 md:order-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-blue-500/30 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <img 
                  src={image} 
                  alt={collegeName}
                  className="relative rounded-[2rem] border border-white/10 shadow-2xl object-cover w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
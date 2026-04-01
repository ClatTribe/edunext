"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin, ChevronLeft, ChevronRight, Play, Pause,
  ArrowLeft, Heart, GitCompare
} from 'lucide-react'
import { supabase } from "../../lib/supabase"
import useSavedMicrositeCourses from "./SavedCollegeMicrosites"
import useCollegeMicrositeComparison, { CompareFloatingButton } from "./CollegeMicrositesComparison"

interface MicrositeHeroProps {
  collegeId: number
  collegeName: string
  location?: string
  fees?: string
  avgPackage?: string
  highestPackage?: string
  ranking?: string
  image?: string | string[]
  video?: string | string[]
  podcast?: string
  slug?: string
}

const primaryBg = '#060818'

export default function MicrositeHero({
  collegeId,
  collegeName,
  location,
  fees,
  avgPackage,
  ranking,
  image,
  video,
  podcast,
  slug,
}: MicrositeHeroProps) {

  const [isIncognitoOpen, setIsIncognitoOpen] = useState(false)
  const incognitoRef = useRef<HTMLDivElement>(null)

  // ── Auth user ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // ── Minimal college object for hooks ──────────────────────────────────────
  const collegeObj = useMemo(() => ({
    id: collegeId,
    "College Name": collegeName,
    college_name: collegeName,
    slug,
  }), [collegeId, collegeName, slug])

  // ── Shortlist hook ────────────────────────────────────────────────────────
  const { savedMicrositeCourses, toggleSavedMicrosite } = useSavedMicrositeCourses(user)
  const isSaved = savedMicrositeCourses.has(collegeId)

  // ── Compare hook ──────────────────────────────────────────────────────────
  const {
    compareColleges,
    toggleCompare,
    isInCompare,
    goToComparison,
  } = useCollegeMicrositeComparison({ user, colleges: [collegeObj] as any })
  const inCompare = isInCompare(collegeId)

  // ── Click outside incognito ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (incognitoRef.current && !incognitoRef.current.contains(event.target as Node)) {
        setIsIncognitoOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ── Details line ──────────────────────────────────────────────────────────
  const details = [
    fees && 'Fees',
    'Admission',
    'Courses',
    avgPackage && 'Placement',
    ranking && 'Ranking',
    'Cutoff'
  ].filter(Boolean)

  // ── Media parsing ─────────────────────────────────────────────────────────
  const parseMedia = (media: string | string[] | undefined): string[] => {
    if (!media) return []
    if (Array.isArray(media)) return media
    if (typeof media === 'string') {
      try {
        const parsed = JSON.parse(media)
        return Array.isArray(parsed) ? parsed : [media]
      } catch { return [media] }
    }
    return []
  }

  const images = parseMedia(image)
  const videos = parseMedia(video)
  const mediaItems = [
    ...images.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (mediaItems.length <= 1 || isPlaying) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mediaItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [mediaItems.length, isPlaying])

  useEffect(() => { setIsPlaying(false) }, [currentSlide])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mediaItems.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  const handleVideoClick = () => setIsPlaying(true)

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: primaryBg }}>

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* ── BACK BUTTON ── */}
      <div className="relative z-20 px-4 sm:px-8 md:px-12 pt-5 pb-0 max-w-7xl mx-auto w-full">
        <Link
          href="/find-colleges"
          className="inline-flex items-center gap-2.5 px-5 h-11 sm:h-12 rounded-full
            bg-white/[0.04] border border-amber-500/20 backdrop-blur-sm
            hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5
            active:scale-[0.97] transition-all duration-300 group"
        >
          <ArrowLeft size={18} className="text-amber-500 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
            Back
          </span>
        </Link>
      </div>

      {/* ── MAIN HERO CONTENT ── */}
      <div className="relative z-10 px-4 sm:px-8 md:px-12 pt-5 pb-6 md:pt-7 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-center">

          {/* ────────────────────────────────────────
              LEFT: Text Content
          ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left order-1 md:order-1">

            {/* Incognito Badge */}
            <div
              ref={incognitoRef}
              className="group mb-5 md:mb-6 self-center md:self-start cursor-pointer"
              onClick={() => setIsIncognitoOpen(!isIncognitoOpen)}
            >
              <div className="relative">
                <div className={`absolute -inset-1 bg-amber-600/20 rounded-full blur-xl transition-opacity duration-700
                  ${isIncognitoOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                <div className={`relative flex items-center bg-zinc-900/60 border border-white/10 rounded-full shadow-2xl transition-all duration-500 overflow-hidden
                  ${isIncognitoOpen ? 'pr-5' : 'group-hover:pr-5'}`}>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-gray-300 to-zinc-300 group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-500 rounded-full">
                    <img
                      src="/icognito.png"
                      alt="Incognito"
                      className={`w-5 h-5 sm:w-6 sm:h-6 object-contain transition-all duration-500
                        ${isIncognitoOpen ? 'brightness-0' : 'brightness-100 group-hover:brightness-0'}`}
                    />
                  </div>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap
                    ${isIncognitoOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>
                    <div className="pl-3">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-0.5">Privacy Shield</span>
                      <span className="text-[12px] font-bold text-slate-100">Ghost Mode Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location + Admissions badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-5">
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

            {/* ══════════════════════════════════════════════════════════
                ★ SHORTLIST + COMPARE ACTION BAR ★
                Below location badges, above college name.
                Pill buttons — large, glowing, animated state changes.
            ══════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6 md:mb-7 w-full">

              {/* ── Shortlist Button ── */}
              <button
                onClick={() => toggleSavedMicrosite(collegeObj as any)}
                className="relative group/heart flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] overflow-hidden"
                style={{
                  background: isSaved
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.95) 0%, rgba(251,146,60,0.95) 100%)'
                    : 'rgba(0,0,0,0.4)',
                  border: isSaved
                    ? '1px solid rgba(245,158,11,0.6)'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: isSaved ? '#050818' : '#64748b',
                  boxShadow: isSaved
                    ? '0 0 28px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : 'none',
                }}
              >
                {/* hover glow (unsaved state only) */}
                {!isSaved && (
                  <span className="absolute inset-0 bg-amber-500/8 opacity-0 group-hover/heart:opacity-100 transition-opacity duration-300 rounded-2xl" />
                )}
                <span className="relative flex items-center gap-2.5">
                  <Heart
                    size={15}
                    fill={isSaved ? 'currentColor' : 'none'}
                    className={`transition-all duration-300 flex-shrink-0 ${
                      isSaved
                        ? 'scale-110'
                        : 'group-hover/heart:text-amber-400 group-hover/heart:scale-110'
                    }`}
                  />
                  <span className={`transition-colors duration-300 ${!isSaved ? 'group-hover/heart:text-amber-400' : ''}`}>
                    {isSaved ? '✓ Shortlisted' : 'Shortlist College'}
                  </span>
                </span>
              </button>

              {/* ── Compare Button ── */}
              <button
                onClick={() => toggleCompare(collegeObj as any)}
                className="relative group/compare flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] overflow-hidden"
                style={{
                  background: inCompare
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.95) 0%, rgba(139,92,246,0.95) 100%)'
                    : 'rgba(0,0,0,0.4)',
                  border: inCompare
                    ? '1px solid rgba(168,85,247,0.6)'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: inCompare ? '#ffffff' : '#64748b',
                  boxShadow: inCompare
                    ? '0 0 28px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : 'none',
                }}
              >
                {/* hover glow (not-in-compare state only) */}
                {!inCompare && (
                  <span className="absolute inset-0 bg-purple-500/8 opacity-0 group-hover/compare:opacity-100 transition-opacity duration-300 rounded-2xl" />
                )}
                <span className="relative flex items-center gap-2.5">
                  <GitCompare
                    size={15}
                    className={`transition-all duration-300 flex-shrink-0 ${
                      inCompare
                        ? 'rotate-12 scale-110'
                        : 'group-hover/compare:text-purple-400 group-hover/compare:rotate-12'
                    }`}
                  />
                  <span className={`transition-colors duration-300 ${!inCompare ? 'group-hover/compare:text-purple-400' : ''}`}>
                    {inCompare ? '✓ Added to Compare' : 'Add to Compare'}
                  </span>
                </span>
              </button>

            </div>
            {/* ══ END ACTION BAR ══ */}

            {/* College Name & Details */}
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

            {/* Podcast */}
            {podcast && (
              <div className="w-full max-w-md mt-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400">College Podcast</p>
                        <p className="text-sm font-semibold text-slate-200">Listen & Learn</p>
                      </div>
                    </div>
                    <audio controls className="w-full h-10 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
                      <source src={podcast} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────
              RIGHT: Media Carousel — clean, no button overlays
          ──────────────────────────────────────── */}
          {mediaItems.length > 0 && (
            <div className="w-full md:w-[45%] lg:w-[42%] shrink-0 order-2 md:order-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                  <div className="relative w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] bg-black/20">

                    {/* Media content */}
                    {mediaItems[currentSlide].type === 'image' ? (
                      <img
                        src={mediaItems[currentSlide].url}
                        alt={`${collegeName} - Slide ${currentSlide + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="relative w-full h-full group/video">
                        {getYouTubeId(mediaItems[currentSlide].url) ? (
                          <>
                            {!isPlaying ? (
                              <>
                                <img
                                  src={`https://img.youtube.com/vi/${getYouTubeId(mediaItems[currentSlide].url)}/maxresdefault.jpg`}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${getYouTubeId(mediaItems[currentSlide].url)}/hqdefault.jpg`
                                  }}
                                />
                                <div onClick={handleVideoClick} className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover/video:bg-black/30 transition-colors">
                                  <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transform group-hover/video:scale-110 transition-transform">
                                    <Play size={32} className="text-white ml-1" fill="white" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${getYouTubeId(mediaItems[currentSlide].url)}?autoplay=1`}
                                title="College Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            )}
                          </>
                        ) : (
                          <>
                            {!isPlaying ? (
                              <>
                                <video className="w-full h-full object-cover" src={mediaItems[currentSlide].url} preload="metadata" />
                                <div onClick={handleVideoClick} className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover/video:bg-black/30 transition-colors">
                                  <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center shadow-2xl transform group-hover/video:scale-110 transition-transform">
                                    <Play size={32} className="text-white ml-1" fill="white" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <video className="w-full h-full object-cover" controls autoPlay src={mediaItems[currentSlide].url} />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Hover tint */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  </div>

                  {/* Prev / Next arrows */}
                  {mediaItems.length > 1 && (
                    <>
                      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10" aria-label="Previous slide">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10" aria-label="Next slide">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {mediaItems.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {mediaItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/40 hover:bg-white/60'}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Photo / Video badge — top right */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {mediaItems[currentSlide].type === 'image' ? '📷 Photo' : '🎥 Video'}
                    </span>
                  </div>

                  {/* Playing indicator */}
                  {isPlaying && mediaItems[currentSlide].type === 'video' && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md border border-white/20 z-10 animate-pulse">
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Pause size={12} /> Paused
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── FLOATING COMPARE BUTTON (fixed bottom-right, z-50 beats sub-navbar) ── */}
      <CompareFloatingButton
        compareCount={compareColleges.length}
        onCompareClick={goToComparison}
      />

    </div>
  )
}
"use client"
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  MapPin, ChevronLeft, ChevronRight, Play, Pause,
  ArrowLeft, Heart,
} from 'lucide-react'
import { supabase } from "../../lib/supabase"
import useSavedMicrositeCourses from "./SavedCollegeMicrosites"
import useCollegeMicrositeComparison, { CompareFloatingButton } from "./CollegeMicrositesComparison"
import CollegeBellButton from "../CollegeBellButton"

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

// ─────────────────────────────────────────────────────────────────────────────
// MediaSlide — defined OUTSIDE parent so React never unmounts/remounts it on
// parent re-renders → the root cause of the "blinking" photo on mobile.
// All dynamic values come in as props; nothing is closed-over from the parent.
// ─────────────────────────────────────────────────────────────────────────────
interface MediaSlideProps {
  mediaItems: { type: string; url: string }[]
  currentSlide: number
  isPlaying: boolean
  collegeName: string
  onVideoClick: () => void
  onPrev: () => void
  onNext: () => void
  onDot: (i: number) => void
}

function MediaSlide({
  mediaItems,
  currentSlide,
  isPlaying,
  collegeName,
  onVideoClick,
  onPrev,
  onNext,
  onDot,
}: MediaSlideProps) {
  if (mediaItems.length === 0) return null

  const current = mediaItems[currentSlide]

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    return m ? m[1] : null
  }

  const ytId = current.type === 'video' ? getYouTubeId(current.url) : null

  return (
    <div className="relative w-full h-full bg-black">

      {/* ── Media content ── */}
      {current.type === 'image' ? (
        <img
          key={current.url}
          src={current.url}
          alt={`${collegeName} – slide ${currentSlide + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : ytId ? (
        <div key={current.url} className="relative w-full h-full">
          {!isPlaying ? (
            <>
              <img
                src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                }}
              />
              <div
                onClick={onVideoClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/30 transition-colors"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </div>
            </>
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              title="College Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div key={current.url} className="relative w-full h-full">
          {!isPlaying ? (
            <>
              <video className="w-full h-full object-cover" src={current.url} preload="metadata" />
              <div
                onClick={onVideoClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/30 transition-colors"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </div>
            </>
          ) : (
            <video className="w-full h-full object-cover" controls autoPlay src={current.url} />
          )}
        </div>
      )}

      {/* Media badge */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 z-10 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
          {current.type === 'image' ? '📷 Photo' : '🎥 Video'}
        </span>
      </div>

      {/* Playing indicator */}
      {isPlaying && current.type === 'video' && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-md border border-white/20 z-10 animate-pulse pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Pause size={10} /> Live
          </span>
        </div>
      )}

      {/* Prev / Next arrows */}
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/75 transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/75 transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => onDot(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/40 w-1.5 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
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

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // ── College object (stable reference) ────────────────────────────────────
  const collegeObj = useMemo(() => ({
    id: collegeId,
    'College Name': collegeName,
    college_name: collegeName,
    slug,
  }), [collegeId, collegeName, slug])

  // ── Shortlist & Compare hooks ─────────────────────────────────────────────
  const { savedMicrositeCourses, toggleSavedMicrosite } = useSavedMicrositeCourses(user)
  const isSaved = savedMicrositeCourses.has(collegeId)

  const { compareColleges, toggleCompare, isInCompare, goToComparison } =
    useCollegeMicrositeComparison({ user, colleges: [collegeObj] as any })
  const inCompare = isInCompare(collegeId)

  // ── Desktop incognito (hover-expand, click-to-lock) ───────────────────────
  const [isIncognitoOpen, setIsIncognitoOpen] = useState(false)
  const desktopIncognitoRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopIncognitoRef.current && !desktopIncognitoRef.current.contains(e.target as Node))
        setIsIncognitoOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Mobile incognito (tap → badge for 2 s then fades out) ─────────────────
  const [mobBadgeVisible, setMobBadgeVisible] = useState(false)
  const [mobBadgeFading, setMobBadgeFading] = useState(false)
  const mobTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMobileTap = useCallback(() => {
    if (mobTimerRef.current) clearTimeout(mobTimerRef.current)
    setMobBadgeFading(false)
    setMobBadgeVisible(true)
    mobTimerRef.current = setTimeout(() => {
      setMobBadgeFading(true)
      setTimeout(() => setMobBadgeVisible(false), 400)
    }, 1600)
  }, [])

  useEffect(() => () => { if (mobTimerRef.current) clearTimeout(mobTimerRef.current) }, [])

  // ── Details line ──────────────────────────────────────────────────────────
  const details = [
    fees && 'Fees',
    'Admission',
    'Courses',
    avgPackage && 'Placement',
    ranking && 'Ranking',
    'Cutoff',
  ].filter(Boolean)

  // ── Media (stable array ref) ──────────────────────────────────────────────
  const parseMedia = (m: string | string[] | undefined): string[] => {
    if (!m) return []
    if (Array.isArray(m)) return m
    try {
      const p = JSON.parse(m as string)
      return Array.isArray(p) ? p : [m as string]
    } catch { return [m as string] }
  }

  const mediaItems = useMemo(() => [
    ...parseMedia(image).map(url => ({ type: 'image', url })),
    ...parseMedia(video).map(url => ({ type: 'video', url })),
  ], [image, video])

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (mediaItems.length <= 1 || isPlaying) return
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % mediaItems.length), 5000)
    return () => clearInterval(id)
  }, [mediaItems.length, isPlaying])

  useEffect(() => { setIsPlaying(false) }, [currentSlide])

  // Stable callbacks — prevent MediaSlide from seeing new function refs each render
  const nextSlide    = useCallback(() => setCurrentSlide(p => (p + 1) % mediaItems.length), [mediaItems.length])
  const prevSlide    = useCallback(() => setCurrentSlide(p => (p - 1 + mediaItems.length) % mediaItems.length), [mediaItems.length])
  const handleVideoClick = useCallback(() => setIsPlaying(true), [])
  const handleDot    = useCallback((i: number) => setCurrentSlide(i), [])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: primaryBg }}>

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* ══════════════════════════════════════════════════════════
          MOBILE  (md:hidden)
      ══════════════════════════════════════════════════════════ */}
      <div className="md:hidden relative z-10 flex flex-col">

        {/* ── Three-section top bar ─────────────────────────────── */}
        <div className="flex items-center justify-between px-3 pt-4 pb-3">

          {/* SECTION 1 — back arrow (bare circle) */}
          <Link
            href="/find-colleges"
            className="w-10 h-10 flex items-center justify-center rounded-full
              bg-[#0d1225] border border-amber-500/25
              hover:bg-amber-500/15 hover:border-amber-500/50
              active:scale-95 transition-all duration-200 flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={17} className="text-amber-400" />
          </Link>

          {/* SECTION 2 — Compare | Heart | Bell in darker pill */}
          <div
            className="flex items-center divide-x divide-white/[0.10] rounded-full overflow-hidden
              bg-[#0a0f1e] border border-white/[0.09] shadow-lg shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compare */}
            <label
              className="flex items-center gap-1.5 px-3 h-10 cursor-pointer hover:bg-white/[0.05] transition-colors select-none"
              title="Compare"
            >
              <input
                type="checkbox"
                checked={inCompare}
                onChange={() => toggleCompare(collegeObj as any)}
                className="w-3.5 h-3.5 accent-purple-500 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-400">Compare</span>
            </label>

            {/* Heart */}
            <button
              onClick={() => toggleSavedMicrosite(collegeObj as any)}
              className={`w-11 h-10 flex items-center justify-center hover:bg-white/[0.05] transition-all active:scale-90 ${
                isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-white'
              }`}
              title={isSaved ? 'Remove from shortlist' : 'Add to shortlist'}
            >
              <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {/* Bell */}
            <div className="w-11 h-10 flex items-center justify-center hover:bg-white/[0.05] transition-colors">
              <CollegeBellButton collegeName={collegeName} />
            </div>
          </div>

          {/* SECTION 3 — incognito circle + 2-second floating badge */}
          <div className="relative flex-shrink-0">
            <button
              onClick={handleMobileTap}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 active:scale-90 ${
                mobBadgeVisible
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/20'
                  : 'bg-white border-white/[0.15] hover:border-amber-500/30'
              }`}
              aria-label="Privacy Shield"
            >
              <img
                src="/icognito.png"
                alt="Incognito"
                className="w-5 h-5 object-contain transition-all duration-300"
              />
            </button>

            {/* Floating badge */}
            {mobBadgeVisible && (
              <div
                className="absolute top-full right-0 mt-2 z-50 pointer-events-none"
                style={{ opacity: mobBadgeFading ? 0 : 1, transition: 'opacity 0.4s ease' }}
              >
                {/* Arrow tip */}
                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-900 border-l border-t border-amber-500/40 rotate-45 z-10" />
                <div className="relative bg-zinc-900 border border-amber-500/35 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/60 whitespace-nowrap">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-1">
                    Privacy Shield
                  </span>
                  <span className="text-[12px] font-bold text-slate-200">Ghost Mode Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Media carousel ───────────────────────────────────── */}
        {mediaItems.length > 0 && (
          <div className="mx-3 overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            {/*
              Fixed px height — NOT aspect-ratio.
              aspect-ratio causes layout recalculation on every render which
              flashes the image. A fixed h-* is stable.
            */}
            <div className="relative w-full h-52 sm:h-64">
              <MediaSlide
                mediaItems={mediaItems}
                currentSlide={currentSlide}
                isPlaying={isPlaying}
                collegeName={collegeName}
                onVideoClick={handleVideoClick}
                onPrev={prevSlide}
                onNext={nextSlide}
                onDot={handleDot}
              />
            </div>
          </div>
        )}

        {/* ── College info ─────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
            <span className="bg-gradient-to-t from-slate-400 via-slate-200 to-white bg-clip-text text-transparent">
              {collegeName}
            </span>
          </h1>

          {details.length > 0 && (
            <p className="text-sm font-semibold text-slate-400 mt-1 leading-snug">
              Explore {details.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {location && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <MapPin size={10} className="text-amber-500 flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Admissions Open 2026</span>
            </div>
          </div>

          {/* Podcast — mobile */}
          {podcast && (
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Play size={14} className="text-white ml-0.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">College Podcast</p>
                  <p className="text-xs font-semibold text-slate-200">Listen & Learn</p>
                </div>
              </div>
              <audio controls className="w-full h-9 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
                <source src={podcast} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP  (hidden md:block)
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block relative z-10">

        {/* ── Top bar ───────────────────────────────────────────── */}
        <div className="px-8 lg:px-12 xl:px-16 pt-6 pb-0 max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Back */}
          <Link
            href="/find-colleges"
            className="inline-flex items-center gap-2.5 px-5 h-11 rounded-full
              bg-white/[0.04] border border-amber-500/20 backdrop-blur-sm
              hover:bg-amber-500/10 hover:border-amber-500/40
              active:scale-[0.97] transition-all duration-300 group"
          >
            <ArrowLeft size={17} className="text-amber-500 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
              Back
            </span>
          </Link>

          {/* Action cluster */}
          <div
            className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compare */}
            <label className="flex items-center gap-2 cursor-pointer pr-3 border-r border-white/10 group/compare hover:opacity-80 transition-opacity">
              <input
                type="checkbox"
                checked={inCompare}
                onChange={() => toggleCompare(collegeObj as any)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
              <span className="text-xs text-slate-400 group-hover/compare:text-slate-300 transition-colors">Compare</span>
            </label>

            {/* Heart */}
            <button
              onClick={() => toggleSavedMicrosite(collegeObj as any)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
                isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {/* Bell */}
            <div className="w-9 h-9 flex items-center justify-center">
              <CollegeBellButton collegeName={collegeName} />
            </div>

            {/* Incognito — desktop original hover-expand behaviour */}
            <div
              ref={desktopIncognitoRef}
              className="group/incognito cursor-pointer ml-1"
              onClick={() => setIsIncognitoOpen(p => !p)}
            >
              <div className="relative">
                <div className={`absolute -inset-1 bg-amber-600/20 rounded-full blur-xl transition-opacity duration-700 ${
                  isIncognitoOpen ? 'opacity-100' : 'opacity-0 group-hover/incognito:opacity-100'
                }`} />
                <div className={`relative flex items-center bg-zinc-900/60 border border-white/10 rounded-full transition-all duration-500 overflow-hidden ${
                  isIncognitoOpen ? 'pr-4' : 'group-hover/incognito:pr-4'
                }`}>
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-gray-300 to-zinc-300 group-hover/incognito:from-amber-500 group-hover/incognito:to-amber-600 transition-all duration-500 rounded-full">
                    <img
                      src="/icognito.png"
                      alt="Incognito"
                      className={`w-5 h-5 object-contain transition-all duration-500 ${
                        isIncognitoOpen ? 'brightness-0' : 'brightness-100 group-hover/incognito:brightness-0'
                      }`}
                    />
                  </div>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${
                    isIncognitoOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover/incognito:max-w-xs group-hover/incognito:opacity-100'
                  }`}>
                    <div className="pl-3">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-0.5">
                        Privacy Shield
                      </span>
                      <span className="text-[11px] font-bold text-slate-100">Ghost Mode Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero body ─────────────────────────────────────────── */}
        <div className="px-8 lg:px-12 xl:px-16 pt-8 pb-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-row gap-12 xl:gap-20 items-center">

            {/* LEFT: text */}
            <div className="flex-1 flex flex-col justify-center">

              <div className="flex flex-wrap gap-2 mb-5">
                {location && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm cursor-default">
                    <MapPin size={11} className="text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Admissions Open 2026</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-4">
                <span className="bg-gradient-to-t from-slate-500 via-slate-300 to-white bg-clip-text text-transparent">
                  {collegeName}
                </span>
              </h1>

              {details.length > 0 && (
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-400 mb-6 leading-snug">
                  Explore {details.join(', ')}
                </p>
              )}

              {/* Stats cards */}
              {/* {(fees || avgPackage || ranking) && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {fees && (
                    <div className="flex flex-col px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors group/stat cursor-default">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/stat:text-amber-500 transition-colors mb-1">Fees</span>
                      <span className="text-sm font-bold text-slate-200">{fees}</span>
                    </div>
                  )}
                  {avgPackage && (
                    <div className="flex flex-col px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors group/stat cursor-default">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/stat:text-amber-500 transition-colors mb-1">Avg Package</span>
                      <span className="text-sm font-bold text-slate-200">{avgPackage}</span>
                    </div>
                  )}
                  {ranking && (
                    <div className="flex flex-col px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors group/stat cursor-default">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/stat:text-amber-500 transition-colors mb-1">Ranking</span>
                      <span className="text-sm font-bold text-slate-200">{ranking}</span>
                    </div>
                  )}
                </div>
              )} */}

              {/* Podcast */}
              {podcast && (
                <div className="w-full max-w-md">
                  <div className="relative group/pod">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-40 group-hover/pod:opacity-70 transition-opacity duration-500" />
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Play size={18} className="text-white ml-0.5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">College Podcast</p>
                          <p className="text-sm font-semibold text-slate-200">Listen & Learn</p>
                        </div>
                      </div>
                      <audio controls className="w-full h-10 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
                        <source src={podcast} type="audio/mpeg" />
                      </audio>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: media */}
            {mediaItems.length > 0 && (
              <div className="w-[46%] lg:w-[44%] xl:w-[42%] shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2.2rem] blur-2xl opacity-40 group-hover:opacity-65 transition-opacity duration-500" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                    <div className="relative w-full aspect-[4/3]">
                      <MediaSlide
                        mediaItems={mediaItems}
                        currentSlide={currentSlide}
                        isPlaying={isPlaying}
                        collegeName={collegeName}
                        onVideoClick={handleVideoClick}
                        onPrev={prevSlide}
                        onNext={nextSlide}
                        onDot={handleDot}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating compare */}
      <CompareFloatingButton
        compareCount={compareColleges.length}
        onCompareClick={goToComparison}
      />
    </div>
  )
}
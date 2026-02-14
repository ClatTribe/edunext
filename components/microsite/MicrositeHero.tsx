"use client"
import React, { useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface MicrositeHeroProps {
  collegeName: string
  location?: string
  fees?: string
  avgPackage?: string
  highestPackage?: string
  ranking?: string
  image?: string | string[]
  video?: string | string[]
  podcast?: string
}

const primaryBg = '#060818'

export default function MicrositeHero({
  collegeName,
  location,
  fees,
  avgPackage,
  ranking,
  image,
  video,
  podcast
}: MicrositeHeroProps) {
  
  const details = [
    fees && 'Fees',
    'Admission',
    'Courses',
    avgPackage && 'Placement',
    ranking && 'Ranking',
    'Cutoff'
  ].filter(Boolean)

  // Parse images (handle both single string and array)
  const parseMedia = (media: string | string[] | undefined): string[] => {
    if (!media) return []
    if (Array.isArray(media)) return media
    if (typeof media === 'string') {
      try {
        const parsed = JSON.parse(media)
        return Array.isArray(parsed) ? parsed : [media]
      } catch {
        return [media]
      }
    }
    return []
  }

  const images = parseMedia(image)
  const videos = parseMedia(video)

  // Combine images and videos into media items
  const mediaItems = [
    ...images.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Autoplay carousel - STOPS when video is playing
  React.useEffect(() => {
    if (mediaItems.length <= 1 || isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mediaItems.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [mediaItems.length, isPlaying])

  // Reset video playing state when slide changes
  React.useEffect(() => {
    setIsPlaying(false)
  }, [currentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const handleVideoClick = () => {
    setIsPlaying(true)
  }

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  return (
    <div 
      className="relative overflow-hidden pt-6 pb-6 md:pt-12 md:pb-10 px-4 sm:px-8 md:px-12 flex items-center"
      style={{ backgroundColor: primaryBg }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>

      {/* Static Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-center">
          
          {/* Text Content Area - Order 1 on mobile (shows first), Order 1 on desktop */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left order-1 md:order-1">
            
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

            {/* Podcast Section - Below title on mobile, inline on desktop */}
            {podcast && (
              <div className="w-full max-w-md mt-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                  
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
                    
                    <audio 
                      controls 
                      className="w-full h-10 rounded-lg"
                      style={{
                        filter: 'invert(1) hue-rotate(180deg)',
                      }}
                    >
                      <source src={podcast} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Media Carousel Section - Order 2 on mobile (shows after name), Order 2 on desktop */}
          {mediaItems.length > 0 && (
            <div className="w-full md:w-[45%] lg:w-[42%] shrink-0 order-2 md:order-2">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                  {/* Media Container */}
                  <div className="relative w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] bg-black/20">
                    {mediaItems[currentSlide].type === 'image' ? (
                      <img 
                        src={mediaItems[currentSlide].url} 
                        alt={`${collegeName} - Slide ${currentSlide + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="relative w-full h-full group/video">
                        {getYouTubeId(mediaItems[currentSlide].url) ? (
                          <>
                            {!isPlaying ? (
                              <>
                                {/* YouTube Thumbnail */}
                                <img 
                                  src={`https://img.youtube.com/vi/${getYouTubeId(mediaItems[currentSlide].url)}/maxresdefault.jpg`}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${getYouTubeId(mediaItems[currentSlide].url)}/hqdefault.jpg`
                                  }}
                                />
                                {/* Play Button Overlay */}
                                <div 
                                  onClick={handleVideoClick}
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover/video:bg-black/30 transition-colors"
                                >
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
                                {/* Video Thumbnail/First Frame */}
                                <video 
                                  className="w-full h-full object-cover"
                                  src={mediaItems[currentSlide].url}
                                  preload="metadata"
                                />
                                {/* Play Button Overlay */}
                                <div 
                                  onClick={handleVideoClick}
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover/video:bg-black/30 transition-colors"
                                >
                                  <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center shadow-2xl transform group-hover/video:scale-110 transition-transform">
                                    <Play size={32} className="text-white ml-1" fill="white" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <video 
                                className="w-full h-full object-cover"
                                controls
                                autoPlay
                                src={mediaItems[currentSlide].url}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Navigation Arrows */}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Slide Indicators */}
                  {mediaItems.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {mediaItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? 'bg-amber-500 w-8' 
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {mediaItems[currentSlide].type === 'image' ? '📷 Photo' : '🎥 Video'}
                    </span>
                  </div>

                  {/* Carousel Status Indicator - Shows when video is playing */}
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
    </div>
  )
}
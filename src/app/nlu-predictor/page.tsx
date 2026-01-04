// "use client";

// import React, { useState } from 'react';
// import { Play, X, Clock, BookOpen } from 'lucide-react';

// interface Video {
//   id: number;
//   title: string;
//   url: string;
//   description: string;
//   duration?: string;
//   category: string;
// }

// const PhotoVideoPage: React.FC = () => {
//   const videos: Video[] = [
//     {
//       id: 1,
//       title: "How to clear quants QA (SA) cut off in 10 mins",
//       url: "https://youtu.be/Q7lS5zdaOKM?si=lZneP57xGJCi6HfL",
//       description: "Master quantitative analysis techniques to clear cutoffs efficiently",
//       duration: "10 mins",
//       category: "Quantitative Analysis"
//     },
//     {
//       id: 2,
//       title: "Introduction to Numbers",
//       url: "https://youtu.be/raKEb6Ax4WE",
//       description: "Learn the fundamentals of number systems and operations",
//       category: "Numbers"
//     },
//     {
//       id: 3,
//       title: "Introduction to Averages",
//       url: "https://youtu.be/bBhzPsinUYY",
//       description: "Understand averages, mean, median, and mode concepts",
//       category: "Averages"
//     },
//     {
//       id: 4,
//       title: "Reading Comprehension (Tones)",
//       url: "https://youtu.be/CDEWTaMInUA",
//       description: "Master identifying tones in reading comprehension passages",
//       category: "Reading Comprehension"
//     },
//     {
//       id: 5,
//       title: "Root Words",
//       url: "https://youtu.be/wXakzp9DQYo",
//       description: "Build your vocabulary through understanding root words",
//       category: "Root Words"
//     }
//   ];

//   const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

//   const extractVideoId = (url: string): string | null => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
//   };

//   // Group videos by category
//   const categories = Array.from(new Set(videos.map(v => v.category)));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
//       {/* Background decoration */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
//         {/* Header */}
//         <div className="text-center space-y-4 mb-12">
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-purple-200 shadow-sm text-xs font-semibold uppercase tracking-widest text-purple-700">
//             <span className="w-2 h-2 rounded-full bg-[#F2AD00] animate-pulse"></span>
//             Video Learning Hub
//           </div>
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
//             Master Your <span className="text-[#823588]">Skills</span>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Access comprehensive video tutorials to boost your learning journey
//           </p>
//         </div>

//         {/* Categories */}
//         {categories.map((category) => {
//           const categoryVideos = videos.filter(v => v.category === category);
          
//           return (
//             <div key={category} className="mb-12">
//               <div className="flex items-center gap-3 mb-6">
//                 <BookOpen className="w-6 h-6 text-[#823588]" />
//                 <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
//                 <div className="h-px flex-1 bg-gradient-to-r from-purple-300 to-transparent"></div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {categoryVideos.map((video, index) => {
//                   const videoId = extractVideoId(video.url);
//                   const thumbnailUrl = videoId 
//                     ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
//                     : '';

//                   return (
//                     <div
//                       key={video.id}
//                       className="relative group rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F2AD00] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
//                       style={{
//                         animationDelay: `${index * 40}ms`,
//                         animation: 'fadeIn 0.5s ease-out forwards'
//                       }}
//                     >
//                       {/* Video Thumbnail */}
//                       <div className="relative aspect-video overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedVideo(video)}>
//                         {thumbnailUrl && (
//                           <img
//                             src={thumbnailUrl}
//                             alt={video.title}
//                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                             onError={(e) => {
//                               e.currentTarget.style.display = 'none';
//                             }}
//                           />
//                         )}
                        
//                         {/* Duration Badge */}
//                         {video.duration && (
//                           <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
//                             <Clock className="w-3 h-3" />
//                             {video.duration}
//                           </div>
//                         )}
                        
//                         {/* Play Button Overlay */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                           <div className="w-16 h-16 rounded-full bg-[#F2AD00] flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-2xl">
//                             <Play className="w-8 h-8 text-white ml-1" fill="white" />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Video Info */}
//                       <div className="p-5">
//                         <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#823588] transition-colors">
//                           {video.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 line-clamp-2">
//                           {video.description}
//                         </p>
//                       </div>

//                       {/* Hover Border Effect */}
//                       <div className="absolute inset-0 rounded-2xl border-2 border-[#F2AD00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           );
//         })}

//         {/* Stats Section */}
//         <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 text-center">
//             <div className="text-4xl font-bold text-[#823588] mb-2">{videos.length}</div>
//             <div className="text-gray-600 font-medium">Video Lessons</div>
//           </div>
//           <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100 text-center">
//             <div className="text-4xl font-bold text-[#F2AD00] mb-2">{categories.length}</div>
//             <div className="text-gray-600 font-medium">Categories</div>
//           </div>
//           <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 text-center">
//             <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
//             <div className="text-gray-600 font-medium">Free Access</div>
//           </div>
//         </div>

//         {/* Empty State */}
//         {videos.length === 0 && (
//           <div className="text-center py-20">
//             <div className="inline-block p-6 rounded-full bg-purple-100 mb-4">
//               <Play className="w-16 h-16 text-[#823588]" />
//             </div>
//             <p className="text-xl font-semibold text-gray-900 mb-2">
//               No videos available
//             </p>
//             <p className="text-gray-600">
//               Check back soon for new learning sessions
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Video Player Modal */}
//       {selectedVideo && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">
//             {/* Close Button */}
//             <button
//               onClick={() => setSelectedVideo(null)}
//               className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-white transition-all"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             {/* Video Title */}
//             <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-yellow-50">
//               <div className="text-xs font-semibold text-[#823588] uppercase tracking-wider mb-2">
//                 {selectedVideo.category}
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900">{selectedVideo.title}</h2>
//               {selectedVideo.description && (
//                 <p className="text-sm text-gray-600 mt-2">{selectedVideo.description}</p>
//               )}
//             </div>

//             {/* Video Player */}
//             <div className="aspect-video bg-black">
//               <iframe
//                 src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo.url)}?autoplay=1`}
//                 className="w-full h-full"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PhotoVideoPage;
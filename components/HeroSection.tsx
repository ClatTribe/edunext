// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import {
//   Search,
//   ChevronRight,
//   Calculator,
//   Trophy,
//   Users,
//   FileSearch,
//   MapPin,
//   ArrowRight,
//   X,
// } from "lucide-react";

// // Indian States List
// const indianStates = [
//   "Andhra Pradesh",
//   "Arunachal Pradesh",
//   "Assam",
//   "Bihar",
//   "Chhattisgarh",
//   "Goa",
//   "Gujarat",
//   "Haryana",
//   "Himachal Pradesh",
//   "Jharkhand",
//   "Karnataka",
//   "Kerala",
//   "Madhya Pradesh",
//   "Maharashtra",
//   "Manipur",
//   "Meghalaya",
//   "Mizoram",
//   "Nagaland",
//   "Odisha",
//   "Punjab",
//   "Rajasthan",
//   "Sikkim",
//   "Tamil Nadu",
//   "Telangana",
//   "Tripura",
//   "Uttar Pradesh",
//   "Uttarakhand",
//   "West Bengal",
//   "Delhi NCR",
//   "Jammu and Kashmir",
//   "Ladakh",
//   "Puducherry",
//   "Chandigarh",
//   "Andaman and Nicobar Islands",
//   "Dadra and Nagar Haveli and Daman and Diu",
//   "Lakshadweep",
// ];

// // QuickActionCard Component
// const QuickActionCard: React.FC<{
//   icon: any;
//   title: string;
//   description: string;
//   badge?: string;
// }> = ({ icon: Icon, title, description, badge }) => (
//   <button
//     className="cursor-pointer p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-all group border border-[#1a1f2e] hover:border-[#F59E0B]/30"
//     style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
//   >
//     <div className="relative">
//       <div
//         className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300"
//         style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", color: "#F59E0B" }}
//       >
//         <Icon className="w-8 h-8" />
//       </div>
//       {badge && (
//         <span className="absolute -top-2 -right-4 bg-red-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
//           {badge}
//         </span>
//       )}
//     </div>
//     <div className="mt-2">
//       <h3
//         className="font-bold text-white transition-colors"
//         style={{ color: "white" }}
//       >
//         {title}
//       </h3>
//       <p
//         className="text-xs mt-1 leading-relaxed"
//         style={{ color: "rgba(148, 163, 184, 0.8)" }}
//       >
//         {description}
//       </p>
//     </div>
//   </button>
// );

// // College Type
// interface College {
//   id: string;
//   name: string;
//   location: string;
//   rating: number;
//   tags: string[];
//   imageUrl: string;
// }

// // CollegeCard Component
// const CollegeCard: React.FC<{ college: College }> = ({ college }) => (
//   <div
//     className="rounded-2xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-[#1a1f2e]"
//     style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
//   >
//     <div className="h-40 overflow-hidden relative">
//       <img
//         src={college.imageUrl}
//         alt={college.name}
//         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//       />
//       <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
//         <Trophy className="w-3 h-3 text-[#F59E0B]" />
//         {/* <span>#{college.id} NIRF</span> */}
//       </div>
//     </div>
//     <div className="p-5">
//       <h4 className="font-bold text-lg text-white mb-1">{college.name}</h4>
//       <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
//         <MapPin className="w-3 h-3" />
//         {college.location}
//       </div>
//       <div className="flex flex-wrap gap-2 mb-5">
//         {college.tags.map((tag) => (
//           <span
//             key={tag}
//             className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-white/5 px-2 py-1 rounded"
//           >
//             {tag}
//           </span>
//         ))}
//       </div>
//       {/* <button className="w-full py-2.5 rounded-xl border border-[#F59E0B]/20 text-[#F59E0B] font-semibold text-sm hover:bg-[#F59E0B] hover:text-black transition-all flex items-center justify-center gap-2">
//         View Details
//         <ArrowRight className="w-4 h-4" />
//       </button> */}
//     </div>
//   </div>
// );

// // Typing Animation Component
// const TypingAnimation = () => {
//   const phrases = ["4 Lakh Reviews", "2000+ MBA Colleges", "250 Exams"];

//   const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
//   const [displayText, setDisplayText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const currentPhrase = phrases[currentPhraseIndex];
//     const typingSpeed = isDeleting ? 50 : 100;
//     const pauseTime = 2000;

//     const timer = setTimeout(() => {
//       if (!isDeleting) {
//         if (displayText.length < currentPhrase.length) {
//           setDisplayText(currentPhrase.slice(0, displayText.length + 1));
//         } else {
//           setTimeout(() => setIsDeleting(true), pauseTime);
//         }
//       } else {
//         if (displayText.length > 0) {
//           setDisplayText(currentPhrase.slice(0, displayText.length - 1));
//         } else {
//           setIsDeleting(false);
//           setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
//         }
//       }
//     }, typingSpeed);

//     return () => clearTimeout(timer);
//   }, [displayText, isDeleting, currentPhraseIndex]);

//   return (
//     <p className="text-white max-w-2xl mx-auto text-lg md:text-xl lg:text-3xl sm:text-xl leading-relaxed mb-10">
//       Find Over{" "}
//       <span className="text-[#F59E0B] font-bold">
//         {displayText}
//         {/* <span className="animate-pulse">|</span> */}
//       </span>{" "}
//       in India
//     </p>
//   );
// };

// // Hero Section Component
// const HeroSection: React.FC<{ courses?: any[] }> = ({ courses = [] }) => {
//   const [searchQuery, setSearchQuery] = useState("");

//   // Extract cities from courses data (same as filter component)
//   const allCities = Array.from(
//     new Set(courses.map((c) => c.City).filter((c): c is string => Boolean(c)))
//   );

//   const featuredColleges: College[] = [
//     {
//       id: "1",
//       name: "IIM Ahmedabad",
//       location: "Ahmedabad, Gujarat",
//       rating: 4.9,
//       tags: ["CAT", "Global Rank #1"],
//       imageUrl:
//         "https://res.cloudinary.com/daetdadtt/image/upload/v1766476599/iima_ije8kq.jpg",
//     },
//     {
//       id: "2",
//       name: "IIM Bangalore",
//       location: "Bangalore, Karnataka",
//       rating: 4.8,
//       tags: ["CAT", "Innovation"],
//       imageUrl:
//         "https://res.cloudinary.com/daetdadtt/image/upload/v1766476601/iimb_aksvxh.jpg",
//     },
//     {
//       id: "3",
//       name: "Chandigarh University",
//       location: "Chandigarh, Punjab",
//       rating: 4.7,
//       tags: ["XAT", "Legacy"],
//       imageUrl:
//         "https://res.cloudinary.com/daetdadtt/image/upload/v1766558377/CU_e1aozd.jpg",
//     },
//     {
//       id: "4",
//       name: "Amity Noida",
//       location: "Noida, Uttar Pradesh",
//       rating: 4.6,
//       tags: ["CAT", "Best ROI"],
//       imageUrl:
//         "https://res.cloudinary.com/daetdadtt/image/upload/v1766558375/download_1_vb2xaq.jpg",
//     },
//   ];

//   // Handle Search Navigation
//   const handleSearch = () => {
//     if (!searchQuery.trim()) return;

//     const query = searchQuery.trim().toLowerCase();

//     // Flexible state matching - checks if state contains query OR query contains state
//     const matchedState = indianStates.find((state) => {
//       const stateLower = state.toLowerCase();
//       return stateLower.includes(query) || query.includes(stateLower);
//     });

//     // Flexible city matching
//     const matchedCity = allCities.find((city) => {
//       const cityLower = city.toLowerCase();
//       return cityLower.includes(query) || query.includes(cityLower);
//     });

//     if (matchedCity) {
//       window.location.href = `/find-colleges?city=${encodeURIComponent(matchedCity)}`;
//     } else if (matchedState) {
//       window.location.href = `/find-colleges?state=${encodeURIComponent(matchedState)}`;
//     } else {
//       // Fallback: pass the search term to find-colleges page
//       window.location.href = `/find-colleges?search=${encodeURIComponent(searchQuery)}`;
//     }
//   };

//   return (
//     <>
//       {/* Hero Section - Search First */}
//       <section className="relative px-6 max-w-7xl mx-auto pt-20 md:pt-0 lg:pt-0 sm:pt-0 overflow-hidden">
//         {/* Background Image */}
//         <div className="absolute inset-0 w-full h-full pointer-events-none">
//           <img
//             src="https://res.cloudinary.com/daetdadtt/image/upload/v1766552235/uuhuu_optimized_8000_tlzvby.png"
//             alt=""
//             className="w-full h-full object-cover opacity-20"
//           />
//           {/* Overlay gradient to blend image with background */}
//           <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-dark-900/80 to-dark-900"></div>
//         </div>

//         {/* Background Gradients */}
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/5 blur-[120px] rounded-full pointer-events-none z-10" />
//         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-10" />

//         <div className="text-center mb-12 relative z-20">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold mb-6 animate-pulse">
//             <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
//             NEW: ADMIT FINDER 2.0 IS LIVE
//           </div>
//           <h1 className="text-xl md:text-4xl lg:text-5xl sm:text-2xl font-extrabold text-white mb-6 tracking-tight leading-tight">
//             Find Dream MBA Colleges <br />
//             <span className="text-[#F59E0B]">Without the Noise.</span>
//           </h1>

//           <TypingAnimation />

//           {/* Search Box */}
//           <div className="max-w-3xl mx-auto relative group">
//             <div className="glass-card search-shadow rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-[#F59E0B]/30 focus-within:border-[#F59E0B] transition-all">
//               <div className="flex-1 flex items-center px-4 w-full relative">
//                 <Search className="text-slate-400 w-5 h-5 mr-3" />
//                 <input
//                   type="text"
//                   placeholder="Search 2000+ Colleges, Exams or MBA Specializations..."
//                   className="bg-transparent border-none outline-none w-full text-white py-3 text-base placeholder:text-slate-500"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                 />
//                 {searchQuery && (
//                   <button
//                     onClick={() => setSearchQuery("")}
//                     className="text-slate-400 hover:text-white transition-colors ml-2"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 )}
//               </div>
//               <button
//                 onClick={handleSearch}
//                 className="w-full md:w-auto bg-[#F59E0B] text-dark-900 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-lg"
//               >
//                 Search
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Main Feature Grid - "What to do" */}
//       <section className="py-12 px-6 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
//           <Link href="/find-colleges" className="">
//             <QuickActionCard
//               icon={FileSearch}
//               title="Find MBA Colleges"
//               description="Find your perfect stream based on actual grades"
//             />
//           </Link>
//           <Link href="/cat-college-predictor" className="block">
//             <QuickActionCard
//               icon={Calculator}
//               title="CAT Call Predictor"
//               description="Check your chances for IIMs and top non-IIMs"
//               badge="NEW"
//             />
//           </Link>
//           <Link href="/find-scholarships" className="block">
//             <QuickActionCard
//               icon={Trophy}
//               title="Scholarships"
//               description="Match with 1000+ financial aid opportunities"
//             />
//           </Link>
//           <Link href="/previous-year-students" className="block">
//             <QuickActionCard
//               icon={Users}
//               title="Talk to Alumni"
//               description="Connect with students from your dream college"
//             />
//           </Link>
//         </div>
//       </section>

//       {/* Popular Colleges Section */}
//       <section className="pt-10 md:pt-0 lg:pt-10 sm:pt-0 py-14 px-6 max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
//           <div>
//             <h2 className="text-3xl font-bold text-white mb-3">
//               Popular MBA Programs
//             </h2>
//             <p className="text-slate-400">
//               Handpicked top institutes based on ROI and alumni feedback
//             </p>
//           </div>
//           <Link
//             href="/find-colleges"
//             className="flex items-center gap-2 text-[#F59E0B] font-bold hover:gap-3 transition-all"
//           >
//             View All Colleges
//             <ChevronRight className="w-5 h-5" />
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {featuredColleges.map((college) => (
//             <CollegeCard key={college.id} college={college} />
//           ))}
//         </div>
//       </section>
//     </>
//   );
// };

// export default HeroSection;


"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  Calculator,
  Trophy,
  Users,
  FileSearch,
  MapPin,
  X,
} from "lucide-react";

// --- Constants ---
const HERO_IMAGES = [
  "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0F172B] via-[#050818] to-black",
  "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F59E0B]/10 via-[#050818] to-black",
  "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#0F172B] via-black to-black",
];

const HERO_TAGLINES = [
  { isCustom: true },
  { text: "Your Dream College Awaits" },
  { text: "Rankings, Reviews & Reality" }
];

// --- Sub-Components ---

const QuickActionCard: React.FC<{
  icon: any;
  title: string;
  description: string;
  badge?: string;
}> = ({ icon: Icon, title, description, badge }) => (
  <button
    className="w-full cursor-pointer p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-all group border border-[#1a1f2e] hover:border-[#F59E0B]/30 bg-[#0f172a]/60"
  >
    <div className="relative">
      <div className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 bg-[#1e293b]/50 text-[#F59E0B]">
        <Icon className="w-8 h-8" />
      </div>
      {badge && (
        <span className="absolute -top-2 -right-4 bg-red-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <div className="mt-2">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs mt-1 leading-relaxed text-slate-400/80">{description}</p>
    </div>
  </button>
);

const CollegeCard: React.FC<{ college: any }> = ({ college }) => (
  <div className="rounded-2xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-[#1a1f2e] bg-[#0f172a]/60">
    <div className="h-40 overflow-hidden relative">
      <img src={college.imageUrl} alt={college.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    </div>
    <div className="p-5">
      <h4 className="font-bold text-lg text-white mb-1">{college.name}</h4>
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <MapPin className="w-3 h-3" /> {college.location}
      </div>
      <div className="flex flex-wrap gap-2">
        {college.tags.map((tag: string) => (
          <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

// --- Main Hero Section ---

const HeroSection: React.FC<{ courses?: any[] }> = ({ courses = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // Longer interval for better readability (6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Pass the search query to the college page
    // The server-side logic will handle intelligent parsing
    router.push(`/find-colleges?q=${encodeURIComponent(searchQuery)}`);
  };

  const featuredColleges = [
    { id: "1", name: "IIM Ahmedabad", location: "Ahmedabad, Gujarat", tags: ["CAT", "Global Rank #1"], imageUrl: "https://res.cloudinary.com/daetdadtt/image/upload/v1766476599/iima_ije8kq.jpg" },
    { id: "2", name: "IIT Delhi", location: "New Delhi, Delhi", tags: ["JEE", "Innovation"], imageUrl: "https://res.cloudinary.com/daetdadtt/image/upload/v1770034871/iit_delhi_tqucbp.jpg" },
    { id: "3", name: "Chandigarh University", location: "Chandigarh, Punjab", tags: ["B.sc", "Legacy"], imageUrl: "https://res.cloudinary.com/daetdadtt/image/upload/v1766558377/CU_e1aozd.jpg" },
    { id: "4", name: "Amity Noida", location: "Noida, Uttar Pradesh", tags: ["CAT", "Best ROI"], imageUrl: "https://res.cloudinary.com/daetdadtt/image/upload/v1766558375/download_1_vb2xaq.jpg" },
  ];

  return (
    <div className="bg-[#050818] min-h-screen">
      <section className="relative px-6 max-w-7xl mx-auto pt-20 md:pt-4 overflow-hidden">
        
        {/* Background Fade */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={`bg-${currentSlide}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className={`absolute inset-0 -z-20 ${HERO_IMAGES[currentSlide]}`}
          />
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050818] to-transparent -z-10" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[#F59E0B] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-10 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
            #1 Education Platform • ADMIT FINDER 2.0
          </motion.div>

          {/* Headline - Smooth Animation */}
          <div className="relative mb-6 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.h1
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[10vw] sm:text-[8vw] md:text-[4.5vw] lg:text-[4rem] xl:text-[4.5rem] font-black tracking-tighter leading-[1.1] md:leading-none px-2 text-white md:whitespace-nowrap"
              >
                {HERO_TAGLINES[currentSlide].isCustom ? (
                  <span className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-[0.4ch]">
                    <span>Ambition <span className="text-[0.7em] font-bold align-middle opacity-80">से</span></span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-orange-400 to-orange-600">
                      Admission <span className="text-[0.7em] font-bold align-middle">तक</span>
                    </span>
                  </span>
                ) : (
                  HERO_TAGLINES[currentSlide].text
                )}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
            className="text-sm md:text-xl text-slate-400 mb-8 md:mb-12 max-w-2xl mx-auto px-4"
          >
            Navigating through <span className="text-white font-bold">10000+ Colleges</span> to unlock your true career potential.
          </motion.p>

          {/* Search Bar */}
          <motion.form 
            onSubmit={handleSearch}
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
            className="relative w-full max-w-2xl mx-auto mb-10 md:mb-14 px-2 group"
          >
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full p-2 shadow-2xl focus-within:border-[#F59E0B]/50 transition-all">
              <Search className="h-5 w-5 text-slate-500 ml-4 hidden md:block" />
              <input
                type="text" 
                placeholder="Try: BCA colleges in Delhi under 5 lakh..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 px-3 md:px-4 py-3 md:py-4 text-sm md:text-lg outline-none"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button type="submit" className="rounded-xl md:rounded-full bg-[#F59E0B] hover:bg-orange-500 text-black font-bold px-6 md:px-12 py-3 md:py-4 text-sm md:text-base transition-all active:scale-95 shadow-lg">
                Search
              </button>
            </div>
          </motion.form>

          {/* Quick Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
            {['Finance', 'Marketing', 'Business Analytics', 'BCA', 'B.Com'].map((item) => (
              <button key={item} onClick={() => setSearchQuery(item)} className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-xs md:text-sm font-semibold text-slate-300 hover:border-[#F59E0B]/40 hover:text-[#F59E0B] transition-all">
                {item}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/find-colleges"><QuickActionCard icon={FileSearch} title="Find Colleges" description="Perfect stream based on grades" /></Link>
          <Link href="/cat-college-predictor"><QuickActionCard icon={Calculator} title="Call Predictor" description="Chances for IIMs & top B-schools" badge="NEW" /></Link>
          <Link href="/find-scholarships"><QuickActionCard icon={Trophy} title="Scholarships" description="1000+ aid opportunities" /></Link>
          <Link href="/previous-year-students"><QuickActionCard icon={Users} title="Talk to Alumni" description="Connect with dream college students" /></Link>
        </div>
      </section>

      {/* Popular Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Popular Programs</h2>
            <p className="text-sm md:text-base text-slate-400">Handpicked based on ROI and alumni feedback</p>
          </div>
          <Link href="/find-colleges" className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm md:text-base hover:translate-x-1 transition-transform">
            View All <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredColleges.map((college) => <CollegeCard key={college.id} college={college} />)}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
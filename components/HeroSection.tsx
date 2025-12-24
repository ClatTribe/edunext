import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronRight,
  Calculator,
  Trophy,
  Users,
  FileSearch,
  MapPin,
  ArrowRight,
  X
} from 'lucide-react';

// Indian States List
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi NCR", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
];

// QuickActionCard Component
const QuickActionCard: React.FC<{ 
  icon: any; 
  title: string; 
  description: string; 
  badge?: string;
}> = ({ icon: Icon, title, description, badge }) => (
  <button className="cursor-pointer p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-all group border border-[#1a1f2e] hover:border-[#F59E0B]/30" 
    style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
    <div className="relative">
      <div className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300" 
        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#F59E0B' }}>
        <Icon className="w-8 h-8" />
      </div>
      {badge && (
        <span className="absolute -top-2 -right-4 bg-red-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <div className="mt-2">
      <h3 className="font-bold text-white transition-colors" 
        style={{ color: 'white' }}>
        {title}
      </h3>
      <p className="text-xs mt-1 leading-relaxed" 
        style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
        {description}
      </p>
    </div>
  </button>
);

// College Type
interface College {
  id: string;
  name: string;
  location: string;
  rating: number;
  tags: string[];
  imageUrl: string;
}

// CollegeCard Component
const CollegeCard: React.FC<{ college: College }> = ({ college }) => (
  <div className="rounded-2xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-[#1a1f2e]" 
    style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
    <div className="h-40 overflow-hidden relative">
      <img src={college.imageUrl} alt={college.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
        <Trophy className="w-3 h-3 text-[#F59E0B]" />
        <span>#{college.id} NIRF</span>
      </div>
    </div>
    <div className="p-5">
      <h4 className="font-bold text-lg text-white mb-1">{college.name}</h4>
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <MapPin className="w-3 h-3" />
        {college.location}
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {college.tags.map(tag => (
          <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-xl border border-[#F59E0B]/20 text-[#F59E0B] font-semibold text-sm hover:bg-[#F59E0B] hover:text-black transition-all flex items-center justify-center gap-2">
        View Details
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Hero Section Component
const HeroSection: React.FC<{ courses?: any[] }> = ({ courses = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract cities from courses data (same as filter component)
  const allCities = Array.from(new Set(courses.map((c) => c.City).filter((c): c is string => Boolean(c))));

  const featuredColleges: College[] = [
    { id: '1', name: 'IIM Ahmedabad', location: 'Ahmedabad, Gujarat', rating: 4.9, tags: ['CAT', 'Global Rank #1'], imageUrl: 'https://res.cloudinary.com/daetdadtt/image/upload/v1766476599/iima_ije8kq.jpg' },
    { id: '2', name: 'IIM Bangalore', location: 'Bangalore, Karnataka', rating: 4.8, tags: ['CAT', 'Innovation'], imageUrl: 'https://res.cloudinary.com/daetdadtt/image/upload/v1766476601/iimb_aksvxh.jpg' },
    { id: '3', name: 'XLRI Jamshedpur', location: 'Jamshedpur, Jharkhand', rating: 4.7, tags: ['XAT', 'Legacy'], imageUrl: 'https://res.cloudinary.com/daetdadtt/image/upload/v1766476600/xlri_vjkfz4.webp' },
    { id: '4', name: 'FMS Delhi', location: 'Delhi, Delhi', rating: 4.6, tags: ['CAT', 'Best ROI'], imageUrl: 'https://res.cloudinary.com/daetdadtt/image/upload/v1766476601/FMS_Delhi_lsy3ia.jpg' },
  ];

  // Handle Search Navigation
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim();
    
    // Check if it matches a state
    const matchedState = indianStates.find(state => 
      state.toLowerCase() === query.toLowerCase()
    );
    
    // Check if it matches a city
    const matchedCity = allCities.find(city => 
      city.toLowerCase() === query.toLowerCase()
    );
    
    if (matchedCity) {
      window.location.href = `/find-colleges?city=${encodeURIComponent(matchedCity)}`;
    } else if (matchedState) {
      window.location.href = `/find-colleges?state=${encodeURIComponent(matchedState)}`;
    } else {
      // General search
      // window.location.href = `/find-colleges?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <>
      {/* Hero Section - Search First */}
     <section className="relative px-6 max-w-7xl mx-auto pt-20 md:pt-0 lg:pt-0 sm:pt-0 overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0 w-full h-full pointer-events-none">
    <img 
      src="https://res.cloudinary.com/daetdadtt/image/upload/v1766552235/uuhuu_optimized_8000_tlzvby.png"
      alt=""
      className="w-full h-full object-cover opacity-20"
    />
    {/* Overlay gradient to blend image with background */}
    <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-dark-900/80 to-dark-900"></div>
  </div>

  {/* Background Gradients */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/5 blur-[120px] rounded-full pointer-events-none z-10" />
  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-10" />

  <div className="text-center mb-12 relative z-20">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold mb-6 animate-pulse">
      <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
      NEW: ADMIT FINDER 2.0 IS LIVE
    </div>
    <h1 className="text-2xl md:text-4xl lg:text-5xl sm:text-2xl font-extrabold text-white mb-6 tracking-tight leading-tight">
      Find Your Dream MBA <br />
      <span className="text-[#F59E0B]">Without the Noise.</span>
    </h1>
    <p className="text-white max-w-2xl mx-auto text-lg leading-relaxed mb-10">
      EduNext uses verified student data and AI matching to help you find the right course, secure scholarships, and connect with alumni.
    </p>

    {/* Search Box */}
    <div className="max-w-3xl mx-auto relative group">
      <div className="glass-card search-shadow rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-[#F59E0B]/30 focus-within:border-[#F59E0B] transition-all">
        <div className="flex-1 flex items-center px-4 w-full relative">
          <Search className="text-slate-400 w-5 h-5 mr-3" />
          <input 
            type="text" 
            placeholder="Search 2000+ Colleges, Exams or MBA Specializations..."
            className="bg-transparent border-none outline-none w-full text-white py-3 text-base placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-[#F59E0B] text-dark-900 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          Search
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {/* <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-500">
        <span>Trending:</span>
        <button className="hover:text-[#F59E0B] underline decoration-[#F59E0B]/30">Top MBA Rankings</button>
        <button className="hover:text-[#F59E0B] underline decoration-[#F59E0B]/30">CAT Preparation Tips</button>
        <button className="hover:text-[#F59E0B] underline decoration-[#F59E0B]/30">Distance MBA Colleges</button>
      </div> */}
    </div>
  </div>
</section>

      {/* Main Feature Grid - "What to do" */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/find-colleges" className="">
          <QuickActionCard 
            icon={FileSearch} 
            title="College Finder" 
            description="Find your perfect stream based on actual grades"
            />
          </Link>
          <Link href="/cat-college-predictor" className="  block">
          <QuickActionCard 
            icon={Calculator} 
            title="Cat Predictor" 
            description="Check your chances for IIMs and top non-IIMs"
            badge="NEW"
          />
          </Link>
          <Link href="/find-scholarships" className="  block">
          <QuickActionCard 
            icon={Trophy} 
            title="Scholarships" 
            description="Match with 1000+ financial aid opportunities"
          />
          </Link>
          <Link href="/previous-year-students" className="  block">
          <QuickActionCard 
            icon={Users} 
            title="Talk to Alumni" 
            description="Connect with students from your dream college"
          />
          </Link>
        </div>
      </section>

      {/* Popular Colleges Section */}
      <section className="pt-10 md:pt-0 lg:pt-10 sm:pt-0 py-14 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Popular MBA Programs</h2>
            <p className="text-slate-400">Handpicked top institutes based on ROI and alumni feedback</p>
          </div>
          <Link href="/find-colleges" className="flex items-center gap-2 text-[#F59E0B] font-bold hover:gap-3 transition-all">
            View All Colleges
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredColleges.map(college => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
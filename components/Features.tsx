import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Globe, 
  Calendar, 
  Users 
} from 'lucide-react';

// Types
interface Course {
  id: number;
  "College Name": string;
  City: string;
  State: string;
}

interface Scholarship {
  id: number;
  scholarship_name: string;
  organisation: string;
  deadline: string;
}

interface AdmitProfile {
  name: string;
  univ: string;
  status: string;
}

// Props for the Features component
interface FeaturesProps {
  activeTab?: 'courses' | 'scholarships' | 'admits';
}

export const Features: React.FC<FeaturesProps> = ({ activeTab = 'courses' }) => {
  const [currentTab, setCurrentTab] = useState<'courses' | 'scholarships' | 'admits'>(activeTab);
  const [loading, setLoading] = useState(true);
  
  const accentColor = '#F59E0B';

  // Complete dummy data for courses
  const courses: Course[] = [
    { id: 1, "College Name": "IIM Ahmedabad", City: "Ahmedabad", State: "Gujarat" },
    { id: 2, "College Name": "IIM Bangalore", City: "Bangalore", State: "Karnataka" },
    { id: 3, "College Name": "XLRI Jamshedpur", City: "Jamshedpur", State: "Jharkhand" },
    { id: 4, "College Name": "FMS Delhi", City: "Delhi", State: "Delhi" },
    { id: 5, "College Name": "IIM Calcutta", City: "Kolkata", State: "West Bengal" },
    { id: 6, "College Name": "IIM Lucknow", City: "Lucknow", State: "Uttar Pradesh" },
    { id: 7, "College Name": "SPJIMR Mumbai", City: "Mumbai", State: "Maharashtra" },
    { id: 8, "College Name": "MDI Gurgaon", City: "Gurgaon", State: "Haryana" }
  ];

  // Complete dummy data for scholarships with shorter names
  const scholarships: Scholarship[] = [
    { 
      id: 1, 
      scholarship_name: "Merit Scholarship 2025", 
      organisation: "IIM Ahmedabad", 
      deadline: "2025-03-15" 
    },
    { 
      id: 2, 
      scholarship_name: "Need-Based Aid", 
      organisation: "XLRI", 
      deadline: "2025-04-01" 
    },
    { 
      id: 3, 
      scholarship_name: "Diversity Award", 
      organisation: "IIM Bangalore", 
      deadline: "2025-03-20" 
    },
    { 
      id: 4, 
      scholarship_name: "Excellence Grant", 
      organisation: "FMS Delhi", 
      deadline: "2025-04-10" 
    },
    { 
      id: 5, 
      scholarship_name: "Women in Business", 
      organisation: "SPJIMR Mumbai", 
      deadline: "2025-03-25" 
    },
    { 
      id: 6, 
      scholarship_name: "Rural Development Fund", 
      organisation: "IIM Lucknow", 
      deadline: "2025-04-05" 
    },
    { 
      id: 7, 
      scholarship_name: "Leadership Award", 
      organisation: "MDI Gurgaon", 
      deadline: "2025-03-30" 
    },
    { 
      id: 8, 
      scholarship_name: "Innovation Grant", 
      organisation: "IIM Calcutta", 
      deadline: "2025-04-15" 
    }
  ];

  // Complete dummy data for admits
  const admitProfiles: AdmitProfile[] = [
    { name: "Priya S.", univ: "Fostiima Business School", status: "Admitted" },
    { name: "Rahul M.", univ: "IIM Ahmedabad", status: "Waitlisted"},
    { name: "Sarah K.", univ: "DBS Global University", status: "Admitted"},
    { name: "Amit P.", univ: "IIM Bangalore", status: "Admitted"},
    { name: "Neha R.", univ: "XLRI Jamshedpur", status: "Admitted"},
    { name: "Vikram T.", univ: "FMS Delhi", status: "Waitlisted"},
    { name: "Anjali D.", univ: "SPJIMR Mumbai", status: "Admitted"},
    { name: "Karthik N.", univ: "MDI Gurgaon", status: "Admitted"}
  ];

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentTab]);

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";

    if (
      dateString.toLowerCase().includes("varies") ||
      dateString.toLowerCase().includes("rolling") ||
      dateString.toLowerCase().includes("typically")
    ) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (currentTab === 'courses') {
      return (
        <>
          <div className="border-b border-white/10 pb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white uppercase">
                <BookOpen className="w-4 h-4" style={{ color: accentColor }} /> 
                MBA Finder
              </div>
              <GraduationCap className="w-7 h-7 text-white/50" /> 
            </div>

            <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-1 tracking-tight">
              Find Your Dream MBA College
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Explore Programs and Institutes Across India
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden relative min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accentColor }}></div>
              </div>
            ) : (
              <div className="space-y-2.5 md:space-y-3 overflow-y-auto h-full pr-2 pb-4 scrollbar-hide">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-[#1e293b] p-3 md:p-4 rounded-lg border border-white/10 shadow-md hover:border-[#0ea5e9]/50 transition-all flex items-start gap-3"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0" 
                         style={{ backgroundColor: `${accentColor}1A`, border: `1px solid ${accentColor}33`, color: accentColor }}>
                      <GraduationCap className="w-4 h-4 md:w-5 md:h-5" /> 
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm md:text-base lg:text-lg truncate">
                        {course["College Name"]}
                      </h4>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400 mt-1">
                        <MapPin size={12} className="shrink-0 text-[#f59e0b]" /> 
                        <span className="truncate">
                          {course.City}, {course.State}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    if (currentTab === 'scholarships') {
      return (
        <>
          <div className="border-b border-white/10 pb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white uppercase">
                <BookOpen className="w-4 h-4" style={{ color: accentColor }} /> 
                Scholarship Finder
              </div>
              <GraduationCap className="w-7 h-7 text-white/50" /> 
            </div>

            <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-1 tracking-tight">
              Find Scholarships to Fuel Your Dreams
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Discover Scholarships from Top Universities Nationwide
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden relative min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accentColor }}></div>
              </div>
            ) : (
              <div className="space-y-2.5 md:space-y-3 overflow-y-auto h-full pr-2 pb-4 scrollbar-hide">
                {scholarships.map((scholarship) => (
                  <div
                    key={scholarship.id}
                    className="bg-[#1e293b] p-3 md:p-4 rounded-lg border border-white/10 shadow-md hover:border-[#0ea5e9]/50 transition-all flex items-start gap-3"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0" 
                         style={{ backgroundColor: `${accentColor}1A`, border: `1px solid ${accentColor}33`, color: accentColor }}>
                      <GraduationCap className="w-4 h-4 md:w-5 md:h-5" /> 
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm md:text-base lg:text-lg truncate">
                        {scholarship.scholarship_name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400 mb-1 mt-1">
                        <Globe size={12} className="shrink-0 text-[#f59e0b]" /> 
                        <span className="truncate">
                          {scholarship.organisation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400">
                        <Calendar size={12} className="shrink-0 text-[#f59e0b]" />
                        <span className="truncate">
                          <strong>Deadline:</strong> {formatDeadline(scholarship.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    // Admits tab
    return (
      <>
        <div className="border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white uppercase">
              <BookOpen className="w-4 h-4" style={{ color: accentColor }} /> 
              Admit Finder
            </div>
            <GraduationCap className="w-7 h-7 text-white/50" /> 
          </div>

          <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-1 tracking-tight">
            Access 375K+ Admits & Rejects!
          </h3>
          <p className="text-xs md:text-sm text-slate-400">
            Find folks at your dream school with the same background as you
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden relative min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accentColor }}></div>
            </div>
          ) : (
            <div className="space-y-2.5 md:space-y-3 overflow-y-auto h-full pr-2 pb-4 scrollbar-hide">
              {admitProfiles.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#1e293b] p-3 md:p-4 rounded-lg border border-white/10 shadow-md hover:border-[#0ea5e9]/50 transition-all flex items-start gap-3"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0" 
                       style={{ backgroundColor: `${accentColor}1A`, border: `1px solid ${accentColor}33`, color: accentColor }}>
                    <GraduationCap className="w-4 h-4 md:w-5 md:h-5" /> 
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm md:text-base lg:text-lg truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400 mb-1.5 mt-1">
                      <Users size={12} className="shrink-0 text-[#f59e0b]" /> 
                      <span className="truncate">
                        {item.univ}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-bold ${
                        item.status === 'Admitted' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="w-full h-full p-1 rounded-2xl bg-gradient-to-br from-[#024687] to-[#0ea5e9]">
      <div className="w-full h-full bg-[#0f172a] backdrop-blur-xl rounded-xl p-4 md:p-6 flex flex-col gap-4 border border-white/10 shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};
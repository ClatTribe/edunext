"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';
import { 
  GraduationCap,
  ChevronRight,
  Search
} from 'lucide-react';

// Color scheme
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

// Complete college data
const colleges = [
  { name: "IIM Ahmedabad (IIMA)", cutoff: 99 },
  { name: "IIM Bangalore (IIMB)", cutoff: 99 },
  { name: "IIM Calcutta (IIMC)", cutoff: 99 },
  { name: "Faculty of Management Studies (FMS), New Delhi", cutoff: 99 },
  { name: "Jamnalal Bajaj Institute of Management Studies (JBIMS), Maharashtra", cutoff: 99 },
  { name: "IIM Lucknow (IIML)", cutoff: 98 },
  { name: "IIM Indore (IIMI)", cutoff: 98 },
  { name: "IIM Kozhikode (IIMK)", cutoff: 98 },
  { name: "Indian Institute Of Foreign Trade (IIFT)", cutoff: 98 },
  { name: "ISB (PGP-YL), Hyderabad", cutoff: 98 },
  { name: "Shailesh J Mehta School of Management (SJMSoM), IIT Bombay", cutoff: 98 },
  { name: "Management Development Institute (MDI), Gurgaon", cutoff: 97 },
  { name: "IIM Shillong", cutoff: 96 },
  { name: "IIM Mumbai", cutoff: 96 },
  { name: "Department of Finance and Business Economics, DU", cutoff: 95 },
  { name: "Department of Management Sciences, IIT Kanpur", cutoff: 95 },
  { name: "Department of Management Studies, IIT Delhi", cutoff: 95 },
  { name: "Department of Management Studies, IIT Roorkee", cutoff: 95 },
  { name: "Department of Management Studies, IIT Madras", cutoff: 95 },
  { name: "SP Jain Institute of Management & Research (SPJIMR), Mumbai", cutoff: 95 },
  { name: "Tata Institute of Social Sciences (TISS)", cutoff: 95 },
  { name: "Vinod Gupta School of Management (VGSoM), IIT Kharagpur", cutoff: 95 },
  { name: "IIM Rohtak", cutoff: 94 },
  { name: "IIM Ranchi", cutoff: 94 },
  { name: "IIM Raipur", cutoff: 94 },
  { name: "IIM Udaipur", cutoff: 94 },
  { name: "IIM Tiruchirappalli (IIM Trichy)", cutoff: 94 },
  { name: "IIM Kashipur", cutoff: 94 },
  { name: "Delhi School of Economics", cutoff: 90 },
  { name: "International Management Institute (IMI), Delhi", cutoff: 90 },
  { name: "Institute of Management Technology (IMT), Ghaziabad", cutoff: 90 },
  { name: "Xavier Institute of Management, Bhubaneswar", cutoff: 90 },
  { name: "Altera Institute", cutoff: 83 },
  { name: "Birla Institute of Management Technology, Greater Noida", cutoff: 83 },
  { name: "BITSoM, Mumbai", cutoff: 83 },
  { name: "Deakin University, GIFT City Campus, Gandhinagar", cutoff: 83 },
  { name: "DMS, National Institute of Technology (NIT), Durgapur", cutoff: 83 },
  { name: "DoMS, National Institute of Technology (NIT), Trichy", cutoff: 83 },
  { name: "FORE School of Management (FSM), Delhi", cutoff: 83 },
  { name: "Goa Institute of Management, Goa", cutoff: 83 },
  { name: "Great Lakes Institute of Management, Chennai/Gurgaon", cutoff: 83 },
  { name: "Institute of Rural Management, Anand", cutoff: 83 },
  { name: "ICFAI Business Schools (IBS), Hyderabad", cutoff: 83 },
  { name: "Jio Institute, Mumbai", cutoff: 83 },
  { name: "K J Somaiya Institute of Management Studies and Research, Mumbai", cutoff: 83 },
  { name: "KREA University - IFMR Graduate School of Business", cutoff: 83 },
  { name: "Lal Bahadur Shastri Institute of Management (LBSIM), New Delhi", cutoff: 83 },
  { name: "Loyola Institute of Business Administration (LIBA), Chennai", cutoff: 83 },
  { name: "Management Development Institute (MDI), Murshidabad", cutoff: 83 },
  { name: "MICA, Ahmedabad", cutoff: 83 },
  { name: "Nirma University, Ahmedabad", cutoff: 83 },
  { name: "Queen's University Belfast's GIFT City campus", cutoff: 83 },
  { name: "School of Management, NIT Rourkela", cutoff: 83 },
  { name: "SDA Bocconi Asia Center, Mumbai", cutoff: 83 },
  { name: "SP Jain Global - MGB, Multi City", cutoff: 83 },
  { name: "T.A. Pai Management Institute (TAPMI), Manipal/Bengaluru", cutoff: 83 },
  { name: "University Business School (UBS), Chandigarh", cutoff: 83 },
  { name: "University of Southampton Delhi", cutoff: 83 },
  { name: "Welingkar Institute of Management, Mumbai/Bengaluru", cutoff: 67 },
  { name: "Ahmedabad University", cutoff: 67 },
  { name: "Asian Business School (ABS), Noida", cutoff: 67 },
  { name: "BIM Trichy", cutoff: 67 },
  { name: "Birla Global University, Bhubaneswar", cutoff: 67 },
  { name: "Chanakya University, Bengaluru", cutoff: 67 },
  { name: "Chitkara University, Chandigarh", cutoff: 67 },
  { name: "Christ University, Bengaluru", cutoff: 67 },
  { name: "D. Y. Patil Vidyapeeth (DPU)", cutoff: 67 },
  { name: "FIIB, New Delhi", cutoff: 67 },
  { name: "FLAME University", cutoff: 67 },
  { name: "Hari Shankar Singhania School of Business, Jaipur", cutoff: 67 },
  { name: "ICFAI Business Schools (8 campuses)", cutoff: 67 },
  { name: "International Management Institute (IMI), Bhubneshwar/Kolkata", cutoff: 67 },
  { name: "IIFS", cutoff: 67 },
  { name: "IILM University, Gurugram/Greater Noida/New Delhi", cutoff: 67 },
  { name: "Indus Business Academy, Bengaluru", cutoff: 67 },
  { name: "ITM Business School, Navi Mumbai", cutoff: 67 },
  { name: "Jagdish Sheth School of Management - IFIM Business School", cutoff: 67 },
  { name: "JAGSOM, Bengaluru", cutoff: 67 },
  { name: "JINS, Kalkaji, New Delhi", cutoff: 67 },
  { name: "LM Thapar School of Management, Punjab", cutoff: 67 },
  { name: "Mahindra University, Hyderabad", cutoff: 67 },
  { name: "MIT World Peace University, Pune", cutoff: 67 },
  { name: "NDIM, New Delhi", cutoff: 67 },
  { name: "NL Dalmia, Mumbai", cutoff: 67 },
  { name: "SDMIMD Mysore, Karnataka", cutoff: 67 },
  { name: "Shiv Nadar University", cutoff: 67 },
  { name: "Shoolini University, Solan, Himachal Pradesh", cutoff: 67 },
  { name: "TAXILA", cutoff: 67 },
  { name: "UPES University, Dehradun", cutoff: 67 },
  { name: "Xavier Institute of Social Service (XISS), Ranchi", cutoff: 67 },
  { name: "XIME, Bengaluru", cutoff: 67 },
  { name: "Amity University - Multi City", cutoff: 55 },
  { name: "Alliance University, Bengaluru", cutoff: 55 },
  { name: "ASM-IBMR, Pune", cutoff: 55 },
  { name: "Doon Business School, Dehradun", cutoff: 55 },
  { name: "FOSTIIMA Business School, New Delhi", cutoff: 55 },
  { name: "GNIOT, Greater Noida", cutoff: 55 },
  { name: "GITAM Business School, Telangana", cutoff: 55 },
  { name: "IIBS, Bangalore", cutoff: 55 },
  { name: "ISBN, Pune", cutoff: 55 },
  { name: "ISME, Bengaluru", cutoff: 55 },
  { name: "Jaipuria Institute of Management", cutoff: 55 },
  { name: "SIES Graduate School of Technology College, Navi Mumbai", cutoff: 55 },
  { name: "IIEBM, Indus Business School, Pune", cutoff: 55 },
  { name: "Vijaybhoomi University, Karjat, Greater Mumbai", cutoff: 55 }
];

const CollegePredictor: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [percentile, setPercentile] = useState<number | ''>('');
  const [eligibleColleges, setEligibleColleges] = useState<typeof colleges>([]);
  const [searched, setSearched] = useState(false);

  // Authentication check - redirect to register if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  const handleSearch = () => {
    if (percentile === '' || percentile < 0 || percentile > 100) {
      return;
    }
    
    const eligible = colleges.filter(college => Number(percentile) >= college.cutoff);
    setEligibleColleges(eligible);
    setSearched(true);
  };

  const getProbabilityBadge = (cutoff: number) => {
    const p = Number(percentile);
    const diff = p - cutoff;
    if (diff >= 2) return { text: 'PROBABLE', color: '#10B981' };
    if (diff >= 0) return { text: 'POSSIBLE', color: '#F59E0B' };
    return { text: 'REACH', color: '#6B7280' };
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full min-h-screen" style={{ backgroundColor: primaryBg }}>
          <div className="text-xl flex items-center gap-2" style={{ color: accentColor }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: accentColor }}></div>
            Loading...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Don't render the page content if user is not authenticated
  if (!user) return null;

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <main className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: accentColor }}>
                  CAT College Predictor
                </h1>
                <p className="text-slate-400">Enter your CAT percentile to find eligible B-Schools</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="max-w-2xl mx-auto">
            <div className="p-4 sm:p-8 rounded-xl shadow-lg backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <label htmlFor="percentile" className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
                Your CAT Percentile
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    id="percentile"
                    className="block w-full rounded-lg py-3 sm:py-4 px-4 sm:px-6 text-white placeholder:text-slate-500 text-xl sm:text-2xl font-semibold"
                    style={{ 
                      backgroundColor: primaryBg, 
                      border: `2px solid ${borderColor}`,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.border = `2px solid ${accentColor}`}
                    onBlur={(e) => e.target.style.border = `2px solid ${borderColor}`}
                    placeholder="Enter percentile (0-100)"
                    value={percentile}
                    onChange={(e) => setPercentile(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all text-white shadow-lg hover:opacity-90 w-full sm:w-auto"
                  style={{ backgroundColor: accentColor }}
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  Search
                </button>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-3">
                * Enter your overall CAT percentile to see colleges within your reach
              </p>
            </div>
          </div>

          {/* Results Section */}
          {searched && (
            <div className="rounded-xl shadow-lg p-4 sm:p-8" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 mb-2">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: accentColor }} />
                  Recommended Institutions
                </h2>
                <p className="text-base sm:text-lg font-semibold" style={{ color: accentColor }}>
                  Found: {eligibleColleges.length}
                </p>
              </div>

              {eligibleColleges.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="text-5xl sm:text-6xl mb-4">😔</div>
                  <p className="text-slate-400 text-lg sm:text-xl mb-2">No colleges found for this percentile</p>
                  <p className="text-slate-500 text-sm sm:text-base">Try entering a higher percentile</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {eligibleColleges.map((college, index) => {
                    const badge = getProbabilityBadge(college.cutoff);
                    return (
                      <div 
                        key={index}
                        className="p-4 sm:p-6 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
                        style={{ 
                          backgroundColor: primaryBg, 
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <span 
                            className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.text}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Median Cutoff</p>
                            <p className="text-xl sm:text-2xl font-bold" style={{ color: accentColor }}>{college.cutoff}</p>
                          </div>
                        </div>
                        
                        <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 min-h-[40px] sm:min-h-[48px]">
                          {college.name}
                        </h3>
                        
                        <button 
                          className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all text-slate-300 hover:text-white"
                          style={{ 
                            backgroundColor: secondaryBg,
                            border: `1px solid ${borderColor}`
                          }}
                        >
                          VIEW DETAILS
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-slate-400 text-xl">Enter your percentile above to discover your college options</p>
            </div>
          )}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default CollegePredictor;
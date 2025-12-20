"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';
import { 
  GraduationCap,
  Search,
  TrendingUp
} from 'lucide-react';

// Color scheme
const accentColor = '#F59E0B';
const primaryBg = '#050818';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

// Admission chance enum
enum AdmissionChance {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  NONE = 'NONE'
}

// College interface
interface College {
  name: string;
  cutoff: number;
}

// Prediction result interface
interface PredictionResult extends College {
  chance: AdmissionChance;
  matchScore: number;
}

// Complete college data with precise cutoffs
const colleges: College[] = [
  { name: "IIM Ahmedabad (IIMA)", cutoff: 99.5 },
  { name: "IIM Bangalore (IIMB)", cutoff: 99.2 },
  { name: "Faculty of Management Studies (FMS), New Delhi", cutoff: 99.2 },
  { name: "Jamnalal Bajaj Institute of Management Studies (JBIMS), Maharashtra", cutoff: 99.23 },
  { name: "IIM Calcutta (IIMC)", cutoff: 99.1 },
  { name: "Department of Management Studies, IIT Madras", cutoff: 98.74 },
  { name: "ISB (PGP-YL), Hyderabad", cutoff: 98.55 },
  { name: "IIM Lucknow (IIML)", cutoff: 98.3 },
  { name: "Management Development Institute (MDI), Gurgaon", cutoff: 98.14 },
  { name: "Indian Institute Of Foreign Trade (IIFT)", cutoff: 98.13 },
  { name: "Department of Management Studies, IIT Delhi", cutoff: 98.12 },
  { name: "IIM Indore (IIMI)", cutoff: 98.1 },
  { name: "IIM Kozhikode (IIMK)", cutoff: 98.1 },
  { name: "Shailesh J Mehta School of Management (SJMSoM), IIT Bombay", cutoff: 98.1 },
  { name: "IIM Shillong", cutoff: 96.83 },
  { name: "IIM Mumbai", cutoff: 96.79 },
  { name: "Department of Management Sciences, IIT Kanpur", cutoff: 95.89 },
  { name: "IIM Tiruchirappalli (IIM Trichy)", cutoff: 95.6 },
  { name: "Vinod Gupta School of Management (VGSoM), IIT Kharagpur", cutoff: 95.56 },
  { name: "Tata Institute of Social Sciences (TISS)", cutoff: 95.45 },
  { name: "Department of Finance and Business Economics, DU", cutoff: 95.23 },
  { name: "IIM Kashipur", cutoff: 95.1 },
  { name: "SP Jain Institute of Management & Research (SPJIMR), Mumbai", cutoff: 95 },
  { name: "IIM Raipur", cutoff: 94.9 },
  { name: "IIM Ranchi", cutoff: 94.8 },
  { name: "IIM Udaipur", cutoff: 94.71 },
  { name: "IIM Rohtak", cutoff: 94.23 },
  { name: "Department of Management Studies, IIT Roorkee", cutoff: 93.89 },
  { name: "International Management Institute (IMI), Delhi", cutoff: 91.34 },
  { name: "Institute of Management Technology (IMT), Ghaziabad", cutoff: 90.76 },
  { name: "Xavier Institute of Management, Bhubaneswar", cutoff: 90.23 },
  { name: "Delhi School of Economics", cutoff: 90.2 },
  { name: "FORE School of Management (FSM), Delhi", cutoff: 85.25 },
  { name: "School of Management, NIT Rourkela", cutoff: 85.14 },
  { name: "SDA Bocconi Asia Center, Mumbai", cutoff: 85.11 },
  { name: "K J Somaiya Institute of Management Studies and Research, Mumbai", cutoff: 84.85 },
  { name: "T.A. Pai Management Institute (TAPMI), Manipal/Bengaluru", cutoff: 84.42 },
  { name: "Jio Institute, Mumbai", cutoff: 84.25 },
  { name: "Deakin University, GIFT City Campus, Gandhinagar", cutoff: 83.98 },
  { name: "DoMS, National Institute of Technology (NIT), Trichy", cutoff: 83.95 },
  { name: "Goa Institute of Management, Goa", cutoff: 83.55 },
  { name: "DMS, National Institute of Technology (NIT), Durgapur", cutoff: 82.85 },
  { name: "University Business School (UBS), Chandigarh", cutoff: 82.85 },
  { name: "MICA, Ahmedabad", cutoff: 82.08 },
  { name: "Institute of Rural Management, Anand", cutoff: 81.39 },
  { name: "ICFAI Business Schools (IBS), Hyderabad", cutoff: 81.31 },
  { name: "Nirma University, Ahmedabad", cutoff: 81.19 },
  { name: "Great Lakes Institute of Management, Chennai/Gurgaon", cutoff: 80.81 },
  { name: "Queen's University Belfast's GIFT City campus", cutoff: 80.56 },
  { name: "SP Jain Global - MGB, Multi City", cutoff: 80.39 },
  { name: "Loyola Institute of Business Administration (LIBA), Chennai", cutoff: 80.29 },
  { name: "Management Development Institute (MDI), Murshidabad", cutoff: 80.22 },
  { name: "KREA University - IFMR Graduate School of Business", cutoff: 80.2 },
  { name: "Lal Bahadur Shastri Institute of Management (LBSIM), New Delhi", cutoff: 80.04 },
  { name: "BITSoM, Mumbai", cutoff: 78.98 },
  { name: "Altera Institute", cutoff: 78.23 },
  { name: "Birla Institute of Management Technology, Greater Noida", cutoff: 75.83 },
  { name: "LM Thapar School of Management, Punjab", cutoff: 75.54 },
  { name: "D. Y. Patil Vidyapeeth (DPU)", cutoff: 75.47 },
  { name: "MIT World Peace University, Pune", cutoff: 75.32 },
  { name: "Xavier Institute of Social Service (XISS), Ranchi", cutoff: 75.02 },
  { name: "SDMIMD Mysore, Karnataka", cutoff: 75.01 },
  { name: "Welingkar Institute of Management, Mumbai/Bengaluru", cutoff: 74.85 },
  { name: "Mahindra University, Hyderabad", cutoff: 74.78 },
  { name: "Indus Business Academy, Bengaluru", cutoff: 74.73 },
  { name: "IIFS", cutoff: 74.59 },
  { name: "Jagdish Sheth School of Management - IFIM Business School", cutoff: 74.47 },
  { name: "Christ University, Bengaluru", cutoff: 74.27 },
  { name: "International Management Institute (IMI), Bhubneshwar/Kolkata", cutoff: 74.24 },
  { name: "ITM Business School, Navi Mumbai", cutoff: 74.15 },
  { name: "FLAME University", cutoff: 73.83 },
  { name: "UPES University, Dehradun", cutoff: 73.46 },
  { name: "IILM University, Gurugram/Greater Noida/New Delhi", cutoff: 73.16 },
  { name: "ICFAI Business Schools (8 campuses)", cutoff: 73.04 },
  { name: "Shiv Nadar University", cutoff: 72.85 },
  { name: "NL Dalmia, Mumbai", cutoff: 72.72 },
  { name: "XIME, Bengaluru", cutoff: 72.66 },
  { name: "Chanakya University, Bengaluru", cutoff: 72.3 },
  { name: "Ahmedabad University", cutoff: 72.15 },
  { name: "Hari Shankar Singhania School of Business, Jaipur", cutoff: 71.83 },
  { name: "Shoolini University, Solan, Himachal Pradesh", cutoff: 71.79 },
  { name: "JAGSOM, Bengaluru", cutoff: 71.42 },
  { name: "Chitkara University, Chandigarh", cutoff: 71.35 },
  { name: "JINS, Kalkaji, New Delhi", cutoff: 71.29 },
  { name: "Birla Global University, Bhubaneswar", cutoff: 71.05 },
  { name: "BIM Trichy", cutoff: 70.94 },
  { name: "Asian Business School (ABS), Noida", cutoff: 70.9 },
  { name: "NDIM, New Delhi", cutoff: 70.51 },
  { name: "FIIB, New Delhi", cutoff: 70.48 },
  { name: "TAXILA", cutoff: 70.19 },
  { name: "ISBN, Pune", cutoff: 64.59 },
  { name: "IIEBM, Indus Business School, Pune", cutoff: 64.24 },
  { name: "SIES Graduate School of Technology College, Navi Mumbai", cutoff: 64.03 },
  { name: "Amity University - Multi City", cutoff: 63.56 },
  { name: "Vijaybhoomi University, Karjat, Greater Mumbai", cutoff: 59.1 },
  { name: "GNIOT, Greater Noida", cutoff: 56.21 },
  { name: "IIBS, Bangalore", cutoff: 55.71 },
  { name: "FOSTIIMA Business School, New Delhi", cutoff: 54.33 },
  { name: "ISME, Bengaluru", cutoff: 52.72 },
  { name: "Alliance University, Bengaluru", cutoff: 51.87 },
  { name: "Doon Business School, Dehradun", cutoff: 51.22 },
  { name: "Jaipuria Institute of Management", cutoff: 50.72 },
  { name: "ASM-IBMR, Pune", cutoff: 50.75 },
  { name: "GITAM Business School, Telangana", cutoff: 50.47 }
];

// Result Card Component
interface ResultCardProps {
  result: PredictionResult;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
  const getChanceColors = (chance: AdmissionChance) => {
    switch (chance) {
      case AdmissionChance.HIGH:
        return 'bg-slate-800/90 border-emerald-400/50 hover:border-emerald-400/80 shadow-emerald-500/10';
      case AdmissionChance.MODERATE:
        return 'bg-slate-800/90 border-amber-400/50 hover:border-amber-400/80 shadow-amber-500/10';
      case AdmissionChance.LOW:
        return 'bg-slate-800/90 border-orange-400/50 hover:border-orange-400/80 shadow-orange-500/10';
      default:
        return 'bg-slate-800/90 border-slate-600';
    }
  };

  const getChanceBadge = (chance: AdmissionChance) => {
    switch (chance) {
      case AdmissionChance.HIGH: 
        return { text: 'High Probability', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/50', icon: '✓' };
      case AdmissionChance.MODERATE: 
        return { text: 'Competitive', color: 'bg-amber-500/15 text-amber-300 border-amber-400/50', icon: '◆' };
      case AdmissionChance.LOW: 
        return { text: 'Ambitious', color: 'bg-orange-500/15 text-orange-300 border-orange-400/50', icon: '★' };
      default: 
        return { text: 'Unlikely', color: 'bg-slate-700 text-slate-400 border-slate-600', icon: '○' };
    }
  };

  const badge = getChanceBadge(result.chance);

  return (
    <div 
      className={`relative group rounded-xl border-2 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col ${getChanceColors(result.chance)}`}
      style={{ 
        animationDelay: `${index * 40}ms`,
        animation: 'fadeIn 0.5s ease-out forwards'
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>

      <div className="flex items-start gap-3 sm:gap-4 mb-3 relative z-10">
        <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-900/50 border border-slate-700/50 shadow-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap justify-end">
            <span className={`text-xs font-bold uppercase tracking-wide px-2 sm:px-2.5 py-1 rounded-md border flex items-center gap-1 ${badge.color}`}>
              <span className="text-[10px]">{badge.icon}</span>
              {badge.text}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold leading-tight text-white mb-1.5 line-clamp-2 text-right">{result.name}</h3>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-700/50 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Cutoff</p>
            <p className="text-sm sm:text-base font-bold text-[#F59E0B]">{result.cutoff}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Your Score</p>
            <p className="text-sm sm:text-base font-semibold text-emerald-400">{result.matchScore.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CollegePredictor: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [percentile, setPercentile] = useState<number | ''>('');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [searched, setSearched] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  const handleSearch = () => {
    if (percentile === '' || percentile < 0 || percentile > 100) {
      return;
    }
    
    const p = Number(percentile);
    
    // Calculate predictions
    const results: PredictionResult[] = colleges.map(college => {
      let chance = AdmissionChance.NONE;
      const diff = p - college.cutoff;

      if (diff >= 2) {
        chance = AdmissionChance.HIGH;
      } else if (diff >= 0) {
        chance = AdmissionChance.MODERATE;
      } else if (diff >= -2) {
        chance = AdmissionChance.LOW;
      }

      return {
        ...college,
        chance,
        matchScore: p
      };
    }).filter(r => r.chance !== AdmissionChance.NONE);

    // Sort by chance first, then by cutoff
    results.sort((a, b) => {
      const chanceWeight = {
        [AdmissionChance.HIGH]: 3,
        [AdmissionChance.MODERATE]: 2,
        [AdmissionChance.LOW]: 1,
        [AdmissionChance.NONE]: 0
      };
      
      if (chanceWeight[a.chance] !== chanceWeight[b.chance]) {
        return chanceWeight[b.chance] - chanceWeight[a.chance];
      }
      return a.cutoff - b.cutoff;
    });

    setPredictions(results);
    setSearched(true);
  };

  // Loading state
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

  if (!user) return null;

  return (
    <DefaultLayout>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="flex-1 min-h-screen p-4 sm:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 shadow-sm text-xs font-semibold uppercase tracking-widest text-[#F59E0B]">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
              CAT 2025 Predictor
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Where will your <span className="text-[#F59E0B]">percentile</span> take you?
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base mx-auto px-4">
              Enter your CAT percentile to instantly see which B-Schools are within your reach
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-xl mx-auto">
            <div className="p-4 sm:p-6 rounded-xl shadow-lg backdrop-blur-xl relative group" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="absolute -inset-0.5 bg-[#F59E0B]/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative">
                <label htmlFor="percentile" className="block text-sm sm:text-base font-medium text-white mb-2 sm:mb-3">
                  Your CAT Percentile
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      id="percentile"
                      className="block w-full rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-white placeholder:text-slate-500 text-lg sm:text-xl font-semibold"
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
                    className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all text-white shadow-lg hover:opacity-90 w-full sm:w-auto"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Search className="h-4 w-4" />
                    Predict
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  * Enter your overall CAT percentile to see colleges within your reach
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {searched && predictions.length > 0 && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-8">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: accentColor }} />
                  Your College Matches
                </h2>
                <p className="text-base sm:text-lg font-semibold" style={{ color: accentColor }}>
                  {predictions.length} B-Schools found for {percentile}% percentile
                </p>
              </div>

              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {predictions.map((college, idx) => (
                  <ResultCard 
                    key={idx}
                    result={college} 
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {searched && predictions.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-block p-4 rounded-full bg-orange-500/10 mb-4">
                <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white">No colleges found</p>
              <p className="text-slate-400 mt-2 px-4">
                Based on a percentile of <span className="font-semibold text-[#F59E0B]">{percentile}%</span>, no colleges match your criteria.<br/>
                Try a different percentile to see more options.
              </p>
            </div>
          )}

          {!searched && (
            <div className="text-center py-16 sm:py-20 opacity-60">
              <div className="inline-block p-6 rounded-full bg-[#F59E0B]/10 mb-4">
                <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-[#F59E0B]" />
              </div>
              <p className="text-lg sm:text-xl font-semibold text-white mb-2">
                Enter your percentile to get started
              </p>
              <p className="text-slate-400 text-sm sm:text-base px-4">
                Discover which B-Schools match your CAT performance
              </p>
            </div>
          )}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default CollegePredictor;
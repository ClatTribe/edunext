"use client";
import React, { useState, useEffect } from 'react';
import DefaultLayout from '../defaultLayout';
import { supabase } from '../../../lib/supabase';
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
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [percentile, setPercentile] = useState<string>('');
  const [currentPercentile, setCurrentPercentile] = useState<string>('');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordId, setRecordId] = useState<string>('');
  const [errors, setErrors] = useState<{name?: string, phone?: string, percentile?: string}>({});

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('cat_predictor_phone');
    const savedName = localStorage.getItem('cat_predictor_name');
    const savedRecordId = localStorage.getItem('cat_predictor_record_id');
    
    if (savedPhone && savedName && savedRecordId) {
      setPhone(savedPhone);
      setName(savedName);
      setRecordId(savedRecordId);
      setIsDataSaved(true);
    }
  }, []);

  // Check if user has already saved data based on phone number
  useEffect(() => {
    const checkExistingData = async () => {
      if (!phone || phone.length !== 10) return;
      if (isDataSaved) return; // Don't check if already loaded from localStorage

      try {
        const { data, error } = await supabase
          .from('cat_predictor_data')
          .select('*')
          .eq('phone', phone.trim())
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking existing data:', error);
          return;
        }

        if (data) {
          setIsDataSaved(true);
          setName(data.name || '');
          setRecordId(data.id);
          
          // Save to localStorage for persistence
          localStorage.setItem('cat_predictor_phone', phone.trim());
          localStorage.setItem('cat_predictor_name', data.name || '');
          localStorage.setItem('cat_predictor_record_id', data.id);
          
          if (data.percentile) {
            setPercentile(data.percentile.toString());
            setCurrentPercentile(data.percentile.toString());
          }
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
      }
    };

    // Only check when phone is complete (10 digits)
    if (phone.length === 10) {
      checkExistingData();
    }
  }, [phone, isDataSaved]);

  const validateForm = () => {
    const newErrors: {name?: string, phone?: string, percentile?: string} = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!percentile.trim()) {
      newErrors.percentile = 'Percentile is required';
    } else {
      const p = parseFloat(percentile);
      if (isNaN(p) || p < 0 || p > 100) {
        newErrors.percentile = 'Please enter a valid percentile (0-100)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSearched(false);

    try {
      // If data not saved yet, save it to database
      if (!isDataSaved) {
        const { data, error } = await supabase
          .from('cat_predictor_data')
          .insert({
            name: name.trim(),
            phone: phone.trim(),
            percentile: parseFloat(percentile),
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Submission error:', error);
          alert(`Submission failed: ${error.message || 'Please try again'}`);
          setIsSubmitting(false);
          return;
        }

        setIsDataSaved(true);
        setRecordId(data.id);
        
        // Save to localStorage for persistence across refreshes
        localStorage.setItem('cat_predictor_phone', phone.trim());
        localStorage.setItem('cat_predictor_name', name.trim());
        localStorage.setItem('cat_predictor_record_id', data.id);
      } else {
        // Update only percentile if data already exists
        const { error } = await supabase
          .from('cat_predictor_data')
          .update({
            percentile: parseFloat(percentile),
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId);

        if (error) {
          console.error('Update error:', error);
        }
      }
      
      // Always update current percentile for fresh search
      setCurrentPercentile(percentile);

      // Calculate predictions based on percentile
      // Calculate predictions based on percentile
      const p = parseFloat(percentile);
      
      // List of colleges that should only appear for percentile 0-60
      const lowPercentileColleges = [
        "Alliance University, Bengaluru",
        "ASM-IBMR, Pune",
        "Doon Business School, Dehradun",
        "FOSTIIMA Business School, New Delhi",
        "GNIOT, Greater Noida",
        "GITAM Business School, Telangana",
        "IIBS, Bangalore",
        "ISBN, Pune",
        "ISME, Bengaluru",
        "Jaipuria Institute of Management",
        "SIES Graduate School of Technology College, Navi Mumbai",
        "IIEBM, Indus Business School, Pune",
        "Vijaybhoomi University, Karjat, Greater Mumbai"
      ];
      
      const results: PredictionResult[] = colleges.map(college => {
        // Check if this is a low-percentile-only college
        const isLowPercentileCollege = lowPercentileColleges.includes(college.name);
        
        // If it's a low-percentile college and user's percentile is above 60, exclude it
        if (isLowPercentileCollege && p > 60) {
          return {
            ...college,
            chance: AdmissionChance.NONE,
            matchScore: p
          };
        }
        
        let chance = AdmissionChance.NONE;
        
        // For low-percentile colleges in 0-60 range, always show as LOW (Ambitious)
        if (isLowPercentileCollege && p <= 60) {
          chance = AdmissionChance.LOW;
        } else {
          const diff = p - college.cutoff;

          // HIGH: percentile is 2+ above cutoff
          if (diff >= 2) {
            chance = AdmissionChance.HIGH;
          } 
          // MODERATE: percentile is between cutoff and cutoff+2
          else if (diff >= 0) {
            chance = AdmissionChance.MODERATE;
          } 
          // LOW: percentile is within 2 below cutoff
          else if (diff >= -2) {
            chance = AdmissionChance.LOW;
          }
        }

        return {
          ...college,
          chance,
          matchScore: p
        };
      }).filter(r => r.chance !== AdmissionChance.NONE);

      // Sort: FIRST BY CHANCE (LOW->MODERATE->HIGH), THEN BY CUTOFF
      results.sort((a, b) => {
        const chanceWeight = {
          [AdmissionChance.LOW]: 1,
          [AdmissionChance.MODERATE]: 2,
          [AdmissionChance.HIGH]: 3,
          [AdmissionChance.NONE]: 0
        };
        
        if (chanceWeight[a.chance] !== chanceWeight[b.chance]) {
          return chanceWeight[a.chance] - chanceWeight[b.chance];
        }
        return b.cutoff - a.cutoff;
      });

      setPredictions(results);
      setSearched(true);

    } catch (error) {
      console.error('Error processing form:', error);
      alert('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: 'name' | 'phone' | 'percentile', value: string) => {
    if (field === 'name') {
      setName(value);
    } else if (field === 'phone') {
      setPhone(value);
    } else {
      setPercentile(value);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
              Enter your details and CAT percentile to instantly see which B-Schools are within your reach
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-5xl mx-auto">
            <div className="p-4 sm:p-6 rounded-xl shadow-lg backdrop-blur-xl relative group" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="absolute -inset-0.5 bg-[#F59E0B]/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative space-y-4">

                {/* Form Fields - Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="block w-full rounded-lg py-2.5 px-3 sm:px-4 text-white placeholder:text-slate-500 text-base"
                      style={{ 
                        backgroundColor: primaryBg, 
                        border: errors.name ? '2px solid #ef4444' : `2px solid ${borderColor}`,
                        outline: 'none'
                      }}
                      onFocus={(e) => !errors.name && (e.target.style.border = `2px solid ${accentColor}`)}
                      onBlur={(e) => !errors.name && (e.target.style.border = `2px solid ${borderColor}`)}
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isDataSaved || isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="block w-full rounded-lg py-2.5 px-3 sm:px-4 text-white placeholder:text-slate-500 text-base"
                      style={{ 
                        backgroundColor: primaryBg, 
                        border: errors.phone ? '2px solid #ef4444' : `2px solid ${borderColor}`,
                        outline: 'none'
                      }}
                      onFocus={(e) => !errors.phone && (e.target.style.border = `2px solid ${accentColor}`)}
                      onBlur={(e) => !errors.phone && (e.target.style.border = `2px solid ${borderColor}`)}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      maxLength={10}
                      disabled={isDataSaved || isSubmitting}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Percentile */}
                  <div>
                    <label htmlFor="percentile" className="block text-sm font-medium text-white mb-2">
                      Your CAT Percentile *
                    </label>
                    <input
                      type="number"
                      id="percentile"
                      className="block w-full rounded-lg py-2.5 px-3 sm:px-4 text-white placeholder:text-slate-500 text-base"
                      style={{ 
                        backgroundColor: primaryBg, 
                        border: errors.percentile ? '2px solid #ef4444' : `2px solid ${borderColor}`,
                        outline: 'none'
                      }}
                      onFocus={(e) => !errors.percentile && (e.target.style.border = `2px solid ${accentColor}`)}
                      onBlur={(e) => !errors.percentile && (e.target.style.border = `2px solid ${borderColor}`)}
                      placeholder="0-100"
                      value={percentile}
                      onChange={(e) => handleInputChange('percentile', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={isSubmitting}
                    />
                    {errors.percentile && (
                      <p className="mt-1 text-xs text-red-400">{errors.percentile}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-end">
                    <button 
                      onClick={handleSearch}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: accentColor }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isDataSaved ? 'Searching...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          {isDataSaved ? 'Search Colleges' : 'Submit & Search'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 text-xs">
                  * Your name and phone number will be saved once and cannot be changed. You can update your percentile anytime to see different predictions.
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
                  {predictions.length} B-Schools found for {currentPercentile}% percentile
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
                Based on a percentile of <span className="font-semibold text-[#F59E0B]">{currentPercentile}%</span>, no colleges match your criteria.<br/>
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
                Enter your details to get started
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
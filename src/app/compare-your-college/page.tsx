"use client"
import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  MapPin,
  IndianRupee,
  Trophy,
  Award,
  CheckCircle,
  BookOpen,
  X,
  TrendingUp,
  Star,
  ArrowLeft,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import DefaultLayout from "../defaultLayout"
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

// Define the Course interface matching your Supabase schema
interface Course {
  id: number
  Rank?: string | null
  "College Name": string | null
  Location?: string | null
  City?: string | null
  State?: string | null
  Approvals?: string | null
  "CD Score"?: string | null
  "Course Fees"?: string | null
  "Average Package"?: string | null
  "Highest Package"?: string | null
  "Placement Score"?: string | null
  "User Rating"?: string | null
  "User Reviews"?: string | null
  Ranking?: string | null
  Specialization?: string | null
  "Application Link"?: string | null
  scholarship?: string | null
  entrance_exam?: string | null
  is_priority?: boolean
  matchScore?: number
}

// Color scheme matching the admit finder page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


const CollegeComparePage: React.FC = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch from database for logged-in users
      fetchCompareCollegesFromDB();
    } else {
      // Fetch from localStorage for non-logged-in users
      fetchCompareCollegesFromLocalStorage();
    }
  }, [user]);

  const fetchCompareCollegesFromDB = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch compare_colleges records for this user
      const { data: compareData, error: compareError } = await supabase
        .from("compare_colleges")
        .select("college_id")
        .eq("user_id", user.id);

      if (compareError) throw compareError;

      if (!compareData || compareData.length === 0) {
        setColleges([]);
        setLoading(false);
        return;
      }

      // Extract college IDs
      const collegeIds = compareData.map(item => item.college_id);

      // Fetch full college details
      const { data: collegesData, error: collegesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", collegeIds);

      if (collegesError) throw collegesError;

      setColleges(collegesData || []);
    } catch (err) {
      console.error("Error fetching compare colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompareCollegesFromLocalStorage = () => {
    try {
      const compareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]') as number[];
      
      if (compareIds.length === 0) {
        setColleges([]);
        setLoading(false);
        return;
      }

      // Get from localStorage cache
      const cachedColleges = JSON.parse(localStorage.getItem('allColleges') || '[]') as Course[];
      const selectedColleges = cachedColleges.filter((c: Course) => compareIds.includes(c.id));
      
      setColleges(selectedColleges);
    } catch (err) {
      console.error("Error fetching from localStorage:", err);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const removeCollege = async (id: number) => {
    if (!confirm("Are you sure you want to remove this college from comparison?")) return;

    try {
      if (user) {
        // Remove from database
        const { error } = await supabase
          .from("compare_colleges")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", id);

        if (error) throw error;
      } else {
        // Remove from localStorage
        const compareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]') as number[];
        const updatedIds = compareIds.filter(cid => cid !== id);
        localStorage.setItem('compareColleges', JSON.stringify(updatedIds));
      }

      // Update UI
      setColleges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error removing college:", err);
      alert("Failed to remove college. Please try again.");
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const resetComparison = async () => {
    if (!confirm("Are you sure you want to clear all comparisons?")) return;

    try {
      if (user) {
        // Clear from database
        const { error } = await supabase
          .from("compare_colleges")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Clear from localStorage
        localStorage.removeItem('compareColleges');
      }

      setColleges([]);
    } catch (err) {
      console.error("Error clearing comparisons:", err);
      alert("Failed to clear comparisons. Please try again.");
    }
  };

  const getBestValue = (field: keyof Course): number | null => {
    if (colleges.length === 0) return null;
    
    const values = colleges.map((c: Course) => {
      const val = c[field];
      if (!val) return 0;
      // Extract numbers from strings like "₹18 LPA" or "95%"
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    });
    
    const maxVal = Math.max(...values);
    return colleges.find((c: Course) => {
      const val = c[field];
      if (!val) return false;
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return num === maxVal;
    })?.id || null;
  };

  const getLowestFees = (): number | null => {
    if (colleges.length === 0) return null;
    
    const values = colleges.map((c: Course) => {
      const val = c["Course Fees"];
      if (!val) return Infinity;
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return isNaN(num) ? Infinity : num;
    });
    
    const minVal = Math.min(...values);
    return colleges.find((c: Course) => {
      const val = c["Course Fees"];
      if (!val) return false;
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return num === minVal;
    })?.id || null;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: accentColor }}></div>
            <p className="text-slate-400">Loading comparison...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (colleges.length === 0) {
    return (
      <DefaultLayout>
        <div className="min-h-screen p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-2 font-semibold mb-6 hover:opacity-80 transition-opacity"
              style={{ color: accentColor }}
            >
              <ArrowLeft size={20} />
              Back to Colleges
            </button>
            
            <div className="rounded-xl shadow-lg p-12 text-center backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <GraduationCap size={64} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Colleges to Compare</h2>
              <p className="text-slate-400 mb-6">
                {user 
                  ? "Select 2-3 colleges from the course finder to compare them" 
                  : "Login and select 2-3 colleges from the course finder to compare them"}
              </p>
              <button
                onClick={goBack}
                className="text-white px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                Browse Colleges
              </button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const bestPackage = getBestValue("Average Package");
  const bestPlacement = getBestValue("Placement Score");
  const lowestFees = getLowestFees();
  const bestRating = getBestValue("User Rating");

  return (
    <DefaultLayout>
      <div className="min-h-screen p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
              style={{ color: accentColor }}
            >
              <ArrowLeft size={20} />
              Back to Colleges
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={resetComparison}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm text-slate-300"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: accentColor }}>
              College Comparison
            </h1>
            <p className="text-slate-400">
              Comparing {colleges.length} college{colleges.length !== 1 ? 's' : ''} side by side
            </p>
          </div>

          {/* Comparison Table - Desktop */}
          <div className="hidden lg:block rounded-xl shadow-lg overflow-hidden backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: accentColor }}>
                    <th className="p-4 text-left text-white font-semibold sticky left-0 z-10" style={{ backgroundColor: accentColor }}>
                      Category
                    </th>
                    {colleges.map((college: Course) => (
                      <th key={college.id} className="p-4 text-center text-white min-w-[280px]">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="ml-auto text-white hover:text-red-300 transition-colors"
                          >
                            <X size={18} />
                          </button>
                          <h3 className="font-bold text-lg">{college["College Name"]}</h3>
                          {college.Specialization && (
                            <span className="text-xs px-3 py-1 rounded-full inline-block" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                              {college.Specialization}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Location */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: accentColor }} />
                        Location
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.City && college.State ? (
                          <div className="text-sm">
                            <p className="font-medium text-white">{college.City}</p>
                            <p className="text-slate-400">{college.State}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Course Fees */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={16} style={{ color: accentColor }} />
                        Course Fees
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Course Fees"] ? (
                          <div className={`font-semibold ${lowestFees === college.id ? 'text-green-400 bg-green-500/20 py-2 rounded-lg' : 'text-white'}`}>
                            {college["Course Fees"]}
                            {lowestFees === college.id && (
                              <div className="text-xs text-green-400 mt-1">Most Affordable</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Average Package */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} style={{ color: accentColor }} />
                        Average Package
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Average Package"] ? (
                          <div className={`font-semibold ${bestPackage === college.id ? 'text-green-400 bg-green-500/20 py-2 rounded-lg' : 'text-white'}`}>
                            {college["Average Package"]}
                            {bestPackage === college.id && (
                              <div className="text-xs text-green-400 mt-1">Highest</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Highest Package */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} style={{ color: accentColor }} />
                        Highest Package
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Highest Package"] ? (
                          <div className="font-semibold text-white">
                            {college["Highest Package"]}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Placement Score */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <Award size={16} style={{ color: accentColor }} />
                        Placement Score
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Placement Score"] ? (
                          <div className={`font-semibold ${bestPlacement === college.id ? 'text-purple-400 bg-purple-500/20 py-2 rounded-lg' : 'text-white'}`}>
                            {college["Placement Score"]}
                            {bestPlacement === college.id && (
                              <div className="text-xs text-purple-400 mt-1">Best</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Ranking */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} style={{ color: accentColor }} />
                        Ranking
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.Ranking ? (
                          <div className="text-sm font-medium text-white">
                            {college.Ranking}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* User Rating */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <Star size={16} style={{ color: accentColor }} />
                        User Rating
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["User Rating"] ? (
                          <div className={`font-semibold ${bestRating === college.id ? 'text-yellow-400 bg-yellow-500/20 py-2 rounded-lg' : 'text-white'}`}>
                            {college["User Rating"]}
                            {bestRating === college.id && (
                              <div className="text-xs text-yellow-400 mt-1">Top Rated</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Approvals */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} style={{ color: accentColor }} />
                        Approvals
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.Approvals ? (
                          <div className="text-sm text-white">
                            {college.Approvals}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Entrance Exam */}
                  <tr className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} style={{ color: accentColor }} />
                        Entrance Exam
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.entrance_exam ? (
                          <div className="text-sm font-medium text-white">
                            {college.entrance_exam}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Scholarship */}
                  <tr className="hover:bg-opacity-50" style={{ backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
                    <td className="p-4 font-semibold text-slate-300 sticky left-0" style={{ backgroundColor: secondaryBg }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} style={{ color: accentColor }} />
                        Scholarship
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.scholarship ? (
                          <div className="text-sm text-white">
                            {college.scholarship}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Card Based */}
          {/* Mobile View - Vertical Grid Comparison */}
<div className="lg:hidden">
  <div className="rounded-xl shadow-lg overflow-hidden backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
    {/* College Headers */}
    <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ background: accentColor }}>
      {colleges.map((college: Course) => (
        <div key={college.id} className="p-3 text-center relative">
          <button
            onClick={() => removeCollege(college.id)}
            className="absolute top-2 right-2 text-white hover:text-red-300 transition-colors z-10"
          >
            <X size={16} />
          </button>
          <h3 className="font-bold text-xs text-white leading-tight mb-2 pr-6">
            {college["College Name"]}
          </h3>
          {college.Specialization && (
            <span className="text-[10px] px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              {college.Specialization}
            </span>
          )}
        </div>
      ))}
    </div>

    {/* Comparison Rows */}
    <div className="divide-y" style={{ borderColor: borderColor }}>
      
      {/* Location */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college.City && college.State ? (
              <div>
                <p className="font-medium text-white text-xs leading-tight">{college.City}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{college.State}</p>
                <p className="text-slate-500 text-[9px] mt-1">(Location)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Location)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Course Fees */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college["Course Fees"] ? (
              <div>
                <div className={`text-xs font-semibold ${lowestFees === college.id ? 'text-green-400' : 'text-white'}`}>
                  {college["Course Fees"]}
                </div>
                {lowestFees === college.id && (
                  <div className="text-[9px] text-green-400 mt-0.5">Most Affordable</div>
                )}
                <p className="text-slate-500 text-[9px] mt-1">(Course Fees)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Course Fees)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Average Package */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college["Average Package"] ? (
              <div>
                <div className={`text-xs font-semibold ${bestPackage === college.id ? 'text-green-400' : 'text-white'}`}>
                  {college["Average Package"]}
                </div>
                {bestPackage === college.id && (
                  <div className="text-[9px] text-green-400 mt-0.5">Highest</div>
                )}
                <p className="text-slate-500 text-[9px] mt-1">(Avg Package)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Avg Package)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Highest Package */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college["Highest Package"] ? (
              <div>
                <div className="text-xs font-semibold text-white">
                  {college["Highest Package"]}
                </div>
                <p className="text-slate-500 text-[9px] mt-1">(Highest Package)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Highest Package)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Placement Score */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college["Placement Score"] ? (
              <div>
                <div className={`text-xs font-semibold ${bestPlacement === college.id ? 'text-purple-400' : 'text-white'}`}>
                  {college["Placement Score"]}
                </div>
                {bestPlacement === college.id && (
                  <div className="text-[9px] text-purple-400 mt-0.5">Best</div>
                )}
                <p className="text-slate-500 text-[9px] mt-1">(Placement Score)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Placement Score)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ranking */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college.Ranking ? (
              <div>
                <div className="text-xs font-medium text-white">
                  {college.Ranking}
                </div>
                <p className="text-slate-500 text-[9px] mt-1">(Ranking)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Ranking)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Rating */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college["User Rating"] ? (
              <div>
                <div className={`text-xs font-semibold ${bestRating === college.id ? 'text-yellow-400' : 'text-white'}`}>
                  {college["User Rating"]}
                </div>
                {bestRating === college.id && (
                  <div className="text-[9px] text-yellow-400 mt-0.5">Top Rated</div>
                )}
                <p className="text-slate-500 text-[9px] mt-1">(User Rating)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(User Rating)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Approvals */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college.Approvals ? (
              <div>
                <div className="text-xs text-white break-words">
                  {college.Approvals}
                </div>
                <p className="text-slate-500 text-[9px] mt-1">(Approvals)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Approvals)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Entrance Exam */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college.entrance_exam ? (
              <div>
                <div className="text-xs font-medium text-white break-words">
                  {college.entrance_exam}
                </div>
                <p className="text-slate-500 text-[9px] mt-1">(Entrance Exam)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Entrance Exam)</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scholarship */}
      <div className={`grid ${colleges.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px`} style={{ backgroundColor: borderColor }}>
        {colleges.map((college: Course) => (
          <div key={college.id} className="p-3 text-center" style={{ backgroundColor: secondaryBg }}>
            {college.scholarship ? (
              <div>
                <div className="text-xs text-white break-words">
                  {college.scholarship}
                </div>
                <p className="text-slate-500 text-[9px] mt-1">(Scholarship)</p>
              </div>
            ) : (
              <div>
                <span className="text-slate-500 text-xs">N/A</span>
                <p className="text-slate-500 text-[9px] mt-1">(Scholarship)</p>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  </div>
</div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CollegeComparePage
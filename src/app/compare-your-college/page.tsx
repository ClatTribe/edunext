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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comparison...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (colleges.length === 0) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Colleges
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Colleges to Compare</h2>
              <p className="text-gray-600 mb-6">
                {user 
                  ? "Select 2-3 colleges from the course finder to compare them" 
                  : "Login and select 2-3 colleges from the course finder to compare them"}
              </p>
              <button
                onClick={goBack}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <ArrowLeft size={20} />
              Back to Colleges
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={resetComparison}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              College Comparison
            </h1>
            <p className="text-gray-600">
              Comparing {colleges.length} college{colleges.length !== 1 ? 's' : ''} side by side
            </p>
          </div>

          {/* Quick Insights */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Quick Insights</h3>
                <p className="text-sm text-gray-600">Key highlights from your comparison</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {bestPackage && (
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-xs font-semibold text-gray-600">Highest Package</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {colleges.find((c: Course) => c.id === bestPackage)?.["College Name"]}
                  </p>
                </div>
              )}
              
              {lowestFees && (
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <IndianRupee size={16} className="text-blue-600" />
                    <span className="text-xs font-semibold text-gray-600">Most Affordable</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {colleges.find((c: Course) => c.id === lowestFees)?.["College Name"]}
                  </p>
                </div>
              )}
              
              {bestPlacement && (
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={16} className="text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Best Placements</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {colleges.find((c: Course) => c.id === bestPlacement)?.["College Name"]}
                  </p>
                </div>
              )}
              
              {bestRating && (
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={16} className="text-yellow-600" />
                    <span className="text-xs font-semibold text-gray-600">Top Rated</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {colleges.find((c: Course) => c.id === bestRating)?.["College Name"]}
                  </p>
                </div>
              )}
            </div>
          </div> */}

          {/* Comparison Table - Desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <th className="p-4 text-left text-white font-semibold sticky left-0 bg-blue-600 z-10">
                      Category
                    </th>
                    {colleges.map((college: Course) => (
                      <th key={college.id} className="p-4 text-center text-white min-w-[280px]">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="ml-auto text-white hover:text-red-200 transition-colors"
                          >
                            <X size={18} />
                          </button>
                          <h3 className="font-bold text-lg">{college["College Name"]}</h3>
                          {college.Specialization && (
                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
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
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        Location
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.City && college.State ? (
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">{college.City}</p>
                            <p className="text-gray-600">{college.State}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Course Fees */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <IndianRupee size={16} className="text-blue-600" />
                        Course Fees
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Course Fees"] ? (
                          <div className={`font-semibold text-gray-800 ${lowestFees === college.id ? 'text-green-600 bg-green-50 py-2 rounded-lg' : ''}`}>
                            {college["Course Fees"]}
                            {lowestFees === college.id && (
                              <div className="text-xs text-green-600 mt-1">Most Affordable</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Average Package */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600" />
                        Average Package
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Average Package"] ? (
                          <div className={`font-semibold text-gray-800 ${bestPackage === college.id ? 'text-green-600 bg-green-50 py-2 rounded-lg' : ''}`}>
                            {college["Average Package"]}
                            {bestPackage === college.id && (
                              <div className="text-xs text-green-600 mt-1">Highest</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Highest Package */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-blue-600" />
                        Highest Package
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Highest Package"] ? (
                          <div className="font-semibold text-gray-800">
                            {college["Highest Package"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Placement Score */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-blue-600" />
                        Placement Score
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["Placement Score"] ? (
                          <div className={`font-semibold text-gray-800 ${bestPlacement === college.id ? 'text-purple-600 bg-purple-50 py-2 rounded-lg' : ''}`}>
                            {college["Placement Score"]}
                            {bestPlacement === college.id && (
                              <div className="text-xs text-purple-600 mt-1">Best</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Ranking */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-blue-600" />
                        Ranking
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.Ranking ? (
                          <div className="text-sm font-medium text-gray-800">
                            {college.Ranking}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* User Rating */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-blue-600" />
                        User Rating
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college["User Rating"] ? (
                          <div className={`font-semibold ${bestRating === college.id ? 'text-yellow-600 bg-yellow-50 py-2 rounded-lg' : 'text-gray-800'}`}>
                            {college["User Rating"]}
                            {bestRating === college.id && (
                              <div className="text-xs text-yellow-600 mt-1">Top Rated</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Approvals */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        Approvals
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.Approvals ? (
                          <div className="text-sm text-gray-800">
                            {college.Approvals}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Entrance Exam */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-600" />
                        Entrance Exam
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.entrance_exam ? (
                          <div className="text-sm font-medium text-gray-800">
                            {college.entrance_exam}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Scholarship */}
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        Scholarship
                      </div>
                    </td>
                    {colleges.map((college: Course) => (
                      <td key={college.id} className="p-4 text-center">
                        {college.scholarship ? (
                          <div className="text-sm text-gray-800">
                            {college.scholarship}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Card Based */}
          {/* Mobile View - Simple Comparison */}
          <div className="lg:hidden space-y-6">
            {/* First Two Colleges Comparison */}
            {colleges.slice(0, 2).length === 2 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Headers */}
                <div className="grid grid-cols-3 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="p-3 border-r border-white/20"></div>
                  {colleges.slice(0, 2).map((college: Course) => (
                    <div key={college.id} className="p-3 text-center">
                      <button
                        onClick={() => removeCollege(college.id)}
                        className="text-white hover:text-red-200 mb-2 float-right"
                      >
                        <X size={16} />
                      </button>
                      <h3 className="font-bold text-xs text-white leading-tight mb-2 clear-both">
                        {college["College Name"]}
                      </h3>
                      {college.Specialization && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-block text-white">
                          {college.Specialization}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comparison Rows */}
                <div className="divide-y divide-gray-100">
                  {/* Location */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Location</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college.City && college.State ? (
                          <div className="text-xs">
                            <p className="font-medium text-gray-800">{college.City}</p>
                            <p className="text-gray-600">{college.State}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Course Fees */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <IndianRupee size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Fees</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college["Course Fees"] ? (
                          <div className={`text-xs font-semibold ${lowestFees === college.id ? 'text-green-600' : 'text-gray-800'}`}>
                            {college["Course Fees"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Average Package */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <TrendingUp size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Avg Pkg</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college["Average Package"] ? (
                          <div className={`text-xs font-semibold ${bestPackage === college.id ? 'text-green-600' : 'text-gray-800'}`}>
                            {college["Average Package"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Highest Package */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <Trophy size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">High Pkg</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college["Highest Package"] ? (
                          <div className="text-xs font-semibold text-gray-800">
                            {college["Highest Package"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Placement Score */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <Award size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Placement</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college["Placement Score"] ? (
                          <div className={`text-xs font-semibold ${bestPlacement === college.id ? 'text-purple-600' : 'text-gray-800'}`}>
                            {college["Placement Score"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Ranking */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <Trophy size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Ranking</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college.Ranking ? (
                          <div className="text-xs font-medium text-gray-800">{college.Ranking}</div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* User Rating */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <Star size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Rating</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college["User Rating"] ? (
                          <div className={`text-xs font-semibold ${bestRating === college.id ? 'text-yellow-600' : 'text-gray-800'}`}>
                            {college["User Rating"]}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Approvals */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Approvals</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college.Approvals ? (
                          <div className="text-xs text-gray-800">{college.Approvals}</div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Entrance Exam */}
                  <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <BookOpen size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Exam</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college.entrance_exam ? (
                          <div className="text-xs font-medium text-gray-800">{college.entrance_exam}</div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Scholarship */}
                  {/* <div className="grid grid-cols-3">
                    <div className="p-3 bg-gray-50 flex items-center gap-1">
                      <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">Scholarship</span>
                    </div>
                    {colleges.slice(0, 2).map((college: Course) => (
                      <div key={college.id} className="p-3 text-center border-l border-gray-100">
                        {college.scholarship ? (
                          <div className="text-xs text-gray-800">{college.scholarship}</div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </div>
                    ))}
                  </div> */}
                </div>
              </div>
            )}

            {/* Third College (if exists) - Separate Card Below */}
            {colleges[2] && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{colleges[2]["College Name"]}</h3>
                    <button
                      onClick={() => removeCollege(colleges[2].id)}
                      className="text-white hover:text-red-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {colleges[2].Specialization && (
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full inline-block">
                      {colleges[2].Specialization}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {colleges[2].City && colleges[2].State && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Location</p>
                        <p className="font-medium text-gray-800">{colleges[2].City}, {colleges[2].State}</p>
                      </div>
                    </div>
                  )}

                  {colleges[2]["Course Fees"] && (
                    <div className="flex items-start gap-3">
                      <IndianRupee size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Course Fees</p>
                        <p className={`font-semibold ${lowestFees === colleges[2].id ? 'text-green-600' : 'text-gray-800'}`}>
                          {colleges[2]["Course Fees"]}
                        </p>
                      </div>
                    </div>
                  )}

                  {colleges[2]["Average Package"] && (
                    <div className="flex items-start gap-3">
                      <TrendingUp size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Average Package</p>
                        <p className={`font-semibold ${bestPackage === colleges[2].id ? 'text-green-600' : 'text-gray-800'}`}>
                          {colleges[2]["Average Package"]}
                        </p>
                      </div>
                    </div>
                  )}

                  {colleges[2]["Highest Package"] && (
                    <div className="flex items-start gap-3">
                      <Trophy size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Highest Package</p>
                        <p className="font-semibold text-gray-800">{colleges[2]["Highest Package"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[2]["Placement Score"] && (
                    <div className="flex items-start gap-3">
                      <Award size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Placement Score</p>
                        <p className={`font-semibold ${bestPlacement === colleges[2].id ? 'text-purple-600' : 'text-gray-800'}`}>
                          {colleges[2]["Placement Score"]}
                        </p>
                      </div>
                    </div>
                  )}

                  {colleges[2].Ranking && (
                    <div className="flex items-start gap-3">
                      <Trophy size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ranking</p>
                        <p className="font-medium text-gray-800">{colleges[2].Ranking}</p>
                      </div>
                    </div>
                  )}

                  {colleges[2]["User Rating"] && (
                    <div className="flex items-start gap-3">
                      <Star size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">User Rating</p>
                        <p className={`font-semibold ${bestRating === colleges[2].id ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {colleges[2]["User Rating"]}
                        </p>
                      </div>
                    </div>
                  )}

                  {colleges[2].Approvals && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Approvals</p>
                        <p className="text-sm text-gray-800">{colleges[2].Approvals}</p>
                      </div>
                    </div>
                  )}

                  {colleges[2].entrance_exam && (
                    <div className="flex items-start gap-3">
                      <BookOpen size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Entrance Exam</p>
                        <p className="font-medium text-gray-800">{colleges[2].entrance_exam}</p>
                      </div>
                    </div>
                  )}

                  {/* {colleges[2].scholarship && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Scholarship</p>
                        <p className="text-sm text-gray-800">{colleges[2].scholarship}</p>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            )}

            {/* Single College View (if only 1 college) */}
            {colleges.length === 1 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{colleges[0]["College Name"]}</h3>
                    <button
                      onClick={() => removeCollege(colleges[0].id)}
                      className="text-white hover:text-red-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {colleges[0].Specialization && (
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full inline-block">
                      {colleges[0].Specialization}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {colleges[0].City && colleges[0].State && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Location</p>
                        <p className="font-medium text-gray-800">{colleges[0].City}, {colleges[0].State}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0]["Course Fees"] && (
                    <div className="flex items-start gap-3">
                      <IndianRupee size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Course Fees</p>
                        <p className="font-semibold text-gray-800">{colleges[0]["Course Fees"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0]["Average Package"] && (
                    <div className="flex items-start gap-3">
                      <TrendingUp size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Average Package</p>
                        <p className="font-semibold text-gray-800">{colleges[0]["Average Package"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0]["Highest Package"] && (
                    <div className="flex items-start gap-3">
                      <Trophy size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Highest Package</p>
                        <p className="font-semibold text-gray-800">{colleges[0]["Highest Package"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0]["Placement Score"] && (
                    <div className="flex items-start gap-3">
                      <Award size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Placement Score</p>
                        <p className="font-semibold text-gray-800">{colleges[0]["Placement Score"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0].Ranking && (
                    <div className="flex items-start gap-3">
                      <Trophy size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ranking</p>
                        <p className="font-medium text-gray-800">{colleges[0].Ranking}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0]["User Rating"] && (
                    <div className="flex items-start gap-3">
                      <Star size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">User Rating</p>
                        <p className="font-semibold text-gray-800">{colleges[0]["User Rating"]}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0].Approvals && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Approvals</p>
                        <p className="text-sm text-gray-800">{colleges[0].Approvals}</p>
                      </div>
                    </div>
                  )}

                  {colleges[0].entrance_exam && (
                    <div className="flex items-start gap-3">
                      <BookOpen size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Entrance Exam</p>
                        <p className="font-medium text-gray-800">{colleges[0].entrance_exam}</p>
                      </div>
                    </div>
                  )}

                  {/* {colleges[0].scholarship && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Scholarship</p>
                        <p className="text-sm text-gray-800">{colleges[0].scholarship}</p>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CollegeComparePage
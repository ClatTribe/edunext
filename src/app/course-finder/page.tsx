"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Calendar, Globe, Award, Sparkles, Trophy, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';

interface Course {
  id: number;
  'University / College': string | null;
  Programs: string | null;
  'Official website': string | null;
  'Application deadline': string | null;
  'Eligibility summary': string | null;
  'Entrance exams': string | null;
  'Application fee': string | null;
  'Tution Fee': string | null;
  'Scholarships available': string | null;
  'Remarks / application mode': string | null;
  References: string | null;
  state: string | null;
  matchScore?: number;
}

interface UserProfile {
  target_countries: string[];
  degree: string;
  program: string;
  budget: string | null;
  twelfth_score: string | null;
  ug_score: string | null;
  pg_score: string | null;
  test_scores: Array<{ exam: string; score: string }>;
  has_experience: string | null;
  experience_years: string | null;
}

const CourseFinder: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [selectedEntrance, setSelectedEntrance] = useState('');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [savedCourses, setSavedCourses] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const perPage = 15;

  const indianStates = [
    'Maharashtra',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh',
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep'
  ];

  useEffect(() => {
    fetchUserProfile();
    if (user) {
      loadSavedCourses();
    }
  }, [user]);

  useEffect(() => {
    if (!loadingProfile) {
      if (viewMode === 'all') {
        fetchCourses();
      } else {
        fetchRecommendedCourses();
      }
    }
  }, [loadingProfile, viewMode]);

  useEffect(() => {
    if (viewMode === 'all') {
      applyFilters();
    }
  }, [searchQuery, selectedState, selectedUniversity, selectedDeadline, selectedEntrance, scholarshipOnly, courses, viewMode]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      
      if (!user) {
        setUserProfile(null);
        setLoadingProfile(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('admit_profiles')
        .select('target_countries, degree, program, budget, twelfth_score, ug_score, pg_score, test_scores, has_experience, experience_years')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setUserProfile(null);
      } else if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadSavedCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shortlist_builder')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('item_type', 'course');

      if (error) {
        console.error('Error loading saved courses:', error);
        return;
      }

      if (data) {
        const courseIds = new Set(data.map(item => item.course_id).filter(Boolean));
        setSavedCourses(courseIds);
      }
    } catch (error) {
      console.error('Error loading saved courses:', error);
    }
  };

  const toggleSaved = async (course: Course) => {
    if (!user) {
      alert('Please login to save courses');
      return;
    }

    try {
      const isSaved = savedCourses.has(course.id);

      if (isSaved) {
        const { error } = await supabase
          .from('shortlist_builder')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', course.id)
          .eq('item_type', 'course');

        if (error) throw error;

        setSavedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(course.id);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('shortlist_builder')
          .insert({
            user_id: user.id,
            item_type: 'course',
            course_id: course.id,
            status: 'interested'
          });

        if (error) throw error;

        setSavedCourses(prev => new Set([...prev, course.id]));
      }
    } catch (error) {
      console.error('Error toggling saved course:', error);
      alert('Failed to update shortlist. Please try again.');
    }
  };

  const calculateMatchScore = (course: Course): number => {
    if (!userProfile) return 0;

    let score = 0;

    if (userProfile.program && course.Programs) {
      const userProgram = userProfile.program.toLowerCase().trim();
      const programName = course.Programs.toLowerCase();
      
      const commonWords = ['in', 'of', 'and', 'the', 'for', 'with', 'on', 'at', 'to', 'a', 'an'];
      const userKeywords = userProgram
        .split(/[\s,\-/]+/)
        .filter(k => k.length > 2 && !commonWords.includes(k));
      
      if (programName.includes(userProgram)) {
        score += 50;
      } else {
        let keywordMatches = 0;
        const totalKeywords = userKeywords.length || 1;
        
        for (const keyword of userKeywords) {
          if (programName.includes(keyword)) {
            keywordMatches++;
          }
        }
        
        const matchPercentage = keywordMatches / totalKeywords;
        
        if (matchPercentage >= 0.8) score += 45;
        else if (matchPercentage >= 0.6) score += 38;
        else if (matchPercentage >= 0.4) score += 30;
        else if (matchPercentage >= 0.2) score += 20;
        else if (keywordMatches > 0) score += 10;
      }
      
      const fieldGroups: Record<string, string[]> = {
        cs: ['computer', 'software', 'data', 'artificial', 'intelligence', 'machine', 'learning', 'cyber', 'information', 'technology'],
        business: ['business', 'management', 'mba', 'finance', 'accounting', 'marketing', 'economics'],
        engineering: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'industrial'],
        science: ['science', 'biology', 'chemistry', 'physics', 'mathematics', 'statistics'],
        arts: ['art', 'design', 'music', 'theatre', 'media', 'communication', 'journalism']
      };
      
      for (const group of Object.values(fieldGroups)) {
        const userInGroup = group.some(term => userProgram.includes(term));
        const courseInGroup = group.some(term => programName.includes(term));
        if (userInGroup && courseInGroup && score < 30) {
          score += 15;
          break;
        }
      }
    }

    if (userProfile.degree) {
      score += 20;
    }

    return score;
  };

  const fetchRecommendedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userProfile) {
        setError('Please complete your profile to see personalized recommendations');
        setFilteredCourses([]);
        setLoading(false);
        return;
      }

      if (!userProfile.degree) {
        setError('Please select your target degree in your profile');
        setFilteredCourses([]);
        setLoading(false);
        return;
      }

      if (!userProfile.program) {
        setError('Please select your field of study in your profile');
        setFilteredCourses([]);
        setLoading(false);
        return;
      }

      let allCourses: Course[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + batchSize - 1);

        if (supabaseError) throw supabaseError;

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data];
          hasMore = data.length === batchSize;
          from += batchSize;
        } else {
          hasMore = false;
        }
      }

      const filtered = allCourses.filter(course => {
        if (!course['University / College']) return false;
        return true;
      });

      const scoredCourses = filtered.map(course => ({
        ...course,
        matchScore: calculateMatchScore(course)
      }));

      const relevantCourses = scoredCourses.filter(c => (c.matchScore || 0) > 10);

      const topRecommendations = relevantCourses
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 10);

      if (topRecommendations.length < 10) {
        const remaining = scoredCourses
          .filter(c => !topRecommendations.find(t => t.id === c.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10 - topRecommendations.length);
        
        topRecommendations.push(...remaining);
      }

      setFilteredCourses(topRecommendations);
      setCurrentPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommended courses');
      console.error('Error fetching recommended courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      let allCourses: Course[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true })
          .range(from, from + batchSize - 1);

        if (supabaseError) throw supabaseError;

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data];
          hasMore = data.length === batchSize;
          from += batchSize;
        } else {
          hasMore = false;
        }
      }

      const validCourses = allCourses.filter(course => course['University / College'] !== null);
      setCourses(validCourses);
      setFilteredCourses(validCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.Programs?.toLowerCase().includes(query) ||
        course['University / College']?.toLowerCase().includes(query)
      );
    }

    if (selectedState) {
      filtered = filtered.filter(course => course.state === selectedState);
    }

    if (selectedUniversity) {
      filtered = filtered.filter(course => course['University / College'] === selectedUniversity);
    }

    if (selectedDeadline) {
      filtered = filtered.filter(course => 
        course['Application deadline']?.includes(selectedDeadline)
      );
    }

    if (selectedEntrance) {
      filtered = filtered.filter(course => 
        course['Entrance exams']?.toLowerCase().includes(selectedEntrance.toLowerCase())
      );
    }

    if (scholarshipOnly) {
      filtered = filtered.filter(course => 
        course['Scholarships available']?.toLowerCase().includes('yes') ||
        course['Scholarships available']?.toLowerCase().includes('available') ||
        course['Scholarships available']?.toLowerCase().includes('scholarship')
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(0);
  };

  const handleFilterChange = (filterSetter: React.Dispatch<React.SetStateAction<string>>, value: string, dependentFilters?: (() => void)[]) => {
    filterSetter(value);
    dependentFilters?.forEach(reset => reset());
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedUniversity('');
    setSelectedDeadline('');
    setSelectedEntrance('');
    setScholarshipOnly(false);
    setCurrentPage(0);
  };

  const clearFilter = (filterName: string) => {
    switch(filterName) {
      case 'state': setSelectedState(''); break;
      case 'university': setSelectedUniversity(''); break;
      case 'deadline': setSelectedDeadline(''); break;
      case 'entrance': setSelectedEntrance(''); break;
      case 'scholarship': setScholarshipOnly(false); break;
      case 'search': setSearchQuery(''); break;
    }
  };

  const getMatchBadge = (course: Course) => {
    if (viewMode !== 'recommended' || !course.matchScore) return null;
    
    const score = course.matchScore;
    
    if (score >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          Perfect Match ({score}%)
        </span>
      );
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          Excellent Match ({score}%)
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          Great Match ({score}%)
        </span>
      );
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
          Good Match ({score}%)
        </span>
      );
    }
    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
        Relevant ({score}%)
      </span>
    );
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(filteredCourses.length / perPage);
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  const getFilteredUniversities = () => {
    let filtered = courses;
    if (selectedState) filtered = filtered.filter(c => c.state === selectedState);
    return Array.from(new Set(filtered.map(c => c['University / College']).filter((u): u is string => Boolean(u))));
  };

  const getFilteredEntrances = () => {
    const entranceSet = new Set<string>();
    courses.forEach(course => {
      if (course['Entrance exams']) {
        course['Entrance exams'].split(/[,/;]+/).forEach(exam => {
          const trimmed = exam.trim();
          if (trimmed) entranceSet.add(trimmed);
        });
      }
    });
    return Array.from(entranceSet);
  };

  const uniqueUniversities = getFilteredUniversities();
  const uniqueEntrances = getFilteredEntrances();
  
  const totalPages = Math.ceil(filteredCourses.length / perPage);
  const activeFiltersCount = [searchQuery, selectedState, selectedUniversity, selectedDeadline, selectedEntrance, scholarshipOnly ? 'scholarship' : ''].filter(Boolean).length;
  const paginatedCourses = filteredCourses.slice(currentPage * perPage, (currentPage + 1) * perPage);

  const hasProfileData = userProfile && userProfile.degree && userProfile.program;
  const canShowRecommendations = hasProfileData && !loadingProfile;

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#005de6] mb-2">Find Your Perfect Course</h1>
            <p className="text-gray-600">Explore programs and institutes across India</p>
          </div>

          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setViewMode('all');
                resetFilters();
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-[#005de6] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <GraduationCap size={20} />
              All Courses
            </button>
            <button
              onClick={() => {
                if (canShowRecommendations) {
                  setViewMode('recommended');
                  resetFilters();
                }
              }}
              disabled={!canShowRecommendations}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'recommended'
                  ? 'bg-[#005de6] text-white shadow-lg'
                  : canShowRecommendations
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
              title={!hasProfileData ? 'Complete your profile to see recommendations' : ''}
            >
              <Sparkles size={20} />
              Recommended For You
              {!loadingProfile && !hasProfileData && <span className="text-xs ml-1">(Complete profile)</span>}
            </button>
          </div>

          {viewMode === 'recommended' && userProfile && hasProfileData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Showing your top 10 personalized recommendations</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Based on: <strong>{userProfile.degree}</strong> degree
                    {userProfile.program && <> | Program: <strong>{userProfile.program}</strong></>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'all' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for programs or institutes..."
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#005de6] text-white rounded-lg font-medium hover:bg-#003d99 transition"
                  >
                    <Filter size={20} />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-white text-[#005de6] px-2 py-0.5 rounded-full text-sm font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchQuery && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">Search: {searchQuery}</span>
                        <button onClick={() => clearFilter('search')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedState && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedState}</span>
                        <button onClick={() => clearFilter('state')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedUniversity && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedUniversity}</span>
                        <button onClick={() => clearFilter('university')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedDeadline && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedDeadline}</span>
                        <button onClick={() => clearFilter('deadline')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedEntrance && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedEntrance}</span>
                        <button onClick={() => clearFilter('entrance')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {scholarshipOnly && (
                      <div className="bg-red-100 text-#003d99 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">Scholarship Available</span>
                        <button onClick={() => clearFilter('scholarship')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <button onClick={resetFilters} className="text-sm text-[#005de6] hover:text-#003d99 font-medium px-2">
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {showFilters && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Filter size={20} className="text-[#005de6]" />
                    Refine Your Search
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="text-[#005de6]" />
                        State
                      </label>
                      <div className="relative">
                        <select 
                          className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedState}
                          onChange={(e) => handleFilterChange(setSelectedState, e.target.value, [() => setSelectedUniversity('')])}
                        >
                          <option value="">All States</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                      </div>
                    </div>

                    <div className={selectedState ? 'animate-fadeIn' : ''}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <GraduationCap size={16} className="text-[#005de6]" />
                        University / College
                      </label>
                      <div className="relative">
                        <select 
                          className={`appearance-none w-full bg-gray-50 border ${selectedState ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500`}
                          value={selectedUniversity}
                          onChange={(e) => handleFilterChange(setSelectedUniversity, e.target.value)}
                        >
                          <option value="">All Institutes</option>
                          {uniqueUniversities.map((uni) => (
                            <option key={uni} value={uni}>{uni}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="text-[#005de6]" />
                        Entrance Exam
                      </label>
                      <div className="relative">
                        <select 
                          className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedEntrance}
                          onChange={(e) => setSelectedEntrance(e.target.value)}
                        >
                          <option value="">All Entrance Exams</option>
                          {uniqueEntrances.slice(0, 20).map((exam) => (
                            <option key={exam} value={exam}>{exam}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="text-[#005de6]" />
                        Application Deadline
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g., 2025, Jan, Feb"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedDeadline}
                          onChange={(e) => setSelectedDeadline(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scholarshipOnly}
                        onChange={(e) => setScholarshipOnly(e.target.checked)}
                        className="w-5 h-5 text-[#005de6] rounded focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Show only programs with scholarship opportunities
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-[#005de6] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Notice</h3>
                <p className="text-[#005de6] text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#005de6]" size={24} />
              <span className="font-semibold text-lg">
                {filteredCourses.length.toLocaleString()} {viewMode === 'recommended' ? 'recommended ' : ''}courses found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[#005de6]" size={18} />
              <span className="text-sm text-gray-600">{savedCourses.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005de6]"></div>
                <p>Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {viewMode === 'recommended' ? 'No recommended courses found' : 'No courses found'}
              </h3>
              <p className="text-gray-500">
                {viewMode === 'recommended' 
                  ? 'Try updating your profile or check back later for more options'
                  : 'Try adjusting your filters or search query'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedCourses.map((course, index) => {
                  const isBlurred = viewMode === 'recommended' && index >= 2;
                  const courseIndex = currentPage * perPage + index;
                  
                  return (
                    <div 
                      key={course.id} 
                      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative ${
                        isBlurred ? 'overflow-hidden' : ''
                      }`}
                    >
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 rounded-xl">
                          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm border-2 border-blue-100">
                            <div className="mb-4 flex justify-center">
                              <div className="bg-blue-100 rounded-full p-4">
                                <AlertCircle className="text-[#005de6]" size={32} />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              Unlock More Recommendations
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Talk to our experts to view detailed information about this and {10 - courseIndex - 1} more personalized course recommendations
                            </p>
                            <button className="bg-[#005de6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-#003d99 transition-colors w-full flex items-center justify-center gap-2">
                              <Sparkles size={18} />
                              Contact Our Experts
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">
                            {course.Programs || 'Program Information Not Available'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <GraduationCap size={14} />
                            <span>{course['University / College']}</span>
                          </div>
                          {course.state && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <MapPin size={12} />
                              <span>{course.state}</span>
                            </div>
                          )}
                          {viewMode === 'recommended' && (
                            <div className="mt-2">
                              {getMatchBadge(course)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleSaved(course)}
                          disabled={isBlurred}
                          className={`transition-colors ${
                            isBlurred ? 'opacity-50 cursor-not-allowed' :
                            savedCourses.has(course.id) ? 'text-[#005de6]' : 'text-gray-400 hover:text-[#005de6]'
                          }`}
                          title={isBlurred ? 'Contact experts to unlock' : savedCourses.has(course.id) ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          <Heart size={20} fill={savedCourses.has(course.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={14} />
                              <span>Application Deadline</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {course['Application deadline'] || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign size={14} />
                              <span>Tuition Fee</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {course['Tution Fee'] || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign size={14} />
                              <span>Application Fee</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {course['Application fee'] || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Award size={14} />
                              <span>Entrance Exams</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm truncate" title={course['Entrance exams'] || 'N/A'}>
                              {course['Entrance exams'] || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {course['Eligibility summary'] && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <BookOpen size={14} className="text-[#005de6]" />
                              Eligibility Summary
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-sm text-gray-700">
                                {course['Eligibility summary']}
                              </p>
                            </div>
                          </div>
                        )}

                        {course['Scholarships available'] && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Award size={14} className="text-[#005de6]" />
                              Scholarships
                            </h4>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-sm text-green-700">
                                {course['Scholarships available']}
                              </p>
                            </div>
                          </div>
                        )}

                        {course['Remarks / application mode'] && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">
                              Application Mode
                            </h4>
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-sm text-blue-700">
                                {course['Remarks / application mode']}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                          {course['Official website'] && (
                            <a
                              href={course['Official website'].startsWith('http') 
                                ? course['Official website'] 
                                : `https://${course['Official website']}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#005de6] text-white rounded-lg py-2 px-4 hover:bg-#003d99 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <Globe size={16} />
                              Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{currentPage * perPage + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min((currentPage + 1) * perPage, filteredCourses.length)}</span> of{' '}
                      <span className="font-semibold">{filteredCourses.length.toLocaleString()}</span> courses
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 0}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                          currentPage === 0
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <React.Fragment key={index}>
                            {page === '...' ? (
                              <span className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentPage(page as number);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                                  currentPage === page
                                    ? 'bg-[#005de6] text-white border-[#005de6]'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {(page as number) + 1}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                          currentPage === totalPages - 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DefaultLayout>
  );
};

export default CourseFinder;
"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, Calendar, Users, GraduationCap, Trophy, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Course {
  id: number;
  university: string;
  location: string;
  program: string;
  program_type: string;
  specialization: string;
  degree_level: string;
  qs_rank: number;
  tuition: string;
  deadline: string;
  verified: boolean;
  logo: string;
  country_code: string;
  entrance_exam: string;
}

const CourseFinder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState('');
  const [selectedProgramType, setSelectedProgramType] = useState('');
  const [sortBy, setSortBy] = useState('qs_rank');
  const [universities, setUniversities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 15;

  useEffect(() => {
    fetchCourses();
  }, [showVerifiedOnly, searchQuery, selectedCountry, selectedUniversity, selectedDegreeLevel, selectedProgramType, sortBy, currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [showVerifiedOnly, searchQuery, selectedCountry, selectedUniversity, selectedDegreeLevel, selectedProgramType, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Build base query for counting
      let countQuery = supabase.from('courses').select('*', { count: 'exact', head: true });

      if (showVerifiedOnly) {
        countQuery = countQuery.eq('verified', true);
      }

      if (searchQuery) {
        countQuery = countQuery.or(`university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%`);
      }

      if (selectedCountry) {
        countQuery = countQuery.eq('country_code', selectedCountry);
      }

      if (selectedUniversity) {
        countQuery = countQuery.eq('university', selectedUniversity);
      }

      if (selectedDegreeLevel) {
        countQuery = countQuery.eq('degree_level', selectedDegreeLevel);
      }

      if (selectedProgramType) {
        countQuery = countQuery.eq('program_type', selectedProgramType);
      }

      const { count } = await countQuery;
      setTotalCourses(count || 0);

      // Build query for fetching paginated data
      let query = supabase.from('courses').select('*');

      if (showVerifiedOnly) {
        query = query.eq('verified', true);
      }

      if (searchQuery) {
        query = query.or(`university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%`);
      }

      if (selectedCountry) {
        query = query.eq('country_code', selectedCountry);
      }

      if (selectedUniversity) {
        query = query.eq('university', selectedUniversity);
      }

      if (selectedDegreeLevel) {
        query = query.eq('degree_level', selectedDegreeLevel);
      }

      if (selectedProgramType) {
        query = query.eq('program_type', selectedProgramType);
      }

      const orderColumn = sortBy === 'tuition' ? 'tuition' : sortBy === 'deadline' ? 'deadline' : 'qs_rank';
      const from = (currentPage - 1) * coursesPerPage;
      const to = from + coursesPerPage - 1;
      
      const { data, error } = await query
        .order(orderColumn, { ascending: true })
        .range(from, to);

      if (error) throw error;
      setCourses(data || []);

      // Fetch all universities for the filter dropdown (only once)
      if (universities.length === 0) {
        const { data: allUniversities } = await supabase
          .from('courses')
          .select('university');
        
        if (allUniversities) {
          const uniqueUniversities = [...new Set(allUniversities.map((course: any) => course.university))];
          setUniversities(uniqueUniversities.sort());
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error); 
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedUniversity('');
    setSelectedDegreeLevel('');
    setSelectedProgramType('');
    setShowVerifiedOnly(false);
    setSortBy('qs_rank');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCourses / coursesPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const activeFiltersCount = [selectedCountry, selectedUniversity, selectedDegreeLevel, selectedProgramType, showVerifiedOnly].filter(Boolean).length;

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Find Your Perfect Course</h1>
          <p className="text-gray-600">Explore a world of opportunities with our comprehensive course database covering top universities worldwide.</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter size={20} className="text-red-600" />
              Filters {activeFiltersCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>}
            </h2>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                <X size={16} /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="qs_rank">Sort by QS Rank</option>
                <option value="tuition">Sort by Tuition Fee</option>
                <option value="deadline">Sort by Deadline</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="FR">🇫🇷 France</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="JP">🇯🇵 Japan</option>
                <option value="IN">🇮🇳 India</option>
                <option value="NL">🇳🇱 Netherlands</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedDegreeLevel}
                onChange={(e) => {
                  setSelectedDegreeLevel(e.target.value);
                  setSelectedProgramType('');
                }}
              >
                <option value="">All Degree Levels</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedProgramType}
                onChange={(e) => setSelectedProgramType(e.target.value)}
              >
                <option value="">All Programs</option>
                {selectedDegreeLevel === 'UG' && (
                  <>
                    <option value="B.Tech">B.Tech</option>
                    <option value="BBA">BBA</option>
                    <option value="BSc">BSc</option>
                    <option value="BCA">BCA</option>
                  </>
                )}
                {selectedDegreeLevel === 'PG' && (
                  <>
                    <option value="MBA">MBA</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="MSc">MSc</option>
                  </>
                )}
                {!selectedDegreeLevel && (
                  <>
                    <optgroup label="Undergraduate">
                      <option value="B.Tech">B.Tech</option>
                      <option value="BBA">BBA</option>
                      <option value="BSc">BSc</option>
                      <option value="BCA">BCA</option>
                    </optgroup>
                    <optgroup label="Postgraduate">
                      <option value="MBA">MBA</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MCA">MCA</option>
                      <option value="MSc">MSc</option>
                    </optgroup>
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="">All Universities</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search for courses, universities, or specializations..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-red-600" size={24} />
            <span className="font-semibold text-lg">{totalCourses} courses found</span>
            {totalCourses > 0 && (
              <span className="text-gray-500 text-sm">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show Verified only</span>
            <button
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showVerifiedOnly ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Course Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p>Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{course.logo}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{course.university}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{course.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.verified && (
                        <div className="bg-green-500 text-white rounded-full p-1" title="Verified">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="text-red-600" size={16} />
                        <span className="text-sm text-gray-600">Program</span>
                      </div>
                      <p className="font-semibold text-gray-800">{course.program}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{course.program_type}</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{course.specialization}</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{course.entrance_exam}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Trophy size={14} />
                          <span>QS Rank</span>
                        </div>
                        <p className="font-semibold text-gray-800">#{course.qs_rank}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <DollarSign size={14} />
                          <span>Tuition Fees</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{course.tuition}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Calendar size={14} />
                          <span>Deadline</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{formatDeadline(course.deadline)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="text-sm text-gray-600">Add to Compare</span>
                      </label>
                      <button className="flex-1 bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <Users size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{((currentPage - 1) * coursesPerPage) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(currentPage * coursesPerPage, totalCourses)}</span> of{' '}
                    <span className="font-semibold">{totalCourses}</span> courses
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                        currentPage === 1
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
                              onClick={() => handlePageChange(page as number)}
                              className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                                currentPage === page
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                        currentPage === totalPages
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
  );
};

export default CourseFinder;
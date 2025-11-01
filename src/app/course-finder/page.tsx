"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, Users, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Trophy, Award } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

interface College {
  id: number;
  institute: string;
  city: string;
  state: string;
  program_offered: string;
  specialisations: string;
  minimum_fees_inr: string;
  ranking_nirf_mba_2024: string | null;
  placement_record: string;
  entrance_exams_accepted: string;
  scholarships: string;
}

const CourseFinder: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [minFees, setMinFees] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [savedColleges, setSavedColleges] = useState<Set<number>>(new Set());
  const perPage = 15;

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableExams, setAvailableExams] = useState<string[]>([]);

  useEffect(() => {
    loadColleges();
    loadSavedColleges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [colleges, searchQuery, selectedState, selectedExam, minFees, maxFees]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all courses from Supabase
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
      
      if (fetchError) {
        throw fetchError;
      }
      
      setColleges(data || []);
      
      // Extract unique states and exams from the data
      if (data && data.length > 0) {
        const states = [...new Set(data.map((c: College) => c.state).filter(Boolean))].sort();
        const exams = [...new Set(
          data.flatMap((c: College) => 
            c.entrance_exams_accepted ? c.entrance_exams_accepted.split(',').map(e => e.trim()) : []
          )
        )].sort();
        
        setAvailableStates(states);
        setAvailableExams(exams);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load colleges');
      console.error('Error loading colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedColleges = () => {
    try {
      const saved = localStorage.getItem('shortlisted-indian-colleges');
      if (saved) {
        const data = JSON.parse(saved);
        setSavedColleges(new Set(data.ids || []));
      }
    } catch (error) {
      console.log('No saved colleges found:', error);
    }
  };

  const saveToStorage = (ids: number[], colleges: College[]) => {
    try {
      localStorage.setItem('shortlisted-indian-colleges', JSON.stringify({ ids, colleges }));
      window.dispatchEvent(new Event('shortlist-updated'));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...colleges];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(college => 
        college.institute?.toLowerCase().includes(query) ||
        college.city?.toLowerCase().includes(query) ||
        college.specialisations?.toLowerCase().includes(query)
      );
    }

    if (selectedState) {
      filtered = filtered.filter(college => college.state === selectedState);
    }

    if (selectedExam) {
      filtered = filtered.filter(college => 
        college.entrance_exams_accepted && college.entrance_exams_accepted.includes(selectedExam)
      );
    }

    if (minFees || maxFees) {
      filtered = filtered.filter(college => {
        const fees = parseInt(college.minimum_fees_inr);
        const min = minFees ? parseInt(minFees) : 0;
        const max = maxFees ? parseInt(maxFees) : Infinity;
        return fees >= min && fees <= max;
      });
    }

    setFilteredColleges(filtered);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    applyFilters();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedExam('');
    setMinFees('');
    setMaxFees('');
    setCurrentPage(0);
  };

  const toggleSaved = (college: College) => {
    try {
      let currentShortlist: College[] = [];
      let currentIds: number[] = [];
      
      const saved = localStorage.getItem('shortlisted-indian-colleges');
      if (saved) {
        const data = JSON.parse(saved);
        currentShortlist = data.colleges || [];
        currentIds = data.ids || [];
      }

      const newSaved = new Set(savedColleges);
      let newShortlist = [...currentShortlist];
      let newIds = [...currentIds];

      if (newSaved.has(college.id)) {
        newSaved.delete(college.id);
        newShortlist = newShortlist.filter(c => c.id !== college.id);
        newIds = newIds.filter(id => id !== college.id);
      } else {
        newSaved.add(college.id);
        newShortlist.push(college);
        newIds.push(college.id);
      }

      setSavedColleges(newSaved);
      saveToStorage(newIds, newShortlist);
    } catch (error) {
      console.error('Error toggling saved college:', error);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const totalResults = filteredColleges.length;
  const totalPages = Math.ceil(totalResults / perPage);
  const paginatedColleges = filteredColleges.slice(currentPage * perPage, (currentPage + 1) * perPage);
  const activeFiltersCount = [searchQuery, selectedState, selectedExam, minFees, maxFees].filter(Boolean).length;

  const getPageNumbers = () => {
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

  return (
    <DefaultLayout>
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Find Your Perfect MBA College</h1>
          <p className="text-gray-600">Explore top MBA colleges and management institutes across India</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter size={20} className="text-red-600" />
              Filters {activeFiltersCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
              )}
            </h2>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                <X size={16} /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">All States</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                <option value="">All Entrance Exams</option>
                {availableExams.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div>
              <input
                type="number"
                placeholder="Min Fees (₹)"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={minFees}
                onChange={(e) => setMinFees(e.target.value)}
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Max Fees (₹)"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={maxFees}
                onChange={(e) => setMaxFees(e.target.value)}
              />
            </div>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by institute name, city, or specialisation..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition-colors font-medium"
          >
            Search Colleges
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-red-600" size={24} />
            <span className="font-semibold text-lg">
              {totalResults} colleges found
            </span>
            {totalResults > 0 && totalPages > 1 && (
              <span className="text-gray-500 text-sm">
                (Page {currentPage + 1} of {totalPages})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="text-red-600" size={18} />
            <span className="text-sm text-gray-600">{savedColleges.size} saved</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p>Loading colleges...</p>
            </div>
          </div>
        ) : paginatedColleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No colleges found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedColleges.map((college) => (
                <div key={college.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {college.institute}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{college.city}, {college.state}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {college.program_offered}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaved(college)}
                      className={`transition-colors ${
                        savedColleges.has(college.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                      }`}
                      title={savedColleges.has(college.id) ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      <Heart size={20} fill={savedColleges.has(college.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <DollarSign size={14} />
                          <span>Minimum Fees</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(college.minimum_fees_inr)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Trophy size={14} />
                          <span>NIRF Ranking</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {college.ranking_nirf_mba_2024 || 'N/A'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Users size={14} />
                          <span>Placement Record</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {college.placement_record}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                        <Award size={14} className="text-red-600" />
                        Entrance Exams
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {college.entrance_exams_accepted && college.entrance_exams_accepted.split(',').map((exam, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                            {exam.trim()}
                          </span>
                        ))}
                        {!college.entrance_exams_accepted && (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <GraduationCap size={14} className="text-red-600" />
                        Specialisations
                      </h4>
                      <p className="text-sm text-gray-600">{college.specialisations}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <BookOpen size={14} className="text-red-600" />
                        Scholarships
                      </h4>
                      <p className="text-sm text-gray-600">{college.scholarships}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{currentPage * perPage + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min((currentPage + 1) * perPage, totalResults)}</span> of{' '}
                    <span className="font-semibold">{totalResults}</span> colleges
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
                                  ? 'bg-red-600 text-white border-red-600'
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
    </DefaultLayout>
  );
};

export default CourseFinder;
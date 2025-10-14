"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, Users, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Trophy } from 'lucide-react';

const API_KEY = 'SRI6Nb7vQxcpNFVnE5D02zzze7vIdfZUqmRPe93y';
const API_BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

interface College {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'latest.cost.tuition.in_state': number | null;
  'latest.cost.tuition.out_of_state': number | null;
  'latest.admissions.admission_rate.overall': number | null;
  'school.school_url': string | null;
  'school.locale': number | null;
  'latest.student.size': number | null;
}

const CourseFinder: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('');
  const [minTuition, setMinTuition] = useState('');
  const [maxTuition, setMaxTuition] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [savedColleges, setSavedColleges] = useState<Set<number>>(new Set());
  const perPage = 15;

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const LOCALE_TYPES = {
    '': 'All Locations',
    '11': 'City - Large',
    '12': 'City - Midsize',
    '13': 'City - Small',
    '21': 'Suburb - Large',
    '22': 'Suburb - Midsize',
    '23': 'Suburb - Small',
    '31': 'Town - Fringe',
    '32': 'Town - Distant',
    '33': 'Town - Remote',
    '41': 'Rural - Fringe',
    '42': 'Rural - Distant',
    '43': 'Rural - Remote'
  };

  useEffect(() => {
    fetchColleges();
  }, [currentPage]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        api_key: API_KEY,
        per_page: perPage.toString(),
        page: currentPage.toString(),
        fields: 'id,school.name,school.city,school.state,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.admissions.admission_rate.overall,school.school_url,school.locale,latest.student.size'
      });

      // Add filters
      if (searchQuery) {
        params.append('school.name', searchQuery);
      }
      if (selectedState) {
        params.append('school.state', selectedState);
      }
      if (selectedLocale) {
        params.append('school.locale', selectedLocale);
      }
      if (minTuition) {
        params.append('latest.cost.tuition.in_state__range', `${minTuition}..`);
      }
      if (maxTuition) {
        params.append('latest.cost.tuition.in_state__range', `..${maxTuition}`);
      }
      if (minTuition && maxTuition) {
        params.set('latest.cost.tuition.in_state__range', `${minTuition}..${maxTuition}`);
      }

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setColleges(data.results || []);
      setTotalResults(data.metadata?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colleges');
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchColleges();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedLocale('');
    setMinTuition('');
    setMaxTuition('');
    setCurrentPage(0);
  };

  const toggleSaved = (id: number) => {
    const newSaved = new Set(savedColleges);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedColleges(newSaved);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (rate: number | null) => {
    if (rate === null || rate === undefined) return 'N/A';
    return `${(rate * 100).toFixed(1)}%`;
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getLocaleLabel = (locale: number | null) => {
    if (locale === null) return 'Unknown';
    const localeStr = locale.toString();
    return LOCALE_TYPES[localeStr as keyof typeof LOCALE_TYPES] || 'Unknown';
  };

  const totalPages = Math.ceil(totalResults / perPage);
  const activeFiltersCount = [searchQuery, selectedState, selectedLocale, minTuition, maxTuition].filter(Boolean).length;

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
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Find Your Perfect College</h1>
          <p className="text-gray-600">Explore colleges and universities across the United States with real-time data from the U.S. Department of Education</p>
        </div>

        {/* Filters Section */}
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

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">All States</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div className="relative">
              <select 
                className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
              >
                {Object.entries(LOCALE_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
            </div>

            <div>
              <input
                type="number"
                placeholder="Min Tuition ($)"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={minTuition}
                onChange={(e) => setMinTuition(e.target.value)}
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Max Tuition ($)"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for colleges by name..."
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-red-600" size={24} />
            <span className="font-semibold text-lg">
              {totalResults.toLocaleString()} colleges found
            </span>
            {totalResults > 0 && (
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

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p>Loading colleges...</p>
            </div>
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No colleges found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            {/* College Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {colleges.map((college) => (
                <div key={college.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {college['school.name'] || 'Unknown College'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{college['school.city']}, {college['school.state']}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getLocaleLabel(college['school.locale'])}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaved(college.id)}
                      className={`transition-colors ${
                        savedColleges.has(college.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <Heart size={20} fill={savedColleges.has(college.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <DollarSign size={14} />
                          <span>In-State Tuition</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(college['latest.cost.tuition.in_state'])}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <DollarSign size={14} />
                          <span>Out-of-State</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(college['latest.cost.tuition.out_of_state'])}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Trophy size={14} />
                          <span>Admission Rate</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatPercent(college['latest.admissions.admission_rate.overall'])}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Users size={14} />
                          <span>Students</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatNumber(college['latest.student.size'])}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        <span className="text-sm text-gray-600">Add to Compare</span>
                      </label>
                      {college['school.school_url'] && (
                        <a
                          href={college['school.school_url'].startsWith('http') 
                            ? college['school.school_url'] 
                            : `https://${college['school.school_url']}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <BookOpen size={16} />
                          View Details
                        </a>
                      )}
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
                    Showing <span className="font-semibold">{currentPage * perPage + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min((currentPage + 1) * perPage, totalResults)}</span> of{' '}
                    <span className="font-semibold">{totalResults.toLocaleString()}</span> colleges
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
  );
};

export default CourseFinder;
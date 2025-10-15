"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, Users, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Trophy, Award, TrendingUp } from 'lucide-react';

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
  'latest.admissions.sat_scores.average.overall': number | null;
  'latest.admissions.sat_scores.midpoint.math': number | null;
  'latest.admissions.sat_scores.midpoint.critical_reading': number | null;
  'latest.admissions.act_scores.midpoint.cumulative': number | null;
  'latest.admissions.act_scores.midpoint.math': number | null;
  'latest.admissions.act_scores.midpoint.english': number | null;
  'latest.academics.program_available.bachelors': number | null;
  'latest.academics.program_available.masters': number | null;
  'latest.academics.program_percentage.business_marketing': number | null;
  'latest.academics.program_percentage.computer': number | null;
  'latest.academics.program_percentage.health': number | null;
  'latest.academics.program_percentage.education': number | null;
  'latest.academics.program_percentage.engineering': number | null;
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

  // US States
  const US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };

  // Locale types
  const LOCALE_TYPES = {
    '': 'All Locations', '11': 'City - Large', '12': 'City - Midsize', '13': 'City - Small',
    '21': 'Suburb - Large', '22': 'Suburb - Midsize', '23': 'Suburb - Small',
    '31': 'Town - Fringe', '32': 'Town - Distant', '33': 'Town - Remote',
    '41': 'Rural - Fringe', '42': 'Rural - Distant', '43': 'Rural - Remote'
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
        fields: 'id,school.name,school.city,school.state,school.school_url,school.locale,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.admissions.sat_scores.midpoint.math,latest.admissions.sat_scores.midpoint.critical_reading,latest.admissions.act_scores.midpoint.cumulative,latest.admissions.act_scores.midpoint.math,latest.admissions.act_scores.midpoint.english,latest.student.size,latest.academics.program_available.bachelors,latest.academics.program_available.masters,latest.academics.program_percentage.business_marketing,latest.academics.program_percentage.computer,latest.academics.program_percentage.health,latest.academics.program_percentage.education,latest.academics.program_percentage.engineering'
      });

      // Add filters
      if (searchQuery) params.append('school.name', searchQuery);
      if (selectedState) params.append('school.state', selectedState);
      if (selectedLocale) params.append('school.locale', selectedLocale);
      if (minTuition && maxTuition) {
        params.set('latest.cost.tuition.in_state__range', `${minTuition}..${maxTuition}`);
      } else if (minTuition) {
        params.append('latest.cost.tuition.in_state__range', `${minTuition}..`);
      } else if (maxTuition) {
        params.append('latest.cost.tuition.in_state__range', `..${maxTuition}`);
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

  const getStateName = (stateCode: string) => {
    return US_STATES[stateCode as keyof typeof US_STATES] || stateCode;
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
          <p className="text-gray-600">Explore colleges and universities across the United States with comprehensive data from the U.S. Department of Education</p>
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
                {Object.entries(US_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
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
                        <span>{college['school.city']}, {getStateName(college['school.state'])}</span>
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
                    {/* Basic Info Grid */}
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

                    {/* Test Scores Section */}
                    {(college['latest.admissions.sat_scores.average.overall'] || 
                      college['latest.admissions.act_scores.midpoint.cumulative']) && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                          <Award size={14} className="text-red-600" />
                          Test Scores
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {college['latest.admissions.sat_scores.average.overall'] && (
                            <div className="bg-blue-50 rounded-lg p-2">
                              <div className="text-xs text-blue-600 mb-1">SAT Average</div>
                              <p className="font-bold text-lg text-blue-700">
                                {Math.round(college['latest.admissions.sat_scores.average.overall'])}
                              </p>
                            </div>
                          )}
                          {college['latest.admissions.act_scores.midpoint.cumulative'] && (
                            <div className="bg-green-50 rounded-lg p-2">
                              <div className="text-xs text-green-600 mb-1">ACT Midpoint</div>
                              <p className="font-bold text-lg text-green-700">
                                {Math.round(college['latest.admissions.act_scores.midpoint.cumulative'])}
                              </p>
                            </div>
                          )}
                          {college['latest.admissions.sat_scores.midpoint.math'] && (
                            <div className="bg-purple-50 rounded-lg p-2">
                              <div className="text-xs text-purple-600 mb-1">SAT Math</div>
                              <p className="font-bold text-sm text-purple-700">
                                {Math.round(college['latest.admissions.sat_scores.midpoint.math'])}
                              </p>
                            </div>
                          )}
                          {college['latest.admissions.sat_scores.midpoint.critical_reading'] && (
                            <div className="bg-orange-50 rounded-lg p-2">
                              <div className="text-xs text-orange-600 mb-1">SAT Reading</div>
                              <p className="font-bold text-sm text-orange-700">
                                {Math.round(college['latest.admissions.sat_scores.midpoint.critical_reading'])}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Programs Section */}
                    {(college['latest.academics.program_available.bachelors'] === 1 || 
                      college['latest.academics.program_available.masters'] === 1) && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <GraduationCap size={14} className="text-red-600" />
                          Programs Offered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {college['latest.academics.program_available.bachelors'] === 1 && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                              Bachelors
                            </span>
                          )}
                          {college['latest.academics.program_available.masters'] === 1 && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                              Masters
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Top Fields of Study */}
                    {((college['latest.academics.program_percentage.business_marketing'] ?? 0) > 0 || 
                      (college['latest.academics.program_percentage.engineering'] ?? 0) > 0 ||
                      (college['latest.academics.program_percentage.computer'] ?? 0) > 0 ||
                      (college['latest.academics.program_percentage.health'] ?? 0) > 0 ||
                      (college['latest.academics.program_percentage.education'] ?? 0) > 0) && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                          <TrendingUp size={14} className="text-red-600" />
                          Top Fields of Study
                        </h4>
                        <div className="space-y-2">
                          {(college['latest.academics.program_percentage.engineering'] ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Engineering</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${((college['latest.academics.program_percentage.engineering'] ?? 0) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-800 w-10 text-right">
                                  {((college['latest.academics.program_percentage.engineering'] ?? 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                          {(college['latest.academics.program_percentage.business_marketing'] ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Business</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${((college['latest.academics.program_percentage.business_marketing'] ?? 0) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-800 w-10 text-right">
                                  {((college['latest.academics.program_percentage.business_marketing'] ?? 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                          {(college['latest.academics.program_percentage.computer'] ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Computer Science</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${((college['latest.academics.program_percentage.computer'] ?? 0) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-800 w-10 text-right">
                                  {((college['latest.academics.program_percentage.computer'] ?? 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                          {(college['latest.academics.program_percentage.health'] ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Health</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${((college['latest.academics.program_percentage.health'] ?? 0) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-800 w-10 text-right">
                                  {((college['latest.academics.program_percentage.health'] ?? 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                          {(college['latest.academics.program_percentage.education'] ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Education</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${((college['latest.academics.program_percentage.education'] ?? 0) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-800 w-10 text-right">
                                  {((college['latest.academics.program_percentage.education'] ?? 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
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

// import React, { useState, useEffect } from 'react';
// import { Search, Filter, X, ChevronDown, ChevronUp, DollarSign, Users, Award, TrendingUp, Book, MapPin, Star, ExternalLink, GraduationCap, Home, User, BookOpen, Building2, Trophy, LogOut, ThumbsUp } from 'lucide-react';

// // Enhanced College Interface
// interface College {
//   id: number;
//   'school.name': string;
//   'school.city': string;
//   'school.state': string;
//   'school.school_url': string | null;
//   'school.ownership': number | null;
//   'latest.student.size': number | null;
//   'latest.cost.tuition.in_state': number | null;
//   'latest.cost.tuition.out_of_state': number | null;
//   'latest.cost.avg_net_price.overall': number | null;
//   'latest.cost.attendance.academic_year': number | null;
//   'latest.cost.roomboard.oncampus': number | null;
//   'latest.admissions.admission_rate.overall': number | null;
//   'latest.admissions.sat_scores.average.overall': number | null;
//   'latest.admissions.sat_scores.25th_percentile.math': number | null;
//   'latest.admissions.sat_scores.75th_percentile.math': number | null;
//   'latest.admissions.act_scores.midpoint.cumulative': number | null;
//   'latest.academics.program_percentage.business_marketing': number | null;
//   'latest.academics.program_percentage.computer': number | null;
//   'latest.academics.program_percentage.health': number | null;
//   'latest.academics.program_percentage.engineering': number | null;
//   'latest.completion.completion_rate_4yr_100nt': number | null;
//   'latest.student.retention_rate.four_year.full_time': number | null;
//   'latest.aid.pell_grant_rate': number | null;
//   'latest.aid.median_debt.completers.overall': number | null;
//   'latest.earnings.10_yrs_after_entry.median': number | null;
//   'latest.repayment.3_yr_repayment.overall': number | null;
//   'latest.student.demographics.female_share': number | null;
//   'latest.academics.program_available.bachelors': number | null;
//   'latest.academics.program_available.masters': number | null;
//   'latest.academics.program_available.doctorate': number | null;
// }

// // Sidebar Props Interface
// interface SidebarProps {
//   activeSection: string;
//   setActiveSection: (section: string) => void;
//   userName: string;
//   onSignOut: () => void;
// }

// // Sidebar Component
// const Sidebar = ({ activeSection, setActiveSection, userName, onSignOut }: SidebarProps) => {
//   const [isLogoutHovered, setIsLogoutHovered] = useState(false);

//   const navItems = {
//     main: [
//       { icon: Home, label: 'Home', action: 'home' },
//       { icon: User, label: 'Ask AI', action: 'ask-ai' },
//       { icon: User, label: 'Profile Analyzer', action: 'profile-analyzer' },
//     ],
//     explore: [
//       { icon: BookOpen, label: 'Course Finder', action: 'course-finder' },
//       { icon: Users, label: 'Admit Finder', action: 'admit-finder' },
//       { icon: DollarSign, label: 'Scholarship Finder', action: 'scholarship-finder' },
//       { icon: Building2, label: 'Shortlist Builder', action: 'shortlist-builder' },
//     ],
//     applications: [
//       { icon: GraduationCap, label: 'Manage Shortlist', action: 'manage-shortlist' },
//       { icon: BookOpen, label: 'Application Builder', action: 'app-builder' },
//       { icon: Award, label: 'Manage Applications', action: 'manage-apps' },
//       { icon: Trophy, label: 'Guidance', action: 'guidance' },
//     ],
//     postAdmit: [
//       { icon: GraduationCap, label: 'Finalise Admits', action: 'finalise-admits' },
//     ]
//   };

//   const handleNavClick = (action: string) => {
//     if (['course-finder', 'admit-finder', 'scholarship-finder', 'shortlist-builder'].includes(action)) {
//       setActiveSection(action);
//     }
//   };

//   return (
//     <div className="w-64 bg-gradient-to-b from-pink-50 to-red-50 h-screen p-4 border-r border-pink-200 flex flex-col shadow-lg overflow-y-auto">
//       <div className="mb-8">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
//             E
//           </div>
//           <div className="text-2xl font-bold text-red-600">EduAbroad</div>
//         </div>
//         <div className="h-1 w-16 bg-red-600 rounded-full"></div>
//       </div>
      
//       <div className="bg-white rounded-lg p-3 mb-6 shadow-sm border border-pink-100">
//         <div className="flex items-center gap-2">
//           <div className="text-sm text-gray-600">Welcome,</div>
//           <div className="text-red-600 font-semibold truncate">{userName}</div>
//         </div>
//         <div className="text-xs text-gray-400 mt-1">Explore your opportunities</div>
//       </div>
      
//       <nav className="space-y-2 flex-1">
//         {navItems.main.map((item) => (
//           <button
//             key={item.action}
//             onClick={() => handleNavClick(item.action)}
//             className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
//           >
//             <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
//             <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
//           </button>
//         ))}
        
//         <div className="pt-4">
//           <div className="flex items-center gap-2 mb-2 px-2">
//             <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Explore</div>
//             <div className="flex-1 h-px bg-red-200"></div>
//           </div>
//           {navItems.explore.map((item) => (
//             <button
//               key={item.action}
//               onClick={() => handleNavClick(item.action)}
//               className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
//                 activeSection === item.action 
//                   ? 'bg-white shadow-md border-l-4 border-red-600 text-red-600' 
//                   : 'hover:bg-white hover:shadow-sm'
//               }`}
//             >
//               <item.icon 
//                 size={18} 
//                 className={`transition-colors ${
//                   activeSection === item.action 
//                     ? 'text-red-600' 
//                     : 'text-gray-600 group-hover:text-red-600'
//                 }`} 
//               />
//               <span className={`text-sm transition-colors ${
//                 activeSection === item.action 
//                   ? 'font-semibold' 
//                   : 'group-hover:text-red-600'
//               }`}>
//                 {item.label}
//               </span>
//             </button>
//           ))}
//         </div>
        
//         <div className="pt-4">
//           <div className="flex items-center gap-2 mb-2 px-2">
//             <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Applications</div>
//             <div className="flex-1 h-px bg-red-200"></div>
//           </div>
//           {navItems.applications.map((item) => (
//             <button
//               key={item.action}
//               onClick={() => handleNavClick(item.action)}
//               className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
//             >
//               <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
//               <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
//             </button>
//           ))}
//         </div>
        
//         <div className="pt-4">
//           <div className="flex items-center gap-2 mb-2 px-2">
//             <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Post Admit</div>
//             <div className="flex-1 h-px bg-red-200"></div>
//           </div>
//           {navItems.postAdmit.map((item) => (
//             <button
//               key={item.action}
//               onClick={() => handleNavClick(item.action)}
//               className="flex items-center gap-3 p-2.5 w-full text-left hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
//             >
//               <item.icon size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" />
//               <span className="text-sm group-hover:text-red-600 transition-colors">{item.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       <div className="pt-4 mt-4 border-t border-pink-200">
//         <button 
//           onClick={onSignOut}
//           onMouseEnter={() => setIsLogoutHovered(true)}
//           onMouseLeave={() => setIsLogoutHovered(false)}
//           className="flex items-center justify-between gap-3 p-3 w-full text-left bg-white hover:bg-red-50 rounded-lg text-red-600 transition-all duration-200 shadow-sm hover:shadow-md group"
//         >
//           <div className="flex items-center gap-3">
//             <LogOut size={18} className="group-hover:scale-110 transition-transform" />
//             <span className="font-semibold">Logout</span>
//           </div>
//           <ThumbsUp 
//             size={16} 
//             className={`transition-all duration-300 ${
//               isLogoutHovered 
//                 ? 'opacity-100 translate-x-0' 
//                 : 'opacity-0 -translate-x-2'
//             }`} 
//           />
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main College Finder Component
// const CollegeFinder = () => {
//   const [colleges, setColleges] = useState<College[]>([]);
//   const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [expandedCard, setExpandedCard] = useState<number | null>(null);
//   const [activeSection, setActiveSection] = useState('course-finder');

//   // Filter States
//   const [filters, setFilters] = useState({
//     state: '',
//     ownership: '',
//     admissionRateMin: 0,
//     admissionRateMax: 100,
//     tuitionMax: 100000,
//     studentSizeMin: 0,
//     studentSizeMax: 50000,
//     satScoreMin: 0,
//     satScoreMax: 1600,
//     graduationRateMin: 0,
//     retentionRateMin: 0,
//     earningsMin: 0,
//     debtMax: 100000,
//     programs: [] as string[],
//     degreeTypes: [] as string[],
//   });

//   const API_KEY = 'SRI6Nb7vQxcpNFVnE5D02zzze7vIdfZUqmRPe93y';
//   const API_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

//   const apiFields = [
//     'id', 'school.name', 'school.city', 'school.state', 'school.school_url', 'school.ownership',
//     'latest.student.size', 'latest.cost.tuition.in_state', 'latest.cost.tuition.out_of_state',
//     'latest.cost.avg_net_price.overall', 'latest.cost.attendance.academic_year',
//     'latest.cost.roomboard.oncampus', 'latest.admissions.admission_rate.overall',
//     'latest.admissions.sat_scores.average.overall', 'latest.admissions.sat_scores.25th_percentile.math',
//     'latest.admissions.sat_scores.75th_percentile.math', 'latest.admissions.act_scores.midpoint.cumulative',
//     'latest.academics.program_percentage.business_marketing', 'latest.academics.program_percentage.computer',
//     'latest.academics.program_percentage.health', 'latest.academics.program_percentage.engineering',
//     'latest.completion.completion_rate_4yr_100nt', 'latest.student.retention_rate.four_year.full_time',
//     'latest.aid.pell_grant_rate', 'latest.aid.median_debt.completers.overall',
//     'latest.earnings.10_yrs_after_entry.median', 'latest.repayment.3_yr_repayment.overall',
//     'latest.student.demographics.female_share', 'latest.academics.program_available.bachelors',
//     'latest.academics.program_available.masters', 'latest.academics.program_available.doctorate'
//   ].join(',');

//   useEffect(() => {
//     fetchColleges();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [colleges, filters, searchTerm]);

//   const fetchColleges = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${API_BASE}?api_key=${API_KEY}&fields=${apiFields}&per_page=100&school.degrees_awarded.predominant=2,3`
//       );
//       const data = await response.json();
//       setColleges(data.results || []);
//       setFilteredColleges(data.results || []);
//     } catch (error) {
//       console.error('Error fetching colleges:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = colleges.filter(college => {
//       const matchesSearch = college['school.name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            college['school.city'].toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            college['school.state'].toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesState = !filters.state || college['school.state'] === filters.state;
//       const matchesOwnership = !filters.ownership || college['school.ownership']?.toString() === filters.ownership;
      
//       const admissionRate = (college['latest.admissions.admission_rate.overall'] || 0) * 100;
//       const matchesAdmission = admissionRate >= filters.admissionRateMin && admissionRate <= filters.admissionRateMax;
      
//       const tuition = college['latest.cost.tuition.out_of_state'] || 0;
//       const matchesTuition = tuition <= filters.tuitionMax;
      
//       const size = college['latest.student.size'] || 0;
//       const matchesSize = size >= filters.studentSizeMin && size <= filters.studentSizeMax;
      
//       const sat = college['latest.admissions.sat_scores.average.overall'] || 0;
//       const matchesSAT = sat >= filters.satScoreMin && sat <= filters.satScoreMax;
      
//       const gradRate = (college['latest.completion.completion_rate_4yr_100nt'] || 0) * 100;
//       const matchesGradRate = gradRate >= filters.graduationRateMin;
      
//       const retentionRate = (college['latest.student.retention_rate.four_year.full_time'] || 0) * 100;
//       const matchesRetention = retentionRate >= filters.retentionRateMin;
      
//       const earnings = college['latest.earnings.10_yrs_after_entry.median'] || 0;
//       const matchesEarnings = earnings >= filters.earningsMin;
      
//       const debt = college['latest.aid.median_debt.completers.overall'] || 0;
//       const matchesDebt = debt <= filters.debtMax;

//       const matchesDegrees = filters.degreeTypes.length === 0 || filters.degreeTypes.some(type => {
//         if (type === 'bachelors') return college['latest.academics.program_available.bachelors'] === 1;
//         if (type === 'masters') return college['latest.academics.program_available.masters'] === 1;
//         if (type === 'doctorate') return college['latest.academics.program_available.doctorate'] === 1;
//         return true;
//       });
      
//       return matchesSearch && matchesState && matchesOwnership && matchesAdmission && 
//              matchesTuition && matchesSize && matchesSAT && matchesGradRate && 
//              matchesRetention && matchesEarnings && matchesDebt && matchesDegrees;
//     });
    
//     setFilteredColleges(filtered);
//   };

//   const resetFilters = () => {
//     setFilters({
//       state: '',
//       ownership: '',
//       admissionRateMin: 0,
//       admissionRateMax: 100,
//       tuitionMax: 100000,
//       studentSizeMin: 0,
//       studentSizeMax: 50000,
//       satScoreMin: 0,
//       satScoreMax: 1600,
//       graduationRateMin: 0,
//       retentionRateMin: 0,
//       earningsMin: 0,
//       debtMax: 100000,
//       programs: [],
//       degreeTypes: [],
//     });
//     setSearchTerm('');
//   };

//   const formatCurrency = (value: number | null) => {
//     if (!value) return 'N/A';
//     return `$${value.toLocaleString()}`;
//   };

//   const formatPercentage = (value: number | null) => {
//     if (!value) return 'N/A';
//     return `${(value * 100).toFixed(1)}%`;
//   };

//   const getOwnershipLabel = (value: number | null) => {
//     if (!value) return 'N/A';
//     const labels: Record<number, string> = { 1: 'Public', 2: 'Private Nonprofit', 3: 'Private For-Profit' };
//     return labels[value] || 'N/A';
//   };

//   const handleSignOut = () => {
//     console.log('Signing out...');
//   };

//   if (activeSection !== 'course-finder') {
//     return (
//       <div className="flex h-screen bg-gray-50">
//         <Sidebar 
//           activeSection={activeSection} 
//           setActiveSection={setActiveSection}
//           userName="John Doe"
//           onSignOut={handleSignOut}
//         />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
//             <p className="text-gray-600">This section is under development</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar 
//         activeSection={activeSection} 
//         setActiveSection={setActiveSection}
//         userName="John Doe"
//         onSignOut={handleSignOut}
//       />
      
//       <div className="flex-1 overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">College Finder</h1>
//           <p className="text-gray-600">Discover your perfect college match from thousands of institutions</p>
//         </div>

//         {/* Search and Filter Bar */}
//         <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
//           <div className="flex gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by college name, city, or state..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               />
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//             >
//               <Filter size={20} />
//               Filters
//               {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//             </button>
//           </div>

//           {/* Filters Panel */}
//           {showFilters && (
//             <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {/* State Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                   <input
//                     type="text"
//                     placeholder="e.g., CA, NY, TX"
//                     value={filters.state}
//                     onChange={(e) => setFilters({...filters, state: e.target.value.toUpperCase()})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                   />
//                 </div>

//                 {/* Ownership Type */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
//                   <select
//                     value={filters.ownership}
//                     onChange={(e) => setFilters({...filters, ownership: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                   >
//                     <option value="">All Types</option>
//                     <option value="1">Public</option>
//                     <option value="2">Private Nonprofit</option>
//                     <option value="3">Private For-Profit</option>
//                   </select>
//                 </div>

//                 {/* Admission Rate */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Admission Rate: {filters.admissionRateMin}% - {filters.admissionRateMax}%
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={filters.admissionRateMin}
//                       onChange={(e) => setFilters({...filters, admissionRateMin: Number(e.target.value)})}
//                       className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={filters.admissionRateMax}
//                       onChange={(e) => setFilters({...filters, admissionRateMax: Number(e.target.value)})}
//                       className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                     />
//                   </div>
//                 </div>

//                 {/* Tuition */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Max Tuition: ${filters.tuitionMax.toLocaleString()}
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="100000"
//                     step="5000"
//                     value={filters.tuitionMax}
//                     onChange={(e) => setFilters({...filters, tuitionMax: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Student Size */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Student Size: {filters.studentSizeMin.toLocaleString()} - {filters.studentSizeMax.toLocaleString()}
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       min="0"
//                       max="50000"
//                       step="1000"
//                       value={filters.studentSizeMin}
//                       onChange={(e) => setFilters({...filters, studentSizeMin: Number(e.target.value)})}
//                       className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="50000"
//                       step="1000"
//                       value={filters.studentSizeMax}
//                       onChange={(e) => setFilters({...filters, studentSizeMax: Number(e.target.value)})}
//                       className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                     />
//                   </div>
//                 </div>

//                 {/* SAT Score Range */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Min SAT Score: {filters.satScoreMin}
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1600"
//                     step="50"
//                     value={filters.satScoreMin}
//                     onChange={(e) => setFilters({...filters, satScoreMin: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Graduation Rate */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Min Graduation Rate: {filters.graduationRateMin}%
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     step="5"
//                     value={filters.graduationRateMin}
//                     onChange={(e) => setFilters({...filters, graduationRateMin: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Retention Rate */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Min Retention Rate: {filters.retentionRateMin}%
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     step="5"
//                     value={filters.retentionRateMin}
//                     onChange={(e) => setFilters({...filters, retentionRateMin: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Earnings */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Min Median Earnings (10yr): ${filters.earningsMin.toLocaleString()}
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="150000"
//                     step="5000"
//                     value={filters.earningsMin}
//                     onChange={(e) => setFilters({...filters, earningsMin: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Debt */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Max Median Debt: ${filters.debtMax.toLocaleString()}
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="100000"
//                     step="5000"
//                     value={filters.debtMax}
//                     onChange={(e) => setFilters({...filters, debtMax: Number(e.target.value)})}
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Degree Types */}
//                 <div className="col-span-full">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Degree Programs Available</label>
//                   <div className="flex flex-wrap gap-3">
//                     {['bachelors', 'masters', 'doctorate'].map(type => (
//                       <label key={type} className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={filters.degreeTypes.includes(type)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setFilters({...filters, degreeTypes: [...filters.degreeTypes, type]});
//                             } else {
//                               setFilters({...filters, degreeTypes: filters.degreeTypes.filter(t => t !== type)});
//                             }
//                           }}
//                           className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
//                         />
//                         <span className="text-sm capitalize">{type}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-4">
//                 <button
//                   onClick={resetFilters}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
//                 >
//                   <X size={16} />
//                   Reset Filters
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Section */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {loading ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading colleges...</p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="mb-4 flex items-center justify-between">
//                 <p className="text-gray-600">
//                   Found <span className="font-bold text-red-600">{filteredColleges.length}</span> colleges
//                 </p>
//               </div>

//               {filteredColleges.length === 0 ? (
//                 <div className="text-center py-16 bg-white rounded-lg shadow-sm">
//                   <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-700 mb-2">No colleges found</h3>
//                   <p className="text-gray-500">Try adjusting your filters or search query</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {filteredColleges.map((college) => (
//                     <div
//                       key={college.id}
//                       className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
//                     >
//                       {/* Card Header */}
//                       <div className="p-6 border-b border-gray-100">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <h3 className="text-xl font-bold text-gray-800 mb-2">
//                               {college['school.name']}
//                             </h3>
//                             <div className="flex items-center gap-2 text-gray-600 mb-3">
//                               <MapPin size={16} />
//                               <span className="text-sm">
//                                 {college['school.city']}, {college['school.state']}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
//                                 {getOwnershipLabel(college['school.ownership'])}
//                               </span>
//                               {college['school.school_url'] && (
//                                 <a
//                                   href={college['school.school_url']}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-red-600 hover:text-red-700 transition-colors"
//                                 >
//                                   <ExternalLink size={16} />
//                                 </a>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Quick Stats */}
//                       <div className="p-6 grid grid-cols-2 gap-4">
//                         <div className="flex items-start gap-3">
//                           <div className="p-2 bg-blue-50 rounded-lg">
//                             <Users size={20} className="text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Students</p>
//                             <p className="font-semibold text-gray-800">
//                               {college['latest.student.size']?.toLocaleString() || 'N/A'}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-start gap-3">
//                           <div className="p-2 bg-green-50 rounded-lg">
//                             <DollarSign size={20} className="text-green-600" />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Out-of-State Tuition</p>
//                             <p className="font-semibold text-gray-800">
//                               {formatCurrency(college['latest.cost.tuition.out_of_state'])}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-start gap-3">
//                           <div className="p-2 bg-purple-50 rounded-lg">
//                             <TrendingUp size={20} className="text-purple-600" />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Admission Rate</p>
//                             <p className="font-semibold text-gray-800">
//                               {formatPercentage(college['latest.admissions.admission_rate.overall'])}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-start gap-3">
//                           <div className="p-2 bg-yellow-50 rounded-lg">
//                             <Star size={20} className="text-yellow-600" />
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Avg SAT</p>
//                             <p className="font-semibold text-gray-800">
//                               {college['latest.admissions.sat_scores.average.overall'] || 'N/A'}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Expandable Details */}
//                       <div className="px-6 pb-6">
//                         <button
//                           onClick={() => setExpandedCard(expandedCard === college.id ? null : college.id)}
//                           className="w-full flex items-center justify-between py-2 text-red-600 hover:text-red-700 transition-colors font-semibold"
//                         >
//                           <span>{expandedCard === college.id ? 'Show Less' : 'Show More Details'}</span>
//                           {expandedCard === college.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                         </button>

//                         {expandedCard === college.id && (
//                           <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
//                             {/* Financial Information */}
//                             <div>
//                               <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                                 <DollarSign size={18} className="text-red-600" />
//                                 Financial Information
//                               </h4>
//                               <div className="grid grid-cols-2 gap-3 text-sm">
//                                 <div>
//                                   <p className="text-gray-500">In-State Tuition</p>
//                                   <p className="font-semibold">{formatCurrency(college['latest.cost.tuition.in_state'])}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">Avg Net Price</p>
//                                   <p className="font-semibold">{formatCurrency(college['latest.cost.avg_net_price.overall'])}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">Room & Board</p>
//                                   <p className="font-semibold">{formatCurrency(college['latest.cost.roomboard.oncampus'])}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">Median Debt</p>
//                                   <p className="font-semibold">{formatCurrency(college['latest.aid.median_debt.completers.overall'])}</p>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Academic Performance */}
//                             <div>
//                               <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                                 <Award size={18} className="text-red-600" />
//                                 Academic Performance
//                               </h4>
//                               <div className="grid grid-cols-2 gap-3 text-sm">
//                                 <div>
//                                   <p className="text-gray-500">Graduation Rate</p>
//                                   <p className="font-semibold">{formatPercentage(college['latest.completion.completion_rate_4yr_100nt'])}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">Retention Rate</p>
//                                   <p className="font-semibold">{formatPercentage(college['latest.student.retention_rate.four_year.full_time'])}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">ACT Midpoint</p>
//                                   <p className="font-semibold">{college['latest.admissions.act_scores.midpoint.cumulative'] || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                   <p className="text-gray-500">Median Earnings (10yr)</p>
//                                   <p className="font-semibold">{formatCurrency(college['latest.earnings.10_yrs_after_entry.median'])}</p>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Programs */}
//                             <div>
//                               <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                                 <Book size={18} className="text-red-600" />
//                                 Popular Programs
//                               </h4>
//                               <div className="flex flex-wrap gap-2">
//                                 {(college['latest.academics.program_percentage.business_marketing'] ?? 0) > 0 && (
//                                   <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
//                                     Business {formatPercentage(college['latest.academics.program_percentage.business_marketing'])}
//                                   </span>
//                                 )}
//                                 {(college['latest.academics.program_percentage.computer'] ?? 0) > 0 && (
//                                   <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
//                                     Computer Science {formatPercentage(college['latest.academics.program_percentage.computer'])}
//                                   </span>
//                                 )}
//                                 {(college['latest.academics.program_percentage.health'] ?? 0) > 0 && (
//                                   <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs">
//                                     Health {formatPercentage(college['latest.academics.program_percentage.health'])}
//                                   </span>
//                                 )}
//                                 {(college['latest.academics.program_percentage.engineering'] ?? 0) > 0 && (
//                                   <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
//                                     Engineering {formatPercentage(college['latest.academics.program_percentage.engineering'])}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Degree Programs */}
//                             <div>
//                               <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                                 <GraduationCap size={18} className="text-red-600" />
//                                 Available Degrees
//                               </h4>
//                               <div className="flex flex-wrap gap-2">
//                                 {college['latest.academics.program_available.bachelors'] === 1 && (
//                                   <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//                                     Bachelor's
//                                   </span>
//                                 )}
//                                 {college['latest.academics.program_available.masters'] === 1 && (
//                                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                                     Master's
//                                   </span>
//                                 )}
//                                 {college['latest.academics.program_available.doctorate'] === 1 && (
//                                   <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
//                                     Doctorate
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CollegeFinder;
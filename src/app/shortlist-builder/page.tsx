"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, BookOpen, DollarSign, MapPin, Users, GraduationCap, Heart, Trophy, Award } from 'lucide-react';
import DefaultLayout from '../defaultLayout';

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

const ShortlistBuilder: React.FC = () => {
  const [shortlistColleges, setShortlistColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

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

  const LOCALE_TYPES = {
    '': 'All Locations', '11': 'City - Large', '12': 'City - Midsize', '13': 'City - Small',
    '21': 'Suburb - Large', '22': 'Suburb - Midsize', '23': 'Suburb - Small',
    '31': 'Town - Fringe', '32': 'Town - Distant', '33': 'Town - Remote',
    '41': 'Rural - Fringe', '42': 'Rural - Distant', '43': 'Rural - Remote'
  };

  useEffect(() => {
    loadShortlist();

    // Listen for updates from Course Finder
    const handleShortlistUpdate = () => {
      loadShortlist();
    };

    window.addEventListener('shortlist-updated', handleShortlistUpdate);

    return () => {
      window.removeEventListener('shortlist-updated', handleShortlistUpdate);
    };
  }, []);

  const loadShortlist = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('shortlisted-colleges');
      if (saved) {
        const data = JSON.parse(saved);
        setShortlistColleges(data.colleges || []);
      }
    } catch (error) {
      console.log('No saved colleges found:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = (collegeId: number) => {
    try {
      const newShortlist = shortlistColleges.filter(c => c.id !== collegeId);
      const newIds = newShortlist.map(c => c.id);
      
      setShortlistColleges(newShortlist);
      localStorage.setItem('shortlisted-colleges', JSON.stringify({ 
        ids: newIds, 
        colleges: newShortlist 
      }));
      
      // Notify other components
      window.dispatchEvent(new Event('shortlist-updated'));
    } catch (error) {
      console.error('Error removing from shortlist:', error);
    }
  };

  const clearAllShortlist = () => {
    if (window.confirm('Are you sure you want to clear your entire shortlist?')) {
      try {
        setShortlistColleges([]);
        localStorage.setItem('shortlisted-colleges', JSON.stringify({ 
          ids: [], 
          colleges: [] 
        }));
        
        // Notify other components
        window.dispatchEvent(new Event('shortlist-updated'));
      } catch (error) {
        console.error('Error clearing shortlist:', error);
      }
    }
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

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2">My Shortlist</h1>
            <p className="text-gray-600">Manage your saved colleges in one place</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p>Loading your shortlist...</p>
              </div>
            </div>
          ) : shortlistColleges.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your shortlist is empty</h3>
              <p className="text-gray-500 mb-4">Start exploring colleges and click the heart icon to save them here</p>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="text-red-600" size={20} fill="currentColor" />
                    <span className="font-semibold text-lg">
                      {shortlistColleges.length} {shortlistColleges.length === 1 ? 'college' : 'colleges'} saved
                    </span>
                  </div>
                </div>
                <button
                  onClick={clearAllShortlist}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>

              {/* College Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {shortlistColleges.map((college) => (
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
                        onClick={() => removeFromShortlist(college.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Remove from shortlist"
                      >
                        <Trash2 size={20} />
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

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 pt-4">
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
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ShortlistBuilder;
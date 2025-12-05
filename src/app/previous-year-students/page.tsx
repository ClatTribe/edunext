"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, Users, User, Building2, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

interface TestScore {
  exam: string;
  score: string;
}

interface AdmitProfile {
  id: number;
  name: string;
  test_scores?: TestScore[];
  term: string;
  university: string;
  program: string;
  applications_count: number;
  avatar_type: 'S' | 'G';
  verified: boolean;
  degree?: string;
  last_course_cgpa?: string;
  user_id?: string;
  similarityScore?: number;
}

interface UserProfile {
  test_scores?: TestScore[];
  program: string;
  degree?: string;
  last_course_cgpa?: string;
}

const AdmitFinder: React.FC = () => {
  const [profiles, setProfiles] = useState<AdmitProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'similar'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    if (!loadingProfile) {
      fetchProfiles();
    }
  }, [showVerifiedOnly, searchQuery, selectedUniversity, selectedMajor, viewMode, loadingProfile]);

  const fetchCurrentUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setUserProfile(null);
        setCurrentUserId(null);
        setLoadingProfile(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('admit_profiles')
        .select('test_scores, program, degree, last_course_cgpa')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setUserProfile(null);
      } else if (data) {
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const calculateSimilarityScore = (profile: AdmitProfile): number => {
    if (!userProfile) return 0;
    let score = 0;
    const maxScore = 100;
    
    // Simplified similarity calculation
    if (userProfile.program && profile.program) {
      const userProg = userProfile.program.toLowerCase();
      const profProg = profile.program.toLowerCase();
      if (userProg === profProg) score += 40;
      else if (userProg.includes(profProg) || profProg.includes(userProg)) score += 30;
    }

    return Math.round(score);
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let query = supabase.from('admit_profiles').select('*');

      if (showVerifiedOnly) query = query.eq('verified', true);
      if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%`);
      if (selectedUniversity) query = query.eq('university', selectedUniversity);
      if (selectedMajor) query = query.ilike('program', `%${selectedMajor}%`);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        setProfiles([]);
        return;
      }

      let allProfiles = data || [];
      if (currentUserId) {
        allProfiles = allProfiles.filter((p: AdmitProfile) => p.user_id !== currentUserId);
      }

      if (viewMode === 'similar' && userProfile) {
        const profilesWithScores = allProfiles.map((profile: AdmitProfile) => ({
          ...profile,
          similarityScore: calculateSimilarityScore(profile)
        }));

        const similarProfiles = profilesWithScores
          .filter((p: AdmitProfile) => (p.similarityScore || 0) >= 20)
          .sort((a: AdmitProfile, b: AdmitProfile) => (b.similarityScore || 0) - (a.similarityScore || 0));

        setProfiles(similarProfiles);
      } else {
        setProfiles(allProfiles);
      }
    } catch (error) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityBadge = (profile: AdmitProfile) => {
    if (viewMode !== 'similar' || !profile.similarityScore) return null;
    const score = profile.similarityScore;
    
    if (score >= 80) {
      return <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold">
        <span className="hidden sm:inline">Very Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 60) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold">
        <span className="hidden sm:inline">Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 40) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full font-semibold">
        <span className="hidden sm:inline">Somewhat Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold">Match ({score}%)</span>;
  };

  const formatTestScoresForDisplay = (testScores?: TestScore[]): string => {
    if (!testScores || testScores.length === 0) return 'None';
    return testScores.map(t => `${t.exam}: ${t.score}`).join(' | ');
  };

  const hasProfileData = userProfile && (
    (userProfile.test_scores && userProfile.test_scores.length > 0) ||
    userProfile.program || userProfile.degree || userProfile.last_course_cgpa
  );

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2f61ce] mb-1 sm:mb-2">
              Access 375K+ Admits & Rejects!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Find folks at your dream school with the same background, interests, and stats as you
            </p>
          </div>

          {viewMode === 'similar' && userProfile && (
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 border-l-4 border-[#2f61ce] rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-[#2f61ce] mt-0.5 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#2f61ce]">Matching based on your profile:</p>
                  <p className="text-xs text-gray-700 break-words">
                    Tests: {formatTestScoresForDisplay(userProfile.test_scores)} | 
                    Program: {userProfile.program || 'N/A'} | Degree: {userProfile.degree || 'N/A'} | CGPA: {userProfile.last_course_cgpa || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === 'all'
                  ? 'bg-[#2f61ce] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              All Profiles
            </button>
            <button
              onClick={() => {
                if (hasProfileData && !loadingProfile) {
                  setViewMode('similar');
                }
              }}
              disabled={!hasProfileData || loadingProfile}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === 'similar'
                  ? 'bg-[#2f61ce] text-white shadow-lg'
                  : hasProfileData && !loadingProfile
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <UserCheck size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Similar Profiles</span>
              <span className="sm:hidden">Similar</span>
              {!loadingProfile && !hasProfileData && <span className="hidden sm:inline text-xs ml-1">(Complete profile)</span>}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative w-full sm:w-auto">
              <select 
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="">All Universities</option>
                <option>IIMA - Indian Institute of Management</option>
                <option>Duke University</option>
                <option>Fostiima Business School University</option>
                <option>DBS Global University</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-600" />
            </div>

            <div className="relative w-full sm:w-auto">
              <select 
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
              >
                <option value="">All Majors</option>
                <option>Computer Science</option>
                <option>Data Science</option>
                <option>Engineering</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-600" />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="text-[#2f61ce]" size={18} />
              <span className="font-semibold text-sm sm:text-base">
                {profiles.length} {viewMode === 'similar' ? 'similar ' : ''}profile{profiles.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Verified only</span>
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showVerifiedOnly ? 'bg-[#2f61ce]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#2f61ce]"></div>
                <p className="text-sm sm:text-base">Loading profiles...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
              <UserCheck size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No profiles found</h3>
              <p className="text-xs sm:text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {profiles.map((profile, index) => {
                const isBlurred = viewMode === 'similar' && index >= 2;
                
                return (
                  <div 
                    key={profile.id} 
                    className={`border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white relative ${
                      isBlurred ? 'overflow-hidden' : ''
                    }`}
                  >
                    {isBlurred && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center p-4 rounded-xl">
                        <div className="bg-white shadow-2xl rounded-2xl p-6 text-center max-w-sm border-2 border-[#fac300]">
                          <div className="mb-4 flex justify-center">
                            <div className="bg-[#fac300] bg-opacity-20 rounded-full p-3">
                              <AlertCircle className="text-[#2f61ce]" size={24} />
                            </div>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Unlock More Profiles</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-5">
                            Talk to our experts to view {profiles.length - index - 1} more similar profiles
                          </p>
                          <button className="bg-[#2f61ce] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#264a9f] w-full flex items-center justify-center gap-2">
                            <Sparkles size={14} />
                            Contact Experts
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                          profile.avatar_type === 'S' ? 'bg-[#2f61ce]' : 'bg-[#fac300]'
                        } text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0`}>
                          {profile.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-1 text-gray-800 truncate">
                            {profile.name}
                            {profile.verified && <span className="text-[#fac300] text-sm">★</span>}
                          </h3>
                          <div className="mt-1">{getSimilarityBadge(profile)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{profile.term}</span>
                      </div>
                    </div>

                    {profile.test_scores && profile.test_scores.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                        {profile.test_scores.slice(0, 3).map((test, idx) => (
                          <div key={idx}>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <BookOpen size={10} />
                              <span className="truncate">{test.exam}</span>
                            </div>
                            <p className="font-bold text-xs sm:text-sm text-gray-800">{test.score}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[#2f61ce] flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 line-clamp-1">{profile.university}</span>
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">{profile.program}</div>
                      {profile.degree && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Degree:</span> {profile.degree}
                        </div>
                      )}
                    </div>

                    <button 
                      disabled={isBlurred}
                      className={`w-full border rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-sm transition-all ${
                        isBlurred 
                          ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300' 
                          : 'hover:bg-[#2f61ce] hover:text-white text-[#2f61ce] border-[#2f61ce]'
                      }`}
                    >
                      <User size={16} />
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;
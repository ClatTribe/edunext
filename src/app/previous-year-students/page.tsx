"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Users, Building2, UserCheck, Sparkles, Trophy, Award, Target, Filter, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

interface TestScore {
  exam: string;
  score: string;
  percentile?: string;
}

interface PreviousStudent {
  id: number;
  name: string;
  cat_percentile: number;
  ug_degree: string;
  city: string;
  mba_college: string;
  matchScore?: number;
}

interface UserProfile {
  test_scores?: TestScore[];
  program: string;
  degree?: string;
  city?: string;
}

const AdmitFinder: React.FC = () => {
  const [profiles, setProfiles] = useState<PreviousStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    if (!loadingProfile) {
      fetchProfiles();
    }
  }, [searchQuery, selectedCity, selectedCollege, viewMode, loadingProfile]);

  const fetchCurrentUserProfile = async () => {
    try {
      setLoadingProfile(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user');
        setUserProfile(null);
        setCurrentUserId(null);
        setLoadingProfile(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('admit_profiles')
        .select('test_scores, program, degree, city')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } else if (data) {
        console.log('User profile loaded:', data);
        setUserProfile(data);
      } else {
        console.log('No profile found for user');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchCurrentUserProfile:', error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const parseScore = (score: string | number | null): number | null => {
    if (!score) return null;
    const parsed = parseFloat(String(score));
    return isNaN(parsed) ? null : parsed;
  };

  const calculateMatchScore = (student: PreviousStudent): number => {
    if (!userProfile) return 0;
    
    let score = 0;
    let maxScore = 0;

    const userTestScores = userProfile.test_scores || [];
    const catScore = userTestScores.find(t => t.exam.toUpperCase().includes('CAT'));
    
    if (catScore && student.cat_percentile) {
      maxScore += 60;
      const userPercentile = parseFloat(catScore.score || catScore.percentile || '0');
      const studentPercentile = student.cat_percentile;
      
      if (userPercentile > 0 && studentPercentile > 0) {
        const diff = Math.abs(userPercentile - studentPercentile);
        
        if (diff <= 0.5) score += 60;
        else if (diff <= 1) score += 55;
        else if (diff <= 2) score += 50;
        else if (diff <= 3) score += 45;
        else if (diff <= 5) score += 40;
        else if (diff <= 7) score += 35;
        else if (diff <= 10) score += 30;
        else if (diff <= 15) score += 20;
        else if (diff <= 20) score += 10;
        else score += 5;
      }
    } else if (!catScore && !student.cat_percentile) {
      maxScore += 60;
      score += 30;
    } else {
      maxScore += 60;
    }

    maxScore += 25;
    if (userProfile.degree && student.ug_degree) {
      const userDeg = userProfile.degree.toLowerCase().trim();
      const studentDeg = student.ug_degree.toLowerCase().trim();
      
      if (userDeg === studentDeg) {
        score += 25;
      } else if (userDeg.includes(studentDeg) || studentDeg.includes(userDeg)) {
        score += 20;
      } else {
        const techDegrees = ['btech', 'b.tech', 'be', 'b.e', 'engineering'];
        const commDegrees = ['bcom', 'b.com', 'bba', 'b.b.a', 'commerce', 'business'];
        const sciDegrees = ['bsc', 'b.sc', 'science'];
        const artsDegrees = ['ba', 'b.a', 'arts'];
        
        const degreeGroups = [techDegrees, commDegrees, sciDegrees, artsDegrees];
        
        for (const group of degreeGroups) {
          const userInGroup = group.some(d => userDeg.includes(d));
          const studentInGroup = group.some(d => studentDeg.includes(d));
          if (userInGroup && studentInGroup) {
            score += 15;
            break;
          }
        }
      }
    } else if (!userProfile.degree && !student.ug_degree) {
      score += 12;
    }

    maxScore += 15;
    if (userProfile.city && student.city) {
      const userCity = userProfile.city.toLowerCase().trim();
      const studentCity = student.city.toLowerCase().trim();
      
      if (userCity === studentCity) {
        score += 15;
      } else if (userCity.includes(studentCity) || studentCity.includes(userCity)) {
        score += 10;
      } else {
        const metros = [['mumbai', 'pune', 'nagpur'], ['delhi', 'gurgaon', 'noida', 'ncr'], 
                       ['bangalore', 'bengaluru', 'mysore'], ['chennai', 'coimbatore'],
                       ['kolkata', 'howrah'], ['hyderabad', 'secunderabad']];
        
        for (const metro of metros) {
          const userInMetro = metro.some(c => userCity.includes(c));
          const studentInMetro = metro.some(c => studentCity.includes(c));
          if (userInMetro && studentInMetro) {
            score += 8;
            break;
          }
        }
      }
    } else if (!userProfile.city && !student.city) {
      score += 7;
    }

    const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return Math.round(finalScore * 10) / 10;
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('previous_student')
        .select('*');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,mba_college.ilike.%${searchQuery}%,ug_degree.ilike.%${searchQuery}%`);
      }

      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      if (selectedCollege) {
        query = query.eq('mba_college', selectedCollege);
      }

      const { data, error } = await query.order('id', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        setLoading(false);
        return;
      }

      let allProfiles = data || [];
      console.log(`Fetched ${allProfiles.length} total profiles from database`);

      if (viewMode === 'recommended' && userProfile) {
        console.log('Calculating match scores...');
        
        const profilesWithScores = allProfiles.map((profile: PreviousStudent) => ({
          ...profile,
          matchScore: calculateMatchScore(profile)
        }));

        const recommendedProfiles = profilesWithScores
          .filter((p: PreviousStudent) => (p.matchScore || 0) >= 20)
          .sort((a: PreviousStudent, b: PreviousStudent) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10);

        console.log(`Found ${recommendedProfiles.length} recommended profiles`);
        setProfiles(recommendedProfiles);
      } else {
        console.log(`Showing ${allProfiles.length} profiles`);
        setProfiles(allProfiles);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchBadge = (profile: PreviousStudent) => {
    if (viewMode !== 'recommended' || !profile.matchScore) return null;
    
    const score = profile.matchScore;
    
    if (score >= 90) {
      return <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Trophy size={14} />
        <span className="hidden sm:inline">Perfect Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 75) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Award size={14} />
        <span className="hidden sm:inline">Excellent Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 60) {
      return <span className="text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Target size={14} />
        <span className="hidden sm:inline">Great Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 40) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full font-semibold">
        <span className="hidden sm:inline">Good Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold">
      <span className="hidden sm:inline">Relevant ({score}%)</span>
      <span className="sm:hidden">{score}%</span>
    </span>;
  };

  const hasProfileData = userProfile && (
    (userProfile.test_scores && userProfile.test_scores.length > 0) ||
    userProfile.program || 
    userProfile.degree || 
    userProfile.city
  );

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2f61ce] mb-1 sm:mb-2">
              Connect with Previous Students!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Find students with similar backgrounds who got into top MBA colleges</p>
          </div>

          {/* Profile Info Banner */}
          {viewMode === 'recommended' && userProfile && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-l-4 border-[#2f61ce] rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="text-[#2f61ce] mt-0.5 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#2f61ce] mb-1">Showing your top 10 personalized matches:</p>
                  <p className="text-xs text-gray-700 break-words">
                    Based on: {userProfile.test_scores?.find(t => t.exam.toUpperCase().includes('CAT'))
                      ? `CAT: ${userProfile.test_scores.find(t => t.exam.toUpperCase().includes('CAT'))?.score}` 
                      : 'No CAT score'} | 
                    Degree: {userProfile.degree || 'N/A'} | City: {userProfile.city || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
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
              All Students
            </button>
            <button
              onClick={() => {
                if (hasProfileData && !loadingProfile) {
                  setViewMode('recommended');
                }
              }}
              disabled={!hasProfileData || loadingProfile}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === 'recommended'
                  ? 'bg-[#2f61ce] text-white shadow-lg'
                  : hasProfileData && !loadingProfile
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={!hasProfileData && !loadingProfile ? 'Complete your profile to see recommendations' : ''}
            >
              <UserCheck size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Recommended for You</span>
              <span className="sm:inline md:hidden">Recommended</span>
              {!loadingProfile && !hasProfileData && <span className="text-xs ml-1 hidden lg:inline">(Complete profile first)</span>}
            </button>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Filter size={18} />
                Filters {(selectedCity || selectedCollege || searchQuery) && '(Active)'}
              </span>
              {showFilters ? <X size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Filters - Hidden on mobile unless toggled */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:gap-4 mt-3 lg:mt-0`}>
              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Pune</option>
                  <option>Chennai</option>
                  <option>Hyderabad</option>
                  <option>Kolkata</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-600" />
              </div>

              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                >
                  <option value="">All Colleges</option>
                  <option>IIM Ahmedabad</option>
                  <option>IIM Bangalore</option>
                  <option>IIM Calcutta</option>
                  <option>IIM Lucknow</option>
                  <option>ISB Hyderabad</option>
                  <option>XLRI Jamshedpur</option>
                  <option>FMS Delhi</option>
                  <option>SPJIMR Mumbai</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-600" />
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, college, or degree"
                  className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="text-[#2f61ce] flex-shrink-0" size={20} />
              <span className="font-semibold text-sm sm:text-base text-gray-800">
                {profiles.length} {viewMode === 'recommended' ? 'recommended ' : ''}student{profiles.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Loading State */}
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
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {viewMode === 'recommended' 
                  ? 'No matching profiles found'
                  : 'No profiles found'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {viewMode === 'recommended' 
                  ? 'Try adjusting your filters or complete more profile information'
                  : 'Try adjusting your search filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Header with Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2f61ce] text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800 break-words mb-1">
                        {profile.name}
                      </h3>
                      {getMatchBadge(profile)}
                    </div>
                  </div>

                  {/* CAT Percentile and Degree - Side by Side */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {profile.cat_percentile && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <BookOpen size={12} className="text-[#2f61ce] flex-shrink-0" />
                          <span className="text-xs text-gray-600">CAT Percentile</span>
                        </div>
                        <p className="font-bold text-xl text-[#2f61ce]">{profile.cat_percentile}%</p>
                      </div>
                    )}
                    
                    {profile.ug_degree && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs text-gray-600 block mb-1">Degree</span>
                        <span className="font-semibold text-sm text-gray-800 break-words block">{profile.ug_degree}</span>
                      </div>
                    )}
                  </div>

                  {/* City and College - Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    {profile.city && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs text-gray-600 block mb-1">City</span>
                        <span className="font-semibold text-sm text-gray-800 block">{profile.city}</span>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Building2 size={12} className="text-[#2f61ce] flex-shrink-0" />
                        <span className="text-xs text-gray-600">MBA College</span>
                      </div>
                      <span className="font-semibold text-sm text-gray-800 break-words block">{profile.mba_college}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;
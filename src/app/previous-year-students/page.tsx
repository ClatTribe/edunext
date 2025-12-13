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

// Color scheme matching the home page
const accentColor = '#6366f1'; // Indigo accent
const primaryBg = '#0a0f1e'; // Very dark navy blue
const secondaryBg = '#111827'; // Slightly lighter navy
const borderColor = 'rgba(99, 102, 241, 0.15)'; // Indigo border with opacity

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
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <Trophy size={14} />
        <span className="hidden sm:inline">Perfect Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 75) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <Award size={14} />
        <span className="hidden sm:inline">Excellent Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 60) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
        <Target size={14} />
        <span className="hidden sm:inline">Great Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 40) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)', color: '#fbbf24', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
        <span className="hidden sm:inline">Good Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    }
    return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
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
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Connect with Previous Students!
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Find students with similar backgrounds who got into top MBA colleges</p>
          </div>

          {/* Profile Info Banner */}
          {viewMode === 'recommended' && userProfile && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg backdrop-blur-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderLeft: `4px solid ${accentColor}`, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold mb-1" style={{ color: accentColor }}>Showing your top 10 personalized matches:</p>
                  <p className="text-xs text-slate-300 break-words">
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
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === 'all'
                ? { backgroundColor: accentColor, color: 'white', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }
                : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
              }
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
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === 'recommended'
                ? { backgroundColor: accentColor, color: 'white', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }
                : hasProfileData && !loadingProfile
                  ? { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }
                  : { backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#64748b', cursor: 'not-allowed' }
              }
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
              className="lg:hidden w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all backdrop-blur-xl"
              style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}`, color: '#cbd5e1' }}
            >
              <span className="flex items-center gap-2">
                <Filter size={18} />
                Filters {(selectedCity || selectedCollege || searchQuery) && '(Active)'}
              </span>
              {showFilters ? <X size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:gap-4 mt-3 lg:mt-0`}>
              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-white"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="" style={{ backgroundColor: secondaryBg }}>All Cities</option>
                  <option style={{ backgroundColor: secondaryBg }}>Mumbai</option>
                  <option style={{ backgroundColor: secondaryBg }}>Delhi</option>
                  <option style={{ backgroundColor: secondaryBg }}>Bangalore</option>
                  <option style={{ backgroundColor: secondaryBg }}>Pune</option>
                  <option style={{ backgroundColor: secondaryBg }}>Chennai</option>
                  <option style={{ backgroundColor: secondaryBg }}>Hyderabad</option>
                  <option style={{ backgroundColor: secondaryBg }}>Kolkata</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-slate-400" />
              </div>

              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-white"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                >
                  <option value="" style={{ backgroundColor: secondaryBg }}>All Colleges</option>
                  <option style={{ backgroundColor: secondaryBg }}>IIM Ahmedabad</option>
                  <option style={{ backgroundColor: secondaryBg }}>IIM Bangalore</option>
                  <option style={{ backgroundColor: secondaryBg }}>IIM Calcutta</option>
                  <option style={{ backgroundColor: secondaryBg }}>IIM Lucknow</option>
                  <option style={{ backgroundColor: secondaryBg }}>ISB Hyderabad</option>
                  <option style={{ backgroundColor: secondaryBg }}>XLRI Jamshedpur</option>
                  <option style={{ backgroundColor: secondaryBg }}>FMS Delhi</option>
                  <option style={{ backgroundColor: secondaryBg }}>SPJIMR Mumbai</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-slate-400" />
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, college, or degree"
                  className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 sm:top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Users className="flex-shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-sm sm:text-base text-white">
                {profiles.length} {viewMode === 'recommended' ? 'recommended ' : ''}student{profiles.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-slate-400">Loading profiles...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <UserCheck size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {viewMode === 'recommended' 
                  ? 'No matching profiles found'
                  : 'No profiles found'}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 px-4">
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
                  className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow backdrop-blur-xl"
                  style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
                >
                  {/* Header with Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0" style={{ backgroundColor: accentColor }}>
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-white break-words mb-1">
                        {profile.name}
                      </h3>
                      {getMatchBadge(profile)}
                    </div>
                  </div>

                  {/* CAT Percentile and Degree - Side by Side */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {profile.cat_percentile && (
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                        <div className="flex items-center gap-1 mb-1">
                          <BookOpen size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                          <span className="text-xs text-slate-400">CAT Percentile</span>
                        </div>
                        <p className="font-bold text-xl" style={{ color: accentColor }}>{profile.cat_percentile}%</p>
                      </div>
                    )}
                    
                    {profile.ug_degree && (
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                        <span className="text-xs text-slate-400 block mb-1">Degree</span>
                        <span className="font-semibold text-sm text-slate-200 break-words block">{profile.ug_degree}</span>
                      </div>
                    )}
                  </div>

                  {/* City and College - Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    {profile.city && (
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                        <span className="text-xs text-slate-400 block mb-1">City</span>
                        <span className="font-semibold text-sm text-slate-200 block">{profile.city}</span>
                      </div>
                    )}
                    
                    <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                      <div className="flex items-center gap-1 mb-1">
                        <Building2 size={12} className="flex-shrink-0" style={{ color: accentColor }} />
                        <span className="text-xs text-slate-400">MBA College</span>
                      </div>
                      <span className="font-semibold text-sm text-slate-200 break-words block">{profile.mba_college}</span>
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
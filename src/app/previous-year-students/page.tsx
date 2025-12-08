"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, Users, User, Building2, UserCheck, AlertCircle, Sparkles, Trophy, Award, Target } from 'lucide-react';
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

    // 1. CAT Percentile Matching (60 points - MOST IMPORTANT)
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

    // 2. Degree Matching (25 points)
    maxScore += 25;
    if (userProfile.degree && student.ug_degree) {
      const userDeg = userProfile.degree.toLowerCase().trim();
      const studentDeg = student.ug_degree.toLowerCase().trim();
      
      if (userDeg === studentDeg) {
        score += 25;
      } else if (userDeg.includes(studentDeg) || studentDeg.includes(userDeg)) {
        score += 20;
      } else {
        // Related degrees
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

    // 3. City Matching (15 points)
    maxScore += 15;
    if (userProfile.city && student.city) {
      const userCity = userProfile.city.toLowerCase().trim();
      const studentCity = student.city.toLowerCase().trim();
      
      if (userCity === studentCity) {
        score += 15;
      } else if (userCity.includes(studentCity) || studentCity.includes(userCity)) {
        score += 10;
      } else {
        // Check if cities are in same region/state
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
      return <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Trophy size={14} />
        Perfect Match ({score}%)
      </span>;
    } else if (score >= 75) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Award size={14} />
        Excellent Match ({score}%)
      </span>;
    } else if (score >= 60) {
      return <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
        <Target size={14} />
        Great Match ({score}%)
      </span>;
    } else if (score >= 40) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
        Good Match ({score}%)
      </span>;
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
      Relevant ({score}%)
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
      <div className="flex-1 bg-white p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f61ce] mb-2">Connect with Previous Students!</h1>
          <p className="text-gray-600">Find students with similar backgrounds who got into top MBA colleges</p>
        </div>

        {viewMode === 'recommended' && userProfile && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-[#2f61ce] rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="text-[#2f61ce] mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2f61ce]">Showing your top 10 personalized matches:</p>
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

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-[#2f61ce] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={20} />
            All Students
          </button>
          <button
            onClick={() => {
              if (hasProfileData && !loadingProfile) {
                setViewMode('recommended');
              }
            }}
            disabled={!hasProfileData || loadingProfile}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'recommended'
                ? 'bg-[#2f61ce] text-white shadow-lg'
                : hasProfileData && !loadingProfile
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={!hasProfileData && !loadingProfile ? 'Complete your profile to see recommendations' : ''}
          >
            <UserCheck size={20} />
            Recommended for You
            {!loadingProfile && !hasProfileData && <span className="text-xs ml-1">(Complete profile first)</span>}
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
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
            <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-600" />
          </div>

          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
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
            <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-600" />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, college, or degree"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-[#2f61ce]" size={20} />
            <span className="font-semibold text-gray-800">
              {profiles.length} {viewMode === 'recommended' ? 'recommended ' : ''}student{profiles.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-lg">Loading profiles...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <UserCheck size={48} className="text-gray-300 mb-4" />
            <div className="text-gray-500 text-lg mb-2">
              {viewMode === 'recommended' 
                ? 'No matching profiles found'
                : 'No profiles found'}
            </div>
            <div className="text-gray-400 text-sm">
              {viewMode === 'recommended' 
                ? 'Try adjusting your filters or complete more profile information'
                : 'Try adjusting your search filters'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2f61ce] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800">
                        {profile.name}
                      </h3>
                      {getMatchBadge(profile)}
                    </div>
                  </div>
                </div>

                {profile.cat_percentile && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={14} className="text-[#2f61ce]" />
                      <span className="text-xs text-gray-500">CAT Percentile</span>
                    </div>
                    <p className="font-bold text-lg text-gray-800">{profile.cat_percentile}%</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {profile.ug_degree && (
                    <div className="text-sm">
                      <span className="text-gray-500">Degree:</span>
                      <span className="font-semibold text-gray-800 ml-2">{profile.ug_degree}</span>
                    </div>
                  )}
                  {profile.city && (
                    <div className="text-sm">
                      <span className="text-gray-500">City:</span>
                      <span className="font-semibold text-gray-800 ml-2">{profile.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Building2 size={14} className="text-[#2f61ce] flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 line-clamp-2">{profile.mba_college}</span>
                  </div>
                </div>

                {/* <button 
                  className="w-full border rounded-lg py-2 px-4 flex items-center justify-center gap-2 transition-all hover:bg-[#2f61ce] hover:text-white text-[#2f61ce] border-[#2f61ce]"
                >
                  <User size={16} />
                  View Profile
                </button> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;
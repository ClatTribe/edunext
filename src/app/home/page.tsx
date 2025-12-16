"use client"; 
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';
import { supabase } from '../../../lib/supabase';
// import LeadDataPopup from '../../../components/LeadDataPopup';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Target,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface TestScore {
  exam: string;
  percentile: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  academic_year?: string;
  test_scores?: TestScore[];
  target_degree?: string;
  target_field?: string;
  target_state?: string[];
}

// Global cache to persist data across page navigations
let cachedProfileData: ProfileData | null = null;
let cachedSimilarCount = 0;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DashboardPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(cachedProfileData);
  const [similarProfilesCount, setSimilarProfilesCount] = useState(cachedSimilarCount);
  const [loadingProfile, setLoadingProfile] = useState(!cachedProfileData);
  const [shortlistedCount, setShortlistedCount] = useState(0);

  // Exact color scheme from the screenshot - using deeper navy/blue tones
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


  // Memoize calculations with ONLY 6 required fields
  const profileMetrics = useMemo(() => {
    if (!profileData) {
      return {
        completion: 0,
        missingFields: [
          'Name', 'City', 'Email', 'Contact Number', 'Academic Year', 'Test Scores'
        ]
      };
    }

    const hasTestScores = profileData.test_scores && profileData.test_scores.length > 0;
    
    // ONLY 6 Required fields
    const fields = [
      profileData.name,           // 1. Name
      profileData.city,           // 2. City
      profileData.email,          // 3. Email
      profileData.phone,          // 4. Contact Number
      profileData.academic_year,  // 5. Academic Year
      hasTestScores               // 6. Test Scores
    ];

    const filledCount = fields.filter(f => f && (typeof f === 'boolean' ? f : f.toString().trim() !== '')).length;
    const completion = Math.round((filledCount / fields.length) * 100);

    const missing: string[] = [];
    if (!profileData.name) missing.push('Name');
    if (!profileData.city) missing.push('City');
    if (!profileData.email) missing.push('Email');
    if (!profileData.phone) missing.push('Contact Number');
    if (!profileData.academic_year) missing.push('Academic Year');
    if (!hasTestScores) missing.push('Test Scores');

    return { completion, missingFields: missing };
  }, [profileData]);

  const userName = useMemo(() => {
    return profileData?.name?.split(' ')[0] || 
           user?.user_metadata?.full_name?.split(' ')[0] || 
           user?.email?.split('@')[0] || 
           'User';
  }, [profileData?.name, user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const now = Date.now();
      const isCacheValid = cachedProfileData && (now - cacheTimestamp < CACHE_DURATION);
      
      if (!isCacheValid) {
        fetchProfileData();
      } else {
        setLoadingProfile(false);
      }
    }
  }, [user, loading]);

  useEffect(() => {
    loadShortlistCount();

    const handleShortlistUpdate = () => {
      loadShortlistCount();
    };

    window.addEventListener('shortlist-updated', handleShortlistUpdate);

    return () => {
      window.removeEventListener('shortlist-updated', handleShortlistUpdate);
    };
  }, []);

  const loadShortlistCount = () => {
    try {
      const saved = localStorage.getItem('shortlisted-colleges');
      if (saved) {
        const data = JSON.parse(saved);
        setShortlistedCount(data.ids?.length || 0);
      } else {
        setShortlistedCount(0);
      }
    } catch (error) {
      console.log('No saved colleges found:', error);
      setShortlistedCount(0);
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoadingProfile(true);
      
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        cachedProfileData = null;
        setProfileData(null);
      } else if (data) {
        const profileData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          academic_year: data.academic_year,
          test_scores: data.test_scores,
          target_degree: data.degree || data.target_degree,
          target_field: data.program || data.target_field,
          target_state: data.target_state,
        };
        
        cachedProfileData = profileData;
        cacheTimestamp = Date.now();
        setProfileData(profileData);
        
        if (data.test_scores?.length > 0 || data.program || data.degree) {
          fetchSimilarProfilesCount(profileData);
        }
      } else {
        cachedProfileData = null;
        setProfileData(null);
      }
    } catch (err) {
      console.error('Error:', err);
      cachedProfileData = null;
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSimilarProfilesCount = async (profile: ProfileData) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('admit_profiles')
        .select('id', { count: 'exact', head: true })
        .neq('user_id', user.id);

      const testScore = profile.test_scores?.[0]?.percentile;
      const scoreNum = testScore ? parseFloat(testScore) : null;
      
      if (scoreNum) {
        query = query.gte('test_scores->0->percentile', (scoreNum - 10).toString())
                     .lte('test_scores->0->percentile', (scoreNum + 10).toString());
      }
      if (profile.target_degree) {
        query = query.eq('degree', profile.target_degree);
      }

      const { count, error } = await query;

      if (!error && count !== null) {
        cachedSimilarCount = count;
        setSimilarProfilesCount(count);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getProgressColor = useCallback(() => {
    if (profileMetrics.completion >= 80) return `from-[${accentColor}] to-indigo-400`;
    if (profileMetrics.completion >= 50) return `from-[${accentColor}] to-indigo-300`;
    return `from-[${accentColor}] to-indigo-500`;
  }, [profileMetrics.completion, accentColor]);

  const getProgressMessage = useCallback(() => {
    if (profileMetrics.completion === 100) return '🎉 Your profile is complete!';
    if (profileMetrics.completion >= 80) return '🌟 Almost there! Complete your profile';
    if (profileMetrics.completion >= 50) return '⚡ You\'re halfway there!';
    return '🚀 Let\'s get started!';
  }, [profileMetrics.completion]);

  const handleProfileClick = useCallback(() => router.push('/profile'), [router]);
  const handleAdmitFinderClick = useCallback(() => router.push('/previous-year-students'), [router]);
  const handleCourseFinderClick = useCallback(() => router.push('/find-colleges'), [router]);
  const handleScholarshipClick = useCallback(() => router.push('/find-scholarships'), [router]);
  const handleShortlistClick = useCallback(() => router.push('/your-shortlist'), [router]);

  if (loading || loadingProfile) {
    return (
      <DefaultLayout>
        <div 
          className="flex items-center justify-center min-h-screen w-full"
          style={{ backgroundColor: primaryBg }}
        >
          <div className="flex items-center gap-2" style={{ color: accentColor }}>
            <div 
              className="animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderColor: accentColor }}
            ></div>
            <span className="text-xl">Loading...</span>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) return null;

  return (
    <DefaultLayout>
      {/* <LeadDataPopup /> */}
      <div 
        className="w-full min-h-screen"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-slate-400">Ready to take the next step in your academic journey?</p>
          </div>

          {/* COMPACT VERSION FOR 100% COMPLETE PROFILE */}
          {profileMetrics.completion === 100 ? (
            <div 
              className="rounded-xl shadow-lg p-4 mb-6 backdrop-blur-xl"
              style={{ 
                background: `linear-gradient(135deg, ${secondaryBg} 0%, rgba(34, 197, 94, 0.1) 100%)`,
                border: `2px solid ${accentColor}`
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <CheckCircle2 className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Profile Complete! 🎉</h3>
                    <p className="text-sm text-slate-400">All features unlocked</p>
                  </div>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 flex items-center gap-1 shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: accentColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
                >
                  <User size={14} />
                  View Profile
                </button>
              </div>
            </div>
          ) : (
            /* FULL VERSION FOR INCOMPLETE PROFILE */
            <div 
              className="rounded-2xl shadow-xl p-6 mb-6 backdrop-blur-xl"
              style={{ 
                backgroundColor: secondaryBg,
                border: `1px solid ${borderColor}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${accentColor} 0%, #818cf8 100%)`
                    }}
                  >
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Profile Completion</h2>
                    <p className="text-slate-400">{getProgressMessage()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-4xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {profileMetrics.completion}%
                  </div>
                  <p className="text-sm text-slate-500">Complete</p>
                </div>
              </div>

              <div 
                className="relative h-4 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              >
                <div 
                  className="absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full"
                  style={{ 
                    width: `${profileMetrics.completion}%`,
                    background: `linear-gradient(90deg, ${accentColor} 0%, #818cf8 100%)`
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
              </div>

              {profileMetrics.missingFields.length > 0 && (
                <div 
                  className="rounded-xl p-4 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle style={{ color: accentColor }} className="mt-0.5 shrink-0" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">Complete these required fields to unlock full features:</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {profileMetrics.missingFields.map((field, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ 
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              color: '#a5b4fc',
                              border: `1px solid ${borderColor}`
                            }}
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                        style={{ 
                          background: `linear-gradient(90deg, ${accentColor} 0%, #818cf8 100%)`
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <User size={16} />
                        Complete Your Profile
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Section */}
          <div 
            className="rounded-2xl shadow-xl p-6 backdrop-blur-xl mb-6"
            style={{ 
              backgroundColor: secondaryBg,
              border: `1px solid ${borderColor}`
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Target style={{ color: accentColor }} size={24} />
              <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Find Colleges Card */}
              <button 
                onClick={handleCourseFinderClick}
                className="group p-6 rounded-xl transition-all text-left hover:shadow-lg backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  border: `1px solid ${borderColor}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(99, 102, 241, 0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-white mb-1 text-lg">Find Colleges</div>
                <div className="text-sm text-slate-400">Explore programs Nationwide</div>
                <ArrowRight 
                  style={{ color: accentColor }}
                  className="mt-2 group-hover:translate-x-1 transition-transform" 
                  size={20} 
                />
              </button>

              {/* Previous Year Students Card */}
              <button 
                onClick={handleAdmitFinderClick}
                className="group p-6 rounded-xl transition-all text-left hover:shadow-lg backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(14, 165, 233, 0.05)',
                  border: `1px solid rgba(14, 165, 233, 0.15)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-4xl mb-3">👥</div>
                <div className="font-bold text-white mb-1 text-lg">Previous Year Students</div>
                <div className="text-sm text-slate-400">Connect with admits</div>
                <ArrowRight 
                  className="text-sky-400 mt-2 group-hover:translate-x-1 transition-transform" 
                  size={20} 
                />
              </button>

              {/* Scholarships Card */}
              <button 
                onClick={handleScholarshipClick}
                className="group p-6 rounded-xl transition-all text-left hover:shadow-lg backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(34, 197, 94, 0.05)',
                  border: `1px solid rgba(34, 197, 94, 0.15)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-4xl mb-3">💵</div>
                <div className="font-bold text-white mb-1 text-lg">Scholarships</div>
                <div className="text-sm text-slate-400">Find funding options</div>
                <ArrowRight 
                  className="text-green-400 mt-2 group-hover:translate-x-1 transition-transform" 
                  size={20} 
                />
              </button>

              {/* Your Shortlist Card */}
              <button 
                onClick={handleShortlistClick}
                className="group p-6 rounded-xl transition-all text-left hover:shadow-lg backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.05)',
                  border: `1px solid rgba(168, 85, 247, 0.15)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-4xl mb-3">⭐</div>
                <div className="font-bold text-white mb-1 text-lg">Your Shortlist</div>
                <div className="text-sm text-slate-400">Build your dream list</div>
                <ArrowRight 
                  className="text-purple-400 mt-2 group-hover:translate-x-1 transition-transform" 
                  size={20} 
                />
              </button>
            </div>
          </div>

          {/* Pro Tip Section */}
          {profileMetrics.completion < 100 && (
            <div 
              className="rounded-2xl shadow-lg p-6 backdrop-blur-sm"
              style={{ 
                background: `linear-gradient(135deg, ${secondaryBg} 0%, rgba(250, 195, 0, 0.05) 100%)`,
                border: `1px solid rgba(250, 195, 0, 0.2)`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#fac300' }}
                >
                  <Sparkles className="text-slate-900" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">💡 Pro Tip</h3>
                  <p className="text-slate-400">
                    Complete all 6 required fields (Name, City, Email, Contact Number, Academic Year, and Test Scores) in your profile to unlock personalized recommendations and connect with students who have similar academic backgrounds!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
"use client"; 
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DefaultLayout from './defaultLayout';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Target,
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react';

interface MissingField {
  name: string;
}

interface ProfileData {
  name?: string;
  degree?: string;
  last_course_cgpa?: string;
  gre?: number;
  toefl?: number;
  ielts?: string;
  term?: string;
  university?: string;
  program?: string;
  extracurricular?: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [similarProfilesCount, setSimilarProfilesCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Prevent re-fetching on tab switch
  const hasFetchedRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Only fetch if we haven't fetched recently (within last 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (user && !loading && (!hasFetchedRef.current || (now - lastFetchTimeRef.current > fiveMinutes))) {
      hasFetchedRef.current = true;
      lastFetchTimeRef.current = now;
      fetchProfileData();
    } else if (user && hasFetchedRef.current) {
      // If we already have data, just stop loading
      setLoadingProfile(false);
    }
  }, [user, loading]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoadingProfile(true);
      
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfileData(null);
        setProfileCompletion(0);
        setMissingFields(getAllFields());
      } else if (data) {
        setProfileData(data);
        calculateProfileCompletion(data);
        fetchSimilarProfilesCount(data);
      } else {
        setProfileData(null);
        setProfileCompletion(0);
        setMissingFields(getAllFields());
      }
    } catch (err) {
      console.error('Error:', err);
      setProfileData(null);
      setProfileCompletion(0);
      setMissingFields(getAllFields());
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSimilarProfilesCount = async (profile: ProfileData) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('gre, program, degree')
        .neq('user_id', user.id)
        .limit(100);

      if (!error && data) {
        interface Profile {
  gre?: number;
  program?: string;
  degree?: string;
}

const similar = data.filter((p: Profile) => {
  let matches = 0;

  if (profile.gre && p.gre && Math.abs(profile.gre - p.gre) <= 10) matches++;
  if (
    profile.program &&
    p.program &&
    p.program.toLowerCase().includes(profile.program.toLowerCase().split(' ')[0])
  )
    matches++;
  if (profile.degree && p.degree && profile.degree === p.degree) matches++;

  return matches >= 2;
});

        setSimilarProfilesCount(similar.length);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getAllFields = (): MissingField[] => [
    { name: 'Name' },
    { name: 'Degree Type' },
    { name: 'Last Course CGPA' },
    { name: 'GRE Score' },
    { name: 'TOEFL/IELTS' },
    { name: 'Target Term' },
    { name: 'Target University' },
    { name: 'Program/Major' },
    { name: 'Extracurricular' }
  ];

  const calculateProfileCompletion = (data: ProfileData) => {
    const fields = [
      data.name,
      data.degree,
      data.last_course_cgpa,
      data.gre,
      data.toefl || data.ielts,
      data.term,
      data.university,
      data.program,
      data.extracurricular
    ];

    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    const completion = Math.round((filledFields / fields.length) * 100);
    setProfileCompletion(completion);

    const missing: MissingField[] = [];
    if (!data.name) missing.push({ name: 'Name' });
    if (!data.degree) missing.push({ name: 'Degree Type' });
    if (!data.last_course_cgpa) missing.push({ name: 'CGPA' });
    if (!data.gre) missing.push({ name: 'GRE' });
    if (!data.toefl && !data.ielts) missing.push({ name: 'TOEFL/IELTS' });
    if (!data.term) missing.push({ name: 'Target Term' });
    if (!data.university) missing.push({ name: 'University' });
    if (!data.program) missing.push({ name: 'Program' });
    if (!data.extracurricular) missing.push({ name: 'Extracurricular' });

    setMissingFields(missing);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getProgressColor = () => {
    if (profileCompletion >= 80) return 'from-red-500 to-pink-500';
    if (profileCompletion >= 50) return 'from-red-400 to-pink-400';
    return 'from-red-600 to-pink-600';
  };

  const getProgressMessage = () => {
    if (profileCompletion === 100) return '🎉 Your profile is complete!';
    if (profileCompletion >= 80) return '🌟 Almost there! Complete your profile';
    if (profileCompletion >= 50) return '⚡ You\'re halfway there!';
    return '🚀 Let\'s get started!';
  };

  if (loading || loadingProfile) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-red-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            Loading...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) return null;

  return (
    <DefaultLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {getGreeting()}, {profileData?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600">Ready to take the next step in your academic journey?</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-red-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${getProgressColor()} rounded-full flex items-center justify-center`}>
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Profile Completion</h2>
                  <p className="text-gray-600">{getProgressMessage()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {profileCompletion}%
                </div>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>

            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${profileCompletion}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>

            {missingFields.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Complete these fields to unlock full features:</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {missingFields.slice(0, 5).map((field, idx) => (
                        <span key={idx} className="text-xs bg-white text-red-600 px-3 py-1 rounded-full border border-red-200 font-medium">
                          {field.name}
                        </span>
                      ))}
                      {missingFields.length > 5 && (
                        <span className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200 font-medium">
                          +{missingFields.length - 5} more
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => router.push('/dashboard/profile')}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all text-sm font-semibold shadow-lg"
                    >
                      <User size={16} />
                      Complete Your Profile
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileCompletion === 100 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800">Awesome! Your profile is 100% complete! 🎉</h3>
                    <p className="text-sm text-gray-600">You can now access all features and find similar profiles.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {profileCompletion >= 50 && (
            <div 
              onClick={() => router.push('/admit-finder')}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-red-100 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="text-red-600" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Find Similar Profiles</h2>
                    <p className="text-gray-600">
                      {similarProfilesCount > 0 
                        ? `${similarProfilesCount} students with similar background found!` 
                        : 'Discover students with profiles like yours'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-red-600" size={28} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Shortlisted</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">Programs saved</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Applications</p>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Scholarships</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">Opportunities</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Admits</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">Received</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-100">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-red-600" size={24} />
              <h2 className="text-2xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/course-finder')}
                className="group p-6 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Find Courses</div>
                <div className="text-sm text-gray-600">Explore programs worldwide</div>
                <ArrowRight className="text-red-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={() => router.push('/admit-finder')}
                className="group p-6 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">👥</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Admit Finder</div>
                <div className="text-sm text-gray-600">Connect with admits</div>
                <ArrowRight className="text-blue-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={() => router.push('/scholarship-finder')}
                className="group p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">💵</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Scholarships</div>
                <div className="text-sm text-gray-600">Find funding options</div>
                <ArrowRight className="text-green-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={() => router.push('/shortlist-builder')}
                className="group p-6 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">⭐</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Shortlist Builder</div>
                <div className="text-sm text-gray-600">Build your dream list</div>
                <ArrowRight className="text-purple-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
          </div>

          {profileCompletion < 100 && (
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">💡 Pro Tip</h3>
                  <p className="text-gray-700">
                    Complete your profile to unlock personalized recommendations and connect with students who have similar academic backgrounds!
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
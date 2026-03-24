/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';
import {
  Search,
  Send,
  Sparkles,
  Zap,
  School,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Calendar,
  Heart,
  BookOpen,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  response: string;
}

interface ShortlistItem {
  id: number;
  user_id: string;
  item_type: 'course' | 'scholarship';
  course_id: number | null;
  scholarship_id: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  course?: any;
}

interface MicrositeShortlistItem {
  id: number;
  user_id: string;
  college_microsite_id: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  college_microsite?: {
    id: number;
    slug: string;
    college_name: string;
    location: string;
    microsite_data?: any;
  };
}

// Unified type for display in shortlist section
interface DisplayCollege {
  id: number;
  name: string;
  location: string;
  specialization?: string;
  fees?: string;
  slug?: string;
  source: 'course' | 'microsite';
}

interface ProfileData {
  target_degree: string;
  target_field: string;
  target_state: string[];
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  academic_year: string;
  budget: string[];
}

interface Deadline {
  examName: string;
  registrationEnds: string;
  examDate: string;
  linkToApply: string;
  degreeTypes: string[];
}

const COLORS = {
  background: '#0f1223',
  surfaceContainer: '#1b1f30',
  surfaceContainerLow: '#171b2b',
  surfaceContainerHigh: '#25293b',
  primary: '#ffc174',
  primaryContainer: '#f59e0b',
  onPrimary: '#472a00',
  onSurface: '#dfe1f9',
  onSurfaceVariant: '#d8c3ad',
  tertiary: '#bccbff',
  error: '#ffb4ab',
};

const glassEffect = {
  background: 'rgba(27, 31, 48, 0.4)',
  backdropFilter: 'blur(12px)',
  border: `1px solid rgba(255, 193, 116, 0.1)`,
};

// Map degree types to relevant exams
const ALL_DEADLINES: Deadline[] = [
  {
    examName: 'JEE Main 2026',
    registrationEnds: 'Nov 2025',
    examDate: 'Jan & Apr 2026',
    linkToApply: 'https://jeemain.nta.nic.in',
    degreeTypes: ['B.Tech'],
  },
  {
    examName: 'JEE Advanced 2026',
    registrationEnds: 'Apr 2026',
    examDate: 'May 2026',
    linkToApply: 'https://jeeadv.ac.in',
    degreeTypes: ['B.Tech'],
  },
  {
    examName: 'BITSAT 2026',
    registrationEnds: 'Apr 2026',
    examDate: 'May-Jun 2026',
    linkToApply: 'https://bitsadmission.com',
    degreeTypes: ['B.Tech'],
  },
  {
    examName: 'VITEEE 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'Apr 2026',
    linkToApply: 'https://viteee.vit.ac.in',
    degreeTypes: ['B.Tech'],
  },
  {
    examName: 'SRMJEEE 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'Apr 2026',
    linkToApply: 'https://srmist.edu.in',
    degreeTypes: ['B.Tech'],
  },
  {
    examName: 'CAT 2026',
    registrationEnds: 'Sep 2026',
    examDate: 'Nov 2026',
    linkToApply: 'https://iimcat.ac.in',
    degreeTypes: ['MBA'],
  },
  {
    examName: 'XAT 2027',
    registrationEnds: 'Nov 2026',
    examDate: 'Jan 2027',
    linkToApply: 'https://xatonline.in',
    degreeTypes: ['MBA'],
  },
  {
    examName: 'SNAP 2026',
    registrationEnds: 'Nov 2026',
    examDate: 'Dec 2026',
    linkToApply: 'https://snaptest.org',
    degreeTypes: ['MBA'],
  },
  {
    examName: 'MAT 2026',
    registrationEnds: 'Jan 2026',
    examDate: 'Feb 2026',
    linkToApply: 'https://aima.in',
    degreeTypes: ['MBA'],
  },
  {
    examName: 'CMAT 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'May 2026',
    linkToApply: 'https://nbsa.gov.in',
    degreeTypes: ['MBA'],
  },
  {
    examName: 'NEET UG 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'May 2026',
    linkToApply: 'https://neet.nta.nic.in',
    degreeTypes: ['Medical', 'Dental'],
  },
  {
    examName: 'CLAT 2026',
    registrationEnds: 'Nov 2025',
    examDate: 'Dec 2025',
    linkToApply: 'https://consortiumofnlus.ac.in',
    degreeTypes: ['Law'],
  },
  {
    examName: 'CUET UG 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'May 2026',
    linkToApply: 'https://cuet.nta.nic.in',
    degreeTypes: ['Arts', 'Science', 'Commerce', 'BCA', 'BBA/BMS', 'Computer Applications', 'Education', 'Journalism', 'Mass Communications'],
  },
  {
    examName: 'CUET PG 2026',
    registrationEnds: 'Dec 2025',
    examDate: 'Jan 2026',
    linkToApply: 'https://cuet.nta.nic.in',
    degreeTypes: ['MBA', 'Computer Applications', 'Science', 'Arts', 'Commerce', 'Education'],
  },
  {
    examName: 'NATA 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'Apr 2026',
    linkToApply: 'https://nata.in',
    degreeTypes: ['Architecture'],
  },
  {
    examName: 'NCHMCT JEE 2026',
    registrationEnds: 'Mar 2026',
    examDate: 'Apr 2026',
    linkToApply: 'https://nchmjee.nta.nic.in',
    degreeTypes: ['Hotel Management', 'Hospitality Management'],
  },
  {
    examName: 'IPMAT 2026',
    registrationEnds: 'Apr 2026',
    examDate: 'May 2026',
    linkToApply: 'https://iimidr.ac.in',
    degreeTypes: ['BBA/BMS', 'MBA'],
  },
  {
    examName: 'MAH CET 2026',
    registrationEnds: 'Feb 2026',
    examDate: 'Mar 2026',
    linkToApply: 'https://cetcell.mahacet.org',
    degreeTypes: ['MBA', 'BBA/BMS'],
  },
  {
    examName: 'GPAT 2026',
    registrationEnds: 'Dec 2025',
    examDate: 'Jan 2026',
    linkToApply: 'https://gpat.nta.nic.in',
    degreeTypes: ['Pharmacy'],
  },
];

export default function MedhaAIDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [displayColleges, setDisplayColleges] = useState<DisplayCollege[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const quickSuggestions = [
    'MBA colleges in Pune',
    'I want to build rockets but bad at maths',
    'Earn ‚Çπ25 LPA after 5 years',
    'Best engineering colleges in Delhi',
    'Entrepreneurship focused colleges',
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfileData(data);
        // Check if profile has essential fields filled
        const hasDegree = data.target_degree && data.target_degree.trim() !== '';
        const hasName = data.name || data.full_name;
        setHasProfile(!!(hasDegree && hasName));
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [user]);

  // Fetch shortlisted colleges from both tables and combine
  const fetchShortlist = useCallback(async () => {
    if (!user) return;
    setShortlistLoading(true);
    try {
      const allDisplayColleges: DisplayCollege[] = [];

      // 1. Fetch from shortlist_builder (regular courses)
      const { data: shortlistData } = await supabase
        .from('shortlist_builder')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (shortlistData) {
        const courseItems = await Promise.all(
          shortlistData.filter((item: any) => item.item_type === 'course' && item.course_id).map(async (item: any) => {
            const { data: courseData } = await supabase
              .from('courses')
              .select('*')
              .eq('id', item.course_id)
              .single();
            return courseData ? {
              id: item.id,
              name: courseData['College Name'] || 'Unknown College',
              location: [courseData.City, courseData.State].filter(Boolean).join(', '),
              specialization: courseData.Specialization || '',
              fees: courseData['Course Fees'] || '',
              slug: (courseData['College Name'] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
              source: 'course' as const,
            } : null;
          })
        );
        allDisplayColleges.push(...courseItems.filter(Boolean) as DisplayCollege[]);
      }

      // 2. Fetch from shortlist_builder_microsite (featured colleges)
      const { data: micrositeData } = await supabase
        .from('shortlist_builder_microsite')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (micrositeData) {
        const micrositeItems = await Promise.all(
          micrositeData.map(async (item: any) => {
            const { data: collegeData } = await supabase
              .from('college_microsites')
              .select('id, slug, college_name, location, microsite_data')
              .eq('id', item.college_microsite_id)
              .single();
            if (!collegeData) return null;
            const fees = collegeData.microsite_data?.fees?.[0]?.rows?.[0]?.[Object.keys(collegeData.microsite_data?.fees?.[0]?.rows?.[0] || {})[0]] || '';
            return {
              id: item.id,
              name: collegeData.college_name || 'Unknown College',
              location: collegeData.location || '',
              specialization: '',
              fees: fees,
              slug: collegeData.slug || '',
              source: 'microsite' as const,
            };
          })
        );
        allDisplayColleges.push(...micrositeItems.filter(Boolean) as DisplayCollege[]);
      }

      setDisplayColleges(allDisplayColleges);
    } catch (err) {
      console.error('Error fetching shortlist:', err);
    } finally {
      setShortlistLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchShortlist();
    }
  }, [user, fetchProfile, fetchShortlist]);

  // Get deadlines filtered by user's target_degree
  const getFilteredDeadlines = () => {
    if (!profileData?.target_degree) return ALL_DEADLINES.slice(0, 4);
    return ALL_DEADLINES.filter((d) =>
      d.degreeTypes.includes(profileData.target_degree)
    ).slice(0, 5);
  };

  const filteredDeadlines = getFilteredDeadlines();

  const colleges = [
    {
      name: 'IIT Bombay',
      category: 'AMBITIOUS',
      branch: 'Computer Science',
    },
    {
      name: 'BITS Pilani',
      category: 'TARGET',
      branch: 'Electronics',
    },
    {
      name: 'NIT Bangalore',
      category: 'TARGET',
      branch: 'Mechanical',
    },
  ];

  const aiTips = [
    {
      number: '01',
      title: 'Research Like a Pro',
      description: 'Use our AI to compare colleges based on your preferences and career goals',
    },
    {
      number: '02',
      title: 'Track Deadlines Smart',
      description: 'Get automated reminders for important application and registration dates',
    },
    {
      number: '03',
      title: 'Build Your Shortlist',
      description: 'Create a personalized college list matched to your scores and aspirations',
    },
  ];

  const formatResponse = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery('');
    setIsLoading(true);
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: query },
    ];
    setMessages(newMessages);
    setShowResponse(true);

    try {
      const response = await fetch('/api/medha-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data: AIResponse = await response.json();
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleAskAnother = () => {
    setMessages([]);
    setShowResponse(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            <p className="mt-4" style={{ color: COLORS.onSurface }}>Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="flex items-center justify-center px-4">
          <div style={glassEffect} className="rounded-2xl p-8 max-w-md w-full text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.onSurface }}>
              Welcome to Medha AI
            </h2>
            <p className="mb-6" style={{ color: COLORS.onSurfaceVariant }}>
              Sign in with Google to access Medha AI
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.onPrimary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primaryContainer;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Welcome Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2" style={{ color: COLORS.onSurface }}>
                Welcome back, {displayName}
              </h1>
              <p className="text-lg" style={{ color: COLORS.onSurfaceVariant }}>
                Your AI-powered college counsellor is ready.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: COLORS.primaryContainer, color: COLORS.onPrimary }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">AI ENGINE ACTIVE</span>
            </div>
          </div>

          {/* AI Search Bar ‚Äî prominent with strong border and background */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{
                background: 'rgba(27, 31, 48, 0.85)',
                backdropFilter: 'blur(12px)',
                border: `2px solid ${COLORS.primary}60`,
                boxShadow: `0 0 20px ${COLORS.primary}15`,
              }}
            >
              <Search className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.primary }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                placeholder="Ask me anything about your career, colleges, courses..."
                className="flex-1 bg-transparent outline-none text-lg"
                style={{
                  color: '#ffffff',
                  caretColor: COLORS.primary,
                }}
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                className="p-3 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.onPrimary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primaryContainer;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips ‚Äî high visibility */}
            <div className="flex flex-wrap gap-3">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255, 193, 116, 0.12)',
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}50`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                    e.currentTarget.style.color = COLORS.onPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 193, 116, 0.12)';
                    e.currentTarget.style.color = COLORS.primary;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* AI Response Card */}
            {showResponse && messages.length > 0 && (
              <div
                style={glassEffect}
                className="rounded-2xl p-6 space-y-4 mt-6"
              >
                {/* User Message */}
                <div className="flex justify-end">
                  <div
                    className="max-w-2xl rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: COLORS.primary,
                      color: COLORS.onPrimary,
                    }}
                  >
                    <p className="text-sm">
                      {messages[0]?.content}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                {isLoading ? (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.primary }} />
                    <div className="space-y-2">
                      <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                        Thinking<span className="inline-block">
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0s' }}>.</span>
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.primary }} />
                    <div className="flex-1">
                      <div
                        className="prose prose-invert text-sm max-w-none"
                        style={{ color: COLORS.onSurface }}
                        dangerouslySetInnerHTML={{
                          __html: formatResponse(
                            messages[messages.length - 1]?.content || ''
                          ),
                        }}
                      />
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <button
                    onClick={handleAskAnother}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: COLORS.surfaceContainerHigh,
                      color: COLORS.primary,
                      border: `1px solid ${COLORS.primary}40`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primary;
                      e.currentTarget.style.color = COLORS.onPrimary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.surfaceContainerHigh;
                      e.currentTarget.style.color = COLORS.primary;
                    }}
                  >
                    Ask another question
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Completion Card */}
          <div
            style={{
              ...glassEffect,
              borderImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer}) 1`,
            }}
            className="rounded-2xl p-6 border-2"
          >
            {!hasProfile ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.primaryContainer }} />
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.onSurface }}>
                      Complete your profile
                    </h3>
                    <p style={{ color: COLORS.onSurfaceVariant }}>
                      Get personalized college recommendations &amp; course-specific deadlines
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: COLORS.onPrimary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primaryContainer;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                  }}
                >
                  Fill Profile Now
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" style={{ color: COLORS.primary }} />
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: COLORS.onSurface }}>
                      Profile Complete
                    </h3>
                    <p style={{ color: COLORS.onSurfaceVariant }}>
                      Target: {profileData?.target_degree || 'N/A'}{profileData?.target_field ? ` ‚Äî ${profileData.target_field}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.surfaceContainerHigh,
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}40`,
                  }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* My Shortlist Section ‚Äî from real Supabase data */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: COLORS.primary }} />
                <h2 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
                  My Shortlist
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: COLORS.onPrimary,
                  }}
                >
                  {displayColleges.length}
                </span>
                {displayColleges.length > 0 && (
                  <button
                    onClick={() => router.push('/your-shortlist')}
                    className="flex items-center gap-1 text-sm font-semibold transition-all duration-200"
                    style={{ color: COLORS.primary }}
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {shortlistLoading ? (
              <div style={glassEffect} className="rounded-xl p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 mb-2" style={{ borderColor: COLORS.primary }}></div>
                <p style={{ color: COLORS.onSurfaceVariant }}>Loading your shortlist...</p>
              </div>
            ) : displayColleges.length === 0 ? (
              <div
                style={glassEffect}
                className="rounded-xl p-8 text-center"
              >
                <School className="w-10 h-10 mx-auto mb-3" style={{ color: COLORS.onSurfaceVariant }} />
                <p className="mb-1 font-semibold" style={{ color: COLORS.onSurface }}>
                  No colleges shortlisted yet
                </p>
                <p className="text-sm mb-4" style={{ color: COLORS.onSurfaceVariant }}>
                  Use College Finder to discover and shortlist colleges!
                </p>
                <button
                  onClick={() => router.push('/find-colleges')}
                  className="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: COLORS.onPrimary,
                  }}
                >
                  Find Colleges
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {displayColleges.slice(0, 6).map((college, index) => (
                  <div
                    key={`${college.source}-${college.id}-${index}`}
                    style={glassEffect}
                    className="rounded-xl p-4 flex-shrink-0 w-72 transition-all duration-200 hover:border-opacity-100 cursor-pointer"
                    onClick={() => {
                      if (college.slug) {
                        router.push(`/college/${college.slug}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <School className="w-5 h-5" style={{ color: COLORS.primary }} />
                      <ChevronRight className="w-4 h-4" style={{ color: COLORS.onSurfaceVariant }} />
                    </div>
                    <h3 className="font-bold mb-1 text-sm leading-tight" style={{ color: COLORS.onSurface }}>
                      {college.name}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: COLORS.onSurfaceVariant }}>
                      {college.location}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {college.specialization && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${COLORS.primary}20`,
                            color: COLORS.primary,
                          }}
                        >
                          {college.specialization}
                        </span>
                      )}
                      {college.fees && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${COLORS.tertiary}20`,
                            color: COLORS.tertiary,
                          }}
                        >
                          {college.fees}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* College Recommendations Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" style={{ color: COLORS.primary }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
                Your College Recommendations
              </h2>
            </div>

            {!hasProfile ? (
              <div
                style={glassEffect}
                className="rounded-xl p-8 text-center"
              >
                <p style={{ color: COLORS.onSurfaceVariant }}>
                  Complete your profile to unlock AI-powered college recommendations
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colleges.map((college, index) => (
                  <div
                    key={index}
                    style={glassEffect}
                    className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-opacity-100 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <School className="w-5 h-5" style={{ color: COLORS.primary }} />
                      <ChevronRight
                        className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                        style={{ color: COLORS.onSurfaceVariant }}
                      />
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: COLORS.onSurface }}>
                      {college.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor:
                            college.category === 'AMBITIOUS'
                              ? `${COLORS.primary}20`
                              : `${COLORS.tertiary}20`,
                          color:
                            college.category === 'AMBITIOUS'
                              ? COLORS.primary
                              : COLORS.tertiary,
                        }}
                      >
                        {college.category}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${COLORS.onSurfaceVariant}15`,
                          color: COLORS.onSurfaceVariant,
                        }}
                      >
                        {college.branch}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Section ‚Äî filtered by target_degree */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" style={{ color: COLORS.primary }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
                Upcoming Deadlines
              </h2>
              <div
                className="w-2 h-2 rounded-full animate-pulse ml-1"
                style={{ backgroundColor: COLORS.error }}
              ></div>
            </div>
            {profileData?.target_degree && (
              <p className="text-sm mb-6" style={{ color: COLORS.onSurfaceVariant }}>
                Showing deadlines for <span style={{ color: COLORS.primary, fontWeight: 600 }}>{profileData.target_degree}</span>
              </p>
            )}
            {!profileData?.target_degree && (
              <p className="text-sm mb-6" style={{ color: COLORS.onSurfaceVariant }}>
                Complete your profile to see deadlines for your chosen course
              </p>
            )}

            <div className="space-y-4">
              {filteredDeadlines.length === 0 ? (
                <div style={glassEffect} className="rounded-xl p-6 text-center">
                  <p style={{ color: COLORS.onSurfaceVariant }}>
                    No upcoming deadlines found for your course. Check back later!
                  </p>
                </div>
              ) : (
                filteredDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    style={glassEffect}
                    className="rounded-xl p-4 flex gap-4 items-start"
                  >
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: index === 0 ? COLORS.error : COLORS.primary,
                        }}
                      ></div>
                      {index < filteredDeadlines.length - 1 && (
                        <div
                          className="w-0.5 h-8"
                          style={{
                            backgroundColor: `${COLORS.primary}40`,
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1" style={{ color: COLORS.onSurface }}>
                        {deadline.examName}
                      </h4>
                      <p className="text-sm mb-1" style={{ color: COLORS.onSurfaceVariant }}>
                        Registration closes: <span style={{ color: COLORS.primary }}>{deadline.registrationEnds}</span>
                      </p>
                      <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                        Exam date: <span style={{ color: COLORS.onSurface }}>{deadline.examDate}</span>
                      </p>
                    </div>
                    <a
                      href={deadline.linkToApply}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0"
                      style={{
                        backgroundColor: `${COLORS.primary}20`,
                        color: COLORS.primary,
                        border: `1px solid ${COLORS.primary}40`,
                      }}
                    >
                      Apply
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Tips Section */}
          <div
            style={{
              backgroundColor: COLORS.surfaceContainer,
              borderLeft: `4px solid ${COLORS.primary}`,
            }}
            className="rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.onSurface }}>
              Next Steps by Medha AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {aiTips.map((tip, index) => (
                <div key={index}>
                  <p
                    className="text-sm font-bold mb-2"
                    style={{ color: COLORS.primary }}
                  >
                    {tip.number}
                  </p>
                  <h3 className="font-bold mb-2" style={{ color: COLORS.onSurface }}>
                    {tip.title}
                  </h3>
                  <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-6 py-2 rounded-lg font-semibold transition-all duration-200"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.onPrimary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primaryContainer;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
            >
              Ask Medha AI
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

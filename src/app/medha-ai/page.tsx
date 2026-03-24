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
  const [followUpState, setFollowUpState] = useState<{
    questions: string[];
    currentIndex: number;
    answers: Record<number, string>;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const followUpTriggeredRef = useRef(false);

  const quickSuggestions = [
    'MBA colleges in Pune',
    'I want to build rockets but bad at maths',
    'Earn ‚Çπ25 LPA after 5 years',
    'Best engineering colleges in Delhi',
    'Entrepreneurship focused colleges',
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Fetch user profile from Supabase (admit_profiles table has the actual data)
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        // Map admit_profiles columns to our ProfileData interface
        setProfileData({
          target_degree: data.degree || '',
          target_field: data.program || '',
          target_state: data.target_state || [],
          name: data.name || user?.user_metadata?.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          academic_year: data.academic_year || '',
          budget: data.budget || [],
        });
        // Profile is complete if they've selected a degree
        const hasDegree = data.degree && data.degree.trim() !== '';
        setHasProfile(!!hasDegree);
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

  // Get deadlines filtered by user's target_degree (case-insensitive)
  const getFilteredDeadlines = () => {
    if (!profileData?.target_degree) return ALL_DEADLINES.slice(0, 3);
    const userDegree = profileData.target_degree.trim().toLowerCase();
    const filtered = ALL_DEADLINES.filter((d) =>
      d.degreeTypes.some((dt) => dt.toLowerCase() === userDegree)
    );
    return filtered.length > 0 ? filtered.slice(0, 5) : ALL_DEADLINES.slice(0, 3);
  };

  const filteredDeadlines = getFilteredDeadlines();

  // Dynamic recommendations based on user's target degree
  const getRecommendedColleges = () => {
    const degree = (profileData?.target_degree || '').toLowerCase();
    if (degree === 'mba') {
      return [
        { name: 'IIM Ahmedabad', category: 'AMBITIOUS', branch: 'Management' },
        { name: 'IIM Bangalore', category: 'AMBITIOUS', branch: 'Management' },
        { name: 'XLRI Jamshedpur', category: 'TARGET', branch: 'Management' },
      ];
    } else if (degree === 'b.tech') {
      return [
        { name: 'IIT Bombay', category: 'AMBITIOUS', branch: 'Computer Science' },
        { name: 'BITS Pilani', category: 'TARGET', branch: 'Electronics' },
        { name: 'NIT Trichy', category: 'TARGET', branch: 'Mechanical' },
      ];
    } else if (degree === 'medical' || degree === 'mbbs') {
      return [
        { name: 'AIIMS Delhi', category: 'AMBITIOUS', branch: 'Medicine' },
        { name: 'CMC Vellore', category: 'TARGET', branch: 'Medicine' },
        { name: 'JIPMER Puducherry', category: 'TARGET', branch: 'Medicine' },
      ];
    } else if (degree === 'law') {
      return [
        { name: 'NLSIU Bangalore', category: 'AMBITIOUS', branch: 'Law' },
        { name: 'NALSAR Hyderabad', category: 'TARGET', branch: 'Law' },
        { name: 'NLU Delhi', category: 'TARGET', branch: 'Law' },
      ];
    } else if (degree === 'bba/bms') {
      return [
        { name: 'IIM Indore (IPM)', category: 'AMBITIOUS', branch: 'Management' },
        { name: 'NMIMS Mumbai', category: 'TARGET', branch: 'Management' },
        { name: 'Christ University', category: 'TARGET', branch: 'Management' },
      ];
    } else {
      return [
        { name: 'Delhi University', category: 'AMBITIOUS', branch: profileData?.target_field || 'General' },
        { name: 'JNU Delhi', category: 'TARGET', branch: profileData?.target_field || 'General' },
        { name: 'BHU Varanasi', category: 'TARGET', branch: profileData?.target_field || 'General' },
      ];
    }
  };

  const colleges = getRecommendedColleges();

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

  // Extract follow-up questions from AI response text
  const extractFollowUps = (text: string): { mainText: string; questions: string[] } => {
    const questions: string[] = [];

    // Strategy 1: Split by newlines and find question lines
    const lines = text.split('\n');
    const mainLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith('?') && trimmed.length > 15 && trimmed.length < 150) {
        const cleaned = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+[.)]\s*/, '').replace(/\*\*/g, '');
        questions.push(cleaned);
      } else {
        mainLines.push(line);
      }
    }

    // Strategy 2: Also look for inline numbered questions in the text
    // Pattern: "1. Question? 2. Another question?" all on one line
    // Run this if Strategy 1 found fewer than 2 questions (might have missed inline ones)
    const inlinePattern = /\d+\.\s+([^?]+\?)/g;
    let match;
    const foundInline: string[] = [];
    while ((match = inlinePattern.exec(text)) !== null) {
      const q = match[1].trim().replace(/\*\*/g, '');
      if (q.length > 15 && q.length < 150) {
        foundInline.push(q);
      }
    }

    // Use inline results if they found more questions than Strategy 1
    if (foundInline.length >= 2 && foundInline.length > questions.length) {
      // Remove the numbered questions + trailing filler from the main text
      let cleanedText = text;
      for (const q of foundInline) {
        cleanedText = cleanedText.replace(new RegExp('\\d+\\.\\s*\\*{0,2}' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*\\\*/g, '\\*{0,2}') + '\\*{0,2}', 'g'), '');
      }
      cleanedText = cleanedText.replace(/\s{2,}/g, ' ').replace(/\s+([.,!])/g, '$1').trim();
      cleanedText = cleanedText.replace(/\s*(Once I have|Once you provide|With this information|Let me know|Please share|To help you best|We'll figure)[\s\S]*$/i, '').trim();

      return {
        mainText: cleanedText,
        questions: foundInline.slice(0, 3),
      };
    }

    // Otherwise use Strategy 1 results
    return {
      mainText: questions.length > 0 ? mainLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() : text,
      questions: questions.slice(0, 3),
    };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery('');
    setIsLoading(true);
    setFollowUpState(null);
    followUpTriggeredRef.current = false;
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
        body: JSON.stringify({
          messages: newMessages,
          profileContext: profileData ? {
            degree: profileData.target_degree,
            field: profileData.target_field,
            state: profileData.target_state,
          } : null,
        }),
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
    setFollowUpState(null);
    followUpTriggeredRef.current = false;
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Generate smart options for follow-up questions based on question content
  const generateOptions = (question: string): string[] => {
    const q = question.toLowerCase();

    // MBA specialization — must check BEFORE generic field/branch
    if (q.includes('specializ') || q.includes('concentration') || (q.includes('mba') && (q.includes('which') || q.includes('area') || q.includes('interest')))) {
      return ['Finance', 'Marketing', 'HR', 'Operations', 'Business Analytics', 'IT & Systems', 'General Management', 'Other'];
    }
    // Entrance exams
    if (q.includes('entrance exam') || q.includes('preparing for') || q.includes('appeared for') || q.includes('which exam')) {
      return ['CAT', 'XAT', 'GMAT', 'SNAP', 'NMAT', 'MAT', 'CMAT', 'Other'];
    }
    // Score / rank / percentile
    if (q.includes('score') || q.includes('rank') || q.includes('percentile') || q.includes('marks')) {
      return ['Haven\'t taken yet', 'Below 50th percentile', '50th-70th percentile', '70th-85th percentile', '85th-95th percentile', '95th+ percentile'];
    }
    // Work experience (common MBA question)
    if (q.includes('work experience') || q.includes('years of experience') || q.includes('working professional')) {
      return ['Fresher (0 years)', '1-2 years', '3-5 years', '5+ years'];
    }
    // Budget / fees
    if (q.includes('budget') || q.includes('fee') || q.includes('afford') || q.includes('cost')) {
      return ['Under ₹5 Lakh', '₹5-10 Lakh', '₹10-20 Lakh', '₹20 Lakh+', 'No constraint'];
    }
    // Location / city
    if (q.includes('location') || q.includes('city') || q.includes('region') || (q.includes('where') && q.includes('prefer'))) {
      return ['Delhi NCR', 'Mumbai / Pune', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Anywhere in India'];
    }
    // College type preference
    if (q.includes('type of college') || q.includes('iim') || q.includes('private') || q.includes('government') || q.includes('tier')) {
      return ['IIMs only', 'Top 20 B-Schools', 'Government colleges', 'Private colleges (good ROI)', 'Open to all'];
    }
    // Placement / salary expectation
    if (q.includes('placement') || q.includes('salary') || q.includes('package') || q.includes('ctc') || q.includes('lpa')) {
      return ['₹8-12 LPA', '₹12-20 LPA', '₹20-30 LPA', '₹30 LPA+', 'Not the top priority'];
    }
    // Engineering branches (for B.Tech queries)
    if (q.includes('branch') || q.includes('engineering') || (q.includes('stream') && !q.includes('mba'))) {
      return ['Computer Science / IT', 'Mechanical', 'Electrical / Electronics', 'Aerospace', 'Civil', 'Chemical', 'Biotech', 'Other'];
    }
    // Class / grade (for UG queries)
    if (q.includes('class') || q.includes('grade') || q.includes('currently in') || q.includes('which year')) {
      return ['Class 11', 'Class 12 / Just appeared', 'Graduated', 'Working professional'];
    }
    // Priority / what matters most
    if (q.includes('priority') || q.includes('important') || q.includes('matters most') || q.includes('looking for in')) {
      return ['Placements & ROI', 'Brand name & ranking', 'Location', 'Affordable fees', 'Specialization strength'];
    }
    // Default: no options, user will type freely
    return [];
  };

  // Handle answer selection in follow-up card
  const handleFollowUpAnswer = (answer: string) => {
    if (!followUpState) return;
    const newAnswers = { ...followUpState.answers, [followUpState.currentIndex]: answer };
    const nextIndex = followUpState.currentIndex + 1;

    if (nextIndex >= followUpState.questions.length) {
      // All questions answered — compile and send as a single message
      const compiled = followUpState.questions
        .map((q, i) => `${q} ${newAnswers[i] || 'Skipped'}`)
        .join('\n');
      setFollowUpState(null);
      handleSearch(compiled);
    } else {
      setFollowUpState({ ...followUpState, currentIndex: nextIndex, answers: newAnswers });
    }
  };

  // Skip current follow-up question
  const handleFollowUpSkip = () => {
    if (!followUpState) return;
    const nextIndex = followUpState.currentIndex + 1;
    if (nextIndex >= followUpState.questions.length) {
      // All done — send whatever we have
      const compiled = followUpState.questions
        .map((q, i) => `${q} ${followUpState.answers[i] || 'Skipped'}`)
        .join('\n');
      setFollowUpState(null);
      handleSearch(compiled);
    } else {
      setFollowUpState({ ...followUpState, currentIndex: nextIndex });
    }
  };

  // Close follow-up card entirely
  const handleFollowUpClose = () => {
    setFollowUpState(null);
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
                ) : (() => {
                  const lastMsg = messages[messages.length - 1]?.content || '';
                  const { mainText, questions } = extractFollowUps(lastMsg);

                  // Trigger follow-up card mode if questions found and not already triggered
                  if (questions.length > 0 && !followUpState && !isLoading && !followUpTriggeredRef.current) {
                    followUpTriggeredRef.current = true;
                    setTimeout(() => {
                      setFollowUpState({
                        questions,
                        currentIndex: 0,
                        answers: {},
                      });
                    }, 600);
                  }

                  return (
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.primary }} />
                      <div className="flex-1">
                        <div
                          className="prose prose-invert text-sm max-w-none"
                          style={{ color: COLORS.onSurface }}
                          dangerouslySetInnerHTML={{
                            __html: formatResponse(mainText),
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Follow-up Question Card (Claude-style, one at a time) */}
                {followUpState && !isLoading && (
                  <div
                    className="mt-4 rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: COLORS.surfaceContainerHigh,
                      border: `1px solid ${COLORS.primary}30`,
                    }}
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: `1px solid ${COLORS.primary}20` }}
                    >
                      <p className="text-sm font-medium" style={{ color: COLORS.onSurface }}>
                        {followUpState.questions[followUpState.currentIndex]}
                      </p>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        {/* Navigation: prev */}
                        <button
                          onClick={() => followUpState.currentIndex > 0 && setFollowUpState({
                            ...followUpState,
                            currentIndex: followUpState.currentIndex - 1,
                          })}
                          disabled={followUpState.currentIndex === 0}
                          className="text-xs"
                          style={{
                            color: followUpState.currentIndex === 0
                              ? COLORS.onSurfaceVariant + '40'
                              : COLORS.onSurfaceVariant,
                            cursor: followUpState.currentIndex === 0 ? 'default' : 'pointer',
                          }}
                        >
                          &lt;
                        </button>
                        <span className="text-xs" style={{ color: COLORS.onSurfaceVariant }}>
                          {followUpState.currentIndex + 1} of {followUpState.questions.length}
                        </span>
                        {/* Navigation: next */}
                        <button
                          onClick={() => followUpState.currentIndex < followUpState.questions.length - 1 && setFollowUpState({
                            ...followUpState,
                            currentIndex: followUpState.currentIndex + 1,
                          })}
                          disabled={followUpState.currentIndex === followUpState.questions.length - 1}
                          className="text-xs"
                          style={{
                            color: followUpState.currentIndex === followUpState.questions.length - 1
                              ? COLORS.onSurfaceVariant + '40'
                              : COLORS.onSurfaceVariant,
                            cursor: followUpState.currentIndex === followUpState.questions.length - 1 ? 'default' : 'pointer',
                          }}
                        >
                          &gt;
                        </button>
                        {/* Close button */}
                        <button
                          onClick={handleFollowUpClose}
                          className="text-xs ml-1"
                          style={{ color: COLORS.onSurfaceVariant }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="px-3 py-2 space-y-1">
                      {generateOptions(followUpState.questions[followUpState.currentIndex]).map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUpAnswer(option)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150"
                          style={{
                            color: COLORS.onSurface,
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${COLORS.primary}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              backgroundColor: `${COLORS.primary}20`,
                              color: COLORS.primary,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span>{option}</span>
                          <ChevronRight
                            className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0"
                            style={{ color: COLORS.onSurfaceVariant }}
                          />
                        </button>
                      ))}

                      {/* "Something else" / free-text option */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                          ✏️
                        </span>
                        <input
                          type="text"
                          placeholder="Something else..."
                          className="flex-1 bg-transparent text-sm outline-none"
                          style={{
                            color: COLORS.onSurface,
                            borderBottom: `1px solid ${COLORS.primary}30`,
                            paddingBottom: '4px',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              handleFollowUpAnswer((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Skip button */}
                    <div
                      className="flex justify-end px-4 py-2"
                      style={{ borderTop: `1px solid ${COLORS.primary}10` }}
                    >
                      <button
                        onClick={handleFollowUpSkip}
                        className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                        style={{
                          color: COLORS.onSurfaceVariant,
                          backgroundColor: `${COLORS.surfaceContainer}`,
                          border: `1px solid ${COLORS.primary}20`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${COLORS.primary}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.surfaceContainer;
                        }}
                      >
                        Skip
                      </button>
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

// minor fix

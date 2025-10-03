"use client"; 
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, User, BookOpen, DollarSign, Calendar, Users, Home, GraduationCap, Award, Trophy, Building2, Filter, LogOut } from 'lucide-react';

// Type definitions
interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: UserData) => void;
}

interface Course {
  id: number;
  university: string;
  location: string;
  program: string;
  qsRank: number;
  tuition: string;
  deadline: string;
  verified: boolean;
  logo: string;
}

interface Scholarship {
  id: number;
  name: string;
  description: string;
  amount: string;
  deadline: string;
}

interface AdmitProfile {
  id: number;
  name: string;
  gre?: number;
  toefl?: number;
  ielts?: number;
  term: string;
  university: string;
  program: string;
  apps: number;
  avatar: 'S' | 'G';
  verified: boolean;
}

// Auth Modal Component
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('Google Sign-In: In production, this will redirect to Google OAuth');
  };

  const handleEmailAuth = async () => {
    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const mockUser: UserData = {
        id: Date.now().toString(),
        email,
        full_name: isLogin ? email.split('@')[0] : fullName,
        avatar_url: null
      };
      onAuthSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join EduPortal'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue your journey' : 'Start your study abroad journey today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-semibold">Continue with Google</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-red-600 text-white rounded-lg py-3 px-4 font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-red-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudyAbroadPortal = () => {
  const [activeSection, setActiveSection] = useState<'course-finder' | 'admit-finder' | 'scholarship-finder'>('course-finder');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setShowAuthModal(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setShowUserMenu(false);
    setShowAuthModal(true);
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = (): string => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const toggleSaveScholarship = (scholarshipId: number) => {
    setSavedScholarships(prev => 
      prev.includes(scholarshipId) 
        ? prev.filter(id => id !== scholarshipId)
        : [...prev, scholarshipId]
    );
  };

  const coursesData: Course[] = [
    {
      id: 1,
      university: 'Harvard University',
      location: 'Massachusetts, United States',
      program: 'PhD in Computer Science',
      qsRank: 4,
      tuition: '$39,517',
      deadline: '03 Dec 2024',
      verified: true,
      logo: '🎓'
    },
    {
      id: 2,
      university: 'Stanford University',
      location: 'California, United States',
      program: 'Master of Science in Computer Science',
      qsRank: 6,
      tuition: '$40,000',
      deadline: '03 Dec 2024',
      verified: true,
      logo: '🌲'
    }
  ];

  const scholarshipsData: Scholarship[] = [
    {
      id: 1,
      name: 'Mildred Lippincott Memorial Scholarship',
      description: 'To be eligible for the Mildred Lippincott Memorial Scholarship, applicants must be enrolled in a Journalism program at the University of North Dakota...',
      amount: 'Variable Funding',
      deadline: '01 Mar 2025'
    },
    {
      id: 2,
      name: 'Education Future International Scholarship',
      description: 'Eligibility Criteria for Education Future International Scholarship - To be eligible for the Education Future International Scholarship, applicants must...',
      amount: 'Variable Funding',
      deadline: '31 Jan, 2025'
    },
    {
      id: 3,
      name: 'Greater Than Gatsby Scholarship',
      description: 'Eligibility Criteria for Greater Than Gatsby Scholarship - To be eligible for the Greater Than Gatsby Scholarship, applicants must be recently accepted...',
      amount: 'Variable Funding',
      deadline: '01 May 2025'
    },
    {
      id: 4,
      name: 'Robert Campbell Scholarship',
      description: 'To be eligible for the Robert Campbell Scholarship, applicants must be high school graduates seeking admission to the University of North Dakota...',
      amount: 'Variable Funding',
      deadline: '01 Mar 2025'
    }
  ];

  const admitProfilesData: AdmitProfile[] = [
    {
      id: 1,
      name: 'Siddhi P',
      gre: 305,
      toefl: 107,
      term: 'Fall 2024',
      university: 'Rochester Institute of Technology',
      program: 'Computer Science',
      apps: 5,
      avatar: 'S',
      verified: true
    },
    {
      id: 2,
      name: 'Sai K',
      gre: 315,
      toefl: 105,
      term: 'Winter 2024',
      university: 'University of Wisconsin',
      program: 'Computer Science',
      apps: 2,
      avatar: 'S',
      verified: true
    },
    {
      id: 3,
      name: 'geetha g',
      gre: 331,
      ielts: 8.0,
      term: 'Fall 2024',
      university: 'New York University',
      program: 'Computer Engineering',
      apps: 7,
      avatar: 'G',
      verified: false
    }
  ];

  const Sidebar = () => (
    <div className="w-64 bg-pink-50 h-screen p-4 border-r border-pink-200">
      <div className="flex items-center gap-2 mb-8">
        <div className="text-2xl font-bold text-red-600">EduPortal</div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="text-sm">Welcome,</div>
        <div className="text-red-600 font-semibold">{getDisplayName()}</div>
      </div>
      
      <nav className="space-y-2">
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <Home size={18} />
          <span>Home</span>
        </button>
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <User size={18} />
          <span>Ask AI</span>
        </button>
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <User size={18} />
          <span>Profile Analyzer</span>
        </button>
        
        <div className="mt-4 mb-2 text-xs font-semibold text-red-600 uppercase">Explore</div>
        
        <button 
          onClick={() => setActiveSection('course-finder')}
          className={`flex items-center gap-3 p-2 w-full text-left rounded-lg ${
            activeSection === 'course-finder' ? 'bg-white' : 'hover:bg-white'
          }`}
        >
          <BookOpen size={18} />
          <span>Course Finder</span>
        </button>
        
        <button 
          onClick={() => setActiveSection('admit-finder')}
          className={`flex items-center gap-3 p-2 w-full text-left rounded-lg ${
            activeSection === 'admit-finder' ? 'bg-white' : 'hover:bg-white'
          }`}
        >
          <Users size={18} />
          <span>Admit Finder</span>
        </button>
        
        <button 
          onClick={() => setActiveSection('scholarship-finder')}
          className={`flex items-center gap-3 p-2 w-full text-left rounded-lg ${
            activeSection === 'scholarship-finder' ? 'bg-white' : 'hover:bg-white'
          }`}
        >
          <DollarSign size={18} />
          <span>Scholarship Finder</span>
        </button>
        
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <Building2 size={18} />
          <span>Shortlist Builder</span>
        </button>
        
        <div className="mt-4 mb-2 text-xs font-semibold text-red-600 uppercase">Applications</div>
        
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <GraduationCap size={18} />
          <span>Manage Shortlist</span>
        </button>
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <BookOpen size={18} />
          <span>Application Builder</span>
        </button>
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <Award size={18} />
          <span>Manage Applications</span>
        </button>
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <Trophy size={18} />
          <span>Guidance</span>
        </button>
        
        <div className="mt-4 mb-2 text-xs font-semibold text-red-600 uppercase">Post Admit</div>
        
        <button className="flex items-center gap-3 p-2 w-full text-left hover:bg-white rounded-lg">
          <GraduationCap size={18} />
          <span>Finalise Admits</span>
        </button>
      </nav>
    </div>
  );

  const CourseFinder = () => (
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Find Your Perfect Course</h1>
        <p className="text-gray-600">Explore a world of opportunities with our comprehensive course database.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Sort By</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Universities</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Countries</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Courses</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <button className="border-2 border-red-600 text-red-600 rounded-lg px-4 py-2">
          <Filter size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for courses and universities"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-red-600" size={20} />
          <span className="font-semibold">2051 courses found</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              showVerifiedOnly ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {coursesData.map((course) => (
          <div key={course.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{course.logo}</div>
                <div>
                  <h3 className="font-semibold text-lg">{course.university}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>🇺🇸</span>
                    <span>{course.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {course.verified && (
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <button className="text-gray-400 hover:text-red-600">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="text-gray-400" size={16} />
                <span className="text-sm">Program Name</span>
              </div>
              <p className="font-semibold">{course.program}</p>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Trophy size={16} />
                    <span>QS Rank</span>
                  </div>
                  <p className="font-semibold">{course.qsRank}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <DollarSign size={16} />
                    <span>Total Tuition Fees</span>
                  </div>
                  <p className="font-semibold">{course.tuition}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>Deadline</span>
                  </div>
                  <p className="font-semibold">{course.deadline}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Add to Compare</span>
                </label>
                <button className="flex-1 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Users size={16} />
                  View Top Admits
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AdmitFinder = () => (
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access 375K+ Admits & Rejects!</h1>
        <p className="text-gray-600">Find folks at your dream school with the same background, interests, and stats as you</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Target University</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Application Status</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Intended Major</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <button className="border-2 border-red-600 text-red-600 rounded-lg px-4 py-2">
          <Filter size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for courses and university"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-red-600" size={20} />
          <span className="font-semibold">89,775 profiles found</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              showVerifiedOnly ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {admitProfilesData.map((profile) => (
          <div key={profile.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${
                  profile.avatar === 'S' ? 'bg-purple-600' : 'bg-green-600'
                } text-white flex items-center justify-center font-bold text-lg`}>
                  {profile.avatar}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-1">
                    {profile.name}
                    {profile.verified && (
                      <span className="text-red-600">👑</span>
                    )}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{profile.term}</span>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              {profile.gre && (
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen size={14} />
                    <span>GRE</span>
                  </div>
                  <p className="font-bold text-lg">{profile.gre}</p>
                </div>
              )}
              {profile.toefl && (
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen size={14} />
                    <span>TOEFL</span>
                  </div>
                  <p className="font-bold text-lg">{profile.toefl}</p>
                </div>
              )}
              {profile.ielts && (
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen size={14} />
                    <span>IELTS</span>
                  </div>
                  <p className="font-bold text-lg">{profile.ielts}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-gray-400" />
                <span className="text-sm font-semibold">{profile.university}</span>
              </div>
              <div className="text-sm text-gray-600">{profile.program}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Apps.</span>
                <span className="font-semibold">{profile.apps}</span>
              </div>
            </div>

            <button className="w-full border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 flex items-center justify-center gap-2">
              <User size={16} />
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ScholarshipFinder = () => (
    <div className="flex-1 bg-white p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Find Scholarships to Fuel Your Dreams</h1>
          <p className="text-gray-600">Discover your path to financial support with our scholarship finder tool.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
          <Heart className="text-red-600" size={18} />
          <span>Saved Scholarships</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Sort By</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Country</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Level of Study</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Deadline</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for scholarships"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="text-red-600" size={20} />
          <span className="font-semibold">3504 scholarships found</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              showVerifiedOnly ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {scholarshipsData.map((scholarship) => (
          <div key={scholarship.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{scholarship.name}</h3>
              <button 
                onClick={() => toggleSaveScholarship(scholarship.id)}
                className={`${
                  savedScholarships.includes(scholarship.id) 
                    ? 'text-red-600' 
                    : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <Heart 
                  size={24} 
                  fill={savedScholarships.includes(scholarship.id) ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {scholarship.description}
            </p>

            <div className="flex gap-8">
              <div className="flex items-start gap-2">
                <DollarSign className="text-red-600 mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold">{scholarship.amount}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="text-red-600 mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="font-semibold">{scholarship.deadline}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Postgraduate</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold hover:shadow-lg transition-shadow"
            >
              {getInitials(user?.full_name)}
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {activeSection === 'course-finder' && <CourseFinder />}
        {activeSection === 'admit-finder' && <AdmitFinder />}
        {activeSection === 'scholarship-finder' && <ScholarshipFinder />}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {}} 
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default StudyAbroadPortal
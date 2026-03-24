/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
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
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  response: string;
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

export default function MedhaAIDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const quickSuggestions = [
    'MBA colleges in Pune',
    'I want to build rockets',
    'Colleges for ‚Çπ25 LPA salary',
    'Best engineering colleges in Delhi',
  ];

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

  const shortlistedColleges = [
    { name: 'IIT Delhi', location: 'New Delhi', branch: 'CSE' },
    { name: 'IISER Pune', location: 'Pune', branch: 'Physics' },
  ];

  const upcomingDeadlines = [
    {
      date: 'APR 15, 2026',
      title: 'JEE Advanced Registration Closes',
      subtitle: 'Action Required: Upload EWS Cert',
      urgent: true,
    },
    {
      date: 'MAY 02, 2026',
      title: 'VITEEE Slot Booking',
      subtitle: 'Scheduled for Automated Alert',
      urgent: false,
    },
    {
      date: 'JUN 10, 2026',
      title: 'JoSAA Counseling Phase 1',
      subtitle: 'Mark your calendar',
      urgent: false,
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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: COLORS.onSurface }}>
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

          {/* AI Search Bar */}
          <div className="space-y-4">
            <div
              style={glassEffect}
              className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-opacity-20"
            >
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.primary }} />
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
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: COLORS.onSurface }}
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
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

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.surfaceContainerHigh,
                    color: COLORS.onSurfaceVariant,
                    border: `1px solid ${COLORS.primary}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                    e.currentTarget.style.color = COLORS.onPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.surfaceContainerHigh;
                    e.currentTarget.style.color = COLORS.onSurfaceVariant;
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.onSurface }}>
                    Complete your profile
                  </h3>
                  <p style={{ color: COLORS.onSurfaceVariant }}>
                    Get personalized college recommendations from Medha AI
                  </p>
                </div>
                <button
                  onClick={() => setHasProfile(true)}
                  className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ml-4"
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
                      92% Match Score
                    </p>
                  </div>
                </div>
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

          {/* My Shortlist Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
                My Shortlist
              </h2>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.onPrimary,
                }}
              >
                {shortlistedColleges.length}
              </span>
            </div>

            {shortlistedColleges.length === 0 ? (
              <div
                style={glassEffect}
                className="rounded-xl p-8 text-center"
              >
                <p style={{ color: COLORS.onSurfaceVariant }}>
                  No colleges shortlisted yet. Use the search to discover colleges!
                </p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {shortlistedColleges.map((college, index) => (
                  <div
                    key={index}
                    style={glassEffect}
                    className="rounded-xl p-4 flex-shrink-0 w-64 transition-all duration-200 hover:border-opacity-100"
                  >
                    <h3 className="font-bold mb-1" style={{ color: COLORS.onSurface }}>
                      {college.name}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: COLORS.onSurfaceVariant }}>
                      {college.location}
                    </p>
                    <span
                      className="text-xs px-2 py-1 rounded inline-block"
                      style={{
                        backgroundColor: `${COLORS.primary}20`,
                        color: COLORS.primary,
                      }}
                    >
                      {college.branch}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
                Upcoming Deadlines
              </h2>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.error }}
              ></div>
            </div>

            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  style={glassEffect}
                  className="rounded-xl p-4 flex gap-4"
                >
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: deadline.urgent
                          ? COLORS.error
                          : COLORS.primary,
                      }}
                    ></div>
                    {index < upcomingDeadlines.length - 1 && (
                      <div
                        className="w-0.5 h-8"
                        style={{
                          backgroundColor: `${COLORS.primary}40`,
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{
                        color: deadline.urgent
                          ? COLORS.error
                          : COLORS.primary,
                      }}
                    >
                      {deadline.date}
                    </p>
                    <h4 className="font-bold mb-1" style={{ color: COLORS.onSurface }}>
                      {deadline.title}
                    </h4>
                    <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                      {deadline.subtitle}
                    </p>
                  </div>
                </div>
              ))}
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
              Execute AI Roadmap
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';
import { StudentProfile, CollegeSignal, Match, SignalType } from '../types';
import { StudentCard } from '../components/college/StudentCard';
import { computeFitScore } from '../lib/fitScore';
import { Heart, Trophy, Zap, Search } from 'lucide-react';

interface TabType {
  id: 'browse' | 'matches' | 'settings';
  label: string;
}

export default function CollegeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'matches' | 'settings'>('browse');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [collegeSignals, setCollegeSignals] = useState<Map<string, CollegeSignal>>(new Map());
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  // Filter states
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [dnaTypeFilter, setDnaTypeFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');

  // Fetch college ID from profiles
  useEffect(() => {
    if (!user) return;

    const fetchCollegeId = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('college_id')
        .eq('id', user.id)
        .single();

      if (profile?.college_id) {
        setCollegeId(profile.college_id);
      }
    };

    fetchCollegeId();
  }, [user]);

  // Fetch students, signals, and matches
  useEffect(() => {
    if (!collegeId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch all students
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('active', true);

        if (studentsData) {
          setStudents(studentsData as StudentProfile[]);
        }

        // Fetch existing signals for this college
        const { data: signalsData } = await supabase
          .from('college_signals')
          .select('*')
          .eq('college_id', collegeId);

        if (signalsData) {
          const signalMap = new Map<string, CollegeSignal>();
          signalsData.forEach((signal: CollegeSignal) => {
            signalMap.set(signal.studentId, signal);
          });
          setCollegeSignals(signalMap);
        }

        // Fetch matches for this college
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            *,
            student:students(*),
            college:colleges(*)
          `)
          .eq('college_id', collegeId)
          .order('created_at', { ascending: false });

        if (matchesData) {
          setMatches(matchesData as Match[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collegeId]);

  // Filter students based on criteria
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fitScore = computeFitScore(student, {} as any);

      if (fitScore < scoreRange[0] || fitScore > scoreRange[1]) return false;
      if (dnaTypeFilter && student.dnaType !== dnaTypeFilter) return false;
      if (cityFilter && !student.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (streamFilter && student.stream !== streamFilter) return false;
      if (degreeFilter && student.targetDegree !== degreeFilter) return false;

      return true;
    });
  }, [students, scoreRange, dnaTypeFilter, cityFilter, streamFilter, degreeFilter]);

  // Handle signal sending
  const handleSignal = async (studentId: string, signalType: SignalType) => {
    if (!collegeId) return;

    try {
      const existingSignal = collegeSignals.get(studentId);

      // Check if upgrade is valid
      const signalOrder = ['like', 'scholarship_watch', 'priority_interview'];
      if (existingSignal) {
        const currentIndex = signalOrder.indexOf(existingSignal.signalType as string);
        const newIndex = signalOrder.indexOf(signalType);

        // Prevent downgrade (only allow upgrades or same signal)
        if (newIndex < currentIndex && signalType !== 'under_review') {
          alert('You cannot downgrade a signal. Upgrade or send a different signal.');
          return;
        }
      }

      // Upsert signal
      const { data: signalData, error: signalError } = await supabase
        .from('college_signals')
        .upsert(
          {
            college_id: collegeId,
            student_id: studentId,
            signal_type: signalType,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'college_id,student_id' }
        )
        .select()
        .single();

      if (signalError) throw signalError;

      // Update local state
      const updatedSignals = new Map(collegeSignals);
      if (signalData) {
        updatedSignals.set(studentId, signalData as CollegeSignal);
      }
      setCollegeSignals(updatedSignals);

      // Check for mutual match (if student has also signaled this college)
      const { data: studentSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('student_id', studentId)
        .eq('college_id', collegeId)
        .eq('direction', 'right')
        .single();

      if (studentSwipe) {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('student_id', studentId)
          .eq('college_id', collegeId)
          .single();

        if (!existingMatch) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              student_id: studentId,
              college_id: collegeId,
              match_type: 'mutual',
              signal_type: signalType,
              created_at: new Date().toISOString(),
            });

          // Refresh matches
          const { data: updatedMatches } = await supabase
            .from('matches')
            .select(`
              *,
              student:students(*),
              college:colleges(*)
            `)
            .eq('college_id', collegeId)
            .order('created_at', { ascending: false });

          if (updatedMatches) {
            setMatches(updatedMatches as Match[]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending signal:', error);
      alert('Failed to send signal. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading...</div>
      </div>
    );
  }

  if (!collegeId) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No College Linked</h2>
          <p className="text-[#888]">Please link a college to your account to use the dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs: TabType[] = [
    { id: 'browse', label: 'Browse Students' },
    { id: 'matches', label: 'Matches' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] sticky top-0 z-40 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">
              <span className="text-[#a855f7]">CampusMatch</span> â College Dashboard
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-[#2a2a2a]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#a855f7] border-b-2 border-[#a855f7]'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 space-y-4">
              <h3 className="text-white font-semibold mb-4">Filters</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Score Range */}
                <div>
                  <label className="block text-sm font-medium text-[#aaa] mb-2">
                    Fit Score Range: {scoreRange[0]} - {scoreRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreRange[1]}
                    onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* DNA Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#aaa] mb-2">DNA Type</label>
                  <select
                    value={dnaTypeFilter}
                    onChange={(e) => setDnaTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-[#3a3a3a] focus:border-[#a855f7] focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="Explorer">Explorer</option>
                    <option value="Builder">Builder</option>
                    <option value="Scholar">Scholar</option>
                    <option value="Leader">Leader</option>
                    <option value="Creator">Creator</option>
                    <option value="Connector">Connector</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#aaa] mb-2">City</label>
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="Filter by city..."
                    className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-[#3a3a3a] focus:border-[#a855f7] focus:outline-none placeholder-[#666]"
                  />
                </div>

                {/* Stream Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#aaa] mb-2">Stream</label>
                  <select
                    value={streamFilter}
                    onChange={(e) => setStreamFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-[#3a3a3a] focus:border-[#a855f7] focus:outline-none"
                  >
                    <option value="">All Streams</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">Humanities</option>
                  </select>
                </div>

                {/* Degree Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#aaa] mb-2">Target Degree</label>
                  <select
                    value={degreeFilter}
                    onChange={(e) => setDegreeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-[#3a3a3a] focus:border-[#a855f7] focus:outline-none"
                  >
                    <option value="">All Degrees</option>
                    <option value="BTech">B.Tech</option>
                    <option value="BA">B.A.</option>
                    <option value="BComm">B.Comm</option>
                    <option value="BBA">BBA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="text-[#aaa]">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </div>

            {/* Student Cards Grid */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-[#3a3a3a] mx-auto mb-4" />
                <p className="text-[#888]">No students found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStudents.map((student) => {
                  const fitScore = computeFitScore(student, {} as any);
                  const existingSignal = collegeSignals.get(student.id);

                  return (
                    <StudentCard
                      key={student.id}
                      student={student}
                      fitScore={fitScore}
                      existingSignal={existingSignal}
                      onSignal={(signalType) => handleSignal(student.id, signalType)}
                      ghostMode={student.ghostMode}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your Matches</h2>

            {matches.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-[#3a3a3a] mx-auto mb-4" />
                <p className="text-[#888]">No matches yet. Keep browsing students!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {match.student?.fullName || 'Anonymous Student'}
                        </h3>
                        <p className="text-sm text-[#888] mt-1">
                          {match.student?.stream} â¢ {match.student?.city}
                        </p>
                        {match.icebreakerText && (
                          <p className="text-[#aaa] mt-3 italic">"{match.icebreakerText}"</p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#2a2a2a] text-[#a855f7] text-sm font-medium">
                          {match.matchType === 'mutual' ? (
                            <>
                              <Heart className="w-4 h-4" />
                              Mutual
                            </>
                          ) : (
                            'Match'
                          )}
                        </div>
                        {match.signalType && (
                          <div className="text-xs text-[#888] mt-2 capitalize">
                            {match.signalType.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
              <p className="text-[#888]">College settings coming soon.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

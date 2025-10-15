"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, Users, User, Building2, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdmitProfile {
  id: number;
  name: string;
  gre?: number;
  toefl?: number;
  ielts?: number;
  term: string;
  university: string;
  program: string;
  applications_count: number;
  avatar_type: 'S' | 'G';
  verified: boolean;
}

const AdmitFinder: React.FC = () => {
  const [profiles, setProfiles] = useState<AdmitProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, [showVerifiedOnly, searchQuery, selectedUniversity, selectedMajor]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let query = supabase.from('admit_profiles').select('*');

      if (showVerifiedOnly) {
        query = query.eq('verified', true);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%`);
      }

      if (selectedUniversity) {
        query = query.eq('university', selectedUniversity);
      }

      if (selectedMajor) {
        query = query.ilike('program', `%${selectedMajor}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching admit profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access 375K+ Admits & Rejects!</h1>
        <p className="text-gray-600">Find folks at your dream school with the same background, interests, and stats as you</p>
      </div>

      {/* Updated Filter Section */}
      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
          >
            <option value="">Target University</option>
            <option>University of Texas at Dallas</option>
            <option>Northeastern University</option>
            <option>Carnegie Mellon University</option>
            <option>University of Florida</option>
            <option>University of Southern California</option>
            <option>Purdue University</option>
            <option>Stanford University</option>
            <option>Massachusetts Institute of Technology</option>
            <option>Columbia University</option>
            <option>Harvard University</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Application Status</option>
            <option>Admitted</option>
            <option>Rejected</option>
            <option>Waitlisted</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
          >
            <option value="">Intended Major</option>
            <option>Computer Science</option>
            <option>Data Science</option>
            <option>Electrical Engineering</option>
            <option>Mechanical Engineering</option>
            <option>Bioinformatics</option>
            <option>Finance</option>
            <option>Public Health</option>
            <option>Robotics</option>
            <option>Machine Learning</option>
            <option>Architecture</option>
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

      {/* Everything below remains unchanged */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-red-600" size={20} />
          <span className="font-semibold">{profiles.length} profiles found</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profiles...</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${
                    profile.avatar_type === 'S' ? 'bg-purple-600' : 'bg-green-600'
                  } text-white flex items-center justify-center font-bold text-lg`}>
                    {profile.avatar_type}
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
                  <span className="font-semibold">{profile.applications_count}</span>
                </div>
              </div>

              <button className="w-full border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 flex items-center justify-center gap-2">
                <User size={16} />
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-gray-500">University View</span>
        <button
          className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1`} />
        </button>
      </div>
    </div>
  );
};

export default AdmitFinder;

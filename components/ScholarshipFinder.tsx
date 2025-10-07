"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, DollarSign, Calendar, Award } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Scholarship {
  id: number;
  name: string;
  description: string;
  amount: string;
  deadline: string;
  country: string;
  level_of_study: string;
  verified: boolean;
}

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedScholarships, setSavedScholarships] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchScholarships();
    if (user) {
      fetchSavedScholarships();
    }
  }, [showVerifiedOnly, searchQuery, selectedCountry, selectedLevel, user]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      let query = supabase.from('scholarships').select('*');

      if (showVerifiedOnly) {
        query = query.eq('verified', true);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCountry) {
        query = query.eq('country', selectedCountry);
      }

      if (selectedLevel) {
        query = query.eq('level_of_study', selectedLevel);
      }

      const { data, error } = await query.order('deadline', { ascending: true });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedScholarships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedScholarships(data?.map(item => item.scholarship_id) || []);
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
    }
  };

  const toggleSaveScholarship = async (scholarshipId: number) => {
    if (!user) {
      alert('Please login to save scholarships');
      return;
    }

    const isSaved = savedScholarships.includes(scholarshipId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarshipId);

        if (error) throw error;
        setSavedScholarships(prev => prev.filter(id => id !== scholarshipId));
      } else {
        const { error } = await supabase
          .from('saved_scholarships')
          .insert({ user_id: user.id, scholarship_id: scholarshipId });

        if (error) throw error;
        setSavedScholarships(prev => [...prev, scholarshipId]);
      }
    } catch (error) {
      console.error('Error toggling scholarship save:', error);
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 bg-white p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Find Scholarships to Fuel Your Dreams</h1>
          <p className="text-gray-600">Discover your path to financial support with our scholarship finder tool.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
          <Heart className="text-red-600" size={18} />
          <span>Saved Scholarships ({savedScholarships.length})</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Sort By</option>
            <option>Deadline</option>
            <option>Amount</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>International</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Level of Study</option>
            <option>Undergraduate</option>
            <option>Postgraduate</option>
            <option>All Levels</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Deadline</option>
            <option>This Month</option>
            <option>Next 3 Months</option>
            <option>Next 6 Months</option>
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
          <span className="font-semibold">{scholarships.length} scholarships found</span>
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
          <div className="text-gray-500">Loading scholarships...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {scholarships.map((scholarship) => (
            <div key={scholarship.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                <button 
                  onClick={() => toggleSaveScholarship(scholarship.id)}
                  className={`transition-colors ${
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
                    <p className="font-semibold">{formatDeadline(scholarship.deadline)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipFinder;
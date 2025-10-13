"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, Calendar, Users, GraduationCap, Trophy, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Course {
  id: number;
  university: string;
  location: string;
  program: string;
  qs_rank: number;
  tuition: string;
  deadline: string;
  verified: boolean;
  logo: string;
  country_code: string;
}

const CourseFinder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [showVerifiedOnly, searchQuery, selectedCountry, selectedUniversity]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = supabase.from('courses').select('*');

      if (showVerifiedOnly) {
        query = query.eq('verified', true);
      }

      if (searchQuery) {
        query = query.or(`university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      if (selectedCountry) {
        query = query.eq('country_code', selectedCountry);
      }

      if (selectedUniversity) {
        query = query.eq('university', selectedUniversity);
      }

      const { data, error } = await query.order('qs_rank', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error); 
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Find Your Perfect Course</h1>
        <p className="text-gray-600">Explore a world of opportunities with our comprehensive course database.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>Sort By</option>
            <option>QS Rank</option>
            <option>Tuition Fee</option>
            <option>Deadline</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
          >
            <option value="">All Universities</option>
            <option>Harvard University</option>
            <option>Stanford University</option>
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
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8">
            <option>All Courses</option>
            <option>Computer Science</option>
            <option>Engineering</option>
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
          <span className="font-semibold">{courses.length} courses found</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading courses...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {courses.map((course) => (
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
                    <p className="font-semibold">{course.qs_rank}</p>
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
                    <p className="font-semibold">{formatDeadline(course.deadline)}</p>
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
      )}
    </div>
  );
};

export default CourseFinder;
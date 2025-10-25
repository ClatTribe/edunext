"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, BookOpen, DollarSign, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ShortlistItem {
  id: number;
  course_id?: number;
  scholarship_id?: number;
  admit_profile_id?: number;
  notes?: string;
  created_at: string;
  courses?: {
    university: string;
    program: string;
    location: string;
    tuition: string;
    deadline: string;
  };
  scholarships?: {
    name: string;
    amount: string;
    deadline: string;
  };
  admit_profiles?: {
    name: string;
    university: string;
    program: string;
  };
}

const ShortlistBuilder: React.FC = () => {
  const { user } = useAuth();
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'scholarships' | 'profiles'>('courses');

  useEffect(() => {
    if (user) {
      fetchShortlist();
    }
  }, [user, activeTab]);

  const fetchShortlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase.from('shortlists').select(`
        *,
        courses (*),
        scholarships (*),
        admit_profiles (*)
      `).eq('user_id', user.id);

      if (activeTab === 'courses') {
        query = query.not('course_id', 'is', null);
      } else if (activeTab === 'scholarships') {
        query = query.not('scholarship_id', 'is', null);
      } else if (activeTab === 'profiles') {
        query = query.not('admit_profile_id', 'is', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setShortlistItems(data || []);
    } catch (error) {
      console.error('Error fetching shortlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (itemId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shortlists')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      setShortlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from shortlist:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!user) {
    
    return (
      <div className="flex-1 bg-white p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please login to access your shortlist</p>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Your Shortlist</h1>
        <p className="text-gray-600">Manage your saved courses, scholarships, and profiles in one place</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-4 ${
            activeTab === 'courses'
              ? 'border-b-2 border-red-600 text-red-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} />
            <span>Courses</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`pb-2 px-4 ${
            activeTab === 'scholarships'
              ? 'border-b-2 border-red-600 text-red-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} />
            <span>Scholarships</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('profiles')}
          className={`pb-2 px-4 ${
            activeTab === 'profiles'
              ? 'border-b-2 border-red-600 text-red-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>Profiles</span>
          </div>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading your shortlist...</div>
        </div>
      ) : shortlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">Your shortlist is empty</p>
          <p className="text-sm">Start exploring and save items to your shortlist!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'courses' && shortlistItems.map((item) => (
            item.courses && (
              <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.courses.university}</h3>
                    <p className="text-gray-600 mb-2">{item.courses.program}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>📍 {item.courses.location}</span>
                      <span>💰 {item.courses.tuition}</span>
                      <span>📅 Deadline: {formatDate(item.courses.deadline)}</span>
                    </div>
                    {item.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromShortlist(item.id)}
                    className="text-red-600 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          ))}

          {activeTab === 'scholarships' && shortlistItems.map((item) => (
            item.scholarships && (
              <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.scholarships.name}</h3>
                    <div className="flex gap-6 text-sm text-gray-500 mt-2">
                      <span>💰 {item.scholarships.amount}</span>
                      <span>📅 Deadline: {formatDate(item.scholarships.deadline)}</span>
                    </div>
                    {item.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromShortlist(item.id)}
                    className="text-red-600 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          ))}

          {activeTab === 'profiles' && shortlistItems.map((item) => (
            item.admit_profiles && (
              <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.admit_profiles.name}</h3>
                    <p className="text-gray-600 mb-2">{item.admit_profiles.program}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>🎓 {item.admit_profiles.university}</span>
                    </div>
                    {item.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromShortlist(item.id)}
                    className="text-red-600 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
    </DefaultLayout>
  );
};

export default ShortlistBuilder;
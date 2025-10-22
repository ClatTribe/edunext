"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GraduationCap, Users, BookOpen, Award, LogOut } from 'lucide-react';

const MentorDashboard = () => {
  const router = useRouter();
  const { user, signOut, loading, userRole } = useAuth();

  // Redirect if not logged in or not a mentor
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/register');
      } else if (userRole === 'student') {
        router.push('/');
      }
    }
  }, [user, loading, userRole, router]);

  const getUserName = () => {
    if (!user) return 'Guest';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mentor';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Loading...</div>
      </div>
    );
  }

  if (!user || userRole !== 'mentor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-red-600" size={36} />
            <div className="text-2xl font-bold text-red-600">EduPortal</div>
            <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              Mentor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {getUserName()}</span>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {getUserInitial()}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600">
            Guide students on their journey to global education
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Students</h3>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <BookOpen className="text-green-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Sessions Completed</h3>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Award className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Success Stories</h3>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <GraduationCap className="text-orange-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Universities Guided</h3>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Users className="text-red-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Mentor Portal Coming Soon!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We are building an amazing platform for mentors to connect with students, 
            provide guidance, and help shape their educational journey. Features will include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <Users className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-800 mb-2">Student Management</h3>
              <p className="text-sm text-gray-600">
                Track and manage your mentees progress
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <BookOpen className="text-green-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-800 mb-2">Session Scheduling</h3>
              <p className="text-sm text-gray-600">
                Schedule and conduct mentoring sessions
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <Award className="text-purple-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-gray-800 mb-2">Resources & Tools</h3>
              <p className="text-sm text-gray-600">
                Access guides and materials for mentoring
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
"use client"; 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import CourseFinder from '../../components/CourseFinder';
import AdmitFinder from '../../components/AdmitFinder';
import ScholarshipFinder from '../../components/ScholarshipFinder';
import ShortlistBuilder from '../../components/ShortlistBuilder';

const DashboardPage = () => {
  const router = useRouter();
  const { user, signOut, loading, userRole } = useAuth();
  const [activeSection, setActiveSection] = useState<'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder'>('course-finder');

  // Redirect logic - wait for loading to complete before checking role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user at all - redirect to register
        router.push('/register');
      } else if (userRole === 'mentor') {
        // User is a mentor - redirect to mentor dashboard
        router.push('/mentor-dashboard');
      }
      // If userRole is 'student' or still null (fetching), stay on page
    }
  }, [user, loading, userRole, router]);

  const getUserName = () => {
    if (!user) return 'Guest';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Show loading while auth is initializing OR while role is being fetched
  if (loading || (user && userRole === null)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <div className="text-xl text-red-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // Don't render if no user or wrong role
  if (!user || userRole === 'mentor') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userName={getUserName()}
        onSignOut={signOut}
      />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Student Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {getUserName()}</span>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {getUserInitial()}
              </div>
            </div>
          </div>
        </div>
        {activeSection === 'course-finder' && <CourseFinder />}
        {activeSection === 'admit-finder' && <AdmitFinder />}
        {activeSection === 'scholarship-finder' && <ScholarshipFinder />}
        {activeSection === 'shortlist-builder' && <ShortlistBuilder />}
      </div>
    </div>
  );
};

export default DashboardPage;
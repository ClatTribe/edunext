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
  const { user, signOut, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder'>('course-finder');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  const getUserName = () => {
    if (!user) return 'Guest';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
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
            <span className="text-sm text-gray-600">Postgraduate</span>
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
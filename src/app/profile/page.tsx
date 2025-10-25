"use client";
import React, { useState, useEffect } from 'react';
import { User, BookOpen, Award, Trophy, Edit2, Save, X, CheckCircle, Trash2 } from 'lucide-react';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [activeSection, setActiveSection] = useState<'course-finder' | 'admit-finder' | 'scholarship-finder' | 'shortlist-builder'>('course-finder');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    lastCourseCGPA: '',
    gre: '',
    toefl: '',
    ielts: '',
    term: '',
    university: '',
    program: '',
    extracurricular: '',
    verified: false
  });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (user && mounted) {
        await fetchUserProfile();
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch existing profile - use maybeSingle() instead of single()
      const { data, error: fetchError } = await supabase
        .from('admit_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        // Don't throw error, just handle it gracefully
        setHasProfile(false);
        setIsEditing(true);
        setFormData(prev => ({
          ...prev,
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
        }));
        setLoading(false);
        return;
      }

      if (data) {
        setHasProfile(true);
        setFormData({
          name: data.name || '',
          degree: data.degree || '',
          lastCourseCGPA: data.last_course_cgpa || '',
          gre: data.gre || '',
          toefl: data.toefl || '',
          ielts: data.ielts || '',
          term: data.term || '',
          university: data.university || '',
          program: data.program || '',
          extracurricular: data.extracurricular || '',
          verified: data.verified || false
        });
      } else {
        setHasProfile(false);
        setIsEditing(true);
        // Pre-fill name from user metadata if available
        setFormData(prev => ({
          ...prev,
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Don't show error if profile doesn't exist yet
      setHasProfile(false);
      setIsEditing(true);
      setFormData(prev => ({
        ...prev,
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.degree) {
      setError('Please select your degree type');
      return false;
    }
    if (!formData.lastCourseCGPA) {
      setError('Please enter your last course CGPA/Percentage');
      return false;
    }
    if (formData.gre && (parseInt(formData.gre) < 0 || parseInt(formData.gre) > 340)) {
      setError('GRE score must be between 0 and 340');
      return false;
    }
    if (formData.toefl && (parseInt(formData.toefl) < 0 || parseInt(formData.toefl) > 120)) {
      setError('TOEFL score must be between 0 and 120');
      return false;
    }
    if (formData.ielts && (parseFloat(formData.ielts) < 0 || parseFloat(formData.ielts) > 9.0)) {
      setError('IELTS score must be between 0 and 9.0');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      if (!user) throw new Error('User not authenticated');

      const profileData = {
        user_id: user.id,
        name: formData.name,
        degree: formData.degree,
        last_course_cgpa: formData.lastCourseCGPA,
        gre: formData.gre ? parseInt(formData.gre) : null,
        toefl: formData.toefl ? parseInt(formData.toefl) : null,
        ielts: formData.ielts || null,
        term: formData.term,
        university: formData.university,
        program: formData.program,
        extracurricular: formData.extracurricular,
        applications_count: 1,
        avatar_type: 'S',
        verified: formData.verified,
        updated_at: new Date().toISOString()
      };

      if (hasProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('admit_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        setSuccessMessage('Profile updated successfully!');
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('admit_profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);

        if (insertError) throw insertError;
        setHasProfile(true);
        setSuccessMessage('Profile created successfully!');
      }

      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      setError('');

      const { error: deleteError } = await supabase
        .from('admit_profiles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Reset form
      setFormData({
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        degree: '',
        lastCourseCGPA: '',
        gre: '',
        toefl: '',
        ielts: '',
        term: '',
        university: '',
        program: '',
        extracurricular: '',
        verified: false
      });

      setHasProfile(false);
      setIsEditing(true);
      setShowDeleteConfirm(false);
      setSuccessMessage('Profile deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    if (hasProfile) {
      fetchUserProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/register');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-xl text-red-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userName={formData.name || user?.email?.split('@')[0] || 'User'}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {hasProfile ? 'My Profile' : 'Create Your Profile'}
                  </h1>
                  <p className="text-gray-600">
                    {hasProfile ? 'Manage your academic information' : 'Tell us about yourself'}
                  </p>
                </div>
              </div>
              {hasProfile && !isEditing && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
                <CheckCircle size={20} />
                <p>{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Delete Profile</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your profile? This action cannot be undone and will remove all your academic information.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all ${
                      deleting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Type *
                  </label>
                  <select
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Degree</option>
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="PhD">Doctor of Philosophy (PhD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Course CGPA/Percentage *
                    <span className="text-xs text-gray-500 ml-2">
                      (12th for UG, UG for PG, PG for PhD)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastCourseCGPA}
                    onChange={(e) => handleInputChange('lastCourseCGPA', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="e.g., 8.5 or 85%"
                  />
                </div>
              </div>
            </div>

            {/* Test Scores */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Test Scores</h2>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GRE Score
                    <span className="text-xs text-gray-500 ml-2">(Max: 340)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="340"
                    value={formData.gre}
                    onChange={(e) => handleInputChange('gre', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="0-340"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TOEFL Score
                    <span className="text-xs text-gray-500 ml-2">(Max: 120)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.toefl}
                    onChange={(e) => handleInputChange('toefl', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="0-120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IELTS Score
                    <span className="text-xs text-gray-500 ml-2">(Max: 9.0)</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.ielts}
                    onChange={(e) => handleInputChange('ielts', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="0-9.0"
                  />
                </div>
              </div>
            </div>

            {/* Academic Goals */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Award className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Academic Goals</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Term
                    </label>
                    <select
                      value={formData.term}
                      onChange={(e) => handleInputChange('term', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Term</option>
                      <option value="Fall 2025">Fall 2025</option>
                      <option value="Spring 2026">Spring 2026</option>
                      <option value="Fall 2026">Fall 2026</option>
                      <option value="Spring 2027">Spring 2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target University
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                      placeholder="e.g., Stanford University"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program/Major
                  </label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

            {/* Extracurricular Activities */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Extracurricular Activities</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your achievements, activities, and experiences
                </label>
                <textarea
                  value={formData.extracurricular}
                  onChange={(e) => handleInputChange('extracurricular', e.target.value)}
                  disabled={!isEditing}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 resize-none"
                  placeholder="Include sports, volunteer work, leadership roles, competitions, research projects, internships, etc."
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

const CONTACT_OPTIONS = [
  { value: "WhatsApp", label: "WhatsApp", icon: "💬" },
  { value: "Email", label: "Email", icon: "📧" },
  { value: "Calling", label: "Phone Call", icon: "📞" },
  { value: "LinkedIn", label: "LinkedIn", icon: "💼" },
];

const LeadDataPopup = () => {
  const { user, loading: authLoading } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [formData, setFormData] = useState({
    city: '',
    phone: '',
    contact_preferences: [] as string[],
  });

  const [errors, setErrors] = useState({
    city: '',
    phone: '',
    contact_preferences: '',
  });

  useEffect(() => {
    const checkLeadData = async () => {
      if (!user || authLoading) return;

      try {
        setLoading(true);

        // Check if lead data already exists
        const { data: existingLead, error: leadError } = await supabase
          .from('lead_data')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (leadError && leadError.code !== 'PGRST116') {
          console.error('Error checking lead data:', leadError);
        }

        // If lead data exists, don't show popup
        if (existingLead) {
          setShowPopup(false);
          setLoading(false);
          return;
        }

        // Fetch user name from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Fallback to user metadata
          setUserName(
            user.user_metadata?.full_name || 
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'User'
          );
        } else {
          setUserName(profile?.full_name || 'User');
        }

        // Show popup if no lead data exists
        setShowPopup(true);
        setLoading(false);
      } catch (err) {
        console.error('Error in checkLeadData:', err);
        setLoading(false);
      }
    };

    checkLeadData();
  }, [user, authLoading]);

  const validateForm = () => {
    const newErrors = {
      city: '',
      phone: '',
      contact_preferences: '',
    };

    let isValid = true;

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9+\-() ]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (formData.contact_preferences.length === 0) {
      newErrors.contact_preferences = 'Please select at least one contact preference';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('lead_data')
        .insert({
          user_id: user!.id,
          name: userName,
          city: formData.city.trim(),
          phone: formData.phone.trim(),
          contact_preferences: formData.contact_preferences,
        });

      if (error) {
        console.error('Error saving lead data:', error);
        alert('Failed to save data. Please try again.');
        return;
      }

      // Success - hide popup
      setShowPopup(false);
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactPreferenceToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_preferences: prev.contact_preferences.includes(value)
        ? prev.contact_preferences.filter(v => v !== value)
        : [...prev.contact_preferences, value]
    }));
    
    // Clear error when user makes a selection
    if (errors.contact_preferences) {
      setErrors(prev => ({ ...prev, contact_preferences: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Don't render anything while checking auth or loading
  if (authLoading || loading || !showPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2f61ce] to-blue-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-[#2f61ce]" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-1">
            Welcome, {userName.split(' ')[0]}! 👋
          </h2>
          <p className="text-blue-100 text-center text-sm">
            Let's complete your profile to get started
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Name (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                {userName}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, city: e.target.value }));
                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your city"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] focus:border-transparent transition-all ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="+91 XXXXX XXXXX"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] focus:border-transparent transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Contact Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How would you like us to contact you? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTACT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleContactPreferenceToggle(option.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                      formData.contact_preferences.includes(option.value)
                        ? 'border-[#2f61ce] bg-[#eef3fc] text-[#2f61ce]'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[#2f61ce]'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              {errors.contact_preferences && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.contact_preferences}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-6 bg-gradient-to-r from-[#2f61ce] to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-[#2451a8] hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Complete Profile
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            This information helps us provide you with personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadDataPopup;
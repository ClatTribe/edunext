"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const RegisterPage = () => {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle, loading, userRole } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in - with role-based routing
  useEffect(() => {
    if (!loading && user && userRole) {
      if (userRole === 'mentor') {
        router.push('/mentor-dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, userRole, router]);

  // Handle URL error parameters from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    const expected = params.get('expected');
    
    if (urlError === 'wrong_role') {
      setError(`This account is already registered as a ${expected === 'mentor' ? 'student' : 'mentor'}. Please select the correct role.`);
    } else if (urlError === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    } else if (urlError === 'no_role') {
      setError('Please select your role before signing in.');
    } else if (urlError === 'profile_creation_failed') {
      setError('Failed to create your profile. Please try again.');
    }
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!selectedRole) {
      setError('Please select whether you are a Student or Mentor');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password, selectedRole);
        if (error) {
          setError(error.message || 'Invalid email or password');
        } else {
          // Redirect based on role after successful login
          if (selectedRole === 'mentor') {
            router.push('/mentor-dashboard');
          } else {
            router.push('/');
          }
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          setError(error.message || 'Failed to create account');
        } else {
          setSuccessMessage('Account created successfully! Please check your email to verify your account.');
          setTimeout(() => {
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setFullName('');
            setSuccessMessage('');
          }, 3000);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setError('Please select whether you are a Student or Mentor');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithGoogle(selectedRole);
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
        setIsSubmitting(false);
      }
      // Don't set isSubmitting to false here - let the callback handle redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setSuccessMessage('');
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-xl text-red-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-pink-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="text-white" size={40} />
            <div className="text-4xl font-bold text-white">EduPortal</div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Your Gateway to Global Education
          </h1>
          <p className="text-xl text-pink-100 mb-8">
            Discover courses, connect with admits, and find scholarships to fuel your dreams.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">2000+ Universities</h3>
              <p className="text-pink-100">Access comprehensive course information</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">375K+ Admit Profiles</h3>
              <p className="text-pink-100">Learn from successful applicants</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="text-white" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">3500+ Scholarships</h3>
              <p className="text-pink-100">Find funding opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="text-red-600" size={32} />
                <div className="text-3xl font-bold text-red-600">EduPortal</div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back!' : 'Join EduPortal'}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Sign in to continue your journey' 
                  : 'Start your study abroad journey today'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <p className="text-sm">{successMessage}</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === 'student'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <BookOpen 
                    className={`mx-auto mb-2 ${
                      selectedRole === 'student' ? 'text-red-600' : 'text-gray-400'
                    }`} 
                    size={32} 
                  />
                  <div className={`font-semibold ${
                    selectedRole === 'student' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    Student
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Find courses & apply
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('mentor')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === 'mentor'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <Users 
                    className={`mx-auto mb-2 ${
                      selectedRole === 'mentor' ? 'text-red-600' : 'text-gray-400'
                    }`} 
                    size={32} 
                  />
                  <div className={`font-semibold ${
                    selectedRole === 'mentor' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    Mentor
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Guide students
                  </div>
                </button>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || !selectedRole}
              className={`w-full mb-6 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 ${
                !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedRole}
                className={`w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 ${
                  isSubmitting || !selectedRole ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-red-600 hover:text-red-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-red-600 hover:text-red-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
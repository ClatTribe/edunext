"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const RegisterPage = () => {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color scheme from CourseFinder
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/home'); // Redirect to /home
    }
  }, [user, loading, router]);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Invalid email or password');
          setIsSubmitting(false);
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message || 'Failed to create account');
          setIsSubmitting(false);
        } else {
          setSuccessMessage('Account created successfully! Please check your email to verify your account.');
          setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
        setIsSubmitting(false);
      }
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="text-xl" style={{ color: accentColor }}>Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: primaryBg }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, ${secondaryBg} 100%)`, borderRight: `1px solid ${borderColor}` }}>
        <div>
          <Link href="/" className="flex items-center gap-2 mb-5">
            <img
              src="/whitelogo.svg"
              alt="EduNext Logo"
              width={40}
              height={40}
              className="h-20 w-40 object-contain"
            />
          </Link>
          <h1 className="text-5xl font-bold text-white mb-6">
            Your Gateway to Dream MBA College
          </h1>
          <p className="text-xl mb-8 text-slate-400">
            Discover courses, connect with admits, and find scholarships to fuel your dreams.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <GraduationCap style={{ color: accentColor }} size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">2000+ MBA Colleges</h3>
              <p className="text-slate-400">Access comprehensive course information</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <User style={{ color: accentColor }} size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">375K+ Admit Profiles</h3>
              <p className="text-slate-400">Learn from successful applicants</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <svg className="text-white" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">3500+ Scholarships</h3>
              <p className="text-slate-400">Find funding opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl shadow-xl p-8" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-4">
                <img
                  src="/whitelogo.svg"
                  alt="EduNext Logo"
                  width={40}
                  height={40}
                  className="h-20 w-40 object-contain"
                />
               </Link>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back!' : 'Join EduNext'}
              </h2>
              <p className="text-slate-400">
                {isLogin 
                  ? 'Sign in to continue your journey' 
                  : 'Start your study abroad journey today'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <p className="text-sm" style={{ color: '#86efac' }}>{successMessage}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full mb-6 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: secondaryBg, border: `2px solid ${borderColor}` }}
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
                <div className="w-full" style={{ borderTop: `1px solid ${borderColor}` }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-400" style={{ backgroundColor: secondaryBg }}>Or continue with email</span>
              </div>
            </div>

            <div className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-white"
                      style={{ backgroundColor: primaryBg, border: `1px solid ${borderColor}` }}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-white"
                    style={{ backgroundColor: primaryBg, border: `1px solid ${borderColor}` }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none text-white"
                    style={{ backgroundColor: primaryBg, border: `1px solid ${borderColor}` }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-slate-500 mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      style={{ accentColor: accentColor, backgroundColor: primaryBg, border: `1px solid ${borderColor}` }}
                    />
                    <span className="ml-2 text-sm text-slate-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium hover:opacity-80"
                    style={{ color: accentColor }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: accentColor,}}
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold hover:opacity-80"
                  style={{ color: accentColor }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="hover:opacity-80" style={{ color: accentColor }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="hover:opacity-80" style={{ color: accentColor }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
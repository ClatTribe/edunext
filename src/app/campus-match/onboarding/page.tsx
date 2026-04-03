'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';
import { StudentProfile, DnaType, OnboardingData } from '../types';
import { DNA_QUIZ_QUESTIONS, computeDnaType, DNA_DESCRIPTIONS, DNA_COLORS } from '../lib/dnaMatch';

const OnboardingPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/register');
    }
  }, [user, loading, router]);

  // Check if student profile already exists
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (data && !error) {
        router.replace('/campus-match/dashboard');
      }
    };

    checkExistingProfile();
  }, [user, router]);

  const [currentStep, setCurrentStep] = useState(0);
  const [dnaQuizAnswers, setDnaQuizAnswers] = useState<{ questionId: number; value: number }[]>([]);
  const [dnaType, setDnaType] = useState<DnaType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    city: '',
    state: '',
    classYear: '',
    stream: '',
    board: '',
    boardPercentage: null,
    entranceExam: '',
    entranceScore: '',
    targetDegree: '',
    cityPreference: '',
    hostelNeeded: '',
  });

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDnaAnswer = (questionId: number, value: number) => {
    setDnaQuizAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, value } : a);
      }
      return [...prev, { questionId, value }];
    });
  };

  const calculateProfileCompletion = () => {
    let filled = 0;
    let total = 0;

    // Step 1
    if (formData.fullName) filled++;
    if (formData.city) filled++;
    if (formData.state) filled++;
    if (formData.board) filled++;
    if (formData.classYear) filled++;
    if (formData.stream) filled++;
    total += 6;

    // Step 2
    if (formData.boardPercentage) filled++;
    if (formData.entranceExam) filled++;
    if (formData.entranceScore) filled++;
    total += 3;

    // Step 3
    if (formData.targetDegree) filled++;
    if (formData.cityPreference) filled++;
    if (formData.hostelNeeded) filled++;
    total += 3;

    // Step 4
    if (dnaQuizAnswers.length === DNA_QUIZ_QUESTIONS.length) filled++;
    total += 1;

    return Math.round((filled / total) * 100);
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    if (step === 0) {
      if (!formData.fullName.trim()) errors.push('Full Name is required');
      if (!formData.city.trim()) errors.push('City is required');
      if (!formData.state.trim()) errors.push('State is required');
      if (!formData.board) errors.push('Please select your board');
      if (!formData.classYear) errors.push('Please select your class year');
      if (!formData.stream) errors.push('Please select your stream');
    }
    if (step === 1) {
      // Board percentage is optional, but if entered must be valid
      if (formData.boardPercentage !== null && (formData.boardPercentage < 0 || formData.boardPercentage > 100)) {
        errors.push('Board percentage must be between 0 and 100');
      }
    }
    if (step === 2) {
      if (!formData.targetDegree) errors.push('Please select a target degree');
      if (!formData.cityPreference) errors.push('Please select a city preference');
      if (!formData.hostelNeeded) errors.push('Please select a hostel preference');
    }
    if (step === 3) {
      if (dnaQuizAnswers.length < DNA_QUIZ_QUESTIONS.length) {
        errors.push('Please answer all DNA quiz questions to continue');
      }
    }
    return errors;
  };

  const handleNext = async () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    // Calculate DNA type after quiz
    if (currentStep === 3) {
      const result = computeDnaType(dnaQuizAnswers);
      setDnaType(result.type);
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const profile: StudentProfile = {
        id: crypto.randomUUID(),
        userId: user.id,
        fullName: formData.fullName,
        city: formData.city,
        state: formData.state,
        classYear: formData.classYear,
        stream: formData.stream,
        board: formData.board,
        boardPercentage: formData.boardPercentage || 0,
        entranceExam: formData.entranceExam,
        entranceScore: formData.entranceScore,
        targetDegree: formData.targetDegree,
        cityPreference: formData.cityPreference,
        hostelNeeded: formData.hostelNeeded,
        sopRaw: '',
        sopPolished: '',
        bioShort: '',
        dnaType,
        dnaQuizScores: null,
        extracurriculars: [],
        achievements: [],
        videoResumeUrl: null,
        videoResumeTranscript: null,
        fitScoreCache: {},
        ghostMode: false,
        profileComplete: false,
        profileCompletenessPct: calculateProfileCompletion(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('students')
        .insert([profile]);

      if (error) {
        setSaveError(error.message);
        setIsSaving(false);
        return;
      }

      router.replace('/campus-match/dashboard');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Let's Get Started</h1>
            <div className="text-sm text-gray-400">{profileCompletion}% complete</div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mb-12">
          {[0, 1, 2, 3, 4].map((step, idx) => (
            <motion.div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentStep
                  ? 'bg-purple-500'
                  : idx < currentStep
                    ? 'bg-purple-600'
                    : 'bg-gray-700'
              }`}
              animate={{ scale: idx === currentStep ? 1.3 : 1 }}
            />
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2">Full Name <span className="text-red-400">*</span></label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2">City <span className="text-red-400">*</span></label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder="e.g., Mumbai"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2">State <span className="text-red-400">*</span></label>
                    <input
                      id="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={e => handleInputChange('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="board" className="block text-sm font-medium mb-2">Board <span className="text-red-400">*</span></label>
                  <select
                    id="board"
                    required
                    value={formData.board}
                    onChange={e => handleInputChange('board', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                  >
                    <option value="">Select your board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="classYear" className="block text-sm font-medium mb-2">Class Year <span className="text-red-400">*</span></label>
                    <select
                      id="classYear"
                      required
                      value={formData.classYear}
                      onChange={e => handleInputChange('classYear', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="Gap Year">Gap Year</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="stream" className="block text-sm font-medium mb-2">Stream <span className="text-red-400">*</span></label>
                    <select
                      id="stream"
                      required
                      value={formData.stream}
                      onChange={e => handleInputChange('stream', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="PCM">PCM (Science)</option>
                      <option value="PCB">PCB (Science)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Humanities">Humanities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Scores */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Board Percentage</label>
                  <input
                    type="number"
                    value={formData.boardPercentage || ''}
                    onChange={e => handleInputChange('boardPercentage', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 92.5"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entrance Exam</label>
                  <select
                    value={formData.entranceExam}
                    onChange={e => handleInputChange('entranceExam', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  >
                    <option value="">Select an exam</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CUET">CUET</option>
                    <option value="CLAT">CLAT</option>
                    <option value="SAT">SAT</option>
                    <option value="None">Not planning to take an exam</option>
                    <option value="Not yet taken">Not yet taken</option>
                  </select>
                </div>

                {formData.entranceExam && formData.entranceExam !== 'None' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {formData.entranceExam === 'JEE Main'
                        ? 'JEE Mains Score'
                        : formData.entranceExam === 'NEET'
                          ? 'NEET Score'
                          : `${formData.entranceExam} Score`}
                    </label>
                    <input
                      type="text"
                      value={formData.entranceScore}
                      onChange={e => handleInputChange('entranceScore', e.target.value)}
                      placeholder={
                        formData.entranceExam === 'JEE Main'
                          ? 'e.g., 250/300'
                          : formData.entranceExam === 'NEET'
                            ? 'e.g., 650/720'
                            : 'Enter your score'
                      }
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    {formData.entranceScore
                      ? "Got it! We'll use this to estimate your college fit."
                      : 'You can leave this blank if you haven\'t taken the exam yet.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Your Interests */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Degree Type</label>
                  <select
                    value={formData.targetDegree}
                    onChange={e => handleInputChange('targetDegree', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  >
                    <option value="">Select a degree type</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Law">Law</option>
                    <option value="Management">Management / MBA</option>
                    <option value="Liberal Arts">Liberal Arts</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City Preference</label>
                  <select
                    value={formData.cityPreference}
                    onChange={e => handleInputChange('cityPreference', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  >
                    <option value="">Select your preference</option>
                    <option value="Stay in home state">Stay in home state</option>
                    <option value="Nearby states">Nearby states</option>
                    <option value="Anywhere in India">Anywhere in India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hostel Needed?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Yes', 'No', 'Flexible'].map(option => (
                      <button
                        key={option}
                        onClick={() => handleInputChange('hostelNeeded', option)}
                        className={`py-3 px-4 rounded-lg font-medium transition ${
                          formData.hostelNeeded === option
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: DNA Quiz */}
            {currentStep === 3 && (
              <DnaQuiz
                questions={DNA_QUIZ_QUESTIONS}
                answers={dnaQuizAnswers}
                onAnswer={handleDnaAnswer}
              />
            )}

            {/* Step 5: Summary */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Your DNA Type</h2>
                  {dnaType && (
                    <div className={`rounded-lg p-4 border ${DNA_COLORS[dnaType]}`}>
                      <h3 className="text-2xl font-bold mb-2">{dnaType}</h3>
                      <p className="text-sm">{DNA_DESCRIPTIONS[dnaType]}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-400 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Name:</span> {formData.fullName}</p>
                      <p><span className="text-gray-400">Location:</span> {formData.city}, {formData.state}</p>
                      <p><span className="text-gray-400">Stream:</span> {formData.stream}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-400 mb-2">Academic Info</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Board:</span> {formData.board}</p>
                      <p><span className="text-gray-400">Board %:</span> {formData.boardPercentage || 'Not provided'}</p>
                      <p><span className="text-gray-400">Exam:</span> {formData.entranceExam || 'Not selected'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-400 mb-2">Preferences</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Degree:</span> {formData.targetDegree}</p>
                      <p><span className="text-gray-400">City:</span> {formData.cityPreference}</p>
                      <p><span className="text-gray-400">Hostel:</span> {formData.hostelNeeded}</p>
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{saveError}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-900/20 border border-red-700/30 rounded-lg p-4" role="alert">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {validationErrors.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-200">{err}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-6">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-lg font-medium text-white hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {currentStep < 4 && (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 min-h-[48px] rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// DNA Quiz Component
const DnaQuiz: React.FC<{
  questions: typeof DNA_QUIZ_QUESTIONS;
  answers: { questionId: number; value: number }[];
  onAnswer: (questionId: number, value: number) => void;
}> = ({ questions, answers, onAnswer }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id);

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevQuestion = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">Question {currentQuestion + 1} of {questions.length}</p>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-6 leading-relaxed">
            {currentQ.text}
          </h2>

          {currentQ.subtext && (
            <p className="text-sm text-gray-400 mb-6">{currentQ.subtext}</p>
          )}

          {/* Scale Buttons */}
          <div className="space-y-4 mb-8">
            {/* Anchors */}
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>{currentQ.leftAnchor}</span>
              <span>{currentQ.rightAnchor}</span>
            </div>

            {/* Scale */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <motion.button
                  key={value}
                  onClick={() => onAnswer(currentQ.id, value)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-4 px-3 rounded-lg font-semibold transition ${
                    currentAnswer?.value === value
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-110 shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {value}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1 justify-center">
        {questions.map((q, idx) => (
          <motion.div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentQuestion
                ? 'bg-purple-500'
                : answers.some(a => a.questionId === q.id)
                  ? 'bg-purple-400'
                  : 'bg-gray-700'
            }`}
            animate={{ scale: idx === currentQuestion ? 1.3 : 1 }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentQuestion === 0
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestion === questions.length - 1}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentQuestion === questions.length - 1
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex-1" />
        <p className="text-sm text-gray-400 self-center">
          {currentAnswer ? 'â Answered' : 'Answer this question'}
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;

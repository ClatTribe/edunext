"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Award,
  Trophy,
  Save,
  X,
  Trash2,
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import DefaultLayout from "../defaultLayout"
import { useAuth } from "../../../contexts/AuthContext"
import { supabase } from "../../../lib/supabase"

// Import custom components
import TargetProgramSection from "../../../components/ProfileData/TargetProgramSection"
import PersonalInfoSection from "../../../components/ProfileData/PersonalInfoSection"
import AcademicSection from "../../../components/ProfileData/AcademicSection"
import TestScoresSection from "../../../components/ProfileData/TestScoresSection"
import ProfileHeader from "../../../components/ProfileData/ProfileHeader"

interface TestScore {
  exam: string
  percentile: string
}

interface FormData {
  name: string
  email: string
  phone: string
  city: string
  state: string
  target_state: string[]
  target_degree: string
  target_field: string
  budget: string []
  academic_year: string
  tenth_board: string
  tenth_year: string
  tenth_score: string
  twelfth_board: string
  twelfth_year: string
  twelfth_score: string
  twelfth_stream: string
  ug_degree: string
  ug_year: string
  ug_score: string
  ug_field: string
  pg_degree: string
  pg_year: string
  pg_score: string
  pg_field: string
  testScores: TestScore[]
  has_experience: string
  experience_years: string
  experience_field: string
  extracurricular: string
  verified: boolean
}

// Global cache
let cachedFormData: FormData | null = null
let cachedHasProfile = false
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

export const invalidateProfileCache = () => {
  cachedFormData = null
  cachedHasProfile = false
  cacheTimestamp = 0
}

// Shared Components
interface InputFieldProps {
  label: string
  type?: string
  value: string
  onChange: (field: string, value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  field: string
}

const InputField = React.memo(
  ({ label, type = "text", value, onChange, placeholder, required = false, disabled, field }: InputFieldProps) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-[#2f61ce]">*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] disabled:bg-gray-100"
        />
      </div>
    )
  },
)
InputField.displayName = "InputField"

interface SelectFieldProps {
  label: string
  value: string
  onChange: (field: string, value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  field: string
}

const SelectField = React.memo(
  ({ label, value, onChange, options, required = false, disabled, field }: SelectFieldProps) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-[#2f61ce]">*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={disabled}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] disabled:bg-gray-100"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  },
)
SelectField.displayName = "SelectField"

interface SectionProps {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  visible?: boolean
  isExpanded: boolean
  isComplete: boolean
  onToggle: (id: string) => void
}

const Section = React.memo(
  ({ id, title, icon: Icon, children, visible = true, isExpanded, isComplete, onToggle }: SectionProps) => {
    if (!visible) return null
    return (
      <div className="mb-4 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-[#f8fafc] hover:bg-[#eef3fc] transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#2f61ce] flex-shrink-0" />
            <span className="font-semibold text-gray-800 text-sm sm:text-base text-left">{title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isComplete && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#fac300]" />}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#2f61ce]" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#2f61ce]" />
            )}
          </div>
        </button>
        {isExpanded && <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white">{children}</div>}
      </div>
    )
  },
)
Section.displayName = "Section"

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(!cachedFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [hasProfile, setHasProfile] = useState(cachedHasProfile)
  const [expandedSection, setExpandedSection] = useState("target")
  const [formData, setFormData] = useState<FormData>(
    cachedFormData || {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      target_state: [],
      target_degree: "",
      target_field: "",
      budget: [],
      academic_year: "",
      tenth_board: "",
      tenth_year: "",
      tenth_score: "",
      twelfth_board: "",
      twelfth_year: "",
      twelfth_score: "",
      twelfth_stream: "",
      ug_degree: "",
      ug_year: "",
      ug_score: "",
      ug_field: "",
      pg_degree: "",
      pg_year: "",
      pg_score: "",
      pg_field: "",
      testScores: [],
      has_experience: "",
      experience_years: "",
      experience_field: "",
      extracurricular: "",
      verified: false,
    },
  )

  const getDefaultFormData = useCallback(
    (): FormData => ({
      name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
      email: user?.email || "",
      phone: "",
      city: "",
      state: "",
      target_state: [],
      target_degree: "",
      target_field: "",
      budget: [],
      academic_year: "",
      tenth_board: "",
      tenth_year: "",
      tenth_score: "",
      twelfth_board: "",
      twelfth_year: "",
      twelfth_score: "",
      twelfth_stream: "",
      ug_degree: "",
      ug_year: "",
      ug_score: "",
      ug_field: "",
      pg_degree: "",
      pg_year: "",
      pg_score: "",
      pg_field: "",
      testScores: [],
      has_experience: "",
      experience_years: "",
      experience_field: "",
      extracurricular: "",
      verified: false,
    }),
    [user],
  )

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true)
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("admit_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Fetch error:", fetchError)
        const defaultData = getDefaultFormData()
        setFormData(defaultData)
        cachedFormData = defaultData
        setHasProfile(false)
        cachedHasProfile = false
        setIsEditing(true)
      } else if (data) {
        const profileData: FormData = {
          name: data.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          target_state: data.target_state || [],
          target_degree: data.degree || "",
          target_field: data.program || "",
          budget: data.budget || "",
          academic_year: data.academic_year || "",
          tenth_board: data.tenth_board || "",
          tenth_year: data.tenth_year || "",
          tenth_score: data.tenth_score || "",
          twelfth_board: data.twelfth_board || "",
          twelfth_year: data.twelfth_year || "",
          twelfth_score: data.twelfth_score || "",
          twelfth_stream: data.twelfth_stream || "",
          ug_degree: data.ug_degree || "",
          ug_year: data.ug_year || "",
          ug_score: data.ug_score || "",
          ug_field: data.ug_field || "",
          pg_degree: data.pg_degree || "",
          pg_year: data.pg_year || "",
          pg_score: data.pg_score || "",
          pg_field: data.pg_field || "",
          testScores: data.test_scores || [],
          has_experience: data.has_experience || "",
          experience_years: data.experience_years || "",
          experience_field: data.experience_field || "",
          extracurricular: data.extracurricular || "",
          verified: data.verified || false,
        }
        setFormData(profileData)
        cachedFormData = profileData
        setHasProfile(true)
        cachedHasProfile = true
        cacheTimestamp = Date.now()
      } else {
        const defaultData = getDefaultFormData()
        setFormData(defaultData)
        cachedFormData = defaultData
        setHasProfile(false)
        cachedHasProfile = false
        setIsEditing(true)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      const defaultData = getDefaultFormData()
      setFormData(defaultData)
      cachedFormData = defaultData
      setHasProfile(false)
      cachedHasProfile = false
      setIsEditing(true)
    } finally {
      setLoading(false)
    }
  }, [user, getDefaultFormData])

  useEffect(() => {
    if (user) {
      const now = Date.now()
      const isCacheValid = cachedFormData && now - cacheTimestamp < CACHE_DURATION
      if (!isCacheValid) {
        fetchUserProfile()
      } else {
        setLoading(false)
      }
    }
  }, [user, fetchUserProfile])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }, [])

  const handleMultiSelect = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_state: prev.target_state.includes(value)
        ? prev.target_state.filter((c) => c !== value)
        : [...prev.target_state, value],
    }))
    setError("")
  }, [])
  const handleMultiSelectBudget = useCallback((value: string) => {
  setFormData((prev) => ({
    ...prev,
    budget: prev.budget.includes(value)
      ? prev.budget.filter((b) => b !== value)
      : [...prev.budget, value],
  }))
  setError("")
}, [])

  const handleTestScoreChange = useCallback((index: number, field: "exam" | "percentile", value: string) => {
    setFormData((prev) => {
      const newTestScores = [...prev.testScores]
      newTestScores[index] = { ...newTestScores[index], [field]: value }
      return { ...prev, testScores: newTestScores }
    })
    setError("")
  }, [])

  const addTestScore = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      testScores: [...prev.testScores, { exam: "", percentile: "" }],
    }))
  }, [])

  const removeTestScore = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      testScores: prev.testScores.filter((_, i) => i !== index),
    }))
  }, [])

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? "" : section))
  }, [])

  const shouldShowUG = useMemo(
    () => ["Masters", "MBA", "PhD"].includes(formData.target_degree),
    [formData.target_degree],
  )

  const shouldShowPG = useMemo(() => formData.target_degree === "PhD", [formData.target_degree])

  const shouldShowWorkExp = useMemo(
    () => ["Masters", "MBA", "PhD"].includes(formData.target_degree),
    [formData.target_degree],
  )

  const isSectionComplete = useCallback(
    (section: string): boolean => {
      switch (section) {
        case "personal":
          return !!(formData.name && formData.email && formData.phone && formData.city)
        case "tenth":
          return !!(formData.tenth_board && formData.tenth_year && formData.tenth_score)
        case "twelfth":
          return !!(
            formData.twelfth_board &&
            formData.twelfth_year &&
            formData.twelfth_score &&
            formData.twelfth_stream
          )
        case "ug":
          return !shouldShowUG || !!(formData.ug_degree && formData.ug_year && formData.ug_score)
        case "pg":
          return !shouldShowPG || !!(formData.pg_degree && formData.pg_year)
        case "tests":
          return formData.testScores.length > 0
        case "experience":
          return !shouldShowWorkExp || !!formData.has_experience
        default:
          return false
      }
    },
    [formData, shouldShowUG, shouldShowPG, shouldShowWorkExp],
  )

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      setError("Please enter your name")
      return false
    }
    if (!formData.email.trim()) {
      setError("Please enter your email")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number")
      return false
    }
    if (formData.target_state.length === 0) {
      setError("Please select at least one preferred state")
      return false
    }
    if (!formData.target_degree) {
      setError("Please select your target degree")
      return false
    }
    for (let i = 0; i < formData.testScores.length; i++) {
      const test = formData.testScores[i]
      if (!test.exam || !test.percentile) {
        setError(`Please complete test #${i + 1} or remove it`)
        return false
      }
    }
    return true
  }, [formData])

  const handleSave = async () => {
    if (!validateForm()) return
    try {
      setSaving(true)
      setError("")
      if (!user) throw new Error("User not authenticated")

      const validTestScores = formData.testScores.filter((test) => test.exam && test.percentile)

      const profileData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city || null,
        state: formData.state || null,
        target_state: formData.target_state,
        degree: formData.target_degree,
        budget: formData.budget || null,
        academic_year: formData.academic_year || null,
        tenth_board: formData.tenth_board || null,
        tenth_year: formData.tenth_year || null,
        tenth_score: formData.tenth_score || null,
        twelfth_board: formData.twelfth_board || null,
        twelfth_year: formData.twelfth_year || null,
        twelfth_score: formData.twelfth_score || null,
        twelfth_stream: formData.twelfth_stream || null,
        ug_degree: formData.ug_degree || null,
        ug_year: formData.ug_year || null,
        ug_score: formData.ug_score || null,
        ug_field: formData.ug_field || null,
        pg_degree: formData.pg_degree || null,
        pg_year: formData.pg_year || null,
        pg_score: formData.pg_score || null,
        pg_field: formData.pg_field || null,
        test_scores: validTestScores,
        has_experience: formData.has_experience || null,
        experience_years: formData.experience_years || null,
        experience_field: formData.experience_field || null,
        extracurricular: formData.extracurricular || null,
        applications_count: 1,
        avatar_type: "S",
        verified: formData.verified,
        updated_at: new Date().toISOString(),
      }

      if (hasProfile) {
        const { error: updateError } = await supabase.from("admit_profiles").update(profileData).eq("user_id", user.id)
        if (updateError) throw updateError
        setSuccessMessage("Profile updated successfully!")
      } else {
        const { error: insertError } = await supabase
          .from("admit_profiles")
          .insert([{ ...profileData, created_at: new Date().toISOString() }])
        if (insertError) throw insertError
        setHasProfile(true)
        cachedHasProfile = true
        setSuccessMessage("Profile created successfully!")
      }

      cachedFormData = formData
      cacheTimestamp = Date.now()
      invalidateProfileCache()
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    try {
      setDeleting(true)
      setError("")
      const { error: deleteError } = await supabase.from("admit_profiles").delete().eq("user_id", user.id)
      if (deleteError) throw deleteError
      const defaultData = getDefaultFormData()
      setFormData(defaultData)
      cachedFormData = defaultData
      setHasProfile(false)
      cachedHasProfile = false
      invalidateProfileCache()
      setIsEditing(true)
      setShowDeleteConfirm(false)
      setSuccessMessage("Profile deleted successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("Error deleting profile:", err)
      setError("Failed to delete profile. Please try again.")
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setError("")
    if (hasProfile && cachedFormData) {
      setFormData(cachedFormData)
    }
  }, [hasProfile])

  const userInitial = useMemo(() => {
    return formData.name ? formData.name.charAt(0).toUpperCase() : "U"
  }, [formData.name])

  const eduScore = useMemo(() => {
    let score = 0
    if (formData.target_state.length > 0) score += 3
    if (formData.target_degree) score += 4
    if (formData.academic_year) score += 2
    if (formData.budget) score += 2
    if (formData.name) score += 2
    if (formData.email) score += 2
    if (formData.phone) score += 2
    if (formData.city) score += 2
    if (formData.state) score += 2
    if (formData.tenth_board) score += 3
    if (formData.tenth_year) score += 3
    if (formData.tenth_score) score += 4
    if (formData.twelfth_board) score += 3
    if (formData.twelfth_year) score += 2
    if (formData.twelfth_score) score += 3
    if (formData.twelfth_stream) score += 2
    if (shouldShowUG) {
      if (formData.ug_degree) score += 3
      if (formData.ug_year) score += 3
      if (formData.ug_score) score += 3
      if (formData.ug_field) score += 3
    }
    if (shouldShowPG) {
      if (formData.pg_degree) score += 3
      if (formData.pg_year) score += 3
      if (formData.pg_score) score += 3
      if (formData.pg_field) score += 3
    }
    if (formData.testScores.length > 0) {
      const validTests = formData.testScores.filter((t) => t.exam && t.percentile)
      score += Math.min(validTests.length * 3, 10)
    }
    if (shouldShowWorkExp) {
      if (formData.has_experience === "Yes") {
        score += 2
        if (formData.experience_years) score += 2
        if (formData.experience_field) score += 1
      }
    }
    if (formData.extracurricular && formData.extracurricular.trim().length > 20) {
      score += 5
    }
    const maxPossibleScore = 90
    const normalizedScore = Math.max(45, Math.min(90, Math.round((score / maxPossibleScore) * 90)))
    return normalizedScore
  }, [formData, shouldShowUG, shouldShowPG, shouldShowWorkExp])

  const getScoreColor = useCallback((score: number) => {
    if (score >= 75) return { color: "#10b981", label: "Excellent" }
    if (score >= 60) return { color: "#fac300", label: "Good" }
    return { color: "#2f61ce", label: "Needs Improvement" }
  }, [])

  const scoreInfo = useMemo(() => getScoreColor(eduScore), [eduScore, getScoreColor])

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg sm:text-xl text-[#2f61ce] flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#2f61ce]"></div>
            Loading profile...
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ProfileHeader
            userInitial={userInitial}
            hasProfile={hasProfile}
            isEditing={isEditing}
            eduScore={eduScore}
            scoreInfo={scoreInfo}
            successMessage={successMessage}
            error={error}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setShowDeleteConfirm(true)}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eef3fc] rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="text-[#2f61ce]" size={20} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Delete Profile</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Are you sure you want to delete your profile? This action cannot be undone and will remove all your
                  academic information.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2f61ce] text-white rounded-lg hover:bg-[#254da6] transition-all text-sm sm:text-base ${
                      deleting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-3 sm:space-y-4">
            {/* Target Program */}
            <TargetProgramSection
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "target"}
              isComplete={isSectionComplete("target")}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              onMultiSelect={handleMultiSelect}
              onMultiSelectBudget={handleMultiSelectBudget}
              Section={Section}
              SelectField={SelectField}
            />

            {/* Personal Information */}
            <PersonalInfoSection
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "personal"}
              isComplete={isSectionComplete("personal")}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              Section={Section}
              InputField={InputField}
            />

            {/* 10th Grade */}
            <AcademicSection
              id="tenth"
              title="10th Grade Details"
              type="tenth"
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "tenth"}
              isComplete={isSectionComplete("tenth")}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              Section={Section}
              InputField={InputField}
              SelectField={SelectField}
            />

            {/* 12th Grade */}
            <AcademicSection
              id="twelfth"
              title="12th Grade Details"
              type="twelfth"
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "twelfth"}
              isComplete={isSectionComplete("twelfth")}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              Section={Section}
              InputField={InputField}
              SelectField={SelectField}
            />

            {/* Undergraduate */}
            <AcademicSection
              id="ug"
              title="Undergraduate Details"
              type="ug"
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "ug"}
              isComplete={isSectionComplete("ug")}
              visible={shouldShowUG}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              Section={Section}
              InputField={InputField}
              SelectField={SelectField}
            />

            {/* Postgraduate */}
            <AcademicSection
              id="pg"
              title="Postgraduate/Masters Details"
              type="pg"
              formData={formData}
              isEditing={isEditing}
              isExpanded={expandedSection === "pg"}
              isComplete={isSectionComplete("pg")}
              visible={shouldShowPG}
              onToggle={toggleSection}
              onInputChange={handleInputChange}
              Section={Section}
              InputField={InputField}
              SelectField={SelectField}
            />

            {/* Test Scores */}
            <TestScoresSection
              testScores={formData.testScores}
              isEditing={isEditing}
              isExpanded={expandedSection === "tests"}
              isComplete={isSectionComplete("tests")}
              onToggle={toggleSection}
              onAdd={addTestScore}
              onRemove={removeTestScore}
              onChange={handleTestScoreChange}
              Section={Section}
            />

            {/* Work Experience */}
            <Section
              id="experience"
              title="Work Experience"
              icon={Award}
              visible={shouldShowWorkExp}
              isExpanded={expandedSection === "experience"}
              isComplete={isSectionComplete("experience")}
              onToggle={toggleSection}
            >
              <SelectField
                label="Do you have work experience?"
                value={formData.has_experience}
                onChange={handleInputChange}
                field="has_experience"
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                required
                disabled={!isEditing}
              />
              {formData.has_experience === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <InputField
                    label="Years of Experience"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    field="experience_years"
                    placeholder="2"
                    disabled={!isEditing}
                  />
                  <InputField
                    label="Field/Industry"
                    value={formData.experience_field}
                    onChange={handleInputChange}
                    field="experience_field"
                    placeholder="IT, Finance, Healthcare, etc."
                    disabled={!isEditing}
                  />
                </div>
              )}
            </Section>

            {/* Extracurricular Activities */}
            <Section
              id="extra"
              title="Extracurricular Activities"
              icon={Trophy}
              isExpanded={expandedSection === "extra"}
              isComplete={false}
              onToggle={toggleSection}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your achievements, activities, and experiences
                </label>
                <textarea
                  value={formData.extracurricular}
                  onChange={(e) => handleInputChange("extracurricular", e.target.value)}
                  disabled={!isEditing}
                  rows={6}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] disabled:bg-gray-100 resize-none"
                  placeholder="Include sports, volunteer work, leadership roles, competitions, research projects, internships, etc."
                />
              </div>
            </Section>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pb-4">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2f61ce] text-white rounded-lg hover:bg-[#254da6] transition-all text-sm sm:text-base ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default ProfilePage
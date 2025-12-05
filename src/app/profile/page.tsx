"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  User,
  BookOpen,
  Award,
  Trophy,
  Edit2,
  Save,
  X,
  CheckCircle,
  Trash2,
  Plus,
  Minus,
  GraduationCap,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react"
import DefaultLayout from "../defaultLayout"
import { useAuth } from "../../../contexts/AuthContext"
import { supabase } from "../../../lib/supabase"

interface TestScore {
  exam: string
  percentile: string
}

interface FormData {
  // Personal Information
  name: string
  email: string
  phone: string
  city: string
  state: string
  // Target Program
  target_state: string[]
  target_degree: string
  target_field: string
  budget: string
  academic_year: string
  // 10th Grade
  tenth_board: string
  tenth_year: string
  tenth_score: string
  // 12th Grade
  twelfth_board: string
  twelfth_year: string
  twelfth_score: string
  twelfth_stream: string
  // Undergraduate
  ug_degree: string
  ug_year: string
  ug_score: string
  ug_field: string
  // Postgraduate
  pg_degree: string
  pg_year: string
  pg_score: string
  pg_field: string
  // Test Scores
  testScores: TestScore[]
  // Work Experience
  has_experience: string
  experience_years: string
  experience_field: string
  // Other
  extracurricular: string
  verified: boolean
}

// Global cache for profile data
let cachedFormData: FormData | null = null
let cachedHasProfile = false
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

export const invalidateProfileCache = () => {
  cachedFormData = null
  cachedHasProfile = false
  cacheTimestamp = 0
}

const COMMON_EXAMS = ["CAT", "NMAT", "MAT", "XAT", "BITSAT", "GMAT", "CMAT", "SNAP", "Other"]

const COUNTRIES = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Haryana", "West Bengal (Other)"]

const DEGREE_OPTIONS = [
  // { value: "Bachelors", label: "Bachelors (Undergraduate)" },
  // { value: "Masters", label: "Masters" },
  { value: "MBA", label: "MBA" },
  // { value: "PhD", label: "PhD / Doctorate" },
  // { value: "Diploma", label: "Diploma/Certificate" },
]

const TERM_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028 or later" },
]

// Type definitions for component props
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

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (field: string, value: string) => void
  options: SelectOption[]
  required?: boolean
  disabled?: boolean
  field: string
}

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
      budget: "",
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
      budget: "",
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
        // case "target":
        //   return !!(formData.target_state.length > 0 && formData.target_degree && formData.target_field)
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
    // if (!formData.target_field) {
    //   setError("Please enter your field of interest")
    //   return false
    // }
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
        // program: formData.target_field,
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
    // if (formData.target_field) score += 4
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2f61ce] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                    {userInitial}
                  </div>
                  {/* Title - visible on all screens */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                      {hasProfile ? "My Profile" : "Create Your Profile"}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 truncate">
                      {hasProfile ? "Manage your academic information" : "Tell us about yourself"}
                    </p>
                  </div>
                </div>
                {/* EduScore Circle - hidden on mobile, shown on larger screens */}
                <div className="hidden md:flex flex-col items-center flex-shrink-0">
                  <div className="relative w-20 lg:w-24 h-20 lg:h-24">
                    <svg className="w-20 lg:w-24 h-20 lg:h-24 transform -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="#e5e7eb" strokeWidth="7" fill="none" className="lg:hidden" />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke={scoreInfo.color}
                        strokeWidth="7"
                        fill="none"
                        strokeDasharray={`${(eduScore / 90) * 213.6} 213.6`}
                        strokeLinecap="round"
                        className="transition-all duration-500 lg:hidden"
                      />
                      <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" className="hidden lg:block" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={scoreInfo.color}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(eduScore / 90) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-500 hidden lg:block"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl lg:text-2xl font-bold" style={{ color: scoreInfo.color }}>
                        {eduScore}
                      </span>
                      <span className="text-xs text-gray-500">/ 90</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-semibold text-gray-600">EduScore</div>
                    <div className="text-xs" style={{ color: scoreInfo.color }}>
                      {scoreInfo.label}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* EduScore for mobile - shown below header */}
              <div className="flex md:hidden justify-center">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={scoreInfo.color}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(eduScore / 90) * 175.8} 175.8`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold" style={{ color: scoreInfo.color }}>
                        {eduScore}
                      </span>
                      <span className="text-xs text-gray-500">/ 90</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600">EduScore</div>
                    <div className="text-sm" style={{ color: scoreInfo.color }}>
                      {scoreInfo.label}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              {hasProfile && !isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-2 bg-[#2f61ce] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#254da6] transition-all text-sm sm:text-base"
                  >
                    <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2 bg-white border-2 border-[#2f61ce] text-[#2f61ce] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#eef3fc] transition-all text-sm sm:text-base"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            {successMessage && (
              <div className="mb-4 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle size={18} className="flex-shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm sm:text-base">
                <p>{error}</p>
              </div>
            )}
          </div>

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
            <Section
              id="target"
              title="What are you looking to study?"
              icon={Target}
              isExpanded={expandedSection === "target"}
              isComplete={isSectionComplete("target")}
              onToggle={toggleSection}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred States <span className="text-[#2f61ce]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => isEditing && handleMultiSelect(country)}
                      disabled={!isEditing}
                      className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base ${
                        formData.target_state.includes(country)
                          ? "border-[#2f61ce] bg-[#eef3fc] text-[#2f61ce] font-medium"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#2f61ce]"
                      } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="What degree are you applying for?"
                  value={formData.target_degree}
                  onChange={handleInputChange}
                  field="target_degree"
                  options={DEGREE_OPTIONS}
                  required
                  disabled={!isEditing}
                />
                {/* <InputField
                  label="Field of Interest"
                  value={formData.target_field}
                  onChange={handleInputChange}
                  field="target_field"
                  placeholder="Computer Science, MBA, Medicine, etc."
                  required
                  disabled={!isEditing}
                /> */}
                <SelectField
                  label="When do you plan to start?"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  field="academic_year"
                  options={TERM_OPTIONS}
                  disabled={!isEditing}
                />
                <SelectField
                  label="Budget Range (Annual)"
                  value={formData.budget}
                  onChange={handleInputChange}
                  field="budget"
                  options={[
                    { value: "5L", label: "5 Lakh" },
                    { value: "5-10L", label: "₹5-10 Lakhs" },
                    { value: "10-15L", label: "₹10-15 Lakhs" },
                    { value: "Above 15L", label: "Above ₹15 Lakhs" },
                  ]}
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Personal Information */}
            <Section
              id="personal"
              title="Personal Information"
              icon={User}
              isExpanded={expandedSection === "personal"}
              isComplete={isSectionComplete("personal")}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  field="name"
                  placeholder="Enter your full name"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  field="email"
                  placeholder="your.email@example.com"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  field="phone"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  field="city"
                  placeholder="Your city"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  field="state"
                  placeholder="Your state"
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* 10th Grade */}
            <Section
              id="tenth"
              title="10th Grade Details"
              icon={GraduationCap}
              isExpanded={expandedSection === "tenth"}
              isComplete={isSectionComplete("tenth")}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <SelectField
                  label="Board"
                  value={formData.tenth_board}
                  onChange={handleInputChange}
                  field="tenth_board"
                  options={[
                    { value: "CBSE", label: "CBSE" },
                    { value: "ICSE", label: "ICSE" },
                    { value: "State Board", label: "State Board" },
                    { value: "Other", label: "Other" },
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Passing"
                  type="number"
                  value={formData.tenth_year}
                  onChange={handleInputChange}
                  field="tenth_year"
                  placeholder="2019"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Percentage/CGPA"
                  value={formData.tenth_score}
                  onChange={handleInputChange}
                  field="tenth_score"
                  placeholder="85% or 9.5 CGPA"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* 12th Grade */}
            <Section
              id="twelfth"
              title="12th Grade Details"
              icon={GraduationCap}
              isExpanded={expandedSection === "twelfth"}
              isComplete={isSectionComplete("twelfth")}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Board"
                  value={formData.twelfth_board}
                  onChange={handleInputChange}
                  field="twelfth_board"
                  options={[
                    { value: "CBSE", label: "CBSE" },
                    { value: "ICSE", label: "ICSE" },
                    { value: "State Board", label: "State Board" },
                    { value: "Other", label: "Other" },
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Passing"
                  type="number"
                  value={formData.twelfth_year}
                  onChange={handleInputChange}
                  field="twelfth_year"
                  placeholder="2021"
                  required
                  disabled={!isEditing}
                />
                <SelectField
                  label="Stream"
                  value={formData.twelfth_stream}
                  onChange={handleInputChange}
                  field="twelfth_stream"
                  options={[
                    { value: "Science", label: "Science" },
                    { value: "Commerce", label: "Commerce" },
                    { value: "Arts", label: "Arts" },
                    { value: "Other", label: "Other" },
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Percentage/CGPA"
                  value={formData.twelfth_score}
                  onChange={handleInputChange}
                  field="twelfth_score"
                  placeholder="88% or 9.2 CGPA"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Undergraduate */}
            <Section
              id="ug"
              title="Undergraduate Details"
              icon={GraduationCap}
              visible={shouldShowUG}
              isExpanded={expandedSection === "ug"}
              isComplete={isSectionComplete("ug")}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Degree"
                  value={formData.ug_degree}
                  onChange={handleInputChange}
                  field="ug_degree"
                  placeholder="B.Tech, B.Sc, B.Com, etc."
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Field of Study"
                  value={formData.ug_field}
                  onChange={handleInputChange}
                  field="ug_field"
                  placeholder="Computer Science, Mechanical, etc."
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Graduation"
                  type="number"
                  value={formData.ug_year}
                  onChange={handleInputChange}
                  field="ug_year"
                  placeholder="2024"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="CGPA/Percentage"
                  value={formData.ug_score}
                  onChange={handleInputChange}
                  field="ug_score"
                  placeholder="8.5 CGPA or 85%"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Postgraduate */}
            <Section
              id="pg"
              title="Postgraduate/Masters Details"
              icon={GraduationCap}
              visible={shouldShowPG}
              isExpanded={expandedSection === "pg"}
              isComplete={isSectionComplete("pg")}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Degree"
                  value={formData.pg_degree}
                  onChange={handleInputChange}
                  field="pg_degree"
                  placeholder="M.Tech, M.Sc, MBA, etc."
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Field of Study"
                  value={formData.pg_field}
                  onChange={handleInputChange}
                  field="pg_field"
                  placeholder="Specialization"
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Graduation"
                  type="number"
                  value={formData.pg_year}
                  onChange={handleInputChange}
                  field="pg_year"
                  placeholder="2024"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="CGPA/Percentage"
                  value={formData.pg_score}
                  onChange={handleInputChange}
                  field="pg_score"
                  placeholder="8.5 CGPA or 85%"
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Test Scores */}
            <Section
              id="tests"
              title="Test Scores"
              icon={BookOpen}
              isExpanded={expandedSection === "tests"}
              isComplete={isSectionComplete("tests")}
              onToggle={toggleSection}
            >
              <div className="flex items-center justify-between mb-4">
                {isEditing && (
                  <button
                    onClick={addTestScore}
                    className="flex items-center gap-2 bg-[#2f61ce] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#254da6] transition-all ml-auto text-sm sm:text-base"
                  >
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Add Test
                  </button>
                )}
              </div>
              {formData.testScores.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  {isEditing ? (
                    <p>No test scores added yet. Click &quot;Add Test&quot; to add your scores.</p>
                  ) : (
                    <p>No test scores available.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.testScores.map((test, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                        {isEditing ? (
                          <select
                            value={test.exam}
                            onChange={(e) => handleTestScoreChange(index, "exam", e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce]"
                          >
                            <option value="">Select Exam</option>
                            {COMMON_EXAMS.map((exam) => (
                              <option key={exam} value={exam}>
                                {exam}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 rounded-lg">{test.exam}</p>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Percentile</label>
                        <input
                          type="text"
                          value={test.percentile}
                          onChange={(e) => handleTestScoreChange(index, "percentile", e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] disabled:bg-gray-100"
                          placeholder="e.g., 85, 90, 95"
                        />
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeTestScore(index)}
                          className="sm:mt-8 p-2 sm:p-3 text-[#2f61ce] hover:bg-[#eef3fc] rounded-lg transition-all self-end sm:self-auto"
                          title="Remove test"
                        >
                          <Minus size={18} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

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
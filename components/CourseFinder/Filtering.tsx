import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronDown,
  Filter,
  X,
  MapPin,
  GraduationCap,
  IndianRupee,
  BookOpen,
} from "lucide-react"
import { parseSearchQuery, isBudgetInRange } from "../../utils/data"

// --- Interfaces and Constants ---

interface Course {
  id: number
  slug?: string
  card_detail?: {
    college_name?: string
    location?: string
    rating?: string
    review_count?: string
    avg_package?: string
    high_package?: string
    fees?: string
    ranking?: string
    approvals?: string
    scholarship?: string
    entrance_exam?: string
    courses?: string[]
  }
}

interface FilterProps {
  onSearchChange: (query: string) => void
  onManualFilterChange: (filters: ManualFilters) => void
  initialQuery?: string
  allColleges?: Course[]
}

export interface ManualFilters {
  states: string[]
  city: string
  collegeName: string
  budgets: string[]
  exams: string[]
  courses: string[]
}

// Color scheme matching the home page
const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi NCR",
  "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
]

const BUDGET_OPTIONS = [
  "Less than 5 Lakh",
  "5 - 10 Lakh",
  "10 - 15 Lakh",
  "15 - 20 Lakh",
  "Above 20 Lakh",
]

const COMMON_EXAMS = [
  'CAT', 'XAT', 'CMAT', 'MAT', 'GMAT', 'NMAT', 'SNAP', 'ATMA', 'JEE', 'GATE','TANCET' 
]

// --- Component Definition ---

const FilterComponent: React.FC<FilterProps> = ({ 
  onSearchChange, 
  onManualFilterChange,
  initialQuery = "",
  allColleges = []
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCollegeName, setSelectedCollegeName] = useState("")
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([])
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [availableCourses, setAvailableCourses] = useState<string[]>([])

  // Extract unique courses from all colleges
  useEffect(() => {
    const coursesSet = new Set<string>()
  allColleges.forEach(college => {
    if (college.card_detail?.courses && Array.isArray(college.card_detail.courses)) {
      college.card_detail.courses.forEach(course => {
        // Clean up course names - remove view counts and extra info
        let cleanCourse = course
          .replace(/\(\d+\.?\d*[KkMm]?Views?\)/gi, '') // Remove (1.1KViews), (2.0Views), etc.
          .replace(/\[.*?\]/g, '') // Remove content in square brackets
          .replace(/\{.*?\}/g, '') // Remove content in curly brackets
          .replace(/^\(.*?\)/, '') // Remove leading parentheses content
          .trim()

          
          if (cleanCourse && cleanCourse.length > 0) {
            coursesSet.add(cleanCourse)
          }
        })
      }
    })
    
    // Convert to array and sort
    const sortedCourses = Array.from(coursesSet).sort()
    setAvailableCourses(sortedCourses)
  }, [allColleges])

  // Initialize search query from URL
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery)
      // Auto-parse and set filters
      const parsed = parseSearchQuery(initialQuery)
      if (parsed.states.length > 0) setSelectedStates(parsed.states)
      if (parsed.budgetRanges.length > 0) setSelectedBudgets(parsed.budgetRanges)
      if (parsed.entranceExams.length > 0) setSelectedExams(parsed.entranceExams)
      if (parsed.courses.length > 0) setSelectedCourses(parsed.courses)
    }
  }, [initialQuery])

  // Notify parent when manual filters change
  useEffect(() => {
    const filters: ManualFilters = {
      states: selectedStates,
      city: selectedCity,
      collegeName: selectedCollegeName,
      budgets: selectedBudgets,
      exams: selectedExams,
      courses: selectedCourses
    }
    onManualFilterChange(filters)
  }, [selectedStates, selectedCity, selectedCollegeName, selectedBudgets, selectedExams, selectedCourses])

  const handleSearch = () => {
    onSearchChange(searchQuery)
    const params = new URLSearchParams(window.location.search)
  if (searchQuery.trim()) {
    params.set('q', searchQuery)
  } else {
    params.delete('q')
  }
  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newUrl)
  }

  const handleStateToggle = (state: string) => {
    setSelectedStates((prev) => 
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    )
    setSelectedCity("")
    setSelectedCollegeName("")
  }

  const handleBudgetToggle = (budget: string) => {
    setSelectedBudgets((prev) => 
      prev.includes(budget) ? prev.filter((b) => b !== budget) : [...prev, budget]
    )
  }

  const handleExamToggle = (exam: string) => {
    setSelectedExams((prev) => 
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    )
  }

  const handleCourseToggle = (course: string) => {
    setSelectedCourses((prev) => 
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
    )
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedStates([])
    setSelectedCity("")
    setSelectedCollegeName("")
    setSelectedBudgets([])
    setSelectedExams([])
    setSelectedCourses([])
    onSearchChange("")
    window.history.replaceState({}, '', window.location.pathname)
  }

  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case "state":
        setSelectedStates([])
        setSelectedCity("")
        setSelectedCollegeName("")
        break
      case "city":
        setSelectedCity("")
        setSelectedCollegeName("")
        break
      case "college":
        setSelectedCollegeName("")
        break
      case "budget":
        setSelectedBudgets([])
        break
      case "exam":
        setSelectedExams([])
        break
      case "course":
        setSelectedCourses([])
        break
      case "search":
        setSearchQuery("")
        onSearchChange("")
        window.history.replaceState({}, '', window.location.pathname)
        break
    }
  }

  const activeFiltersCount = [
    searchQuery,
    selectedStates.length > 0 ? "states" : "",
    selectedCity,
    selectedCollegeName,
    selectedBudgets.length > 0 ? "budgets" : "",
    selectedExams.length > 0 ? "exams" : "",
    selectedCourses.length > 0 ? "courses" : "",
  ].filter(Boolean).length

  return (
    <>
      <div 
        className="rounded-xl shadow-lg p-6 mb-6 backdrop-blur-xl"
        style={{ 
          backgroundColor: secondaryBg, 
          border: `1px solid ${borderColor}` 
        }}
      >
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Try: BCA colleges in Delhi under 5 lakh..."
              className="w-full px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500"
              style={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                border: `1px solid ${borderColor}`,
                outline: 'none'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            Search
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <Filter size={20} />
            Filters
            {activeFiltersCount > 0 && (
              <span 
                className="px-2 py-0.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'white', color: accentColor }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">Search: {searchQuery}</span>
                <button 
                  onClick={() => clearFilter("search")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedStates.length > 0 && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">States: {selectedStates.join(", ")}</span>
                <button 
                  onClick={() => clearFilter("state")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedBudgets.length > 0 && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">Budget: {selectedBudgets.join(", ")}</span>
                <button 
                  onClick={() => clearFilter("budget")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedExams.length > 0 && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">Exams: {selectedExams.join(", ")}</span>
                <button 
                  onClick={() => clearFilter("exam")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCourses.length > 0 && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">Courses: {selectedCourses.join(", ")}</span>
                <button 
                  onClick={() => clearFilter("course")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button 
              onClick={resetFilters} 
              className="text-sm font-medium px-2 hover:opacity-80"
              style={{ color: accentColor }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Dropdowns Section */}
      {showFilters && (
        <div 
          className="rounded-xl shadow-lg p-6 mb-6 backdrop-blur-xl"
          style={{ 
            backgroundColor: secondaryBg, 
            border: `1px solid ${borderColor}` 
          }}
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
            <Filter size={20} style={{ color: accentColor }} />
            Refine Your Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* States Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <MapPin size={16} style={{ color: accentColor }} />
                States (Multiple)
              </label>
              <div 
                className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)', 
                  border: `1px solid ${borderColor}` 
                }}
              >
                {indianStates.map((state) => (
                  <label 
                    key={state} 
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: accentColor }}
                    />
                    <span className="text-sm text-slate-300">{state}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Courses Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <BookOpen size={16} style={{ color: accentColor }} />
                Courses (Multiple)
              </label>
              <div 
                className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)', 
                  border: `1px solid ${borderColor}` 
                }}
              >
                {availableCourses.length > 0 ? (
                  availableCourses.map((course) => (
                    <label 
                      key={course} 
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course)}
                        onChange={() => handleCourseToggle(course)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: accentColor }}
                      />
                      <span className="text-sm text-slate-300">{course}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 p-2">No courses available</p>
                )}
              </div>
            </div>

            {/* Budget Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <IndianRupee size={16} style={{ color: accentColor }} />
                Budget (Multiple)
              </label>
              <div 
                className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)', 
                  border: `1px solid ${borderColor}` 
                }}
              >
                {BUDGET_OPTIONS.map((budget) => (
                  <label 
                    key={budget} 
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBudgets.includes(budget)}
                      onChange={() => handleBudgetToggle(budget)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: accentColor }}
                    />
                    <span className="text-sm text-slate-300">{budget}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Entrance Exams Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <GraduationCap size={16} style={{ color: accentColor }} />
                Entrance Exams (Multiple)
              </label>
              <div 
                className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)', 
                  border: `1px solid ${borderColor}` 
                }}
              >
                {COMMON_EXAMS.map((exam) => (
                  <label 
                    key={exam} 
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam)}
                      onChange={() => handleExamToggle(exam)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: accentColor }}
                    />
                    <span className="text-sm text-slate-300">{exam}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FilterComponent
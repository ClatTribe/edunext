import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronDown,
  Filter,
  X,
  MapPin,
  GraduationCap,
  IndianRupee,
} from "lucide-react"

// --- Interfaces and Constants ---

interface Course {
  id: number
  "College Name": string | null
  City?: string | null
  State?: string | null
  Specialization?: string | null
  "Average Package"?: string | null
}

interface FilterProps {
  courses: Course[]
  viewMode: "all" | "recommended"
  onFilterChange: (filtered: Course[]) => void
}

// Color scheme matching the home page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';

const cityToStatesMapping: Record<string, string[]> = {
  "New Delhi": ["Delhi NCR"],
  Delhi: ["Delhi NCR"],
  Gurugram: ["Haryana", "Delhi NCR"],
  Gurgaon: ["Haryana", "Delhi NCR"],
  Noida: ["Uttar Pradesh", "Delhi NCR"],
  "Greater Noida": ["Uttar Pradesh", "Delhi NCR"],
  Ghaziabad: ["Uttar Pradesh", "Delhi NCR"],
  Faridabad: ["Haryana", "Delhi NCR"],
  Meerut: ["Uttar Pradesh", "Delhi NCR"],
}

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
]

const BUDGET_OPTIONS = [
  "Less than 5 Lakh",
  "5 - 10 Lakh",
  "10 - 15 Lakh",
  "15 - 20 Lakh",
  "Above 20 Lakh",
]

const parseBudgetToLakhs = (budgetStr: string | null | undefined): number | null => {
  if (!budgetStr) return null

  const cleanStr = budgetStr.replace(/[₹,]/g, "").trim().toLowerCase()

  if (cleanStr.includes("lakh")) {
    const lakhMatch = cleanStr.match(/(\d+(\.\d+)?)\s*lakh/)
    return lakhMatch ? parseFloat(lakhMatch[1]) : null
  }

  const rupeeMatch = cleanStr.match(/(\d+)/)
  if (rupeeMatch) {
    const rupees = parseInt(rupeeMatch[1], 10)
    if (rupees > 10000) {
      return rupees / 100000
    }
  }

  return null
}

const isBudgetInRange = (packageStr: string | null | undefined, selectedRanges: string[]): boolean => {
  if (selectedRanges.length === 0) return true 

  const pkgLakhs = parseBudgetToLakhs(packageStr)
  if (pkgLakhs === null) return false

  return selectedRanges.some(range => {
    switch (range) {
      case "Less than 5 Lakh":
        return pkgLakhs <= 5
      case "5 - 10 Lakh":
        return pkgLakhs > 5 && pkgLakhs <= 10
      case "10 - 15 Lakh":
        return pkgLakhs > 10 && pkgLakhs <= 15
      case "15 - 20 Lakh":
        return pkgLakhs > 15 && pkgLakhs <= 20
      case "Above 20 Lakh":
        return pkgLakhs > 20
      default:
        return false
    }
  })
}

// --- Component Definition ---

const FilterComponent: React.FC<FilterProps> = ({ courses, viewMode, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCollegeName, setSelectedCollegeName] = useState("")
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([])

  const applyFilters = useCallback(() => {
    let filtered = [...courses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.Specialization?.toLowerCase().includes(query) || course["College Name"]?.toLowerCase().includes(query)
      )
    }

    if (selectedStates.length > 0) {
      filtered = filtered.filter((course) => {
        const city = course.City ?? ""
        return (
          selectedStates.includes(course.State || "") ||
          (city && cityToStatesMapping[city] && selectedStates.some((state) => cityToStatesMapping[city]?.includes(state)))
        )
      })
    }

    if (selectedCity) {
      filtered = filtered.filter((course) => course.City === selectedCity)
    }

    if (selectedCollegeName) {
      filtered = filtered.filter((course) => course["College Name"] === selectedCollegeName)
    }

    if (selectedBudgets.length > 0) {
      filtered = filtered.filter((course) => isBudgetInRange(course["Average Package"], selectedBudgets))
    }

    onFilterChange(filtered)
  }, [searchQuery, selectedStates, selectedCity, selectedCollegeName, selectedBudgets, courses, onFilterChange])

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [applyFilters, viewMode])

  const handleStateToggle = (state: string) => {
    setSelectedStates((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]))
    setSelectedCity("")
    setSelectedCollegeName("")
  }

  const handleBudgetToggle = (budget: string) => {
    setSelectedBudgets((prev) => (prev.includes(budget) ? prev.filter((b) => b !== budget) : [...prev, budget]))
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedStates([])
    setSelectedCity("")
    setSelectedCollegeName("")
    setSelectedBudgets([])
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
      case "search":
        setSearchQuery("")
        break
    }
  }

  const getFilteredCities = () => {
    let filtered = courses

    if (selectedStates.length > 0) {
      filtered = filtered.filter((c) => {
        const directMatch = selectedStates.includes(c.State || "")
        const ncrMatch = c.City && selectedStates.some((state) => cityToStatesMapping[c.City!]?.includes(state))
        return directMatch || ncrMatch
      })
    }

    if (selectedBudgets.length > 0) {
        filtered = filtered.filter((course) => isBudgetInRange(course["Average Package"], selectedBudgets))
    }

    return Array.from(new Set(filtered.map((c) => c.City).filter((c): c is string => Boolean(c))))
  }

  const getFilteredColleges = () => {
    let filtered = courses

    if (selectedStates.length > 0) {
      filtered = filtered.filter((c) => {
        const directMatch = selectedStates.includes(c.State || "")
        const ncrMatch = c.City && selectedStates.some((state) => cityToStatesMapping[c.City!]?.includes(state))
        return directMatch || ncrMatch
      })
    }

    if (selectedCity) filtered = filtered.filter((c) => c.City === selectedCity)

    if (selectedBudgets.length > 0) {
        filtered = filtered.filter((course) => isBudgetInRange(course["Average Package"], selectedBudgets))
    }

    return Array.from(new Set(filtered.map((c) => c["College Name"]).filter((c): c is string => Boolean(c))))
  }

  const uniqueCities = getFilteredCities()
  const uniqueColleges = getFilteredColleges()

  const activeFiltersCount = [
    searchQuery,
    selectedStates.length > 0 ? "states" : "",
    selectedCity,
    selectedCollegeName,
    selectedBudgets.length > 0 ? "budgets" : "",
  ].filter(Boolean).length

  if (viewMode !== "all") return null

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
              placeholder="Search for programs or institutes..."
              className="w-full px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500"
              style={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                border: `1px solid ${borderColor}`,
                outline: 'none'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
          </div>

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

            {selectedCity && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">City: {selectedCity}</span>
                <button 
                  onClick={() => clearFilter("city")} 
                  className="rounded-full p-0.5 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCollegeName && (
              <div 
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}
              >
                <span className="font-medium">College: {selectedCollegeName}</span>
                <button 
                  onClick={() => clearFilter("college")} 
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

            {/* City Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <MapPin size={16} style={{ color: accentColor }} />
                City
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 text-white"
                  style={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    border: selectedStates.length > 0 
                      ? `1px solid ${accentColor}` 
                      : `1px solid ${borderColor}`,
                    outline: 'none'
                  }}
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setSelectedCollegeName("")
                  }}
                >
                  <option value="" style={{ backgroundColor: secondaryBg }}>All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city} style={{ backgroundColor: secondaryBg }}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* College Name Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <GraduationCap size={16} style={{ color: accentColor }} />
                College Name
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 font-semibold text-white"
                  style={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    border: (selectedStates.length > 0 || selectedCity) 
                      ? `1px solid ${accentColor}` 
                      : `1px solid ${borderColor}`,
                    outline: 'none'
                  }}
                  value={selectedCollegeName}
                  onChange={(e) => setSelectedCollegeName(e.target.value)}
                >
                  <option value="" style={{ backgroundColor: secondaryBg }}>All Colleges</option>
                  {uniqueColleges.map((college) => (
                    <option key={college} value={college} style={{ backgroundColor: secondaryBg }}>
                      {college}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-slate-400" />
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
          </div>
        </div>
      )}
    </>
  )
}

export default FilterComponent
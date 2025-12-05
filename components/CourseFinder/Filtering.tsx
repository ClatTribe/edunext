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
  "Average Package"?: string | null // Can be string, null, or undefined
}

interface FilterProps {
  courses: Course[]
  viewMode: "all" | "recommended"
  // NOTE: In the parent component, this prop MUST be wrapped in React.useCallback 
  // to avoid the "Maximum update depth exceeded" error.
  onFilterChange: (filtered: Course[]) => void
}

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

// FIX: Updated signature to accept string | null | undefined to resolve TS errors (2345)
const parseBudgetToLakhs = (budgetStr: string | null | undefined): number | null => {
  if (!budgetStr) return null

  const cleanStr = budgetStr.replace(/[₹,]/g, "").trim().toLowerCase()

  if (cleanStr.includes("lakh")) {
    const lakhMatch = cleanStr.match(/(\d+(\.\d+)?)\s*lakh/)
    return lakhMatch ? parseFloat(lakhMatch[1]) : null
  }

  // Assuming it's in absolute rupee format if large number
  const rupeeMatch = cleanStr.match(/(\d+)/)
  if (rupeeMatch) {
    const rupees = parseInt(rupeeMatch[1], 10)
    // Check if it's large enough to be a rupee amount, e.g., > 10,000
    if (rupees > 10000) {
      return rupees / 100000 // Convert to lakhs
    }
  }

  return null
}

// FIX: Updated signature to accept string | null | undefined to resolve TS errors (2345)
const isBudgetInRange = (packageStr: string | null | undefined, selectedRanges: string[]): boolean => {
  if (selectedRanges.length === 0) return true 

  const pkgLakhs = parseBudgetToLakhs(packageStr)
  if (pkgLakhs === null) return false // Cannot filter if package is invalid/missing

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

    // Apply multiple budget filters
    if (selectedBudgets.length > 0) {
      filtered = filtered.filter((course) => isBudgetInRange(course["Average Package"], selectedBudgets))
    }

    onFilterChange(filtered)
  }, [searchQuery, selectedStates, selectedCity, selectedCollegeName, selectedBudgets, courses, onFilterChange])

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
    // NOTE: If `applyFilters` (or `onFilterChange` which is a dependency) is not stable, 
    // this useEffect will cause an infinite loop. The fix is wrapping `onFilterChange` 
    // in the parent component with `useCallback`.
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

    // Apply budget filter to available cities
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

    // Apply budget filter to available colleges
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
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search for programs or institutes..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-[#005de6] text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Filter size={20} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white text-[#005de6] px-2 py-0.5 rounded-full text-sm font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">Search: {searchQuery}</span>
                <button onClick={() => clearFilter("search")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedStates.length > 0 && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">States: {selectedStates.join(", ")}</span>
                <button onClick={() => clearFilter("state")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCity && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">City: {selectedCity}</span>
                <button onClick={() => clearFilter("city")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCollegeName && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">College: {selectedCollegeName}</span>
                <button onClick={() => clearFilter("college")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedBudgets.length > 0 && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {/* Updated display text */}
                <span className="font-medium">Budget: {selectedBudgets.join(", ")}</span>
                <button onClick={() => clearFilter("budget")} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            <button onClick={resetFilters} className="text-sm text-[#005de6] hover:text-blue-700 font-medium px-2">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Dropdowns Section */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Filter size={20} className="text-[#005de6]" />
            Refine Your Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* States Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="text-[#005de6]" />
                States (Multiple)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                {indianStates.map((state) => (
                  <label key={state} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="w-4 h-4 rounded border-gray-300 text-[#005de6] focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="text-[#005de6]" />
                City
              </label>
              <div className="relative">
                <select
                  className={`appearance-none w-full bg-gray-50 border ${
                    selectedStates.length > 0 ? "border-blue-400" : "border-gray-300"
                  } rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setSelectedCollegeName("")
                  }}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* College Name Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={16} className="text-[#005de6]" />
                College Name
              </label>
              <div className="relative">
                <select
                  className={`appearance-none w-full bg-gray-50 border ${
                    selectedStates.length > 0 || selectedCity ? "border-blue-400" : "border-gray-300"
                  } rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-800`}
                  value={selectedCollegeName}
                  onChange={(e) => setSelectedCollegeName(e.target.value)}
                >
                  <option value="">All Colleges</option>
                  {uniqueColleges.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* Budget Filter (New Multi-select) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IndianRupee size={16} className="text-[#005de6]" />
                Budget (Multiple)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                {BUDGET_OPTIONS.map((budget) => (
                  <label key={budget} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedBudgets.includes(budget)}
                      onChange={() => handleBudgetToggle(budget)}
                      className="w-4 h-4 rounded border-gray-300 text-[#005de6] focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{budget}</span>
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
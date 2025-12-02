import React, { useState, useEffect } from "react"
import {
  Search,
  ChevronDown,
  Filter,
  X,
  MapPin,
  GraduationCap,
  IndianRupee,
} from "lucide-react"

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

const FilterComponent: React.FC<FilterProps> = ({ courses, viewMode, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCollegeName, setSelectedCollegeName] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("")

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [
    searchQuery,
    selectedStates,
    selectedCity,
    selectedCollegeName,
    selectedBudget,
    courses,
    viewMode,
  ])

  const applyFilters = () => {
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

    if (selectedBudget) {
      filtered = filtered.filter((course) => {
        return course["Average Package"]?.toLowerCase().includes(selectedBudget.toLowerCase())
      })
    }

    onFilterChange(filtered)
  }

  const handleStateToggle = (state: string) => {
    setSelectedStates((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]))
    setSelectedCity("")
    setSelectedCollegeName("")
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedStates([])
    setSelectedCity("")
    setSelectedCollegeName("")
    setSelectedBudget("")
  }

  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case "state":
        setSelectedStates([])
        break
      case "city":
        setSelectedCity("")
        break
      case "college":
        setSelectedCollegeName("")
        break
      case "budget":
        setSelectedBudget("")
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

    return Array.from(new Set(filtered.map((c) => c["College Name"]).filter((c): c is string => Boolean(c))))
  }

  const uniqueCities = getFilteredCities()
  const uniqueColleges = getFilteredColleges()

  const activeFiltersCount = [
    searchQuery,
    selectedStates.length > 0 ? "states" : "",
    selectedCity,
    selectedCollegeName,
    selectedBudget,
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
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">Search: {searchQuery}</span>
                <button onClick={() => clearFilter("search")} className="hover:bg-red-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedStates.length > 0 && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">{selectedStates.join(", ")}</span>
                <button onClick={() => clearFilter("state")} className="hover:bg-red-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCity && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">{selectedCity}</span>
                <button onClick={() => clearFilter("city")} className="hover:bg-red-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCollegeName && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">{selectedCollegeName}</span>
                <button onClick={() => clearFilter("college")} className="hover:bg-red-200 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedBudget && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="font-medium">Budget: {selectedBudget}</span>
                <button onClick={() => clearFilter("budget")} className="hover:bg-red-200 rounded-full p-0.5">
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

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Filter size={20} className="text-[#005de6]" />
            Refine Your Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={16} className="text-[#005de6]" />
                College Name
              </label>
              <div className="relative">
                <select
                  className={`appearance-none w-full bg-gray-50 border ${
                    selectedStates.length > 0 || selectedCity ? "border-red-400 bg-red-50" : "border-gray-300"
                  } rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-gray-800`}
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IndianRupee size={16} className="text-[#005de6]" />
                Budget
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., 10 Lakhs, 20 Lakhs"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FilterComponent
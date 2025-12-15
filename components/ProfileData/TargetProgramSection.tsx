import React from "react"
import { Target } from "lucide-react"

// Color scheme matching the college compare page
const accentColor = '#F59E0B';
const primaryBg = '#050818'; // Very dark navy blue
const secondaryBg = '#0F172B'; // Slightly lighter navy
const borderColor = 'rgba(245, 158, 11, 0.15)';


interface TargetProgramSectionProps {
  formData: {
    target_state: string[]
    target_degree: string
    academic_year: string
    budget: string[] // Changed from string to string[]
  }
  isEditing: boolean
  isExpanded: boolean
  isComplete: boolean
  onToggle: (id: string) => void
  onInputChange: (field: string, value: string) => void
  onMultiSelect: (value: string) => void
  onMultiSelectBudget: (value: string) => void
  Section: any
  SelectField: any
}

const COUNTRIES = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Haryana", "West Bengal (Other)"]

const DEGREE_OPTIONS = [
  { value: "MBA", label: "MBA" },
]

const TERM_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028 or later" },
]

const BUDGET_OPTIONS = [
  { value: "5L", label: "₹5 Lakhs" },
  { value: "5-10L", label: "₹5-10 Lakhs" },
  { value: "10-15L", label: "₹10-15 Lakhs" },
  { value: "Above 15L", label: "Above ₹15 Lakhs" },
]

const TargetProgramSection: React.FC<TargetProgramSectionProps> = ({
  formData,
  isEditing,
  isExpanded,
  isComplete,
  onToggle,
  onInputChange,
  onMultiSelect,
  onMultiSelectBudget,
  Section,
  SelectField,
}) => {
  return (
    <Section
      id="target"
      title="What are you looking to study?"
      icon={Target}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          Preferred States <span style={{ color: accentColor }}>*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => isEditing && onMultiSelect(country)}
              disabled={!isEditing}
              className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base font-medium ${
                !isEditing ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={
                formData.target_state.includes(country)
                  ? {
                      borderColor: accentColor,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: accentColor,
                    }
                  : {
                      borderColor: borderColor,
                      backgroundColor: primaryBg,
                      color: '#FFFFFF',
                    }
              }
              onMouseEnter={(e) => {
                if (isEditing && !formData.target_state.includes(country)) {
                  e.currentTarget.style.borderColor = accentColor
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !formData.target_state.includes(country)) {
                  e.currentTarget.style.borderColor = borderColor
                }
              }}
            >
              {country}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SelectField
          label="What degree are you applying for?"
          value={formData.target_degree}
          onChange={onInputChange}
          field="target_degree"
          options={DEGREE_OPTIONS}
          required
          disabled={!isEditing}
        />
        <SelectField
          label="When do you plan to start?"
          value={formData.academic_year}
          onChange={onInputChange}
          field="academic_year"
          options={TERM_OPTIONS}
          disabled={!isEditing}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          Budget Range (Annual) <span className="text-slate-500 text-xs">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => isEditing && onMultiSelectBudget(option.value)}
              disabled={!isEditing}
              className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base font-medium ${
                !isEditing ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={
                formData.budget.includes(option.value)
                  ? {
                      borderColor: accentColor,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: accentColor,
                    }
                  : {
                      borderColor: borderColor,
                      backgroundColor: primaryBg,
                      color: '#FFFFFF',
                    }
              }
              onMouseEnter={(e) => {
                if (isEditing && !formData.budget.includes(option.value)) {
                  e.currentTarget.style.borderColor = accentColor
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !formData.budget.includes(option.value)) {
                  e.currentTarget.style.borderColor = borderColor
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}

export default TargetProgramSection
import React, { useState } from "react"
import { Target } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const borderColor = 'rgba(245, 158, 11, 0.15)'

interface TargetProgramSectionProps {
  formData: {
    target_state: string[]
    target_degree: string
    academic_year: string
    budget: string[]
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

// ─── All Indian States & UTs ─────────────────────────────────────────────────

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Chandigarh", "Jammu & Kashmir", "Puducherry",
]

// ─── Degree / Stream Options (your 33 categories + Other) ────────────────────

const DEGREE_OPTIONS = [
  { value: "B.Tech", label: "B.Tech / Engineering" },
  { value: "MBA", label: "MBA" },
  { value: "BBA/BMS", label: "BBA / BMS" },
  { value: "Medical", label: "Medical (MBBS)" },
  { value: "Commerce", label: "Commerce (B.Com / M.Com)" },
  { value: "Science", label: "Science (B.Sc / M.Sc)" },
  { value: "Arts", label: "Arts (BA / MA)" },
  { value: "Dental", label: "Dental (BDS)" },
  { value: "Computer Applications", label: "Computer Applications (MCA)" },
  { value: "BCA", label: "BCA" },
  { value: "Pharmacy", label: "Pharmacy (B.Pharm / M.Pharm)" },
  { value: "Law", label: "Law (LLB / LLM)" },
  { value: "Architecture", label: "Architecture (B.Arch)" },
  { value: "Hotel Management", label: "Hotel Management" },
  { value: "Hospitality Management", label: "Hospitality Management" },
  { value: "Education", label: "Education (B.Ed / M.Ed)" },
  { value: "Mass Communications", label: "Mass Communications" },
  { value: "Journalism", label: "Journalism" },
  { value: "Nursing", label: "Nursing (B.Sc / M.Sc)" },
  { value: "Design", label: "Design" },
  { value: "Fashion Design", label: "Fashion Design" },
  { value: "Fashion Technology", label: "Fashion Technology" },
  { value: "Agriculture", label: "Agriculture (B.Sc Agri)" },
  { value: "Physiotherapy", label: "Physiotherapy (BPT)" },
  { value: "Social Work", label: "Social Work (BSW / MSW)" },
  { value: "Animation", label: "Animation & Multimedia" },
  { value: "Research", label: "Research / PhD" },
  { value: "Veterinary Sciences", label: "Veterinary Sciences" },
  { value: "Executive MBA", label: "Executive MBA" },
  { value: "Ayurved", label: "Ayurveda (BAMS)" },
  { value: "Open University", label: "Open / Distance Learning" },
  { value: "Other", label: "Other" },
]

const TERM_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028 or later" },
]

const BUDGET_OPTIONS = [
  { value: "Under 1L", label: "Under ₹1 Lakh" },
  { value: "1-3L", label: "₹1–3 Lakhs" },
  { value: "3-5L", label: "₹3–5 Lakhs" },
  { value: "5-10L", label: "₹5–10 Lakhs" },
  { value: "10-15L", label: "₹10–15 Lakhs" },
  { value: "15-25L", label: "₹15–25 Lakhs" },
  { value: "Above 25L", label: "Above ₹25 Lakhs" },
]

// ─── Pill Button (reusable for states & budget) ─────────────────────────────

function PillButton({
  label, selected, disabled, onClick,
}: {
  label: string; selected: boolean; disabled: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={
        selected
          ? { borderColor: accentColor, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: accentColor }
          : { borderColor: borderColor, backgroundColor: primaryBg, color: '#FFFFFF' }
      }
    >
      {label}
    </button>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const TargetProgramSection: React.FC<TargetProgramSectionProps> = ({
  formData, isEditing, isExpanded, isComplete,
  onToggle, onInputChange, onMultiSelect, onMultiSelectBudget,
  Section, SelectField,
}) => {
  const [showAllStates, setShowAllStates] = useState(false)
  const [customDegree, setCustomDegree] = useState("")

  // Show 8 popular states initially, expand to all on click
  const popularStates = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Haryana", "Tamil Nadu", "West Bengal", "Rajasthan"]
  const visibleStates = showAllStates ? STATES : popularStates

  const isOtherSelected = formData.target_degree === "Other"

  return (
    <Section
      id="target"
      title="What are you looking to study?"
      icon={Target}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      {/* ── Preferred States ── */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-white mb-2">
          Preferred States <span style={{ color: accentColor }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {visibleStates.map((state) => (
            <PillButton
              key={state}
              label={state}
              selected={formData.target_state.includes(state)}
              disabled={!isEditing}
              onClick={() => onMultiSelect(state)}
            />
          ))}
        </div>
        {!showAllStates && (
          <button
            type="button"
            onClick={() => setShowAllStates(true)}
            className="mt-2 text-xs font-bold uppercase tracking-wider hover:underline transition-colors"
            style={{ color: accentColor }}
          >
            + Show all states
          </button>
        )}
        {showAllStates && (
          <button
            type="button"
            onClick={() => setShowAllStates(false)}
            className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:underline transition-colors"
          >
            Show less
          </button>
        )}
      </div>

      {/* ── Degree + Year ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SelectField
          label="What degree / stream are you targeting?"
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

      {/* ── "Other" custom input ── */}
      {isOtherSelected && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Specify your stream / degree <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            type="text"
            value={customDegree}
            onChange={(e) => {
              setCustomDegree(e.target.value)
              // Store the custom value in specialization field so it's not lost
              onInputChange("specialization", e.target.value)
            }}
            placeholder="e.g. Integrated M.Sc, BDes, B.Voc..."
            disabled={!isEditing}
            className="w-full px-4 py-3 text-sm rounded-lg focus:outline-none text-white placeholder:text-slate-500"
            style={{
              backgroundColor: primaryBg,
              border: `1px solid ${borderColor}`,
              ...((!isEditing) && { backgroundColor: 'rgba(99, 102, 241, 0.05)' })
            }}
          />
          <p className="text-[10px] text-slate-500 mt-1">
            This helps us match colleges that offer your specific program
          </p>
        </div>
      )}

      {/* ── Budget ── */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-white mb-2">
          Annual Budget Range <span className="text-slate-500 text-xs">(Select all that fit)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((option) => (
            <PillButton
              key={option.value}
              label={option.label}
              selected={formData.budget.includes(option.value)}
              disabled={!isEditing}
              onClick={() => onMultiSelectBudget(option.value)}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

export default TargetProgramSection
import React from "react"
import { BookOpen, Plus, Minus } from "lucide-react"

// Color scheme matching the college compare page
const accentColor = '#6366f1'; // Indigo accent
const primaryBg = '#0a0f1e'; // Very dark navy blue
const secondaryBg = '#111827'; // Slightly lighter navy
const borderColor = 'rgba(99, 102, 241, 0.15)'; // Indigo border with opacity

interface TestScore {
  exam: string
  percentile: string
}

interface TestScoresSectionProps {
  testScores: TestScore[]
  isEditing: boolean
  isExpanded: boolean
  isComplete: boolean
  onToggle: (id: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, field: "exam" | "percentile", value: string) => void
  Section: any
}

const COMMON_EXAMS = ["CAT", "NMAT", "MAT", "XAT", "BITSAT", "GMAT", "CMAT", "SNAP", "Other"]

const TestScoresSection: React.FC<TestScoresSectionProps> = ({
  testScores,
  isEditing,
  isExpanded,
  isComplete,
  onToggle,
  onAdd,
  onRemove,
  onChange,
  Section,
}) => {
  return (
    <Section
      id="tests"
      title="Test Scores"
      icon={BookOpen}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-white px-3 sm:px-4 py-2 rounded-lg transition-all ml-auto text-sm sm:text-base hover:opacity-90"
            style={{ background: `linear-gradient(to right, ${accentColor}, #8b5cf6)` }}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            Add Test
          </button>
        )}
      </div>
      {testScores.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-slate-400 text-sm sm:text-base">
          {isEditing ? (
            <p>No test scores added yet. Click &quot;Add Test&quot; to add your scores.</p>
          ) : (
            <p>No test scores available.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {testScores.map((test, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: `1px solid ${borderColor}` }}
            >
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-300 mb-2">Exam Type</label>
                {isEditing ? (
                  <select
                    value={test.exam}
                    onChange={(e) => onChange(index, "exam", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none text-white"
                    style={{ 
                      backgroundColor: primaryBg, 
                      border: `1px solid ${borderColor}`,
                    }}
                    onFocus={(e) => e.target.style.border = `2px solid ${accentColor}`}
                    onBlur={(e) => e.target.style.border = `1px solid ${borderColor}`}
                  >
                    <option value="">Select Exam</option>
                    {COMMON_EXAMS.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p 
                    className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg text-white"
                    style={{ backgroundColor: primaryBg }}
                  >
                    {test.exam}
                  </p>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-300 mb-2">Percentile</label>
                <input
                  type="text"
                  value={test.percentile}
                  onChange={(e) => onChange(index, "percentile", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none text-white placeholder:text-slate-500"
                  style={{ 
                    backgroundColor: primaryBg, 
                    border: `1px solid ${borderColor}`,
                    ...(isEditing && {})
                  }}
                  onFocus={(e) => isEditing && (e.target.style.border = `2px solid ${accentColor}`)}
                  onBlur={(e) => isEditing && (e.target.style.border = `1px solid ${borderColor}`)}
                  placeholder="e.g., 85, 90, 95"
                />
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemove(index)}
                  className="sm:mt-8 p-2 sm:p-3 rounded-lg transition-all self-end sm:self-auto"
                  style={{ color: accentColor, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
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
  )
}

export default TestScoresSection
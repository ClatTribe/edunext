import React from "react"
import { BookOpen, Plus, Minus } from "lucide-react"

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
            className="flex items-center gap-2 bg-[#2f61ce] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#254da6] transition-all ml-auto text-sm sm:text-base"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            Add Test
          </button>
        )}
      </div>
      {testScores.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
          {isEditing ? (
            <p>No test scores added yet. Click &quot;Add Test&quot; to add your scores.</p>
          ) : (
            <p>No test scores available.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {testScores.map((test, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                {isEditing ? (
                  <select
                    value={test.exam}
                    onChange={(e) => onChange(index, "exam", e.target.value)}
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
                  onChange={(e) => onChange(index, "percentile", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f61ce] disabled:bg-gray-100"
                  placeholder="e.g., 85, 90, 95"
                />
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemove(index)}
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
  )
}

export default TestScoresSection
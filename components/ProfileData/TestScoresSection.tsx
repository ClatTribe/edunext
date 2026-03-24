"use client"

import React, { useState } from "react"
import { ClipboardCheck, Plus, Trash2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Category → Exams Map ────────────────────────────────────────────────────
// Category is ONLY a UI filter — never saved to DB.
// Only exam + percentile go to test_scores JSONB column.

const EXAM_CATEGORIES: Record<string, { label: string; exams: string[] }> = {
  engineering: {
    label: "Engineering",
    exams: [
      "JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE",
      "MET (Manipal)", "COMEDK", "WBJEE", "KCET", "MHT CET",
      "AP EAMCET", "TS EAMCET", "CUET",
    ],
  },
  management: {
    label: "Management",
    exams: [
      "CAT", "XAT", "MAT", "CMAT", "NMAT", "SNAP",
      "IPMAT", "TISSNET", "ATMA", "CUET",
    ],
  },
  medical: {
    label: "Medical",
    exams: ["NEET UG", "NEET PG", "AIIMS", "JIPMER"],
  },
  law: {
    label: "Law",
    exams: ["CLAT", "AILET", "LSAT India", "MH CET Law", "CUET"],
  },
  design: {
    label: "Design / Arch",
    exams: ["NATA", "JEE Main (B.Arch)", "NID DAT", "NIFT", "UCEED", "CEED"],
  },
  science: {
    label: "Science",
    exams: ["CUET", "GATE", "IIT JAM", "JEST", "CSIR NET"],
  },
  commerce: {
    label: "Commerce",
    exams: ["CUET", "CA Foundation", "CS Foundation"],
  },
  pharmacy: {
    label: "Pharmacy",
    exams: ["GPAT", "NEET UG", "MHT CET"],
  },
  hotel: {
    label: "Hotel Mgmt",
    exams: ["NCHMCT JEE", "CUET"],
  },
  education: {
    label: "Education",
    exams: ["CUET", "State B.Ed CET"],
  },
}

// ─── Props — matches EXACTLY what profile page passes ────────────────────────

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

// ─── Category Pill ───────────────────────────────────────────────────────────

function CategoryPill({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold cursor-pointer"
      style={
        selected
          ? { borderColor: accentColor, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: accentColor }
          : { borderColor: borderColor, backgroundColor: primaryBg, color: '#94a3b8' }
      }
    >
      {label}
    </button>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const TestScoresSection: React.FC<TestScoresSectionProps> = ({
  testScores, isEditing, isExpanded, isComplete,
  onToggle, onAdd, onRemove, onChange, Section,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get exams for selected category, filtering out already-added ones
  const categoryExams = selectedCategory ? EXAM_CATEGORIES[selectedCategory]?.exams || [] : []
  const addedExamNames = testScores.map(ts => ts.exam)
  const availableExams = categoryExams.filter(e => !addedExamNames.includes(e))

  // When user picks an exam from a category, we:
  // 1. Call onAdd() to add an empty row to formData.testScores
  // 2. Immediately set the exam name on that new row via onChange()
  const handleExamSelect = (examName: string) => {
    onAdd() // Adds { exam: "", percentile: "" } to the array
    // The new row is at the end of the array = testScores.length (before the add)
    const newIndex = testScores.length
    // Use setTimeout to ensure state has updated from onAdd first
    setTimeout(() => {
      onChange(newIndex, "exam", examName)
    }, 0)
  }

  return (
    <Section
      id="tests"
      title="Entrance Exam Scores"
      icon={ClipboardCheck}
      isExpanded={isExpanded}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      {/* ── Already added scores ── */}
      {testScores.length > 0 && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-white mb-2">
            Your Scores
          </label>
          <div className="space-y-2">
            {testScores.map((ts, i) => (
              <div
                key={`score-${i}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ borderColor: borderColor, backgroundColor: 'rgba(245, 158, 11, 0.04)' }}
              >
                {/* Exam name — if it was set via category picker, show as label. Otherwise editable. */}
                <div className="flex-1 min-w-0">
                  {ts.exam ? (
                    <span className="text-sm font-bold text-white">{ts.exam}</span>
                  ) : (
                    <input
                      type="text"
                      value={ts.exam}
                      onChange={(e) => onChange(i, "exam", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Exam name"
                      className="w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Percentile input */}
                <div className="w-24 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={ts.percentile}
                    onChange={(e) => onChange(i, "percentile", e.target.value)}
                    disabled={!isEditing}
                    placeholder="%ile"
                    className="w-full px-3 py-1.5 text-sm rounded-lg text-white placeholder:text-slate-600 focus:outline-none text-right font-bold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                </div>

                {/* Percentile label */}
                {ts.percentile && (
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">%ile</span>
                )}

                {/* Remove button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add new score (only in edit mode) ── */}
      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {testScores.length > 0 ? "Add Another Exam" : "Add Exam Score"}
          </label>

          {/* Step 1: Pick a category */}
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
            Select exam category
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(EXAM_CATEGORIES).map(([key, cat]) => (
              <CategoryPill
                key={key}
                label={cat.label}
                selected={selectedCategory === key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              />
            ))}
          </div>

          {/* Step 2: Pick exam from category */}
          {selectedCategory && (
            <div
              className="p-3 rounded-xl border"
              style={{ borderColor: borderColor, backgroundColor: 'rgba(5, 8, 24, 0.5)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                Tap an exam to add it
              </p>
              {availableExams.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableExams.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => handleExamSelect(exam)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/[0.06]"
                      style={{ borderColor: borderColor, backgroundColor: primaryBg, color: '#FFFFFF' }}
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      {exam}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-amber-500/70">
                  All exams in this category already added
                </p>
              )}
            </div>
          )}

          {/* Helper text */}
          {!selectedCategory && testScores.length === 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              Adding your exam scores helps us check if you meet college cutoffs
            </p>
          )}
        </div>
      )}

      {/* ── View-only empty state ── */}
      {!isEditing && testScores.length === 0 && (
        <p className="text-sm text-slate-500">
          No exam scores added yet. Click Edit to add your scores.
        </p>
      )}
    </Section>
  )
}

export default TestScoresSection
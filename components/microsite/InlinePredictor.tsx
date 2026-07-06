"use client"

import { useState, useEffect } from "react"
import { Target, CheckCircle2, AlertCircle } from "lucide-react"

type PredictorProps = {
  exam: string
}

const borderColor = "rgba(245, 158, 11, 0.15)"

export default function InlinePredictor({ exam }: PredictorProps) {
  const [score, setScore] = useState<string>("")
  const [hasPredicted, setHasPredicted] = useState(false)

  // Load saved score from localStorage on mount
  useEffect(() => {
    const savedScore = localStorage.getItem(`edunext_saved_${exam.toLowerCase()}_score`)
    if (savedScore) {
      setScore(savedScore)
      setHasPredicted(true) // Automatically trigger prediction UI state
      
      // Dispatch immediately so list knows on load
      const event = new CustomEvent('edunext_prediction_updated', { 
        detail: { exam, score: parseFloat(savedScore) } 
      })
      setTimeout(() => window.dispatchEvent(event), 100)
    }
  }, [exam])

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault()
    if (!score) return
    
    // Save to localStorage so it persists across other pages without login
    localStorage.setItem(`edunext_saved_${exam.toLowerCase()}_score`, score)
    setHasPredicted(true)
    
    // Dispatch a custom event so the BestCollegesList component can listen and update its UI
    const event = new CustomEvent('edunext_prediction_updated', { 
      detail: { exam, score: parseFloat(score) } 
    })
    window.dispatchEvent(event)
  }

  const handleReset = () => {
    setScore("")
    setHasPredicted(false)
    localStorage.removeItem(`edunext_saved_${exam.toLowerCase()}_score`)
    
    const event = new CustomEvent('edunext_prediction_updated', { 
      detail: { exam, score: null } 
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="rounded-2xl border bg-[#0F172B] p-5 relative overflow-hidden" style={{ borderColor }}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Target size={100} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1.5px] w-6 bg-amber-500" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">
            Check your {exam} Chances
          </h3>
        </div>
        
        <p className="text-xs text-slate-400 mb-4 max-w-md">
          Enter your {exam} score to instantly see your admission chances below. No login required.
        </p>

        <form onSubmit={handlePredict} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-[200px]">
            <input
              type="number"
              step="0.01"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={`${exam} Score`}
              className="w-full rounded-xl border border-amber-500/20 bg-[#050818] px-4 py-2.5 text-sm font-bold text-white placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            {hasPredicted && (
              <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#050818] transition-all hover:bg-amber-400"
            >
              Predict Now
            </button>
            {hasPredicted && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-transparent px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {hasPredicted && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-500/10 p-3 border border-green-500/20">
            <AlertCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-green-400">
              Score saved to your device! The list below has been updated to show your chances.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

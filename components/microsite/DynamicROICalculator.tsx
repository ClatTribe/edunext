"use client"

import { useState } from "react"
import { Calculator, TrendingUp } from "lucide-react"

type ROICalculatorProps = {
  colleges: any[]
}

const borderColor = "rgba(245, 158, 11, 0.15)"

export default function DynamicROICalculator({ colleges }: ROICalculatorProps) {
  const [sliderValue, setSliderValue] = useState<number>(10)
  const [isApplied, setIsApplied] = useState<boolean>(false)

  const handleApply = () => {
    setIsApplied(true)
    const event = new CustomEvent('edunext_roi_updated', { 
      detail: { maxBudgetLpa: sliderValue } 
    })
    window.dispatchEvent(event)
  }

  const handleReset = () => {
    setIsApplied(false)
    const event = new CustomEvent('edunext_roi_updated', { 
      detail: { maxBudgetLpa: null } 
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="rounded-2xl border bg-[#0F172B] p-5 relative overflow-hidden" style={{ borderColor }}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Calculator size={100} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1.5px] w-6 bg-amber-500" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">
            ROI Calculator
          </h3>
        </div>
        
        <p className="text-xs text-slate-400 mb-4 max-w-md">
          Set your maximum fee budget (in Lakhs). We will highlight the fastest ROI colleges based on average placements.
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <span>Budget: {sliderValue.toFixed(1)} Lakhs</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="30"
            step="0.1"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#050818] transition-all hover:bg-amber-400"
            >
              Apply Filter
            </button>
            {isApplied && (
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-600 bg-transparent px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

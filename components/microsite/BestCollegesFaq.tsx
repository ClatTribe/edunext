"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, HelpCircle } from "lucide-react"
import type { Faq } from "../../lib/bestCollegesContent"

const borderColor = "rgba(245, 158, 11, 0.15)"

export default function BestCollegesFaq({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border bg-[#0F172B] transition-colors"
            style={{ borderColor: isOpen ? "rgba(245,158,11,0.45)" : borderColor }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
              <span className="flex items-center gap-3 text-sm font-bold text-white">
                <HelpCircle size={16} className="shrink-0 text-amber-500" />
                {f.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400"
              >
                <Plus size={15} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 pl-12 text-sm leading-relaxed text-slate-400">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

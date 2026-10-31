// Call-to-action for the CAT 2026 score calculator on our IPM Careers site.
// Plain markup (no hooks), so it works in server and client components.
// rel="nofollow": this link appears on thousands of templated MBA pages; it is
// there for leads, and sitewide followed links to a sister site can look like a
// link scheme to Google. UTM tags let IPM Careers attribute the leads.

export const CAT_SCORE_CALCULATOR_URL = "https://register.ipmcareer.com/cat-score-calculator"

export function catCalculatorUrl(placement: string): string {
  const q = new URLSearchParams({
    utm_source: "getedunext",
    utm_medium: "referral",
    utm_campaign: "cat_score_calculator",
    utm_content: placement,
  })
  return `${CAT_SCORE_CALCULATOR_URL}?${q.toString()}`
}

const REL = "nofollow noopener"

export default function CatScoreCta({
  placement,
  variant = "banner",
  className = "",
}: {
  /** Where the CTA sits, e.g. "bschool-cutoff" or "blog-top"; sent as utm_content. */
  placement: string
  variant?: "banner" | "inline"
  className?: string
}) {
  const href = catCalculatorUrl(placement)

  if (variant === "inline") {
    return (
      <p className={`text-sm text-slate-300 ${className}`}>
        <span className="font-semibold text-white">CAT 2026 score calculator: </span>
        <a href={href} target="_blank" rel={REL} className="text-amber-400 underline font-semibold">
          get your VARC, DILR, QA score and percentile from your response sheet
        </a>
      </p>
    )
  }

  return (
    <aside
      aria-label="CAT 2026 score calculator"
      className={`rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}
    >
      <div className="flex-1 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Free tool · CAT 2026</p>
        <p className="text-lg sm:text-xl font-bold text-white">Calculate your CAT 2026 score and percentile</p>
        <p className="text-sm text-slate-400">
          Paste your CAT response sheet link to get your VARC, DILR and QA marks, total out of 204 and expected percentile.
        </p>
      </div>
      <a
        href={href}
        target="_blank"
        rel={REL}
        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-wider text-[#050818] hover:bg-amber-400 transition-colors whitespace-nowrap"
      >
        Calculate my score →
      </a>
    </aside>
  )
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CAT Percentile Predictor 2026 | Convert Your CAT Score to Percentile",
  description: "Enter your expected CAT 2026 sectional scores (VARC, DILR, QA) to estimate your overall and sectional percentile, then see which B-schools fit your score.",
  keywords: "CAT percentile predictor 2026, CAT score vs percentile, CAT 2026 percentile calculator, VARC DILR QA percentile, EduNext",
  alternates: { canonical: "https://www.getedunext.com/cat-percentile-predictor" },
  openGraph: {
    title: "CAT Percentile Predictor 2026",
    description: "Estimate your CAT 2026 percentile from your sectional scores and see which B-schools fit.",
    url: "https://www.getedunext.com/cat-percentile-predictor",
  },
}

export default function CatPercentileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

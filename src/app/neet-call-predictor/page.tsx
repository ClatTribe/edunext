import type { Metadata } from "next";
import NeetCallPredictor from "../../../components/NeetCallPredictor/page";

const PAGE_URL = "https://www.getedunext.com/neet-call-predictor";

const TITLE =
  "NEET Call Predictor 2026 — Free NEET Rank & College Predictor";

const DESCRIPTION =
  "Predict your NEET 2026 colleges across 437+ MBBS institutions using NEET 2025 closing ranks as reference. Free NEET rank predictor + AI-powered college predictor with AIQ + state quota matching for AIIMS, govt, private & deemed colleges.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "NEET Call Predictor",
    "NEET Rank Predictor",
    "NEET College Predictor",
    "NEET 2026 college predictor",
    "NEET 2025 college predictor",
    "NEET rank predictor 2026",
    "NEET rank predictor 2025",
    "MBBS college predictor",
    "NEET marks vs rank",
    "NEET AIQ predictor",
    "NEET state quota predictor",
    "AIIMS predictor",
    "free NEET predictor",
    "NEET 2026 cutoff",
    "NEET 2025 cutoff",
    "MBBS admission predictor India",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "EduNext",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@edunext",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function NeetPredictorPage() {
  return <NeetCallPredictor />;
}

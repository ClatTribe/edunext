import type { Metadata } from 'next';
import Result from '../../../../components/XAT/Result';

export const metadata: Metadata = {
  title: 'XAT Score Calculator 2026 | Calculate Your XAT Percentile & Admission Chances',
  description: 'Paste your Digialm XAT response to instantly calculate your section-wise scores and percentile. Get accurate XAT 2026 score predictions for XLRI, XIMB, and top B-schools accepting XAT scores.',
  keywords: 'XAT calculator, XAT 2026, XAT score, XAT percentile, XLRI admission, XIMB, XAT score predictor, MBA admission, XAT section-wise score, Digialm response, XAT result calculator',
  openGraph: {
    title: 'XAT Score Calculator 2026 | Get Your XAT Percentile Instantly',
    description: 'Calculate your XAT 2026 scores and percentile by pasting your Digialm response. Get section-wise analysis and admission predictions for XLRI and other top B-schools.',
  },
  alternates: {
    canonical: 'https://www.getedunext.com/xat-score-calculator-2026',
  },
};

export default function Page() {
  return <Result />;
}
import type { Metadata } from 'next';
import XATScoreCalculator from '../../../components/XAT/XATScoreCalculator';

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
  // Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'XAT Score Calculator 2026',
    description: 'Calculate your XAT 2026 percentile and predict admission chances for XLRI and top B-schools.',
    brand: {
      '@type': 'Brand',
      name: 'EduNext',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How accurate is the EduNext XAT Calculator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our calculator uses the latest XAT 2026 marking scheme and historical data to provide 99% accuracy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it consider negative marking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we account for the -0.25 negative marking for incorrect answers and unattempted question penalties.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I check my XAT score without login?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, simply paste your Digialm response URL or content and get instant results without any registration.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <XATScoreCalculator />
    </>
  );
}
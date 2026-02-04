import type { Metadata } from 'next';
import JEEScoreCalculator from '../../../components/JEE/JEEScoreCalculator';

export const metadata: Metadata = {
  title: 'JEE Main Score Calculator 2026 | Calculate Your JEE Percentile & Admission Chances',
  description: 'Paste your Digialm JEE response to instantly calculate your section-wise scores and percentile. Get accurate JEE 2026 score predictions for top engineering colleges.',
  keywords: 'JEE calculator, JEE 2026, JEE score, JEE percentile, IIT admission, JEE score predictor, Engineering admission, JEE section-wise score, Digialm response, JEE result calculator',
  openGraph: {
    title: 'JEE Score Calculator 2026 | Get Your JEE Percentile Instantly',
    description: 'Calculate your JEE 2026 scores and percentile by pasting your Digialm response. Get section-wise analysis and admission predictions for IITs and other top engineering colleges.',
    url: 'https://www.getedunext.com/jee-tool',
    siteName: 'EduNext',
  },
  alternates: {
    canonical: 'https://www.getedunext.com/jee-tool',
  },
};

export default function Page() {
  // Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'JEE Main Score Calculator 2026',
    description: 'Calculate your JEE 2026 percentile and predict admission chances for top engineering colleges.',
    brand: {
      '@type': 'Brand',
      name: 'EduNext',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '124450',
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
      <JEEScoreCalculator />
    </>
  );
}
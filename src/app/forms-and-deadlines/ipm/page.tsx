import type { Metadata } from "next";
import FormsPageClient from "../../../../components/forms-and-deadlines/FormsPageClient";
import { ExamTab, TAB_SEO } from "../../../../components/forms-and-deadlines/constants";

const seo = TAB_SEO[ExamTab.IPM];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.title,
    description: seo.description,
  },
  alternates: {
    canonical: "https://www.getedunext.com/forms-and-deadlines/ipm",
  },
};

export default function IPMFormsPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "IPMAT & Management Exam Forms Tracker 2026",
    description: seo.description,
    brand: { "@type": "Brand", name: "EduNext" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "12500",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When does IPMAT Indore 2026 registration start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "IPMAT Indore 2026 registration is expected to begin in the second week of February 2026, with the exam likely scheduled for May 2026.",
        },
      },
      {
        "@type": "Question",
        name: "What is the last date for JIPMAT 2026 registration?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JIPMAT 2026 registration typically opens in April and closes by the mid of May 2026. Dates are subject to official NTA notifications.",
        },
      },
      {
        "@type": "Question",
        name: "Which IPM entrance exams can I track on EduNext?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EduNext tracks all major 5-year Integrated Management entrance exams including IPMAT Indore, IPMAT Rohtak, JIPMAT (IIM Jammu & Bodh Gaya), IIFT IB, and NFSU.",
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
      <FormsPageClient examTab={ExamTab.IPM} examLabel="IPM" />
    </>
  );
}
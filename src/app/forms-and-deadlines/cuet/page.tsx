import type { Metadata } from "next";
import FormsPageClient from "../../../../components/forms-and-deadlines/FormsPageClient";
import { ExamTab, TAB_SEO } from "../../../../components/forms-and-deadlines/constants";

const seo = TAB_SEO[ExamTab.CUET];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.title,
    description: seo.description,
  },
  alternates: {
    canonical: "https://www.getedunext.com/forms-and-deadlines/cuet",
  },
};

export default function CUETFormsPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "CUET UG & PG Exam Forms Tracker 2026",
    description: seo.description,
    brand: { "@type": "Brand", name: "EduNext" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "38500",
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
        name: "When does CUET UG 2026 registration start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CUET UG 2026 registration is expected to begin in February 2026 with the deadline in March 2026.",
        },
      },
      {
        "@type": "Question",
        name: "Is CUET PG 2026 form available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CUET PG 2026 registration is expected to open in December 2025 with the deadline in January 2026.",
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
      <FormsPageClient examTab={ExamTab.CUET} examLabel="CUET" />
    </>
  );
}
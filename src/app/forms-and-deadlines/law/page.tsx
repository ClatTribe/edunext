import type { Metadata } from "next";
import FormsPageClient from "../../../../components/forms-and-deadlines/FormsPageClient";
import { ExamTab, TAB_SEO } from "../../../../components/forms-and-deadlines/constants";

const seo = TAB_SEO[ExamTab.LAW];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.title,
    description: seo.description,
  },
  alternates: {
    canonical: "https://www.getedunext.com/forms-and-deadlines/law",
  },
};

export default function LawFormsPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "CLAT & Law Entrance Exam Forms Tracker 2026-27",
    description: seo.description,
    brand: { "@type": "Brand", name: "EduNext" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "27800",
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
        name: "When will CLAT 2027 registration open?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CLAT 2027 registration dates have not been announced yet. Based on past trends, expect registration to open around July-August 2026.",
        },
      },
      {
        "@type": "Question",
        name: "Is SET Law (Symbiosis) 2026 form open?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SET Law 2026 registration opened on December 12, 2025 and the deadline is April 15, 2026.",
        },
      },
      {
        "@type": "Question",
        name: "Which law entrance exams are tracked on EduNext?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EduNext tracks CLAT, AILET, SLAT, CUET UG & PG Law, NMIMS NLAT, MH CET Law, SET Law (Symbiosis), IPU CET, and UPES Law — all in one dashboard.",
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
      <FormsPageClient examTab={ExamTab.LAW} examLabel="CLAT / Law" />
    </>
  );
}
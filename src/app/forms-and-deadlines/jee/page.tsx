import type { Metadata } from "next";
import FormsPageClient from "../../../../components/forms-and-deadlines/FormsPageClient";
import { ExamTab, TAB_SEO } from "../../../../components/forms-and-deadlines/constants";

const seo = TAB_SEO[ExamTab.JEE];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.title,
    description: seo.description,
  },
  alternates: {
    canonical: "https://www.getedunext.com/forms-and-deadlines/jee",
  },
};

export default function JEEFormsPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "JEE & Engineering Exam Forms Tracker 2026",
    description: seo.description,
    brand: { "@type": "Brand", name: "EduNext" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "52400",
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
        name: "When does JEE Main 2026 Session 1 registration start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JEE Main 2026 Session 1 registration is expected to begin in November 2025 with the deadline in December 2025.",
        },
      },
      {
        "@type": "Question",
        name: "What is the last date for BITSAT 2026 registration?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BITSAT 2026 Session 1 registration opened on December 15, 2025 and closes on March 16, 2026.",
        },
      },
      {
        "@type": "Question",
        name: "How many engineering entrance exams can I track on EduNext?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EduNext tracks 20+ engineering entrance exams including JEE Main, JEE Advanced, BITSAT, VITEEE, SRMJEEE, MHT CET, KCET, COMEDK, and many more — all in one place.",
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
      <FormsPageClient examTab={ExamTab.JEE} examLabel="JEE" />
    </>
  );
}
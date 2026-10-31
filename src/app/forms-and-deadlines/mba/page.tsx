import type { Metadata } from "next";
import Link from "next/link";
import FormsPageClient from "../../../../components/forms-and-deadlines/FormsPageClient";
import { ExamTab, TAB_SEO } from "../../../../components/forms-and-deadlines/constants";
import CatScoreCta from "../../../../components/CatScoreCta"

const seo = TAB_SEO[ExamTab.MBA];
const URL = "https://www.getedunext.com/forms-and-deadlines/mba";

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: { title: seo.title, description: seo.description, url: URL },
  alternates: { canonical: URL },
};

const FAQS = [
  {
    q: "Which MBA application forms are open for the 2027-29 batch?",
    a: "As of October 2026, forms are open at SPJIMR, IMI New Delhi, K J Somaiya, IMT Ghaziabad, BIMTECH, LBSIM, Great Lakes Gurgaon, NMIMS (via NMAT) and Symbiosis institutes (via SNAP), among others. The table above shows each school's last date and official apply link.",
  },
  {
    q: "What is the last date to apply to SPJIMR for 2027-29?",
    a: "SPJIMR's PGDM application deadline for the 2027-29 batch is 27 November 2026, per SPJIMR's own announcement. It accepts CAT 2026 and GMAT scores.",
  },
  {
    q: "Should I apply to B-schools before the CAT 2026 result?",
    a: "Yes. CAT 2026 is on 29 November 2026 and many private B-schools close their first round before results are announced. Apply to the schools whose last dates fall before results, then add more once you know your percentile.",
  },
  {
    q: "Which MBA colleges can I get with 60 to 80 percentile in CAT?",
    a: "Many good private B-schools in Delhi NCR, Mumbai, Pune and Bangalore admit students in the 60 to 85 percentile range. See EduNext's percentile-wise lists for indicative cutoffs.",
  },
];

export default function MBAFormsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FormsPageClient examTab={ExamTab.MBA} examLabel="MBA" />

      <CatScoreCta placement="mba-forms-hub" className="mt-12 max-w-4xl" />

      <section className="mt-12 max-w-4xl text-slate-300 leading-relaxed">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-400 mb-3">MBA application forms 2027: how to plan your applications</h2>
        <p className="mb-3">
          CAT 2026 is on <strong>29 November 2026</strong>. Between now and the CAT result, most private B-schools open and close their
          first-round applications for the 2027-29 batch. Students who wait for their percentile often miss these rounds. Use this page
          to track every form&apos;s last date and apply on the official portal of each school.
        </p>
        <p className="mb-3">
          Not sure where your score fits? Try the{" "}
          <Link href="/cat-college-predictor" className="text-amber-400 underline">CAT College Predictor</Link>, or browse{" "}
          <Link href="/mba-colleges-by-cat-percentile/70" className="text-amber-400 underline">MBA colleges accepting 70 percentile</Link>,{" "}
          <Link href="/mba-colleges-by-cat-percentile/80" className="text-amber-400 underline">80 percentile</Link> and{" "}
          <Link href="/mba-colleges-by-cat-percentile/90" className="text-amber-400 underline">90 percentile</Link>.
        </p>
        <p className="mb-6">
          City lists:{" "}
          <Link href="/best-colleges/mba-colleges-in-pune" className="text-amber-400 underline">MBA colleges in Pune</Link>,{" "}
          <Link href="/best-colleges/mba-colleges-in-bangalore" className="text-amber-400 underline">Bangalore</Link>,{" "}
          <Link href="/best-colleges/mba-colleges-in-mumbai" className="text-amber-400 underline">Mumbai</Link>,{" "}
          <Link href="/best-colleges/mba-colleges-in-noida" className="text-amber-400 underline">Noida</Link> and{" "}
          <Link href="/best-colleges/mba-colleges-in-delhi" className="text-amber-400 underline">Delhi</Link>.
        </p>
        <h2 className="text-xl font-bold text-amber-400 mb-3">Frequently asked questions</h2>
        {FAQS.map((f) => (
          <div key={f.q} className="mb-4">
            <h3 className="font-semibold text-white">{f.q}</h3>
            <p className="text-slate-400">{f.a}</p>
          </div>
        ))}
        <p className="text-xs text-slate-500 mt-6">
          Dates verified on official websites on 2 October 2026. Always confirm on the school&apos;s official site before applying.
        </p>
      </section>
    </>
  );
}

/**
 * Forms & Deadlines – Central Constants
 * ──────────────────────────────────────
 * To add a NEW tab:
 *   1. Add an entry to the `ExamTab` enum
 *   2. Add tab metadata (label, slug, icon key) to EXAM_TABS
 *   3. Add your forms array to FORMS_BY_TAB under that key
 *   4. Add SEO metadata to TAB_SEO
 *
 * That's it — the page picks everything up automatically.
 */

// ─── Types ──────────────────────────────────────────────────────────────

export type FormStatus = "Open" | "Coming Soon" | "Closed";

export interface ExamFormEntry {
  name: string;
  startDate: string;
  endDate: string;
  link: string;
  status: FormStatus;
  /** Optional – shown as a subtitle under the form name */
  courses?: string;
}

// ─── Tabs ───────────────────────────────────────────────────────────────

export enum ExamTab {
  JEE = "JEE",
  CUET = "CUET",
  // NEET = "NEET",
  // IPM = "IPM",
  // MBA = "MBA",
  LAW = "LAW",
}

/** Icon keys map to lucide-react icon names used on the page */
export interface TabMeta {
  id: ExamTab;
  label: string;
  slug: string;      // ← used in the URL: /forms-and-deadlines/{slug}
  iconKey: string;    // resolved to a lucide icon on the page
}

export const EXAM_TABS: TabMeta[] = [
  { id: ExamTab.JEE,  label: "JEE",  slug: "jee",  iconKey: "Cpu" },
  { id: ExamTab.CUET, label: "CUET", slug: "cuet", iconKey: "BookOpen" },
  // { id: ExamTab.NEET, label: "NEET / Medical", slug: "neet", iconKey: "HeartPulse" },
  // { id: ExamTab.IPM,  label: "IPM / BBA",      slug: "ipm",  iconKey: "Briefcase" },
  // { id: ExamTab.MBA,  label: "MBA",             slug: "mba",  iconKey: "TrendingUp" },
  { id: ExamTab.LAW,  label: "CLAT", slug: "law",  iconKey: "Scale" },
];

// ─── SEO Metadata (used in each sub-route's page.tsx) ───────────────────

export interface TabSEO {
  title: string;
  description: string;
  keywords: string;
}

export const TAB_SEO: Record<ExamTab, TabSEO> = {
  [ExamTab.JEE]: {
    title: "JEE Forms & Deadlines 2026 | JEE Main, Advanced, BITSAT Registration Dates – EduNext",
    description:
      "Track all JEE 2026 registration dates, form deadlines, and exam schedules in one place. Covers JEE Main Session 1 & 2, JEE Advanced, BITSAT, VITEEE, SRMJEEE, MHT CET, KCET, COMEDK and 20+ engineering entrance exams.",
    keywords:
      "JEE Main 2026 form, JEE Advanced registration, BITSAT 2026 deadline, VITEEE form date, engineering entrance exam dates 2026, JEE Main session 2, MHT CET registration, KCET 2026, COMEDK UGET, EduNext",
  },
  [ExamTab.CUET]: {
    title: "CUET Forms & Deadlines 2026 | CUET UG & PG Registration Dates – EduNext",
    description:
      "Never miss a CUET deadline. Track CUET UG 2026 and CUET PG 2026 registration dates, form availability, and exam schedules. Updated in real time on EduNext.",
    keywords:
      "CUET UG 2026 form, CUET PG 2026 registration, CUET exam date, CUET deadline, NTA CUET, central university entrance test, EduNext",
  },
  [ExamTab.LAW]: {
    title: "CLAT & Law Entrance Forms 2026–27 | CLAT, AILET, SLAT Deadlines – EduNext",
    description:
      "All law entrance exam forms and deadlines in one place. Track CLAT 2027, AILET, SLAT, SET Law, MH CET Law, CUET PG Law, NLAT, and IPU CET registration dates on EduNext.",
    keywords:
      "CLAT 2027 form, AILET registration, SLAT 2026, law entrance exam dates, SET Law deadline, MH CET Law, NLU admission, NLAT NMIMS, EduNext",
  },
};

// ─── Forms Data (grouped by tab) ────────────────────────────────────────

export const FORMS_BY_TAB: Record<ExamTab, ExamFormEntry[]> = {
  // ━━━━━━━━━━ JEE / ENGINEERING ━━━━━━━━━━
  [ExamTab.JEE]: [
    {
      name: "JEE Main 2026 (Session 1)",
      startDate: "Nov 2025",
      endDate: "Dec 2025",
      link: "https://jeemain.nta.nic.in/",
      status: "Coming Soon",
    },
    {
      name: "JEE Main 2026 (Session 2)",
      startDate: "Feb 2026",
      endDate: "Mar 2026",
      link: "https://jeemain.nta.nic.in/",
      status: "Coming Soon",
    },
    {
      name: "JEE Advanced 2026",
      startDate: "Apr 2026",
      endDate: "May 2026",
      link: "https://jeeadv.ac.in/",
      status: "Coming Soon",
    },
    {
      name: "BITSAT 2026 (Session 1)",
      startDate: "Dec 15, 2025",
      endDate: "Mar 16, 2026",
      link: "https://admissions.bits-pilani.ac.in/FD/FD.html",
      status: "Open",
    },
    {
      name: "BITSAT 2026 (Session 2)",
      startDate: "Apr 20, 2026",
      endDate: "May 2, 2026",
      link: "https://admissions.bits-pilani.ac.in/FD/FD.html",
      status: "Coming Soon",
    },
    {
      name: "VITEEE 2026",
      startDate: "Oct 24, 2025",
      endDate: "Mar 31, 2026",
      link: "https://viteee.vit.ac.in/",
      status: "Open",
    },
    {
      name: "SRMJEEE 2026 (Phase 1)",
      startDate: "Oct 30, 2025",
      endDate: "Apr 16, 2026",
      link: "https://www.srmist.edu.in/",
      status: "Open",
    },
    {
      name: "Manipal University (MET)",
      startDate: "Currently Open",
      endDate: "Mar 15, 2026",
      link: "https://manipal.edu/",
      status: "Open",
    },
    {
      name: "UPES 2026",
      startDate: "Open",
      endDate: "Jan 20, 2026",
      link: "https://admission.upes.ac.in/Login",
      status: "Open",
    },
    {
      name: "COMEDK UGET 2026",
      startDate: "Feb 3, 2026",
      endDate: "Mar 16, 2026",
      link: "https://www.comedk.org/about-uget-and-notification-2026",
      status: "Coming Soon",
    },
    {
      name: "MHT CET 2026",
      startDate: "Jan 10, 2026",
      endDate: "Feb 12, 2026",
      link: "https://cetcell.mahacet.org/",
      status: "Open",
    },
    {
      name: "KCET 2026",
      startDate: "Jan 17, 2026",
      endDate: "Feb 17, 2026",
      link: "https://cetonline.karnataka.gov.in/kea/",
      status: "Open",
    },
    {
      name: "KLEEE 2026",
      startDate: "Open",
      endDate: "Mar 2026",
      link: "https://www.kluniversity.in/admissions/#online-application",
      status: "Open",
    },
    {
      name: "MRNAT 2026",
      startDate: "Currently Open",
      endDate: "Ongoing Process",
      link: "https://manavrachna.edu.in/admissions/mrnat",
      status: "Open",
    },
    {
      name: "AEEE 2026",
      startDate: "Open",
      endDate: "Apr 10, 2026",
      link: "https://aeee.amrita.edu/",
      status: "Open",
    },
    {
      name: "LPUNEST 2026",
      startDate: "Currently Open",
      endDate: "Feb 5, 2026",
      link: "https://www.lpu.in/nest/",
      status: "Open",
    },
    {
      name: "CUSAT CAT 2026",
      startDate: "Feb 2026",
      endDate: "Apr 2026",
      link: "https://admissions.cusat.ac.in/",
      status: "Coming Soon",
    },
    {
      name: "TG-EAPCET 2026",
      startDate: "Mar 2026",
      endDate: "Apr 2026",
      link: "https://eapcet.tgche.ac.in/",
      status: "Coming Soon",
    },
    {
      name: "GUJCET 2026",
      startDate: "Jan 2, 2026",
      endDate: "Jan 25, 2026",
      link: "https://gujcet.gseb.org/",
      status: "Open",
    },
    {
      name: "KIITEE 2026 (Phase 1)",
      startDate: "Nov 10, 2025",
      endDate: "Mar 20, 2026",
      link: "https://kiit.ac.in/",
      status: "Open",
    },
    {
      name: "PESSAT 2026",
      startDate: "Oct 2025",
      endDate: "Apr 2026",
      link: "https://www.pessat.com/",
      status: "Open",
    },
    {
      name: "NATA 2026",
      startDate: "Feb 2026 (TBA)",
      endDate: "Apr 2026",
      link: "https://www.nata.in/",
      status: "Coming Soon",
    },
    {
      name: "KEAM 2026",
      startDate: "Mar 2026 (TBA)",
      endDate: "Apr 2026",
      link: "https://cee.kerala.gov.in/",
      status: "Coming Soon",
    },
  ],

  // ━━━━━━━━━━ CUET ━━━━━━━━━━
  [ExamTab.CUET]: [
    {
      name: "CUET UG 2026",
      startDate: "Expected Feb 2026",
      endDate: "Expected Mar 2026",
      link: "https://exams.nta.ac.in/CUET-UG/",
      status: "Coming Soon",
    },
    {
      name: "CUET PG 2026",
      startDate: "Expected Dec 2025",
      endDate: "Expected Jan 2026",
      link: "https://exams.nta.ac.in/CUET-PG/",
      status: "Coming Soon",
    },
  ],

  // ━━━━━━━━━━ LAW / CLAT ━━━━━━━━━━
  [ExamTab.LAW]: [
    {
      name: "CLAT 2027",
      startDate: "Coming Soon",
      endDate: "Coming Soon",
      link: "https://consortiumofnlus.ac.in",
      status: "Coming Soon",
    },
    {
      name: "AILET 2027",
      startDate: "Aug 2026 (Expected)",
      endDate: "Nov 2026 (Expected)",
      link: "https://nationallawuniversitydelhi.in",
      status: "Coming Soon",
    },
    {
      name: "SLAT 2026",
      startDate: "Oct 2025",
      endDate: "Nov 2025",
      link: "https://www.slat-test.org",
      status: "Closed",
    },
    {
      name: "CUET UG 2026",
      startDate: "Jan 3, 2026",
      endDate: "Jan 30, 2026",
      link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
      status: "Open",
    },
    {
      name: "NMIMS NLAT",
      startDate: "Feb 2026",
      endDate: "March 2026",
      link: "https://nlat.nmims.edu/?utm_source=IPM%20Careers&utm_medium=NLATWidget&utm_campaign=NMIMSNLAT",
      status: "Open",
    },
    {
      name: "MHCET Law",
      startDate: "March 2025",
      endDate: "May 2026",
      link: "https://cetcell.mahacet.org",
      status: "Open",
    },
    {
      name: "IPU CET / CLAT Score",
      startDate: "Feb 2, 2026",
      endDate: "March 31, 2026",
      link: "https://ipu.ac.in/adm2026/adm2026main.php",
      status: "Open",
    },
    {
      name: "UPES Law College",
      startDate: "Dec 15 2025",
      endDate: "Feb 25 2026",
      link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
      status: "Open",
    },
    {
      name: "SET Law (Symbiosis) 2026",
      startDate: "Dec 12, 2025",
      endDate: "April 15, 2026",
      link: "https://www.set-test.org",
      status: "Open",
    },
    {
      name: "CUET PG Law 2026",
      startDate: "Jan 2026",
      endDate: "Feb 2026",
      link: "https://exams.nta.nic.in/cuet-pg/",
      status: "Closed",
    },
  ],
};
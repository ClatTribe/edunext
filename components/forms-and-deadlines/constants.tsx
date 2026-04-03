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
  IPM = "IPM",
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
  { id: ExamTab.IPM,  label: "IPM",      slug: "ipm",  iconKey: "Briefcase" },
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
  [ExamTab.IPM]: {
    title: "IPM Forms & Deadlines 2026 | IPM Registration Dates – EduNext",
    description:
      "Track all IPM registration dates, form deadlines, and exam schedules in one place. Covers IPMAT Indore, IPMAT Rohtak, and other IPM entrance exams.",
    keywords:
      "IPM form 2026, IPMAT registration, IPM exam date, IPM deadline, IIM admission, EduNext",
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

  // ━━━━━━━━━━ IPM ━━━━━━━━━━  
    [ExamTab.IPM]: [
      {
    name: "IIM Indore",
    startDate: "To be announced",
    endDate: "14th March '2026",
    status: "Open",
    link: "https://cdn.digialm.com//EForms/configuredHtml/1329/97663/Registration.html",
    courses: "IPM (5-Years)",
  },
  {
    name: "NMIMS (NPAT 2026)",
    startDate: "To be announced",
    endDate: "Tuesday, 26th May’2026",
    status: "Open",
    link: "https://npat.nmims.edu/?utm_source=IPM%20Careers&utm_medium=NPATWidget&utm_campaign=NMIMSNPAT",
    courses:
      "IPM (5 Years), BBA (3-Years), BBA (International Business), Bachelor in Business Management & Marketing",
  },
  {
    name: "IIM Rohtak",
    startDate: "To be announced",
    endDate: "06 April '2026",
    status: "Open",
    link: "https://cdn.digialm.com/EForms/configuredHtml/2349/97754/Registration.html",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIFT",
    startDate: "To be announced",
    endDate: "20th April '26",
    status: "Open",
    link: "https://applyadmission.net/iift2026ipm/",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Ranchi",
    startDate: "To be announced",
    endDate: "12th April '26",
    status: "Open",
    link: " https://app.iimranchi.ac.in/admission/ipm",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Sirmaur",
    startDate: "To be announced",
    endDate: "15th March '26",
    status: "Open",
    link: "https://iimsirmaur.iqdigit.com/register",
    courses: "BMS (4-Years)",
  },
  {
    name: "IIM Amritsar",
    startDate: "To be announced",
    endDate: "31st March '26",
    status: "Open",
    link: "https://admission.iimamritsar.ac.in/apply-register-non-mba",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Bangalore",
    startDate: "3rd week Oct 2025",
    endDate: "20 November 2025",
    status: "Closed",
    link: "https://cdn.digialm.com/EForms/configuredHtml/1345/96226/Registration.html",
    courses: "BSc (Data Science & Economics)",
  },
  {
    name: "IIM Jammu",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Bodhgaya",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Bangalore (BBA DBE)",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "https://dbe.iimb.ac.in/register-your-interest/",
    courses: "BBA in Digital Business & Entrepreneurship",
  },
  {
    name: "IIM Kozhikode",
    startDate: "To be announced",
    endDate: "15th April '26",
    status: "Open",
    link: "https://cdn.digialm.com/EForms/configuredHtml/1064/94623/Registration.html",
    courses: "Bachelor of Management Studies (BMS) – 4 Years",
  },
  {
    name: "IIM Shillong",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Sambalpur",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
    courses: "B.S. in Management & Public Policy (4-Years)",
  },
  {
    name: "NALSAR",
    startDate: "To be announced",
    endDate: "31st May 2026",
    status: "Open",
    link: "https://apply.nalsar.ac.in/ipm-application-form",
    courses: "BBA + MBA (5-Years)",
  },
  {
    name: "Symbiosis (SET 2026)",
    startDate: "To be announced",
    endDate: "April 15, 2026",
    status: "Open",
    link: "https://set2026.ishinfosys.com/SYM20-SET26/apply/Index.aspx?utm_source=Results.Shiksha&utm_campaign=SET_2026&utm_medium=display_984710&_gl=1*rjmrtg*_gcl_aw*R0NMLjE3Njc4NzE3ODguQ2owS0NRaUF5UDNLQmhEOUFSSXNBQUpMbm5idnVrbXFkQXAtU0FtbEVGZklQVVFlcUtzcXBPS0hUS3k5TG1HQVNJQU9aYzB1T1NoMDRGTWFBckdtRUFMd193Y0I.*_gcl_au*MTY2NDc5MzMxNS4xNzY3ODcxNzYz*_ga*NzYwNjE2ODc4LjE3Njc4NzE3NjM.*_ga_C0E00815H8*czE3NzIxOTY4MjUkbzIkZzEkdDE3NzIxOTY4MjkkajU2JGwwJGgxNjAzMjE0MzQy*_ga_WRBP7SB61L*czE3NzIxOTY4MjUkbzIkZzEkdDE3NzIxOTY4MjkkajU2JGwwJGgxMDk5Nzk4MDE1",
    courses: "BBA / BBA (Hons) – 4 Years",
  },
  {
    name: "Christ University Entrance Test",
    startDate: "To be announced",
    endDate: "April 06, 2026",
    status: "Open",
    link: "https://espro.christuniversity.in/Application/",
    courses: "BBA / BBA (Hons)",
  },
  {
    name: "NFSU",
    startDate: "To be announced",
    endDate: "January 30, 2026",
    status: "Open",
    link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
    courses: "BBA + MBA",
  },
  {
    name: "TAPMI",
    startDate: "To be announced",
    endDate: "15th April '2026",
    status: "Open",
    link:"https://apply.manipal.edu/login?ec=302&startURL=%2F",
    courses: "IPM (5-Years) / BBA (Hons) – (4-Years)",
  },
  {
    name: "IFMR (Krea University)",
    startDate: "To be announced",
    endDate: "10th June '2026",
    status: "Open",
    link: "https://ifmrgsbadmissions.krea.edu.in/ifmr-bba-programme-applynow?utm_source=IPM%20CAREER&utm_medium=Banner&utm_campaign=Kanpur&utm_content=header&_gl=1*1iztjz5*_ga*MTI0MDgwMDg2MC4xNjcwODU4Mzg4*_ga_K846DTLBHK*czE3Njc5NTQ0MjUkbzMwJGcwJHQxNzY3OTU0NDI1JGo2MCRsMCRoMA",
    courses: "Integrated BBA + MBA (5-Years)",
  },
  {
    name: "NIRMA University",
    startDate: "To be announced",
    endDate: "10th May '26",
    status: "Open",
    link: "https://admissions-im.nirmauni.ac.in/student/default.aspx",
    courses: "Integrated BBA + MBA (5-Years)",
  },
  {
    name: "IIT Patna",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Open",
    link:"https://registrations.iitp-cep.in/BBA-MBA",
    courses: "BBA (3-years)",
  },
  {
    name: "Alliance University",
    startDate: "To be announced",
    endDate: "12 May '2026",
    status: "Open",
    link: "https://apply.alliance.edu.in/undergraduate-application-form-2026?utm_source=IPMcareer&utm_medium=Kanpur&utm_campaign=BBA2026",
    courses: "BBA (Hons.) & BCom (Hons)",
  },
  {
    name: "Bennett University",
    startDate: "To be announced",
    endDate: "To be announced",
    status: "Coming Soon",
    link: "—",
    courses: "BBA + MBA (5-years)",
  },
  {
    name: "Ashoka University",
    startDate: "To be announced",
    endDate: "21st Jan '2026",
    status: "Open",
    link: "https://application.ashoka.edu.in/?utm_source=Google&utm_medium=search&utm_campaign=R2-26-B-India&utm_campaignid=22898927690&utm_adgroupid=183539886843&utm_creativeid=769580131880&utm_matchtype=b&utm_device=c&utm_network=g&utm_keyword=ashoka%20university%20application&utm_placement=&gad_source=1&gad_campaignid=22898927690&gbraid=0AAAAACmBNmdsBEsKNh9x2v3tOBhy3NN-l&gclid=CjwKCAiA64LLBhBhEiwA-PxguzoY3ZpRvP1UVxhHFKNjomrotQ1yhR1G9oN6ZwYGFqhbllmz0Tf5NBoCncAQAvD_BwE#form",
    courses: "BA (Economics / Political Science + Management)",
  },
  {
    name: "Doon Business School",
    startDate: "To be announced",
    endDate: " 28th May '2026",
    status: "Open",
    link: " https://bit.ly/4bb8z6n",
    courses: "BA (Economics / Political Science + Management)",
  },
  {
    name: "UPES",
    startDate: "To be announced",
    endDate: "31st March '26",
    status: "Open",
    link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
    courses: "BA (Economics / Political Science + Management)",
  },
]
};


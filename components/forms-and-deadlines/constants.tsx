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
  subLinks?: Array<{ name: string; url: string }>;
}

// ─── Tabs ───────────────────────────────────────────────────────────────

export enum ExamTab {
  JEE = "B.Tech",
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
  { id: ExamTab.JEE,  label: "B.Tech",  slug: "jee",  iconKey: "Cpu" },
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
    title: "B.Tech Forms & Deadlines 2026 | JEE Main, Advanced, BITSAT Registration Dates – EduNext",
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
  name: "Masters' Union",
  startDate: "Currently Open",
  endDate: "Jun 10, 2026",
  link: "https://mastersunion.org/",
  status: "Open",
  subLinks: [
    { name: "Tech & Management", url: "https://mastersunion.org/ug-technology-and-business-management?utm_source=IPMOnline&utm_medium=Online&utm_campaign=Invite&utm_content=" },
    { name: "Psychology & Marketing", url: "https://mastersunion.org/ug-psychology-and-marketing?utm_source=IPMOnline&utm_medium=Online&utm_campaign=Invite&utm_content=" },
    { name: "Finance & Economics", url: "https://mastersunion.org/ug-finance-and-economics?utm_source=SIM&utm_medium=UG&utm_campaign=FnE" },
    { name: "Data Science & AI", url: "https://mastersunion.org/ug-data-science-and-artificial-intelligence?utm_source=IPMOnline&utm_medium=Online&utm_campaign=Invite&utm_content=" }
  ],
},

    {
    name: "Alliance University",
    startDate: "Currently Open",
    endDate: "May 12, 2026",
    link: "https://apply.alliance.edu.in/undergraduate-application-form-2026?utm_source=IPMcareer&utm_medium=Kanpur&utm_campaign=BBA2026",
    status: "Open",
  },
    {
    name: "Doon Business School",
    startDate: "Currently Open",
    endDate: "May 28, 2026",
    link: "https://admissions.dgu.ac/?utm_source=ipmcareeronline&utm_medium=ipmcareeronline&utm_campaign=ipmcareeronline",
    status: "Open",
  },
    {
    name: "KL College of Engineering",
    startDate: "Currently Open",
    endDate: "To be Announced",
    link: "https://admissions.kluniversity.in/",
    status: "Open",
  },
  {
    name: "UPES",
    startDate: "Sep 12, 2025",
    endDate: "Apr 29, 2026",
    link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
    status: "Closed",
  },
  {
    name: "Amity University Noida",
    startDate: "Currently Open",
    endDate: "To be Announced",
    link: "https://noida.amity.edu/admissions-2026/",
    status: "Open",
  },
  {
    name: "Manipal Institute of Technology",
    startDate: "Oct 1, 2025",
    endDate: "Apr 30, 2026",
    link: "https://admissions.manipal.edu/",
    status: "Closed",
  },
  {
    name: "Shiv Nadar University (Round 2)",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://www.snuadmissions.com/2026/",
    status: "Closed",
  },
  {
    name: "Amrita School of Engineering",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://aeee.amrita.edu/",
    status: "Closed",
  },
  {
    name: "IACS Kolkata",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://www.collegepravesh.com/admissions/iacs-admissions/",
    status: "Closed",
  },
  {
    name: "GGSIPU Delhi (B.Tech)",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://www.collegepravesh.com/admissions/ipu-admissions/",
    status: "Closed",
  },
  {
    name: "Jaypee Institute of Information Technology, Noida (JEE Mode) (Round 1)",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://www.collegepravesh.com/admissions/jiit-noida-admissions/",
    status: "Closed",
  },
  {
    name: "MRIIRS Faridabad",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://apply.manavrachna.edu.in/mriirs",
    status: "Closed",
  },
  {
    name: "Chandigarh University",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://cucet.cuchd.in/index.aspx",
    status: "Closed",
  },
  {
    name: "Thapar Institute of Engineering & Technology, Patiala",
    startDate: "Currently Open",
    endDate: "May 8, 2026",
    link: "https://admission.thapar.edu/",
    status: "Open",
  },
  {
    name: "Jamia Millia Islamia, Delhi",
    startDate: "Currently Open",
    endDate: "To be Announced",
    link: "https://www.collegepravesh.com/admissions/jmi-delhi-admissions/",
    status: "Open",
  },
  {
    name: "Army Institute of Technology (with late fees)",
    startDate: "Currently Open",
    endDate: "May 11, 2026",
    link: "https://www.collegepravesh.com/admissions/ait-pune-admissions/",
    status: "Open",
  },
  {
    name: "LNM Institute of Information Technology, Jaipur",
    startDate: "Currently Open",
    endDate: "May 15, 2026",
    link: "https://www.collegepravesh.com/admissions/lnmiit-jaipur-admissions/",
    status: "Open",
  },
  {
    name: "Amrita Vishwa Vidyapeetham (JEE Mode)",
    startDate: "Currently Open",
    endDate: "May 15, 2026",
    link: "https://aeee.amrita.edu/",
    status: "Open",
  },
  {
    name: "Lovely Professional University",
    startDate: "Currently Open",
    endDate: "May 15, 2026",
    link: "https://admission.lpu.in/",
    status: "Open",
  },
  {
    name: "Institute of Technology, Nirma University",
    startDate: "Currently Open",
    endDate: "May 16, 2026",
    link: "https://www.collegepravesh.com/admissions/itnu-ahmedabad-admissions-all-india-seats/",
    status: "Open",
  },
  {
    name: "IIIT Hyderabad (JEE mode)",
    startDate: "Currently Open",
    endDate: "May 19, 2026",
    link: "https://www.collegepravesh.com/admissions/iiit-hyderabad-admissions-jee-main-mode/",
    status: "Open",
  },
  {
    name: "Anna University Other State Admissions",
    startDate: "Currently Open",
    endDate: "May 22, 2026",
    link: "https://www.collegepravesh.com/admissions/anna-university-other-state-admissions/",
    status: "Open",
  },
  {
    name: "Jaypee Institute of Information Technology, Noida (12th Mode) (Round 1)",
    startDate: "Currently Open",
    endDate: "May 25, 2026",
    link: "https://www.collegepravesh.com/admissions/jiit-noida-admissions/",
    status: "Open",
  },
  {
    name: "ISI (BSDS Course)",
    startDate: "May 20, 2026",
    endDate: "Ongoing Process",
    link: "https://www.collegepravesh.com/admissions/isi-bsds-admissions/",
    status: "Coming Soon",
  },
  {
    name: "ACPC Counselling Gujarat",
    startDate: "Currently Open",
    endDate: "May 31, 2026",
    link: "https://www.collegepravesh.com/admissions/acpc-counselling/",
    status: "Open",
  },
  {
    name: "Dhirubhai Ambani University (DAU) (formerly DA-IICT)",
    startDate: "Currently Open",
    endDate: "Jun 1, 2026",
    link: "https://www.collegepravesh.com/admissions/daiict-gandhinagar-admissions/",
    status: "Open",
  },
  {
    name: "International Institute of Information Technology, Bangalore (IIIT-B)",
    startDate: "Currently Open",
    endDate: "Jun 8, 2026",
    link: "https://www.collegepravesh.com/admissions/iiit-bangalore-admissions/",
    status: "Open",
  },
 
  // === ENTRANCE EXAMS ===
  
  {
    name: "KLEEE 2026",
    startDate: "Currently Open",
    endDate: "To be Announced",
    link: "https://admissions.kluniversity.in/",
    status: "Open",
  },
  {
    name: "TG-EAPCET 2026 (formerly TS-EAMCET) (with late fees)",
    startDate: "Mar 2026",
    endDate: "Apr 24, 2026",
    link: "https://www.collegepravesh.com/entrance-exams/tg-eapcet/",
    status: "Closed",
  },
  {
    name: "UPESEAT 2026",
    startDate: "Sep 12, 2025",
    endDate: "Apr 29, 2026",
    link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
    status: "Closed",
  },
  {
    name: "MET 2026 (Phase 2)",
    startDate: "Oct 1, 2025",
    endDate: "Apr 30, 2026",
    link: "https://admissions.manipal.edu/",
    status: "Closed",
  },
  {
    name: "SNUSAT 2026 (Round 2)",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://www.snuadmissions.com/2026",
    status: "Closed",
  },
  {
    name: "MRNAT 2026",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://apply.manavrachna.edu.in/mriirs",
    status: "Closed",
  },
  {
    name: "CUCET 2026 (Phase 1)",
    startDate: "Currently Open",
    endDate: "Apr 30, 2026",
    link: "https://cucet.cuchd.in/index.aspx",
    status: "Closed",
  },
  {
    name: "LPU NEST 2026",
    startDate: "Currently Open",
    endDate: "May 15, 2026",
    link: "https://admission.lpu.in/",
    status: "Open",
  },
  {
    name: "SRMJEEE 2026 (Phase 2)",
    startDate: "Currently Open",
    endDate: "Jun 4, 2026",
    link: "https://www.collegepravesh.com/entrance-exams/srmjeee/",
    status: "Open",
  },
  {
    name: "NATA 2026 (Conducted every Fri and Sat)",
    startDate: "Feb 2026 (Expected)",
    endDate: "Jun 8, 2026",
    link: "https://www.collegepravesh.com/entrance-exams/nata/",
    status: "Open",
  },
   //old forms
    {
      name: "JEE Main 2026 (Session 1)",
      startDate: "Oct 31, 2025",
      endDate: "Nov 27, 2025",
      link: "https://jeemain.nta.nic.in/",
      status: "Closed",
    },
    {
      name: "JEE Main 2026 (Session 2)",
      startDate: "Feb 1, 2026",
      endDate: "Feb 25, 2026",
      link: "https://jeemain.nta.nic.in/",
      status: "Closed",
    },
    {
      name: "JEE Advanced 2026",
      startDate: "Expected Apr 2026",
      endDate: "Expected May 2026",
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
      startDate: "Currently Open",
      endDate: "Jan 20, 2026",
      link: "https://admission.upes.ac.in/Login",
      status: "Closed",
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
      status: "Closed",
    },
    {
      name: "KCET 2026",
      startDate: "Jan 17, 2026",
      endDate: "Feb 17, 2026",
      link: "https://cetonline.karnataka.gov.in/kea/",
      status: "Closed",
    },
    {
      name: "KLEEE 2026",
      startDate: "Currently Open",
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
      startDate: "Currently Open",
      endDate: "Apr 10, 2026",
      link: "https://aeee.amrita.edu/",
      status: "Open",
    },
    {
      name: "LPUNEST 2026",
      startDate: "Currently Open",
      endDate: "Feb 5, 2026",
      link: "https://www.lpu.in/nest/",
      status: "Closed",
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
      status: "Closed",
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
      startDate: "Feb 2026 (Expected)",
      endDate: "Apr 2026",
      link: "https://www.nata.in/",
      status: "Coming Soon",
    },
    {
      name: "KEAM 2026",
      startDate: "Mar 2026 (Expected)",
      endDate: "Apr 2026",
      link: "https://cee.kerala.gov.in/",
      status: "Coming Soon",
    },
  ],

  // ━━━━━━━━━━ CUET ━━━━━━━━━━
  [ExamTab.CUET]: [
    {
      name: "CUET UG 2026",
      startDate: "Jan 3, 2026",
      endDate: "Feb 4, 2026 (Extended)",
      link: "https://exams.nta.ac.in/CUET-UG/",
      status: "Closed",
    },
    {
      name: "CUET PG 2026",
      startDate: "Dec 2025",
      endDate: "Jan 2026",
      link: "https://exams.nta.ac.in/CUET-PG/",
      status: "Closed",
    },
  ],

  // ━━━━━━━━━━ LAW / CLAT ━━━━━━━━━━
  [ExamTab.LAW]: [
    {
      name: "CLAT 2027",
      startDate: "Aug 1, 2026 (Expected)",
      endDate: "Oct 31, 2026 (Expected)",
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
      name: "CUET UG 2026 (For Law)",
      startDate: "Jan 3, 2026",
      endDate: "Feb 4, 2026",
      link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
      status: "Closed",
    },
    {
      name: "NMIMS NLAT 2026",
      startDate: "Feb 2026",
      endDate: "Mar 2026",
      link: "https://nlat.nmims.edu/?utm_source=IPM%20Careers&utm_medium=NLATWidget&utm_campaign=NMIMSNLAT",
      status: "Open",
    },
    {
      name: "MHCET Law 2026",
      startDate: "Mar 2026",
      endDate: "May 2026",
      link: "https://cetcell.mahacet.org",
      status: "Open",
    },
    {
      name: "IPU CET / CLAT Score 2026",
      startDate: "Feb 2, 2026",
      endDate: "Mar 31, 2026",
      link: "https://ipu.ac.in/adm2026/adm2026main.php",
      status: "Open",
    },
    {
      name: "UPES Law College 2026",
      startDate: "Dec 15, 2025",
      endDate: "Feb 25, 2026",
      link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
      status: "Closed",
    },
    {
      name: "SET Law (Symbiosis) 2026",
      startDate: "Dec 12, 2025",
      endDate: "Apr 15, 2026",
      link: "https://www.set-test.org",
      status: "Open",
    },
    {
      name: "CUET PG Law 2026",
      startDate: "Dec 2025",
      endDate: "Jan 2026",
      link: "https://exams.nta.nic.in/cuet-pg/",
      status: "Closed",
    },
  ],

  // ━━━━━━━━━━ IPM ━━━━━━━━━━  
  [ExamTab.IPM]: [
    {
      name: "IIM Indore (IPMAT)",
      startDate: "Feb 2, 2026",
      endDate: "Mar 17, 2026 (Extended)",
      status: "Closed",
      link: "https://cdn.digialm.com//EForms/configuredHtml/1329/97663/Registration.html",
      courses: "IPM (5-Years)",
    },
    {
      name: "NMIMS (NPAT 2026)",
      startDate: "Currently Open",
      endDate: "May 26, 2026",
      status: "Open",
      link: "https://npat.nmims.edu/?utm_source=IPM%20Careers&utm_medium=NPATWidget&utm_campaign=NMIMSNPAT",
      courses:
        "IPM (5 Years), BBA (3-Years), BBA (International Business), Bachelor in Business Management & Marketing",
    },
    {
      name: "IIM Rohtak (IPMAT)",
      startDate: "Feb 6, 2026",
      endDate: "Apr 6, 2026",
      status: "Closed",
      link: "https://cdn.digialm.com/EForms/configuredHtml/2349/97754/Registration.html",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIFT (IPM)",
      startDate: "Currently Open",
      endDate: "Apr 20, 2026",
      status: "Open",
      link: "https://applyadmission.net/iift2026ipm/",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIM Ranchi (IPM)",
      startDate: "Currently Open",
      endDate: "Apr 12, 2026",
      status: "Open",
      link: "https://app.iimranchi.ac.in/admission/ipm",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIM Sirmaur (BMS)",
      startDate: "Currently Open",
      endDate: "Mar 15, 2026",
      status: "Closed",
      link: "https://iimsirmaur.iqdigit.com/register",
      courses: "BMS (4-Years)",
    },
    {
      name: "IIM Amritsar (IPM)",
      startDate: "Currently Open",
      endDate: "Mar 31, 2026",
      status: "Closed",
      link: "https://admission.iimamritsar.ac.in/apply-register-non-mba",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIM Bangalore (BSc)",
      startDate: "Oct 2025",
      endDate: "Nov 20, 2025",
      status: "Closed",
      link: "https://cdn.digialm.com/EForms/configuredHtml/1345/96226/Registration.html",
      courses: "BSc (Data Science & Economics)",
    },
    {
      name: "IIM Jammu (IPM)",
      startDate: "To be announced",
      endDate: "To be announced",
      status: "Coming Soon",
      link: "https://www.iimjammu.ac.in/",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIM Bodhgaya (IPM)",
      startDate: "To be announced",
      endDate: "To be announced",
      status: "Coming Soon",
      link: "https://www.iimbg.ac.in/",
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
      name: "IIM Kozhikode (BMS)",
      startDate: "Currently Open",
      endDate: "Apr 15, 2026",
      status: "Open",
      link: "https://cdn.digialm.com/EForms/configuredHtml/1064/94623/Registration.html",
      courses: "Bachelor of Management Studies (BMS) – 4 Years",
    },
    {
      name: "IIM Shillong (IPM)",
      startDate: "To be announced",
      endDate: "To be announced",
      status: "Coming Soon",
      link: "https://www.iimshillong.ac.in/",
      courses: "IPM (5-Years)",
    },
    {
      name: "IIM Sambalpur (BS)",
      startDate: "Jan 3, 2026",
      endDate: "Feb 4, 2026",
      status: "Closed",
      link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
      courses: "B.S. in Management & Public Policy (4-Years)",
    },
    {
      name: "NALSAR (BBA+MBA)",
      startDate: "Currently Open",
      endDate: "May 31, 2026",
      status: "Open",
      link: "https://apply.nalsar.ac.in/ipm-application-form",
      courses: "BBA + MBA (5-Years)",
    },
    {
      name: "Symbiosis (SET 2026)",
      startDate: "Dec 12, 2025",
      endDate: "Apr 15, 2026",
      status: "Open",
      link: "https://set2026.ishinfosys.com/SYM20-SET26/apply/Index.aspx?utm_source=Results.Shiksha&utm_campaign=SET_2026&utm_medium=display_984710",
      courses: "BBA / BBA (Hons) – 4 Years",
    },
    {
      name: "Christ University Entrance Test 2026",
      startDate: "Currently Open",
      endDate: "Apr 6, 2026",
      status: "Open",
      link: "https://espro.christuniversity.in/Application/",
      courses: "BBA / BBA (Hons)",
    },
    {
      name: "NFSU (via CUET UG)",
      startDate: "Jan 3, 2026",
      endDate: "Feb 4, 2026",
      status: "Closed",
      link: "https://examinationservices.nic.in/ExamSysCUETUG26/root/Home.aspx?enc=Ei4cajBkK1gZSfgr53ImFYsjZOdyj8DuPcxGBqAK2DwPXgGzSvy8OkvXqQJ0Bni9",
      courses: "BBA + MBA",
    },
    {
      name: "TAPMI (IPM/BBA)",
      startDate: "Currently Open",
      endDate: "Apr 15, 2026",
      status: "Open",
      link: "https://apply.manipal.edu/login?ec=302&startURL=%2F",
      courses: "IPM (5-Years) / BBA (Hons) – (4-Years)",
    },
    {
      name: "IFMR (Krea University)",
      startDate: "Currently Open",
      endDate: "Jun 10, 2026",
      status: "Open",
      link: "https://ifmrgsbadmissions.krea.edu.in/ifmr-bba-programme-applynow?utm_source=IPM%20CAREER&utm_medium=Banner&utm_campaign=Kanpur&utm_content=header",
      courses: "Integrated BBA + MBA (5-Years)",
    },
    {
      name: "NIRMA University",
      startDate: "Currently Open",
      endDate: "May 10, 2026",
      status: "Open",
      link: "https://admissions-im.nirmauni.ac.in/student/default.aspx",
      courses: "Integrated BBA + MBA (5-Years)",
    },
    {
      name: "IIT Patna (BBA)",
      startDate: "Currently Open",
      endDate: "To be announced",
      status: "Open",
      link: "https://registrations.iitp-cep.in/BBA-MBA",
      courses: "BBA (3-years)",
    },
    {
      name: "Alliance University",
      startDate: "Currently Open",
      endDate: "May 12, 2026",
      status: "Open",
      link: "https://apply.alliance.edu.in/undergraduate-application-form-2026?utm_source=IPMcareer&utm_medium=Kanpur&utm_campaign=BBA2026",
      courses: "BBA (Hons.) & BCom (Hons)",
    },
    {
      name: "Bennett University",
      startDate: "To be announced",
      endDate: "To be announced",
      status: "Coming Soon",
      link: "https://www.bennett.edu.in/",
      courses: "BBA + MBA (5-years)",
    },
    {
      name: "Ashoka University",
      startDate: "Nov 2025",
      endDate: "Jan 21, 2026",
      status: "Closed",
      link: "https://application.ashoka.edu.in/",
      courses: "BA (Economics / Political Science + Management)",
    },
    {
      name: "Doon Business School",
      startDate: "Currently Open",
      endDate: "May 28, 2026",
      status: "Open",
      link: "https://bit.ly/4bb8z6n",
      courses: "BBA (3 Years)",
    },
    {
      name: "UPES (BBA Programs)",
      startDate: "Currently Open",
      endDate: "Mar 31, 2026",
      status: "Closed",
      link: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D",
      courses: "BBA Programs",
    },
  ],
};
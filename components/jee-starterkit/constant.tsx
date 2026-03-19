import React from "react";
import {
  FileText,
  Zap,
  Star,
  BookOpen,
  Calendar,
  Info,
  School,
  LayoutDashboard,
  BarChart3,
  Video,
  Users,
  CreditCard,
} from "lucide-react";
import { ResourceTab, CollegeInfo, ExamForm } from "./types";

export const SIDEBAR_ITEMS = [
  {
    id: "nlu_predictor",
    label: "NLU Predictor",
    icon: <LayoutDashboard className="w-5 h-5" />,
    active: true,
  },
  {
    id: "pref_list",
    label: "NLU Preference List",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "ailet_predictor",
    label: "AILET Predictor",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "written_analysis",
    label: "Written Analysis",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "video_analysis",
    label: "Video Analysis",
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: "mentors",
    label: "Connect With Mentors",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "flashcards",
    label: "GK Flashcards",
    icon: <CreditCard className="w-5 h-5" />,
  },
];

export const RESOURCE_TABS = [
  { id: ResourceTab.PYQ, icon: <FileText className="w-5 h-5" />, label: "PYQ" },
  {
    id: ResourceTab.CHEATSHEETS,
    icon: <Zap className="w-5 h-5" />,
    label: "CheatSheets",
  },
  {
    id: ResourceTab.MIND_JOURNALS,
    icon: <Star className="w-5 h-5" />,
    label: "Mind Journals",
    isNew: true,
  },
  // { id: ResourceTab.GK_NOTES, icon: <BookOpen className="w-5 h-5" />, label: 'GK Notes' },
  {
    id: ResourceTab.FORMS,
    icon: <Calendar className="w-5 h-5" />,
    label: "Forms",
  },
  {
    id: ResourceTab.DESK,
    icon: <Info className="w-5 h-5" />,
    label: "Desk of JEE",
  },
  {
    id: ResourceTab.COLLEGES,
    icon: <School className="w-5 h-5" />,
    label: "Cut-offs",
  },
  {
    id: ResourceTab.CONTACTS,
    icon: <Users className="w-5 h-5" />,
    label: "Contacts",
  },
];

export const COLLEGES_DATA: CollegeInfo[] = [
  {
    name: "NLSIU Bangalore",
    location: "Karnataka",
    rank: 1,
    description:
      "The Harvard of the East, NLSIU is the premier law institute in India known for its rigorous academic culture.",
    stats: { seats: 240, medianPackage: "18.5 LPA", cutOff: "Rank 1-100" },
  },
  {
    name: "NALSAR Hyderabad",
    location: "Telangana",
    rank: 2,
    description:
      "Famous for its liberal culture and beautiful residential campus, NALSAR consistently produces top legal minds.",
    stats: { seats: 132, medianPackage: "16 LPA", cutOff: "Rank 101-250" },
  },
  {
    name: "WBNUJS Kolkata",
    location: "West Bengal",
    rank: 3,
    description:
      "Strongly focused on corporate law and public litigation, NUJS has a vibrant student community.",
    stats: { seats: 127, medianPackage: "15 LPA", cutOff: "Rank 251-450" },
  },
];

export const FORMS_DATA: ExamForm[] = [
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
    name: "Manipal University",
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
    name: "PESSAT 2026",
    startDate: "Sep 5, 2025",
    endDate: "Jul 2026 (Tentative)",
    link: "https://admissions.pes.edu/registration/",
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
];

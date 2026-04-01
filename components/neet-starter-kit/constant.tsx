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
    id: "neet_predictor",
    label: "NEET College Predictor",
    icon: <LayoutDashboard className="w-5 h-5" />,
    active: true,
  },
  {
    id: "rank_predictor",
    label: "NEET Rank Predictor",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "cutoff_analyzer",
    label: "Cutoff Analyzer",
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
    label: "Biology Flashcards",
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
    label: "Desk of NEET",
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
    name: "AIIMS New Delhi",
    location: "New Delhi",
    rank: 1,
    description:
      "India's premier medical institution, AIIMS Delhi is the gold standard for medical education with world-class faculty, research, and clinical exposure.",
    stats: { seats: 107, medianPackage: "24 LPA", cutOff: "NEET 715+" },
  },
  {
    name: "CMC Vellore",
    location: "Tamil Nadu",
    rank: 2,
    description:
      "Christian Medical College is renowned for its exceptional clinical training, community outreach, and a deeply compassionate approach to medicine.",
    stats: { seats: 100, medianPackage: "18 LPA", cutOff: "NEET 690+" },
  },
  {
    name: "JIPMER Puducherry",
    location: "Puducherry",
    rank: 3,
    description:
      "A top-tier medical institute known for its strong research programs, excellent patient care, and consistently high placement records.",
    stats: { seats: 200, medianPackage: "16 LPA", cutOff: "NEET 680+" },
  },
];
 
export const FORMS_DATA: ExamForm[] = [
  {
    name: "NEET UG 2026",
    startDate: "Feb 2026 (Expected)",
    endDate: "Mar 2026 (Expected)",
    link: "https://neet.nta.nic.in/",
    status: "Coming Soon",
  },
  {
    name: "MCC NEET UG Counselling 2026",
    startDate: "After NEET Results",
    endDate: "Ongoing Rounds",
    link: "https://mcc.nic.in/",
    status: "Coming Soon",
  },
  {
    name: "AFMC Pune (via NEET)",
    startDate: "Post NEET Registration",
    endDate: "Jun 2026 (Expected)",
    link: "https://www.afmc.nic.in/",
    status: "Coming Soon",
  },
  {
    name: "AIIMS (via NEET UG)",
    startDate: "Through MCC Counselling",
    endDate: "As per MCC Schedule",
    link: "https://www.aiims.edu/",
    status: "Coming Soon",
  },
  {
    name: "JIPMER (via NEET UG)",
    startDate: "Through MCC Counselling",
    endDate: "As per MCC Schedule",
    link: "https://jipmer.edu.in/",
    status: "Coming Soon",
  },
  {
    name: "MHT CET 2026 (Medical)",
    startDate: "Jan 10, 2026",
    endDate: "Feb 12, 2026",
    link: "https://cetcell.mahacet.org/",
    status: "Open",
  },
  {
    name: "KCET 2026 (Medical)",
    startDate: "Jan 17, 2026",
    endDate: "Feb 17, 2026",
    link: "https://cetonline.karnataka.gov.in/kea/",
    status: "Open",
  },
  {
    name: "Manipal MBBS 2026 (via NEET)",
    startDate: "Currently Open",
    endDate: "Mar 15, 2026",
    link: "https://manipal.edu/",
    status: "Open",
  },
  {
    name: "CMC Vellore MBBS 2026",
    startDate: "Mar 2026 (Expected)",
    endDate: "May 2026 (Expected)",
    link: "https://www.cmch-vellore.edu/",
    status: "Coming Soon",
  },
  {
    name: "BHU MBBS 2026 (via NEET)",
    startDate: "Through CSAB Counselling",
    endDate: "As per Schedule",
    link: "https://www.bhu.ac.in/",
    status: "Coming Soon",
  },
  {
    name: "AMU MBBS 2026 (via NEET)",
    startDate: "Post NEET Results",
    endDate: "As per AMU Schedule",
    link: "https://www.amu.ac.in/",
    status: "Coming Soon",
  },
  {
    name: "TG EAMCET 2026 (Medical)",
    startDate: "Mar 2026",
    endDate: "Apr 2026",
    link: "https://eapcet.tgche.ac.in/",
    status: "Coming Soon",
  },
  {
    name: "GUJCET 2026 (Medical)",
    startDate: "Jan 2, 2026",
    endDate: "Jan 25, 2026",
    link: "https://gujcet.gseb.org/",
    status: "Open",
  },
  {
    name: "KEAM 2026 (Medical)",
    startDate: "Mar 2026 (TBA)",
    endDate: "Apr 2026",
    link: "https://cee.kerala.gov.in/",
    status: "Coming Soon",
  },
  {
    name: "WBJEE 2026 (Medical)",
    startDate: "Dec 2025",
    endDate: "Feb 2026",
    link: "https://wbjeeb.nic.in/",
    status: "Open",
  },
  {
    name: "UP NEET State Counselling 2026",
    startDate: "Post NEET Results",
    endDate: "As per DGME Schedule",
    link: "https://upneet.gov.in/",
    status: "Coming Soon",
  },
];
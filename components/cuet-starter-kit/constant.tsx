import React from "react";
import { FileText, Zap, Star, Calendar, Info, School, Users } from "lucide-react";
import { ResourceTab, CollegeInfo, ExamForm } from "./types";

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
  {
    id: ResourceTab.FORMS,
    icon: <Calendar className="w-5 h-5" />,
    label: "Forms",
  },
  {
    id: ResourceTab.DESK,
    icon: <Info className="w-5 h-5" />,
    label: "Desk of CUET",
  },
  {
    id: ResourceTab.COLLEGES,
    icon: <School className="w-5 h-5" />,
    label: "Universities",
  },
  {
    id: ResourceTab.CONTACTS,
    icon: <Users className="w-5 h-5" />,
    label: "Contacts",
  },
];

export const COLLEGES_DATA: CollegeInfo[] = [
  {
    name: "University of Delhi",
    location: "Delhi",
    rank: 1,
    description:
      "One of India's top central universities with strong undergraduate programs and broad course options through CUET.",
    stats: { seats: 70000, medianPackage: "8-12 LPA", cutOff: "High percentile" },
  },
  {
    name: "Banaras Hindu University",
    location: "Varanasi",
    rank: 2,
    description:
      "A leading central university known for academic depth, research ecosystem, and diverse UG opportunities.",
    stats: { seats: 30000, medianPackage: "6-10 LPA", cutOff: "Competitive" },
  },
  {
    name: "Jamia Millia Islamia",
    location: "New Delhi",
    rank: 3,
    description:
      "Reputed institution offering quality programs across humanities, commerce, and sciences via CUET admissions.",
    stats: { seats: 12000, medianPackage: "6-9 LPA", cutOff: "Moderate to high" },
  },
];

export const FORMS_DATA: ExamForm[] = [
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
];

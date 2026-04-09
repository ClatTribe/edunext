"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Search, ChevronDown, Heart, Calendar, Award, ExternalLink, Filter, X,
  AlertCircle, Sparkles, Globe, GraduationCap, IndianRupee, Star,
  BookOpen, Stethoscope, TrendingUp, ShoppingBag, Layers,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"
import { ScholarshipRecommend } from "../../../components/CourseFinder/ScholarshipRecommend"
import type { Scholarship } from "../../../components/CourseFinder/ScholarshipRecommend"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// CURATED SCHOLARSHIP DATA BY PROGRAM
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
interface CuratedScholarship {
  id: string
  name: string
  provider: string
  amount: string
  eligibility: string
  deadline: string
  link: string
  category: string
  tags: string[]
}

const CURATED_SCHOLARSHIPS: Record<string, CuratedScholarship[]> = {
  general: [
    {
      id: "g1",
      name: "National Scholarship Portal â Central Sector Scheme (CSS)",
      provider: "Ministry of Education, Govt. of India",
      amount: "â¹12,000 â â¹20,000 per year",
      eligibility: "Scored 80%+ in Class XII; family income â¤ â¹4.5 Lakh/year; pursuing UG/PG in recognised institution. 50% reserved for girls.",
      deadline: "October 31 each year (NSP portal)",
      link: "https://scholarships.gov.in",
      category: "general",
      tags: ["Government", "Merit + Need", "UG/PG"],
    },
    {
      id: "g2",
      name: "HDFC Bank Parivartan ECS Scholarship",
      provider: "HDFC Bank â CSR Initiative",
      amount: "Up to â¹75,000 per year",
      eligibility: "Class 12 pass; pursuing any UG professional course; family income â¤ â¹3.5 Lakh/year; scored â¥55% in qualifying exam.",
      deadline: "Rolling (check HDFC CSR portal)",
      link: "https://www.hdfcbankparivartanscholarships.com",
      category: "general",
      tags: ["Private", "Need-Based", "Any UG Course"],
    },
    {
      id: "g3",
      name: "Sitaram Jindal Foundation Scholarship",
      provider: "Sitaram Jindal Foundation",
      amount: "â¹2,500 â â¹5,000 per month",
      eligibility: "Class 11 onwards to PG level; economically underprivileged; merit considered. Separate criteria for different course levels.",
      deadline: "August each year",
      link: "https://www.sitaramjindal.com/scholarship.html",
      category: "general",
      tags: ["Private Foundation", "Need-Based", "Class 11+"],
    },
    {
      id: "g4",
      name: "Swami Dayanand Education Foundation Scholarship",
      provider: "Swami Dayanand Education Foundation",
      amount: "Varies by course (merit-cum-means)",
      eligibility: "Students pursuing Engineering, Medical, Commerce, Arts; family income â¤ â¹6 Lakh/year; minimum 60% in qualifying exam.",
      deadline: "August 31 each year",
      link: "https://www.swamidayanand.org/scholarship-india",
      category: "general",
      tags: ["Merit-Cum-Means", "All Courses", "Private Foundation"],
    },
    {
      id: "g5",
      name: "NSP Post-Matric Scholarship (OBC / SC / ST / Minority)",
      provider: "Various Ministries, Govt. of India (via NSP)",
      amount: "â¹300 â â¹1,200/month + maintenance allowance",
      eligibility: "Students from SC/ST/OBC/Minority communities pursuing Class 11 to PG level; income ceiling varies by scheme.",
      deadline: "October 31 each year (NSP portal)",
      link: "https://scholarships.gov.in/All-Scholarships",
      category: "general",
      tags: ["Government", "Category-Based", "Post-Matric"],
    },
    {
      id: "g6",
      name: "Reliance Foundation Undergraduate Scholarship",
      provider: "Reliance Foundation",
      amount: "Up to â¹4 Lakh total for 4 years",
      eligibility: "Top 12th scorers pursuing Science / Commerce / Humanities; family income â¤ â¹15 Lakh/year; All-India open.",
      deadline: "Check official site each year",
      link: "https://scholarships.reliancefoundation.org",
      category: "general",
      tags: ["Private", "Merit + Need", "All Streams"],
    },
    {
      id: "g7",
      name: "Tata Capital Pankh Scholarship",
      provider: "Tata Capital Ltd.",
      amount: "Up to â¹50,000 per year",
      eligibility: "Students from Class 11 through graduation; family income â¤ â¹4 Lakh/year; scored â¥60% in previous exam.",
      deadline: "August â September (Buddy4Study portal)",
      link: "https://www.tatacapital.com/about-us/csr/pankh-scholarship.html",
      category: "general",
      tags: ["Private", "Need-Based", "Class 11 â UG"],
    },
    {
      id: "g8",
      name: "Aditya Birla Capital Scholarship",
      provider: "Aditya Birla Capital",
      amount: "â¹60,000 per year",
      eligibility: "Class 12 to postgraduation; scored â¥60%; family income â¤ â¹6 Lakh/year; pursuing any stream.",
      deadline: "September each year",
      link: "https://www.adityabirlacapital.com/abc-of-money/csr",
      category: "general",
      tags: ["Corporate CSR", "Need-Based", "All Courses"],
    },
  ],
  btech: [
    {
      id: "bt1",
      name: "AICTE Pragati Scholarship for Girl Students",
      provider: "All India Council for Technical Education (AICTE)",
      amount: "â¹50,000 per year",
      eligibility: "First year girl students in AICTE-approved technical institutions (B.Tech/B.E); family income â¤ â¹8 Lakh/year; only one girl child from a family eligible.",
      deadline: "October each year (AICTE portal)",
      link: "https://www.aicte-india.org/bureaus/scholarship",
      category: "btech",
      tags: ["Government", "Girls Only", "B.Tech/B.E"],
    },
    {
      id: "bt2",
      name: "AICTE Saksham Scholarship (Divyang Students)",
      provider: "All India Council for Technical Education (AICTE)",
      amount: "â¹50,000 per year",
      eligibility: "Students with 40%+ disability pursuing B.Tech/B.E/B.Arch in AICTE-approved institutions; family income â¤ â¹8 Lakh/year.",
      deadline: "October each year (AICTE portal)",
      link: "https://www.aicte-india.org/bureaus/scholarship",
      category: "btech",
      tags: ["Government", "PwD Students", "B.Tech/B.E"],
    },
    {
      id: "bt3",
      name: "IET India Scholarship Award",
      provider: "Institution of Engineering and Technology (IET)",
      amount: "â¹1.5 Lakh (one-time)",
      eligibility: "2nd / 3rd year B.Tech / B.E students; JEE Mains/Advanced rank â¤ 10,000; pursuing core engineering; strong academic record.",
      deadline: "March 31 each year",
      link: "https://scholarships.theietevents.com",
      category: "btech",
      tags: ["Merit-Based", "2nd/3rd Year", "Core Engineering"],
    },
    {
      id: "bt4",
      name: "Gaurav Foundation Scholarship",
      provider: "Gaurav Foundation",
      amount: "Tuition fee up to â¹10 Lakh total",
      eligibility: "Class 12 pass-outs pursuing engineering in government institutes; outstanding academic record; financial need.",
      deadline: "November 20, 2026",
      link: "https://www.gauravfoundation.org",
      category: "btech",
      tags: ["Private Foundation", "Government Colleges", "Merit + Need"],
    },
    {
      id: "bt5",
      name: "Infosys STEM Stars Scholarship",
      provider: "Infosys Foundation",
      amount: "â¹80,000 per year",
      eligibility: "Female students in 1st year B.Tech (CS/IT/Electronics) from Tier-2/3 cities; family income â¤ â¹5 Lakh/year; merit-based.",
      deadline: "Check Infosys Foundation website",
      link: "https://www.infosys.com/infosys-foundation/initiatives/stem-stars.html",
      category: "btech",
      tags: ["Women in STEM", "CS/IT/Electronics", "Private"],
    },
    {
      id: "bt6",
      name: "Google Generation Scholarship",
      provider: "Google",
      amount: "â¹1 Lakh (approx.) + mentoring",
      eligibility: "B.Tech students in Computer Science / related fields; women or underrepresented communities preferred; strong academics & leadership.",
      deadline: "December each year (Google portal)",
      link: "https://buildyourfuture.withgoogle.com/scholarships",
      category: "btech",
      tags: ["Corporate", "CS/IT", "Women / Diversity"],
    },
    {
      id: "bt7",
      name: "ONGC Scholarship for SC/ST Engineering Students",
      provider: "Oil and Natural Gas Corporation (ONGC)",
      amount: "â¹48,000 per year",
      eligibility: "SC/ST students in 1st year B.E/B.Tech in engineering disciplines; merit-based; annual family income â¤ â¹1.5 Lakh.",
      deadline: "December each year",
      link: "https://ongcscholarship.com",
      category: "btech",
      tags: ["Government PSU", "SC/ST", "B.Tech/B.E"],
    },
    {
      id: "bt8",
      name: "Mphasis F1 Foundation Scholarship",
      provider: "Mphasis F1 Foundation",
      amount: "Up to â¹50,000 per year",
      eligibility: "Students from low-income families pursuing B.Tech/B.E in government colleges; scored â¥70%; excellent aptitude.",
      deadline: "Rolling applications",
      link: "https://www.mphasis.com/home/corporate-social-responsibility.html",
      category: "btech",
      tags: ["Corporate CSR", "Government Colleges", "Need-Based"],
    },
  ],
  mbbs: [
    {
      id: "mb1",
      name: "GSK Pharmaceuticals Medical Scholarship",
      provider: "GlaxoSmithKline (GSK) Pharmaceuticals India",
      amount: "Up to â¹1,00,000 per year for 4.5 years",
      eligibility: "1st year MBBS students in government medical colleges; NEET-qualified; family income â¤ â¹4 Lakh/year; merit-based selection.",
      deadline: "October each year",
      link: "https://www.gsk.com/en-gb/responsibility/health/",
      category: "mbbs",
      tags: ["Private Pharma", "Government Colleges", "MBBS 1st Year"],
    },
    {
      id: "mb2",
      name: "Dr. Reddy's Foundation Sashakt Scholarship",
      provider: "Dr. Reddy's Foundation",
      amount: "Financial aid â tuition + living expenses",
      eligibility: "Female students who have completed Class 12 and gained admission to MBBS; economically underprivileged; strong NEET score.",
      deadline: "Check Dr. Reddy's Foundation portal",
      link: "https://www.drreddysfoundation.org",
      category: "mbbs",
      tags: ["Women in Medicine", "Private Foundation", "MBBS"],
    },
    {
      id: "mb3",
      name: "AIIMS Internal Merit-Cum-Means Scholarship",
      provider: "All India Institute of Medical Sciences (AIIMS), Delhi",
      amount: "â¹1,000 â â¹2,000 per month",
      eligibility: "MBBS / BDS students enrolled at AIIMS Delhi; based on academic merit and financial need; automatically considered on admission.",
      deadline: "Internal process at AIIMS",
      link: "https://www.aiims.edu",
      category: "mbbs",
      tags: ["Government Institute", "Merit + Need", "AIIMS Students"],
    },
    {
      id: "mb4",
      name: "AIMSET Scholarship (All India Medical Scholarship Entrance Test)",
      provider: "AIMSET",
      amount: "Scholarship + admission support to 300+ colleges",
      eligibility: "Students aspiring to study MBBS, BAMS, BHMS, BDS; no income criteria; AIMSET examination score-based.",
      deadline: "Multiple sessions throughout the year",
      link: "https://www.aimset.in",
      category: "mbbs",
      tags: ["Entrance-Based", "MBBS/BAMS/BHMS/BDS", "All Students"],
    },
    {
      id: "mb5",
      name: "NSP Merit-cum-Means Scholarship (Technical/Professional)",
      provider: "Ministry of Minority Affairs, Govt. of India",
      amount: "Course fee up to â¹20,000 + maintenance â¹1,000/month",
      eligibility: "Minority community students (Muslim, Sikh, Christian, Buddhist, Zoroastrian, Jain) pursuing professional courses including MBBS; income â¤ â¹2.5 Lakh/year; 50%+ in previous exam.",
      deadline: "October 31 each year (NSP portal)",
      link: "https://scholarships.gov.in",
      category: "mbbs",
      tags: ["Government", "Minority Communities", "Professional Courses"],
    },
    {
      id: "mb6",
      name: "Swami Dayanand Medical Scholarship",
      provider: "Swami Dayanand Education Foundation",
      amount: "Merit-cum-means â covers partial/full fees",
      eligibility: "1st year MBBS students only; family income â¤ â¹6 Lakh/year; excellent NEET score; enrolled in recognised medical college.",
      deadline: "August 31 each year",
      link: "https://www.swamidayanand.org/scholarship-india",
      category: "mbbs",
      tags: ["Private Foundation", "1st Year MBBS", "Need-Based"],
    },
    {
      id: "mb7",
      name: "Tata Trusts Health Education Grant",
      provider: "Tata Trusts",
      amount: "Varies by case (need-based grant)",
      eligibility: "Students from economically marginalised backgrounds pursuing MBBS / health sciences at reputed institutions; strong merit required.",
      deadline: "Rolling (apply via Tata Trusts portal)",
      link: "https://www.tatatrusts.org",
      category: "mbbs",
      tags: ["Private Trust", "Need-Based", "Health Sciences"],
    },
    {
      id: "mb8",
      name: "ONGC Scholarship for SC/ST Medical Students",
      provider: "ONGC Foundation",
      amount: "â¹48,000 per year",
      eligibility: "SC/ST students in 1st year MBBS / medical courses; income â¤ â¹1.5 Lakh/year; merit-based.",
      deadline: "December each year",
      link: "https://ongcscholarship.com",
      category: "mbbs",
      tags: ["Government PSU", "SC/ST", "MBBS"],
    },
  ],
  mba: [
    {
      id: "ma1",
      name: "IIM Bangalore Need-Based Financial Assistance",
      provider: "Indian Institute of Management Bangalore",
      amount: "Partial to full tuition waiver",
      eligibility: "PGP (MBA) students at IIMB with family annual income â¤ â¹8 Lakh; considered automatically post-admission.",
      deadline: "Internal process after admission",
      link: "https://www.iimb.ac.in/financial-assistance",
      category: "mba",
      tags: ["IIM", "Need-Based", "PGP/MBA"],
    },
    {
      id: "ma2",
      name: "IIM Sambalpur Need-Based Financial Assistance (NBFA)",
      provider: "IIM Sambalpur",
      amount: "50â100% tuition fee waiver based on family income",
      eligibility: "MBA students at IIM Sambalpur; family income â¤ â¹4.5 Lakh = 100% waiver; â¹1.5Lâ3L = 75% waiver; â¹3Lâ4.5L = 50% waiver.",
      deadline: "Internal process after admission",
      link: "https://www.iimsambalpur.ac.in",
      category: "mba",
      tags: ["IIM", "Income-Based Slab", "PGP/MBA"],
    },
    {
      id: "ma3",
      name: "IDFC FIRST Bank MBA Scholarship",
      provider: "IDFC FIRST Bank",
      amount: "â¹2 Lakh total (â¹1 Lakh per year for 2 years)",
      eligibility: "Students in top-tier B-schools (IIMs, XLRI, SPJIMR, FMS etc.); family income â¤ â¹6 Lakh/year; first-generation MBA preferred.",
      deadline: "Check IDFC FIRST Bank CSR portal",
      link: "https://www.idfcfirst.bank.in/csr-activities/educational-initiatives/mba-scholarship",
      category: "mba",
      tags: ["Corporate", "Top B-Schools", "Need-Based"],
    },
    {
      id: "ma4",
      name: "ISB Merit Scholarships (GOALisB & Others)",
      provider: "Indian School of Business (ISB)",
      amount: "â¹5 Lakh â Full tuition fee waiver",
      eligibility: "Students admitted to ISB PGP; evaluated on GMAT/GRE score, work experience, leadership, essays; ~40 scholarships awarded per batch.",
      deadline: "Applied during ISB admission process",
      link: "https://www.isb.edu/en/programmes/post-graduate-programme/fees-financing/scholarships.html",
      category: "mba",
      tags: ["Top B-School", "Merit-Based", "ISB PGP"],
    },
    {
      id: "ma5",
      name: "XLRI Scholarships (Merit + Need)",
      provider: "XLRI â Xavier School of Management",
      amount: "Partial to full fee waiver (varies)",
      eligibility: "Students admitted to XLRI BM/HRM programmes; based on XAT score, merit, and financial need; diversity scholarships for women & SC/ST/OBC also available.",
      deadline: "Applied during XLRI admission process",
      link: "https://www.xlri.ac.in/scholarships",
      category: "mba",
      tags: ["Top B-School", "Merit + Diversity", "BM/HRM"],
    },
    {
      id: "ma6",
      name: "SPJIMR Scholarships",
      provider: "S.P. Jain Institute of Management and Research",
      amount: "Varies â partial fee waiver + stipend",
      eligibility: "Admitted PGDM students; based on CAT score, work ex, diversity, essays; women & first-gen students encouraged.",
      deadline: "Applied during SPJIMR admission process",
      link: "https://www.spjimr.org/pgdm-fees-and-scholarships",
      category: "mba",
      tags: ["Top B-School", "Diversity", "PGDM"],
    },
    {
      id: "ma7",
      name: "FMS Delhi Merit Scholarship",
      provider: "Faculty of Management Studies (FMS), University of Delhi",
      amount: "â¹40,000 per year (approx.)",
      eligibility: "Top performers in the FMS MBA batch; academic merit in first year; awarded in 2nd year.",
      deadline: "Internal process post-admission",
      link: "https://www.fms.edu",
      category: "mba",
      tags: ["Government Institute", "Merit-Based", "MBA"],
    },
    {
      id: "ma8",
      name: "AICTE-JKUAT International MBA Scholarship",
      provider: "AICTE (various tie-ups)",
      amount: "Full scholarship for international programmes",
      eligibility: "Indian students with strong MBA entrance scores; varies by specific programme; check AICTE scholarship page.",
      deadline: "Check AICTE portal",
      link: "https://www.aicte-india.org/bureaus/scholarship",
      category: "mba",
      tags: ["Government", "International", "MBA"],
    },
  ],
  bcom: [
    {
      id: "bc1",
      name: "NSP Central Sector Scholarship (Commerce Stream)",
      provider: "Ministry of Education, Govt. of India",
      amount: "â¹12,000 â â¹20,000 per year",
      eligibility: "Scored 80%+ in Class XII (Commerce); family income â¤ â¹4.5 Lakh/year; enrolled in B.Com / B.Com (Hons.) in recognised college.",
      deadline: "October 31 each year",
      link: "https://scholarships.gov.in",
      category: "bcom",
      tags: ["Government", "Merit + Need", "B.Com"],
    },
    {
      id: "bc2",
      name: "BML Munjal University B.Com Scholarship",
      provider: "BML Munjal University",
      amount: "Up to 100% tuition fee waiver",
      eligibility: "Based on Class 12% (Commerce), CUET score, UGAT percentile, or IB points; merit tiers determine scholarship percentage.",
      deadline: "Rolling â apply during admission",
      link: "https://www.bmu.edu.in/courses/bcom/scholarship-details/",
      category: "bcom",
      tags: ["University Scholarship", "Merit-Based", "B.Com"],
    },
    {
      id: "bc3",
      name: "HDFC Bank Parivartan ECS Scholarship (Commerce)",
      provider: "HDFC Bank CSR",
      amount: "Up to â¹75,000 per year",
      eligibility: "Class 12 (Commerce) pass; pursuing B.Com/BBA/CA Foundation; family income â¤ â¹3.5 Lakh/year; scored â¥55%.",
      deadline: "Rolling (Buddy4Study portal)",
      link: "https://www.hdfcbankparivartanscholarships.com",
      category: "bcom",
      tags: ["Corporate", "Need-Based", "B.Com / BBA / CA"],
    },
    {
      id: "bc4",
      name: "SRCC Merit Scholarship (Shri Ram College of Commerce)",
      provider: "Shri Ram College of Commerce, University of Delhi",
      amount: "Partial to full fee waiver + monthly stipend",
      eligibility: "Students admitted to B.Com (Hons.) at SRCC; based on Class 12 CUET score and academic record; automatically considered on admission.",
      deadline: "Internal â during CSAS (DU) admission",
      link: "https://www.srcc.edu/scholarships",
      category: "bcom",
      tags: ["Premier College", "Merit-Based", "B.Com Hons."],
    },
    {
      id: "bc5",
      name: "Gururayaru Foundation B.Com Scholarship",
      provider: "Gururayaru Foundation",
      amount: "Full tuition coverage for selected course",
      eligibility: "Indian students pursuing B.Com/Commerce UG; strong academic merit; financial need considered; All-India eligibility.",
      deadline: "Check Gururayaru Foundation portal",
      link: "https://www.gururayarufoundation.org",
      category: "bcom",
      tags: ["Private Foundation", "Merit-Based", "Full Tuition"],
    },
    {
      id: "bc6",
      name: "Hindu College DU Scholarships (Commerce)",
      provider: "Hindu College, University of Delhi",
      amount: "â¹2,000 â â¹10,000+ per year",
      eligibility: "30â40 scholarships for enrolled students; primarily income-based (family income < â¹4â8 Lakh/year); academic merit considered.",
      deadline: "Internal â after first semester results",
      link: "https://www.hinducollege.ac.in",
      category: "bcom",
      tags: ["Premier DU College", "Need-Based", "B.Com"],
    },
    {
      id: "bc7",
      name: "Commerce Ka Arjun Scholarship (Rajasthan)",
      provider: "State Govt. of Rajasthan",
      amount: "Up to 90% discount on CA/CMA Foundation coaching fees",
      eligibility: "Commerce students from Rajasthan pursuing CA/CMA after Class 12; merit in Class 12 Commerce; applied at designated coaching centres.",
      deadline: "State government announcement each year",
      link: "https://hte.rajasthan.gov.in",
      category: "bcom",
      tags: ["State Government", "CA/CMA Prep", "Rajasthan"],
    },
    {
      id: "bc8",
      name: "Tata Capital Pankh Scholarship (Commerce)",
      provider: "Tata Capital Ltd.",
      amount: "Up to â¹50,000 per year",
      eligibility: "Commerce students pursuing B.Com/BBA; family income â¤ â¹4 Lakh/year; scored â¥60% in Class 12; demonstrated financial need.",
      deadline: "August â September (Buddy4Study portal)",
      link: "https://www.tatacapital.com/about-us/csr/pankh-scholarship.html",
      category: "bcom",
      tags: ["Corporate", "Need-Based", "B.Com / BBA"],
    },
  ],
}

const PROGRAM_TABS = [
  { id: "general", label: "General / All Courses", icon: Layers, color: "#6366f1", description: "After Class 12 or Graduation â any stream" },
  { id: "btech", label: "B.Tech / Engineering", icon: BookOpen, color: "#10b981", description: "Scholarships for Engineering students" },
  { id: "mbbs", label: "MBBS / Medical", icon: Stethoscope, color: "#ef4444", description: "Scholarships for Medical students" },
  { id: "mba", label: "MBA / Management", icon: TrendingUp, color: "#8b5cf6", description: "Scholarships for Management students" },
  { id: "bcom", label: "B.Com / Commerce", icon: ShoppingBag, color: "#f59e0b", description: "Scholarships for Commerce students" },
]

const FEATURED_SCHOLARSHIP: Scholarship = {
  id: -1,
  scholarship_name: "Pt. R.S. Mishra Memorial Scholarship",
  organisation: "EduNext",
  eligibility: "High-achieving Indian students facing significant economic barriers; program highlights inclusion for persons with disabilities and displaced youth; leadership & community impact valued",
  benefit: "â¹5 Lakh+ financial aid, mentorship, and career support.",
  deadline: "Varies by university",
  link: "/pt-rs-mishra-memorial-scholarship",
  matchScore: 100,
  isFeatured: true,
  country_region: "All",
  provider: "EduNext",
  degree_level: "Undergraduate / Postgraduate",
  detailed_eligibility: "High-achieving Indian students facing significant economic barriers; program highlights inclusion for persons with disabilities and displaced youth; leadership & community impact valued",
  price: "5 Lakh+",
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// CURATED SCHOLARSHIP CARD COMPONENT
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const CuratedScholarshipCard: React.FC<{ scholarship: CuratedScholarship; programColor: string }> = ({ scholarship, programColor }) => (
  <div
    className="rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all backdrop-blur-xl flex flex-col gap-4"
    style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
  >
    <div>
      <h3 className="font-bold text-base sm:text-lg text-white leading-tight mb-1">{scholarship.name}</h3>
      <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg w-fit" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
        <Globe size={13} style={{ color: accentColor }} />
        <p className="text-xs text-slate-300 font-medium">{scholarship.provider}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5">
      {scholarship.tags.map(tag => (
        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: `${programColor}20`, color: programColor, border: `1px solid ${programColor}40` }}>
          {tag}
        </span>
      ))}
    </div>

    <div className="rounded-lg p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.1))', border: '1.5px solid rgba(251,191,36,0.3)' }}>
      <div className="flex items-start gap-2">
        <IndianRupee size={15} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-400 mb-0.5">Scholarship Amount</p>
          <p className="text-sm text-slate-200 font-semibold">{scholarship.amount}</p>
        </div>
      </div>
    </div>

    <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}>
      <div className="flex items-start gap-2">
        <GraduationCap size={15} className="shrink-0 mt-0.5" style={{ color: accentColor }} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: accentColor }}>Eligibility</p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{scholarship.eligibility}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 text-slate-400 pt-1" style={{ borderTop: `1px solid ${borderColor}` }}>
      <Calendar size={14} style={{ color: accentColor }} className="shrink-0" />
      <span className="text-xs"><strong className="text-slate-300">Deadline:</strong> {scholarship.deadline}</span>
    </div>

    <a
      href={scholarship.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 text-white py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:opacity-90 mt-auto"
      style={{ backgroundColor: programColor }}
    >
      Apply / Learn More <ExternalLink size={14} />
    </a>
  </div>
)

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// MAIN SCHOLARSHIP FINDER COMPONENT
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedScholarships, setSavedScholarships] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrganisation, setSelectedOrganisation] = useState("")
  const [viewMode, setViewMode] = useState<"all" | "recommended" | "byprogram">("all")
  const [selectedProgram, setSelectedProgram] = useState<string>("general")

  useEffect(() => { if (user) loadSavedScholarships() }, [user])
  useEffect(() => { if (viewMode === "all") fetchScholarships() }, [viewMode])
  useEffect(() => { if (viewMode === "all") applyFilters() }, [searchQuery, selectedOrganisation, scholarships, viewMode])

  const loadSavedScholarships = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.from("shortlist_builder").select("scholarship_id").eq("user_id", user.id).eq("item_type", "scholarship")
      if (error) return
      if (data) setSavedScholarships(new Set(data.map((item) => item.scholarship_id).filter(Boolean)))
    } catch {}
  }

  const toggleSaveScholarship = async (scholarshipId: number) => {
    if (!user) { alert("Please login to save scholarships"); return }
    if (scholarshipId === FEATURED_SCHOLARSHIP.id) return
    try {
      const isSaved = savedScholarships.has(scholarshipId)
      if (isSaved) {
        const { error } = await supabase.from("shortlist_builder").delete().eq("user_id", user.id).eq("scholarship_id", scholarshipId).eq("item_type", "scholarship")
        if (error) throw error
        setSavedScholarships(prev => { const s = new Set(prev); s.delete(scholarshipId); return s })
      } else {
        const { error } = await supabase.from("shortlist_builder").insert({ user_id: user.id, item_type: "scholarship", scholarship_id: scholarshipId, status: "interested" })
        if (error) throw error
        setSavedScholarships(prev => new Set([...prev, scholarshipId]))
      }
    } catch { alert("Failed to update shortlist. Please try again.") }
  }

  const fetchScholarships = async () => {
    try {
      setLoading(true); setError(null)
      const { data, error: supabaseError } = await supabase.from("scholarship").select("*").order("deadline", { ascending: true })
      if (supabaseError) throw supabaseError
      const valid = (data || []).filter(s => s.scholarship_name !== null)
      const all = [FEATURED_SCHOLARSHIP, ...valid]
      setScholarships(all); setFilteredScholarships(all)
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch scholarships") }
    finally { setLoading(false) }
  }

  const applyFilters = () => {
    let filtered = [...scholarships]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(s => s.isFeatured || s.scholarship_name?.toLowerCase().includes(q) || s.organisation?.toLowerCase().includes(q) || s.eligibility?.toLowerCase().includes(q))
    }
    if (selectedOrganisation) filtered = filtered.filter(s => s.isFeatured || s.organisation === selectedOrganisation)
    const featured = filtered.find(s => s.isFeatured)
    const rest = filtered.filter(s => !s.isFeatured)
    setFilteredScholarships(featured ? [featured, ...rest] : rest)
  }

  const resetFilters = () => { setSearchQuery(""); setSelectedOrganisation("") }
  const clearFilter = (f: string) => { if (f === "organisation") setSelectedOrganisation(""); if (f === "search") setSearchQuery("") }

  const getMatchBadge = (s: Scholarship) => {
    if (viewMode !== "recommended" || !s.matchScore) return null
    const score = s.matchScore
    if (score >= 90) return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ background: 'linear-gradient(90deg,#fbbf24,#f59e0b)', color: '#1f2937', border: '1px solid rgba(251,191,36,0.5)' }}><Sparkles size={12} /> <span className="hidden sm:inline">Perfect ({score.toFixed(0)}%)</span><span className="sm:hidden">{score.toFixed(0)}%</span></span>
    if (score >= 75) return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}><Award size={12} /> <span className="hidden sm:inline">Excellent ({score.toFixed(0)}%)</span><span className="sm:hidden">{score.toFixed(0)}%</span></span>
    if (score >= 60) return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}><Star size={12} /> <span className="hidden sm:inline">Great ({score.toFixed(0)}%)</span><span className="sm:hidden">{score.toFixed(0)}%</span></span>
    return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148,163,184,0.2)', color: '#94a3b8' }}>{score.toFixed(0)}%</span>
  }

  const formatDeadline = (d: string) => {
    if (!d || d === "") return "Check website"
    if (d.toLowerCase().includes("varies") || d.toLowerCase().includes("rolling") || d.toLowerCase().includes("typically")) return d
    try { const dt = new Date(d); if (!isNaN(dt.getTime())) return dt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) } catch {}
    return d
  }

  const getUniqueOrganisations = () => [...new Set(scholarships.map(s => s.organisation))].filter(Boolean).sort()
  const activeFiltersCount = [searchQuery, selectedOrganisation].filter(Boolean).length

  const activeProgramTab = PROGRAM_TABS.find(t => t.id === selectedProgram) || PROGRAM_TABS[0]
  const curatedList = CURATED_SCHOLARSHIPS[selectedProgram] || []

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Find Scholarships to Fuel Your Dreams
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Discover scholarships from government, private foundations & top institutions â curated for Indian students
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            {[
              { id: "all", icon: Award, label: "All Scholarships" },
              { id: "byprogram", icon: GraduationCap, label: "Browse by Program" },
              { id: "recommended", icon: Sparkles, label: "Recommended For You" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setViewMode(tab.id as typeof viewMode); if (tab.id !== "all") setLoading(false); if (tab.id === "all") { resetFilters(); fetchScholarships() } }}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
                style={viewMode === tab.id
                  ? { backgroundColor: accentColor, color: 'white' }
                  : { backgroundColor: secondaryBg, color: '#cbd5e1', border: `1px solid ${borderColor}` }}
              >
                <tab.icon size={18} />
                <span className={tab.id === "recommended" ? "hidden sm:inline" : ""}>{tab.label}</span>
                {tab.id === "recommended" && <span className="sm:hidden">Recommended</span>}
              </button>
            ))}
          </div>

          {/* ââ BY PROGRAM VIEW ââ */}
          {viewMode === "byprogram" && (
            <div>
              {/* Program Selector */}
              <div className="rounded-xl p-4 sm:p-5 mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: accentColor }}>Select Your Program</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {PROGRAM_TABS.map(tab => {
                    const Icon = tab.icon
                    const isSelected = selectedProgram === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedProgram(tab.id)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all"
                        style={isSelected
                          ? { backgroundColor: tab.color, color: 'white', boxShadow: `0 0 16px ${tab.color}50` }
                          : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' / ')[0]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Program Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${activeProgramTab.color}20` }}>
                  <activeProgramTab.icon size={22} style={{ color: activeProgramTab.color }} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{activeProgramTab.label} Scholarships</h2>
                  <p className="text-xs text-slate-400">{activeProgramTab.description} Â· {curatedList.length} scholarships listed</p>
                </div>
              </div>

              {/* Curated Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {curatedList.map(s => (
                  <CuratedScholarshipCard key={s.id} scholarship={s} programColor={activeProgramTab.color} />
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-8 rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <AlertCircle size={16} style={{ color: '#818cf8' }} className="shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scholarship details (amounts, deadlines, eligibility) are curated from official sources and may change. Always verify on the official scholarship website before applying. Data last updated April 2026.
                </p>
              </div>
            </div>
          )}

          {/* ââ RECOMMENDED VIEW ââ */}
          <ScholarshipRecommend
            user={user}
            viewMode={viewMode as "all" | "recommended"}
            featuredScholarship={FEATURED_SCHOLARSHIP}
            onRecommendedScholarshipsChange={setFilteredScholarships}
            onLoadingChange={setLoading}
            onErrorChange={setError}
          />

          {/* ââ ALL SCHOLARSHIPS VIEW ââ */}
          {viewMode === "all" && (
            <>
              {/* Search + Filter */}
              <div className="rounded-xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-500"
                      style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: `1px solid ${borderColor}` }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg text-sm sm:text-base font-medium transition hover:shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Filter size={18} />
                    Filters {activeFiltersCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#fbbf24', color: '#1f2937' }}>{activeFiltersCount}</span>}
                  </button>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}><span className="font-medium truncate max-w-[120px]">Search: {searchQuery}</span><button onClick={() => clearFilter("search")} className="hover:bg-white/10 rounded-full p-0.5"><X size={12} /></button></div>}
                    {selectedOrganisation && <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: `1px solid ${borderColor}` }}><span className="font-medium truncate max-w-[120px]">{selectedOrganisation}</span><button onClick={() => clearFilter("organisation")} className="hover:bg-white/10 rounded-full p-0.5"><X size={12} /></button></div>}
                    <button onClick={resetFilters} className="text-xs sm:text-sm font-medium px-2" style={{ color: accentColor }}>Clear All</button>
                  </div>
                )}
              </div>

              {showFilters && (
                <div className="rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-white"><Filter size={18} style={{ color: accentColor }} /> Refine Your Search</h3>
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 mb-2"><Globe size={14} style={{ color: accentColor }} /> Organisation</label>
                    <div className="relative">
                      <select className="appearance-none w-full rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-white" style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: `1px solid ${borderColor}` }} value={selectedOrganisation} onChange={e => setSelectedOrganisation(e.target.value)}>
                        <option value="" style={{ backgroundColor: secondaryBg }}>All Organisations</option>
                        {getUniqueOrganisations().map(org => <option key={org} value={org} style={{ backgroundColor: secondaryBg }}>{org}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && viewMode !== "byprogram" && (
            <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 backdrop-blur-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={18} />
              <div><h3 className="font-semibold text-sm sm:text-base" style={{ color: '#fca5a5' }}>Notice</h3><p className="text-xs sm:text-sm" style={{ color: '#fecaca' }}>{error}</p></div>
            </div>
          )}

          {/* Count Bar + Card Grid (All mode) */}
          {viewMode === "all" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            </div>
                viewMode =>
              </div>
            </>
                </div>
              <div className="mt-8 rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
  ]Û\ÜÓ[YOH^][\ËXÙ[\Ø\L]Ø\Ý[O^ÞÈÛÛÜXØÙ[ÛÛÜ_HÚ^O^ÌHÏÜ[Û\ÜÓ[YOHÛ\Ù[ZXÛ^\ÛHÛN^X\ÙHY^[È^]Ú]HÙ[\YØÚÛ\Ú\Ë[ÝÓØØ[TÝ[Ê
_HØÚÛ\Ú\ÏÜÜ[Ù]]Û\ÜÓ[YOH^][\ËXÙ[\Ø\LX\Ý[O^ÞÈÛÛÜXØÙ[ÛÛÜ_HÚ^O^ÌMHÏÜ[Û\ÜÓ[YOH^^ÈÛN^\ÛH^\Û]KMÜØ]YØÚÛ\Ú\ËÚ^_HØ]YÜÜ[Ù]Ù]ÛØY[ÈÈ
]Û\ÜÓ[YOH^\ÝYKXÙ[\][\ËXÙ[\M]Û\ÜÓ[YOH^^XÛÛ][\ËXÙ[\Ø\LÈ]Û\ÜÓ[YOH[[X]K\Ü[Ý[YY[LLËLLÛNLLÛNËLLÜ\XLÝ[O^ÞÈÜ\ÛÛÜXØÙ[ÛÛÜ_OÙ]Û\ÜÓ[YOH^\ÛHÛN^X\ÙH^\Û]KMØY[ËÜÙ]Ù]
H[\YØÚÛ\Ú\Ë[ÝOOHÈ
]Û\ÜÓ[YOH^XÙ[\KLLÛNKLMÝ[Y[ÈÚYÝË\ÛHMXÚÙÜX\^Ý[O^ÞÈXÚÙÜÝ[ÛÛÜÙXÛÛ\PËÜ\\ÛÛY	ØÜ\ÛÛÜX_O]Ø\Ú^O^ÍHÛ\ÜÓ[YOHÛNËLLÛNLL^X]]È^\Û]KMXMÏÈÛ\ÜÓ[YOH^X\ÙHÛN^[ÈY^^Û\Ù[ZXÛ^]Ú]HXLÈØÚÛ\Ú\ÈÝ[ÚÏÛ\ÜÓ[YOH^^ÈÛN^\ÛH^\Û]KMHY\Ý[È[Ý\[\ÏÜÙ]
H
]Û\ÜÓ[YOHÜYÜYXÛÛËLHÎÜYXÛÛËLØ\MÛNØ\MÙ[\YØÚÛ\Ú\ËX\
ÈOÂÛÛÝ\ÑX]\YHË\ÑX]\Y]\
]Ù^O^ÜËYHÛ\ÜÓ[YOHÝ[Y^MÛNMÝ\ÚYÝË[È[Ú][Û\ÚYÝÈ[]]HXÚÙÜX\^Ý[O^ÞÈXÚÙÜÝ[ÛÛÜÙXÛÛ\PËÜ\\ÑX]\YÈ	ÌÛÛYÙNYLÈ\ÛÛY	ØÜ\ÛÛÜXÞÚYÝÎ\ÑX]\YÈ	ÌÌØJ
KMNLKIÈ	ÛÛIÈ_OÚ\ÑX]\Y	]Û\ÜÓ[YOHXÛÛ]HÜLYÚL^^ÈÛXÛLÈKLKHÝ[YX[È^][\ËXÙ[\Ø\LHÚYÝË[YÝ[O^ÞÈXÚÙÜÝ[ÛÛÜ	ÈÙ	ËÛÛÜ	ÈÌYLÍÉÈ_OÝ\Ú^O^ÌMH[HÝ\[ÛÛÜÏPUTQÙ]B]Û\ÜÓ[YOH^][\Ë\Ý\\ÝYKX]ÙY[XMØ\L]Û\ÜÓ[YOH^LHZ[]ËLÈÛ\ÜÓ[YOHÛXÛ^X\ÙHÛN^[ÈY^^^]Ú]HXY[Ë]YÚXLÛNXLÈÜËØÚÛ\Ú\Û[YHØÚÛ\Ú\^Ú\ÑX]\Y	Ü[Û\ÜÓ[YOH^^È^X[X\M[LÜXÚÊOÜÜ[OÚÏÜËÜØ[\Ø][Û	]Û\ÜÓ[YOH^][\ËXÙ[\Ø\LXLÛNXLÈLÛNLÈKLKHÛNKLÝ[Y[ÈÝ[O^ÞÈXÚÙÜÝ[ÛÛÜ	ÜØJNKLKJIÈ_OÛØHÚ^O^ÌMHÝ[O^ÞÈÛÛÜXØÙ[ÛÛÜ_HÏÛ\ÜÓ[YOH^\Û]KLÌÛ[YY][H^^ÈÛN^\ÛH[Ø]HÜËÜØ[\Ø][ÛOÜÙ]BÝY]Ó[ÙHOOHXÛÛ[Y[Y	]Û\ÜÓ[YOH]LÙÙ]X]ÚYÙJÊ_OÙ]BÙ]]ÛÛÛXÚÏ^Ê
HOÙÙÛTØ]TØÚÛ\Ú\
ËY
_H\ØXY^Ú\ÑX]\YHÛ\ÜÓ[YO^Ø[Ú][ÛXÛÛÜÈ[LÚ[ËL	Ú\ÑX]\YÈÜXÚ]KMLÝ\ÛÜ[ÝX[ÝÙYØ]YØÚÛ\Ú\Ë\ÊËY
HÈ^\Û]KMLXHÝ[O^ÜØ]YØÚÛ\Ú\Ë\ÊËY
H	Z\ÑX]\YÈÈÛÛÜXØÙ[ÛÛÜHß_OX\Ú^O^ÌH[^ÜØ]YØÚÛ\Ú\Ë\ÊËY
H	Z\ÑX]\YÈÝ\[ÛÛÜÛHHÏØ]ÛÙ]JË[YÚX[]HË]Z[YÙ[YÚX[]JH	]Û\ÜÓ[YOHXLÈÛNXMÝ[Y[ÈLÈÛNMÝ[O^ÞÈXÚÙÜÝ[ÛÛÜ	ÜØJNKLKJIËÜ\\ÛÛY	ØÜ\ÛÛÜX_O]Û\ÜÓ[YOH^][\Ë\Ý\Ø\LÜYX][ÛØ\Ú^O^ÌMHÛ\ÜÓ[YOHÚ[ËL]LHÝ[O^ÞÈÛÛÜXØÙ[ÛÛÜ_HÏ]Û\ÜÓ[YOH^^ÈÛXÛXLH\\Ø\ÙHXÚÚ[Ë]ÚYHÝ[O^ÞÈÛÛÜXØÙ[ÛÛÜ_O[YÚX[]OÜÛ\ÜÓ[YOH^\Û]KLÌ^^ÈÛN^\ÛHXY[Ë\[^YÜË]Z[YÙ[YÚX[]HË[YÚX[]_OÜÙ]Ù]Ù]BÊË[Y]ËXÙJH	]Û\ÜÓ[YOHÝ[Y[ÈLÈÛNMXLÈÛNXMÝ[O^ÞÈXÚÙÜÝ[	Û[X\YÜYY[
LÍYYËØJLKNLKÍJKØJ
KMNLKJJIËÜ\	ÌÛÛYØJLKNLKÍÊIÈ_O]Û\ÜÓ[YOH^][\Ë\Ý\Ø\L[X[\YHÚ^O^ÌMHÛ\ÜÓ[YOHÚ[ËL]LHÝ[O^ÞÈÛÛÜ	ÈÙ	È_HÏ]Û\ÜÓ[YOH^^ÈÛXÛXLH\\Ø\ÙHXÚÚ[Ë]ÚYH^X[X\M[Y]ÏÜÛ\ÜÓ[YOH^^ÈÛN^\ÛH^\Û]KLXY[Ë\[^YÜË[Y]ËXÙ_OÜÙ]Ù]Ù]B]Û\ÜÓ[YOH^][\ËXÙ[\Ø\L^\Û]KLÌXLÈÛNXMLÈÛNMÝ[O^ÞÈÜ\Ü\ÛÛY	ØÜ\ÛÛÜX_OØ[[\Ú^O^ÌMHÝ[O^ÞÈÛÛÜXØÙ[ÛÛÜ_HÏÜ[Û\ÜÓ[YOH^^ÈÛN^\ÛHÝÛÈÛ\ÜÓ[YOHÛ\Ù[ZXÛXY[NÜÝÛÏÜ[Û\ÜÓ[YOH^\Û]KMÙÜX]XY[JËXY[J_OÜÜ[ÜÜ[Ù]ÜË[È	HY^ÜË[ßH\Ù]HØ[È[HÛÜ[\ÜY\\Û\ÜÓ[YOH^][\ËXÙ[\\ÝYKXÙ[\Ø\L^]Ú]HKLHÛNKLÈÝ[Y[È^\ÛHÛN^X\ÙHÛ\Ù[ZXÛ[Ú][ÛX[Ý\ÚYÝË[ÈÝ[O^ÞÈXÚÙÜÝ[ÛÛÜXØÙ[ÛÛÜ_OÚ\ÑX]\YÈ^ÜHØÚÛ\Ú\\HÝÈH^\[[ÈÚ^O^ÌMHÏØOBÙ]
BJ_BÙ]
_BÏ
_BÙ]Ù]ÑY][^[Ý]
BB^ÜY][ØÚÛ\Ú\[\

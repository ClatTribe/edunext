"use client"
import React from "react"
// Assuming '../defaultLayout' resolves to the actual layout component
// For this example, we'll keep the required structure without importing the actual file
import DefaultLayout from "../defaultLayout" 
import {
  GraduationCap,
  Sparkles,
  MapPin,
  Trophy,
  Globe,
  Calendar,
  BookOpen,
  ArrowRight,
} from "lucide-react"

// Placeholder for the DefaultLayout component as the actual import path is external
// In a real application, you would uncomment the import line above and remove this placeholder.
// const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
//   <div className="min-h-screen bg-gray-50">
//     <header className="bg-white shadow-md sticky top-0 z-10 p-4">
//       {/* Header content placeholder */}
//       <div className="max-w-7xl mx-auto flex justify-between items-center">
//         <h1 className="text-xl font-bold text-[#005de6]">Application Deadlines</h1>
//       </div>
//     </header>
//     <main className="pt-4">{children}</main>
//   </div>
// )


// Define the data structure for type safety
interface ApplicationDeadline {
  collegeName: string
  lastDate: string
  examDate: string
  linkToApply: string
  coursesOffered: string
}

// Convert the provided HTML table data into a structured array
const applicationData: ApplicationDeadline[] = [
  {
    collegeName: "IIM Indore",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Rohtak",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIFT",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Ranchi",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Sirmaur",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BMS (4- Years)",
  },
  {
    collegeName: "IIM Amritsar",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Bangalore",
    lastDate: "3rd week of October – 20 November 2025.",
    examDate: "13 December 2025 (Saturday)",
    linkToApply: "https://cdn.digialm.com/EForms/configuredHtml/1345/96226/Registration.html",
    coursesOffered: "Bsc(Data science & Economics)",
  },
  {
    collegeName: "JIPMAT",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Bangalore (BBA DBE)",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA In Digital Bussiness and Entrepreneurship",
  },
  {
    collegeName: "IIM Kozhikode",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "Bachelor of Management Studies (BMS) 4-years",
  },
  {
    collegeName: "IIM Shillong",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "IIM Sambhalpur",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "Bachelor of Science (B.S.) in Management and Public Policy (4-years)",
  },
  {
    collegeName: "IIM Udaipur",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IIM Udaipur Online Bilingual BBA Program 2026(4-years)",
  },
  {
    collegeName: "NMIMS(IPM)",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years)",
  },
  {
    collegeName: "Nalsar",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA+MBA (5- Years)",
  },
  {
    collegeName: "Masters’ Union",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "UG Programme in Technology and Business Management- 4 Years; UG Programme in Psychology and Marketing- 4 years",
  },
  {
    collegeName: "Symbiosis (SET 2025)",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA , BBA(Hons) (4- Years)",
  },
  {
    collegeName: "Christ University Entrance Test",
    lastDate: "December 1, 2025",
    examDate: "December 13–14, 2025",
    linkToApply: "https://espro.christuniversity.in/Application/",
    coursesOffered: "BBA , BBA(Hons)",
  },
  {
    collegeName: "NMIMS (NPAT 2025)",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA (3- Years); BBA (International Business); Bachelor in Business Management & Marketing",
  },
  {
    collegeName: "NFSU",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA (forensic+management)",
  },
  {
    collegeName: "TAPMI",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "IPM (5- Years) / BBA (Hons)- (4- Years)",
  },
  {
    collegeName: "IFMR (Krea University)",
    lastDate: "Monday, 01 Dec 25",
    examDate: "Monday, 08 Dec 25 to Friday, 12 Dec 2025",
    linkToApply: "https://ifmrgsbadmissions.krea.edu.in/ifmr-bba-programme-applynow?_gl=1*m9nqf3*_ga*MTUzNTQxNDI3Mi4xNzM4NDA0Mzk2*_ga_K846DTLBHK*MTczODQxMDUyMC4xLjEuMTczODQxMjAwMy4wLjAuMA",
    coursesOffered: "Integrated BBA+ MBA (5- Years)",
  },
  {
    collegeName: "NIRMA University",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "Integrated BBA+ MBA(5- Years)",
  },
  {
    collegeName: "UPES Dehradun",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA+MBA",
  },
  {
    collegeName: "NICMAR",
    lastDate: "December 21, 2025",
    examDate: "N/A",
    linkToApply: "https://apply.nicmar.ac.in/",
    coursesOffered: "N/A",
  },
  {
    collegeName: "IIT Patna",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA (3-years)",
  },
  {
    collegeName: "Alliance",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA(Hons.)& Bcom (hons)",
  },
  {
    collegeName: "Bennett University",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "BBA+MBA (5-years)",
  },
  {
    collegeName: "Ashoka",
    lastDate: "To be announced",
    examDate: "N/A",
    linkToApply: "",
    coursesOffered: "(B.A.Eco/pol Sci+Management electives)",
  },
]

// Component to render a single college card
const CollegeCard: React.FC<{ data: ApplicationDeadline }> = ({ data }) => {
  const isApplicationOpen = data.lastDate !== "To be announced"
  const isLinkAvailable = data.linkToApply && data.linkToApply !== "N/A"

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow relative">
      {/* College Name and Status */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-xl text-gray-900 mb-2 sm:mb-3 break-words">
            <GraduationCap size={20} className="inline mr-2 text-[#005de6]" />
            {data.collegeName}
          </h3>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
            isApplicationOpen ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isApplicationOpen ? "Application Open" : "Dates Awaiting"}
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Courses Offered */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <BookOpen size={12} className="sm:w-3.5 sm:h-3.5 text-[#005de6] flex-shrink-0" />
            Courses Offered
          </h4>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs sm:text-sm text-gray-700 break-words">{data.coursesOffered || "N/A"}</p>
          </div>
        </div>

        {/* Application Deadline */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Calendar size={12} className="flex-shrink-0" />
              <span>Last Date to Apply</span>
            </div>
            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
              {data.lastDate || "TBA"}
            </p>
          </div>
          
          {/* Exam Date */}
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Trophy size={12} className="flex-shrink-0" />
              <span>Exam Date</span>
            </div>
            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
              {data.examDate || "TBA"}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          {isLinkAvailable ? (
            <a
              href={data.linkToApply.startsWith("http") ? data.linkToApply : `https://${data.linkToApply}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#005de6] hover:bg-blue-700 text-white rounded-lg py-2 px-3 sm:px-4 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md"
            >
              <Globe size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              Apply Now
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </a>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-600 rounded-lg py-2 px-3 sm:px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium cursor-not-allowed"
            >
              <Sparkles size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              Link N/A (TBA)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main page component
const ApplicationDeadlinesPage: React.FC = () => {
  
  // You can optionally add filtering/sorting logic here if needed

  return (
    // Replace the DefaultLayout placeholder with the imported component in a real app
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#005de6] mb-1 sm:mb-2">
              📅 All MBA Forms and Deadline
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Check the application status and key dates for top management programs.
            </p>
          </div>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4 border-l-4 border-[#005de6]">
            <div className="flex items-center gap-2">
              <Calendar className="text-[#005de6] flex-shrink-0" size={20} />
              <span className="font-semibold text-base sm:text-lg">
                {applicationData.length} colleges listed
              </span>
            </div>
          </div>

          {/* College Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {applicationData.map((data, index) => (
              <CollegeCard key={index} data={data} />
            ))}
          </div>

          {/* Note Section */}
          <div className="mt-8 p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg shadow-inner">
            <h3 className="font-bold text-sm sm:text-base text-blue-800 mb-2 flex items-center gap-2">
              <MapPin size={16} /> Important Note
            </h3>
            <p className="text-xs sm:text-sm text-blue-700">
              Dates marked {"To be announced"} (TBA) are tentative. Please regularly check the official college website for the most accurate and updated information.
            </p>
          </div>

        </div>
      </div>
    </DefaultLayout>
  )
}

export default ApplicationDeadlinesPage
"use client";

import React from "react";

const primaryColor = "#823588";
const secondaryColor = "#F2AD00";

const collegesData = [
  {
    name: "IIM Indore",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Rohtak",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIFT",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Ranchi",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Sirmaur",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BMS (4-Years)",
  },
  {
    name: "IIM Amritsar",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Bangalore",
    lastDate: "3rd week Oct – 20 Nov 2025",
    examDate: "13 Dec 2025 (Saturday)",
    link: "https://cdn.digialm.com/EForms/configuredHtml/1345/96226/Registration.html",
    courses: "BSc (Data Science & Economics)",
  },
  {
    name: "JIPMAT",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Bangalore (BBA DBE)",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BBA in Digital Business & Entrepreneurship",
  },
  {
    name: "IIM Kozhikode",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "Bachelor of Management Studies (BMS) – 4 Years",
  },
  {
    name: "IIM Shillong",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "IIM Sambalpur",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "B.S. in Management & Public Policy (4-Years)",
  },
  {
    name: "IIM Udaipur",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "Online Bilingual BBA (4-Years)",
  },
  {
    name: "NMIMS (IPM)",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "IPM (5-Years)",
  },
  {
    name: "NALSAR",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BBA + MBA (5-Years)",
  },
  {
    name: "Masters’ Union",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses:
      "UG Programme in Technology & Business Management (4 Years), UG Programme in Psychology & Marketing (4 Years)",
  },
  {
    name: "Symbiosis (SET 2025)",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BBA / BBA (Hons) – 4 Years",
  },
  {
    name: "Christ University Entrance Test",
    lastDate: "December 1, 2025",
    examDate: "13–14 December 2025",
    link: "https://espro.christuniversity.in/Application/",
    courses: "BBA / BBA (Hons)",
  },
  {
    name: "NMIMS (NPAT 2025)",
    lastDate: "To be announced",
    examDate: "—",
    link: "https://apply.nicmar.ac.in/",
    courses:
      "BBA, BBA (International Business), Bachelor in Business Management & Marketing",
  },
  {
    name: "NFSU",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BBA (Forensic + Management)",
  },
  {
    name: "IFMR (Krea University)",
    lastDate: "01–12 December 2025",
    examDate: "08–12 December 2025",
    link: "https://ifmrgsbadmissions.krea.edu.in/ifmr-bba-programme-applynow",
    courses: "Integrated BBA + MBA (5-Years)",
  },
  {
    name: "NICMAR",
    lastDate: "December 21, 2025",
    examDate: "—",
    link: "https://apply.nicmar.ac.in/",
    courses: "BBA + MBA",
  },
  {
    name: "Ashoka University",
    lastDate: "To be announced",
    examDate: "—",
    link: "—",
    courses: "BA (Economics / Political Science + Management)",
  },
];


const FormandanddeadlinesPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: primaryColor }}
      >
        UG Management Colleges & Exam Schedule
      </h1>

      <div className="bg-white rounded-2xl shadow-md border overflow-x-auto">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              <th className="py-4 px-4 text-white font-semibold text-center">
                College
              </th>
              <th className="py-4 px-4 text-white font-semibold text-center">
                Last Date
              </th>
              <th className="py-4 px-4 text-white font-semibold text-center">
                Exam Date
              </th>
              <th className="py-4 px-4 text-white font-semibold text-center">
                Apply
              </th>
              <th className="py-4 px-4 text-white font-semibold text-center">
                Courses Offered
              </th>
            </tr>
          </thead>

          <tbody>
            {collegesData.map((row, index) => (
              <tr
                key={row.name}
                className={`border-t ${
                  index % 2 === 0 ? "bg-yellow-50/40" : "bg-white"
                } hover:bg-yellow-100/40 transition`}
              >
                <td className="py-4 px-4 text-center font-medium text-gray-800">
                  {row.name}
                </td>

                <td className="py-4 px-4 text-center text-gray-700">
                  {row.lastDate}
                </td>

                <td className="py-4 px-4 text-center text-gray-700">
                  {row.examDate}
                </td>

                <td className="py-4 px-4 text-center">
                  {row.link.startsWith("http") ? (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline hover:opacity-80"
                      style={{ color: secondaryColor }}
                    >
                      CLICK HERE
                    </a>
                  ) : (
                    <span
                      className="font-semibold"
                      style={{ color: secondaryColor }}
                    >
                      {row.link}
                    </span>
                  )}
                </td>

                <td className="py-4 px-4 text-center text-gray-700">
                  {row.courses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormandanddeadlinesPage;

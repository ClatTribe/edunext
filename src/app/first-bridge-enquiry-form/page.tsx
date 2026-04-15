// import Navbar from "../../../../components/first-bridge/Navbar"
import FacultyResidencies from "../../../components/first-bridge/Facultyresidencies";
import HeroSection from "../../../components/first-bridge/HeroSection";
import InternationalEcosystem from "../../../components/first-bridge/Internationalecosystem";
import SemesterAbroad from "../../../components/first-bridge/Semesterabroad";

export default function InternationalPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      {/* <Navbar /> */}
      <HeroSection />
      <InternationalEcosystem />
      <FacultyResidencies />
      <SemesterAbroad />
      {/* ── Add more sections below ──────────────────────────────────────────
          import each from @/components/first-bridge/SectionName
          then drop it here:

          <WhyChooseUsSection />
          <ProgramsSection />
          <PlacementSection />
          <TestimonialsSection />
          <FooterSection />
      ─────────────────────────────────────────────────────────────────────── */}
    </div>
  );
}

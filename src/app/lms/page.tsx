import Navbar from "../../../components/Navbar";
import { Hero } from "../../../components/LMS/Hero";
import { CentralSystem } from "../../../components/LMS/CentralSystem";
import { Features } from "../../../components/LMS/Features";
import { Testimonials } from "../../../components/LMS/Testimonials";
import {CTA} from "../../../components/LMS/CTA";
import Footer from "../../../components/Footer";
import LmsLeadForm from "../../../components/LMS/LmsLeadForm";

export default function App() {
  return (
    <div className="min-h-screen bg-[#060818] text-white font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <main>
        <Hero />
        <CentralSystem />
        <Features />
        <Testimonials />
        <CTA />
        <LmsLeadForm />
      </main>
      <Footer />
    </div>
  );
}

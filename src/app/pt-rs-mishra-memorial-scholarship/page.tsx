import React from 'react';
import {
    Calendar,
    IndianRupee,
    GraduationCap,
    Heart,
    Star,
    Sparkles,
    Target,
    BookOpen,
    CheckCircle,
    ClipboardList,
} from 'lucide-react';

// Use brand colors: Primary Blue (#2f61ce), Accent Amber (#fac300)

// Data for the featured scholarship (hardcoded as this is the dedicated page)
const SCHOLARSHIP_DATA = {
    name: "Pt. R.S. Mishra Memorial Scholarship",
    organisation: "EduNext",
    tagline: "Empowering India's brightest, breaking down barriers.",
    price: "₹5 Lakh+ financial aid per student",
    deadline: "Varies by University (Check Specific Dates)",
    benefits: [
        "Up to ₹5 Lakh+ in financial support (tuition, living costs)",
        "Exclusive 1-on-1 mentorship with industry leaders",
        "Career development workshops and networking events",
        "Lifetime alumni network access"
    ],
    eligibility_summary: "High-achieving Indian students facing significant economic barriers. Special emphasis on inclusion.",
    detailed_eligibility: [
        "Must be a citizen of India.",
        "Currently enrolled in or accepted into an Undergraduate or Postgraduate program at an accredited Indian university.",
        "Demonstrated academic excellence (e.g., GPA or percentile requirements).",
        "Documented proof of significant economic hardship (family income below threshold).",
        "Preference given to applicants with disabilities or those from displaced backgrounds.",
        "Evidence of leadership, community service, or exceptional extracurricular achievements.",
    ],
    application_steps: [
        "Step 1: Complete the online application form.",
        "Step 2: Submit academic transcripts and financial documents.",
        "Step 3: Write two essays (personal journey and leadership experience).",
        "Step 4: Attend a virtual interview with the selection committee (by invitation only).",
    ],
    link: "https://example.com/apply-mishra-scholarship", // Replace with the actual application link
};

const MemorialScholarshipPage = () => {
    // This component is designed to be a full-page layout, assuming no external layout components are wrapping it.
    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header/Hero Section - Prominent and professional */}
            <header className="py-12 md:py-20 bg-[#2f61ce] text-white shadow-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-3 mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Star className="w-5 h-5 text-[#fac300] fill-current" />
                        <span className="text-sm font-semibold uppercase tracking-widest">Our Signature Opportunity</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                        {SCHOLARSHIP_DATA.name}
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                        {SCHOLARSHIP_DATA.tagline}
                    </p>
                    
                    {/* Key Metrics in Hero */}
                    <div className="mt-8 flex justify-center flex-wrap gap-4 sm:gap-8">
                        <div className="flex items-center gap-2 bg-[#fac300] text-gray-900 px-4 py-2 rounded-lg shadow-md">
                            <IndianRupee className="w-5 h-5" />
                            <span className="font-bold text-sm sm:text-base">{SCHOLARSHIP_DATA.price}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="font-medium text-sm sm:text-base">{SCHOLARSHIP_DATA.deadline}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    
                    {/* Sticky Sidebar/CTA on Desktop */}
                    <aside className="lg:col-span-1 lg:sticky lg:top-8 mb-8 lg:mb-0">
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#fac300]">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="w-6 h-6 text-[#fac300] fill-current" />
                                Ready to Apply?
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm">
                                This scholarship is designed to remove financial barriers for {"India's"} future leaders.
                            </p>
                            <a 
                                href={SCHOLARSHIP_DATA.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#fac300] text-gray-900 py-3 rounded-lg font-bold text-lg hover:bg-amber-400 transition transform hover:scale-[1.01] shadow-md"
                            >
                                <Sparkles className="w-5 h-5" />
                                Start Application
                            </a>
                            <div className="mt-4 text-center text-xs text-gray-500">
                                Powered by {SCHOLARSHIP_DATA.organisation}
                            </div>
                        </div>
                    </aside>

                    {/* Detailed Information */}
                    <article className="lg:col-span-2 space-y-12">
                        
                        {/* 1. Mission and Background */}
                        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-[#2f61ce] mb-4 flex items-center gap-3">
                                <BookOpen className="w-7 h-7" />
                                Our Mission
                            </h2>
                            <p className="text-gray-700 text-lg mb-4 leading-relaxed border-l-4 border-[#fac300] pl-4 italic">
                                {"In the memory of Pt. R.S. Mishra, we pledge to foster educational inclusion and support those who aspire to lead positive change in their communities."}
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                The Pt. R.S. Mishra Memorial Scholarship, established by {SCHOLARSHIP_DATA.organisation}, is our commitment to promoting equitable access to higher education in India. We seek students who not only excel academically but also demonstrate resilience, leadership potential, and a deep commitment to social impact. This is more than financial aid; {"it's"} an investment in a {"scholar's"} entire journey, providing resources, networks, and mentorship to ensure their success.
                            </p>
                        </section>

                        {/* 2. Key Benefits */}
                        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-[#2f61ce] mb-6 flex items-center gap-3">
                                <IndianRupee className="w-7 h-7" />
                                Funding & Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SCHOLARSHIP_DATA.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <CheckCircle className="w-5 h-5 mt-1 text-[#2f61ce] flex-shrink-0" />
                                        <p className="text-gray-700 font-medium text-sm">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Eligibility Criteria */}
                        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-[#2f61ce] mb-6 flex items-center gap-3">
                                <GraduationCap className="w-7 h-7" />
                                Who Can Apply
                            </h2>
                            <p className="text-gray-700 mb-4 italic">
                                We are looking for high-achieving Indian students who meet the following core criteria:
                            </p>
                            <ul className="space-y-3 list-none p-0">
                                {SCHOLARSHIP_DATA.detailed_eligibility.map((criterion, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700">
                                        <Target className="w-5 h-5 mt-1 text-[#fac300] flex-shrink-0" />
                                        <span className="text-sm sm:text-base">{criterion}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        
                        {/* 4. Application Process */}
                        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-[#2f61ce] mb-6 flex items-center gap-3">
                                <ClipboardList className="w-7 h-7" />
                                How to Apply
                            </h2>
                            <div className="space-y-6">
                                {SCHOLARSHIP_DATA.application_steps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#2f61ce] text-white rounded-full font-bold text-lg shadow-md">
                                            {index + 1}
                                        </div>
                                        <div className='flex-1'>
                                            <p className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                                                {step.split(':')[0]}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                {step.includes(':') ? step.split(':')[1].trim() : "Detailed instruction available on the application portal."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <a 
                                    href={SCHOLARSHIP_DATA.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#2f61ce] text-white rounded-lg font-bold text-lg hover:bg-[#2451a8] transition shadow-lg"
                                >
                                    Access Application Portal
                                </a>
                            </div>
                        </section>

                    </article>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} {SCHOLARSHIP_DATA.organisation}. All rights reserved. | <a href="#" className="hover:text-[#fac300]">Privacy Policy</a>
                </div>
            </footer>
        </div>
    );
};

export default MemorialScholarshipPage;
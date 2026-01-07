import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const AIR1CommandCenter = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counter, setCounter] = useState(0);
  const [hasCounterStarted, setHasCounterStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const accentColor = "#7e22ce";
  const brandDark = "#3b0764";
  const brandAccent = "#d8b4fe";
  const goldColor = "#f3ad00";

  const comparisonImages = [
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691350/1_kiwmno.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691432/2_ow8cnm.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691468/3_hfgvl6.jpg",
    "https://res.cloudinary.com/daetdadtt/image/upload/v1767691494/4_mehnyw.jpg",
  ];

  const openPDF = (fileName: any) => {
    window.open(`/${fileName}`, "_blank");
  };

  const nextSlide = () => {
    if (currentSlide < comparisonImages.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Counter animation
  useEffect(() => {
    if (hasCounterStarted && counter < 292) {
      const timer = setTimeout(() => {
        setCounter((prev) => Math.min(prev + 5, 292));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [counter, hasCounterStarted]);

  // Trigger counter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const statsElement = document.getElementById("stats-section");
      if (statsElement && !hasCounterStarted) {
        const rect = statsElement.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setHasCounterStarted(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasCounterStarted]);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date("2026-05-04T00:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const TimerBlock = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[100px]">
      <div className="text-4xl font-black mb-1">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Heading Section */}
      <section className="relative pt-10 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-purple-200/30 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#F3AD00] to-[#823588] bg-clip-text text-transparent">
            AIR 1 Command Center
          </h1>
        </div>
      </section>

      {/* Countdown Timer Section */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div
          className="rounded-3xl p-10 text-center shadow-2xl"
          style={{
            background: "#823588",
            color: "white",
          }}
        >
          <p className="opacity-90 mb-6 text-lg">Countdown to IPMAT 2026</p>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            <TimerBlock label="Days" value={timeLeft.days} />
            <TimerBlock label="Hours" value={timeLeft.hours} />
            <TimerBlock label="Minutes" value={timeLeft.minutes} />
            <TimerBlock label="Seconds" value={timeLeft.seconds} />
          </div>

          <p className="font-semibold text-yellow-300">
            May 4, 2026 • Saturday
          </p>
        </div>
      </section>

      {/* Subheading and CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-4 text-center">
        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
          Nikhilesh Sanka didn't just study hard. He built a system. <br />
          Download the exact command center used by AIR 1.
        </p>
      </section>

      {/* Stats Grid Section */}
      <section id="stats-section" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Story Text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-gray-900">
              The "No-Excuses" Approach
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Coming from a non-English background, Nikhilesh faced a massive
              hurdle in Verbal Ability.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Most students quit. He simply{" "}
              <strong className="text-gray-900">quantified the problem</strong>.
              He tracked 550 mock questions, identified 3 specific error
              patterns, and ruthlessly eliminated them.
            </p>
            <div
              className="border-l-4 pl-6 py-2"
              style={{ borderColor: accentColor }}
            >
              <em className="text-gray-700 text-lg">
                "I treated the exam like code. If there's a bug, you don't hope
                it goes away. You debug it."
              </em>
            </div>
          </div>

          {/* Stat Card */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center">
            <div
              className="text-7xl font-black mb-4"
              style={{ color: "#823588" }}
            >
              {counter}
            </div>
            <div className="text-xl font-semibold text-gray-600 mb-4">
              Total Score (AIR 1)
            </div>
            <div className="text-lg font-bold text-green-600">
              ▲ 128 Marks higher than cutoff
            </div>
          </div>
        </div>
      </section>

      {/* Quote Strip */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ backgroundColor: "#823588" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl text-white font-light italic opacity-90 mb-4">
            "Motivation gets you started. Habit is what gets you AIR 1."
          </p>
          <div className="text-lg font-bold" style={{ color: brandAccent }}>
            - Nikhilesh Sanka
          </div>
        </div>
      </section>

      {/* Command Center Cards */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            The Command Center
          </h2>
          <p className="text-xl text-gray-600">
            Hover over the cards to see what real preparation looks like.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card 1: Time Table */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div
              className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
              style={{ color: accentColor }}
            >
              📅
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              The 6AM Algorithm
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              The rigid daily schedule that balanced Board exams with IPMAT
              prep. No burnout, just calculated slots.
            </p>
            <div className="bg-gray-50 -mx-8 -mb-8 p-6 mt-auto border-t border-gray-200 text-sm text-gray-700 group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
              <strong>Example Routine:</strong>
              <br />
              06:00 - Vocab Drills
              <br />
              14:00 - Mock Analysis (Non-negotiable)
              <br />
              21:00 - Formula Revision
            </div>
          </div>

          {/* Card 2: Question Bank */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div
              className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
              style={{ color: accentColor }}
            >
              📂
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              550+ Question Bank
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              He didn't solve random books. He solved these specific 550 PYQs
              that have the highest repetition probability.
            </p>
            <div className="bg-gray-50 -mx-8 -mb-8 p-6 mt-auto border-t border-gray-200 text-sm text-gray-700 group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
              <strong>Includes:</strong>
              <br />
              - The "Logarithm Trap" PDF
              <br />
              - 200 Critical Reasoning Set
              <br />- The "Must-Solve" Geometry List
            </div>
          </div>

          {/* Card 3: Comparison */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div
              className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
              style={{ color: accentColor }}
            >
              📊
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              AIR 1 vs. You
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Stop flying blind. Compare your current mock scores against
              Nikhilesh's scores in February 2025.
            </p>
            <div className="bg-gray-50 -mx-8 -mb-8 p-6 mt-auto border-t border-gray-200 text-sm text-gray-700 group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
              <strong>Benchmarks:</strong>
              <br />
              Feb Score: 180 (Him) vs ??? (You)
              <br />
              Accuracy: 88% (Him) vs ??? (You)
              <br />
              <strong>Check your gap.</strong>
            </div>
          </div>
        </div>
      </section>

<section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-5xl font-black text-center mb-16 tracking-tight"
          style={{ color: accentColor }}
        >
          Study Materials Used
        </h2>
        <div className="relative bg-white rounded-3xl p-12 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: accentColor }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: goldColor }}
          ></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
            {/* Image */}
            <div className="w-full md:w-5/12 flex justify-center">
              <div className="relative group">
                <div 
                  className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <img
                  src="https://res.cloudinary.com/daetdadtt/image/upload/v1767689500/WhatsApp_Image_2026-01-06_at_14.14.55_lwhwnk.jpg"
                  alt="Study Materials"
                  className="relative rounded-2xl shadow-xl max-h-80 w-full object-cover border-4 border-white"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight 
                size={48} 
                className="animate-pulse"
                style={{ color: accentColor, strokeWidth: 3 }}
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-5/12 flex flex-col items-center md:items-start space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
              </div>
              
              <div className="text-center md:text-left">
                <div 
                  className="text-8xl font-black mb-2 tracking-tighter"
                  style={{ color: goldColor }}
                >
                  550
                </div>
                <p className="text-gray-600 text-xl font-bold mb-2">
                  PYQs practiced from this resource
                </p>
                <p className="text-gray-400 text-sm italic">
                  The exact paper that helped secure AIR 1
                </p>
              </div>

              <button
                onClick={() => openPDF("ipmat_2019_Question_Paper-1.pdf")}
                className="group flex items-center justify-center gap-3 px-10 py-5 text-white rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: accentColor }}
              >
                <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                View PDF Resource
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Challenging Questions Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-5xl font-black text-center mb-16 tracking-tight"
          style={{ color: accentColor }}
        >
          Questions He Found Challenging
        </h2>
        <div className="relative bg-white rounded-3xl p-12 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div 
            className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: goldColor }}
          ></div>
          <div 
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: accentColor }}
          ></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
            {/* Image */}
            <div className="w-full md:w-5/12 flex justify-center">
              <div className="relative group">
                <div 
                  className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <img
                  src="https://res.cloudinary.com/daetdadtt/image/upload/v1767691017/WhatsApp_Image_2026-01-06_at_14.17.06_k1bdpw.jpg"
                  alt="Challenging Questions"
                  className="relative rounded-2xl shadow-xl max-h-80 w-full object-cover border-4 border-white"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight 
                size={48} 
                className="animate-pulse"
                style={{ color: accentColor, strokeWidth: 3 }}
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-5/12 flex flex-col items-center md:items-start space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-8xl mb-2">💡</div>
                <p className="text-gray-600 text-xl font-bold mb-2">
                  Questions that tested him the most
                </p>
                <p className="text-gray-400 text-sm italic">
                  Master the toughest questions with this collection
                </p>
              </div>

              <button
                className="group flex items-center justify-center gap-3 px-10 py-5 text-white rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: accentColor }}
              >
                <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                Access Resource
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Time Table Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-5xl font-black text-center mb-16 tracking-tight"
          style={{ color: accentColor }}
        >
          Time Table
        </h2>
        <div className="relative bg-white rounded-3xl p-12 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: accentColor }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: goldColor }}
          ></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
            {/* Image */}
            <div className="w-full md:w-5/12 flex justify-center">
              <div className="relative group">
                <div 
                  className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <img
                  src="https://res.cloudinary.com/daetdadtt/image/upload/v1767691018/WhatsApp_Image_2026-01-06_at_14.17.21_xyzjtt.jpg"
                  alt="Time Table"
                  className="relative rounded-2xl shadow-xl max-h-80 w-full object-cover border-4 border-white"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight 
                size={48} 
                className="animate-pulse"
                style={{ color: accentColor, strokeWidth: 3 }}
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-5/12 flex flex-col items-center md:items-start space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-8xl mb-2">📅</div>
                <p className="text-gray-600 text-xl font-bold mb-2">
                  Daily schedule followed by AIR 1
                </p>
                <p className="text-gray-400 text-sm italic">
                  Follow the exact routine that led to success
                </p>
              </div>

              <button
                className="group flex items-center justify-center gap-3 px-10 py-5 text-white rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: accentColor }}
              >
                <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AIR 1 vs You Carousel Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2
          className="text-4xl font-black text-center mb-12"
          style={{ color: accentColor }}
        >
          AIR 1 vs You
        </h2>
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-3xl mb-8">
            <img
              src={comparisonImages[currentSlide]}
              alt={`Comparison ${currentSlide + 1}`}
              className="rounded-2xl shadow-2xl w-full h-auto border-2 border-purple-200"
            />

            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-100 transition-all"
              style={{ color: accentColor }}
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide === comparisonImages.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-100 transition-all"
              style={{ color: accentColor }}
            >
              <ChevronRight size={28} />
            </button>

            <div className="flex justify-center gap-3 mt-6">
              {comparisonImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      currentSlide === index ? accentColor : "#d1d5db",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <button
              className="w-full px-8 py-4 text-white rounded-xl text-lg font-bold hover:opacity-90 hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              View Detailed Comparison
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 mb-12">
        <div
          className="rounded-3xl p-16 text-center text-white shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${brandDark})`,
          }}
        >
          <h2 className="text-4xl font-black mb-6">
            Ready to Engineer Your Rank?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the only cohort that teaches the AIR 1 methodology.
          </p>
          <button
            className="bg-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            style={{ color: accentColor }}
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIR1CommandCenter;

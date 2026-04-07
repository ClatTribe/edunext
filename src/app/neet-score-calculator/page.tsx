
import DefaultLayout from "@/app/defaultLayout";    // ← your existing layout
import OMRReaderClient from "../../../components/omr/OMRReaderClient";

export const metadata = {
  title: "OMR Sheet Reader — AI-Powered Answer Extraction",
  description:
    "Upload your OMR answer sheet and get instant answer extraction powered by AI Vision. Supports 30-200+ questions.",
};

export default function OMRReaderPage() {
  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#050818" }}>
        <div className="pt-16 pb-12 px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              OMR Sheet Reader
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Upload your OMR answer sheet image and get all answers extracted
              instantly using AI Vision
            </p>
            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
                AI Vision Powered
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
                Configurable Questions
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
                Multi-page Support
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
                CSV Export
              </span>
            </div>
          </div>

          {/* Main Component */}
          <OMRReaderClient/>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Configure & Upload",
                  desc: "Set question count, choose options (A-D or A-E), then upload your OMR sheet photo or scan.",
                },
                {
                  step: "2",
                  title: "AI Reads Bubbles",
                  desc: "Claude Vision API analyzes the image, identifies filled bubbles, and extracts every answer with confidence scores.",
                },
                {
                  step: "3",
                  title: "Get Results",
                  desc: "View all answers in a color-coded grid, copy to clipboard, or download as CSV.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl p-6 text-center"
                  style={{
                    backgroundColor: "#0F172B",
                    border: "1px solid rgba(245, 158, 11, 0.1)",
                  }}
                >
                  <div className="text-3xl text-amber-500 font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
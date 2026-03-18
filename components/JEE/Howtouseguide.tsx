// components/HowToUseGuide.tsx

interface HowToUseGuideProps {
  accentColor?: string;
}

export default function HowToUseGuide({
  accentColor = "#F59E0B",
}: HowToUseGuideProps) {
  const steps = [
    {
      title: "Step 1: Get Your Response Sheet",
      desc: "Visit the official NTA website and open your JEE Main response sheet.",
    },
    {
      title: "Step 2: Copy & Paste Content",
      desc: "Select all (Ctrl+A), copy the entire page (Ctrl+C), and paste it in the box above.",
    },
    {
      title: "Step 3: Enter Mobile Number",
      desc: "Click the button above to proceed. A popup will ask for your 10-digit mobile number.",
    },
    {
      title: "Step 4: Get Your Score",
      desc: "We'll parse your response sheet and calculate your exact JEE Main score instantly.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mt-6">
      <h4 className="text-white font-semibold text-lg mb-3">
        📋 How to Use
      </h4>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.title} className="bg-slate-950/50 p-4 rounded-lg">
            <p className="text-sm text-white font-semibold mb-1">
              {step.title}
            </p>
            <p className="text-xs text-slate-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
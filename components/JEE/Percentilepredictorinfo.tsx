// components/PercentilePredictorInfo.tsx

interface PercentilePredictorInfoProps {
  accentColor?: string;
  secondaryBg?: string;
  borderColor?: string;
}

export default function PercentilePredictorInfo({
  accentColor = "#F59E0B",
  secondaryBg = "#0F172B",
  borderColor = "rgba(245, 158, 11, 0.15)",
}: PercentilePredictorInfoProps) {
  const features = [
    "Estimate your JEE Main 2026 percentile with a score",
    "Find your rank in NTA JEE Main 2026",
    "Uses official NTA marking scheme for accurate calculation",
    "Get an idea of your probability of getting a seat in different colleges",
    "Plan your JoSAA counseling strategy smartly",
  ];

  return (
    <div
      className="rounded-2xl p-6 shadow-xl mt-8"
      style={{
        backgroundColor: secondaryBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">
          🎯 What Is JEE Main Percentile Predictor 2026?
        </h3>
        
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          The JEE Main Percentile Predictor 2026 is an online tool designed to
          help students forecast their likely percentile, rank, and potential
          college admission prior to the declaration of official results by NTA.
        </p>
        
        <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
          <p className="text-xs text-blue-400 mb-2">
            <strong>ℹ️ About Normalization:</strong>
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            NTA implements a normalization method to derive percentiles since
            JEE Main is held in several sessions. Normalization ensures equity
            across sessions of varying difficulty.
          </p>
        </div>
        
        <div className="space-y-2 text-xs text-slate-400 mt-4">
          {features.map((item) => (
            <p key={item} className="flex items-start gap-2">
              <span style={{ color: accentColor }}>✓</span>
              <span>{item}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
import DefaultLayout from "../defaultLayout"

// Same dashboard layout and background as the CAT predictors and XAT calculator, so the sidebar (Our Tools) shows here
export default function IimCutoffLayout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <div className="relative min-h-screen text-slate-300 mt-[72px] md:mt-0" style={{ backgroundColor: "#050818" }}>
        {/* Background decoration (same as CAT College Predictor) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative">{children}</div>
      </div>
    </DefaultLayout>
  )
}

import DefaultLayout from "../defaultLayout"

// Same dashboard layout as the CAT predictors, so the sidebar (Our Tools) shows on this page
export default function IimCutoffLayout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <div className="min-h-screen text-slate-300 mt-[72px] md:mt-0" style={{ backgroundColor: "#020205" }}>
        {children}
      </div>
    </DefaultLayout>
  )
}

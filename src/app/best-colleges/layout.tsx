import Navbar from "../../../components/Navbar"

const primaryBg = '#020205'

export default function BestCollegesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-300" style={{ backgroundColor: primaryBg }}>
      <Navbar />
      {/* Spacer to push content below the fixed navbar */}
      <div className="h-16 sm:h-[72px] lg:h-20" />
      {children}
    </div>
  )
}

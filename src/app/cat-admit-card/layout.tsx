import Navbar from "../../../components/Navbar"

export default function CatAdmitCardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-300" style={{ backgroundColor: "#020205" }}>
      <Navbar />
      <div className="h-16 sm:h-[72px] lg:h-20" />
      {children}
    </div>
  )
}

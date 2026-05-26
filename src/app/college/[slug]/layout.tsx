import CollegeLayoutClient from "./CollegeLayoutClient"

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return <CollegeLayoutClient>{children}</CollegeLayoutClient>
}
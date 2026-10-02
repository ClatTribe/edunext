import { redirect } from "next/navigation"

// The hub lives inside Forms & Deadlines so all form trackers share one section.
export default function MbaFormsIndex() {
  redirect("/forms-and-deadlines/mba")
}

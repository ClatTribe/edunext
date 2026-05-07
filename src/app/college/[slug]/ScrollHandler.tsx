"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollHandler({ slug }: { slug: string }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const urlParts = pathname.split('/')
    const section = urlParts[urlParts.length - 1]
    if (section && section !== slug) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [pathname, slug])

  return null
}

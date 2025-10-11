"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const MENU = [
  { label: "Upcoming Events", target: "upcoming-events" },
  { label: "Past Events", target: "past-events" },
  { label: "Contact Us", target: "contact-us" },
  { label: "Join With Us", target: "join-with-us" },
]

export function StickyHeader() {
  const [university, setUniversity] = useState<string>("Your University")
  const [canSeeAnalytics, setCanSeeAnalytics] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.university) setUniversity(parsed.university)
        const role = String(parsed?.role || "").toLowerCase()
        setIsAdmin(role === "admin")
        setIsOrganizer(role === "organizer")
      }
    } catch {}
  }, [])

  useEffect(() => {
    setCanSeeAnalytics(isAdmin || isOrganizer)
  }, [isAdmin, isOrganizer])

  function handleScrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 text-white backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 h-16">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src={"/placeholder.svg?height=32&width=32&query=university%20crest"}
            alt={`${university} logo`}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold text-lg">{university}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 md:gap-4">
          {MENU.map((item) => (
            <button
              key={item.target}
              onClick={() => handleScrollTo(item.target)}
              className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity hover:text-mint-400"
            >
              {item.label}
            </button>
          ))}
          <Link href="/organize">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {"Organize"}
            </Button>
          </Link>
          {canSeeAnalytics && (
            <Link href="/dashboard/analytics">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-95" variant="secondary">
                {"Analytics"}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

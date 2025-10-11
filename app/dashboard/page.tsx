"use client"

import { Suspense, useEffect, useState } from "react"
import { StickyHeader } from "@/components/sticky-header"
import { EventGrid } from "@/components/upcoming-events-section"
import { PastEventGrid } from "@/components/past-events-section"
import { ContactSection } from "@/components/contact-section"
import { JoinSection } from "@/components/join-section"
import { events as staticEvents, type EventItem } from "@/lib/events"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [allEvents, setAllEvents] = useState<EventItem[]>(staticEvents)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    // Load user-created events from localStorage
    try {
      const stored = localStorage.getItem("user_events")
      if (stored) {
        const userEvents = JSON.parse(stored) as EventItem[]
        setAllEvents([...staticEvents, ...userEvents])
      }
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    // Extract unique tags
    const tags = new Set<string>()
    allEvents.forEach((e) => e.tags?.forEach((t) => tags.add(t)))
    setAvailableTags(Array.from(tags).sort())
  }, [allEvents])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const filteredEvents =
    selectedTags.length === 0 ? allEvents : allEvents.filter((e) => e.tags?.some((t) => selectedTags.includes(t)))

  const upcoming = filteredEvents.filter((e) => e.kind === "upcoming")
  const past = filteredEvents.filter((e) => e.kind === "past")

  return (
    <main className="min-h-dvh">
      <StickyHeader />

      <section className="px-4 md:px-8 lg:px-12 py-6 bg-muted/30 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">{"Filter by tags:"}</span>
          {availableTags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              onClick={() => toggleTag(tag)}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
          {selectedTags.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setSelectedTags([])}>
              {"Clear"}
            </Button>
          )}
        </div>
      </section>

      <section id="upcoming-events" className="scroll-mt-20 px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-balance">{"Upcoming Events"}</h2>
          <p className="text-muted-foreground text-pretty mt-1">
            {"Don't miss out — discover what's happening on campus soon."}
          </p>
        </header>
        <Suspense fallback={<div className="text-muted-foreground">{"Loading events..."}</div>}>
          <EventGrid items={upcoming} />
        </Suspense>
      </section>

      <section id="past-events" className="scroll-mt-20 px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-balance">{"Past Events"}</h2>
          <p className="text-muted-foreground text-pretty mt-1">
            {"Highlights from recent events across the university."}
          </p>
        </header>
        <Suspense fallback={<div className="text-muted-foreground">{"Loading..."}</div>}>
          <PastEventGrid items={past} />
        </Suspense>
      </section>

      <section id="contact-us" className="scroll-mt-20 px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <ContactSection />
      </section>

      <section id="join-with-us" className="scroll-mt-20 px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <JoinSection />
      </section>
    </main>
  )
}

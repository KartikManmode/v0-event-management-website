"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type VolunteerEntry = {
  slug: string
  name: string
  email: string
  note?: string
  createdAt: string
}

export function EventActions({
  slug,
  title,
  className,
}: {
  slug: string
  title?: string
  className?: string
}) {
  const router = useRouter()
  const [openVolunteer, setOpenVolunteer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // volunteer form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")

  // Prefill name/email from session profile if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.name && !name) setName(p.name)
        if (p?.email && !email) setEmail(p.email)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleBack() {
    router.back()
  }

  function handlePropose() {
    // Navigate to organize page with context about which event initiated the proposal
    router.push(`/organize?propose=${encodeURIComponent(slug)}`)
  }

  async function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError("Please enter your name.")
      return
    }
    if (!email.trim() || !/.+@.+\..+/.test(email)) {
      setError("Please enter a valid email.")
      return
    }

    setSubmitting(true)
    try {
      const entry: VolunteerEntry = {
        slug,
        name: name.trim(),
        email: email.trim(),
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      }

      const key = "campus_volunteers"
      const raw = localStorage.getItem(key)
      const list: VolunteerEntry[] = raw ? JSON.parse(raw) : []
      list.push(entry)
      localStorage.setItem(key, JSON.stringify(list))
      setSuccess("Thanks! You’ve been added as a volunteer for this event.")
      setOpenVolunteer(false)
      setName(name.trim())
      setEmail(email.trim())
      setNote("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={handleBack} aria-label="Go back">
          Back
        </Button>
        <Button
          variant="default"
          onClick={handlePropose}
          aria-label="Propose an event"
          className="bg-primary text-primary-foreground hover:opacity-90"
        >
          Propose an Event
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpenVolunteer((v) => !v)}
          aria-expanded={openVolunteer}
          aria-controls="volunteer-form"
          className="border-accent text-accent hover:bg-accent/10"
        >
          Become Volunteer
        </Button>
      </div>

      {openVolunteer && (
        <Card id="volunteer-form" className="p-4 bg-background/70 backdrop-blur">
          <form onSubmit={handleVolunteerSubmit} className="space-y-4">
            <div>
              <Label htmlFor="v-name">Name</Label>
              <Input
                id="v-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="v-email">Email</Label>
              <Input
                id="v-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
              />
            </div>
            <div>
              <Label htmlFor="v-note">Note (optional)</Label>
              <Textarea
                id="v-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us how you’d like to help"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpenVolunteer(false)}>
                Cancel
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {success && <p className="text-sm text-foreground/80">{success}</p>}
          </form>
        </Card>
      )}
    </div>
  )
}

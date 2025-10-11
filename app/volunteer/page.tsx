"use client"

import type React from "react"
import { addVolunteer } from "@/lib/data"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function VolunteerPage() {
  const params = useSearchParams()
  const router = useRouter()
  const slug = params.get("slug") || ""
  const title = params.get("title") || "Event"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.name) setName(p.name)
        if (p?.email) setEmail(p.email)
      }
    } catch {}
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    ;(async () => {
      try {
        await addVolunteer(slug, {
          slug,
          eventTitle: title,
          name,
          email,
          message: message || "",
          ts: Date.now(),
        })
        alert("Thanks for volunteering! We'll be in touch.")
        router.push(slug ? `/events/${slug}` : "/dashboard")
      } catch {
        alert("Failed to submit volunteer request. Please try again.")
      } finally {
        setSubmitting(false)
      }
    })()
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-balance">Become a Volunteer</h1>
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card className="border-2 shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Volunteer for: {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                  placeholder="you@university.edu"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">How would you like to help? (optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  rows={4}
                  placeholder="Availability, skills, interests..."
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? "Submitting..." : "Submit Volunteer Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

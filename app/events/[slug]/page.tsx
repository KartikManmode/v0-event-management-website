"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"
import { events as staticEvents, type EventItem } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ExternalLink, CalendarDays, MapPin, Clock, Ticket } from "lucide-react"
import SuggestionsPanel from "@/components/suggestions-panel"
import AddOrganizer from "@/components/add-organizer"
import EventAnalytics from "@/components/event-analytics"
import { addRegistration, addVolunteer } from "@/lib/data"

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const [hydrated, setHydrated] = useState(false)
  const [event, setEvent] = useState<EventItem | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationName, setRegistrationName] = useState("")
  const [registrationEmail, setRegistrationEmail] = useState("")
  const [registrationMessage, setRegistrationMessage] = useState("")
  const [showVolunteer, setShowVolunteer] = useState(false)
  const [volunteerName, setVolunteerName] = useState("")
  const [volunteerEmail, setVolunteerEmail] = useState("")
  const [volunteerMessage, setVolunteerMessage] = useState("")
  const router = useRouter()
  const [regLoading, setRegLoading] = useState(false)
  const [volLoading, setVolLoading] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_events")
      const userEvents = stored ? (JSON.parse(stored) as EventItem[]) : []
      const merged = [...staticEvents, ...userEvents]
      const found = merged.find((e) => e.slug === params.slug) || null
      setEvent(found)
    } catch {
      setEvent(staticEvents.find((e) => e.slug === params.slug) || null)
    } finally {
      setHydrated(true)
    }
  }, [params.slug])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.name) {
          if (!registrationName) setRegistrationName(p.name)
          if (!volunteerName) setVolunteerName(p.name)
        }
        if (p?.email) {
          if (!registrationEmail) setRegistrationEmail(p.email)
          if (!volunteerEmail) setVolunteerEmail(p.email)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hydrated) {
    return (
      <main className="min-h-dvh grid place-items-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{"Loading event..."}</p>
        </div>
      </main>
    )
  }

  if (!event) return notFound()

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegLoading(true)
    ;(async () => {
      try {
        await addRegistration(event!.slug, {
          slug: event!.slug,
          eventTitle: event!.title,
          name: registrationName,
          email: registrationEmail,
          message: registrationMessage || "",
          ts: Date.now(),
        })
        alert(`Registration submitted for ${event!.title}!`)
      } catch {
        alert("Failed to submit registration. Please try again.")
      } finally {
        setRegLoading(false)
      }
      setShowRegistration(false)
      setRegistrationName("")
      setRegistrationEmail("")
      setRegistrationMessage("")
    })()
  }

  function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setVolLoading(true)
    ;(async () => {
      try {
        await addVolunteer(event!.slug, {
          slug: event!.slug,
          eventTitle: event!.title,
          name: volunteerName,
          email: volunteerEmail,
          message: volunteerMessage || "",
          ts: Date.now(),
        })
        alert(`Thanks for volunteering for ${event!.title}!`)
      } catch {
        alert("Failed to submit volunteer request. Please try again.")
      } finally {
        setVolLoading(false)
      }
      setShowVolunteer(false)
      setVolunteerName("")
      setVolunteerEmail("")
      setVolunteerMessage("")
    })()
  }

  function scrollToSuggestions() {
    const el = document.getElementById("suggestions-section")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Hero */}
      <section className="relative">
        <div className="h-64 md:h-96 w-full overflow-hidden relative">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            width={1600}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 md:px-6 pb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-balance">{event.title}</h1>
            <p className="text-white/80 mt-1 text-lg">{event.tagline}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {event.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-white/15 text-white border-white/20">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="secondary"
                className="bg-white/15 text-white hover:bg-white/25"
                onClick={() => router.back()}
              >
                {"Back"}
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={scrollToSuggestions}>
                {"Suggestions"}
              </Button>
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 bg-transparent"
                onClick={() =>
                  router.push(
                    `/volunteer?slug=${encodeURIComponent(event.slug)}&title=${encodeURIComponent(event.title)}`,
                  )
                }
              >
                {"Become Volunteer"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-6">
          <Card className="bg-card text-card-foreground border-2 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-3">{"Event Description"}</h2>
              <p className="text-foreground/90 leading-relaxed">{event.details.description}</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border-2 shadow-lg">
            <CardContent className="pt-6 grid gap-4">
              <h2 className="text-2xl font-bold">{"Details"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">{"Schedule"}</div>
                    <div className="mt-1">{event.details.schedule}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">{"Location"}</div>
                    <div className="mt-1">{event.details.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">{"Eligibility"}</div>
                    <div className="mt-1">{event.details.eligibility}</div>
                  </div>
                </div>
                {event.details.fee ? (
                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">{"Entry Fee"}</div>
                      <div className="mt-1">{event.details.fee}</div>
                    </div>
                  </div>
                ) : null}
              </div>

              {event.website && (
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {"Visit Official Website"}
                </a>
              )}

              {event.details.requiresRegistration && (
                <div className="pt-2">
                  <Button
                    onClick={() => setShowRegistration(!showRegistration)}
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                    size="lg"
                  >
                    {showRegistration ? "Hide Registration Form" : "Register Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {showRegistration && event.details.requiresRegistration && (
            <Card className="bg-accent/20 border-2 border-accent shadow-lg">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">{"Registration Form"}</h2>
                <form onSubmit={handleRegister} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reg-name">{"Full Name"}</Label>
                    <Input
                      id="reg-name"
                      value={registrationName}
                      onChange={(e) => setRegistrationName(e.currentTarget.value)}
                      placeholder={"Your name"}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-email">{"Email"}</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={registrationEmail}
                      onChange={(e) => setRegistrationEmail(e.currentTarget.value)}
                      placeholder={"you@university.edu"}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-message">{"Why are you interested? (optional)"}</Label>
                    <Textarea
                      id="reg-message"
                      value={registrationMessage}
                      onChange={(e) => setRegistrationMessage(e.currentTarget.value)}
                      placeholder={"Tell us more..."}
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    disabled={regLoading}
                  >
                    {regLoading ? "Submitting..." : "Submit Registration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Optional Gallery */}
        <aside className="grid gap-4 h-fit">
          {event.details.gallery?.map((src, i) => (
            <Image
              key={i}
              src={src || "/placeholder.svg"}
              alt={`"${event.title}" image ${i + 1}`}
              width={640}
              height={360}
              className="w-full h-48 object-cover rounded-lg border-2 shadow-md"
            />
          )) || (
            <Card className="bg-card text-card-foreground border-2">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">{"More images will appear here when available."}</p>
              </CardContent>
            </Card>
          )}
        </aside>
      </section>

      <section id="suggestions-section" className="mx-auto max-w-6xl px-4 md:px-6 pb-6">
        <SuggestionsPanel titleHint={event.title} />
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-6">
        <AddOrganizer />
      </section>

      {/* Volunteer Form */}
      {showVolunteer && (
        <section className="mx-auto max-w-6xl px-4 md:px-6 pb-10">
          <Card className="bg-card text-card-foreground border-2 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">{"Volunteer for this Event"}</h2>
              <form onSubmit={handleVolunteerSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vol-name">{"Full Name"}</Label>
                  <Input
                    id="vol-name"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.currentTarget.value)}
                    placeholder={"Your name"}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vol-email">{"Email"}</Label>
                  <Input
                    id="vol-email"
                    type="email"
                    value={volunteerEmail}
                    onChange={(e) => setVolunteerEmail(e.currentTarget.value)}
                    placeholder={"you@university.edu"}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vol-message">{"Tell us how you’d like to help (optional)"}</Label>
                  <Textarea
                    id="vol-message"
                    value={volunteerMessage}
                    onChange={(e) => setVolunteerMessage(e.currentTarget.value)}
                    placeholder={"Availability, skills, interests..."}
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  size="lg"
                  disabled={volLoading}
                >
                  {volLoading ? "Submitting..." : "Submit Volunteer Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-12">
        <EventAnalytics />
      </section>
    </main>
  )
}

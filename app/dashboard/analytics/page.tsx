"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { events as staticEvents } from "@/lib/events"

type Profile = { id?: string; name?: string; role?: "admin" | "organizer" | "volunteer" | "student" }
type UserEvent = { slug: string; name: string; createdAt?: string }
type Registration = { eventSlug: string; name: string; email: string; createdAt: string }

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const p = typeof window !== "undefined" ? sessionStorage.getItem("campus_profile") : null
      const parsed = p ? (JSON.parse(p) as Profile) : null
      setProfile(parsed)

      const ue = typeof window !== "undefined" ? localStorage.getItem("campus_events") : null
      setUserEvents(ue ? (JSON.parse(ue) as UserEvent[]) : [])

      const regs = typeof window !== "undefined" ? localStorage.getItem("campus_registrations") : null
      setRegistrations(regs ? (JSON.parse(regs) as Registration[]) : [])
    } catch (e) {
      // swallow parse errors gracefully
    } finally {
      setHydrated(true)
    }
  }, [])

  const canView = useMemo(() => {
    if (!profile) return false
    return profile.role === "admin" || profile.role === "organizer"
  }, [profile])

  const allEvents = useMemo(() => {
    // ensure unique by slug, prefer user event name if overlap
    const map = new Map<string, { slug: string; name: string }>()
    staticEvents.forEach((e: any) => map.set(e.slug, { slug: e.slug, name: e.name }))
    userEvents.forEach((e) => map.set(e.slug, { slug: e.slug, name: e.name }))
    return Array.from(map.values())
  }, [userEvents])

  const perEventData = useMemo(() => {
    const counts = registrations.reduce<Record<string, number>>((acc, r) => {
      acc[r.eventSlug] = (acc[r.eventSlug] || 0) + 1
      return acc
    }, {})
    return allEvents
      .map((e) => ({ name: e.name, slug: e.slug, registrations: counts[e.slug] || 0 }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 8)
  }, [registrations, allEvents])

  const perDayData = useMemo(() => {
    const dayCounts = registrations.reduce<Record<string, number>>((acc, r) => {
      const d = new Date(r.createdAt)
      const key = isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
      if (key) acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(dayCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(-14)
  }, [registrations])

  if (!hydrated) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-muted-foreground">Loading analytics…</p>
      </main>
    )
  }

  if (!canView) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Analytics are available only to Organizers and Admins.</p>
            <Link href="/dashboard" className="underline underline-offset-4">
              Go back to Explore
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const totalRegs = registrations.length
  const uniqueEventsWithRegs = new Set(registrations.map((r) => r.eventSlug)).size

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Explore Analytics</h1>
        <p className="text-muted-foreground">Overview of sign-ups across your campus events.</p>
      </header>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Registrations</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalRegs}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Events</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{uniqueEventsWithRegs}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Event</CardTitle>
          </CardHeader>
          <CardContent className="text-lg">
            {perEventData[0]?.name || <span className="text-muted-foreground">—</span>}
          </CardContent>
        </Card>
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Registrations by Event</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                registrations: { label: "Registrations", color: "hsl(var(--chart-1))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perEventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="registrations" fill="var(--color-registrations)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrations over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                count: { label: "Daily Sign-ups", color: "hsl(var(--chart-2))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Recent registrations */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent Registrations</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations
                .slice(-25)
                .reverse()
                .map((r, i) => {
                  const eventName = allEvents.find((e) => e.slug === r.eventSlug)?.name || r.eventSlug
                  const d = new Date(r.createdAt)
                  const formatted = isNaN(d.getTime()) ? "—" : d.toLocaleString()
                  return (
                    <TableRow key={`${r.eventSlug}-${i}`}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{eventName}</TableCell>
                      <TableCell>{formatted}</TableCell>
                    </TableRow>
                  )
                })}
              {registrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No registrations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </main>
  )
}

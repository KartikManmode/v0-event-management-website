"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { events, type EventItem } from "@/lib/events"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { listRegistrations } from "@/lib/data"

type RegStore = {
  [slug: string]: {
    eventTitle: string
    submissions: { slug: string; eventTitle: string; name: string; email: string; message?: string; ts: number }[]
  }
}

function useHybridRegistrations(slugs: string[], titles: Record<string, string>) {
  const [store, setStore] = useState<RegStore>({})
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const acc: RegStore = {}
      for (const slug of slugs) {
        const subs = await listRegistrations(slug)
        acc[slug] = { eventTitle: titles[slug] || slug, submissions: subs }
      }
      if (!cancelled) setStore(acc)
    })()
    return () => {
      cancelled = true
    }
  }, [slugs.join("|")])
  return store
}

export default function AnalyticsPage() {
  const [role, setRole] = useState<"admin" | "volunteer" | "guest">("guest")
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        const r = String(p?.role || "volunteer").toLowerCase()
        setRole(r === "admin" ? "admin" : "volunteer")
        setUserId(p?.id || p?.email || null)
      }
    } catch {}
  }, [])

  const userEvents: EventItem[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("user_events")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  const staticEvents = events

  const allowedEvents: EventItem[] = useMemo(() => {
    if (role === "admin") return [...userEvents, ...staticEvents]
    if (!userId) return []
    return (userEvents as any[]).filter((e) => e.creatorId === userId) as EventItem[]
  }, [role, userId, userEvents])

  const titlesMap = useMemo(() => Object.fromEntries(allowedEvents.map((e) => [e.slug, e.title])), [allowedEvents])
  const store = useHybridRegistrations(
    allowedEvents.map((e) => e.slug),
    titlesMap,
  )

  const [selected, setSelected] = useState<string>("")
  useEffect(() => {
    if (!selected && allowedEvents.length) setSelected(allowedEvents[0].slug)
  }, [allowedEvents, selected])

  const totalPerEvent = useMemo(
    () =>
      allowedEvents.map((e) => ({
        slug: e.slug,
        title: e.title,
        total: store[e.slug]?.submissions.length || 0,
      })),
    [store, allowedEvents],
  )

  const timeSeries = useMemo(() => {
    const subs = store[selected]?.submissions || []
    const byDay: Record<string, number> = {}
    subs.forEach((s) => {
      const d = new Date(s.ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      byDay[key] = (byDay[key] || 0) + 1
    })
    return Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, count]) => ({ day, count }))
  }, [store, selected])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 grid gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-semibold text-balance">
          {role === "admin" ? "Admin Analytics" : "Organizer Analytics"}
        </h1>
        <div className="flex items-center gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={allowedEvents.length ? "Select event" : "No accessible events"} />
            </SelectTrigger>
            <SelectContent>
              {allowedEvents.map((e) => (
                <SelectItem key={e.slug} value={e.slug}>
                  {e.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-secondary text-secondary-foreground" onClick={() => location.reload()}>
            {"Refresh"}
          </Button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{"Registrations per Event"}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalPerEvent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>{"Registrations Over Time"}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{"Latest Registrations"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {(store[selected]?.submissions || [])
                .slice()
                .reverse()
                .slice(0, 12)
                .map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 bg-card">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{r.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{new Date(r.ts).toLocaleString()}</Badge>
                    </div>
                  </div>
                ))}
              {(!store[selected]?.submissions || store[selected].submissions.length === 0) && (
                <p className="text-muted-foreground">{"No registrations yet for this event."}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

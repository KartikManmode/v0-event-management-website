"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listUserEvents, listSuggestions, listInboxMessages, type Suggestion, type InboxMessage } from "@/lib/data"

type SuggestionRow = Suggestion & { eventTitle: string }

export default function InboxPage() {
  const [role, setRole] = useState<"admin" | "organizer" | "guest">("guest")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([])
  const [messages, setMessages] = useState<InboxMessage[]>([])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        const r = String(p?.role || "guest").toLowerCase()
        setRole(r === "admin" ? "admin" : r === "organizer" ? "organizer" : "guest")
        setUserId(p?.id || p?.email || null)
      }
    } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      const myEvents = await listUserEvents(userId)
      const titleBySlug = Object.fromEntries(myEvents.map((e) => [e.slug, e.title]))

      const sugAcc: SuggestionRow[] = []
      for (const ev of myEvents) {
        const sug = await listSuggestions(ev.slug)
        sugAcc.push(...sug.map((s) => ({ ...s, eventTitle: titleBySlug[ev.slug] || ev.slug })))
      }

      const msgs = await listInboxMessages()

      if (!cancelled) {
        setSuggestions(sugAcc.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)))
        setMessages(msgs)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  if (!userId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Sign in to view your inbox.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 grid gap-8">
      <header>
        <h1 className="text-3xl font-semibold text-balance">Organizer Inbox</h1>
        <p className="text-muted-foreground">Review suggestions for your events and general contact messages.</p>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Loading inbox…</p>
      ) : (
        <>
          <section className="grid gap-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Event Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {suggestions.length === 0 && <p className="text-muted-foreground">No suggestions yet.</p>}
                {suggestions.map((s) => (
                  <div key={s.id} className="rounded-lg border px-3 py-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {s.authorName || s.authorEmail || "Anonymous"} • {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <Badge variant="secondary">{s.eventTitle}</Badge>
                    </div>
                    <div className="mt-1">{s.message}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>General Messages</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
                {messages.map((m) => (
                  <div key={m.id} className="rounded-lg border px-3 py-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{m.email}</div>
                    <div className="mt-1">{m.message}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </main>
  )
}

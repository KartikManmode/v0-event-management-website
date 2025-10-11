"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addSuggestion, listOrganizers, listSuggestions } from "@/lib/data"

type Suggestion = {
  id: string
  slug: string
  message: string
  authorEmail?: string
  authorName?: string
  createdAt: string
}

function getProfile() {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(sessionStorage.getItem("campus_profile") || "null")
  } catch {
    return null
  }
}

function isOrganizerOrAdmin(slug: string, profile: any): boolean {
  if (!profile) return false
  if (String(profile.role || "").toLowerCase() === "admin") return true
  return false // organizers checked asynchronously below
}

export default function SuggestionsPanel({
  titleHint,
}: {
  titleHint?: string
}) {
  const params = useParams()
  const slug = (params?.slug as string) || ""
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [profile, setProfile] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setProfile(getProfile())
  }, [])

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const list = await listSuggestions(slug)
      setSuggestions(list)
      const p = getProfile()
      if (p) {
        const orgs = await listOrganizers(slug)
        if (orgs.includes(p.email)) {
          setIsOrganizer(true)
        }
        if (String(p.role || "").toLowerCase() === "admin") {
          setIsOrganizer(true)
        }
      }
    })()
  }, [slug])

  const canSeeList = useMemo(() => !!isOrganizer, [isOrganizer])

  async function onSubmit() {
    if (!message.trim()) return
    setSubmitting(true)
    const entry = {
      id: crypto.randomUUID(),
      slug,
      message: message.trim(),
      authorEmail: profile?.email,
      authorName: profile?.name,
      createdAt: new Date().toISOString(),
    }
    const next = [entry as any, ...suggestions]
    setSuggestions(next)
    try {
      await addSuggestion(slug, entry as any)
      setMessage("")
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border border-white/10 bg-background/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground text-balance">
          Suggestions for the event {titleHint ? `– ${titleHint}` : ""}
        </CardTitle>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="suggestions-panel"
        >
          {open ? "Close" : "Write a suggestion"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent id="suggestions-panel" className="grid gap-3">
          <Textarea
            placeholder="Share your idea or feedback for this event..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-28"
            aria-label="Suggestion message"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-accent text-accent-foreground" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit suggestion"}
            </Button>
          </div>
        </CardContent>
      )}

      {canSeeList && suggestions.length > 0 && (
        <CardContent className="border-t border-white/10 mt-2 pt-4">
          <div className="text-sm text-muted-foreground mb-2">Visible to organizers and admins</div>
          <ul className="grid gap-3">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-md border border-white/10 p-3 bg-background/50">
                <div className="text-sm text-muted-foreground">
                  {s.authorName || s.authorEmail || "Anonymous"} • {new Date(s.createdAt).toLocaleString()}
                </div>
                <div className="text-foreground">{s.message}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function getProfile() {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(sessionStorage.getItem("campus_profile") || "null")
  } catch {
    return null
  }
}

function getOrganizers(slug: string): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(`event_organizers_${slug}`) || "[]")
  } catch {
    return []
  }
}

function setOrganizers(slug: string, list: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(`event_organizers_${slug}`, JSON.stringify(list))
}

export default function AddOrganizer() {
  const params = useParams()
  const slug = (params?.slug as string) || ""
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [orgs, setOrgs] = useState<string[]>([])

  useEffect(() => setProfile(getProfile()), [])
  useEffect(() => {
    if (!slug) return
    setOrgs(getOrganizers(slug))
  }, [slug])

  const canManage = useMemo(() => {
    if (!profile) return false
    if (profile.role === "admin") return true
    return orgs.includes(profile?.email)
  }, [profile, orgs])

  function addOrganizer() {
    const v = email.trim().toLowerCase()
    if (!v || !v.includes("@")) return
    if (orgs.includes(v)) return
    const next = [...orgs, v]
    setOrganizers(slug, next)
    setOrgs(next)
    setEmail("")
  }

  if (!canManage) return null

  return (
    <Card className="border border-white/10 bg-background/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Add organizers</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="organizer@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Organizer email"
          />
          <Button className="bg-primary text-primary-foreground" onClick={addOrganizer}>
            Add
          </Button>
        </div>
        {orgs.length > 0 && <div className="text-sm text-muted-foreground">Current organizers: {orgs.join(", ")}</div>}
      </CardContent>
    </Card>
  )
}

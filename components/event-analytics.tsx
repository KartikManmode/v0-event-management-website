"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Registration = {
  id: string
  slug: string
  name?: string
  email?: string
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

function getOrganizers(slug: string): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(`event_organizers_${slug}`) || "[]")
  } catch {
    return []
  }
}

export default function EventAnalytics() {
  const params = useParams()
  const slug = (params?.slug as string) || ""
  const [profile, setProfile] = useState<any>(null)
  const [organizers, setOrganizers] = useState<string[]>([])
  const [rows, setRows] = useState<Registration[]>([])

  useEffect(() => {
    setProfile(getProfile())
  }, [])
  useEffect(() => {
    if (!slug) return
    setOrganizers(getOrganizers(slug))
  }, [slug])

  useEffect(() => {
    if (typeof window === "undefined" || !slug) return
    const flatArr = (() => {
      try {
        return JSON.parse(localStorage.getItem("campus_registrations") || "[]")
      } catch {
        return []
      }
    })() as any[]

    const legacyParsed = (() => {
      try {
        return JSON.parse(localStorage.getItem("registrations") || "null")
      } catch {
        return null
      }
    })()

    const legacySubmissions: any[] = Array.isArray(legacyParsed)
      ? legacyParsed
      : legacyParsed && typeof legacyParsed === "object"
        ? Object.values(legacyParsed).flatMap((v: any) => (v?.submissions as any[]) || [])
        : []

    const merged = [...flatArr, ...legacySubmissions]
      .filter((r: any) => r?.slug === slug)
      .map((r: any) => ({
        id: r.id || `${r.slug}-${r.email || ""}-${r.ts || Date.now()}`,
        slug: r.slug,
        name: r.name,
        email: r.email,
        createdAt: r.createdAt || new Date(typeof r.ts === "number" ? r.ts : Date.now()).toISOString(),
      }))

    setRows(merged)
  }, [slug])

  const canSee = useMemo(() => {
    if (!profile) return false
    if (profile.role === "admin") return true
    return organizers.includes(profile?.email)
  }, [profile, organizers])

  if (!canSee) return null

  const total = rows.length
  const last5 = rows.slice(-5).reverse()

  return (
    <section className="mt-8 grid gap-4">
      <Card className="border border-white/10 bg-background/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Event analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-md border border-white/10 p-3">
              <div className="text-sm text-muted-foreground">Total registrations</div>
              <div className="text-2xl font-semibold">{total}</div>
            </div>
            <div className="rounded-md border border-white/10 p-3">
              <div className="text-sm text-muted-foreground">Unique emails</div>
              <div className="text-2xl font-semibold">{new Set(rows.map((r) => r.email || "")).size}</div>
            </div>
            <div className="rounded-md border border-white/10 p-3">
              <div className="text-sm text-muted-foreground">Today</div>
              <div className="text-2xl font-semibold">
                {rows.filter((r) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
            </div>
            <div className="rounded-md border border-white/10 p-3">
              <div className="text-sm text-muted-foreground">Organizers</div>
              <div className="text-2xl font-semibold">{organizers.length}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Recent registrations</div>
            <div className="rounded-md border border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/60">
                  <tr className="text-left">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {last5.map((r) => (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="px-3 py-2">{r.name || "-"}</td>
                      <td className="px-3 py-2">{r.email || "-"}</td>
                      <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {last5.length === 0 && (
                    <tr>
                      <td className="px-3 py-2" colSpan={3}>
                        No registrations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

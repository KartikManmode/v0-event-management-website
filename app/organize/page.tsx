"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { saveEvent } from "@/lib/data"

const PRESET_TAGS = [
  "Technology",
  "Workshop",
  "Competition",
  "Arts",
  "Entertainment",
  "Community",
  "Social",
  "Music",
  "Academic",
  "Sports",
  "Cultural",
  "Startup",
]

export default function OrganizePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string | null>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [myRegistrations, setMyRegistrations] = useState<any[]>([])
  const [stats, setStats] = useState<{ totalEvents: number; totalRegs: number; upcoming: number }>({
    totalEvents: 0,
    totalRegs: 0,
    upcoming: 0,
  })
  const [chartData, setChartData] = useState<Array<{ name: string; regs: number }>>([])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        setCreatorId(p?.id || p?.email || null)
        setCreatorName(p?.name || p?.email || "Volunteer")
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem("user_events") || "[]")
      const storedRegs = JSON.parse(localStorage.getItem("campus_registrations") || "[]")
      const mine = creatorId ? storedEvents.filter((e: any) => e.creatorId === creatorId) : []
      const regsMine = creatorId ? storedRegs.filter((r: any) => mine.some((e: any) => e.slug === r.slug)) : []
      setMyEvents(mine)
      setMyRegistrations(regsMine)

      const now = new Date()
      const upcomingCount = mine.filter((e: any) => {
        const d = new Date(e.date)
        return d >= now
      }).length

      setStats({
        totalEvents: mine.length,
        totalRegs: regsMine.length,
        upcoming: upcomingCount,
      })

      const byEvent: Record<string, number> = {}
      regsMine.forEach((r: any) => {
        byEvent[r.slug] = (byEvent[r.slug] || 0) + 1
      })
      setChartData(
        mine.map((e: any) => ({
          name: e.title?.slice(0, 14) || e.slug,
          regs: byEvent[e.slug] || 0,
        })),
      )
    } catch {}
  }, [creatorId])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const newEvent = {
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      title: name,
      date,
      tagline: description.substring(0, 60),
      image: logoPreview || "/community-event.png",
      kind: "upcoming" as const,
      tags: selectedTags,
      website: website || undefined,
      creatorId: creatorId || "anonymous",
      creatorName: creatorName || "Volunteer",
      details: {
        description,
        eligibility: "Open to all",
        schedule: date,
        location,
        fee: "Free",
        requiresRegistration: true,
      },
    }
    ;(async () => {
      try {
        await saveEvent(newEvent as any)
        alert("Event created successfully!")
        router.push("/dashboard")
      } catch (err) {
        alert("Failed to create event. Please try again.")
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-primary/[0.05] via-secondary/[0.06] to-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {"Organize an Event"}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {"Share your event with the campus community and get participants excited!"}
          </p>
        </div>

        <Card className="bg-card text-card-foreground shadow-xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl">{"Event Details"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">{"Event Name"}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder={"Tech Talk 2025"}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">{"Location"}</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                  placeholder={"Main Auditorium, Building C"}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">{"Date & Time"}</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.currentTarget.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">{"Description"}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  placeholder={"Tell us what makes your event special..."}
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">{"Official Website (optional)"}</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.currentTarget.value)}
                  placeholder={"https://event.example.com"}
                />
              </div>

              <div className="grid gap-2">
                <Label>{"Tags"}</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" type="button">
                        {"Select Tags"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>{"Choose all that apply"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {PRESET_TAGS.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        >
                          {tag}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logo">{"Event Logo/Image"}</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
                {logoPreview && (
                  <div className="mt-2">
                    <Image
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      width={200}
                      height={200}
                      className="rounded-lg border-2 object-cover"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent to-secondary text-accent-foreground hover:opacity-90 transition-opacity"
                size="lg"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </Button>
            </CardContent>
          </form>
        </Card>

        <section className="mt-12 space-y-6">
          <h2 className="text-3xl font-semibold text-balance">{"Organizer Analysis"}</h2>

          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{"Total Events"}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats.totalEvents}</CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{"Total Registrations"}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats.totalRegs}</CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{"Upcoming Events"}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats.upcoming}</CardContent>
            </Card>
          </div>

          {/* Bar chart: registrations per event */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{"Registrations per Event"}</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ChartContainer
                config={{
                  regs: { label: "Registrations", color: "hsl(var(--chart-1))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="regs" fill="var(--color-regs)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent registrations table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{"Recent Registrations"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{"Event"}</TableHead>
                      <TableHead>{"Name"}</TableHead>
                      <TableHead>{"Email"}</TableHead>
                      <TableHead>{"Registered At"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRegistrations
                      .slice(-10)
                      .reverse()
                      .map((r: any, idx: number) => {
                        const ev = myEvents.find((e) => e.slug === r.slug)
                        return (
                          <TableRow key={`${r.email}-${idx}`}>
                            <TableCell>{ev?.title || r.slug}</TableCell>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.email}</TableCell>
                            <TableCell>
                              {new Date((r as any).ts || (r as any).createdAt || Date.now()).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    {myRegistrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">
                          {"No registrations yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

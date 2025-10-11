"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function ProposeEventPage() {
  const params = useSearchParams()
  const router = useRouter()
  const preSlug = params.get("slug") || ""
  const preTitle = params.get("title") || ""
  const [title, setTitle] = useState(preTitle)
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [website, setWebsite] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [proposerId, setProposerId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      if (raw) {
        const p = JSON.parse(raw)
        setProposerId(p?.id || p?.email || "anonymous")
      }
    } catch {}
  }, [])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const computedSlug = useMemo(() => {
    if (preSlug) return preSlug
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }, [title, preSlug])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const key = "proposed_events"
      const raw = localStorage.getItem(key)
      const list: any[] = raw ? JSON.parse(raw) : []
      list.push({
        slug: computedSlug,
        title,
        location,
        date,
        website: website || undefined,
        description,
        tags: selectedTags,
        image: logoPreview || "/placeholder-logo.png",
        proposerId,
        ts: Date.now(),
      })
      localStorage.setItem(key, JSON.stringify(list))
      alert("Your proposal has been submitted! The organizers will review it.")
      router.push("/dashboard")
    } catch {
      alert("Failed to submit proposal. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-balance">Propose an Event</h1>
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card className="border-2 shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Event Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.currentTarget.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Official Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.currentTarget.value)}
                  placeholder="https://event.example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  required
                  rows={5}
                  placeholder="Tell us what the event is about..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" type="button">
                        Select Tags
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Choose all that apply</DropdownMenuLabel>
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
                <Label htmlFor="logo">Logo/Image</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
                {logoPreview && (
                  <Image
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    width={200}
                    height={200}
                    className="rounded-lg border-2 object-cover mt-2"
                  />
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

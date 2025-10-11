"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function OnboardingForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [university, setUniversity] = useState("")
  const [email, setEmail] = useState("")
  const [course, setCourse] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (typeof window !== "undefined") {
        const profile = { name, university, email, course }
        sessionStorage.setItem("campus_profile", JSON.stringify(profile))
      }
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card text-card-foreground shadow-md border">
      <CardHeader>
        <CardTitle className="text-center">{"Enter Portal"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{"Name"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder={"Alex Johnson"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="university">{"University"}</Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.currentTarget.value)}
              placeholder={"Riverdale University"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{"University Email"}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder={"alex@university.edu"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course">{"Course"}</Label>
            <Input
              id="course"
              value={course}
              onChange={(e) => setCourse(e.currentTarget.value)}
              placeholder={"Computer Science"}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full text-primary-foreground"
            style={{
              backgroundImage: "linear-gradient(90deg, var(--color-primary), var(--color-chart-2))",
            }}
            aria-label="Enter Portal"
            disabled={loading}
          >
            {loading ? "Entering..." : "Enter Portal"}
          </Button>
          <p className="text-xs text-center opacity-80">{"Welcome to your university’s event portal"}</p>
        </CardFooter>
      </form>
    </Card>
  )
}

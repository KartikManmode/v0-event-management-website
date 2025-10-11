"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { addInboxMessage } from "@/lib/data"

export function ContactSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{"Contact Us"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="opacity-80">
            {
              "Have questions about events, sponsorships, or organizing your own? Send us a message and our campus events team will reach out."
            }
          </p>
          <ul className="text-sm opacity-80 list-disc pl-5">
            <li>{"Email: events@university.edu"}</li>
            <li>{"Office: Student Center, Room 210"}</li>
            <li>{"Hours: Mon–Fri, 9am–5pm"}</li>
          </ul>
        </div>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim() || !email.trim() || !message.trim()) return
            setSubmitting(true)
            try {
              await addInboxMessage({
                id: crypto.randomUUID(),
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                createdAt: new Date().toISOString(),
              })
              setName("")
              setEmail("")
              setMessage("")
              alert("Thanks! Your message has been sent.")
            } catch {
              alert("Failed to send message. Please try again.")
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="contact-name">{"Name"}</Label>
            <Input
              id="contact-name"
              placeholder={"Your name"}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-email">{"Email"}</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder={"you@university.edu"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-message">{"Message"}</Label>
            <Textarea
              id="contact-message"
              placeholder={"How can we help?"}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button type="submit" className="justify-self-start" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

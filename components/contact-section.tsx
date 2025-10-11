"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactSection() {
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
          onSubmit={(e) => {
            e.preventDefault()
            alert("Thanks! We'll be in touch.")
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="contact-name">{"Name"}</Label>
            <Input id="contact-name" placeholder={"Your name"} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-email">{"Email"}</Label>
            <Input id="contact-email" type="email" placeholder={"you@university.edu"} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-message">{"Message"}</Label>
            <Textarea id="contact-message" placeholder={"How can we help?"} required />
          </div>
          <Button type="submit" className="justify-self-start">
            {"Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

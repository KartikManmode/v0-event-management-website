"use client"

import { getDb } from "./firebase"
import { collection, doc, getDoc, getDocs, query, setDoc, addDoc, where, orderBy } from "firebase/firestore"
import { events as staticEvents, type EventItem } from "@/lib/events"

type Registration = {
  slug: string
  eventTitle: string
  name: string
  email: string
  message?: string
  ts: number
}

type Volunteer = Registration
type Suggestion = {
  id: string
  slug: string
  message: string
  authorEmail?: string
  authorName?: string
  createdAt: string
}

type InboxMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export async function saveEvent(e: EventItem & { creatorId?: string; creatorName?: string }) {
  const db = getDb()
  if (db) {
    await setDoc(doc(db, "events", e.slug), e, { merge: true })
    if (e.creatorId) {
      // seed organizers with creator
      await setDoc(doc(db, "events", e.slug, "organizers", String(e.creatorId)), {
        email: e.creatorId,
        name: e.creatorName || null,
        addedAt: Date.now(),
      })
    }
    return
  }
  // fallback
  const arr = getLocal<EventItem[]>("user_events", [])
  arr.push(e)
  setLocal("user_events", arr)
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const db = getDb()
  if (db) {
    const snap = await getDoc(doc(db, "events", slug))
    if (snap.exists()) return snap.data() as EventItem
  }
  const userEvents = getLocal<EventItem[]>("user_events", [])
  return [...staticEvents, ...userEvents].find((e) => e.slug === slug) || null
}

export async function addRegistration(slug: string, reg: Registration) {
  const db = getDb()
  if (db) {
    try {
      await addDoc(collection(db, "events", slug, "registrations"), reg)
      return
    } catch (err) {
      console.log("[v0] Firestore addRegistration failed; using local fallback:", (err as Error)?.message)
    }
  }
  const legacy = getLocal<Record<string, { eventTitle: string; submissions: Registration[] }>>("registrations", {})
  if (!legacy[slug]) legacy[slug] = { eventTitle: reg.eventTitle, submissions: [] }
  legacy[slug].submissions.push(reg)
  setLocal("registrations", legacy)

  const id =
    typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : String(reg.ts || Date.now())
  const createdAt = new Date(reg.ts || Date.now()).toISOString()

  const flat = getLocal<any[]>("campus_registrations", [])
  flat.push({ ...reg, id, createdAt }) // keep extra fields for analytics component
  setLocal("campus_registrations", flat)
}

export async function listRegistrations(slug: string): Promise<Registration[]> {
  const db = getDb()
  if (db) {
    try {
      const qs = await getDocs(query(collection(db, "events", slug, "registrations"), orderBy("ts", "asc")))
      return qs.docs.map((d) => d.data() as Registration)
    } catch (err) {
      console.log("[v0] Firestore listRegistrations failed; using local fallback:", (err as Error)?.message)
    }
  }
  const legacy = getLocal<Record<string, { submissions: Registration[] }>>("registrations", {})
  const flat = getLocal<any[]>("campus_registrations", [])
  const flatForSlug: Registration[] = flat
    .filter((r) => r?.slug === slug)
    .map((r) => ({
      slug: r.slug,
      eventTitle: r.eventTitle,
      name: r.name,
      email: r.email,
      message: r.message,
      ts: typeof r.ts === "number" ? r.ts : Date.parse(r.createdAt || "") || Date.now(),
    }))
  return [...(legacy[slug]?.submissions || []), ...flatForSlug].sort((a, b) => a.ts - b.ts)
}

export async function addVolunteer(slug: string, vol: Volunteer) {
  const db = getDb()
  if (db) {
    try {
      await addDoc(collection(db, "events", slug, "volunteers"), vol)
      return
    } catch (err) {
      console.log("[v0] Firestore addVolunteer failed; using local fallback:", (err as Error)?.message)
    }
  }
  const legacy = getLocal<Record<string, { eventTitle: string; submissions: Volunteer[] }>>("volunteers", {})
  if (!legacy[slug]) legacy[slug] = { eventTitle: vol.eventTitle, submissions: [] }
  legacy[slug].submissions.push(vol)
  setLocal("volunteers", legacy)
  const flat = getLocal<Volunteer[]>("campus_volunteers", [])
  flat.push(vol)
  setLocal("campus_volunteers", flat)
}

export async function addSuggestion(slug: string, s: Suggestion) {
  const db = getDb()
  const withId: Suggestion = {
    id:
      s.id ||
      (typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now())),
    slug,
    message: s.message,
    authorEmail: s.authorEmail,
    authorName: s.authorName,
    createdAt: s.createdAt || new Date().toISOString(),
  }
  if (db) {
    try {
      await addDoc(collection(db, "events", slug, "suggestions"), withId)
      return
    } catch (err) {
      console.log("[v0] Firestore addSuggestion failed; using local fallback:", (err as Error)?.message)
    }
  }
  const key = `campus_suggestions_${slug}`
  const arr = getLocal<Suggestion[]>(key, [])
  arr.unshift(withId)
  setLocal(key, arr)
}

export async function listSuggestions(slug: string): Promise<Suggestion[]> {
  const db = getDb()
  if (db) {
    try {
      const qs = await getDocs(query(collection(db, "events", slug, "suggestions"), orderBy("createdAt", "desc")))
      return qs.docs.map((d) => d.data() as Suggestion)
    } catch (err) {
      console.log("[v0] Firestore listSuggestions failed; using local fallback:", (err as Error)?.message)
    }
  }
  return getLocal<Suggestion[]>(`campus_suggestions_${slug}`, [])
}

export async function addOrganizer(slug: string, email: string, name?: string) {
  const db = getDb()
  if (db) {
    try {
      await setDoc(doc(db, "events", slug, "organizers", email), {
        email,
        name: name || null,
        addedAt: Date.now(),
      })
      return
    } catch (err) {
      console.log("[v0] Firestore addOrganizer failed; using local fallback:", (err as Error)?.message)
    }
  }
  const key = `event_organizers_${slug}`
  const arr = new Set(getLocal<string[]>(key, []))
  arr.add(email)
  setLocal(key, Array.from(arr))
}

export async function listOrganizers(slug: string): Promise<string[]> {
  const db = getDb()
  if (db) {
    try {
      const qs = await getDocs(collection(db, "events", slug, "organizers"))
      return qs.docs.map((d) => (d.data() as any).email as string)
    } catch (err) {
      console.log("[v0] Firestore listOrganizers failed; using local fallback:", (err as Error)?.message)
    }
  }
  return getLocal<string[]>(`event_organizers_${slug}`, [])
}

export async function listUserEvents(creatorId: string): Promise<EventItem[]> {
  const db = getDb()
  if (db) {
    try {
      const qs = await getDocs(query(collection(db, "events"), where("creatorId", "==", creatorId)))
      return qs.docs.map((d) => d.data() as EventItem)
    } catch (err) {
      console.log("[v0] Firestore listUserEvents failed; using local fallback:", (err as Error)?.message)
    }
  }
  const userEvents = getLocal<EventItem[]>("user_events", [])
  return userEvents.filter((e: any) => e.creatorId === creatorId)
}

export async function addInboxMessage(m: InboxMessage) {
  const db = getDb()
  if (db) {
    try {
      await addDoc(collection(db, "messages"), m)
      return
    } catch (err) {
      console.log("[v0] Firestore addInboxMessage failed; using local fallback:", (err as Error)?.message)
    }
  }
  const key = "campus_messages"
  const arr = getLocal<InboxMessage[]>(key, [])
  arr.unshift(m)
  setLocal(key, arr)
}

export async function listInboxMessages(): Promise<InboxMessage[]> {
  const db = getDb()
  if (db) {
    try {
      const qs = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc")))
      return qs.docs.map((d) => d.data() as InboxMessage)
    } catch (err) {
      console.log("[v0] Firestore listInboxMessages failed; using local fallback:", (err as Error)?.message)
    }
  }
  return getLocal<InboxMessage[]>("campus_messages", [])
}

export type { Registration, Volunteer, Suggestion, InboxMessage }

export function usingFirestore(): boolean {
  try {
    return !!getDb()
  } catch {
    return false
  }
}

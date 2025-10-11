"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getDb, getAuthClient, isFirebaseReady, signOutClient } from "@/lib/firebase"

type Role = "student" | "organiser" | "admin"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<null | { uid: string; email: string | null }>(null)
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    // Firebase path
    if (isFirebaseReady()) {
      const auth = getAuthClient()
      const unsub = onAuthStateChanged(auth!, async (fbUser) => {
        if (!fbUser) {
          setUser(null)
          setRole(null)
          setLoading(false)
          return
        }
        setUser({ uid: fbUser.uid, email: fbUser.email })
        // fetch or create user doc
        const db = getDb()
        if (db) {
          const ref = doc(db, "users", fbUser.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data() as { role?: Role }
            setRole((data.role as Role) || "student")
          } else {
            await setDoc(ref, {
              email: fbUser.email,
              role: "student",
              createdAt: serverTimestamp(),
            })
            setRole("student")
          }
        } else {
          setRole("student")
        }
        setLoading(false)
      })
      return () => unsub()
    }

    // Fallback path (no Firebase configured)
    try {
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem("campus_profile")
        if (raw) {
          const p = JSON.parse(raw) as { email?: string; role?: Role }
          setUser({ uid: "local-dev", email: p.email || null })
          setRole((p.role as Role) || "student")
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    user,
    role,
    signOut: signOutClient,
  }
}

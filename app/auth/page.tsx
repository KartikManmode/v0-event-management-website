"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { getAuthClient, getDb, isFirebaseReady } from "@/lib/firebase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Role = "student" | "organiser" | "admin"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [university, setUniversity] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isFirebaseReady()) {
        const auth = getAuthClient()!
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // Fallback for local/dev usage
        if (typeof window !== "undefined") {
          const profile = { email, name: name || email.split("@")[0], university, role }
          sessionStorage.setItem("campus_profile", JSON.stringify(profile))
        }
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isFirebaseReady()) {
        const auth = getAuthClient()!
        const db = getDb()
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (auth.currentUser && name) {
          await updateProfile(auth.currentUser, { displayName: name })
        }
        if (db) {
          await setDoc(doc(db, "users", cred.user.uid), {
            name,
            university,
            email,
            role, // "student" | "organiser" | "admin"
            createdAt: serverTimestamp(),
          })
        }
      } else {
        // Fallback for local/dev usage
        if (typeof window !== "undefined") {
          const profile = { name, university, email, role }
          sessionStorage.setItem("campus_profile", JSON.stringify(profile))
        }
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unable to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-md py-10">
      <Card className="bg-card text-card-foreground">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">{mode === "signin" ? "Sign In" : "Create Account"}</CardTitle>
          <Button
            variant="ghost"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            aria-label={mode === "signin" ? "Switch to Sign Up" : "Switch to Sign In"}
          >
            {mode === "signin" ? "Need an account?" : "Have an account?"}
          </Button>
        </CardHeader>

        {mode === "signin" ? (
          <form onSubmit={handleSignIn}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  minLength={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.currentTarget.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger aria-label="Select role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="organiser">Organiser</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs opacity-70">
                  Choosing "admin" should be restricted in production. Use it only for development/testing.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  )
}

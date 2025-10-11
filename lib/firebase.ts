"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth, signOut as fbSignOut } from "firebase/auth"

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseEnabled = !!config.apiKey && !!config.projectId && !!config.authDomain && !!config.appId

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

export function getDb(): Firestore | null {
  if (!isFirebaseEnabled) return null
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config)
  }
  if (!db) {
    db = getFirestore(app)
  }
  return db
}

export function getAuthClient(): Auth | null {
  if (!isFirebaseEnabled) return null
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config)
  }
  if (!auth) {
    auth = getAuth(app)
  }
  return auth
}

export async function signOutClient(): Promise<void> {
  try {
    const a = getAuthClient()
    if (a) {
      await fbSignOut(a)
    } else if (typeof window !== "undefined") {
      // fallback clear local session
      sessionStorage.removeItem("campus_profile")
    }
  } catch {
    // ignore
  }
}

export function isFirebaseReady(): boolean {
  try {
    return isFirebaseEnabled && !!getDb() && !!getAuthClient()
  } catch {
    return false
  }
}

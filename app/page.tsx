"use client"
import Link from "next/link"
import { Suspense } from "react"
import { OnboardingForm } from "@/components/login-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("campus_profile")
      const prof = raw ? JSON.parse(raw) : null
      const role = prof?.role?.toLowerCase?.()
      // organizers and admins land on Organize directly
      if (role === "organizer" || role === "admin") {
        router.replace("/organize")
      }
    } catch {}
  }, [router])

  return (
    <main className="min-h-dvh relative overflow-hidden">
      {/* Background layer */}
      {/* previously: absolute radial gradient background layer */}
      {/* now handled globally in layout via .app-bg */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <section className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-balance text-black">
                {"Plan. Participate. Celebrate — Your Campus Events, Simplified."}
              </h1>
              <p className="text-sm text-white/80 mt-1">{""}</p>
            </div>
            <Suspense fallback={<div className="text-sm text-white/80">{"Loading..."}</div>}>
              <OnboardingForm />
            </Suspense>
            
          </div>
        </section>
      </div>
    </main>
  )
}

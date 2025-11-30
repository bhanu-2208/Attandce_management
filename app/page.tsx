"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "manager") {
        router.push("/manager/dashboard")
      } else {
        router.push("/employee/dashboard")
      }
    } else {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">Attendance System</h1>
        <p className="text-slate-400">Redirecting...</p>
      </div>
    </div>
  )
}

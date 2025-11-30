"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import Link from "next/link"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    setMounted(true)
    if (mounted && !isAuthenticated) {
      router.push("/login")
    }
    if (mounted && isAuthenticated && user?.role !== "employee") {
      router.push(`/${user?.role}/dashboard`)
    }
  }, [mounted, isAuthenticated, user, router])

  if (!mounted || !isAuthenticated || user?.role !== "employee") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-blue-400">Attendance System</h1>
            <div className="flex gap-6">
              <Link href="/employee/dashboard" className="text-slate-300 hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/employee/mark-attendance" className="text-slate-300 hover:text-blue-400 transition-colors">
                Mark Attendance
              </Link>
              <Link href="/employee/history" className="text-slate-300 hover:text-blue-400 transition-colors">
                History
              </Link>
              <Link href="/employee/profile" className="text-slate-300 hover:text-blue-400 transition-colors">
                Profile
              </Link>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              router.push("/login")
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

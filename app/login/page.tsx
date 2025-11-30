"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser, setToken, setError } from "@/store/slices/authSlice"
import { api } from "@/lib/api"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setErrorMsg] = useState("")
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const result = await api.login(email, password)

      if (result.error) {
        setErrorMsg(result.error)
        dispatch(setError(result.error))
        return
      }

      dispatch(setToken(result.token))
      dispatch(setUser(result.user))

      router.push(result.user.role === "manager" ? "/manager/dashboard" : "/employee/dashboard")
    } catch (err) {
      setErrorMsg("Login failed. Please try again.")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-400 mb-2">Attendance System</h1>
          <p className="text-center text-slate-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 mt-6"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Register here
          </Link>
        </p>

        <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center mb-4">Demo Credentials</p>
          <div className="space-y-2 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Employee:</p>
            <p>Email: bhanu@gmail.com</p>
            <p>Password: bhanu123</p>
            <p className="font-semibold text-slate-300 mt-3">Manager:</p>
            <p>Email: manoj@gmail.com</p>
            <p>Password: manoj123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

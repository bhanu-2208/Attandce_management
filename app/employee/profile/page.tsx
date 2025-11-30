"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export default function ProfilePage() {
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlySummary()
  }, [token])

  const fetchMonthlySummary = async () => {
    if (!token) return
    try {
      const data = await api.getMySummary(token)
      setSummary(data)
    } catch (err) {
      console.error("Error fetching summary:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
              <p className="text-lg font-semibold text-slate-100">{user?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <p className="text-lg font-semibold text-slate-100">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Employee ID</label>
              <p className="text-lg font-semibold text-blue-400">{user?.employeeId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
              <p className="text-lg font-semibold text-slate-100">{user?.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
              <p className="text-lg font-semibold capitalize text-amber-400">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">This Month's Summary</h2>

          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : summary ? (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">Present Days</p>
                <p className="text-3xl font-bold text-green-400">{summary.present}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">Absent Days</p>
                <p className="text-3xl font-bold text-red-400">{summary.absent}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">Late Days</p>
                <p className="text-3xl font-bold text-yellow-400">{summary.late}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">Total Hours Worked</p>
                <p className="text-3xl font-bold text-blue-400">{summary.totalHours.toFixed(1)}h</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

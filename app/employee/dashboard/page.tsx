"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"
import Link from "next/link"

export default function EmployeeDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    if (!token) return
    try {
      const data = await api.getEmployeeDashboard(token)
      setDashboardData(data)
    } catch (err) {
      console.error("Error fetching dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  const isCheckedIn = dashboardData?.todayStatus?.checkInTime && !dashboardData?.todayStatus?.checkOutTime
  const isCheckedOut = dashboardData?.todayStatus?.checkOutTime

  if (loading) {
    return <div className="text-center text-slate-400 py-10">Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-slate-400">Track your attendance and work hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Today's Status</p>
          <p className="text-2xl font-bold text-blue-400">
            {isCheckedOut ? "Completed" : isCheckedIn ? "In Progress" : "Not Started"}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {isCheckedIn && dashboardData?.todayStatus?.checkInTime
              ? `Checked in at ${new Date(dashboardData.todayStatus.checkInTime).toLocaleTimeString()}`
              : "Ready to check in"}
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Present This Month</p>
          <p className="text-2xl font-bold text-green-400">{dashboardData?.monthlyStats?.present}</p>
          <p className="text-xs text-slate-500 mt-2">days worked</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Absent This Month</p>
          <p className="text-2xl font-bold text-red-400">{dashboardData?.monthlyStats?.absent}</p>
          <p className="text-xs text-slate-500 mt-2">days absent</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Total Hours This Month</p>
          <p className="text-2xl font-bold text-amber-400">{dashboardData?.totalHours?.toFixed(1)}h</p>
          <p className="text-xs text-slate-500 mt-2">hours worked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/employee/mark-attendance"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-lg transition-colors"
            >
              Mark Attendance
            </Link>
            <Link
              href="/employee/history"
              className="block w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-center font-semibold rounded-lg transition-colors border border-slate-700"
            >
              View History
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Monthly Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Present Days</span>
              <span className="text-lg font-bold text-green-400">{dashboardData?.monthlyStats?.present}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Late Days</span>
              <span className="text-lg font-bold text-yellow-400">{dashboardData?.monthlyStats?.late}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Half Days</span>
              <span className="text-lg font-bold text-orange-400">{dashboardData?.monthlyStats?.halfDay}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Attendance (Last 7 Days)</h2>

        {dashboardData?.recentAttendance?.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recent records</p>
        ) : (
          <div className="space-y-2">
            {dashboardData?.recentAttendance?.map((record: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-slate-200">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {record.checkInTime
                        ? `Checked in at ${new Date(record.checkInTime).toLocaleTimeString()}`
                        : "Not checked in"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      record.status === "present"
                        ? "bg-green-900/30 text-green-300 border-green-700"
                        : record.status === "absent"
                          ? "bg-red-900/30 text-red-300 border-red-700"
                          : record.status === "late"
                            ? "bg-yellow-900/30 text-yellow-300 border-yellow-700"
                            : "bg-slate-700 text-slate-300 border-slate-600"
                    }`}
                  >
                    {record.status}
                  </span>
                  <span className="text-slate-300 font-semibold min-w-12 text-right">
                    {record.totalHours?.toFixed(1)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

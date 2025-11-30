"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"
import Link from "next/link"

export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    if (!token) return
    try {
      const data = await api.getManagerDashboard(token)
      setDashboardData(data)
    } catch (err) {
      console.error("Error fetching dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-10">Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
        <p className="text-slate-400">Team attendance overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Total Employees</p>
          <p className="text-3xl font-bold text-blue-400">{dashboardData?.totalEmployees}</p>
          <p className="text-xs text-slate-500 mt-2">in your team</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Present Today</p>
          <p className="text-3xl font-bold text-green-400">{dashboardData?.todayStats?.present}</p>
          <p className="text-xs text-slate-500 mt-2">checked in</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Absent Today</p>
          <p className="text-3xl font-bold text-red-400">{dashboardData?.todayStats?.absent}</p>
          <p className="text-xs text-slate-500 mt-2">not checked in</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Checked Out</p>
          <p className="text-3xl font-bold text-amber-400">{dashboardData?.todayStats?.checkedOut}</p>
          <p className="text-xs text-slate-500 mt-2">completed day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Weekly Attendance Trend</h2>
          <div className="space-y-3">
            {dashboardData?.weeklyTrend?.map((day: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-slate-400 min-w-20 text-sm">{day.date}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-8 flex items-center px-3">
                  <div
                    className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min((day.count / dashboardData.totalEmployees) * 100, 100)}%`,
                    }}
                  >
                    {day.count > 0 && <span className="text-xs font-semibold text-white">{day.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Department-Wise Attendance</h2>
          <div className="space-y-3">
            {dashboardData?.departmentStats?.length === 0 ? (
              <p className="text-slate-400">No data available</p>
            ) : (
              dashboardData?.departmentStats?.map((dept: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                  <span className="text-slate-300 font-medium">{dept._id || "Unknown"}</span>
                  <span className="text-lg font-bold text-green-400">{dept.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Late Arrivals Today</h2>
          {dashboardData?.lateArrivals?.length === 0 ? (
            <p className="text-slate-400 text-center py-6">No late arrivals</p>
          ) : (
            <div className="space-y-2">
              {dashboardData?.lateArrivals?.map((record: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-800 rounded-lg border border-yellow-700/30 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{record.user?.name}</p>
                    <p className="text-xs text-slate-400">{record.user?.employeeId}</p>
                  </div>
                  <p className="text-yellow-400 font-semibold">{new Date(record.checkInTime).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Absent Employees Today</h2>
          {dashboardData?.absentEmployees?.length === 0 ? (
            <p className="text-slate-400 text-center py-6">All employees present</p>
          ) : (
            <div className="space-y-2">
              {dashboardData?.absentEmployees?.slice(0, 5).map((emp: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-800 rounded-lg border border-red-700/30 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.employeeId}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-xs font-semibold border border-red-700">
                    Absent
                  </span>
                </div>
              ))}
              {dashboardData?.absentEmployees?.length > 5 && (
                <p className="text-slate-400 text-sm text-center pt-2">
                  +{dashboardData.absentEmployees.length - 5} more absent
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <Link
          href="/manager/all-attendance"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          View All Attendance
        </Link>
        <Link
          href="/manager/reports"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition-colors border border-slate-700"
        >
          Generate Reports
        </Link>
      </div>
    </div>
  )
}

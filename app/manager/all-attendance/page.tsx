"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"

export default function AllAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchAttendance()
  }, [token, selectedDate, selectedStatus])

  const fetchAttendance = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.getAllAttendance(
        token,
        selectedDate,
        selectedStatus === "all" ? undefined : selectedStatus,
      )
      setAttendance(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching attendance:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-900/30 text-green-300 border-green-700"
      case "absent":
        return "bg-red-900/30 text-red-300 border-red-700"
      case "late":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-700"
      case "half-day":
        return "bg-orange-900/30 text-orange-300 border-orange-700"
      default:
        return "bg-slate-800 text-slate-300 border-slate-700"
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">All Employees Attendance</h1>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Check In</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Check Out</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{record.user?.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-400 font-semibold">{record.user?.employeeId}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{record.totalHours?.toFixed(2) || "-"}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

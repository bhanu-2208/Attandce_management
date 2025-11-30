"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchHistory()
  }, [token, month, year])

  const fetchHistory = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.getMyHistory(token, month, year)
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching history:", err)
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

  const getCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getRecordForDate = (day: number) => {
    return records.find(
      (r) => new Date(r.date).toLocaleDateString() === new Date(year, month - 1, day).toLocaleDateString(),
    )
  }

  const days = getCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Attendance History</h1>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
        <div className="flex gap-4 mb-6 justify-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-slate-400 font-semibold text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const record = day ? getRecordForDate(day) : null
              const statusColor = record ? getStatusColor(record.status) : ""

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors ${
                    day
                      ? `bg-slate-700 border-slate-600 text-slate-100 cursor-pointer hover:bg-slate-600 ${statusColor}`
                      : "bg-slate-900 border-slate-800"
                  }`}
                  title={record ? `${record.status} - ${record.totalHours}hrs` : ""}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-900/30 border border-green-700 rounded"></div>
              <span className="text-slate-300">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/30 border border-red-700 rounded"></div>
              <span className="text-slate-300">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-900/30 border border-yellow-700 rounded"></div>
              <span className="text-slate-300">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-900/30 border border-orange-700 rounded"></div>
              <span className="text-slate-300">Half Day</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Check In</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Check Out</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{new Date(record.date).toLocaleDateString()}</td>
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
                    <td className="px-6 py-4 text-sm text-slate-300">{record.totalHours.toFixed(2)}h</td>
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

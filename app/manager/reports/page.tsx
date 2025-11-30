"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"

export default function ReportsPage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [exporting, setExporting] = useState(false)
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchReportData()
  }, [token, startDate, endDate, selectedEmployee])

  const fetchReportData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.getAllAttendance(token)
      const uniqueEmployees = Array.from(new Map(data.map((item: any) => [item.user?._id, item.user])).values())
      setEmployees(uniqueEmployees as any[])

      const filtered = data.filter((record: any) => {
        const recordDate = new Date(record.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        const dateMatch = recordDate >= start && recordDate <= end
        const employeeMatch = selectedEmployee === "all" || record.user?._id === selectedEmployee

        return dateMatch && employeeMatch
      })

      setAttendanceData(filtered)
    } catch (err) {
      console.error("Error fetching report data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!token) return
    setExporting(true)
    try {
      const url = api.exportAttendance(
        token,
        startDate,
        endDate,
        selectedEmployee === "all" ? undefined : selectedEmployee,
      )
      const link = document.createElement("a")
      link.href = url
      link.download = "attendance_report.csv"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error exporting:", err)
    } finally {
      setExporting(false)
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
      <h1 className="text-4xl font-bold text-white mb-8">Attendance Reports</h1>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
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
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-400">
                    No data found for the selected range
                  </td>
                </tr>
              ) : (
                attendanceData.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{new Date(record.date).toLocaleDateString()}</td>
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

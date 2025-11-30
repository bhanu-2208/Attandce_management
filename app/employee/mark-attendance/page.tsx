"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { api } from "@/lib/api"

export default function MarkAttendancePage() {
  const [todayStatus, setTodayStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchTodayStatus()
  }, [token])

  const fetchTodayStatus = async () => {
    if (!token) return
    try {
      const data = await api.getTodayStatus(token)
      setTodayStatus(data)
    } catch (err) {
      console.error("Error fetching today status:", err)
    }
  }

  const handleCheckIn = async () => {
    if (!token) return
    setLoading(true)
    setMessage("")

    try {
      const result = await api.checkIn(token)
      if (result.error) {
        setMessageType("error")
        setMessage(result.error)
      } else {
        setMessageType("success")
        setMessage("Checked in successfully!")
        fetchTodayStatus()
      }
    } catch (err) {
      setMessageType("error")
      setMessage("Check-in failed. Please try again.")
      console.error("Checkin error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!token) return
    setLoading(true)
    setMessage("")

    try {
      const result = await api.checkOut(token)
      if (result.error) {
        setMessageType("error")
        setMessage(result.error)
      } else {
        setMessageType("success")
        setMessage(`Checked out successfully! Total hours: ${result.totalHours}`)
        fetchTodayStatus()
      }
    } catch (err) {
      setMessageType("error")
      setMessage("Check-out failed. Please try again.")
      console.error("Checkout error:", err)
    } finally {
      setLoading(false)
    }
  }

  const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime
  const isCheckedOut = todayStatus?.checkOutTime

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Mark Attendance</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            messageType === "success"
              ? "bg-green-900/20 border-green-700 text-green-300"
              : "bg-red-900/20 border-red-700 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Status</h3>
            <p className="text-2xl font-bold text-blue-400">
              {isCheckedOut ? "Checked Out" : isCheckedIn ? "Checked In" : "Not Checked In"}
            </p>
          </div>

          {todayStatus?.checkInTime && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Check-in Time</h3>
              <p className="text-xl font-semibold text-green-400">
                {new Date(todayStatus.checkInTime).toLocaleTimeString()}
              </p>
            </div>
          )}

          {todayStatus?.checkOutTime && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Check-out Time</h3>
              <p className="text-xl font-semibold text-red-400">
                {new Date(todayStatus.checkOutTime).toLocaleTimeString()}
              </p>
            </div>
          )}

          {todayStatus?.totalHours > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Total Hours</h3>
              <p className="text-xl font-semibold text-amber-400">{todayStatus.totalHours.toFixed(2)} hours</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCheckIn}
            disabled={loading || isCheckedIn || isCheckedOut}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading && !isCheckedIn ? "Checking In..." : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || !isCheckedIn}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading && isCheckedIn ? "Checking Out..." : "Check Out"}
          </button>
        </div>

        {isCheckedOut && (
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-center">You have completed your attendance for today. See you tomorrow!</p>
          </div>
        )}
      </div>
    </div>
  )
}

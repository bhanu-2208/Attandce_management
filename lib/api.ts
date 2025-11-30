const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const api = {
  // Auth
  register: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  login: async (email: string, password: string) => {
    console.log("[Frontend] Attempting login with:", email)
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    console.log("[Frontend] Response status:", response.status)
    const data = await response.json()
    console.log("[Frontend] Response data:", data)
    if (!response.ok) {
      return { error: data.error || "Login failed" }
    }
    return data
  },

  getMe: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  // Attendance - Employee
  checkIn: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance/checkin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  checkOut: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance/checkout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getMyHistory: async (token: string, month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    const response = await fetch(`${API_URL}/attendance/my-history?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getMySummary: async (token: string, month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    const response = await fetch(`${API_URL}/attendance/my-summary?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getTodayStatus: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance/today`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  // Attendance - Manager
  getAllAttendance: async (token: string, date?: string, status?: string) => {
    const params = new URLSearchParams()
    if (date) params.append("date", date)
    if (status) params.append("status", status)
    const response = await fetch(`${API_URL}/attendance/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getEmployeeAttendance: async (token: string, employeeId: string, month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    const response = await fetch(`${API_URL}/attendance/employee/${employeeId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getAttendanceSummary: async (token: string, month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    const response = await fetch(`${API_URL}/attendance/summary?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getTodayAttendanceStatus: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance/today-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  exportAttendance: (token: string, startDate: string, endDate: string, employeeId?: string) => {
    const params = new URLSearchParams()
    params.append("startDate", startDate)
    params.append("endDate", endDate)
    if (employeeId) params.append("employeeId", employeeId)
    return `${API_URL}/attendance/export?${params}&token=${token}`
  },

  // Dashboard
  getEmployeeDashboard: async (token: string) => {
    const response = await fetch(`${API_URL}/dashboard/employee`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },

  getManagerDashboard: async (token: string) => {
    const response = await fetch(`${API_URL}/dashboard/manager`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  },
}

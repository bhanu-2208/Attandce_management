import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// JWT Secret
const JWT_SECRET = "your_jwt_secret_key_change_this"

// In-memory database (for testing - no MongoDB required!)
const users = [
  {
    id: "1",
    name: "John Employee",
    email: "emp1@example.com",
    password: "$2a$10$YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8", // password123
    role: "employee",
    employeeId: "EMP001",
    department: "Engineering",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Manager",
    email: "manager@example.com",
    password: "$2a$10$YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8r8YQv8", // password123
    role: "manager",
    employeeId: "MGR001",
    department: "Management",
    createdAt: new Date(),
  },
]

const attendance = []

// Middleware: Verify Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" })
    req.user = decoded
    next()
  })
}

// ======================
// AUTH ENDPOINTS
// ======================

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department } = req.body

    if (!name || !email || !password || !role || !employeeId) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department: department || "General",
      createdAt: new Date(),
    }

    users.push(newUser)

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
    })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: "Registration failed" })
  }
})

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("[Server] Login attempt:", req.body)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = users.find((u) => u.email === email)
    if (!user) {
      console.log("[Server] User not found:", email)
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("[Server] Invalid password for:", email)
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    console.log("[Server] Login successful for:", email)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
      },
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Login failed" })
  }
})

// GET /api/auth/me
app.get("/api/auth/me", verifyToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
    })
  } catch (err) {
    console.error("Get me error:", err)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// ======================
// ATTENDANCE ENDPOINTS - EMPLOYEE
// ======================

// POST /api/attendance/checkin
app.post("/api/attendance/checkin", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = attendance.find(
      (a) => a.userId === userId && new Date(a.date).getTime() === today.getTime(),
    )

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ error: "Already checked in today" })
    }

    const checkInTime = new Date()

    if (existingAttendance) {
      existingAttendance.checkInTime = checkInTime
    } else {
      attendance.push({
        id: Date.now().toString(),
        userId,
        date: today,
        checkInTime,
        checkOutTime: null,
        status: "present",
        totalHours: 0,
        createdAt: new Date(),
      })
    }

    res.json({ message: "Checked in successfully", checkInTime })
  } catch (err) {
    console.error("Checkin error:", err)
    res.status(500).json({ error: "Check-in failed" })
  }
})

// POST /api/attendance/checkout
app.post("/api/attendance/checkout", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendanceRecord = attendance.find(
      (a) => a.userId === userId && new Date(a.date).getTime() === today.getTime(),
    )

    if (!attendanceRecord) {
      return res.status(404).json({ error: "No check-in record found for today" })
    }

    if (attendanceRecord.checkOutTime) {
      return res.status(400).json({ error: "Already checked out today" })
    }

    const checkOutTime = new Date()
    const totalHours = (checkOutTime - attendanceRecord.checkInTime) / (1000 * 60 * 60)

    attendanceRecord.checkOutTime = checkOutTime
    attendanceRecord.totalHours = Number.parseFloat(totalHours.toFixed(2))

    res.json({ message: "Checked out successfully", checkOutTime, totalHours: attendanceRecord.totalHours })
  } catch (err) {
    console.error("Checkout error:", err)
    res.status(500).json({ error: "Check-out failed" })
  }
})

// GET /api/attendance/my-history
app.get("/api/attendance/my-history", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId
    const userAttendance = attendance
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(userAttendance)
  } catch (err) {
    console.error("Get history error:", err)
    res.status(500).json({ error: "Failed to fetch history" })
  }
})

// GET /api/attendance/my-summary
app.get("/api/attendance/my-summary", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId
    const userAttendance = attendance.filter((a) => a.userId === userId)

    const summary = {
      present: userAttendance.filter((a) => a.status === "present").length,
      absent: userAttendance.filter((a) => a.status === "absent").length,
      late: userAttendance.filter((a) => a.status === "late").length,
      halfDay: userAttendance.filter((a) => a.status === "half-day").length,
      totalHours: userAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    }

    res.json(summary)
  } catch (err) {
    console.error("Get summary error:", err)
    res.status(500).json({ error: "Failed to fetch summary" })
  }
})

// GET /api/attendance/today
app.get("/api/attendance/today", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendanceRecord = attendance.find(
      (a) => a.userId === userId && new Date(a.date).getTime() === today.getTime(),
    )

    res.json(attendanceRecord || { message: "No attendance record for today" })
  } catch (err) {
    console.error("Get today error:", err)
    res.status(500).json({ error: "Failed to fetch today status" })
  }
})

// ======================
// ATTENDANCE ENDPOINTS - MANAGER
// ======================

// GET /api/attendance/all
app.get("/api/attendance/all", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view all attendance" })
    }

    const attendanceWithUsers = attendance.map((a) => {
      const user = users.find((u) => u.id === a.userId)
      return { ...a, user }
    })

    res.json(attendanceWithUsers)
  } catch (err) {
    console.error("Get all attendance error:", err)
    res.status(500).json({ error: "Failed to fetch attendance" })
  }
})

// GET /api/attendance/employee/:id
app.get("/api/attendance/employee/:id", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view employee attendance" })
    }

    const employeeAttendance = attendance
      .filter((a) => a.userId === req.params.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(employeeAttendance)
  } catch (err) {
    console.error("Get employee attendance error:", err)
    res.status(500).json({ error: "Failed to fetch employee attendance" })
  }
})

// GET /api/attendance/summary
app.get("/api/attendance/summary", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view summary" })
    }

    const summary = {
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      halfDay: attendance.filter((a) => a.status === "half-day").length,
    }

    res.json(summary)
  } catch (err) {
    console.error("Get summary error:", err)
    res.status(500).json({ error: "Failed to fetch summary" })
  }
})

// GET /api/attendance/today-status
app.get("/api/attendance/today-status", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view today status" })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = attendance
      .filter((a) => new Date(a.date).getTime() === today.getTime())
      .map((a) => {
        const user = users.find((u) => u.id === a.userId)
        return { ...a, user }
      })

    const summary = {
      present: todayAttendance.filter((a) => a.checkInTime && !a.checkOutTime).length,
      absent: todayAttendance.filter((a) => !a.checkInTime).length,
      checkedOut: todayAttendance.filter((a) => a.checkOutTime).length,
      data: todayAttendance,
    }

    res.json(summary)
  } catch (err) {
    console.error("Get today status error:", err)
    res.status(500).json({ error: "Failed to fetch today status" })
  }
})

// GET /api/attendance/export
app.get("/api/attendance/export", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can export" })
    }

    const attendanceWithUsers = attendance.map((a) => {
      const user = users.find((u) => u.id === a.userId)
      return { ...a, user }
    })

    let csv = "Employee ID,Name,Date,Check In,Check Out,Status,Total Hours\n"
    attendanceWithUsers.forEach((record) => {
      const checkIn = record.checkInTime ? new Date(record.checkInTime).toLocaleString() : "N/A"
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "N/A"
      const date = new Date(record.date).toLocaleDateString()

      csv += `${record.user?.employeeId},"${record.user?.name}",${date},"${checkIn}","${checkOut}",${record.status},${record.totalHours}\n`
    })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment; filename="attendance_report.csv"')
    res.send(csv)
  } catch (err) {
    console.error("Export error:", err)
    res.status(500).json({ error: "Failed to export data" })
  }
})

// ======================
// DASHBOARD ENDPOINTS
// ======================

// GET /api/dashboard/employee
app.get("/api/dashboard/employee", verifyToken, (req, res) => {
  try {
    const userId = req.user.userId

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayRecord = attendance.find((a) => a.userId === userId && new Date(a.date).getTime() === today.getTime())

    const userAttendance = attendance.filter((a) => a.userId === userId)

    const stats = {
      present: userAttendance.filter((a) => a.status === "present").length,
      absent: userAttendance.filter((a) => a.status === "absent").length,
      late: userAttendance.filter((a) => a.status === "late").length,
      halfDay: userAttendance.filter((a) => a.status === "half-day").length,
    }

    const totalHours = userAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentAttendance = userAttendance
      .filter((a) => new Date(a.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({
      todayStatus: todayRecord || null,
      monthlyStats: stats,
      totalHours: Number.parseFloat(totalHours.toFixed(2)),
      recentAttendance,
    })
  } catch (err) {
    console.error("Employee dashboard error:", err)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// GET /api/dashboard/manager
app.get("/api/dashboard/manager", verifyToken, (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view manager dashboard" })
    }

    const totalEmployees = users.filter((u) => u.role === "employee").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = attendance.filter((a) => new Date(a.date).getTime() === today.getTime())

    const todayStats = {
      present: todayAttendance.filter((a) => a.checkInTime && !a.checkOutTime).length,
      absent: todayAttendance.filter((a) => !a.checkInTime).length,
      late: todayAttendance.filter((a) => a.status === "late").length,
    }

    const lateArrivals = todayAttendance
      .filter((a) => a.status === "late")
      .map((a) => {
        const user = users.find((u) => u.id === a.userId)
        return { ...a, user }
      })

    // Weekly trend
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = attendance.filter(
        (a) => new Date(a.date) >= date && new Date(a.date) < nextDate && a.checkInTime,
      ).length

      weeklyTrend.push({
        date: date.toLocaleDateString(),
        count,
      })
    }

    // Department stats
    const deptStats = {}
    users.forEach((u) => {
      if (u.role === "employee") {
        deptStats[u.department] = (deptStats[u.department] || 0) + 1
      }
    })

    res.json({
      totalEmployees,
      todayStats,
      lateArrivals,
      weeklyTrend,
      departmentStats: deptStats,
    })
  } catch (err) {
    console.error("Manager dashboard error:", err)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`📍 API URL: http://localhost:${PORT}/api`)
  console.log(`\nDemo Credentials:`)
  console.log(`Employee - Email: emp1@example.com, Password: password123`)
  console.log(`Manager - Email: manager@example.com, Password: password123`)
})

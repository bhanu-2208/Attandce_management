import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { MongoClient, ObjectId } from "mongodb"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// MongoDB Connection
let db
MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/attendance_system")
  .then((client) => {
    console.log("Connected to MongoDB")
    db = client.db()
  })
  .catch((err) => console.error("MongoDB connection error:", err))

// Middleware
app.use(cors())
app.use(express.json())

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_this"

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

    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department: department || "General",
      createdAt: new Date(),
    })

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId,
    })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: "Registration failed" })
  }
})

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
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
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.userId) })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user._id,
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
app.post("/api/attendance/checkin", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = await db.collection("attendance").findOne({
      userId: new ObjectId(userId),
      date: today,
    })

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ error: "Already checked in today" })
    }

    const checkInTime = new Date()

    let result
    if (existingAttendance) {
      result = await db.collection("attendance").updateOne({ _id: existingAttendance._id }, { $set: { checkInTime } })
    } else {
      result = await db.collection("attendance").insertOne({
        userId: new ObjectId(userId),
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
app.post("/api/attendance/checkout", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await db.collection("attendance").findOne({
      userId: new ObjectId(userId),
      date: today,
    })

    if (!attendance) {
      return res.status(404).json({ error: "No check-in record found for today" })
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ error: "Already checked out today" })
    }

    const checkOutTime = new Date()
    const totalHours = (checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)

    await db
      .collection("attendance")
      .updateOne(
        { _id: attendance._id },
        { $set: { checkOutTime, totalHours: Number.parseFloat(totalHours.toFixed(2)) } },
      )

    res.json({ message: "Checked out successfully", checkOutTime, totalHours })
  } catch (err) {
    console.error("Checkout error:", err)
    res.status(500).json({ error: "Check-out failed" })
  }
})

// GET /api/attendance/my-history
app.get("/api/attendance/my-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { month, year } = req.query

    const query = { userId: new ObjectId(userId) }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const attendance = await db.collection("attendance").find(query).sort({ date: -1 }).toArray()

    res.json(attendance)
  } catch (err) {
    console.error("Get history error:", err)
    res.status(500).json({ error: "Failed to fetch history" })
  }
})

// GET /api/attendance/my-summary
app.get("/api/attendance/my-summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { month, year } = req.query

    const now = new Date()
    const currentMonth = month || now.getMonth() + 1
    const currentYear = year || now.getFullYear()

    const startDate = new Date(currentYear, currentMonth - 1, 1)
    const endDate = new Date(currentYear, currentMonth, 0)

    const attendance = await db
      .collection("attendance")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .toArray()

    const summary = {
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      halfDay: attendance.filter((a) => a.status === "half-day").length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    }

    res.json(summary)
  } catch (err) {
    console.error("Get summary error:", err)
    res.status(500).json({ error: "Failed to fetch summary" })
  }
})

// GET /api/attendance/today
app.get("/api/attendance/today", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await db.collection("attendance").findOne({
      userId: new ObjectId(userId),
      date: today,
    })

    res.json(attendance || { message: "No attendance record for today" })
  } catch (err) {
    console.error("Get today error:", err)
    res.status(500).json({ error: "Failed to fetch today status" })
  }
})

// ======================
// ATTENDANCE ENDPOINTS - MANAGER
// ======================

// GET /api/attendance/all
app.get("/api/attendance/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view all attendance" })
    }

    const { date, status } = req.query
    const query = {}

    if (date) {
      const dateObj = new Date(date)
      dateObj.setHours(0, 0, 0, 0)
      const nextDate = new Date(dateObj)
      nextDate.setDate(nextDate.getDate() + 1)
      query.date = { $gte: dateObj, $lt: nextDate }
    }

    if (status) {
      query.status = status
    }

    const attendance = await db
      .collection("attendance")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $sort: { date: -1 } },
      ])
      .toArray()

    res.json(attendance)
  } catch (err) {
    console.error("Get all attendance error:", err)
    res.status(500).json({ error: "Failed to fetch attendance" })
  }
})

// GET /api/attendance/employee/:id
app.get("/api/attendance/employee/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view employee attendance" })
    }

    const { month, year } = req.query
    const query = { userId: new ObjectId(req.params.id) }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const attendance = await db.collection("attendance").find(query).sort({ date: -1 }).toArray()

    res.json(attendance)
  } catch (err) {
    console.error("Get employee attendance error:", err)
    res.status(500).json({ error: "Failed to fetch employee attendance" })
  }
})

// GET /api/attendance/summary
app.get("/api/attendance/summary", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view summary" })
    }

    const { month, year } = req.query

    const now = new Date()
    const currentMonth = month || now.getMonth() + 1
    const currentYear = year || now.getFullYear()

    const startDate = new Date(currentYear, currentMonth - 1, 1)
    const endDate = new Date(currentYear, currentMonth, 0)

    const attendance = await db
      .collection("attendance")
      .aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    }

    attendance.forEach((item) => {
      summary[item._id] = item.count
    })

    res.json(summary)
  } catch (err) {
    console.error("Get summary error:", err)
    res.status(500).json({ error: "Failed to fetch summary" })
  }
})

// GET /api/attendance/today-status
app.get("/api/attendance/today-status", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view today status" })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = await db
      .collection("attendance")
      .aggregate([
        { $match: { date: today } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray()

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
app.get("/api/attendance/export", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can export" })
    }

    const { startDate, endDate, employeeId } = req.query
    const query = {}

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    if (employeeId) {
      query.userId = new ObjectId(employeeId)
    }

    const attendance = await db
      .collection("attendance")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $sort: { date: -1 } },
      ])
      .toArray()

    // Generate CSV
    let csv = "Employee ID,Name,Date,Check In,Check Out,Status,Total Hours\n"
    attendance.forEach((record) => {
      const checkIn = record.checkInTime ? new Date(record.checkInTime).toLocaleString() : "N/A"
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "N/A"
      const date = new Date(record.date).toLocaleDateString()

      csv += `${record.user.employeeId},"${record.user.name}",${date},"${checkIn}","${checkOut}",${record.status},${record.totalHours}\n`
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
app.get("/api/dashboard/employee", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const startDate = new Date(currentYear, currentMonth - 1, 1)
    const endDate = new Date(currentYear, currentMonth, 0)

    // Today's status
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayRecord = await db.collection("attendance").findOne({
      userId: new ObjectId(userId),
      date: today,
    })

    // This month stats
    const monthlyStats = await db
      .collection("attendance")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    }

    monthlyStats.forEach((item) => {
      stats[item._id] = item.count
    })

    // Total hours this month
    const totalHoursData = await db
      .collection("attendance")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalHours" },
          },
        },
      ])
      .toArray()

    const totalHours = totalHoursData.length > 0 ? Number.parseFloat(totalHoursData[0].total.toFixed(2)) : 0

    // Last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentAttendance = await db
      .collection("attendance")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: sevenDaysAgo },
      })
      .sort({ date: -1 })
      .toArray()

    res.json({
      todayStatus: todayRecord || null,
      monthlyStats: stats,
      totalHours,
      recentAttendance,
    })
  } catch (err) {
    console.error("Employee dashboard error:", err)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// GET /api/dashboard/manager
app.get("/api/dashboard/manager", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can view manager dashboard" })
    }

    // Total employees
    const totalEmployees = await db.collection("users").countDocuments({ role: "employee" })

    // Today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = await db
      .collection("attendance")
      .aggregate([
        { $match: { date: today } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const todayStats = {
      present: 0,
      absent: 0,
      late: 0,
    }

    todayAttendance.forEach((item) => {
      if (todayStats.hasOwnProperty(item._id)) {
        todayStats[item._id] = item.count
      }
    })

    // Late arrivals today
    const lateArrivals = await db
      .collection("attendance")
      .aggregate([
        { $match: { date: today, status: "late" } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray()

    // Weekly attendance trend
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await db.collection("attendance").countDocuments({
        date: { $gte: date, $lt: nextDate },
        checkInTime: { $exists: true },
      })

      weeklyTrend.push({
        date: date.toLocaleDateString(),
        count,
      })
    }

    // Department-wise attendance
    const deptStats = await db
      .collection("attendance")
      .aggregate([
        { $match: { date: today, checkInTime: { $exists: true } } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user.department",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Absent employees today
    const allEmployeeIds = await db.collection("users").find({ role: "employee" }).project({ _id: 1 }).toArray()

    const presentEmployeeIds = await db
      .collection("attendance")
      .find({ date: today, checkInTime: { $exists: true } })
      .project({ userId: 1 })
      .toArray()

    const presentIds = new Set(presentEmployeeIds.map((p) => p.userId.toString()))
    const absentEmployees = []

    for (const emp of allEmployeeIds) {
      if (!presentIds.has(emp._id.toString())) {
        const user = await db.collection("users").findOne({ _id: emp._id })
        absentEmployees.push(user)
      }
    }

    res.json({
      totalEmployees,
      todayStats,
      lateArrivals,
      weeklyTrend,
      departmentStats: deptStats,
      absentEmployees,
    })
  } catch (err) {
    console.error("Manager dashboard error:", err)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

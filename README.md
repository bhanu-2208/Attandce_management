# Employee Attendance System - Complete Setup Guide

## Prerequisites

Make sure you have these installed on your machine:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB** (Local or Atlas Cloud)
   - Local: Download from https://www.mongodb.com/try/download/community
   - OR Cloud: Create free account at https://www.mongodb.com/cloud/atlas

3. **VSCode** (or any code editor)
   - Download from: https://code.visualstudio.com/

---

## Step-by-Step Installation

### Step 1: Clone/Download the Project

\`\`\`bash
# If using GitHub
git clone <your-repo-url>
cd attendance-system

# OR if downloaded as ZIP, extract it and navigate to the folder
cd attendance-system
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
# Install all Node.js dependencies (React, Express, Redux, etc.)
npm install
\`\`\`

This will install:
- **Frontend**: React, Next.js, Redux, Tailwind CSS, UI components
- **Backend**: Express.js, MongoDB driver, JWT, bcryptjs
- **All required tools**: TypeScript, PostCSS, Recharts for charts

### Step 3: Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Click "Connect" and copy your connection string
5. Replace `<password>` with your actual password
6. Should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/attendance`

#### Option B: Local MongoDB
1. Install MongoDB Community from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Windows**: MongoDB runs as a service (check Services)
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Default URI: `mongodb://localhost:27017/attendance`

### Step 4: Create Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
# Backend Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/attendance
# OR for local: mongodb://localhost:27017/attendance

JWT_SECRET=your_super_secret_jwt_key_change_this_12345

# Frontend Configuration (in .env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

**Create `.env.local` for frontend:**

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

---

## Running the Application

### Terminal Setup

Open **TWO separate terminals** in VSCode:

#### Terminal 1: Start Backend Server

\`\`\`bash
# Make sure you're in the root directory
node server.js
\`\`\`

Expected output:
\`\`\`
Server running on port 5000
Connected to MongoDB
\`\`\`

#### Terminal 2: Start Frontend Development Server

\`\`\`bash
# In a NEW terminal, same root directory
npm run dev
\`\`\`

Expected output:
\`\`\`
▲ Next.js 16.0.3
- Local:        http://localhost:3000
\`\`\`

---

## How to Open Both Terminals in VSCode

1. **First terminal** (already open):
   - Terminal → New Terminal
   - Run: `node server.js`

2. **Second terminal** (create new):
   - Click the **+** icon next to the terminal tab
   - Or: Terminal → New Terminal
   - Run: `npm run dev`

Now both terminals will be visible in VSCode!

---

## Access the Application

Once both servers are running:

**Open your browser and go to:**
\`\`\`
http://localhost:3000
\`\`\`

You'll be redirected to the login page automatically.

---

## Demo Credentials

Use these to test the system:

### Employee Account
- **Email**: emp1@example.com
- **Password**: password123

### Manager Account
- **Email**: manager@example.com
- **Password**: password123

---

## File Structure

\`\`\`
attendance-system/
├── server.js                      # Backend Express server
├── .env                          # Backend environment variables
├── .env.local                    # Frontend environment variables
├── package.json                  # Dependencies
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
│
├── app/                          # Next.js app directory
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── page.tsx                  # Home (redirects to dashboard)
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── employee/                 # Employee routes
│   │   ├── dashboard/            # Employee dashboard
│   │   ├── mark-attendance/      # Check in/out
│   │   ├── history/              # Attendance history
│   │   └── profile/              # Profile page
│   └── manager/                  # Manager routes
│       ├── dashboard/            # Manager dashboard
│       ├── all-attendance/       # View all employees
│       └── reports/              # Generate reports
│
├── components/                   # React components
│   ├── providers.tsx             # Redux provider
│   └── ui/                       # shadcn/ui components
│
├── store/                        # Redux store
│   ├── index.ts                  # Store setup
│   └── slices/                   # Redux slices
│       ├── authSlice.ts          # Auth state
│       └── attendanceSlice.ts    # Attendance state
│
└── lib/                          # Utilities
    └── api.ts                    # API client
\`\`\`

---

## API Endpoints

All endpoints use `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Employee Endpoints
- `POST /attendance/checkin` - Check in
- `POST /attendance/checkout` - Check out
- `GET /attendance/my-history` - Get attendance history
- `GET /attendance/my-summary` - Get monthly summary
- `GET /attendance/today` - Get today's status

### Manager Endpoints
- `GET /attendance/all` - Get all employees attendance
- `GET /attendance/employee/:id` - Get specific employee
- `GET /attendance/summary` - Team summary
- `GET /attendance/export` - Export CSV
- `GET /attendance/today-status` - Who's present today

### Dashboard
- `GET /dashboard/employee` - Employee stats
- `GET /dashboard/manager` - Manager stats

---

## Troubleshooting

### "Cannot find module" Error
\`\`\`bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### MongoDB Connection Failed
1. Check `.env` has correct `MONGODB_URI`
2. Verify MongoDB is running
3. For MongoDB Atlas: Check IP whitelist allows your IP (127.0.0.1 for local)
4. Check password doesn't have special characters (or URL encode them)

### Port Already in Use
If port 5000 or 3000 is already in use:
\`\`\`bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9
\`\`\`

### Tokens/Session Issues
1. Clear browser cookies: F12 → Application → Storage → Clear All
2. Clear Redux store by refreshing: Ctrl+Shift+R (hard refresh)
3. Logout and login again

### CSS/Styling Not Loading
1. Make sure you're on `npm run dev` (not `npm start`)
2. Check no errors in Terminal 2 (frontend)
3. Hard refresh browser: Ctrl+Shift+R

---

## Build for Production

### Frontend Build
\`\`\`bash
npm run build
npm run start
\`\`\`

### Backend Considerations
For production, use:
- Environment variables (never hardcode secrets)
- HTTPS only
- Rate limiting
- CORS properly configured
- Database backups

---

## Features Checklist

### Employee Features
- [x] Login/Register with role selection
- [x] Dashboard with today's status and monthly stats
- [x] Quick check-in/check-out button
- [x] Attendance history with calendar view
- [x] Color-coded status (Green/Red/Yellow/Orange)
- [x] Monthly summary statistics
- [x] Profile page with personal info

### Manager Features
- [x] Login with manager credentials
- [x] Dashboard with team overview
- [x] Weekly attendance trend chart
- [x] Department-wise attendance breakdown
- [x] View all employees attendance
- [x] Filter by date and status
- [x] Export attendance as CSV
- [x] See today's late arrivals and absences

---

## Support

If you encounter issues:
1. Check the terminal for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check both servers (backend & frontend) are running
5. Check browser console (F12) for client-side errors

Happy tracking!

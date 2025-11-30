import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AttendanceRecord {
  _id: string
  userId: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
  totalHours: number
}

interface AttendanceState {
  records: AttendanceRecord[]
  todayStatus: AttendanceRecord | null
  loading: boolean
  error: string | null
}

const initialState: AttendanceState = {
  records: [],
  todayStatus: null,
  loading: false,
  error: null,
}

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload
    },
    setTodayStatus: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.todayStatus = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setRecords, setTodayStatus, setLoading, setError } = attendanceSlice.actions
export default attendanceSlice.reducer

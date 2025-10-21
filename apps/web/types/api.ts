export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string | null;
  dob: string | null;
  parentName: string;
  parentPhone: string;
  email: string | null;
  joiningDate: string;
  currentLevel: number;
  batchId: number | null;
  photoUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  batch?: {
    id: number;
    name: string;
    timeSlot: string;
    dayMask: number;
    level: {
      id: number;
      name: string;
    };
  };
}

export interface Batch {
  id: number;
  name: string;
  levelId: number;
  teacherId: number | null;
  dayMask: number;
  timeSlot: string;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
  level: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
}

export interface Level {
  id: number;
  name: string;
  passingPercent: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: number;
  studentId: number;
  batchId: number | null;
  level: number;
  testName: string;
  date: string;
  subjects: Array<{
    name: string;
    obtained: number;
    total: number;
  }>;
  totalObtained: number;
  totalPossible: number;
  percent: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paidDate: string | null;
  paidBy: string | null;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  studentId: number;
  batchId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedBy: number | null;
  note: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeBatches: number;
  attendancePercentOverall: number;
  feesDue: number;
}

export interface AttendanceIssue {
  studentName: string;
  batchName: string;
  absencesThisMonth: number;
  lastAttendance: string;
}

export interface AttendanceSummary {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercent: number;
}
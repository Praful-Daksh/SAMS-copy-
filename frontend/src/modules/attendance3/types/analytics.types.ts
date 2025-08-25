/**
 * Enum for attendance trend direction.
 */
export enum AttendanceTrendDirection {
  UP = "UP",
  DOWN = "DOWN",
  STABLE = "STABLE",
}

export interface AttendanceAnalytics {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  subjectBreakdown: SubjectAttendance[];
  dailyTrends: DailyAttendance[];
  monthlyTrends: MonthlyAttendance[];
}

export interface SubjectAttendance {
  subjectId: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export interface DailyAttendance {
  date: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
  attendancePercentage: number;
}

export interface MonthlyAttendance {
  month: string;
  averageAttendance: number;
  totalClasses: number;
  totalStudents: number;
}

/**
 * Student risk profile for attendance.
 */
export interface StudentRiskProfile {
  studentId: string;
  studentName: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

/**
 * Daily analytics summary for attendance.
 */
export interface DailyAnalyticsSummary {
  date: string;
  totalPresent: number;
  totalAbsent: number;
  classHeld: number;
}
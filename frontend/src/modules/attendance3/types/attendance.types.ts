export enum AttendanceStatus {
  Present = "Present",
  Absent = "Absent",
}

export interface AttendanceRecord {
  studentId: string;
  subjectId: string;
  date: string;
  period: number;
  status: AttendanceStatus;
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

export interface DailySummary {
  date: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
}
import apiClient from '@/api';
import { AttendanceRecord, SubjectAttendance } from "../types/attendance.types";

export interface MarkAttendanceData {
  classId: string;
  subjectId: string;
  studentsAttendance: {
    date: string;
    students: Array<{
      studentId: string;
      status: 'Present' | 'Absent';
    }>;
  };
}

export const attendanceService = {
  async getAttendanceByDate(subjectId: string, date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.get('/attendance/by-date', {
        params: { subjectId, date }
      });
      return response.data.attendance?.students || [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch attendance by date');
      }
      throw new Error('Failed to fetch attendance by date');
    }
  },

  async markAttendance(data: MarkAttendanceData): Promise<void> {
    try {
      await apiClient.post('/attendance/mark', data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to mark attendance');
      }
      throw new Error('Failed to mark attendance');
    }
  },

  async getStudentAttendanceSummary(studentId: string, subjectId: string): Promise<SubjectAttendance> {
    try {
      const response = await apiClient.get('/attendance/by-subject', {
        params: { studentId, subjectId }
      });
      const { totalClasses, totalAttended } = response.data;
      return {
        subjectId,
        subject: {
          _id: subjectId,
          name: '', // Will be populated by the component
          code: ''
        },
        totalClasses,
        attendedClasses: totalAttended,
        attendancePercentage: totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch student attendance summary');
      }
      throw new Error('Failed to fetch student attendance summary');
    }
  },

  async getSubjectWiseAttendance(subjectId: string, classId: string): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.get('/attendance/by-date', {
        params: { subjectId, classId }
      });
      return response.data.attendance?.students || [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch subject-wise attendance');
      }
      throw new Error('Failed to fetch subject-wise attendance');
    }
  },

  async getTimetableExists(params: {
    department: string;
    year: number;
    section: number;
    batch?: string;
    semester?: number;
  }): Promise<{
    exists: boolean;
    subjects: Array<{
      faculty_name: string;
      faculty_id: string;
      subject_name: string;
      subject_id: string;
      section: number;
    }>;
    timetable?: any;
  }> {
    try {
      const response = await apiClient.get('/userData/checkTimetable', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to check timetable');
      }
      throw new Error('Failed to check timetable');
    }
  }
};
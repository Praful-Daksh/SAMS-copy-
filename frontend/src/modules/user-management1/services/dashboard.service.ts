import apiClient from '@/api';

export interface SubjectInfo {
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  faculty: {
    _id: string;
    name: string;
  } | null;
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  };
}

export interface StudentAcademicDetails {
  schedule: any;
  subjects: SubjectInfo[];
}

export interface TimetableSlot {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  room?: string;
}

class DashboardService {
  async getStudentDashboard(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/student');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch student dashboard');
      }
      throw new Error('Failed to fetch student dashboard');
    }
  }

  async getStudentAcademicDetails(): Promise<StudentAcademicDetails> {
    try {
      const response = await apiClient.get('/dashboard/student-academic-details');
      return response.data.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch academic details');
      }
      throw new Error('Failed to fetch academic details');
    }
  }

  async getFacultyDashboard(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/faculty');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch faculty dashboard');
      }
      throw new Error('Failed to fetch faculty dashboard');
    }
  }

  async getHODDashboard(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/hod');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch HOD dashboard');
      }
      throw new Error('Failed to fetch HOD dashboard');
    }
  }

  async getAdminDashboard(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/admin');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch admin dashboard');
      }
      throw new Error('Failed to fetch admin dashboard');
    }
  }
}

export const dashboardService = new DashboardService(); 
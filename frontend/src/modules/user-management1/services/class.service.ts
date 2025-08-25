import apiClient from '@/api';
import { Subject } from './subject.service';

export interface Class {
  _id: string;
  department: string;
  year: number;
  batch: string;
  section: number;
  semester: number;
  students: string[];
  curriculum: string;
}

export interface ClassDetails extends Class {
  curriculum: {
    _id: string;
    department: string;
    version: string;
    subjectsBySemester: Map<string, Subject[]>;
  };
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    aparId: string;
  }>;
  subjectAssignments: Array<{
    _id: string;
    subject: Subject;
    faculty: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

class ClassService {
  async getClassDetails(params: {
    batch?: string;
    department?: string;
    section?: number;
    year?: number;
    semester?: number;
  }): Promise<ClassDetails> {
    try {
      const response = await apiClient.get('/class/details', { params });
      return response.data.classDetails;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch class details');
      }
      throw new Error('Failed to fetch class details');
    }
  }

  async createClass(data: {
    department: string;
    year: number;
    batch: string;
    section: number;
    semester: number;
  }): Promise<Class> {
    try {
      const response = await apiClient.post('/class/new', data);
      return response.data.classDetails;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to create class');
      }
      throw new Error('Failed to create class');
    }
  }

  async getClassesByDepartment(department: string): Promise<Class[]> {
    try {
      const response = await apiClient.get('/class/by-department', { params: { department } });
      return response.data.classes || [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch classes');
      }
      throw new Error('Failed to fetch classes');
    }
  }

  async getClassSubjects(classId: string): Promise<{
    subjects: Subject[];
    semester: number;
  }> {
    try {
      const response = await apiClient.get(`/class/${classId}/subjects`);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch class subjects');
      }
      throw new Error('Failed to fetch class subjects');
    }
  }
}

export const classService = new ClassService(); 
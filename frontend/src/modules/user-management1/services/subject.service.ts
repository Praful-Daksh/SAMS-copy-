import apiClient from '@/api';

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: string;
}

export interface Curriculum {
  _id: string;
  department: string;
  version: string;
  subjectsBySemester: Map<string, Subject[]>;
}

export interface SubjectAssignment {
  _id: string;
  subject: Subject;
  faculty: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class: string;
  section: number;
  assignedBy: string;
  createdAt: string;
}

class SubjectService {
  async getSubjectsByCriteria(params: {
    department?: string;
    year?: number;
    semester?: number;
    batch?: string;
    section?: number;
  }): Promise<Subject[]> {
    try {
      const response = await apiClient.get('/subjects/by-criteria', { params });
      return response.data.subjects || [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch subjects');
      }
      throw new Error('Failed to fetch subjects');
    }
  }

  async addSubject(data: {
    name: string;
    code: string;
    department: string;
    semester: number;
  }): Promise<Subject> {
    try {
      const response = await apiClient.post('/subjects/add', data);
      return response.data.subject;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to add subject');
      }
      throw new Error('Failed to add subject');
    }
  }

  async assignSubject(data: {
    subjectId: string;
    facultyId: string;
    section: number;
    department: string;
    year: number;
    semester: number;
    batch: string;
  }): Promise<SubjectAssignment> {
    try {
      const response = await apiClient.post('/subjects/assign', data);
      return response.data.assignment;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to assign subject');
      }
      throw new Error('Failed to assign subject');
    }
  }

  async deleteSubjectAssignment(assignmentId: string): Promise<void> {
    try {
      await apiClient.delete(`/subjects/assignment/${assignmentId}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to delete assignment');
      }
      throw new Error('Failed to delete assignment');
    }
  }

  async getCurriculum(department: string): Promise<Curriculum> {
    try {
      const response = await apiClient.get('/subjects/curriculum', { params: { department } });
      return response.data.curriculum;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch curriculum');
      }
      throw new Error('Failed to fetch curriculum');
    }
  }

  async getAssignedSubjectsAndFaculties(params: {
    department?: string;
    years?: number[];
  }): Promise<SubjectAssignment[]> {
    try {
      const response = await apiClient.get('/userData/assigned-subjects-faculties', { params });
      return response.data.assignments || [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch assignments');
      }
      throw new Error('Failed to fetch assignments');
    }
  }
}

export const subjectService = new SubjectService(); 
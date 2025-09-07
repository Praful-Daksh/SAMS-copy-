import apiClient from '@/api';
import { TimetableEntry, TimetableMetrics } from '../types/timetable.types';

export interface FetchWeeklyScheduleParams {
  weekId?: string;
  facultyId?: string;
  roomId?: string;
  department?: string;
  year?: number;
  section?: number;
  batch?: string;
  semester?: number;
}

export interface CreateTimetableData {
  timeTable: any[][];
  classDetails: {
    department: string;
    year: number;
    section: number;
    batch?: string;
    semester?: number;
  };
}

export const fetchTimetableMetrics = async (): Promise<TimetableMetrics> => {
  try {
    const response = await apiClient.get('/userData/timetable-metrics');
    return response.data;
  } catch (error) {
    console.error("Error fetching timetable metrics:", error);
    throw error;
  }
};

export const fetchWeeklySchedule = async (params?: FetchWeeklyScheduleParams): Promise<TimetableEntry[]> => {
  try {
    const response = await apiClient.get('/userData/weekly-schedule', { params });
    return response.data.schedule || [];
  } catch (error) {
    console.error("Error fetching timetable data:", error);
    throw error;
  }
};

export type CreateTimetableEntryDto = Omit<TimetableEntry, 'id'>;

export const createTimetableEntry = async (entryData: CreateTimetableData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/userData/createTimeTable', entryData);
    return response.data;
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    throw error;
  }
};

export interface CloneTimetableParams {
  sourceTimetableId: string;
  newTimetableName?: string;
  targetWeekId?: string;
}

export const cloneTimetable = async (params: CloneTimetableParams): Promise<{ success: boolean; newTimetableId?: string; message?: string }> => {
  try {
    const response = await apiClient.post('/userData/clone-timetable', params);
    return response.data;
  } catch (error) {
    console.error("Error cloning timetable:", error);
    throw error;
  }
};

export interface ExportTimetableParams {
  timetableId?: string;
  format: 'csv' | 'pdf' | 'xlsx';
}

export const exportTimetable = async (params: ExportTimetableParams): Promise<Blob> => {
  try {
    const response = await apiClient.get('/userData/export-timetable', {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting timetable:", error);
    throw error;
  }
};

export const checkTimetableExists = async (params: {
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
}> => {
  try {
    const response = await apiClient.get('/userData/checkTimetable', { params });
    return response.data;
  } catch (error) {
    console.error("Error checking timetable existence:", error);
    throw error;
  }
};
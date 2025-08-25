import apiClient from '@/api';
import { LoginCredentials, RegisterData,BaseUserProfile, StudentProfile, FacultyProfile, AdminProfile, HODProfile, GuestProfile } from '@/modules/user-management1/types/auth.types';

class AuthService {

  async login(credentials: LoginCredentials): Promise<{ user: BaseUserProfile; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      return { user, token };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Login failed. Please try again.');
      }
      throw new Error('Login failed. Please try again.');
    }
  }
  
  async register(data: RegisterData): Promise<boolean> {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data.success;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Registration error:', error.response?.data || error);
        throw new Error((error.response as any).data?.message || 'Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  logout(): void {
  }

  async updateProfile(profileData: Partial<StudentProfile | FacultyProfile | AdminProfile | HODProfile | GuestProfile>): Promise<BaseUserProfile> {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return response.data.user;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Profile update failed. Please try again.');
      }
      throw new Error('Profile update failed. Please try again.');
    }
  }

  async updateProfilePhoto(file: File): Promise<BaseUserProfile> {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await apiClient.put('/auth/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.user;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Profile photo update failed. Please try again.');
      }
      throw new Error('Profile photo update failed. Please try again.');
    }
  }

  async deleteProfilePhoto(): Promise<BaseUserProfile> {
    try {
      const response = await apiClient.delete('/auth/profile-photo');
      return response.data.user;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Profile photo update failed. Please try again.');
      }
      throw new Error('Profile photo update failed. Please try again.');
    }
  }

  async getProfile(): Promise<BaseUserProfile> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Failed to fetch profile:', error.response?.data || error);
        throw new Error((error.response as any).data?.message || 'Session expired or invalid.');
      }
      console.error('Failed to fetch profile:', error);
      throw new Error('Session expired or invalid.');
    }
  }

  async fetchUsersByRole(role: string, data: any): Promise<any[]> {
    try {
      if(role === "STUDENT"){
        const params = new URLSearchParams();
        if (data.year) params.append('year', data.year.toString());
        if (data.department) params.append('department', data.department);
        if (data.section) params.append('section', data.section.toString());
        if (data.semester) params.append('semester', data.semester.toString());
        if (data.pending) params.append('pending', data.pending.toString());
        
        const response = await apiClient.get(`/userData/students?${params.toString()}`);
        return response.data.students || [];
      }
      else if (role === 'FACULTY') {
        const response = await apiClient.get('/userData/faculties');
        return response.data.facultyNames || [];
      } else if (role === 'HOD') {
        const response = await apiClient.get('/department/hods');
        return response.data.hods || [];
      } else {
        const response = await apiClient.get(`/users?role=${role}`);
        return response.data.users || [];
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw new Error((error.response as any).data?.message || 'Failed to fetch users');
      }
      throw new Error('Failed to fetch users');
    }
  }
}

export const authService = new AuthService();

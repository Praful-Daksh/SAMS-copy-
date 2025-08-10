import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, BaseUserProfile, LoginCredentials, RegisterData, StudentProfile, FacultyProfile, AdminProfile, HODProfile, GuestProfile } from '@/modules/user-management1/types/auth.types';
import { authService } from '@/modules/user-management1/services/auth.service';
import apiClient from '@/api';
interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (profileData: Partial<StudentProfile | FacultyProfile | AdminProfile | HODProfile | GuestProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateProfilePhoto: (file: File) => Promise<void>;
  deleteProfilePhoto : ()=> Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          // Call the actual service method
          const mockResponse = await authService.login(credentials); // mockResponse name can be changed to apiResponse or similar
          
          set({
            user: mockResponse.user,
            token: mockResponse.token,
            isAuthenticated: true,
            isLoading: false
          });
          localStorage.setItem("authToken",mockResponse.token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${mockResponse.token}`;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          await authService.register(data); 
          localStorage.setItem("redirect","true");
          localStorage.setItem("registeredData",JSON.stringify(data));
    
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          });
        }
      },

      logout: () => {
        authService.logout(); 
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
        localStorage.removeItem("authToken");
      },

      clearError: () => {
        set({ error: null });
      },

      updateProfile: async (profileData: Partial<StudentProfile | FacultyProfile | AdminProfile | HODProfile | GuestProfile>) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedUser = await authService.updateProfile(profileData);
          
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false
          });
        }
      },

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const user = await authService.getProfile();
          
          set({
            user,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch profile',
            isLoading: false
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateProfilePhoto: async (file: File) => {
        try {
          set({ isLoading: true, error: null });
          const updatedUser = await authService.updateProfilePhoto(file);
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update profile photo', isLoading: false });
          throw error;
        }
      },

      deleteProfilePhoto : async()=>{
        try{
          set({isLoading: true, error: null});
          const updatedUser = await authService.deleteProfilePhoto();
          set({user : updatedUser, isLoading: false});
        }catch(error){
          set({error: error instanceof Error ? error.message : 'Failed to delete profile photo', isLoading: false});
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

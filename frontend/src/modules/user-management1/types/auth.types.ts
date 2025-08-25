export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'HOD' | 'GUEST';

export type UserProfile =
  | StudentProfile
  | FacultyProfile
  | AdminProfile
  | HODProfile
  | GuestProfile;

export interface BaseUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  role: UserRole;
  isVerified: boolean;
  is2faEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  profile?: UserProfile;
}

export interface StudentProfile extends BaseUserProfile {
  aparId: string;
  admission_academic_year: string;
  year: number;
  dateOfBirth: string;
  semester: number;
  department: string;
  section: number;
  transport: string;
  busRoute?: string;
  address: string;
  parentPhoneNumber: string;
  batch: string;
}

export interface FacultyProfile extends BaseUserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department: string;
}

export interface AdminProfile extends BaseUserProfile {
  firstName: string;
  lastName: string;
}

export interface HODProfile extends BaseUserProfile {
  firstName: string;
  lastName: string;
}

export interface GuestProfile extends BaseUserProfile {
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  profileData: Partial<StudentProfile | FacultyProfile | AdminProfile | HODProfile | GuestProfile>;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

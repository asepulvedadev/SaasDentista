/**
 * Tipos y interfaces para el sistema de autenticación de la clínica dental
 */

export type UserRole = 'admin' | 'dentist' | 'receptionist'

export interface UserProfile {
  id: string
  clinic_id: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role: UserRole
  clinic_id: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (data: PasswordUpdateData) => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

/**
 * Permisos por rol para el sistema de clínica dental
 */
export interface RolePermissions {
  canManageUsers: boolean
  canManagePatients: boolean
  canManageAppointments: boolean
  canViewReports: boolean
  canManageSettings: boolean
  canAccessBilling: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManagePatients: true,
    canManageAppointments: true,
    canViewReports: true,
    canManageSettings: true,
    canAccessBilling: true,
  },
  dentist: {
    canManageUsers: false,
    canManagePatients: true,
    canManageAppointments: true,
    canViewReports: true,
    canManageSettings: false,
    canAccessBilling: false,
  },
  receptionist: {
    canManageUsers: false,
    canManagePatients: true,
    canManageAppointments: true,
    canViewReports: false,
    canManageSettings: false,
    canAccessBilling: false,
  },
} 
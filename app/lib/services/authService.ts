import { createBrowserClient } from '@/lib/supabase/client'
import type { 
  LoginCredentials, 
  RegisterData, 
  UserProfile, 
  AuthUser,
  PasswordUpdateData 
} from '@/lib/types/auth'
import { isValidEmail, isValidPassword, formatAuthError } from '@/lib/utils'

/**
 * Servicio de autenticación para la clínica dental
 * Maneja todas las operaciones de autenticación con Supabase
 */
export class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Validaciones de entrada
      if (!isValidEmail(credentials.email)) {
        return { user: null, error: 'Email inválido' }
      }

      if (!credentials.password || credentials.password.length < 6) {
        return { user: null, error: 'La contraseña debe tener al menos 6 caracteres' }
      }

      const supabase = createBrowserClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: formatAuthError(error.message) }
      }

      if (!data.user) {
        return { user: null, error: 'Usuario no encontrado' }
      }

      // Obtener el perfil del usuario
      const profile = await this.getUserProfile(data.user.id)
      
      if (!profile) {
        return { user: null, error: 'Perfil de usuario no encontrado' }
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile.role,
        profile,
        isAuthenticated: true,
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Error en login:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(data: RegisterData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Validaciones de entrada
      if (!isValidEmail(data.email)) {
        return { user: null, error: 'Email inválido' }
      }

      if (!isValidPassword(data.password)) {
        return { user: null, error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' }
      }

      if (!data.full_name || data.full_name.trim().length < 2) {
        return { user: null, error: 'El nombre completo es requerido' }
      }

      if (!data.clinic_id) {
        return { user: null, error: 'ID de clínica es requerido' }
      }

      const supabase = createBrowserClient()

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return { user: null, error: formatAuthError(authError.message) }
      }

      if (!authData.user) {
        return { user: null, error: 'Error al crear usuario' }
      }

      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          clinic_id: data.clinic_id,
          full_name: data.full_name,
          role: data.role,
        })

      if (profileError) {
        // Si falla la creación del perfil, eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { user: null, error: 'Error al crear perfil de usuario' }
      }

      // Obtener el perfil creado
      const profile = await this.getUserProfile(authData.user.id)
      
      if (!profile) {
        return { user: null, error: 'Error al obtener perfil de usuario' }
      }

      const authUser: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile.role,
        profile,
        isAuthenticated: true,
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Error en registro:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<{ error: string | null }> {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: formatAuthError(error.message) }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en logout:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      if (!isValidEmail(email)) {
        return { error: 'Email inválido' }
      }

      const supabase = createBrowserClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error: formatAuthError(error.message) }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en reset password:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(data: PasswordUpdateData): Promise<{ error: string | null }> {
    try {
      if (!isValidPassword(data.newPassword)) {
        return { error: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' }
      }

      const supabase = createBrowserClient()
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        return { error: formatAuthError(error.message) }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en update password:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  static async updateProfile(profile: Partial<UserProfile>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { user: null, error: 'Usuario no autenticado' }
      }

      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)

      if (error) {
        return { user: null, error: 'Error al actualizar perfil' }
      }

      // Obtener el perfil actualizado
      const updatedProfile = await this.getUserProfile(user.id)
      
      if (!updatedProfile) {
        return { user: null, error: 'Error al obtener perfil actualizado' }
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        role: updatedProfile.role,
        profile: updatedProfile,
        isAuthenticated: true,
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Error en update profile:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener perfil de usuario por ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data as UserProfile
    } catch (_error) {
      console.error('Error al obtener perfil:', _error)
      return null
    }
  }

  /**
   * Obtener usuario actual autenticado
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = createBrowserClient()
      
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      const profile = await this.getUserProfile(user.id)
      
      if (!profile) {
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        role: profile.role,
        profile,
        isAuthenticated: true,
      }
    } catch (_error) {
      console.error('Error al obtener usuario actual:', _error)
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user !== null
    } catch (error) {
      return false
    }
  }
} 
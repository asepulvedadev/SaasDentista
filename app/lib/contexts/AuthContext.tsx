'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/services/authService'
import type { 
  AuthContextType, 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  PasswordUpdateData,
  UserProfile 
} from '@/lib/types/auth'

/**
 * Contexto de autenticación para manejar el estado global del usuario
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  /**
   * Inicializar el estado de autenticación al cargar la aplicación
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error al inicializar autenticación:', error)
        setError('Error al cargar la sesión del usuario')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    // Solo inicializar en el cliente
    if (typeof window !== 'undefined') {
      initializeAuth()
    } else {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  /**
   * Función para iniciar sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: authUser, error: authError } = await AuthService.login(credentials)
      
      if (authError) {
        setError(authError)
        return
      }

      if (authUser) {
        setUser(authUser)
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para registrar nuevo usuario
   */
  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: authUser, error: authError } = await AuthService.register(data)
      
      if (authError) {
        setError(authError)
        return
      }

      if (authUser) {
        setUser(authUser)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para cerrar sesión
   */
  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: authError } = await AuthService.logout()
      
      if (authError) {
        setError(authError)
        return
      }

      setUser(null)
    } catch (error) {
      console.error('Error en logout:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para restablecer contraseña
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: authError } = await AuthService.resetPassword(email)
      
      if (authError) {
        setError(authError)
        return
      }
    } catch (error) {
      console.error('Error en reset password:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para actualizar contraseña
   */
  const updatePassword = async (data: PasswordUpdateData) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: authError } = await AuthService.updatePassword(data)
      
      if (authError) {
        setError(authError)
        return
      }
    } catch (error) {
      console.error('Error en update password:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para actualizar perfil de usuario
   */
  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user: authUser, error: authError } = await AuthService.updateProfile(profile)
      
      if (authError) {
        setError(authError)
        return
      }

      if (authUser) {
        setUser(authUser)
      }
    } catch (error) {
      console.error('Error en update profile:', error)
      setError('Error interno del servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para limpiar errores
   */
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
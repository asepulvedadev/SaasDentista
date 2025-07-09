'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

/**
 * Componente que protege rutas y maneja la autenticación
 * Evita errores de hidratación al manejar el estado inicial
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles = []
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Evitar errores de hidratación
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mostrar loading mientras se inicializa
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Inicializando aplicación..." />
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario
  if (requireAuth && !user) {
    // Redirigir al login solo en el cliente
    if (isClient) {
      router.push('/login')
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo al login..." />
      </div>
    )
  }

  // Si hay roles específicos permitidos y el usuario no tiene permisos
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    if (isClient) {
      router.push('/dashboard')
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo..." />
      </div>
    )
  }

  // Si no requiere autenticación y hay usuario, redirigir al dashboard
  if (!requireAuth && user) {
    if (isClient) {
      router.push('/dashboard')
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo al dashboard..." />
      </div>
    )
  }

  return <>{children}</>
} 
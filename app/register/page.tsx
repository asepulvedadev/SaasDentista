"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Building, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/contexts/AuthContext'
import { isValidEmail, isValidPassword } from '@/lib/utils'
import { AuthGuard } from '@/components/auth/AuthGuard'
import Link from 'next/link'
import type { UserRole } from '@/lib/types/auth'

/**
 * Contenido de la página de registro
 */
function RegisterContent() {
  const router = useRouter()
  const { register, loading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'receptionist' as UserRole,
    clinic_id: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar errores de validación al escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Limpiar errores del contexto
    if (error) {
      clearError()
    }
  }

  /**
   * Validar formulario antes de enviar
   */
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'El email es requerido'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'El email no es válido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!formData.full_name) {
      errors.full_name = 'El nombre completo es requerido'
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.clinic_id) {
      errors.clinic_id = 'El ID de clínica es requerido'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        clinic_id: formData.clinic_id,
      })
      
      // Redirigir al dashboard después del registro exitoso
      router.push('/dashboard')
    } catch (error) {
      console.error('Error en registro:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Regístrate en el sistema de clínica dental
          </p>
        </div>

        {/* Error del contexto */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nombre Completo"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Juan Pérez"
              leftIcon={<User className="h-4 w-4" />}
              error={validationErrors.full_name}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={validationErrors.email}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="receptionist">Recepcionista</option>
                <option value="dentist">Dentista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <Input
              label="ID de Clínica"
              type="text"
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleInputChange}
              placeholder="UUID de la clínica"
              leftIcon={<Building className="h-4 w-4" />}
              error={validationErrors.clinic_id}
              helperText="Proporcionado por el administrador de la clínica"
              required
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={validationErrors.password}
              helperText="Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
              required
            />

            <Input
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={validationErrors.confirmPassword}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Crear Cuenta
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Página de registro envuelta en AuthGuard
 */
export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <RegisterContent />
    </AuthGuard>
  )
} 
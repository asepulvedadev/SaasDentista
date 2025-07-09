'use client'

import React from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { LogOut, User, Calendar, Users, FileText, Settings, BarChart3 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import Link from 'next/link'

/**
 * Contenido del dashboard para el sistema de clínica dental
 */
function DashboardContent() {
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const roleLabels = {
    admin: 'Administrador',
    dentist: 'Dentista',
    receptionist: 'Recepcionista'
  }

  const menuItems = [
    {
      title: 'Pacientes',
      description: 'Gestionar pacientes y historiales médicos',
      icon: <Users className="h-6 w-6" />,
      href: '/patients',
      color: 'bg-blue-500',
    },
    {
      title: 'Citas',
      description: 'Programar y gestionar citas',
      icon: <Calendar className="h-6 w-6" />,
      href: '/appointments',
      color: 'bg-green-500',
    },
    {
      title: 'Facturas',
      description: 'Gestionar facturación y pagos',
      icon: <FileText className="h-6 w-6" />,
      href: '/invoices',
      color: 'bg-purple-500',
    },
    {
      title: 'Reportes',
      description: 'Ver reportes y estadísticas',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/reports',
      color: 'bg-orange-500',
      restricted: ['admin', 'dentist'],
    },
    {
      title: 'Configuración',
      description: 'Configurar clínica y usuarios',
      icon: <Settings className="h-6 w-6" />,
      href: '/settings',
      color: 'bg-gray-500',
      restricted: ['admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.restricted) return true
    return item.restricted.includes(user!.role)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SaaS Dental
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user!.profile.full_name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {roleLabels[user!.role]}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                loading={loading}
                disabled={loading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenido, {user!.profile.full_name}
            </h2>
            <p className="text-gray-600">
              Sistema de gestión para clínica dental. Selecciona una opción para comenzar.
            </p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className={`${item.color} rounded-lg p-3 text-white`}>
                      {item.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Citas Hoy</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Facturas Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Página de dashboard envuelta en AuthGuard
 */
export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  )
} 
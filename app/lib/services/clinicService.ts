import { createBrowserClient } from '@/lib/supabase/client'
import type { Clinic, ClinicConfigFormData } from '@/lib/types/clinic'

/**
 * Servicio para gestión de configuración de clínica
 */
export class ClinicService {
  /**
   * Obtener información de la clínica actual
   */
  static async getCurrentClinic(): Promise<{ data: Clinic | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener el clinic_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        return { data: null, error: 'Clínica no encontrada' }
      }

      // Obtener información de la clínica
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', profile.clinic_id)
        .single()

      if (error) {
        return { data: null, error: 'Error al obtener información de la clínica' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en getCurrentClinic:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar configuración de la clínica
   */
  static async updateClinicConfig(config: ClinicConfigFormData): Promise<{ data: Clinic | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener el clinic_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        return { data: null, error: 'Clínica no encontrada' }
      }

      // Verificar que el usuario sea admin
      if (profile.role !== 'admin') {
        return { data: null, error: 'No tienes permisos para modificar la configuración' }
      }

      const { data, error } = await supabase
        .from('clinics')
        .update(config)
        .eq('id', profile.clinic_id)
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error al actualizar configuración' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en updateClinicConfig:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Subir logo de la clínica
   */
  static async uploadLogo(file: File): Promise<{ data: string | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener el clinic_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        return { data: null, error: 'Clínica no encontrada' }
      }

      // Verificar que el usuario sea admin
      if (profile.role !== 'admin') {
        return { data: null, error: 'No tienes permisos para subir el logo' }
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        return { data: null, error: 'El archivo debe ser una imagen' }
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return { data: null, error: 'El archivo no puede exceder 2MB' }
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `clinics/${profile.clinic_id}/${fileName}`

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clinic-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        return { data: null, error: 'Error al subir logo' }
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('clinic-assets')
        .getPublicUrl(filePath)

      // Actualizar la clínica con la nueva URL del logo
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', profile.clinic_id)

      if (updateError) {
        // Si falla la actualización, eliminar el archivo subido
        await supabase.storage
          .from('clinic-assets')
          .remove([filePath])
        
        return { data: null, error: 'Error al actualizar logo' }
      }

      return { data: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error en uploadLogo:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Crear una nueva clínica (solo para onboarding)
   */
  static async createClinic(clinicData: { name: string; primary_color?: string }): Promise<{ data: Clinic | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('clinics')
        .insert({
          name: clinicData.name,
          primary_color: clinicData.primary_color || '#3B82F6',
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error al crear clínica' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en createClinic:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener estadísticas generales de la clínica
   */
  static async getClinicStats(): Promise<{ 
    data: { 
      total_patients: number; 
      total_appointments: number; 
      appointments_today: number; 
      pending_invoices: number; 
      total_revenue: number; 
      monthly_revenue: number 
    }; 
    error: string | null 
  }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener el clinic_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Usuario no autenticado' 
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Clínica no encontrada' 
        }
      }

      // Total de pacientes
      const { count: totalPatients, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)

      if (patientsError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Total de citas
      const { count: totalAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)

      if (appointmentsError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Citas del día
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

      const { count: appointmentsToday, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .gte('appointment_datetime', startOfDay)
        .lte('appointment_datetime', endOfDay)
        .eq('status', 'scheduled')

      if (todayError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Facturas pendientes
      const { count: pendingInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'pending')

      if (invoicesError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Ingresos totales
      const { data: totalRevenue, error: totalRevenueError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'paid')

      if (totalRevenueError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Ingresos del mes
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      const { data: monthlyRevenue, error: monthlyError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'paid')
        .gte('created_at', startOfMonth)

      if (monthlyError) {
        return { 
          data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      const total_revenue = totalRevenue?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0
      const monthly_revenue = monthlyRevenue?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0

      return { 
        data: { 
          total_patients: totalPatients || 0, 
          total_appointments: totalAppointments || 0, 
          appointments_today: appointmentsToday || 0, 
          pending_invoices: pendingInvoices || 0, 
          total_revenue, 
          monthly_revenue 
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error en getClinicStats:', error)
      return { 
        data: { total_patients: 0, total_appointments: 0, appointments_today: 0, pending_invoices: 0, total_revenue: 0, monthly_revenue: 0 }, 
        error: 'Error interno del servidor' 
      }
    }
  }
} 
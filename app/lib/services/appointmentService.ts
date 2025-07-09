import { createBrowserClient } from '@/lib/supabase/client'
import type { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  AppointmentFilters 
} from '@/lib/types/clinic'

/**
 * Servicio para gestión de citas
 */
export class AppointmentService {
  /**
   * Obtener todas las citas de la clínica
   */
  static async getAppointments(filters: AppointmentFilters = {}): Promise<{ data: Appointment[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .order('appointment_datetime', { ascending: true })

      // Aplicar filtros
      if (filters.start_date) {
        query = query.gte('appointment_datetime', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('appointment_datetime', filters.end_date)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.patient_id) {
        query = query.eq('patient_id', filters.patient_id)
      }

      if (filters.dentist_id) {
        query = query.eq('dentist_id', filters.dentist_id)
      }

      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error: 'Error al obtener citas' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getAppointments:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener una cita por ID
   */
  static async getAppointment(id: string): Promise<{ data: Appointment | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: 'Cita no encontrada' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en getAppointment:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Crear una nueva cita
   */
  static async createAppointment(appointmentData: CreateAppointmentData): Promise<{ data: Appointment | null; error: string | null }> {
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

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          clinic_id: profile.clinic_id,
          status: 'scheduled',
        })
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .single()

      if (error) {
        return { data: null, error: 'Error al crear cita' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en createAppointment:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar una cita
   */
  static async updateAppointment(id: string, appointmentData: UpdateAppointmentData): Promise<{ data: Appointment | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .single()

      if (error) {
        return { data: null, error: 'Error al actualizar cita' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en updateAppointment:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Eliminar una cita
   */
  static async deleteAppointment(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) {
        return { error: 'Error al eliminar cita' }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en deleteAppointment:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener citas del día
   */
  static async getTodayAppointments(): Promise<{ data: Appointment[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .gte('appointment_datetime', startOfDay)
        .lte('appointment_datetime', endOfDay)
        .eq('status', 'scheduled')
        .order('appointment_datetime')

      if (error) {
        return { data: [], error: 'Error al obtener citas del día' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getTodayAppointments:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener citas por dentista
   */
  static async getAppointmentsByDentist(dentistId: string): Promise<{ data: Appointment[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, email, phone),
          dentist:profiles!appointments_dentist_id_fkey(full_name)
        `)
        .eq('dentist_id', dentistId)
        .order('appointment_datetime')

      if (error) {
        return { data: [], error: 'Error al obtener citas del dentista' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getAppointmentsByDentist:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener estadísticas de citas
   */
  static async getAppointmentStats(): Promise<{ data: { total: number; today: number; pending: number }; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Total de citas
      const { count: total, error: totalError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        return { data: { total: 0, today: 0, pending: 0 }, error: 'Error al obtener estadísticas' }
      }

      // Citas del día
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_datetime', startOfDay)
        .lte('appointment_datetime', endOfDay)

      if (todayError) {
        return { data: { total: 0, today: 0, pending: 0 }, error: 'Error al obtener estadísticas' }
      }

      // Citas pendientes
      const { count: pending, error: pendingError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled')

      if (pendingError) {
        return { data: { total: 0, today: 0, pending: 0 }, error: 'Error al obtener estadísticas' }
      }

      return { 
        data: { 
          total: total || 0, 
          today: todayCount || 0, 
          pending: pending || 0 
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error en getAppointmentStats:', error)
      return { data: { total: 0, today: 0, pending: 0 }, error: 'Error interno del servidor' }
    }
  }
} 
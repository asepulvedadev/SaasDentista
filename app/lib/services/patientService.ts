import { createBrowserClient } from '@/lib/supabase/client'
import type { 
  Patient, 
  CreatePatientData, 
  UpdatePatientData, 
  PatientFilters 
} from '@/lib/types/clinic'

/**
 * Servicio para gestión de pacientes
 */
export class PatientService {
  /**
   * Obtener todos los pacientes de la clínica
   */
  static async getPatients(filters: PatientFilters = {}): Promise<{ data: Patient[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`)
      }

      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error: 'Error al obtener pacientes' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getPatients:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener un paciente por ID
   */
  static async getPatient(id: string): Promise<{ data: Patient | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: 'Paciente no encontrado' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en getPatient:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Crear un nuevo paciente
   */
  static async createPatient(patientData: CreatePatientData): Promise<{ data: Patient | null; error: string | null }> {
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
        .from('patients')
        .insert({
          ...patientData,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error al crear paciente' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en createPatient:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar un paciente
   */
  static async updatePatient(id: string, patientData: UpdatePatientData): Promise<{ data: Patient | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error al actualizar paciente' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en updatePatient:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Eliminar un paciente
   */
  static async deletePatient(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) {
        return { error: 'Error al eliminar paciente' }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en deletePatient:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Buscar pacientes por nombre
   */
  static async searchPatients(searchTerm: string): Promise<{ data: Patient[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('full_name', `%${searchTerm}%`)
        .order('full_name')

      if (error) {
        return { data: [], error: 'Error al buscar pacientes' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en searchPatients:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener estadísticas de pacientes
   */
  static async getPatientStats(): Promise<{ data: { total: number }; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      if (error) {
        return { data: { total: 0 }, error: 'Error al obtener estadísticas' }
      }

      return { data: { total: count || 0 }, error: null }
    } catch (error) {
      console.error('Error en getPatientStats:', error)
      return { data: { total: 0 }, error: 'Error interno del servidor' }
    }
  }
} 
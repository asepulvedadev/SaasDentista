import { createBrowserClient } from '@/lib/supabase/client'
import type { 
  Invoice, 
  CreateInvoiceData, 
  UpdateInvoiceData, 
  InvoiceFilters 
} from '@/lib/types/clinic'

/**
 * Servicio para gestión de facturas
 */
export class InvoiceService {
  /**
   * Obtener todas las facturas de la clínica
   */
  static async getInvoices(filters: InvoiceFilters = {}): Promise<{ data: Invoice[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.patient_id) {
        query = query.eq('patient_id', filters.patient_id)
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error: 'Error al obtener facturas' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getInvoices:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener una factura por ID
   */
  static async getInvoice(id: string): Promise<{ data: Invoice | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: 'Factura no encontrada' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en getInvoice:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Crear una nueva factura
   */
  static async createInvoice(invoiceData: CreateInvoiceData): Promise<{ data: Invoice | null; error: string | null }> {
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
        .from('invoices')
        .insert({
          ...invoiceData,
          clinic_id: profile.clinic_id,
          status: 'pending',
        })
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .single()

      if (error) {
        return { data: null, error: 'Error al crear factura' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en createInvoice:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Actualizar una factura
   */
  static async updateInvoice(id: string, invoiceData: UpdateInvoiceData): Promise<{ data: Invoice | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .single()

      if (error) {
        return { data: null, error: 'Error al actualizar factura' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en updateInvoice:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Eliminar una factura
   */
  static async deleteInvoice(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) {
        return { error: 'Error al eliminar factura' }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en deleteInvoice:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Marcar factura como pagada
   */
  static async markAsPaid(id: string): Promise<{ data: Invoice | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', id)
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .single()

      if (error) {
        return { data: null, error: 'Error al marcar factura como pagada' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en markAsPaid:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener facturas pendientes
   */
  static async getPendingInvoices(): Promise<{ data: Invoice[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })

      if (error) {
        return { data: [], error: 'Error al obtener facturas pendientes' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getPendingInvoices:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener facturas por paciente
   */
  static async getInvoicesByPatient(patientId: string): Promise<{ data: Invoice[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(full_name, email, phone)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: [], error: 'Error al obtener facturas del paciente' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getInvoicesByPatient:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener estadísticas de facturas
   */
  static async getInvoiceStats(): Promise<{ 
    data: { 
      total: number; 
      pending: number; 
      paid: number; 
      total_revenue: number; 
      pending_revenue: number 
    }; 
    error: string | null 
  }> {
    try {
      const supabase = createBrowserClient()
      
      // Total de facturas
      const { count: total, error: totalError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        return { 
          data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Facturas pendientes
      const { count: pending, error: pendingError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (pendingError) {
        return { 
          data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Facturas pagadas
      const { count: paid, error: paidError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid')

      if (paidError) {
        return { 
          data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Ingresos totales
      const { data: totalRevenue, error: totalRevenueError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')

      if (totalRevenueError) {
        return { 
          data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      // Ingresos pendientes
      const { data: pendingRevenue, error: pendingRevenueError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'pending')

      if (pendingRevenueError) {
        return { 
          data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
          error: 'Error al obtener estadísticas' 
        }
      }

      const total_revenue = totalRevenue?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0
      const pending_revenue = pendingRevenue?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0

      return { 
        data: { 
          total: total || 0, 
          pending: pending || 0, 
          paid: paid || 0, 
          total_revenue, 
          pending_revenue 
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error en getInvoiceStats:', error)
      return { 
        data: { total: 0, pending: 0, paid: 0, total_revenue: 0, pending_revenue: 0 }, 
        error: 'Error interno del servidor' 
      }
    }
  }
} 
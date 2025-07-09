/**
 * Tipos para las entidades principales del sistema de clínica dental
 */

export interface Clinic {
  id: string
  name: string
  logo_url?: string
  primary_color?: string
  created_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  dob?: string
  phone?: string
  email?: string
  medical_history?: Record<string, unknown>
  created_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  dentist_id: string
  appointment_datetime: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  patient?: Patient
  dentist?: {
    id: string
    full_name: string
  }
}

export interface Invoice {
  id: string
  clinic_id: string
  patient_id: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
  due_date?: string
  created_at: string
  patient?: Patient
}

export interface PatientFile {
  id: string
  clinic_id: string
  patient_id: string
  file_url: string
  file_type: string
  file_name: string
  uploaded_at: string
  patient?: Patient
}

// Tipos para formularios
export interface CreatePatientData {
  full_name: string
  dob?: string
  phone?: string
  email?: string
  medical_history?: Record<string, unknown>
}

export type UpdatePatientData = Partial<CreatePatientData>

export interface CreateAppointmentData {
  patient_id: string
  dentist_id: string
  appointment_datetime: string
  notes?: string
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: 'scheduled' | 'completed' | 'cancelled'
}

export interface CreateInvoiceData {
  patient_id: string
  amount: number
  due_date?: string
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'paid' | 'pending' | 'cancelled'
}

// Tipos para filtros y búsquedas
export interface PatientFilters {
  search?: string
  page?: number
  limit?: number
}

export interface AppointmentFilters {
  start_date?: string
  end_date?: string
  status?: string
  patient_id?: string
  dentist_id?: string
  page?: number
  limit?: number
}

export interface InvoiceFilters {
  status?: string
  patient_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

// Tipos para estadísticas
export interface ClinicStats {
  total_patients: number
  total_appointments: number
  appointments_today: number
  pending_invoices: number
  total_revenue: number
  monthly_revenue: number
}

// Tipos para configuración de clínica
export interface ClinicConfigFormData {
  name: string
  primary_color?: string
  logo_url?: string
} 
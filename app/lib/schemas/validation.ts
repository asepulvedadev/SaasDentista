import { z } from 'zod'

/**
 * Esquemas de validación con Zod para el sistema de clínica dental
 */

// Esquema para pacientes
export const patientSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  dob: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  medical_history: z.any().optional(),
})

// Esquema para citas
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  dentist_id: z.string().uuid('ID de dentista inválido'),
  appointment_datetime: z.string()
    .min(1, 'La fecha y hora de la cita es requerida'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
})

// Esquema para actualizar citas
export const updateAppointmentSchema = appointmentSchema.partial().extend({
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

// Esquema para facturas
export const invoiceSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  amount: z.number()
    .positive('El monto debe ser positivo')
    .min(0.01, 'El monto debe ser mayor a 0'),
  due_date: z.string().optional(),
})

// Esquema para actualizar facturas
export const updateInvoiceSchema = invoiceSchema.partial().extend({
  status: z.enum(['paid', 'pending', 'cancelled']).optional(),
})

// Esquema para archivos de pacientes
export const patientFileSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  file_type: z.string().min(1, 'El tipo de archivo es requerido'),
  file_name: z.string().min(1, 'El nombre del archivo es requerido'),
})

// Esquema para configuración de clínica
export const clinicConfigSchema = z.object({
  name: z.string()
    .min(2, 'El nombre de la clínica debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  primary_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato hexadecimal)')
    .optional(),
})

// Esquemas para filtros
export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const appointmentFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  patient_id: z.string().uuid().optional(),
  dentist_id: z.string().uuid().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const invoiceFiltersSchema = z.object({
  status: z.enum(['paid', 'pending', 'cancelled']).optional(),
  patient_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// Tipos derivados de los esquemas
export type PatientFormData = z.infer<typeof patientSchema>
export type AppointmentFormData = z.infer<typeof appointmentSchema>
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
export type PatientFileFormData = z.infer<typeof patientFileSchema>
export type ClinicConfigFormData = z.infer<typeof clinicConfigSchema>
export type PatientFiltersFormData = z.infer<typeof patientFiltersSchema>
export type AppointmentFiltersFormData = z.infer<typeof appointmentFiltersSchema>
export type InvoiceFiltersFormData = z.infer<typeof invoiceFiltersSchema> 
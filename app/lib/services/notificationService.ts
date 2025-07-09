import { Resend } from 'resend'
import type { Appointment, Patient } from '@/lib/types/clinic'

/**
 * Servicio para envío de notificaciones
 */
export class NotificationService {
  private static resend = new Resend(process.env.RESEND_API_KEY)

  /**
   * Enviar recordatorio de cita por email
   */
  static async sendAppointmentReminder(
    appointment: Appointment,
    patient: Patient
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!patient.email) {
        return { success: false, error: 'El paciente no tiene email registrado' }
      }

      const appointmentDate = new Date(appointment.appointment_datetime)
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const { data, error } = await this.resend.emails.send({
        from: 'SaaS Dental <noreply@saasdental.com>',
        to: [patient.email],
        subject: `Recordatorio de cita - ${formattedDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Recordatorio de Cita Dental</h2>
            <p>Hola ${patient.full_name},</p>
            <p>Te recordamos que tienes una cita programada para:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
              <p><strong>Dentista:</strong> ${appointment.dentist?.full_name || 'Por asignar'}</p>
              ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
            </div>
            <p>Por favor, llega 10 minutos antes de tu cita.</p>
            <p>Si necesitas reprogramar o cancelar tu cita, contacta con nosotros lo antes posible.</p>
            <p>Saludos,<br>Equipo de SaaS Dental</p>
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email:', error)
        return { success: false, error: 'Error al enviar recordatorio' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error en sendAppointmentReminder:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Enviar confirmación de cita por email
   */
  static async sendAppointmentConfirmation(
    appointment: Appointment,
    patient: Patient
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!patient.email) {
        return { success: false, error: 'El paciente no tiene email registrado' }
      }

      const appointmentDate = new Date(appointment.appointment_datetime)
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const { data, error } = await this.resend.emails.send({
        from: 'SaaS Dental <noreply@saasdental.com>',
        to: [patient.email],
        subject: `Cita confirmada - ${formattedDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Cita Confirmada</h2>
            <p>Hola ${patient.full_name},</p>
            <p>Tu cita ha sido confirmada exitosamente:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
              <p><strong>Dentista:</strong> ${appointment.dentist?.full_name || 'Por asignar'}</p>
              ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
            </div>
            <p>Te enviaremos un recordatorio 24 horas antes de tu cita.</p>
            <p>Saludos,<br>Equipo de SaaS Dental</p>
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email:', error)
        return { success: false, error: 'Error al enviar confirmación' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error en sendAppointmentConfirmation:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Enviar notificación de cancelación de cita
   */
  static async sendAppointmentCancellation(
    appointment: Appointment,
    patient: Patient
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!patient.email) {
        return { success: false, error: 'El paciente no tiene email registrado' }
      }

      const appointmentDate = new Date(appointment.appointment_datetime)
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const { data, error } = await this.resend.emails.send({
        from: 'SaaS Dental <noreply@saasdental.com>',
        to: [patient.email],
        subject: `Cita cancelada - ${formattedDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EF4444;">Cita Cancelada</h2>
            <p>Hola ${patient.full_name},</p>
            <p>Tu cita ha sido cancelada:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
              <p><strong>Dentista:</strong> ${appointment.dentist?.full_name || 'Por asignar'}</p>
            </div>
            <p>Para reprogramar tu cita, contacta con nosotros.</p>
            <p>Saludos,<br>Equipo de SaaS Dental</p>
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email:', error)
        return { success: false, error: 'Error al enviar notificación de cancelación' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error en sendAppointmentCancellation:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Enviar factura por email
   */
  static async sendInvoice(
    invoice: any,
    patient: Patient
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!patient.email) {
        return { success: false, error: 'El paciente no tiene email registrado' }
      }

      const { data, error } = await this.resend.emails.send({
        from: 'SaaS Dental <noreply@saasdental.com>',
        to: [patient.email],
        subject: `Factura #${invoice.id.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Factura Dental</h2>
            <p>Hola ${patient.full_name},</p>
            <p>Adjunto encontrarás tu factura:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Número de factura:</strong> #${invoice.id.slice(0, 8)}</p>
              <p><strong>Monto:</strong> $${invoice.amount.toFixed(2)}</p>
              <p><strong>Estado:</strong> ${invoice.status}</p>
              ${invoice.due_date ? `<p><strong>Fecha de vencimiento:</strong> ${new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>` : ''}
            </div>
            <p>Para cualquier consulta sobre esta factura, no dudes en contactarnos.</p>
            <p>Saludos,<br>Equipo de SaaS Dental</p>
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email:', error)
        return { success: false, error: 'Error al enviar factura' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error en sendInvoice:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Enviar recordatorio de factura pendiente
   */
  static async sendInvoiceReminder(
    invoice: any,
    patient: Patient
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!patient.email) {
        return { success: false, error: 'El paciente no tiene email registrado' }
      }

      const { data, error } = await this.resend.emails.send({
        from: 'SaaS Dental <noreply@saasdental.com>',
        to: [patient.email],
        subject: `Recordatorio de factura pendiente #${invoice.id.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Recordatorio de Factura Pendiente</h2>
            <p>Hola ${patient.full_name},</p>
            <p>Tienes una factura pendiente de pago:</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Número de factura:</strong> #${invoice.id.slice(0, 8)}</p>
              <p><strong>Monto:</strong> $${invoice.amount.toFixed(2)}</p>
              ${invoice.due_date ? `<p><strong>Fecha de vencimiento:</strong> ${new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>` : ''}
            </div>
            <p>Por favor, realiza el pago lo antes posible para evitar cargos adicionales.</p>
            <p>Saludos,<br>Equipo de SaaS Dental</p>
          </div>
        `
      })

      if (error) {
        console.error('Error al enviar email:', error)
        return { success: false, error: 'Error al enviar recordatorio' }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error en sendInvoiceReminder:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }
} 
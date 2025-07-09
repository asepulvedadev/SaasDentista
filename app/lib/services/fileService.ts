import { createBrowserClient } from '@/lib/supabase/client'
import type { PatientFile } from '@/lib/types/clinic'

/**
 * Servicio para gestión de archivos de pacientes
 */
export class FileService {
  /**
   * Obtener todos los archivos de un paciente
   */
  static async getPatientFiles(patientId: string): Promise<{ data: PatientFile[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data, error } = await supabase
        .from('patient_files')
        .select(`
          *,
          patient:patients(full_name)
        `)
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        return { data: [], error: 'Error al obtener archivos' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getPatientFiles:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener todos los archivos con filtros opcionales
   */
  static async getFiles(filters: { patient_id?: string; file_type?: string } = {}): Promise<{ data: PatientFile[]; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener el clinic_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: [], error: 'Usuario no autenticado' }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        return { data: [], error: 'Clínica no encontrada' }
      }

      let query = supabase
        .from('patient_files')
        .select(`
          *,
          patient:patients(full_name)
        `)
        .eq('clinic_id', profile.clinic_id)
        .order('uploaded_at', { ascending: false })

      // Aplicar filtros
      if (filters.patient_id) {
        query = query.eq('patient_id', filters.patient_id)
      }

      if (filters.file_type) {
        query = query.eq('file_type', filters.file_type)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error: 'Error al obtener archivos' }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error en getFiles:', error)
      return { data: [], error: 'Error interno del servidor' }
    }
  }

  /**
   * Subir un archivo para un paciente
   */
  static async uploadFile(
    patientId: string, 
    file: File, 
    fileType: string
  ): Promise<{ data: PatientFile | null; error: string | null }> {
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

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `clinics/${profile.clinic_id}/patients/${patientId}/${fileName}`

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return { data: null, error: 'Error al subir archivo' }
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(filePath)

      // Guardar referencia en la base de datos
      const { data, error } = await supabase
        .from('patient_files')
        .insert({
          clinic_id: profile.clinic_id,
          patient_id: patientId,
          file_url: urlData.publicUrl,
          file_type: fileType,
          file_name: file.name,
        })
        .select(`
          *,
          patient:patients(full_name)
        `)
        .single()

      if (error) {
        // Si falla la inserción, eliminar el archivo subido
        await supabase.storage
          .from('patient-files')
          .remove([filePath])
        
        return { data: null, error: 'Error al guardar referencia del archivo' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en uploadFile:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Eliminar un archivo
   */
  static async deleteFile(fileId: string): Promise<{ error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      // Obtener información del archivo
      const { data: file, error: fetchError } = await supabase
        .from('patient_files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError || !file) {
        return { error: 'Archivo no encontrado' }
      }

      // Extraer la ruta del archivo de la URL
      const url = new URL(file.file_url)
      const filePath = url.pathname.split('/').slice(-4).join('/') // clinics/clinic_id/patients/patient_id/filename

      // Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('patient-files')
        .remove([filePath])

      if (storageError) {
        console.error('Error al eliminar archivo de storage:', storageError)
      }

      // Eliminar referencia de la base de datos
      const { error } = await supabase
        .from('patient_files')
        .delete()
        .eq('id', fileId)

      if (error) {
        return { error: 'Error al eliminar archivo' }
      }

      return { error: null }
    } catch (error) {
      console.error('Error en deleteFile:', error)
      return { error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener URL de descarga de un archivo
   */
  static async getDownloadUrl(fileId: string): Promise<{ data: string | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { data: file, error } = await supabase
        .from('patient_files')
        .select('file_url')
        .eq('id', fileId)
        .single()

      if (error || !file) {
        return { data: null, error: 'Archivo no encontrado' }
      }

      return { data: file.file_url, error: null }
    } catch (error) {
      console.error('Error en getDownloadUrl:', error)
      return { data: null, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener estadísticas de archivos
   */
  static async getFileStats(): Promise<{ data: { total: number }; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      
      const { count, error } = await supabase
        .from('patient_files')
        .select('*', { count: 'exact', head: true })

      if (error) {
        return { data: { total: 0 }, error: 'Error al obtener estadísticas' }
      }

      return { data: { total: count || 0 }, error: null }
    } catch (error) {
      console.error('Error en getFileStats:', error)
      return { data: { total: 0 }, error: 'Error interno del servidor' }
    }
  }

  /**
   * Validar tipo de archivo
   */
  static isValidFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    return allowedTypes.includes(file.type)
  }

  /**
   * Validar tamaño de archivo (máximo 10MB)
   */
  static isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return file.size <= maxSize
  }
} 
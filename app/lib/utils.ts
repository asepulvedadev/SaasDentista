import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Función utilitaria para combinar clases de Tailwind CSS
 * Combina clsx y tailwind-merge para manejar conflictos de clases
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validación de email con regex robusto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validación de contraseña segura para clínica dental
 * Requiere: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Sanitización básica de strings para prevenir XSS
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '')
}

/**
 * Formateo de errores de Supabase para mostrar al usuario
 */
export function formatAuthError(error: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
    'Email not confirmed': 'Email no confirmado. Por favor, verifica tu correo electrónico',
    'User already registered': 'El usuario ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Unable to validate email address': 'No se pudo validar la dirección de email',
    'Signup is disabled': 'El registro está deshabilitado',
    'Too many requests': 'Demasiadas solicitudes. Intenta de nuevo más tarde'
  }
  
  return errorMessages[error] || 'Ha ocurrido un error. Intenta de nuevo'
} 
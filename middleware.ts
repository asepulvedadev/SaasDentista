
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware para manejar autenticación y protección de rutas
 * Basado en el esquema de clínica dental SaaS
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Obtener la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/auth/callback', '/auth/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Rutas de autenticación que redirigen si ya estás autenticado
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Si es una ruta de autenticación y el usuario está autenticado, redirigir al dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Si el usuario está en la página principal y está autenticado, redirigir al dashboard
  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Si no es una ruta pública y el usuario no está autenticado, redirigir al login
  if (!isPublicRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado, verificar permisos para rutas específicas
  if (session && !isPublicRoute) {
    // Obtener el perfil del usuario para verificar roles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      // Rutas que requieren rol de admin
      const adminRoutes = ['/admin', '/settings', '/users']
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
      
      if (isAdminRoute && profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Rutas que requieren rol de dentista o admin
      const dentistRoutes = ['/reports', '/analytics']
      const isDentistRoute = dentistRoutes.some(route => pathname.startsWith(route))
      
      if (isDentistRoute && !['admin', 'dentist'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return res
}

/**
 * Configurar en qué rutas se ejecuta el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

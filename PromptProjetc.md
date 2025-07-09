# 🦷 SaaS Clínicas Dentales — Prompt Inicial para LLM

## 🎯 Idea
Desarrollar un SaaS multi-tenant para clínicas dentales usando Next.js, Supabase y TailwindCSS, desplegado en Vercel.  
Cada clínica tiene su propia base de datos lógica aislada por `clinic_id`, autenticación con Supabase Auth y personalización de marca.

## ✅ Funcionalidades básicas del MVP
- Registro/Login de usuarios con roles (`admin`, `dentist`, `receptionist`).
- Gestión de pacientes (CRUD).
- Gestión de citas (CRUD, calendario, recordatorios).
- Facturación básica.
- Carga de archivos clínicos.
- Personalización: logo y colores por clínica.
- Notificaciones vía Resend (correos de cita).

## 🗃️ Base de datos
- Usa el esquema definido en `schema.sql`.
- RLS activo en todas las tablas.
- Mantén la integridad de `clinic_id` en todas las operaciones.

## 📌 Lineamientos técnicos
- Frontend: Next.js + TailwindCSS.
- Backend: API Routes de Next.js, Supabase como backend principal.
- Storage: Supabase Storage para archivos clínicos.
- Despliegue: Vercel.
- Emails/SMS: Resend.
- Dominio: Opcional subdominios por clínica o rutas por clínica.

## ⚙️ Tareas sugeridas para LLM
- Generar scaffolding de CRUD para pacientes, citas, facturas.
- Generar middleware para validar `clinic_id` y rol.
- Crear funciones de onboarding de clínica nueva.
- Automatizar templates de correo para Resend.
- Documentar endpoints.

## 🧩 Notas importantes
- Usa `supabase-js` para conexión.
- Aplica los RLS a nivel consulta.
- Respetar seguridad de datos médicos.
- Preparar para escalar módulos (odontograma interactivo futuro).


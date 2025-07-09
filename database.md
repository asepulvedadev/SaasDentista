# 📚 DATABASE.md — SaaS Clínicas Dentales

## 🎯 Propósito
Esta base de datos es para un SaaS multi-tenant para clínicas dentales. Cada clínica tiene sus propios usuarios y datos.  
El `clinic_id` conecta todos los módulos, asegurando aislamiento y personalización.

---

## 🗃️ Tablas principales

### ✅ `clinics`
- `id`: UUID único para cada clínica.
- `name`: Nombre de la clínica.
- `logo_url`: Logo (almacenado en Supabase Storage).
- `primary_color`: Color de marca.
- `created_at`: Timestamp.

### ✅ `profiles`
- `id`: UUID de usuario (vinculado con Supabase Auth).
- `clinic_id`: Clínica a la que pertenece.
- `full_name`: Nombre completo.
- `role`: Rol de acceso (`admin`, `dentist`, `receptionist`).
- `created_at`: Timestamp.

### ✅ `patients`
- `id`: UUID único del paciente.
- `clinic_id`: Clínica propietaria.
- `full_name`: Nombre completo.
- `dob`: Fecha de nacimiento.
- `phone`: Teléfono.
- `email`: Correo.
- `medical_history`: JSONB con historial.
- `created_at`: Timestamp.

### ✅ `appointments`
- `id`: UUID único.
- `clinic_id`: Clínica propietaria.
- `patient_id`: Relación con paciente.
- `dentist_id`: Relación con usuario dentista.
- `appointment_datetime`: Fecha y hora.
- `status`: Estado (`scheduled`, `completed`, `cancelled`).
- `notes`: Notas clínicas.
- `created_at`: Timestamp.

### ✅ `invoices`
- `id`: UUID único.
- `clinic_id`: Clínica propietaria.
- `patient_id`: Paciente relacionado.
- `amount`: Total a pagar.
- `status`: Estado (`paid`, `pending`, `cancelled`).
- `due_date`: Fecha de vencimiento.
- `created_at`: Timestamp.

### ✅ `patient_files`
- `id`: UUID único.
- `clinic_id`: Clínica propietaria.
- `patient_id`: Paciente relacionado.
- `file_url`: URL en Supabase Storage.
- `file_type`: Tipo (radiografía, consentimiento).
- `uploaded_at`: Timestamp.

---

## 🔐 Seguridad RLS

- **Row Level Security (RLS)** está activo en todas las tablas.
- Cada consulta filtra datos por `clinic_id` basado en el usuario autenticado.
- Los usuarios solo pueden crear/leer registros de su clínica.
- `profiles` se vincula con `auth.users` para mantener roles y relaciones.

---

## 🏷️ Convenciones

- Usa UUID como claves primarias.
- Usa `created_at` para auditoría.
- Usa enums controlados para estados (`status`).
- Datos sensibles como archivos médicos se guardan en Supabase Storage y se referencian por URL.

---

## 🚀 Notas para agentes LLM

- Mantener la relación `clinic_id` coherente.
- Respetar RLS en consultas SQL y Supabase Client.
- Usar `supabase-js` para toda la comunicación.
- Revisar políticas de inserción y selección al crear endpoints.

---


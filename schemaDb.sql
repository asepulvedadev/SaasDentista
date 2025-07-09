-- ================================
-- SCHEMA SQL PARA CLÍNICA DENTAL SAAS
-- ================================

-- Tabla de clínicas
create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  primary_color text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabla de usuarios: manejado por Supabase Auth
-- Extensión para roles y relación con clínica
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  clinic_id uuid references clinics(id),
  full_name text,
  role text check (role in ('admin', 'dentist', 'receptionist')),
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabla de pacientes
create table patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id),
  full_name text not null,
  dob date,
  phone text,
  email text,
  medical_history jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabla de citas
create table appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id),
  patient_id uuid references patients(id),
  dentist_id uuid references profiles(id),
  appointment_datetime timestamp with time zone,
  status text check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabla de facturas
create table invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id),
  patient_id uuid references patients(id),
  amount numeric(10,2),
  status text check (status in ('paid', 'pending', 'cancelled')),
  due_date date,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabla de archivos (radiografías, consentimientos)
create table patient_files (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id),
  patient_id uuid references patients(id),
  file_url text,
  file_type text,
  uploaded_at timestamp with time zone default timezone('utc', now())
);

-- ================================
-- Row Level Security (RLS)
-- ================================

-- Habilitar RLS
alter table clinics enable row level security;
alter table profiles enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table invoices enable row level security;
alter table patient_files enable row level security;

-- Políticas: cada registro solo visible si coincide el clinic_id
create policy "Clinic isolation for clinics"
on clinics for select using (true);

create policy "Clinic isolation for profiles"
on profiles for select using (auth.uid() = id);

create policy "Clinic isolation for patients"
on patients for select using (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Clinic isolation for appointments"
on appointments for select using (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Clinic isolation for invoices"
on invoices for select using (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Clinic isolation for patient_files"
on patient_files for select using (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

-- Permitir insertar registros
create policy "Allow insert profiles"
on profiles for insert with check (auth.uid() = id);

create policy "Allow insert for patients"
on patients for insert with check (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Allow insert for appointments"
on appointments for insert with check (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Allow insert for invoices"
on invoices for insert with check (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

create policy "Allow insert for patient_files"
on patient_files for insert with check (
  clinic_id = (select clinic_id from profiles where id = auth.uid())
);

-- ================================
-- Fin del esquema
-- ================================

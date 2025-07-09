export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone_number: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

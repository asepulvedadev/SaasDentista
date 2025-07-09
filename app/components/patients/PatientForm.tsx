"use client"

import React, { useState, useEffect } from 'react';
import { Patient, CreatePatientData } from '../../lib/types/clinic';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PatientFormProps {
  patient?: Patient | null; // Opcional, para edición
  onSubmit: (data: CreatePatientData | Partial<CreatePatientData>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreatePatientData | Partial<CreatePatientData>>({
    full_name: '',
    dob: '',
    phone: '',
    email: '',
    medical_history: {},
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        dob: patient.dob || '',
        phone: patient.phone || '',
        email: patient.email || '',
        medical_history: patient.medical_history || {},
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreatePatientData | Partial<CreatePatientData>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
        <Input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
        <Input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full"
        />
      </div>
      {/* Medical History can be a more complex component */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {patient ? 'Actualizar' : 'Crear'} Paciente
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;

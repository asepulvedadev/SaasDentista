"use client"

import React, { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentData, Patient } from '../../lib/types/clinic';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  patients: Patient[];
  onSubmit: (data: CreateAppointmentData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  patients,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    patient_id: '',
    dentist_id: '',
    appointment_datetime: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id,
        dentist_id: appointment.dentist_id,
        appointment_datetime: appointment.appointment_datetime.slice(0, 16), // Format for datetime-local input
        notes: appointment.notes || '',
      });
    }
  }, [appointment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patient_id) {
      errors.patient_id = 'Selecciona un paciente';
    }

    if (!formData.dentist_id) {
      errors.dentist_id = 'Selecciona un dentista';
    }

    if (!formData.appointment_datetime) {
      errors.appointment_datetime = 'Selecciona fecha y hora';
    } else {
      const selectedDate = new Date(formData.appointment_datetime);
      const now = new Date();
      if (selectedDate < now) {
        errors.appointment_datetime = 'La fecha no puede ser en el pasado';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Mock dentists - en un sistema real esto vendría de la base de datos
  const dentists = [
    { id: 'dentist-1', full_name: 'Dr. Juan Pérez' },
    { id: 'dentist-2', full_name: 'Dra. María García' },
    { id: 'dentist-3', full_name: 'Dr. Carlos López' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">
        {appointment ? 'Editar Cita' : 'Nueva Cita'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">
              Paciente *
            </label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.patient_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
            {validationErrors.patient_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.patient_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="dentist_id" className="block text-sm font-medium text-gray-700 mb-1">
              Dentista *
            </label>
            <select
              id="dentist_id"
              name="dentist_id"
              value={formData.dentist_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.dentist_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un dentista</option>
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>
                  {dentist.full_name}
                </option>
              ))}
            </select>
            {validationErrors.dentist_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.dentist_id}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="appointment_datetime" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora *
          </label>
          <Input
            type="datetime-local"
            id="appointment_datetime"
            name="appointment_datetime"
            value={formData.appointment_datetime}
            onChange={handleChange}
            className={validationErrors.appointment_datetime ? 'border-red-500' : ''}
          />
          {validationErrors.appointment_datetime && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.appointment_datetime}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre la cita..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            loading={loading}
          >
            {appointment ? 'Actualizar' : 'Crear'} Cita
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm; 
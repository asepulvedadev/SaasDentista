"use client"

import React, { useState, useEffect } from 'react';
import { Invoice, CreateInvoiceData, Patient } from '../../lib/types/clinic';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  patients: Patient[];
  onSubmit: (data: CreateInvoiceData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  patients,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateInvoiceData>({
    patient_id: '',
    amount: 0,
    due_date: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        patient_id: invoice.patient_id,
        amount: invoice.amount,
        due_date: invoice.due_date || '',
      });
    }
  }, [invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
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

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.due_date = 'La fecha de vencimiento no puede ser en el pasado';
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">
        {invoice ? 'Editar Factura' : 'Nueva Factura'}
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
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto (USD) *
            </label>
            <Input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={validationErrors.amount ? 'border-red-500' : ''}
              placeholder="0.00"
            />
            {validationErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vencimiento
          </label>
          <Input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={validationErrors.due_date ? 'border-red-500' : ''}
          />
          {validationErrors.due_date && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.due_date}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Opcional. Si no se especifica, la factura no tendrá fecha de vencimiento.
          </p>
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
            {invoice ? 'Actualizar' : 'Crear'} Factura
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm; 
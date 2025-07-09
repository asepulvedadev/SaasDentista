"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { InvoiceService } from '../../lib/services/invoiceService';
import { PatientService } from '../../lib/services/patientService';
import { Invoice, CreateInvoiceData, Patient } from '../../lib/types/clinic';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import InvoiceForm from '../../components/invoices/InvoiceForm';

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    patient_id: '',
  });

  const fetchInvoices = useCallback(async () => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: fetchedInvoices, error } = await InvoiceService.getInvoices(filters);
      if (error) {
        setError(error);
      } else {
        setInvoices(fetchedInvoices);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const fetchPatients = useCallback(async () => {
    if (!user?.profile?.clinic_id) return;
    try {
      const { data: fetchedPatients, error } = await PatientService.getPatients();
      if (!error) {
        setPatients(fetchedPatients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAddInvoiceClick = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoiceClick = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      try {
        setFormLoading(true);
        const { error } = await InvoiceService.deleteInvoice(id);
        if (error) {
          setError(error);
        } else {
          await fetchInvoices();
        }
      } catch (err) {
        console.error('Error deleting invoice:', err);
        setError('Failed to delete invoice.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleSubmitInvoice = async (data: CreateInvoiceData) => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user. Cannot save invoice.');
      return;
    }
    try {
      setFormLoading(true);
      if (editingInvoice) {
        const { error } = await InvoiceService.updateInvoice(editingInvoice.id, data);
        if (error) {
          setError(error);
          return;
        }
      } else {
        const { error } = await InvoiceService.createInvoice(data);
        if (error) {
          setError(error);
          return;
        }
      }
      setShowForm(false);
      setEditingInvoice(null);
      await fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save invoice.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Facturas</h1>
        <Button onClick={handleAddInvoiceClick}>Nueva Factura</Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="paid">Pagada</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <select
              value={filters.patient_id}
              onChange={(e) => handleFilterChange('patient_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los pacientes</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              onClick={() => setFilters({ status: '', patient_id: '' })}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {showForm ? (
        <InvoiceForm
          invoice={editingInvoice}
          patients={patients}
          onSubmit={handleSubmitInvoice}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay facturas registradas.</p>
          <Button onClick={handleAddInvoiceClick} className="mt-4">
            Crear Primera Factura
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{invoice.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.patient?.full_name || 'Paciente no encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEditInvoiceClick(invoice)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={formLoading}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage; 
"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { AppointmentService } from '../../lib/services/appointmentService';
import { PatientService } from '../../lib/services/patientService';
import { Appointment, CreateAppointmentData, Patient } from '../../lib/types/clinic';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import AppointmentForm from '../../components/appointments/AppointmentForm';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const fetchAppointments = useCallback(async () => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: fetchedAppointments, error } = await AppointmentService.getAppointments(filters);
      if (error) {
        setError(error);
      } else {
        setAppointments(fetchedAppointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
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
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        setFormLoading(true);
        const { error } = await AppointmentService.deleteAppointment(id);
        if (error) {
          setError(error);
        } else {
          await fetchAppointments();
        }
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleSubmitAppointment = async (data: CreateAppointmentData) => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user. Cannot save appointment.');
      return;
    }
    try {
      setFormLoading(true);
      if (editingAppointment) {
        const { error } = await AppointmentService.updateAppointment(editingAppointment.id, data);
        if (error) {
          setError(error);
          return;
        }
      } else {
        const { error } = await AppointmentService.createAppointment(data);
        if (error) {
          setError(error);
          return;
        }
      }
      setShowForm(false);
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Failed to save appointment.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-2xl font-bold">Gestión de Citas</h1>
        <Button onClick={handleAddAppointmentClick}>Nueva Cita</Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {showForm ? (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          onSubmit={handleSubmitAppointment}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay citas programadas.</p>
          <Button onClick={handleAddAppointmentClick} className="mt-4">
            Crear Primera Cita
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dentista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient?.full_name || 'Paciente no encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(appointment.appointment_datetime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.dentist?.full_name || 'Por asignar'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'scheduled' && 'Programada'}
                        {appointment.status === 'completed' && 'Completada'}
                        {appointment.status === 'cancelled' && 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {appointment.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEditAppointmentClick(appointment)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteAppointment(appointment.id)}
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

export default AppointmentsPage; 
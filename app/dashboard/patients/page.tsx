"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { PatientService } from '../../lib/services/patientService';
import { Patient, CreatePatientData } from '../../lib/types/clinic';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import PatientForm from '../../components/patients/PatientForm';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const fetchPatients = useCallback(async () => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: fetchedPatients, error } = await PatientService.getPatients();
      if (error) {
        setError(error);
      } else {
        setPatients(fetchedPatients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatientClick = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatientClick = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        setFormLoading(true);
        const { error } = await PatientService.deletePatient(id);
        if (error) {
          setError(error);
        } else {
          await fetchPatients(); // Refresh the list
        }
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Failed to delete patient.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleSubmitPatient = async (data: CreatePatientData | Partial<CreatePatientData>) => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user. Cannot save patient.');
      return;
    }

    // Validar que los datos requeridos estén presentes
    if (!data.full_name || data.full_name.trim() === '') {
      setError('El nombre completo es requerido.');
      return;
    }

    const patientData: CreatePatientData = {
      full_name: data.full_name,
      dob: data.dob,
      phone: data.phone,
      email: data.email,
      medical_history: data.medical_history,
    };

    try {
      setFormLoading(true);
      if (editingPatient) {
        const { error } = await PatientService.updatePatient(editingPatient.id, patientData);
        if (error) {
          setError(error);
          return;
        }
      } else {
        const { error } = await PatientService.createPatient(patientData);
        if (error) {
          setError(error);
          return;
        }
      }
      setShowForm(false);
      setEditingPatient(null);
      await fetchPatients(); // Refresh the list
    } catch (err) {
      console.error('Error saving patient:', err);
      setError('Failed to save patient.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
        <Button onClick={handleAddPatientClick}>Agregar Paciente</Button>
      </div>

      {showForm ? (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmitPatient}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      ) : patients.length === 0 ? (
        <p>No hay pacientes registrados.</p>
      ) : (
        <ul className="space-y-2">
          {patients.map((patient) => (
            <li key={patient.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{patient.full_name}</h2>
                <p>Email: {patient.email}</p>
                <p>Teléfono: {patient.phone}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={() => handleEditPatientClick(patient)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeletePatient(patient.id)} disabled={formLoading}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientsPage;

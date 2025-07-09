"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { FileService } from '../../lib/services/fileService';
import { PatientService } from '../../lib/services/patientService';
import { PatientFile, Patient } from '../../lib/types/clinic';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import FileUploadForm from '../../components/files/FileUploadForm';

const FilesPage = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [filters, setFilters] = useState({
    patient_id: '',
    file_type: '',
  });

  const fetchFiles = useCallback(async () => {
    if (!user?.profile?.clinic_id) {
      setError('No clinic ID found for the current user.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: fetchedFiles, error } = await FileService.getFiles(filters);
      if (error) {
        setError(error);
      } else {
        setFiles(fetchedFiles);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files.');
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
    fetchFiles();
  }, [fetchFiles]);

  const handleUploadFileClick = () => {
    setShowUploadForm(true);
  };

  const handleDeleteFile = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      try {
        setUploadLoading(true);
        const { error } = await FileService.deleteFile(id);
        if (error) {
          setError(error);
        } else {
          await fetchFiles();
        }
      } catch (err) {
        console.error('Error deleting file:', err);
        setError('Failed to delete file.');
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleUploadComplete = async () => {
    setShowUploadForm(false);
    await fetchFiles();
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'document':
      case 'doc':
      case 'docx':
        return '📝';
      case 'xray':
        return '🦷';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (file: PatientFile) => {
    // En un sistema real, esto descargaría el archivo desde Supabase Storage
    window.open(file.file_url, '_blank');
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
        <h1 className="text-2xl font-bold">Archivos Clínicos</h1>
        <Button onClick={handleUploadFileClick}>Subir Archivo</Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Archivo</label>
            <select
              value={filters.file_type}
              onChange={(e) => handleFilterChange('file_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="pdf">PDF</option>
              <option value="image">Imagen</option>
              <option value="document">Documento</option>
              <option value="xray">Radiografía</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              onClick={() => setFilters({ patient_id: '', file_type: '' })}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {showUploadForm ? (
        <FileUploadForm
          patients={patients}
          onUploadComplete={handleUploadComplete}
          onCancel={handleCancelUpload}
          loading={uploadLoading}
        />
      ) : files.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay archivos clínicos registrados.</p>
          <Button onClick={handleUploadFileClick} className="mt-4">
            Subir Primer Archivo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileTypeIcon(file.file_type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate max-w-32">
                      {file.file_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {file.patient?.full_name || 'Paciente no encontrado'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteFile(file.id)}
                  disabled={uploadLoading}
                >
                  Eliminar
                </Button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Tipo: {file.file_type}</p>
                <p>Subido: {formatDate(file.uploaded_at)}</p>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="flex-1"
                >
                  Descargar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="flex-1"
                >
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesPage; 
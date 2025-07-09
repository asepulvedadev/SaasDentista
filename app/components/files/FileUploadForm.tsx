"use client"

import React, { useState } from 'react';
import { Patient } from '../../lib/types/clinic';
import { FileService } from '../../lib/services/fileService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface FileUploadFormProps {
  patients: Patient[];
  onUploadComplete: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  patients,
  onUploadComplete,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    file_type: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Clear file validation error
      if (validationErrors.file) {
        setValidationErrors(prev => ({
          ...prev,
          file: '',
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patient_id) {
      errors.patient_id = 'Selecciona un paciente';
    }

    if (!formData.file_type) {
      errors.file_type = 'Selecciona un tipo de archivo';
    }

    if (!selectedFile) {
      errors.file = 'Selecciona un archivo';
    } else {
      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        errors.file = 'El archivo no puede exceder 10MB';
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        errors.file = 'Tipo de archivo no permitido. Solo se permiten PDF, imágenes y documentos Word.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && selectedFile) {
      try {
        const { error } = await FileService.uploadFile(
          formData.patient_id,
          selectedFile,
          formData.file_type
        );

        if (error) {
          setValidationErrors({ submit: error });
        } else {
          onUploadComplete();
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        setValidationErrors({ submit: 'Error al subir el archivo' });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Subir Archivo Clínico</h2>
      
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
            <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Archivo *
            </label>
            <select
              id="file_type"
              name="file_type"
              value={formData.file_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.file_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un tipo</option>
              <option value="pdf">PDF</option>
              <option value="image">Imagen</option>
              <option value="document">Documento</option>
              <option value="xray">Radiografía</option>
              <option value="other">Otro</option>
            </select>
            {validationErrors.file_type && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.file_type}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Archivo *
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.file ? 'border-red-500' : 'border-gray-300'
            }`}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          />
          {validationErrors.file && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.file}</p>
          )}
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-1">
              Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Tipos permitidos: PDF, JPG, PNG, GIF, DOC, DOCX. Máximo 10MB.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción opcional del archivo..."
          />
        </div>

        {validationErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{validationErrors.submit}</p>
          </div>
        )}

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
            Subir Archivo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FileUploadForm; 
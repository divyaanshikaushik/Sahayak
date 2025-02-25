import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import type { Patient } from '@/lib/database.types';
import { visitReasonOptions } from '@/lib/utils';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function ScheduleAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleAppointmentModalProps) {
  const { doctor } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    scheduledFor: '',
    visitReason: 'regular_checkup',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && doctor) {
      fetchPatients();
      // Reset form data when modal opens
      setFormData({
        patientId: '',
        scheduledFor: '',
        visitReason: 'regular_checkup',
        notes: '',
      });
    }
  }, [isOpen, doctor]);

  async function fetchPatients() {
    if (!doctor) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctor.id as string)
        .order('full_name');

      if (error) throw error;
      setPatients(data || [] as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctor) return;

    setError('');

    // Validate patient selection
    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(formData.scheduledFor);
    if (scheduledTime <= new Date()) {
      setError('Appointment time must be in the future');
      return;
    }

    setLoading(true);

    try {
      const { error: saveError } = await supabase.from('appointments').insert([
        {
          doctor_id: doctor.id,
          patient_id: formData.patientId,
          scheduled_for: formData.scheduledFor,
          visit_reason: formData.visitReason,
          notes: formData.notes.trim() || null,
        },
      ]);

      if (saveError) throw saveError;

      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const patientOptions = [
    { value: '', label: 'Select a patient' },
    ...patients.map(p => ({ value: p.id, label: p.full_name }))
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Schedule Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient"
            options={patientOptions}
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Select
            label="Visit Reason"
            options={visitReasonOptions}
            value={formData.visitReason}
            onChange={(e) => setFormData({ ...formData, visitReason: e.target.value })}
            required
          />

          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes..."
            rows={3}
          />

          <Button
            type="submit"
            disabled={loading || !formData.patientId || !formData.scheduledFor}
            className="w-full"
          >
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </form>
      </div>
    </div>
  );
}
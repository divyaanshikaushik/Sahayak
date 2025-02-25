import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Appointment } from '@/lib/database.types';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal';
import { Button } from '../ui/Button';
import { visitReasonOptions } from '@/lib/utils';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onRefresh: () => Promise<void>;
}

export function UpcomingAppointments({ appointments, onRefresh }: UpcomingAppointmentsProps) {
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  const toggleExpand = (appointmentId: string) => {
    setExpandedAppointment(expandedAppointment === appointmentId ? null : appointmentId);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getVisitReasonLabel = (value: string) => {
    return visitReasonOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsScheduling(true)}>
          Schedule Appointment
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-900">No upcoming appointments</h3>
          <p className="mt-1 text-sm text-gray-500">Schedule an appointment to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(appointment.id)}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {appointment.patients?.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(appointment.scheduled_for)}
                  </p>
                </div>
                {expandedAppointment === appointment.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {expandedAppointment === appointment.id && (
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="font-medium">Visit Reason:</span>{' '}
                    {getVisitReasonLabel(appointment.visit_reason)}
                  </div>
                  {appointment.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>{' '}
                      {appointment.notes}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Patient DOB:</span>{' '}
                    {new Date(appointment.patients?.date_of_birth).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ScheduleAppointmentModal
        isOpen={isScheduling}
        onClose={() => setIsScheduling(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
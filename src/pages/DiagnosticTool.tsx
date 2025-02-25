import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DiagnosticTabs } from '../components/diagnostic/DiagnosticTabs';
import { VisitHistorySidebar } from '../components/diagnostic/VisitHistorySidebar';
import type { MedicalReport } from '../lib/supabase';

interface Props {
  viewOnly?: boolean;
}

export default function DiagnosticTool({ viewOnly = false }: Props) {
  const { doctorId, patientId, reportId } = useParams();
  const navigate = useNavigate();
  const { doctor } = useAuth();
  const [visitReason, setVisitReason] = useState('regular_checkup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(reportId || null);
  const [patientName, setPatientName] = useState('');
  const [healthStatus, setHealthStatus] = useState<'improving' | 'deteriorating' | null>(null);
  const [showHealthWarning, setShowHealthWarning] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchPatientReports();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedReport) {
      fetchReport(selectedReport);
    }
  }, [selectedReport]);

  async function fetchPatientDetails() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      if (data) {
        setPatientName(data.full_name);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  }

  async function fetchPatientReports() {
    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientReports(data || []);
    } catch (error) {
      console.error('Error fetching patient reports:', error);
    }
  }

  async function fetchReport(id: string) {
    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setVisitReason(data.visit_reason);
        setHealthStatus(data.health_status || null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load report');
    }
  }

  async function handleHealthStatusUpdate(status: 'improving' | 'deteriorating') {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from('medical_reports')
        .update({ health_status: status })
        .eq('id', selectedReport);

      if (error) throw error;

      setHealthStatus(status);
      await fetchPatientReports();
      setShowHealthWarning(false);
    } catch (error) {
      console.error('Error updating health status:', error);
      setError('Failed to update health status');
    }
  }

  function handleBack() {
    if (!doctor || viewOnly) {
      navigate(doctor ? `/doctor/${doctorId}` : `/patient/${patientId}`);
      return;
    }

    if (!healthStatus && selectedReport) {
      setShowHealthWarning(true);
      return;
    }

    navigate(`/doctor/${doctorId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VisitHistorySidebar
        patientName={patientName}
        reports={patientReports}
        selectedReport={selectedReport}
        onReportSelect={setSelectedReport}
      />

      <div className="flex-1">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </button>
              </div>
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold">
                  {viewOnly ? 'View Report' : 'Sahayak'}
                </span>
              </div>
              {!viewOnly && doctor && selectedReport && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleHealthStatusUpdate('improving')}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                      healthStatus === 'improving'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Improving
                  </button>
                  <button
                    onClick={() => handleHealthStatusUpdate('deteriorating')}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                      healthStatus === 'deteriorating'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Deteriorating
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {showHealthWarning && (
          <div className="max-w-4xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please indicate the patient's health status before leaving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <DiagnosticTabs
                visitReason={visitReason}
                onVisitReasonChange={setVisitReason}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
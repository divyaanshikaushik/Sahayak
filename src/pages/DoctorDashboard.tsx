import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, LogOut, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, handleSupabaseError, checkSupabaseConnection } from '../lib/supabase';
import type { Patient, Appointment } from '../lib/database.types';
import AddPatientModal from '../components/AddPatientModal';
import { UpcomingAppointments } from '../components/appointments/UpcomingAppointments';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { doctor, signOut } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (doctor) {
      const loadData = async () => {
        try {
          setError(null);
          await Promise.all([fetchPatients(), fetchAppointments()]);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load data. Please try refreshing the page.');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [doctor]);

  async function fetchPatients() {
    if (!doctor) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data);
    } catch (error) {
      setError('Failed to fetch patients. Please try again.');
      throw error;
    }
  }

  async function fetchAppointments() {
    if (!doctor) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            date_of_birth
          )
        `)
        .eq('doctor_id', doctor.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setAppointments(data);
    } catch (error) {
      setError('Failed to fetch appointments. Please try again.');
      throw error;
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/doctor/${doctor?.id}/patient/${patientId}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isConnected && (
        <div className="bg-yellow-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Connection issues detected. Some features may be unavailable.
              <button
                onClick={() => window.location.reload()}
                className="ml-2 text-yellow-700 underline hover:text-yellow-800"
              >
                Refresh page
              </button>
            </p>
          </div>
        </div>
      )}

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold">Patients List</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              className="absolute top-0 right-0 p-3"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {showAppointments ? 'Upcoming Appointments' : 'Your Patients'}
            </h1>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowAppointments(!showAppointments)}
              >
                {showAppointments ? (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    View Patients
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Appointments
                  </>
                )}
              </Button>
              {!showAppointments && (
                <Button onClick={() => setIsAddPatientModalOpen(true)}>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>
          </div>

          {!showAppointments && (
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search patients by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : showAppointments ? (
            <UpcomingAppointments
              appointments={appointments}
              onRefresh={fetchAppointments}
            />
          ) : filteredPatients.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new patient.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <li key={patient.id}>
                    <button
                      onClick={() => handlePatientClick(patient.id)}
                      className="w-full block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">
                            {patient.full_name}
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Date of Birth: {new Date(patient.date_of_birth).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            Added on {new Date(patient.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSuccess={fetchPatients}
      />
    </div>
  );
}
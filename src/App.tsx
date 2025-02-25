import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import DiagnosticTool from './pages/DiagnosticTool';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Doctor Routes */}
          <Route
            path="/doctor/:doctorId"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/:doctorId/patient/:patientId"
            element={
              <ProtectedRoute role="doctor">
                <DiagnosticTool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/:doctorId/patient/:patientId/report/:reportId"
            element={
              <ProtectedRoute role="doctor">
                <DiagnosticTool />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
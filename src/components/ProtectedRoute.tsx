import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'doctor';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, doctor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'doctor' && !doctor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
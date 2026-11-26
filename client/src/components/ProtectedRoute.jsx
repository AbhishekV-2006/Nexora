import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * - Checks auth state via useAuth
 * - While loading, shows a centered spinner
 * - If authenticated, renders children; otherwise redirects to /login
 *
 * Explanation: Route guards prevent unauthorized access. In React Router v6,
 * we wrap the protected element with this component so route logic stays
 * declarative in the route table.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

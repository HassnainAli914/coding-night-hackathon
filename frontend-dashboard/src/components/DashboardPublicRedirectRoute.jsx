import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPublicRedirectRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to the landing equivalent
  if (!user) {
    // Strip "/dashboard" from the beginning of the pathname
    const newPath = location.pathname.replace(/^\/dashboard/, '');
    return <Navigate to={`${newPath}${location.search}`} replace />;
  }

  return children;
}

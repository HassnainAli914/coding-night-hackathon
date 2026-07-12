import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Rely primarily on profile.role (which the backend decrypts properly via userService).
  // Fallback to user_metadata only if it's not a long encrypted string.
  const rawMetadataRole = user?.user_metadata?.role;
  const isEncrypted = rawMetadataRole && rawMetadataRole.length > 20;
  
  const userRole = profile?.role || (isEncrypted ? 'reporter' : rawMetadataRole) || 'reporter';

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl max-w-md border border-gray-150 dark:border-gray-700">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You do not have the sufficient permissions to view this page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}

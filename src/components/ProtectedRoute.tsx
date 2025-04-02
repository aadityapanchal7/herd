
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailConfirmation?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailConfirmation = false 
}) => {
  const { user, isLoading, userProfile } = useAuth();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-herd-purple"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth" />;
  }

  // Check if email confirmation is required and email is not confirmed
  if (requireEmailConfirmation && !user.email_confirmed_at) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Email Confirmation Required</h1>
          <p className="mb-4 text-center">
            Please check your email and confirm your account before accessing this page.
          </p>
          <p className="text-sm text-gray-500 text-center">
            If you don't see the confirmation email, please check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  // Render children if authenticated and email is confirmed (if required)
  return <>{children}</>;
};

export default ProtectedRoute;

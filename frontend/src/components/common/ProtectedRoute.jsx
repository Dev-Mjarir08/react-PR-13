import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader.jsx';

/**
 * Route protector component that checks authentication state and roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not authorized, redirect to homepage or access denied
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

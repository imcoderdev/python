import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 
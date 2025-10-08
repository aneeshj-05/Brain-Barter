// frontend/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
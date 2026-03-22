import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', color: '#fff', marginTop: '20%' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;

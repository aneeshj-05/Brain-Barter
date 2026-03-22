// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const socket = io.connect("http://localhost:5000");
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ added loading state
  const [unreadChatMessages, setUnreadChatMessages] = useState(0);
  const [sessionProposals, setSessionProposals] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteCallback, setDeleteCallback] = useState(null);

  // ✅ Load token and rehydrate user on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      // Check expiry
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken');
        setLoading(false);
        return;
      }

      // ✅ Fetch full user profile from backend (instead of just token)
      axios.get('http://localhost:5000/api/user/me', {
        headers: { 'x-auth-token': token }
      })
      .then(async (res) => {
        setUser(res.data);
        console.log('Registering user with socket:', res.data._id);
        socket.emit('register', res.data._id);
        
        // Fetch initial unread message count
        try {
          const unreadRes = await axios.get('http://localhost:5000/api/chat/unread-count', {
            headers: { 'x-auth-token': token }
          });
          setUnreadChatMessages(unreadRes.data.count || 0);
        } catch (err) {
          console.error('Failed to fetch unread count:', err);
        }
      })
      .catch((err) => {
        console.error('Auth refresh error:', err);
        localStorage.removeItem('authToken');
      })
      .finally(() => setLoading(false));

    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('authToken');
      setLoading(false);
    }

    // --- SOCKET LISTENERS ---
    const handleReceiveMessage = () => setUnreadChatMessages(prev => prev + 1);

    const handleNewProposal = (newProposal) => {
      setSessionProposals(prev => [newProposal, ...prev]);
      toast('You have a new session proposal!', { icon: '🎓' });
    };

    const handleSessionUpdate = ({ message }) => {
      toast.success(message);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('new_session_proposal', handleNewProposal);
    socket.on('session_update', handleSessionUpdate);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('new_session_proposal', handleNewProposal);
      socket.off('session_update', handleSessionUpdate);
    };
  }, []);

  // ✅ Login handler
  const login = async (token) => {
    localStorage.setItem('authToken', token);
    try {
      const decodedToken = jwtDecode(token);
      const res = await axios.get('http://localhost:5000/api/user/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
      console.log('Login: Registering user with socket:', res.data._id);
      socket.emit('register', res.data._id);
      
      // Fetch initial unread message count
      try {
        const unreadRes = await axios.get('http://localhost:5000/api/chat/unread-count', {
          headers: { 'x-auth-token': token }
        });
        setUnreadChatMessages(unreadRes.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
      
      return true; // Return success
    } catch (err) {
      console.error('Login fetch error:', err);
      localStorage.removeItem('authToken');
      throw err; // Throw error so it can be caught
    }
  };

  // ✅ Logout handler
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setUnreadChatMessages(0);
    setSessionProposals([]);
  };

  const clearChatNotifications = () => setUnreadChatMessages(0);

  // ✅ Refresh user data (for credit updates)
  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !user) return;
    
    try {
      const res = await axios.get('http://localhost:5000/api/user/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  // Global delete confirmation
  const confirmDeleteMatch = (userInfo, onConfirm) => {
    setUserToDelete(userInfo);
    setDeleteCallback(() => onConfirm);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (deleteCallback) {
      await deleteCallback();
    }
    setShowDeleteConfirm(false);
    setUserToDelete(null);
    setDeleteCallback(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
    setDeleteCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        socket,
        unreadMessages: unreadChatMessages,
        clearChatNotifications,
        sessionProposals,
        setSessionProposals,
        refreshUser,
        loading, // ✅ pass this to ProtectedRoute
        confirmDeleteMatch,
        showDeleteConfirm,
        userToDelete,
        executeDelete,
        cancelDelete
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

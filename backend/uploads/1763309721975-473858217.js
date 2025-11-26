import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import GlobalVideoCallNotification from './components/GlobalVideoCallNotification';
import { useContext } from 'react';

// Updated paths to point to the new 'pages' folder
import Landing from './pages/land.jsx';
import AuthPages from './pages/Loginsignup.jsx';
import Dashboard from './pages/dashboard.js';
import ProfilePage from './pages/profilepage.jsx';
import Chat from './pages/chat.jsx';
import SkillsExplorer from './pages/SkillsExplorer.jsx';
import SessionsCalendar from './pages/SessionsCalendar.jsx';

// Global Delete Confirmation Modal Component
function GlobalDeleteModal() {
  const { showDeleteConfirm, userToDelete, executeDelete, cancelDelete } = useContext(AuthContext);

  if (!showDeleteConfirm || !userToDelete) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    content: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#4b3b34'
    },
    message: {
      fontSize: '1rem',
      color: '#4b3b34',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    cancelBtn: {
      flex: 1,
      padding: '0.75rem',
      borderRadius: '8px',
      border: '2px solid #e0d5cc',
      backgroundColor: '#fff',
      color: '#4b3b34',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    confirmBtn: {
      flex: 1,
      padding: '0.75rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#ef4444',
      color: '#fff',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={cancelDelete}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.title}>Delete Match</div>
        <div style={modalStyles.message}>
          Are you sure you want to permanently delete your match with <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
          <br /><br />
          This action cannot be undone and you will no longer be able to chat with this user.
        </div>
        <div style={modalStyles.buttons}>
          <button style={modalStyles.cancelBtn} onClick={cancelDelete}>
            Cancel
          </button>
          <button 
            style={modalStyles.confirmBtn} 
            onClick={executeDelete}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* Add the Toaster component here */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Define default options
          style: {
            background: '#402E2A',
            color: '#EDE3DB',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#EDE3DB',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#EDE3DB',
            },
          },
        }}
      />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalVideoCallNotification />
        <GlobalDeleteModal />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPages />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile/:userId" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          <Route 
            path="/chat" 
            element={<ProtectedRoute><Chat /></ProtectedRoute>} 
          />
          <Route 
            path="/skills" 
            element={<ProtectedRoute><SkillsExplorer /></ProtectedRoute>} 
          />
          <Route 
            path="/sessions" 
            element={<ProtectedRoute><SessionsCalendar /></ProtectedRoute>} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
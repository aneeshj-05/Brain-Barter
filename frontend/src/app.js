import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast'; // Import Toaster

// Updated paths to point to the new 'pages' folder
import Landing from './pages/land.jsx';
import AuthPages from './pages/Loginsignup.jsx';
import Dashboard from './pages/dashboard.js';
import ProfilePage from './pages/profilepage.jsx';
import Chat from './pages/chat.jsx';
import SkillsExplorer from './pages/SkillsExplorer.jsx';
import SessionsCalendar from './pages/SessionsCalendar.jsx';

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
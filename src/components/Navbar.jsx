import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page after logout
  };

  const styles = {
    nav: {
      backgroundColor: '#402E2A',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #947C70'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      textDecoration: 'none',
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    navLink: {
      color: '#EDE3DB',
      textDecoration: 'none',
      transition: 'color 0.3s',
      backgroundColor: 'transparent',
      border: '2px solid #EDE3DB',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    authButton: {
      textDecoration: 'none',
      color: '#EDE3DB',
      backgroundColor: 'transparent',
      border: '2px solid #EDE3DB',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '1rem',
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logo}>Brain Barter</Link>
        
        <div style={styles.navLinks}>
          {user ? (
            // --- Logged In User ---
            <>
              <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
              <Link to="/profile" style={styles.navLink}>Profile</Link>
              <button onClick={handleLogout} style={styles.authButton}>Logout</button>
            </>
          ) : (
            // --- Logged Out User ---
            <>
              <Link to="/auth" state={{ page: 'login' }} style={styles.navLink}>Login</Link>
              <Link to="/auth" state={{ page: 'signup' }} style={styles.authButton}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react'; // --- NEW --- Import icon

export default function Navbar() {
  // --- MODIFIED --- Get new values from context
  const { user, unreadMessages, clearChatNotifications } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChatClick = () => {
    clearChatNotifications();
    navigate('/chat');
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
    },
    // --- NEW --- Styles for the chat button and badge
    chatBtn: {
      backgroundColor: "transparent",
      color: "#EDE3DB",
      border: "2px solid #EDE3DB",
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: "pointer",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: '1rem',
      gap: '0.5rem' // Space between icon and text
    },
    badge: {
      position: "absolute",
      top: "-8px",
      right: "-8px",
      backgroundColor: "#ef4444",
      color: "white",
      borderRadius: "50%",
      width: "20px",
      height: "20px",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logo}>Brain Barter</Link>
        
        <div style={styles.navLinks}>
          {user ? (
            // --- MODIFIED --- Added Chat button with badge
            <>
              <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
              <Link to="/profile" style={styles.navLink}>Profile</Link>
              <button style={styles.chatBtn} onClick={handleChatClick}>
                <MessageCircle size={18} />
                <span>Chat</span>
                {unreadMessages > 0 && (
                  <span style={styles.badge}>{unreadMessages}</span>
                )}
              </button>
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
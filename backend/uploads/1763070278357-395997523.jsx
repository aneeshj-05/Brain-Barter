import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast'; // Import toast

export default function AuthPages() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.state?.page || 'signup'); // 'signup' or 'login'
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: '',
    agreeToTerms: false
  });

  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#402E2A';
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (currentPage === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match!"); // Replaced alert
      }
      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          skills: formData.skills,
        });
        toast.success(response.data.message); // Replaced alert
        setCurrentPage('login'); // Switch to the login form
      } catch (error) {
        // If the server sends an error, show it to the user
        toast.error('Signup failed: ' + (error.response?.data?.message || 'Unknown error')); // Replaced alert
      }
    } else {
      try {
        // Send a POST request to your backend's login route
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });

    if (response.data.token) {
          login(response.data.token); // Changed from localStorage.setItem
        }

        toast.success(response.data.message); // Replaced alert
        navigate('/dashboard');
                
      } catch (error) {
        // If login fails, show the error message from the server
        toast.error('Login failed: ' + (error.response?.data?.message || 'Unknown error')); // Replaced alert
      }
    }
  };

  // --- STYLES HAVE BEEN CORRECTED BELOW ---
  const styles = {
    body: {
      overflowX: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      lineHeight: '1.6',
      margin: 0, // Corrected: Removed unnecessary margins
      padding: 0,
      minHeight: '100vh',
      display: 'flex', // Added: Use flexbox for centering
      flexDirection: 'column', // Added: Stack children vertically
      alignItems: 'center', // Added: Center content horizontally
    },

    // Navigation
    nav: {
      backgroundColor: '#402E2A',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #947C70',
      width: '100%', // Added: Ensure nav takes full width
      boxSizing: 'border-box', // Added: Include padding in width calculation
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
      cursor: 'pointer'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: '#EDE3DB',
      textDecoration: 'none',
      transition: 'color 0.3s',
      opacity: 0.8,
      backgroundColor: 'transparent',
      border: '2px solid #EDE3DB',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '1rem'
    },

    // Main Container
    main: {
      display: 'flex',
      flex: 1, // Corrected: Allow this to fill remaining vertical space
      width: '100%', // Corrected: Use full width to center its content
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem', // Added padding for smaller screens
    },

    // Auth Container
    authContainer: {
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '900px',
      display: 'flex',
      minHeight: '600px'
    },

    // Left Panel (Welcome/Info)
    leftPanel: {
      backgroundColor: '#59433eff',
      padding: '3rem',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    },
    welcomeTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      marginBottom: '1rem'
    },
    welcomeText: {
      color: '#d7beaaff',
      fontSize: '1.125rem',
      lineHeight: '1.6',
      marginBottom: '2rem',
      opacity: 0.9
    },
    switchButton: {
      backgroundColor: '#402E2A',
      border: '2px solid #d7beaaff',
      color: '#d7beaaff',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },

    // Right Panel (Form)
    rightPanel: {
      backgroundColor: '#a88e80ff',
      padding: '3rem',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    formTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    formSubtitle: {
      color: '#402E2A',
      textAlign: 'center',
      marginBottom: '2rem',
      opacity: 0.8
    },

    // Form Styles
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formRow: {
      display: 'flex',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1'
    },
    label: {
      color: '#402E2A',
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: '0.9rem'
    },
    input: {
      padding: '0.875rem',
      border: '2px solid #d7beaaff',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      padding: '0.875rem',
      border: '2px solid #d7beaaff',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      accentColor: '#402E2A'
    },
    checkboxLabel: {
      color: '#402E2A',
      fontSize: '0.9rem',
      opacity: 0.8
    },
    submitButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '1.125rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '1rem'
    },
    forgotPassword: {
      textAlign: 'center',
      marginTop: '1rem'
    },
    forgotLink: {
      color: '#402E2A',
      textDecoration: 'none',
      fontSize: '0.9rem',
      opacity: 0.8,
      transition: 'text-decoration 0.3s'
    },

    // Demo switcher
    demoSwitcher: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      gap: '10px',
      zIndex: 1000
    },
    demoButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s'
    }
  };

  return (
    <div style={styles.body}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            Brain Barter
          </div>
          
          <ul style={styles.navLinks}>
            <li>
            <Link to="/" style={styles.navLink}>Home</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Auth Section */}
      <main style={styles.main}>
        <div style={styles.authContainer}>
          {/* Left Panel - Welcome/Info */}
          <div style={styles.leftPanel}>
            {currentPage === 'signup' ? (
              <>
                <h2 style={styles.welcomeTitle}>Welcome to Brain Barter!</h2>
                <p style={styles.welcomeText}>
                  Join our community of learners and teachers. Share your skills, 
                  learn new ones, and build meaningful connections.
                </p>
                <button 
                  style={styles.switchButton}
                  onClick={() => setCurrentPage('login')}
                >
                  Already have an account?
                </button>
              </>
            ) : (
              <>
                <h2 style={styles.welcomeTitle}>Welcome Back!</h2>
                <p style={styles.welcomeText}>
                  Ready to continue your learning journey? Log in to access 
                  your profile and start bartering skills.
                </p>
                <button 
                  style={styles.switchButton}
                  onClick={() => setCurrentPage('signup')}
                >
                  Need an account?
                </button>
              </>
            )}
          </div>

          {/* Right Panel - Form */}
          <div style={styles.rightPanel}>
            <h1 style={styles.formTitle}>
              {currentPage === 'signup' ? 'Create Account' : 'Log In'}
            </h1>
            <p style={styles.formSubtitle}>
              {currentPage === 'signup' 
                ? 'Start your skill-sharing journey today' 
                : 'Access your Brain Barter account'
              }
            </p>

            {/* Login Form */}
            {currentPage === 'login' && (
              <div style={styles.formContainer}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="loginEmail">Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    id="loginEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="loginPassword">Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    id="loginPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                  />
                </div>

                <button 
                  type="button" 
                  style={styles.submitButton}
                  onClick={handleSubmit}
                >
                  Log In to Brain Barter
                </button>

                <div style={styles.forgotPassword}>
                  <a href="#" style={styles.forgotLink}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >Forgot your password?</a>
                </div>
              </div>
            )}

            {/* Signup Form */}
            {currentPage === 'signup' && (
              <div style={styles.formContainer}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="firstName">First Name</label>
                    <input
                      style={styles.input}
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="lastName">Last Name</label>
                    <input
                      style={styles.input}
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="signupEmail">Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    id="signupEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="signupPassword">Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    id="signupPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="skills">Skills You Can Teach (Optional)</label>
                  <textarea
                    style={styles.textarea}
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development, Cooking, Guitar, Photography..."
                  />
                </div>

                <div style={styles.checkboxContainer}>
                  <input
                    style={styles.checkbox}
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <label style={styles.checkboxLabel} htmlFor="agreeToTerms">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                <button 
                  type="button" 
                  style={styles.submitButton}
                  onClick={handleSubmit}
                >
                  Create Your Brain Barter Account
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Page Switcher for Demo */}
      <div style={styles.demoSwitcher}>
        <button
          onClick={() => setCurrentPage('signup')}
          style={{
            ...styles.demoButton,
            backgroundColor: currentPage === 'signup' ? '#d7beaaff' : '#947C70',
            color: '#402E2A'
          }}
        >
          Signup
        </button>
        <button
          onClick={() => setCurrentPage('login')}
          style={{
            ...styles.demoButton,
            backgroundColor: currentPage === 'login' ? '#d7beaaff' : '#947C70',
            color: '#402E2A'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
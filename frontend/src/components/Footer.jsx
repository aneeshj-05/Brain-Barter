import React from 'react';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#4b3b34',
      color: '#f5ede6',
      width: '100%',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem',
      boxSizing: 'border-box',
      flexShrink: 0,
      bottom: 0, // Add this line
      left: 0, // Add this line
      right: 0, // Add this line
      fontFamily: 'Libre Baskerville, serif',
      // Change from 'absolute' to 'relative'
    },
    footerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '1.125rem',
      color: '#d7c6bc',
      margin: 0
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <p style={styles.footerText}>© 2025 Brain Barter. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
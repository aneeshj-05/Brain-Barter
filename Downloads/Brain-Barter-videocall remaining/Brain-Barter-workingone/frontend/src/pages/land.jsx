import React from 'react';
import Limage from "../assets/im.jpeg"
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';


export default function Landing() {
  
  React.useEffect(() => {
    // Reset any global styles
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#402E2A';
 

  const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/landing') {
      // Only clear if explicitly visiting landing page (not redirected after logout)
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');
      if (justLoggedOut) {
        sessionStorage.removeItem('justLoggedOut');
      }
    }
  }, []);

  const styles = {
    // Base styles
    body: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#ffffffff',
      color: '#402E2A',
      lineHeight: '1.6',
      padding: 0,
      width:'100%',
      marginRight:'970px',
      maxWidth:'2560px',
      overflowX:'hidden'
    },
    
    // Navigation
    nav: {
      backgroundColor: '#402E2A',
      padding: '1rem 1.5rem'
    },
    navContainer: {
      maxWidth: '1920px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      justifyContent: 'center',
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
      opacity: 0.8
    },
    authButtons: {
      display: 'flex',
      gap: '1rem'
    },
    btnLogin: {
      color: '#EDE3DB',
      backgroundColor: 'transparent',
      background: 'none',
      border: '2px solid #EDE3DB',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '18px',
},
   btnSignup: {
      textDecoration: 'none',
      backgroundColor:"#402E2A",
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize:'18px',
      transition: 'all 0.3s ease'
    },
    
    // Hero Section - FIXED
    hero: {
      padding: '2rem 0.5rem',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      minHeight: '60vh',  
      maxWidth:'1920px', 
      
    },
    heroContainer: {
      maxWidth: '1920px',
      position:'relative',
      zIndex:'2',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '4rem',
      maxWidth:'1024px',
      width: '100%',
      gap:'100px',
      padding:'0.5%'

    },
    heroContent: {
      flex: '1',
      textAlign: 'left', // Text aligned to left
      maxWidth: '600px'
    },
    heroImageContainer: {
      flex: '1',
      display: 'flex',
      justifyContent: 'flex-end', // Image aligned to right
      alignItems: 'center'
    },
    heroImage: {
      width: '100%',
      maxWidth: '800px',
      height: 'auto',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      lineHeight: '1.1',
      color: '#402E2A'
    },
    heroText: {
      fontSize: '1.25rem',
      color: '#4B2E2E',
      marginBottom: '2.5rem',
      opacity: 0.9,
      lineHeight: '1.6'
    },
    heroButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-start', // Buttons aligned to left
      flexWrap: 'wrap'
    },
    btnPrimary: {
      textDecoration: 'none',
      backgroundColor: '#d7beaaff',
      color: '#402E2A',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: '2px solid #402E2A',
      fontWeight: '600',
      fontSize: '1.125rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    btnSecondary: {
      textDecoration: 'none',
      backgroundColor: '#d7beaaff',
      color: '#402E2A',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      border: '2px solid #402E2A',
      fontWeight: '600',
      fontSize: '1.125rem',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    
    // Responsive design
    '@media (max-width: 1920px)': {
      heroContainer: {
        flexDirection: 'column',
        textAlign: 'center',
        gap: '2rem'
      },
      heroContent: {
        textAlign: 'center'
      },
      heroImageContainer: {
        justifyContent: 'center'
      },
      heroButtons: {
        justifyContent: 'center'
      },
      heroTitle: {
        fontSize: '2.5rem'
      }
    },
    
    // How It Works Section
    howItWorks: {
      padding: '5rem 1.5rem',
      backgroundColor: '#947C70'
    },
    container: {
      maxWidth: '1920px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '4rem'
    },
    steps: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '3rem'
    },
    step: {
      textAlign: 'center'
    },
    stepIcon: {
      backgroundColor: '#402E2A',
      width: '6rem',
      height: '6rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem'
    },
    stepTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    stepText: {
      color: '#EDE3DB',
      fontSize: '1.125rem',
      lineHeight: '1.7',
      opacity: 0.9
    },
    
    // Features Section
    features: {
      padding: '5rem 1.5rem'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    },
    featureCard: {
      height: '200px',
      backgroundColor: '#947C70',
      padding: '2rem',
      borderRadius: '0.75rem',
      border: '1px solid #221103ff',
      borderOpacity: 0.2
    },
    featureTitle: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textAlign: 'center',
       
    },
    featureText: {
      fontSize:'1.25rem',
      color: '#efe5dcff',
      opacity: 0.9,
      textAlign: 'center'
    },
    
    // CTA Section
    cta: {
      padding: '5rem 1.5rem',
      backgroundColor: '#947C70',
      textAlign: 'center'
    },
    ctaContainer: {
      maxWidth: '1920px',
      margin: '0 auto'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem'
    },
    ctaText: {
      fontSize: '1.25rem',
      color: '#EDE3DB',
      marginBottom: '2rem',
      opacity: 0.9
    },
    
    // Footer
    footer: {
      height:'250px',
      backgroundColor: '#402E2A',
      padding: '3rem 1.5rem',
      borderTop: '1px solid #947C70'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    footerSection: {
      
    },
    featureText1: {
      color: '#efe5dcff',
      fontSize:'1.20rem',
      opacity: 0.9,

    },
    footerTitle: {
      marginBottom: '1rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      fontSize:'20px'
    },
    footerList: {
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    footerListItem: {
      marginBottom: '0.5rem',
      fontSize:'18px'
    },
    footerLink: {
      color: '#EDE3DB',
      textDecoration: 'none',
      transition: 'color 0.3s',
      opacity: 0.8
    },
    footerBottom: {
      height:0,
      borderTop: '1px solid #947C70',
      paddingTop: '1rem',
      textAlign: 'left',
      color: '#EDE3DB',
      opacity: 0.8
    }
  };

  return (
    <div style={styles.body}>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section - FIXED */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          {/* Text Content - Left Side */}
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Share a skill, Learn another!</h1>
            <p style={styles.heroText}>
              Join a community where knowledge is the new currency. Barter your expertise, 
              from coding to cooking, and unlock a world of learning.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/auth" style={styles.btnPrimary}>Get Started</Link>
              <button style={styles.btnSecondary} onClick={() => {
                    document.getElementById('how-it-works').scrollIntoView({ 
                        behavior: 'smooth' }); }}>See How It Works</button>
            </div>
          </div>

          {/* Image - Right Side */}
          <div style={styles.heroImageContainer}>
            <img 
              src={Limage} 
              alt="People sharing skills and learning together" 
              style={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={styles.howItWorks}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How Brain Barter Works</h2>
          
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepIcon}>
                <svg width="40" height="40" fill="none" stroke="#EDE3DB" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 style={styles.stepTitle}>1. Offer Your Skill</h3>
              <p style={styles.stepText}>Create a profile and list the skills you're willing to teach. Make a real impact with your expertise.</p>
            </div>
            
            <div style={styles.step}>
              <div style={styles.stepIcon}>
                <svg width="40" height="40" fill="none" stroke="#EDE3DB" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={styles.stepTitle}>2. Find a Skill</h3>
              <p style={styles.stepText}>Browse or search for skills you want to learn. Connect with experts in your area.</p>
            </div>
            
            <div style={styles.step}>
              <div style={styles.stepIcon}>
                <svg width="40" height="40" fill="none" stroke="#EDE3DB" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 style={styles.stepTitle}>3. Exchange & Grow</h3>
              <p style={styles.stepText}>Arrange a barter. Share your knowledge, learn something new, and build lasting connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Brain Barter?</h2>
          
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Free Learning</h3>
              <p style={styles.featureText}>No monetary transactions. Exchange skills directly and remove financial barriers to learning.</p>
            </div>
            
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Smart Matching</h3>
              <p style={styles.featureText}>Our intelligent algorithm connects you with the perfect skill exchange partners.</p>
            </div>
            
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Trust & Safety</h3>
              <p style={styles.featureText}>Verified profiles, ratings, and reviews ensure quality and accountable exchanges.</p>
            </div>
            
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Flexible Credits</h3>
              <p style={styles.featureText}>Earn credits by teaching, use them to learn any skill. No direct reciprocity required.</p>
            </div>
            
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Built-in Communication</h3>
              <p style={styles.featureText}>Integrated messaging and scheduling tools make coordinating sessions seamless.</p>
            </div>
            
            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Community Driven</h3>
              <p style={styles.featureText}>Join a network of learners and teachers building meaningful connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.ctaContainer}>
          <h2 style={styles.ctaTitle}>Ready to Start Your Learning Journey?</h2>
          <p style={styles.ctaText}>Join thousands of learners and teachers in our growing community.</p>
          <Link to="/auth" style={styles.btnSignup}>Join Brain Barter Today!</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Brain Barter</h3>
              <p style={styles.featureText1}>Democratizing knowledge sharing through community-driven skill exchanges.</p>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerTitle}>Platform</h4>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Browse Skills</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>How It Works</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Success Stories</a></li>
              </ul>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerTitle}>Community</h4>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Guidelines</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Safety</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Support</a></li>
              </ul>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerTitle}>Company</h4>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>About Us</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Contact</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div style={styles.footerBottom}>
            <p>&copy; 2025 Brain Barter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    
  );
}

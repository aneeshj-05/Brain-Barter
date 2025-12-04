import React from 'react';
import Limage from "../assets/im.jpeg"
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function Landing() {
  React.useEffect(() => {
    // Reset any global styles (kept - safe)
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    // keep background color fallback — visual replaced by component background but keep safe value
    document.body.style.backgroundColor = '#402E2A';

    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/landing') {
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');
      if (justLoggedOut) {
        sessionStorage.removeItem('justLoggedOut');
      }
    }
  }, []);

  // Inline styles remain but updated to the new theme
  const styles = {
    body: {
      fontFamily: "Arial, sans-serif",
      // Use transparent so our component-level gradient can show through
      backgroundColor: 'transparent',
      color: '#3b2f2f',
      lineHeight: '1.6',
      padding: 0,
      width: '100%',
      maxWidth: '2560px',
      overflowX: 'hidden',

      position: 'relative',
    },


    // Top-level container that adds the gradient and safe padding
    pageWrap: {
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 10%, #f5e9df 0%, #e6d5c3 10%, #caaea0 30%, #947C70 55%, #5b3f36 85%, #3b2f2f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      position: 'relative',
      zIndex: 0,
    },

    // subtle grain/noise overlay (very low opacity)
    noiseOverlay: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: `radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)`,
      backgroundSize: '3px 3px',
      opacity: 0.06,
      zIndex: 1
    },

    // decorative glow behind hero image
    heroGlow: {
      position: 'absolute',
      width: '640px',
      height: '640px',
      right: '6%',
      top: '6%',
      transform: 'translate(0, -10%)',
      background: 'radial-gradient(circle, rgba(212,163,115,0.25) 0%, rgba(212,163,115,0.08) 20%, transparent 60%)',
      filter: 'blur(50px)',
      zIndex: 0,
      borderRadius: '50%'
    },

    // Navigation (mostly unchanged but color/harmony improved)
    nav: {
      backgroundColor: 'transparent',
      padding: '1rem 1.5rem',
      zIndex: 3,
      position: 'relative'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.9rem',
      fontWeight: '700',
      color: '#F7EFE6',
      textShadow: '0 1px 0 rgba(0,0,0,0.15)'
    },

    // Hero
    hero: {
      padding: '4rem 1.25rem',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
    },
    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '3rem',
      width: '100%',
      flexWrap: 'wrap'
    },
    heroContent: {
      flex: '1 1 480px',
      textAlign: 'left',
      maxWidth: '650px',
      zIndex: 2
    },
    heroImageContainer: {
      flex: '1 1 360px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      zIndex: 2,
      minWidth: '320px'
    },
    heroImage: {
      width: '100%',
      maxWidth: '420px',
      height: 'auto',
      borderRadius: '18px',
      boxShadow: '0 30px 60px rgba(24,18,14,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
      transform: 'translateY(0)',
      transition: 'transform 0.45s cubic-bezier(.2,.9,.2,1), box-shadow 0.35s ease',
      zIndex: 2
    },
    heroImageHover: {
      transform: 'translateY(-6px) scale(1.02)'
    },

    heroTitle: {
      fontSize: '3.2rem',
      fontWeight: '700',
      marginBottom: '1rem',
      lineHeight: '1.05',
      color: '#2e1f1a',
      fontFamily: "Arial, sans-serif",
      textShadow: '0 2px 0 rgba(255,255,255,0.02)'
    },
    heroText: {
      fontSize: '1.125rem',
      color: '#3a2b27',
      marginBottom: '2rem',
      opacity: 0.95,
      lineHeight: '1.7',
    },

    heroButtons: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      textDecoration: 'none',
      background: 'linear-gradient(135deg, #664f46ff 0%, #694e4eff 25%, #4d271dff 50%, #523232ff 75%, #6a3e2cff 100%)',
      color: '#F7EFE6',
      padding: '0.9rem 1.75rem',
      borderRadius: '12px',
      border: '1px solid rgba(60,40,30,0.25)',
      boxShadow: '0 8px 20px rgba(59,47,44,0.18)',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.24s ease, box-shadow 0.24s ease'
    },
    btnPrimaryHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 18px 40px rgba(59,47,44,0.22)'
    },
    btnSecondary: {
      textDecoration: 'none',
      background: 'linear-gradient(135deg, #664f46ff 0%, #694e4eff 25%, #4d271dff 50%, #523232ff 75%, #6a3e2cff 100%)',
      color: '#F7EFE6',
      padding: '0.9rem 1.75rem',
      borderRadius: '12px',
      border: '1px solid rgba(60,40,30,0.25)',
      boxShadow: '0 8px 20px rgba(59,47,44,0.18)',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.24s ease, box-shadow 0.24s ease',
    },


    // How It Works
    howItWorks: {
      padding: '5rem 1.5rem',
      background: 'linear-gradient(135deg, #664f46ff 0%, #694e4eff 25%, #4d271dff 50%, #523232ff 75%, #6a3e2cff 100%)',
      zIndex: 2
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '2.2rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '3rem',
      color: '#2e1f1a'
    },
    sectionTitleLight: {
      fontSize: '2.2rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '3rem',
      color: '#F7EFE6',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    steps: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '2rem'
    },
    step: {
      textAlign: 'center',
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))',
      boxShadow: '0 10px 30px rgba(45,34,30,0.08)',
      border: '1px solid rgba(16,10,8,0.04)',
      transform: 'translateX(100px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    stepDark: {
      textAlign: 'center',
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      transform: 'translateX(100px)',
      opacity: 0,
      transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    stepIcon: {
      backgroundColor: '#3b2f2f',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      boxShadow: '0 6px 18px rgba(45,34,30,0.12)'
    },
    stepTitle: {
      fontSize: '1.125rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#3b2f2f'
    },
    stepTitleLight: {
      fontSize: '1.125rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#F7EFE6'
    },
    stepText: {
      color: '#4b3933',
      fontSize: '0.99rem',
      lineHeight: '1.6'
    },
    stepTextLight: {
      color: '#E0D5CC',
      fontSize: '0.99rem',
      lineHeight: '1.6'
    },

    // Features
    features: {
      padding: '4rem 1.5rem',
      zIndex: 2
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    featureCard: {
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #664f46ff 0%, #694e4eff 25%, #4d271dff 50%, #523232ff 75%, #6a3e2cff 100%)',
      boxShadow: '0 15px 35px rgba(4, 4, 4, 0.3)',
      border: '1px solid rgba(3, 1, 1, 0.1)',
      backdropFilter: 'blur(10px)',
      transform: 'translateX(100px)',
      opacity: 0,
      transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    featureTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#F7EFE6',
      marginBottom: '0.75rem',
      textAlign: 'center'
    },
    featureText: {
      fontSize: '1.1rem',
      color: '#E0D5CC',
      textAlign: 'center',
      lineHeight: '1.6'
    },

    // CTA / Footer
    cta: {
      padding: '6rem 1.5rem',
      background: 'linear-gradient(180deg, rgba(109, 78, 64, 0.15), rgba(148, 114, 104, 0.2))',
      textAlign: 'center',
      borderTop: '1px solid rgba(59, 47, 44, 0.1)',
      position: 'relative'
    },
    ctaTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#2e1f1a'
    },
    ctaText: {
      fontSize: '1rem',
      color: '#251c1cff',
      marginBottom: '1.5rem'
    },
    footer: {
      padding: '1.5rem 1.5rem',
      backgroundColor: '#3b2f2f',
      color: '#f4ebe0',
      zIndex: 2,
      borderTop: '1px solid rgba(255,255,255,0.03)'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      '@media (max-width: 480px)': {
        gridTemplateColumns: '1fr'
      }
    },
    footerTitle: {
      marginBottom: '0.5rem',
      fontWeight: '700',
      color: '#f7efe6',
      fontSize: '1rem'
    },
    footerLink: {
      color: '#e8d9cc',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '0.5rem'
    }
  };

  // small helper for button hover effects using inline style merge
  const merge = (a, b) => ({ ...a, ...b });

  // local state for hover effects and animations
  const [heroHover, setHeroHover] = React.useState(false);
  const [primaryHover, setPrimaryHover] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  // Intersection Observer for animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = 'translateX(0)';
            entry.target.style.opacity = '1';
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.animate-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div style={styles.body}>
      <div style={styles.pageWrap}>
        {/* decorative layers */}
        <div style={styles.noiseOverlay} aria-hidden="true" />
        <div style={styles.heroGlow} aria-hidden="true" />

        {/* Enhanced CSS for animations & responsive design */}
        <style>{`
          * {
            font-family: 'Arial', sans-serif !important;
          }

          /* Hide scrollbar */
          html, body {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
          
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none; /* Chrome, Safari, Opera */
          }

          .fade-up {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .fade-up.delay-1 { animation-delay: 0.2s; }
          .fade-up.delay-2 { animation-delay: 0.4s; }
          .fade-up.delay-3 { animation-delay: 0.6s; }

          @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-card {
            transition-delay: 0.3s;
          }
          .animate-card:nth-child(2) { transition-delay: 0.6s; }
          .animate-card:nth-child(3) { transition-delay: 0.9s; }
          .animate-card:nth-child(4) { transition-delay: 1.2s; }
          .animate-card:nth-child(5) { transition-delay: 1.5s; }
          .animate-card:nth-child(6) { transition-delay: 1.8s; }

          @media (max-width: 880px) {
            .heroTitle { font-size: 2rem !important; text-align: center; }
            .heroText { text-align: center; }
          }

          @media (max-width: 768px) {
            .features-grid {
              grid-template-columns: 1fr !important;
            }
          }

          img { image-rendering: auto; -webkit-font-smoothing: antialiased; }

          .card-hover:hover { 
            transform: translateY(-6px) !important; 
            box-shadow: 0 18px 40px rgba(20,12,10,0.1) !important;
          }
        `}</style>

        {/* Navigation (kept as your Navbar component so logic remains same) */}
        <Navbar />

        {/* Hero Section */}
        <section style={styles.hero} className="fade-up delay-1">
          <div style={styles.heroContainer}>
            <div style={styles.heroContent}>
              <h1 style={{ ...styles.heroTitle }} className="heroTitle">Share a skill, Learn another!</h1>
              <p style={styles.heroText}>
                Join a community where knowledge is the new currency. Barter your expertise,
                from coding to cooking, and unlock a world of learning.
              </p>

              <div style={styles.heroButtons}>
                <Link
                  to="/auth"
                  style={merge(styles.btnPrimary, primaryHover ? styles.btnPrimaryHover : {})}
                  onMouseEnter={() => setPrimaryHover(true)}
                  onMouseLeave={() => setPrimaryHover(false)}
                >
                  Get Started
                </Link>

                <button
                  style={styles.btnSecondary}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 18px 40px rgba(59,47,44,0.22)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59,47,44,0.18)';
                  }}
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See How It Works
                </button>

              </div>
            </div>

            <div
              style={styles.heroImageContainer}
              onMouseEnter={() => setHeroHover(true)}
              onMouseLeave={() => setHeroHover(false)}
            >
              <img
                src={Limage}
                alt="People sharing skills and learning together"
                style={heroHover ? merge(styles.heroImage, styles.heroImageHover) : styles.heroImage}
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={styles.howItWorks} className="fade-up delay-2">
          <div style={styles.container}>
            <h2 style={styles.sectionTitleLight}>How Brain Barter Works</h2>

            <div style={styles.steps}>
              <div style={styles.stepDark} className="card-hover animate-card">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 style={styles.stepTitleLight}>1. Offer Your Skill</h3>
                <p style={styles.stepTextLight}>Create a profile and list the skills you're willing to teach. Make a real impact with your expertise.</p>
              </div>

              <div style={styles.stepDark} className="card-hover animate-card">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 style={styles.stepTitleLight}>2. Find a Skill</h3>
                <p style={styles.stepTextLight}>Browse or search for skills you want to learn. Connect with experts in your area.</p>
              </div>

              <div style={styles.stepDark} className="card-hover animate-card">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 style={styles.stepTitleLight}>3. Exchange & Grow</h3>
                <p style={styles.stepTextLight}>Arrange a barter. Share your knowledge, learn something new, and build lasting connections.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={styles.features} className="fade-up delay-3">
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Why Choose Brain Barter?</h2>

            <div style={styles.featuresGrid} className="features-grid">
              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Free Learning</h3>
                <p style={styles.featureText}>No monetary transactions. Exchange skills directly and remove financial barriers to learning.</p>
              </div>

              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Smart Matching</h3>
                <p style={styles.featureText}>Our intelligent algorithm connects you with the perfect skill exchange partners.</p>
              </div>

              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Trust & Safety</h3>
                <p style={styles.featureText}>Verified profiles, ratings, and reviews ensure quality and accountable exchanges.</p>
              </div>

              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Flexible Credits</h3>
                <p style={styles.featureText}>Earn credits by teaching, use them to learn any skill. No direct reciprocity required.</p>
              </div>

              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Built-in Communication</h3>
                <p style={styles.featureText}>Integrated messaging and scheduling tools make coordinating sessions seamless.</p>
              </div>

              <div style={styles.featureCard} className="card-hover animate-card">
                <h3 style={styles.featureTitle}>Community Driven</h3>
                <p style={styles.featureText}>Join a network of learners and teachers building meaningful connections.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.cta} className="fade-up delay-2">
          <div style={styles.container}>
            <h2 style={styles.ctaTitle}>Ready to Start Your Learning Journey?</h2>
            <p style={styles.ctaText}>Join thousands of learners and teachers in our growing community.</p>
            <Link 
              to="/auth" 
              style={merge(styles.btnPrimary, primaryHover ? styles.btnPrimaryHover : {}, { marginTop: 8 })}
              onMouseEnter={() => setPrimaryHover(true)}
              onMouseLeave={() => setPrimaryHover(false)}
            >
              Join Brain Barter Today!
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.container}>
            <p style={{ textAlign: 'center', color: '#B8A394', fontSize: '0.9rem' }}>&copy; 2025 Brain Barter. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}


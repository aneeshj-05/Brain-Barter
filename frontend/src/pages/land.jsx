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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      fontFamily: "DM Serif Display, Georgia, serif",
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
      background: 'linear-gradient(135deg, #f1e6db, #e4cfb8)',
      color: '#3b2f2f',
      padding: '0.9rem 1.75rem',
      borderRadius: '12px',
      border: '1px solid rgba(60,40,30,0.25)',
      boxShadow: '0 8px 20px rgba(59,47,44,0.18)',
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
  background: 'rgba(255,255,255,0.02)',
  color: '#4b3b34',
  padding: '0.85rem 1.6rem',
  borderRadius: '12px',
  border: '1px solid rgba(80, 60, 50, 0.35)',
  backdropFilter: 'blur(4px)',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.24s ease',
},


    // How It Works
    howItWorks: {
      padding: '5rem 1.5rem',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.02))',
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
      border: '1px solid rgba(16,10,8,0.04)'
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
    stepText: {
      color: '#4b3933',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.5rem'
    },
    featureCard: {
      padding: '1.5rem',
      borderRadius: '12px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))',
      boxShadow: '0 8px 24px rgba(40,30,26,0.06)',
      border: '1px solid rgba(20,12,10,0.04)'
    },
    featureTitle: {
      fontSize: '1.125rem',
      fontWeight: '700',
      color: '#2e1f1a',
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    featureText: {
      fontSize: '0.98rem',
      color: '#49322c',
      textAlign: 'center'
    },

    // CTA / Footer
    cta: {
      padding: '4rem 1.5rem',
      background: 'linear-gradient(180deg, rgba(61,44,38,0.06), rgba(61,44,38,0.08))',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#2e1f1a'
    },
    ctaText: {
      fontSize: '1rem',
      color: '#3b2f2f',
      marginBottom: '1.5rem'
    },
    footer: {
      padding: '3rem 1.5rem',
      backgroundColor: '#3b2f2f',
      color: '#f4ebe0',
      zIndex: 2,
      borderTop: '1px solid rgba(255,255,255,0.03)'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '1rem'
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

  // local state for a tiny hover visual on the hero image and buttons
  const [heroHover, setHeroHover] = React.useState(false);
  const [primaryHover, setPrimaryHover] = React.useState(false);

  return (
    <div style={styles.body}>
      <div style={styles.pageWrap}>
        {/* decorative layers */}
        <div style={styles.noiseOverlay} aria-hidden="true" />
        <div style={styles.heroGlow} aria-hidden="true" />

        {/* small injected CSS for animations & responsive fixes */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;600;700&display=swap');

          .fade-up {
            opacity: 0;
            transform: translateY(18px);
            animation: fadeUp 0.9s forwards;
          }
          .fade-up.delay-1 { animation-delay: 0.12s; }
          .fade-up.delay-2 { animation-delay: 0.22s; }
          .fade-up.delay-3 { animation-delay: 0.32s; }

          @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 880px) {
            .heroTitle { font-size: 2rem !important; text-align: center; }
            .heroText { text-align: center; }
          }

          /* make sure imgs are crisp on retina */
          img { image-rendering: auto; -webkit-font-smoothing: antialiased; }

          /* subtle hover shadow for cards */
          .card-hover:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(20,12,10,0.1); }
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
    e.target.style.background = 'rgba(240, 220, 200, 0.1)';
    e.target.style.border = '1px solid rgba(80, 60, 50, 0.5)';
  }}
  onMouseLeave={(e) => {
    e.target.style.background = 'rgba(255,255,255,0.02)';
    e.target.style.border = '1px solid rgba(80, 60, 50, 0.35)';
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
            <h2 style={styles.sectionTitle}>How Brain Barter Works</h2>

            <div style={styles.steps}>
              <div style={styles.step} className="card-hover">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 style={styles.stepTitle}>1. Offer Your Skill</h3>
                <p style={styles.stepText}>Create a profile and list the skills you're willing to teach. Make a real impact with your expertise.</p>
              </div>

              <div style={styles.step} className="card-hover">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 style={styles.stepTitle}>2. Find a Skill</h3>
                <p style={styles.stepText}>Browse or search for skills you want to learn. Connect with experts in your area.</p>
              </div>

              <div style={styles.step} className="card-hover">
                <div style={styles.stepIcon}>
                  <svg width="28" height="28" fill="none" stroke="#F7EFE6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 style={styles.stepTitle}>3. Exchange & Grow</h3>
                <p style={styles.stepText}>Arrange a barter. Share your knowledge, learn something new, and build lasting connections.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={styles.features} className="fade-up delay-3">
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Why Choose Brain Barter?</h2>

            <div style={styles.featuresGrid}>
              <div style={styles.featureCard} className="card-hover">
                <h3 style={styles.featureTitle}>Free Learning</h3>
                <p style={styles.featureText}>No monetary transactions. Exchange skills directly and remove financial barriers to learning.</p>
              </div>

              <div style={styles.featureCard} className="card-hover">
                <h3 style={styles.featureTitle}>Smart Matching</h3>
                <p style={styles.featureText}>Our intelligent algorithm connects you with the perfect skill exchange partners.</p>
              </div>

              <div style={styles.featureCard} className="card-hover">
                <h3 style={styles.featureTitle}>Trust & Safety</h3>
                <p style={styles.featureText}>Verified profiles, ratings, and reviews ensure quality and accountable exchanges.</p>
              </div>

              <div style={styles.featureCard} className="card-hover">
                <h3 style={styles.featureTitle}>Flexible Credits</h3>
                <p style={styles.featureText}>Earn credits by teaching, use them to learn any skill. No direct reciprocity required.</p>
              </div>

              <div style={styles.featureCard} className="card-hover">
                <h3 style={styles.featureTitle}>Built-in Communication</h3>
                <p style={styles.featureText}>Integrated messaging and scheduling tools make coordinating sessions seamless.</p>
              </div>

              <div style={styles.featureCard} className="card-hover">
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
            <Link to="/auth" style={{ ...styles.btnPrimary, marginTop: 8 }}>Join Brain Barter Today!</Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.container}>
            <div style={styles.footerGrid}>
              <div>
                <h3 style={styles.footerTitle}>Brain Barter</h3>
                <p style={{ color: '#e6d6c9' }}>Democratizing knowledge sharing through community-driven skill exchanges.</p>
              </div>

              <div>
                <h4 style={styles.footerTitle}>Platform</h4>
                <a href="#" style={styles.footerLink}>Browse Skills</a>
                <a href="#how-it-works" style={styles.footerLink}>How It Works</a>
                <a href="#" style={styles.footerLink}>Success Stories</a>
              </div>

              <div>
                <h4 style={styles.footerTitle}>Community</h4>
                <a href="#" style={styles.footerLink}>Guidelines</a>
                <a href="#" style={styles.footerLink}>Safety</a>
                <a href="#" style={styles.footerLink}>Support</a>
              </div>

              <div>
                <h4 style={styles.footerTitle}>Company</h4>
                <a href="#" style={styles.footerLink}>About Us</a>
                <a href="#" style={styles.footerLink}>Contact</a>
                <a href="#" style={styles.footerLink}>Privacy</a>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', color: '#d8c9bd' }}>
              <p>&copy; 2025 Brain Barter. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


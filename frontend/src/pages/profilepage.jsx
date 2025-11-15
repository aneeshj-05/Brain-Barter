import React, { useState, useEffect,useContext} from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import toast from 'react-hot-toast'; // Import toast
import { Star } from 'lucide-react'; // --- NEW ---

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // profile data and a copy so we can cancel edits
  const [profileData, setProfileData] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);

  // NEW: States for skill editing - MOVED TO TOP LEVEL
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#402E2A';
    document.documentElement.style.backgroundColor = '#402E2A';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);



  // --- NEW --- We need to populate reviews on fetch
  useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const endpoint = userId ? `http://localhost:5000/api/user/${userId}` : 'http://localhost:5000/api/user/me';
      const res = await axios.get(endpoint, {
        headers: { 'x-auth-token': token },
      });
      
      setIsOwnProfile(!userId);

      // Defensive null-check in case backend returns nothing
      if (!res.data) {
        console.warn("No user data found, logging out...");
        logout();
        toast.error("Session expired or account not found. Please log in again.");
        navigate('/auth');
        return;
      }

      // Safe data fallback
      const safeData = {
        ...res.data,
        skills: res.data.skills || [],
        skillsWanted: res.data.skillsWanted || [],
        reviews: res.data.reviews || [],
      };

      setProfileData(safeData);
      setOriginalProfile(safeData);
    } catch (err) {
      console.error('Could not fetch profile', err);

      // 🔹 Handle invalid/expired token or missing user gracefully
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        logout();
        toast.error("Your session has expired. Please log in again.");
        navigate('/auth');
      } else {
        toast.error("Failed to load profile. Please try again later.");
      }
    }
  };

  fetchProfile();
}, [logout, navigate, userId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsEditing(false);
    setOriginalProfile(profileData);
    toast.success('Profile updated successfully!'); // Replaced alert
  };

  const handleCancel = () => {
    setProfileData(originalProfile);
    setIsEditing(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  // NEW: Skill management functions
  const handleAddTeachSkill = () => {
    if (teachSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), teachSkill.trim()]
      }));
      setTeachSkill('');
    }
  };

  const handleAddLearnSkill = () => {
    if (learnSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skillsWanted: [...(prev.skillsWanted || []), learnSkill.trim()]
      }));
      setLearnSkill('');
    }
  };

  const handleRemoveTeachSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveLearnSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
    }));
  };

  const handleSaveSkills = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.put('http://localhost:5000/api/user/skills', {
        skills: profileData.skills || [],
        skillsWanted: profileData.skillsWanted || []
      }, {
        headers: { 'x-auth-token': token }
      });
      setIsEditing(false);
      setOriginalProfile(profileData);
      toast.success('Skills updated successfully!'); // Replaced alert
    } catch (err) {
      console.error('Failed to update skills', err);
      toast.error('Failed to update skills'); // Replaced alert
    }
  };
  
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    sessionStorage.setItem('justLoggedOut', 'true');
    navigate('/'); 
    toast.success('Logged out successfully!');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you sure?'
    );
    
    if (!confirmed) return;

    const password = window.prompt('Please enter your password to confirm deletion:');
    
    if (!password) {
      toast.error('Account deletion cancelled.'); // Replaced alert
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete('http://localhost:5000/api/auth/delete', {
        headers: { 'x-auth-token': token },
        data: {
          email: profileData.email,
          password: password
        }
      });

      toast.success('Account deleted successfully.'); // Replaced alert
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account', err);
      // Replaced alert
      toast.error(err.response?.data?.message || 'Failed to delete account. Please check your password.'); 
    }
  };

  const styles = {
    body: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      lineHeight: '1.6',
      margin: 0,
      padding: 0,
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    nav: {
      backgroundColor: '#402E2A',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #947C70',
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      cursor: 'pointer',
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    navLink: {
      color: '#EDE3DB',
      textDecoration: 'none',
      transition: 'color 0.3s',
      opacity: 0.8,
      cursor: 'pointer',
    },
    main: {
      flex: 1,
      overflowY: 'auto',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      display: 'flex',
      gap: '2rem',
      width: '100%',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    profileCard: {
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      backgroundColor: '#402E2A',
      margin: '0 auto 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: '#EDE3DB',
      fontWeight: 'bold',
    },
    profileName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '0.5rem',
    },
    profileLocation: {
      color: '#402E2A',
      marginBottom: '1rem',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    statBox: {
      backgroundColor: '#402E2A',
      padding: '1rem',
      borderRadius: '0.5rem',
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      display: 'block',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#d7beaaff',
      opacity: 0.8,
    },
    tabsContainer: {
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    tab: {
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontWeight: '500',
    },
    activeTab: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      color: '#402E2A',
      opacity: 0.8,
    },
    content: {
      flex: '1',
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    contentTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      color: '#402E2A',
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: '1rem',
    },
    input: {
      width: '100%',
      padding: '0.875rem',
      border: '2px solid #d7beaaff',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      outline: 'none',
      transition: 'border-color 0.3s',
    },
    textarea: {
      width: '100%',
      padding: '0.875rem',
      border: '2px solid #d7beaaff',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    readOnlyText: {
      padding: '0.875rem',
      backgroundColor: '#EDE3DB',
      borderRadius: '0.75rem',
      border: '2px solid #d7beaaff',
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    skillTag: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.9rem',
      fontWeight: '500',
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
    },
    saveButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: '2px solid #402E2A',
      color: '#402E2A',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
    },
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    activityItem: {
      backgroundColor: '#EDE3DB',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #d7beaaff',
    },
    activityTitle: {
      fontWeight: '600',
      color: '#402E2A',
      marginBottom: '0.5rem',
    },
    // ... your existing styles (activityDate is probably the last one)
    activityDate: {
      fontSize: '0.9rem',
      color: '#402E2A',
      opacity: 0.7,
    },
    // --- NEW ---
    reviewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    reviewAuthor: {
      fontWeight: '600',
      color: '#402E2A',
    },
    reviewRating: {
      display: 'flex',
      gap: '0.2rem'
    },
    reviewComment: {
      fontSize: '0.95rem',
      color: '#402E2A',
      lineHeight: 1.5,
      fontStyle: 'italic'
    },
    reviewTimestamp: {
      fontSize: '0.8rem',
      color: '#402E2A',
      opacity: 0.7,
      marginTop: '0.75rem'
    },
    settingsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    settingCard: {
      backgroundColor: '#EDE3DB',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #d7beaaff',
    },
    settingTitle: {
      fontWeight: '600',
      color: '#402E2A',
      marginBottom: '0.5rem',
      fontSize: '1.1rem',
    },
    settingDescription: {
      fontSize: '0.9rem',
      color: '#402E2A',
      opacity: 0.7,
      marginBottom: '1rem',
    },
    logoutButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background-color 0.3s',
    },
    deleteButton: {
      backgroundColor: '#402E2A', // Changed to match your theme, will use hover for red
      color: '#ffffff',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background-color 0.3s',
    },
    warningText: {
      color: '#dc2626',
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: '0.5rem',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(64, 46, 42, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#EDE3DB',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: '1rem',
      color: '#402E2A',
      marginBottom: '2rem',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    modalCancelButton: {
      backgroundColor: 'transparent',
      border: '2px solid #402E2A',
      color: '#402E2A',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
    },
    modalConfirmButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
    },
  };

  if (!profileData) {
    return (
      <div style={{ color: '#402E2A', textAlign: 'center', padding: '5rem', background: '#EDE3DB' }}>
        Loading Profile...
      </div>
    );
  }

  const renderOverview = () => (
    <div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Full Name</label>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              style={styles.input}
              type="text"
              name="firstName"
              value={profileData.firstName || ''}
              onChange={handleInputChange}
              placeholder="First name"
            />
            <input
              style={styles.input}
              type="text"
              name="lastName"
              value={profileData.lastName || ''}
              onChange={handleInputChange}
              placeholder="Last name"
            />
          </div>
        ) : (
          <div style={styles.readOnlyText}>
            {`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Name not set'}
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email</label>
        {isEditing ? (
          <input
            style={styles.input}
            type="email"
            name="email"
            value={profileData.email || ''}
            onChange={handleInputChange}
            placeholder="Email address"
          />
        ) : (
          <div style={styles.readOnlyText}>{profileData.email || 'Email not set'}</div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Location</label>
        {isEditing ? (
          <input
            style={styles.input}
            type="text"
            name="location"
            value={profileData.location || ''}
            onChange={handleInputChange}
            placeholder="City, State"
          />
        ) : (
          <div style={styles.readOnlyText}>{profileData.location || 'Location not set'}</div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Bio</label>
        {isEditing ? (
          <textarea
            style={styles.textarea}
            name="bio"
            value={profileData.bio || ''}
            onChange={handleInputChange}
            placeholder="Tell others about yourself..."
          />
        ) : (
          <div style={styles.readOnlyText}>{profileData.bio || 'No bio yet.'}</div>
        )}
      </div>

      {isEditing && (
        <div style={styles.actionButtons}>
          <button style={styles.saveButton} onClick={handleSave}>
            Save Changes
          </button>
          <button style={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Skills I Can Teach</label>
        {isEditing ? (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                style={styles.input}
                type="text"
                placeholder="Add a skill (e.g., React)"
                value={teachSkill}
                onChange={(e) => setTeachSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeachSkill()}
              />
              <button 
                style={styles.editButton}
                onClick={handleAddTeachSkill}
              >
                Add
              </button>
            </div>
            <div style={styles.skillsContainer}>
              {(profileData.skills || []).map((skill, index) => (
                <span 
                  key={index} 
                  style={{ ...styles.skillTag, cursor: 'pointer' }}
                  onClick={() => handleRemoveTeachSkill(index)}
                  title="Click to remove"
                >
                  {skill} ✕
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.skillsContainer}>
            {profileData.skills && profileData.skills.length > 0 ? (
              profileData.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))
            ) : (
              <p>No skills listed to teach yet.</p>
            )}
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Skills I Want to Learn</label>
        {isEditing ? (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                style={styles.input}
                type="text"
                placeholder="Add a skill you want to learn"
                value={learnSkill}
                onChange={(e) => setLearnSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLearnSkill()}
              />
              <button 
                style={styles.editButton}
                onClick={handleAddLearnSkill}
              >
                Add
              </button>
            </div>
            <div style={styles.skillsContainer}>
              {(profileData.skillsWanted || []).map((skill, index) => (
                <span 
                  key={index} 
                  style={{ 
                    ...styles.skillTag, 
                    backgroundColor: '#d7beaaff', 
                    color: '#402E2A',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRemoveLearnSkill(index)}
                  title="Click to remove"
                >
                  {skill} ✕
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.skillsContainer}>
            {profileData.skillsWanted && profileData.skillsWanted.length > 0 ? (
              profileData.skillsWanted.map((skill, index) => (
                <span key={index} style={{ ...styles.skillTag, backgroundColor: '#d7beaaff', color: '#402E2A' }}>
                  {skill}
                </span>
              ))
            ) : (
              <p>No skills listed to learn yet.</p>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={styles.actionButtons}>
          <button style={styles.saveButton} onClick={handleSaveSkills}>
            Save Skills
          </button>
          <button style={styles.cancelButton} onClick={() => {
            setProfileData(originalProfile);
            setIsEditing(false);
          }}>
            Cancel
          </button>
        </div>
      ) : (
        <button style={styles.editButton} onClick={() => setIsEditing(true)}>
          Manage Skills
        </button>
      )}
    </div>
  );

  // --- MODIFIED ---
  const renderActivity = () => (
    <div>
      <div style={styles.activityList}>
        {profileData.reviews && profileData.reviews.length > 0 ? (
          profileData.reviews.map(review => (
            <div style={styles.activityItem} key={review._id}>
              <div style={styles.reviewHeader}>
                <span style={styles.reviewAuthor}>
                  {review.fromUser ? `${review.fromUser.firstName} ${review.fromUser.lastName}` : 'Anonymous User'}
                </span>
                <span style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      color={i < review.rating ? '#ffc107' : '#947C70'}
                      fill={i < review.rating ? '#ffc107' : 'none'}
                    />
                  ))}
                </span>
              </div>
              <p style={styles.reviewComment}>"{review.comment || 'No comment left.'}"</p>
              <div style={styles.reviewTimestamp}>
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p>No activity or reviews yet.</p>
        )}
      </div>
    </div>
  );

  // --- NEW ---
const renderSettings = () => (
  <div style={styles.settingsSection}>
    {/* 🔹 Account Settings */}
    <div style={styles.settingCard}>
      <div style={styles.settingTitle}>Change Password</div>
      <div style={styles.settingDescription}>
        Update your account password regularly to keep your account secure.
      </div>
      <button
        style={styles.logoutButton}
        onClick={() => toast('Password change functionality coming soon! 🔐')}
      >
        Change Password
      </button>
    </div>

    {/* 🔹 Logout */}
    <div style={styles.settingCard}>
      <div style={styles.settingTitle}>Logout</div>
      <div style={styles.settingDescription}>
        Safely log out of Brain Barter. You can log back in anytime.
      </div>
      <button
        style={styles.logoutButton}
        onClick={handleLogout}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#593b36')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#402E2A')}
      >
        Logout
      </button>
    </div>

    {/* 🔹 Delete Account */}
    <div style={styles.settingCard}>
      <div style={styles.settingTitle}>Delete Account</div>
      <div style={styles.settingDescription}>
        Permanently delete your account and all associated data.
        This action cannot be undone.
      </div>
      <button
        style={styles.deleteButton}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#dc2626')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#402E2A')}
        onClick={handleDeleteAccount}
      >
        Delete My Account
      </button>
      <div style={styles.warningText}>
        ⚠️ Once deleted, your data cannot be recovered.
      </div>
    </div>
  </div>
);

  
  const avatarLetters =
    `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div style={styles.body}>
      <Navbar />
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>Logout Confirmation</div>
            <div style={styles.modalMessage}>
              Are you sure you want to logout?
            </div>
            <div style={styles.modalButtons}>
              <button 
                style={styles.modalCancelButton}
                onClick={cancelLogout}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#402E2A';
                  e.target.style.color = '#EDE3DB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#402E2A';
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.modalConfirmButton}
                onClick={confirmLogout}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#593b36'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#402E2A'}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={styles.main}className="scrollable-main">
        <div style={styles.sidebar}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>{avatarLetters}</div>
            <h2 style={styles.profileName}>
              {profileData.firstName || ''} {profileData.lastName || ''}
            </h2>
            <p style={styles.profileLocation}>📍 {profileData.location || 'Location not set'}</p>

            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                {/* --- MODIFIED --- (Using matches.length as a proxy for exchanges) */}
                <span style={styles.statNumber}>{profileData.matches ? profileData.matches.length : 0}</span>
                <span style={styles.statLabel}>Matches</span>
              </div>
              <div style={styles.statBox}>
                {/* --- MODIFIED --- */}
                <span style={styles.statNumber}>
                  {(profileData.rating ?? 0).toFixed(1)}
                </span>
                <span style={styles.statLabel}>Rating</span>
              </div>
              <div style={styles.statBox}>
                {/* --- MODIFIED --- (Showing real credits) */}
                <span style={styles.statNumber}>{profileData.credits ?? 0}</span>
                <span style={styles.statLabel}>Credits</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNumber}>
                  {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : '—'}
                </span>
                <span style={styles.statLabel}>Joined</span>
              </div>
            </div>
          </div>

          <div style={styles.tabsContainer}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'skills', label: 'Skills' },
              { id: 'activity', label: 'Activity' },
              ...(isOwnProfile ? [{ id: 'settings', label: 'Settings' }] : []),
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => handleTabClick(t.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === t.id ? styles.activeTab : styles.inactiveTab),
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.contentTitle}>
            <div>
              {activeTab === 'overview' && 'Profile Overview'}
              {activeTab === 'skills' && 'My Skills'}
              {activeTab === 'activity' && 'Recent Activity'}
              {activeTab === 'settings' && 'Account Settings'}
            </div>

            {activeTab === 'overview' && isOwnProfile && (
              <button style={styles.editButton} onClick={() => setIsEditing((s) => !s)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'skills' && renderSkills()}
          {/* --- MODIFIED --- renderActivity is now dynamic */}
          {activeTab === 'activity' && renderActivity()}
          {isOwnProfile && activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}
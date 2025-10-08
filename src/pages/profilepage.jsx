import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // 1. Initialize profileData as null to show a loading state
  const [profileData, setProfileData] = useState(null);

  // 2. This useEffect hook fetches the user's data when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/user/me', {
            headers: {
              'x-auth-token': token, // Send the token for authentication
            },
          });
          setProfileData(res.data); // Set the fetched user data
        } catch (err) {
          console.error('Could not fetch profile', err);
        }
      }
    };

    fetchProfile();
  }, []); // The empty array ensures this runs only once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // You would add an API call here to save the updated data to the backend
    alert('Profile updated successfully!');
  };

  // Your styles object remains exactly the same.
  const styles = {
    body: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#EDE3DB',
        color: '#402E2A',
        lineHeight: '1.6',
        margin: 0,
        padding: 0,
        width:"2100px",
        minHeight: '100vh',
        overflowX:'hidden'
    },
    // ... PASTE ALL YOUR OTHER STYLES HERE ...
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
      fontSize: '1.5rem',
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
      cursor: 'pointer'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      display: 'flex',
      gap: '2rem'
    },
    sidebar: {
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    profileCard: {
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
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
      fontWeight: 'bold'
    },
    profileName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '0.5rem'
    },
    profileLocation: {
      color: '#402E2A',
      opacity: 0.8,
      marginBottom: '1rem'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    statBox: {
      backgroundColor: '#402E2A',
      padding: '1rem',
      borderRadius: '0.5rem',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#EDE3DB',
      display: 'block'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#d7beaaff',
      opacity: 0.8
    },
    tabsContainer: {
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    tab: {
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontWeight: '500'
    },
    activeTab: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB'
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      color: '#402E2A',
      opacity: 0.8
    },
    content: {
      flex: '1',
      backgroundColor: '#947C70',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    contentTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#402E2A',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    editButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '600',
      height:'50px'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      color: '#402E2A',
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: '0.9rem'
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
      transition: 'border-color 0.3s'
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
      fontFamily: 'inherit'
    },
    readOnlyText: {
      padding: '0.875rem',
      backgroundColor: '#EDE3DB',
      borderRadius: '0.5rem',
      border: '2px solid #d7beaaff'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    skillTag: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    saveButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.75rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: '2px solid #402E2A',
      color: '#402E2A',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    activityItem: {
      backgroundColor: '#EDE3DB',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #d7beaaff'
    },
    activityTitle: {
      fontWeight: '600',
      color: '#402E2A',
      marginBottom: '0.5rem'
    },
    activityDate: {
      fontSize: '0.9rem',
      color: '#402E2A',
      opacity: 0.7
    },
  };

  // 3. Add a loading state to prevent errors before data arrives
  if (!profileData) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading Profile...</div>;
  }

  const renderOverview = () => (
    <div>
       <div style={styles.formGroup}>
         <label style={styles.label}>Full Name</label>
         {isEditing ? (
           <div style={{display: 'flex', gap: '1rem'}}>
            <input
               style={styles.input}
               type="text"
               name="firstName"
              value={profileData.firstName}
               onChange={handleInputChange}
               placeholder="First name"
             />
             <input
               style={styles.input}
               type="text"
               name="lastName"
              value={profileData.lastName}
               onChange={handleInputChange}
               placeholder="Last name"
             />
           </div>
         ) : (
           <div style={styles.readOnlyText}>
            {profileData.firstName} {profileData.lastName}
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
             value={profileData.email}
             onChange={handleInputChange}
             placeholder="Email address"
           />
         ) : (
           <div style={styles.readOnlyText}>
             {profileData.email}
           </div>
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
           <div style={styles.readOnlyText}>
            {profileData.location || 'Location not set'}
           </div>
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
           <div style={styles.readOnlyText}>
             {profileData.bio || 'No bio yet.'}
           </div>
         )}
       </div>

       {isEditing && (
         <div style={styles.actionButtons}>
           <button style={styles.saveButton} onClick={handleSave}>
             Save Changes
           </button>
           <button style={styles.cancelButton} onClick={() => setIsEditing(false)}>
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
        <div style={styles.skillsContainer}>
          {/* Note: The 'skills' array comes from your User model now */}
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
      </div>
      {/* You can add a 'skillsToLearn' array to your User model if you want this section */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Skills I Want to Learn</label>
        <div style={styles.skillsContainer}>
          {/* Example placeholder */}
          {['Guitar', 'Photography'].map((skill, index) => (
            <span key={index} style={{...styles.skillTag, backgroundColor: '#d7beaaff', color: '#402E2A'}}>
              {skill}
            </span>
          ))}
        </div>
      </div>
      <button style={styles.editButton} onClick={() => setIsEditing(true)}>
        Manage Skills
      </button>
    </div>
  );

  const renderActivity = () => (
    // This section remains static for now, as you'd need to build a backend system to track this.
    <div>
        <div style={styles.activityList}>
            {/* ... Your static activity items ... */}
        </div>
    </div>
  );

  const renderSettings = () => (
    // This section also remains static for now.
    <div>
        {/* ... Your settings form ... */}
    </div>
  );

 return (
    <div style={styles.body}>
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main style={styles.main}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {profileData.firstName[0]}{profileData.lastName[0]}
            </div>
            <h2 style={styles.profileName}>
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p style={styles.profileLocation}>📍 {profileData.location || 'Location not set'}</p>
            {/* The rest of the stats are static for now, as they need backend logic */}
            <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                    <span style={styles.statNumber}>12</span>
                    <span style={styles.statLabel}>Exchanges</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statNumber}>4.8</span>
                    <span style={styles.statLabel}>Rating</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statNumber}>25</span>
                    <span style={styles.statLabel}>Credits</span>
                </div>
                <div style={styles.statBox}>
                    {/* Displaying join date from the database */}
                    <span style={styles.statNumber}>{new Date(profileData.createdAt).toLocaleDateString()}</span>
                    <span style={styles.statLabel}>Joined</span>
                </div>
            </div>
          </div>

          <div style={styles.tabsContainer}>
            {/* ... Your navigation tabs ... */}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={styles.content}>
          <div style={styles.contentTitle}>
              {activeTab === 'overview' && 'Profile Overview'}
              {activeTab === 'skills' && 'My Skills'}
              {activeTab === 'activity' && 'Recent Activity'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'overview' && (
                <button
                  style={styles.editButton}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
          </div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'skills' && renderSkills()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}
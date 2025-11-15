import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ArrowLeft, X } from 'lucide-react';
import api from '../utils/api';

const SkillsExplorer = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillUsers, setSkillUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get('/skills');
        setSkills(response.data.skills);
        setFilteredSkills(response.data.skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = skills.filter(skill =>
        skill.skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
  }, [searchQuery, skills]);

  const handleUsersClick = async (e, skillName) => {
    e.stopPropagation();
    
    if (selectedSkill === skillName) {
      setSelectedSkill(null);
      return;
    }
    
    setSelectedSkill(skillName);
    setLoadingUsers(true);
    
    try {
      const response = await api.get(`/skills/${encodeURIComponent(skillName)}/users`);
      setSkillUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching skill users:', error);
      setSkillUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCloseDropdown = (e) => {
    e.stopPropagation();
    setSelectedSkill(null);
  };

  const styles = {
    container: {
      height: '100vh',
      backgroundColor: '#f5ede6',
      color: '#4b3b34',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    navbar: {
      backgroundColor: '#4b3b34',
      color: '#f5ede6',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    backBtn: {
      backgroundColor: 'transparent',
      border: '2px solid #f5ede6',
      color: '#f5ede6',
      padding: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    main: {
      flex: 1,
      overflowY: 'auto',
      padding: '4rem 2rem 2rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    searchContainer: {
      paddingTop: '0',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'center'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '2px solid #e0d5cc',
      padding: '1rem',
      width: '100%',
      maxWidth: '500px'
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
      marginLeft: '0.5rem',
      backgroundColor: 'transparent'
    },
    statsHeader: {
      marginBottom: '3rem',
      textAlign: 'center'
    },
    totalSkills: {
      paddingTop: '1rem',
      paddingBottom: '0.5rem',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#8b6b5c'
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem'
    },
    skillCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      aspectRatio: '1.5',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    skillName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#4b3b34',
      marginBottom: '0.5rem'
    },
    userCount: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6a5b53',
      fontSize: '1rem'
    },
    usersIcon: {
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '4px',
      transition: 'background-color 0.2s'
    },
    countBadge: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    dropdown: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#fff',
      borderRadius: '12px',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      padding: '0.75rem'
    },
    dropdownHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e0d5cc',
      marginBottom: '0.5rem',
      flexShrink: 0
    },
    dropdownTitle: {
      fontSize: '1.15rem',
      fontWeight: '600',
      color: '#8b6b5c',
      textAlign: 'center',
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    closeBtn: {
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s'
    },
    dropdownContent: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    userItem: {
      padding: '0.5rem',
      marginBottom: '0.25rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderRadius: '6px'
    },
    userName: {
      fontWeight: '600',
      color: '#4b3b34',
      fontSize: '1rem'
    },
    userEmail: {
      fontSize: '0.8rem',
      color: '#8b6b5c',
      marginTop: '0.15rem',
      wordBreak: 'break-all'
    },
    loadingText: {
      padding: '1rem',
      textAlign: 'center',
      color: '#8b6b5c',
      fontSize: '0.85rem'
    },
    noUsersText: {
      padding: '1rem',
      textAlign: 'center',
      color: '#8b6b5c',
      fontSize: '0.85rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div style={styles.title}>Skills Explorer</div>
        </div>
        <div style={{ ...styles.main, textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#6a5b53' }}>Loading skills...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div style={styles.title}>Skills Explorer</div>
      </div>

      <div style={styles.main} className="scrollable-main">
        <div style={styles.statsHeader}>
          <div style={styles.totalSkills}>
            {filteredSkills.length} Skills Available
          </div>
          <div style={{ color: '#6a5b53', marginTop: '0.5rem' , fontSize: '1.1rem' }}>
            {searchQuery ? `Filtered from ${skills.length} total skills` : 'Across all users'}
          </div>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <Search size={20} style={{ color: '#8b6b5c' }} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.skillsGrid}>
          {filteredSkills.map((skillData, index) => (
            <div
              key={index}
              style={styles.skillCard}
              onMouseEnter={(e) => {
                if (selectedSkill !== skillData.skill) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSkill !== skillData.skill) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
              }}
            >
              {selectedSkill === skillData.skill ? (
                <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownTitle}>
                      {skillData.skill} Users
                    </div>
                    <div
                      style={styles.closeBtn}
                      onClick={handleCloseDropdown}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <X size={18} color="#8b6b5c" />
                    </div>
                  </div>
                  <div style={styles.dropdownContent}>
                    {loadingUsers ? (
                      <div style={styles.loadingText}>Loading users...</div>
                    ) : skillUsers.length > 0 ? (
                      skillUsers.map((user, idx) => (
                        <div
                          key={idx}
                          style={styles.userItem}
                          onClick={() => navigate(`/profile/${user._id}`)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5ede6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={styles.userName}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div style={styles.userEmail}>{user.email}</div>
                        </div>
                      ))
                    ) : (
                      <div style={styles.noUsersText}>No users found</div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.skillName}>{skillData.skill}</div>
                  <div style={styles.userCount}>
                    <div
                      style={styles.usersIcon}
                      onClick={(e) => handleUsersClick(e, skillData.skill)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Users size={16} />
                    </div>
                    <span>{skillData.count} user{skillData.count !== 1 ? 's' : ''}</span>
                    <div style={styles.countBadge}>{skillData.count}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6a5b53' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              No skills found
            </div>
            <div>Try adjusting your search query</div>
          </div>
        )}
      </div>

      <style>{`
        .scrollable-main::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SkillsExplorer;
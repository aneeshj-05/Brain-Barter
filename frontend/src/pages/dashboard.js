import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Search, Users, Book, Zap, Globe, TrendingUp, MessageCircle, Bell, Check, X, Send } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const styles = {
  body: {
    height: "100vh",
    backgroundColor: "#f5ede6",
    color: "#4b3b34",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    backgroundColor: "#4b3b34",
    color: "#f5ede6",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    top: 0,
    left: 0,
    right: 0,
    height: "50px",
  },
  logoText: {
    fontWeight: "bold",
    fontSize: "2rem",
    color: "#f5ede6",
  },
  navLink: {
    color: "#f5ede6",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  bellBtn: {
    backgroundColor: "transparent",
    color: "#ffffff",
    fontSize: "16px",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #EDE3DB",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
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
  },
  notificationDropdown: {
    position: "absolute",
    top: "80px",
    right: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    width: "400px",
    maxHeight: "500px",
    overflowY: "auto",
    zIndex: 1000,
  },
  notificationHeader: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e0d5cc",
    fontWeight: "bold",
    fontSize: "1.1rem",
    color: "#4b3b34",
  },
  notificationSectionTitle: {
    padding: '0.5rem 1.5rem 0.25rem',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#6a5b53',
    textTransform: 'uppercase',
    marginTop: '0.5rem'
  },
  notificationItem: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f0f0f0",
  },
  notificationName: {
    fontWeight: "600",
    color: "#4b3b34",
    marginBottom: "0.5rem",
  },
  notificationSkills: {
    fontSize: "0.9rem",
    color: "#6a5b53",
    marginBottom: "0.75rem",
  },
  notificationActions: {
    display: "flex",
    gap: "0.5rem",
  },
  acceptBtn: {
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  rejectBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  chatBtn: {
    backgroundColor: "transparent",
    color: "#ffffff",
    fontSize: "16px",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #EDE3DB",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    backgroundColor: "transparent",
    color: '#EDE3DB',
    textDecoration: 'none',
    transition: 'color 0.3s',
    border: '2px solid #EDE3DB',
    borderRadius: '0.5rem',
    padding: "0.75rem 1.5rem",
    cursor: 'pointer',
    fontSize: '1rem'
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "2rem 2rem 6rem",
    maxWidth: "1200px",
    margin: "0 auto",
    height: 0,
    minHeight: 0,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  hero: {
    textAlign: "center",
    marginBottom: "3rem",
    marginTop: '2rem'
  },
  heading: {
    fontSize: "2.7rem",
    fontWeight: "bold",
    marginTop: '0',
    marginBottom: "1rem",
    color: "#4b3b34",
  },
  subHeading: {
    color: "#6a5b53",
    fontSize: "1.3rem",
    marginBottom: "2rem",
    maxWidth: "600px",
    margin: "0 auto 2rem",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "3rem",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "2px solid #e0d5cc",
    padding: "1rem 1.5rem",
    width: "100%",
    maxWidth: "700px",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
    backgroundColor: "transparent",
    marginLeft: "0.75rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "2rem",
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#4b3b34",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1.2rem",
    color: "#6a5b53",
    marginBottom: "0.5rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#4b3b34",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem",
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  actionIcon: {
    color: "#8b6b5c",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "0.75rem",
    color: "#4b3b34",
  },
  actionDesc: {
    fontSize: "1.1rem",
    color: "#6a5b53",
    marginBottom: "1.5rem",
    lineHeight: "1.5",
  },
  actionBtn: {
    backgroundColor: "#8b6b5c",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "500",
    marginTop: "auto",
    transition: "background-color 0.2s ease",
    position: "relative",
    zIndex: 10,
    pointerEvents: "auto",
    width: "100%",
    textAlign: "center"
  },
  recentActivity: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "3rem",
    textAlign: "center",
    marginBottom: "3rem",
  },
  recentIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 1.5rem",
    color: "#8b6b5c",
  },
  recentTitle: {
    fontSize: "1.4rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#4b3b34",
  },
  recentText: {
    fontSize: "1rem",
    color: "#6a5b53",
    marginBottom: "2rem",
    lineHeight: "1.6",
    maxWidth: "500px",
    margin: "0 auto 2rem",
  },
  recentBtn: {
    backgroundColor: "#8b6b5c",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  matchesContainer: {
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "1rem",
  },
  myMatchesContainer: {
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "1rem",
  },
  matchesGrid: {
    display: "flex",
    gap: "1.5rem",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "1rem",
    scrollBehavior: "smooth",
    scrollbarWidth: "thin",
    scrollbarColor: "#8b6b5c #f5ede6",
    WebkitOverflowScrolling: "touch",
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "1.5rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    minWidth: "350px",
    maxWidth: "350px",
    flexShrink: 0,
  },
  matchHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#8b6b5c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  matchName: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#4b3b34",
  },
  matchSkills: {
    marginBottom: "1rem",
  },
  skillLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#6a5b53",
    marginBottom: "0.25rem",
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  skillTag: {
    backgroundColor: "#f5ede6",
    color: "#4b3b34",
    padding: "0.25rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
  },
  sendRequestBtn: {
    backgroundColor: "#8b6b5c",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontSize: "1rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  pendingBtn: {
    backgroundColor: "#d1d5db",
    color: "#6b7280",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "not-allowed",
    width: "100%",
    fontSize: "1rem",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#6a5b53",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  footer: {
    backgroundColor: "#4b3b34",
    color: "#f5ede6",
    width: "100%",
    height: "56px",        // compact height
    display: "flex",
    alignItems: "center",  // vertically center the text
    padding: "0 1.5rem",   // LEFT padding only so text isn't glued to the border
    boxSizing: "border-box",
    flexShrink: 0,
  },
  footerContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  footerBottom: {
    paddingTop: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  // Find this line:
  footerCopyright: {
    fontSize: "1rem",
    color: "#d7c6bc",
    textAlign: "left",
  },

  // ✅ ADD these new styles right after:
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#4b3b34",
  },
  modalSection: {
    marginBottom: "1.5rem",
  },
  modalLabel: {
    display: "block",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#4b3b34",
  },
  modalSelect: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #e0d5cc",
    fontSize: "1rem",
    color: "#4b3b34",
    backgroundColor: "#fff",
  },
  modalButtons: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },
  modalCancelBtn: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #e0d5cc",
    backgroundColor: "#fff",
    color: "#4b3b34",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  modalSendBtn: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#8b6b5c",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },

};

export default function Dashboard() {
  // Fix page layout and set background color
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#4b3b34';
    document.documentElement.style.backgroundColor = '#4b3b34';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const navigate = useNavigate();
  const { user, unreadMessages, clearChatNotifications, sessionProposals, setSessionProposals } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [stats, setStats] = useState({
    knowledgeShared: 0,
    activeLearners: 0,
    topicsAvailable: 0,
    exchangesToday: 0
  });
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myMatches, setMyMatches] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const notificationRef = useRef(null);

  const [selectedUserForRequest, setSelectedUserForRequest] = useState(null);
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [selectedSkillRequested, setSelectedSkillRequested] = useState('');
  const notificationCount = incomingRequests.length + (sessionProposals ? sessionProposals.length : 0);

  // Reusable API request function
  const makeApiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = { 'x-auth-token': token, ...options.headers };

    try {
      const response = await axios({
        url: `http://localhost:5000${endpoint}`,
        headers,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsData, usersData, matchesData, incomingData, outgoingData, myMatchesData] = await Promise.all([
          makeApiRequest('/api/stats'),
          makeApiRequest('/api/user').catch(() => ({ users: [] })),
          makeApiRequest('/api/matches/potential').catch(() => ({ potentialMatches: [] })),
          makeApiRequest('/api/matches/requests/incoming').catch(() => ({ requests: [] })),
          makeApiRequest('/api/matches/requests/outgoing').catch(() => ({ requests: [] })),
          makeApiRequest('/api/matches/accepted').catch(() => ({ matches: [] }))
        ]);

        setStats(statsData);
        setUsers(usersData.users || usersData || []);
        setPotentialMatches(matchesData.potentialMatches || []);
        setIncomingRequests(incomingData.requests || []);
        setOutgoingRequests(outgoingData.requests || []);
        setMyMatches(myMatchesData.matches || []);
        setFetchError(null);
      } catch (error) {
        setFetchError(error.message || 'Failed to load data');
      }
    };

    fetchInitialData();
  }, []);


  // Debounced server search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length === 0) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Updated endpoint to match backend
        const data = await makeApiRequest(`/api/users/search?q=${encodeURIComponent(q)}&filter=${searchFilter}`);
        const searchedUsers = data.users || data || [];

        // ✅ NEW: Debug logs added
        console.log('Search API returned:', searchedUsers.length, 'users');
        if (searchedUsers.length > 0) {
          console.log('First user sample:', searchedUsers[0]);
        }

        setSearchResults(searchedUsers);
        setFetchError(null);
      } catch (err) {
        console.error('Search failed:', err);
        setFetchError(err?.response?.data?.error || err.message || 'Search failed');

        // Client-side fallback
        const normalizedQ = q.toLowerCase();
        const fallback = users.filter((u) => {
          if (searchFilter === 'name' || searchFilter === 'all') {
            const firstName = (u.firstName || '').toLowerCase();
            const lastName = (u.lastName || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`;
            if (fullName.includes(normalizedQ) || firstName.includes(normalizedQ) || lastName.includes(normalizedQ)) {
              return true;
            }
          }
          if (searchFilter === 'email' || searchFilter === 'all') {
            const email = (u.email || '').toLowerCase();
            if (email.includes(normalizedQ)) return true;
          }
          if (searchFilter === 'skills' || searchFilter === 'all') {
            const skills = Array.isArray(u.skills)
              ? u.skills.map(s => (typeof s === 'string' ? s : (s.name || '')).toLowerCase())
              : [];
            if (skills.some(s => s.includes(normalizedQ))) return true;
          }
          if (searchFilter === 'skillsWanted' || searchFilter === 'all') {
            const skillsWanted = Array.isArray(u.skillsWanted)
              ? u.skillsWanted.map(s => (typeof s === 'string' ? s : (s.name || '')).toLowerCase())
              : [];
            if (skillsWanted.some(s => s.includes(normalizedQ))) return true;
          }
          return false;
        });
        setSearchResults(fallback);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilter, users]);


  // Fetch session proposals if needed
  useEffect(() => {
    if (sessionProposals && sessionProposals.length === 0 && setSessionProposals) {
      makeApiRequest('/api/sessions/incoming')
        .then(data => setSessionProposals(data.sessions || []))
        .catch(err => console.error("Failed to fetch session proposals", err));
    }
  }, [sessionProposals, setSessionProposals]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Send match request
  // Send match request with skill selection
  const sendMatchRequest = async (recipientId, skillOffered, skillRequested) => {
    try {
      await makeApiRequest('/api/matches/request', {
        method: 'POST',
        data: { recipientId, skillOffered, skillRequested }
      });

      toast.success('Match request sent successfully!');

      // Close modal
      setSelectedUserForRequest(null);
      setSelectedSkillOffered('');
      setSelectedSkillRequested('');

      // Refresh data
      const [matchesData, outgoingData] = await Promise.all([
        makeApiRequest('/api/matches/potential'),
        makeApiRequest('/api/matches/requests/outgoing')
      ]);

      setPotentialMatches(matchesData.potentialMatches || []);
      setOutgoingRequests(outgoingData.requests || []);
    } catch (err) {
      console.error("Failed to send match request", err);
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  // ✅ NEW: Handle modal submit
  const handleSendRequestFromModal = () => {
    if (!selectedSkillOffered || !selectedSkillRequested) {
      toast.error('Please select both skills');
      return;
    }
    sendMatchRequest(selectedUserForRequest._id, selectedSkillOffered, selectedSkillRequested);
  };

  // Accept match request
  const acceptRequest = async (requestId) => {
    try {
      const response = await makeApiRequest(`/api/matches/requests/${requestId}/accept`, {
        method: 'PUT'
      });

      toast.success('Match accepted! You can now chat with this user.');

      // Refresh data
      const [incomingData, matchesData] = await Promise.all([
        makeApiRequest('/api/matches/requests/incoming'),
        makeApiRequest('/api/matches/accepted')
      ]);

      setIncomingRequests(incomingData.requests || []);
      setMyMatches(matchesData.matches || []);

      // Offer to redirect to chat with custom styled toast
      toast((t) => (
        <div style={{
          backgroundColor: '#4b3b34',
          color: '#f5ede6',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '300px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Match accepted!</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Start chatting now?</div>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/chat', {
                state: { selectedUserId: response.matchRequest?.senderId }
              });
            }}
            style={{
              backgroundColor: '#8b6b5c',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6d5447';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8b6b5c';
            }}
          >
            Go to Chat
          </button>
        </div>
      ), {
        duration: 5000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0
        }
      });

    } catch (err) {
      console.error("Failed to accept request", err);
      toast.error('Failed to accept request');
    }
  };

  // Reject match request
  const rejectRequest = async (requestId) => {
    try {
      await makeApiRequest(`/api/matches/requests/${requestId}/reject`, { method: 'PUT' });
      toast.success('Match rejected.');

      const data = await makeApiRequest('/api/matches/requests/incoming');
      setIncomingRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to reject request", err);
      toast.error('Failed to reject request.');
    }
  };

  // Session proposal handlers
  const handleAcceptSession = async (sessionId) => {
    try {
      await makeApiRequest(`/api/sessions/${sessionId}/accept`, { method: 'PUT' });
      toast.success('Session accepted!');
      setSessionProposals(prev => prev.filter(p => p._id !== sessionId));
    } catch (err) {
      toast.error('Failed to accept session');
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      await makeApiRequest(`/api/sessions/${sessionId}/reject`, { method: 'PUT' });
      toast.error('Session rejected.');
      setSessionProposals(prev => prev.filter(p => p._id !== sessionId));
    } catch (err) {
      toast.error('Failed to reject session');
    }
  };

  const handleChatClick = () => {
    if (typeof clearChatNotifications === 'function') {
      clearChatNotifications();
    }
    navigate('/chat');
  };

  // display server results if present, otherwise empty array
  const displayedSearchResults = searchResults || [];

  // Normalize match data for consistent rendering
  const normalizeMatchForDisplay = (m) => {
    const partner = m.partner || m.user || {};
    const partnerId = partner._id || m.partnerId || m.userId;
    const firstName = partner.firstName || m.firstName || 'Unknown';
    const lastName = partner.lastName || m.lastName || 'User';
    const email = partner.email || m.email || '';

    let skillsTheyHave = [];
    if (m.skillOffered && m.skillOffered !== 'Not specified') {
      skillsTheyHave = [m.skillOffered];
    } else if (Array.isArray(partner.skills)) {
      skillsTheyHave = partner.skills.map(s =>
        typeof s === 'string' ? s : (s.name || '')
      ).filter(Boolean);
    }

    let skillsIHave = [];
    if (m.skillRequested && m.skillRequested !== 'Not specified') {
      skillsIHave = [m.skillRequested];
    } else if (Array.isArray(partner.skillsWanted)) {
      skillsIHave = partner.skillsWanted.map(s =>
        typeof s === 'string' ? s : (s.name || '')
      ).filter(Boolean);
    }

    return {
      _id: m._id,
      partnerId,
      partner: { _id: partnerId, firstName, lastName, email },
      matchingSkillsTheyHave: skillsTheyHave,
      matchingSkillsIHave: skillsIHave
    };
  };

  const scrollbarStyles = `
    .matches-scroll::-webkit-scrollbar { height: 8px; }
    .matches-scroll::-webkit-scrollbar-track { background: #f5ede6; border-radius: 10px; }
    .matches-scroll::-webkit-scrollbar-thumb { background: #8b6b5c; border-radius: 10px; }
    .matches-scroll::-webkit-scrollbar-thumb:hover { background: #6d5447; }
  `;

  const StatCard = ({ icon: Icon, title, value }) => (
    <div
      style={styles.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <Icon size={32} style={{ color: "#8b6b5c", marginBottom: "1rem" }} />
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{title}</div>
    </div>
  );

  const ActionCard = ({ icon, title, desc, buttonText, onClick }) => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button clicked:', buttonText);
      try {
        onClick();
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    return (
      <div style={styles.actionCard}>
        <div style={styles.actionIcon}>{icon}</div>
        <h3 style={styles.actionTitle}>{title}</h3>
        <p style={styles.actionDesc}>{desc}</p>
        <button
          type="button"
          style={styles.actionBtn}
          onClick={handleClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6d5447";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8b6b5c";
          }}
        >
          {buttonText}
        </button>
      </div>
    );
  };


  return (
    <div style={styles.body}>
      <style>{scrollbarStyles}</style>
      {/* Navigation Bar */}
      <header style={styles.navbar}>
        <div style={styles.logoText}>Brain Barter</div>

        <div style={styles.navActions}>
          {/* Bell Icon with COMBINED Notification Badge */}
          <button
            style={styles.bellBtn}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span style={styles.badge}>{notificationCount}</span>
            )}
          </button>

          {/* Chat button with unread messages count */}
          <button style={styles.chatBtn} onClick={handleChatClick}>
            <MessageCircle size={22} />
            {unreadMessages > 0 && (
              <span style={styles.badge}>{unreadMessages}</span>
            )}
          </button>
          <button
            style={styles.profileBtn}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
        </div>
      </header>

      {/* Notification Dropdown with TWO sections */}
      {showNotifications && (
        <div ref={notificationRef} style={styles.notificationDropdown}>
          <div style={styles.notificationHeader}>
            Notifications ({notificationCount})
          </div>

          {/* Session Proposals Section */}
          <div style={styles.notificationSectionTitle}>Session Proposals</div>
          {sessionProposals && sessionProposals.length > 0 ? (
            sessionProposals.map((proposal) => (
              <div key={proposal._id} style={styles.notificationItem}>
                <div style={styles.notificationName}>
                  {proposal.learnerId.firstName} {proposal.learnerId.lastName}
                </div>
                <div style={styles.notificationSkills}>
                  Wants to learn: <strong>{proposal.skill}</strong> (for 1 Credit)
                </div>
                <div style={styles.notificationActions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => handleAcceptSession(proposal._id)}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => handleRejectSession(proposal._id)}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "0.5rem 1.5rem", fontSize: '0.9rem', color: "#6a5b53" }}>
              No pending session proposals.
            </div>
          )}

          {/* Match Requests Section */}
          <div style={styles.notificationSectionTitle}>Match Requests</div>
          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <div key={request._id} style={styles.notificationItem}>
                <div style={styles.notificationName}>{request.senderName}</div>
                <div style={styles.notificationSkills}>
                  Offers: <strong>{request.skillOffered}</strong><br />
                  Wants: <strong>{request.skillRequested}</strong>
                </div>
                <div style={styles.notificationActions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptRequest(request._id)}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => rejectRequest(request._id)}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "0.5rem 1.5rem", fontSize: '0.9rem', color: "#6a5b53" }}>
              No pending match requests
            </div>
          )}
        </div>
      )}

      <main style={styles.main} className="scrollable-main">
        {/* Hero Section */}
        <section style={styles.hero}>
          <h1 style={styles.heading}>Welcome to Brain Barter</h1>
          <p style={styles.subHeading}>
            Swap What You Know, Learn What You Don't!
          </p>
        </section>
        {fetchError && (
          <div style={{ margin: '0 auto 1rem', maxWidth: 700, background: '#fff2f0', color: '#822', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #f5c2c7' }}>
            <strong>API error:</strong> {fetchError}. Check console/network tab for details.
          </div>
        )}


        {/* Search Section */}
        <section style={styles.searchContainer}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '700px', width: '100%' }}>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: '2px solid #e0d5cc',
                backgroundColor: '#fff',
                color: '#4b3b34',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="skills">Skills They Have</option>
              <option value="skillsWanted">Skills They Want</option>
            </select>
            <div style={styles.searchBox}>
              <Search size={20} style={{ color: "#8b6b5c" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchFilter === 'all' ? 'any field' : searchFilter}...`}
                style={styles.searchInput}
              />
            </div>
          </div>
        </section>

        {/* Search Results - shown only when user typed something */}
        {searchQuery.trim().length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={styles.sectionTitle}>Search Results ({displayedSearchResults.length})</h3>

            {displayedSearchResults.length > 0 ? (
              <div style={styles.matchesContainer}>
                <div style={styles.matchesGrid} className="matches-scroll">
                  {displayedSearchResults.map(u => {
                    // ✅ NEW: Check if request already sent or already matched
                    const hasPendingRequest = outgoingRequests.some(req => req.recipientId === u._id);
                    const isAlreadyMatched = myMatches.some(match => {
                      const partnerId = match.partnerId || match.partner?._id;
                      return partnerId === u._id;
                    });

                    return (
                      <div
                        key={u._id || u.id || `${u.email || u.username}`}
                        style={styles.matchCard}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                        }}
                      >
                        <div style={styles.matchHeader}>
                          <div style={styles.avatar}>
                            {(u.firstName?.charAt(0) || '?') + (u.lastName?.charAt(0) || '')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={styles.matchName}>{u.firstName} {u.lastName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6a5b53' }}>{u.email}</div>
                          </div>
                          {/* ✅ NEW: Badge for matched users */}
                          {isAlreadyMatched && (
                            <div style={{
                              backgroundColor: "#F3E9E1",
                              color: "#5A4A42",
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              fontWeight: "600"
                            }}>
                              Matched
                            </div>
                          )}
                        </div>

                        <div style={styles.matchSkills}>
                          <div style={styles.skillLabel}>Skills they have:</div>
                          <div style={styles.skillTags}>
                            {(() => {
                              const skills = Array.isArray(u.skills) ? u.skills : [];
                              const displaySkills = skills
                                .map(s => typeof s === 'string' ? s : (s?.name || ''))
                                .filter(Boolean)  // ✅ NEW: Removes empty values
                                .slice(0, 4);

                              return displaySkills.length > 0 ? (
                                displaySkills.map((skill, i) => (
                                  <span key={i} style={styles.skillTag}>{skill}</span>
                                ))
                              ) : (
                                <span style={{ color: '#6a5b53', fontSize: '0.9rem' }}>No skills listed</span>
                              );
                            })()}
                          </div>

                          {/* ✅ NEW: Show skills they want */}
                          {u.skillsWanted && u.skillsWanted.length > 0 && (
                            <>
                              <div style={styles.skillLabel}>Skills they want:</div>
                              <div style={styles.skillTags}>
                                {u.skillsWanted.slice(0, 4).map((s, i) => (
                                  <span key={i} style={styles.skillTag}>
                                    {typeof s === 'string' ? s : (s.name || '')}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* ✅ NEW: Conditional buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              ...styles.sendRequestBtn,
                              flex: 1,
                              backgroundColor: '#6d5447'
                            }}
                            onClick={() => navigate(`/profile/${u._id || u.id}`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#5a4239";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#6d5447";
                            }}
                          >
                            View Profile
                          </button>

                          {isAlreadyMatched ? (
                            <button
                              style={{
                                ...styles.sendRequestBtn,
                                flex: 1,
                                backgroundColor: '#F3E9E1',
                                color: '#5A4A42',
                              }}
                              onClick={() => {
                                navigate('/chat', {
                                  state: { selectedUserId: u._id }
                                });
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#c0ae9fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#F3E9E1";
                              }}
                            >
                              <MessageCircle size={16} />
                              Chat
                            </button>
                          ) : hasPendingRequest ? (
                            <button style={{
                              ...styles.pendingBtn,
                              flex: 1
                            }}>
                              Request Pending
                            </button>
                          ) : (
                            <button
                              style={{
                                ...styles.sendRequestBtn,
                                flex: 1
                              }}
                              onClick={() => setSelectedUserForRequest(u)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#6d5447";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#8b6b5c";
                              }}
                            >
                              <Send size={16} />
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Users size={48} style={{ margin: "0 auto 1rem", color: "#8b6b5c" }} />
                <p>No users found.</p>
              </div>
            )}
          </section>
        )}

        {/* Statistics */}
        <section style={styles.statsGrid}>
          <StatCard
            icon={Book}
            title="Total Exchanges"
            value={stats.knowledgeShared}
          />
          <StatCard
            icon={Users}
            title="Active Members"
            value={stats.activeLearners}
          />
          <StatCard
            icon={Globe}
            title="Topics Covered"
            value={stats.topicsAvailable}
          />
          <StatCard
            icon={TrendingUp}
            title="Daily Exchanges"
            value={stats.exchangesToday}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <ActionCard
              icon={<Book size={28} />}
              title="Explore All Skills"
              desc="Browse all available skills across the platform with user counts"
              buttonText="Explore Skills"
              onClick={() => {
                navigate('/skills');
              }}
            />
            <ActionCard
              icon={<Users size={28} />}
              title="My Sessions"
              desc="Manage your teaching and learning sessions with a calendar view"
              buttonText="My Schedule"
              onClick={() => {
                navigate('/sessions');
              }}
            />
            <ActionCard
              icon={<Zap size={28} />}
              title="Start Conversations"
              desc="Message your matched users and start learning exchanges"
              buttonText="Open Chat"
              onClick={() => {
                navigate('/chat');
              }}
            />
          </div>


        </section>

        {/* Potential Matches Section */}
        <section id="potential-matches">
          <h2 style={styles.sectionTitle}>Potential Skill Matches</h2>
          {potentialMatches.length > 0 ? (
            <div style={styles.matchesContainer}>
              <div style={styles.matchesGrid} className="matches-scroll">
                {potentialMatches.map((match) => {
                  const hasPendingRequest = outgoingRequests.some(
                    req => req.recipientId === match._id
                  );

                  return (
                    <div
                      key={match._id}
                      style={styles.matchCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                    >
                      <div style={styles.matchHeader}>
                        <div style={styles.avatar}>
                          {match.firstName.charAt(0)}{match.lastName.charAt(0)}
                        </div>
                        <div style={styles.matchName}>
                          {match.firstName} {match.lastName}
                        </div>

                        {/* Badge for reciprocal matches */}
                        {match.isReciprocalMatch && (
                          <span style={{
                            backgroundColor: '#F3E9E1',
                            color: '#5A4A42',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '1rem'
                          }}>
                            Perfect Match!
                          </span>
                        )}
                      </div>

                      <div style={styles.matchSkills}>
                        <div style={styles.skillLabel}>They can teach you:</div>
                        <div style={styles.skillTags}>
                          {match.matchingSkillsTheyHave.map((skill, idx) => (
                            <span key={idx} style={styles.skillTag}>{skill}</span>
                          ))}
                        </div>

                        {/* Only show this if it's a reciprocal match */}
                        {match.isReciprocalMatch && (
                          <>
                            <div style={styles.skillLabel}>You can teach them:</div>
                            <div style={styles.skillTags}>
                              {match.matchingSkillsIHave.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>{skill}</span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {hasPendingRequest ? (
                        <button style={styles.pendingBtn}>
                          Request Pending...
                        </button>
                      ) : (
                        <button
                          style={styles.sendRequestBtn}
                          onClick={() => sendMatchRequest(
                            match._id,
                            match.matchingSkillsIHave && match.matchingSkillsIHave.length > 0 ? match.matchingSkillsIHave[0] : "a skill",
                            match.matchingSkillsTheyHave[0]
                          )}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#6d5447";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#8b6b5c";
                          }}
                        >
                          <Send size={16} /> Send Match Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Users size={48} style={{ margin: "0 auto 1rem", color: "#8b6b5c" }} />
              <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No potential matches yet</p>
              <p style={{ fontSize: "0.9rem" }}>Update your skills in your profile to find matches!</p>
            </div>
          )}
        </section>

        {/* My Matches Section */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={styles.sectionTitle}>My Matches</h2>
          <div style={styles.myMatchesContainer}>
            {myMatches && myMatches.length > 0 ? (
              <div style={styles.matchesGrid} className="matches-scroll">
                {myMatches.map((match) => {
                  const normalized = normalizeMatchForDisplay(match);
                  const partner = normalized.partner;
                  const initials = `${partner.firstName.charAt(0)}${partner.lastName.charAt(0)}`.toUpperCase();

                  return (
                    <div
                      key={match._id || match.partnerId}
                      style={styles.matchCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                    >
                      <div style={styles.matchHeader}>
                        <div style={styles.avatar}>
                          {initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.matchName}>
                            {partner.firstName} {partner.lastName}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: "#F3E9E1",
                          color: "#5A4A42",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontWeight: "600"
                        }}>
                          Matched
                        </div>
                      </div>

                      <div style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        backgroundColor: "#f5ede6",
                        borderRadius: "8px"
                      }}>
                        {normalized.matchingSkillsTheyHave.length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div style={styles.skillLabel}>They offered to teach you:</div>
                            <div style={styles.skillTags}>
                              {normalized.matchingSkillsTheyHave.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {normalized.matchingSkillsIHave.length > 0 && (
                          <div>
                            <div style={styles.skillLabel}>You offered to teach them:</div>
                            <div style={styles.skillTags}>
                              {normalized.matchingSkillsIHave.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {normalized.matchingSkillsTheyHave.length === 0 &&
                          normalized.matchingSkillsIHave.length === 0 && (
                            <div style={{ fontSize: "0.9rem", color: "#6a5b53", fontStyle: "italic" }}>
                              No specific skills exchanged
                            </div>
                          )}
                      </div>

                      <button
                        style={styles.sendRequestBtn}
                        onClick={() => {
                          navigate('/chat', {
                            state: { selectedUserId: normalized.partnerId }
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#6d5447";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#8b6b5c";
                        }}
                      >
                        <MessageCircle size={18} />
                        Start Conversation
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Users size={48} style={{ margin: "0 auto 1rem", color: "#8b6b5c" }} />
                <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No matches yet.</p>
                <p style={{ fontSize: "0.9rem" }}>Once someone accepts your request, they'll appear here.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ✅ NEW: Match Request Modal */}
      {selectedUserForRequest && (
        <div style={styles.modalOverlay} onClick={() => setSelectedUserForRequest(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              Send Match Request to {selectedUserForRequest.firstName} {selectedUserForRequest.lastName}
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>What skill can you offer them?</label>
              <select
                value={selectedSkillOffered}
                onChange={(e) => setSelectedSkillOffered(e.target.value)}
                style={styles.modalSelect}
              >
                <option value="">Select a skill...</option>
                {(user?.skills || []).map((skill, idx) => (
                  <option key={idx} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              {user?.skills?.length === 0 && (
                <p style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '0.5rem' }}>
                  Please add skills to your profile first
                </p>
              )}
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>What skill do you want from them?</label>
              <select
                value={selectedSkillRequested}
                onChange={(e) => setSelectedSkillRequested(e.target.value)}
                style={styles.modalSelect}
              >
                <option value="">Select a skill...</option>
                {(selectedUserForRequest.skills || []).map((skill, idx) => (
                  <option key={idx} value={typeof skill === 'string' ? skill : skill.name}>
                    {typeof skill === 'string' ? skill : skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => {
                  setSelectedUserForRequest(null);
                  setSelectedSkillOffered('');
                  setSelectedSkillRequested('');
                }}
              >
                Cancel
              </button>
              <button
                style={styles.modalSendBtn}
                onClick={handleSendRequestFromModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6d5447";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#8b6b5c";
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerBottom}>
            <div style={styles.footerCopyright}>
              © 2025 Brain Barter. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
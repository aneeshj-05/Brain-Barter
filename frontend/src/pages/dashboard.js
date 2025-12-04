import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Search, Users, Book, Calendar, Globe, TrendingUp, MessageCircle, Bell, Check, X, Send, Trash2, Home, User, Filter } from "lucide-react";

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
    background: "linear-gradient(135deg, #fff 0%, #f8f5f2 100%)",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(139, 107, 92, 0.25), 0 4px 12px rgba(0,0,0,0.1)",
    width: "380px",
    height: "400px",
    overflowY: "auto",
    zIndex: 1000,
    border: "1px solid rgba(139, 107, 92, 0.1)",
    backdropFilter: "blur(10px)",
  },
  notificationHeader: {
    padding: "1rem 1.5rem 0.75rem",
    background: "linear-gradient(135deg, #4b3b34 0%, #5a4239 100%)",
    borderRadius: "16px 16px 0 0",
    fontWeight: "bold",
    fontSize: "1.1rem",
    color: "#f5ede6",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
    borderBottom: "1px solid rgba(139, 107, 92, 0.1)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,245,242,0.6) 100%)",
    margin: "0.25rem 0.75rem",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
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
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    boxShadow: "0 3px 8px rgba(34, 197, 94, 0.3)",
    transition: "all 0.3s ease",
  },
  rejectBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    boxShadow: "0 3px 8px rgba(239, 68, 68, 0.3)",
    transition: "all 0.3s ease",
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
    alignItems: "center",
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
    maxWidth: "900px",
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
    textAlign: "center"
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
    transition: "background-color 0.3s ease",
    width: "100%",
    textAlign: "center",
    outline: "none",
    userSelect: "none"
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
  profileModalContent: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "0",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "70vh",
    overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "2rem",
    backgroundColor: "#4b3b34",
    borderRadius: "16px 16px 0 0",
    position: "relative",
  },
  profileAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#8b6b5c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "2rem",
  },
  profileName: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#f5ede6",
    marginBottom: "0.5rem",
  },
  profileLocation: {
    fontSize: "1rem",
    color: "#d7c6bc",
    marginBottom: "0.5rem",
  },
  profileCredits: {
    fontSize: "1rem",
    color: "#d7c6bc",
    fontWeight: "600",
  },
  profileSection: {
    marginBottom: "1.5rem",
    padding: "0 2rem",
  },
  profileBody: {
    padding: "1.5rem 0",
  },
  profileSectionTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#4b3b34",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  headerRating: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  ratingStars: {
    display: "flex",
    gap: "0.25rem",
  },
  star: {
    fontSize: "1.5rem",
    color: "#fbbf24",
  },
  ratingText: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#f5ede6",
  },
  ratingCount: {
    fontSize: "0.8rem",
    color: "#d7c6bc",
  },
  skillsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  profileSkillTag: {
    backgroundColor: "#8b6b5c",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  reviewItem: {
    padding: "1rem",
    backgroundColor: "#f5ede6",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  reviewerName: {
    fontWeight: "600",
    color: "#4b3b34",
  },
  reviewRating: {
    display: "flex",
    gap: "0.1rem",
  },
  reviewText: {
    color: "#6a5b53",
    lineHeight: "1.5",
  },
  closeBtn: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "none",
    fontSize: "1.5rem",
    color: "#f5ede6",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  const { user, unreadMessages, clearChatNotifications, sessionProposals, setSessionProposals, socket, confirmDeleteMatch } = useContext(AuthContext);

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
  const filterRef = useRef(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const [selectedUserForRequest, setSelectedUserForRequest] = useState(null);
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [selectedSkillRequested, setSelectedSkillRequested] = useState('');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const notificationCount = incomingRequests.length;

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

  // Listen for match deletion events
  useEffect(() => {
    if (!socket) return;

    const handleMatchDeleted = (data) => {
      console.log('Match deleted on dashboard:', data);
      const deletedUserId = data.deletedByUserId;
      
      // Remove from my matches list
      setMyMatches(prev => prev.filter(match => {
        const partnerId = match.partnerId || match.partner?._id;
        return partnerId !== deletedUserId;
      }));
      
      toast.info(data.message);
    };

    socket.on('matchDeleted', handleMatchDeleted);

    return () => {
      if (socket) {
        socket.off('matchDeleted', handleMatchDeleted);
      }
    };
  }, [socket]);

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

      toast.success('Connection request sent successfully!');

      // Close modal
      setSelectedUserForRequest(null);
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

  // Handle modal submit
  const handleSendRequestFromModal = () => {
    if (!selectedSkillRequested) {
      toast.error('Please select what you want to learn');
      return;
    }
    sendMatchRequest(selectedUserForRequest._id, 'General skills', selectedSkillRequested);
  };

  const deleteMatchFromDashboard = async (partnerId) => {
    try {
      console.log('Deleting match with user:', partnerId);
      
      if (!partnerId) {
        throw new Error('Invalid partner ID');
      }
      
      const response = await makeApiRequest(`/api/matches/${partnerId}`, {
        method: 'DELETE'
      });
      
      console.log('Delete response:', response);
      
      if (response.success) {
        // Update local state immediately
        setMyMatches(prev => prev.filter(match => {
          const matchPartnerId = match.partnerId || match.partner?._id;
          return matchPartnerId !== partnerId;
        }));
        
        toast.success('Match deleted permanently');
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (err) {
      console.error('Error deleting match:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete match';
      toast.error(errorMessage);
    }
  };

  // Accept match request
  const acceptRequest = async (requestId) => {
    try {
      const response = await makeApiRequest(`/api/matches/requests/${requestId}/accept`, {
        method: 'PUT'
      });

      toast.success('Connection accepted! You can now chat with this user.');

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
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Connection accepted!</div>
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
    if (m.skillOffered && m.skillOffered !== 'Not specified' && m.skillOffered !== 'General skills') {
      skillsTheyHave = [m.skillOffered];
    } else if (Array.isArray(partner.skills)) {
      skillsTheyHave = partner.skills.map(s =>
        typeof s === 'string' ? s : (s.name || '')
      ).filter(Boolean);
    }

    let skillsIHave = [];
    if (m.skillRequested && m.skillRequested !== 'Not specified' && m.skillRequested !== 'General skills') {
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
    
    .theme-scrollbar::-webkit-scrollbar { width: 6px; }
    .theme-scrollbar::-webkit-scrollbar-track { background: #f5ede6; border-radius: 3px; }
    .theme-scrollbar::-webkit-scrollbar-thumb { background: #8b6b5c; border-radius: 3px; }
    .theme-scrollbar::-webkit-scrollbar-thumb:hover { background: #6d5447; }
    
    .profileModalContent::-webkit-scrollbar { display: none; }
    
    @keyframes searchShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes filterSlideIn {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes filterDropdown {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
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
      onClick();
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
            e.currentTarget.style.transform = "none";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8b6b5c";
            e.currentTarget.style.transform = "none";
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

        <div style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: '#4b3b34',
          padding: '0.5rem 1.5rem',
          borderRadius: '2rem',
          position: 'relative'
        }}>
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#f5ede6',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
              setHoveredButton('dashboard');
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'transparent';
              setHoveredButton(null);
            }}
          >
            <Home size={24} />
            {hoveredButton === 'dashboard' && (
              <div style={{
                position: 'absolute',
                bottom: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#8b6b5c',
                color: '#f5ede6',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid #f5ede6',
                zIndex: 9999
              }}>
                Dashboard
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #8b6b5c'
                }} />
              </div>
            )}
          </div>
          
          <div 
            onClick={() => navigate('/profile')}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#f5ede6',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
              setHoveredButton('profile');
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'transparent';
              setHoveredButton(null);
            }}
          >
            <User size={24} />
            {hoveredButton === 'profile' && (
              <div style={{
                position: 'absolute',
                bottom: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#8b6b5c',
                color: '#f5ede6',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid #f5ede6',
                zIndex: 9999
              }}>
                Profile
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #8b6b5c'
                }} />
              </div>
            )}
          </div>
          
          <div 
            onClick={handleChatClick}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#f5ede6',
              transition: 'all 0.3s ease',
              position: 'relative',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
              setHoveredButton('chat');
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'transparent';
              setHoveredButton(null);
            }}
          >
            <MessageCircle size={24} />
            {unreadMessages > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadMessages}
              </span>
            )}
            {hoveredButton === 'chat' && (
              <div style={{
                position: 'absolute',
                bottom: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#8b6b5c',
                color: '#f5ede6',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid #f5ede6',
                zIndex: 9999
              }}>
                Chat
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #8b6b5c'
                }} />
              </div>
            )}
          </div>
          

          
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#f5ede6',
              transition: 'all 0.3s ease',
              position: 'relative',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
              setHoveredButton('notifications');
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'transparent';
              setHoveredButton(null);
            }}
          >
            <Bell size={24} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {notificationCount}
              </span>
            )}
            {hoveredButton === 'notifications' && (
              <div style={{
                position: 'absolute',
                bottom: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#8b6b5c',
                color: '#f5ede6',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid #f5ede6',
                zIndex: 9999
              }}>
                Notifications
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #8b6b5c'
                }} />
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div ref={notificationRef} style={styles.notificationDropdown}>
          <div style={styles.notificationHeader}>
            <Bell size={20} style={{ color: '#e6d9caff' }} />
            Connection Requests ({incomingRequests.length})
          </div>

          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <div key={request._id} style={styles.notificationItem}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b6b5c, #6d5447)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 3px 8px rgba(139, 107, 92, 0.3)'
                  }}>
                    {request.senderName?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      ...styles.notificationName,
                      fontSize: '1rem',
                      marginBottom: '0.1rem'
                    }}>
                      {request.senderName}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#8b6b5c',
                      fontWeight: '500'
                    }}>
                      New Connection Request
                    </div>
                  </div>
                </div>
                <div style={{
                  ...styles.notificationSkills,
                  background: 'rgba(139, 107, 92, 0.08)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  border: '1px solid rgba(139, 107, 92, 0.1)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Learns: <strong style={{ color: '#4b3b34' }}>{request.skillRequested}</strong>
                  </div>
                  {request.skillOffered && request.skillOffered !== 'General skills' ? (
                    <div>Offers: <strong style={{ color: '#4b3b34' }}>{request.skillOffered}</strong></div>
                  ) : (
                    <div><strong style={{ color: '#8b6b5c' }}>For one credit</strong></div>
                  )}
                </div>
                <div style={styles.notificationActions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptRequest(request._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                    }}
                  >
                    <Check size={18} /> Accept
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => rejectRequest(request._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "2rem 1.5rem", 
              fontSize: '0.9rem', 
              color: "#6a5b53", 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(139, 107, 92, 0.05) 0%, transparent 100%)',
              margin: '0.75rem',
              borderRadius: '10px',
              border: '1px dashed rgba(139, 107, 92, 0.2)'
            }}>
              <Bell size={24} style={{ color: '#8b6b5c', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>All caught up!</div>
              <div>No pending requests</div>
            </div>
          )}
        </div>
      )}

      {/* Fixed Sidebar */}
      <div style={{
        position: 'fixed',
        left: '20px',
        top: '120px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate('/skills')}
            style={{
              backgroundColor: '#8b6b5c',
              color: '#f5ede6',
              border: 'none',
              padding: '12px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#6d5447';
              setHoveredButton('skills');
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b6b5c';
              setHoveredButton(null);
            }}
          >
            <Book size={24} />
          </button>
          {hoveredButton === 'skills' && (
            <div style={{
              position: 'absolute',
              left: '60px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#8b6b5c',
              color: '#f5ede6',
              padding: '8px 12px',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1001
            }}>
              Skills
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate('/sessions')}
            style={{
              backgroundColor: '#8b6b5c',
              color: '#f5ede6',
              border: 'none',
              padding: '12px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#6d5447';
              setHoveredButton('sessions');
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b6b5c';
              setHoveredButton(null);
            }}
          >
            <Calendar size={24} />
          </button>
          {hoveredButton === 'sessions' && (
            <div style={{
              position: 'absolute',
              left: '60px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#8b6b5c',
              color: '#f5ede6',
              padding: '8px 12px',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1001
            }}>
              Sessions
            </div>
          )}
        </div>
      </div>

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
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '900px', width: '100%', justifyContent: 'center', position: 'relative' }}>
            <div ref={filterRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e0d5cc',
                  backgroundColor: '#fff',
                  color: '#4b3b34',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  minWidth: '180px',
                  transition: 'all 0.3s ease',
                  boxShadow: showFilterOptions ? '0 4px 12px rgba(139, 107, 92, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={18} />
                  <span>{searchFilter === 'all' ? 'All Fields' : 
                         searchFilter === 'name' ? 'Name' :
                         searchFilter === 'email' ? 'Email' :
                         searchFilter === 'skills' ? 'Skills They Have' :
                         searchFilter === 'skillsWanted' ? 'Skills They Want' : 'Filter'}</span>
                </div>
                <div style={{
                  transform: showFilterOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  ▼
                </div>
              </button>
              
              {showFilterOptions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '2px solid #e0d5cc',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  marginTop: '0.5rem',
                  overflow: 'hidden',
                  animation: 'filterDropdown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}>
                  {[
                    { value: 'all', label: 'All Fields' },
                    { value: 'name', label: 'Name' },
                    { value: 'email', label: 'Email' },
                    { value: 'skills', label: 'Skills They Have' },
                    { value: 'skillsWanted', label: 'Skills They Want' }
                  ].map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSearchFilter(option.value);
                        setShowFilterOptions(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1.5rem',
                        border: 'none',
                        backgroundColor: searchFilter === option.value ? '#8b6b5c' : 'transparent',
                        color: searchFilter === option.value ? '#fff' : '#4b3b34',
                        fontSize: '1rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                        animation: `filterSlideIn 0.2s ease ${index * 0.05}s both`
                      }}
                      onMouseEnter={(e) => {
                        if (searchFilter !== option.value) {
                          e.target.style.backgroundColor = '#f5ede6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (searchFilter !== option.value) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{
              position: 'relative',
              width: searchQuery ? '700px' : '300px',
              transition: 'width 0.3s ease'
            }}>
              <div style={{
                ...styles.searchBox,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Search size={20} style={{ color: "#8b6b5c", zIndex: 2, position: 'relative' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchFilter === 'all' ? 'any field' : searchFilter}...`}
                  style={{
                    ...styles.searchInput,
                    zIndex: 2,
                    position: 'relative'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(139, 107, 92, 0.1), transparent)',
                  transform: 'translateX(-100%)',
                  animation: searchQuery ? 'searchShimmer 2s infinite' : 'none',
                  zIndex: 1
                }}/>
              </div>
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
                          {/* Badge for connected users */}
                          {isAlreadyMatched && (
                            <div style={{
                              backgroundColor: "#F3E9E1",
                              color: "#5A4A42",
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              fontWeight: "600"
                            }}>
                              Connected
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
                            onClick={async () => {
                              try {
                                const response = await makeApiRequest(`/api/user/${u._id}`);
                                console.log('Fetched user profile:', response);
                                setSelectedUserProfile(response);
                              } catch (error) {
                                console.error('Error fetching user profile:', error);
                                setSelectedUserProfile(u);
                              }
                            }}
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

        {/* Statistics - Always visible */}
        <section style={styles.statsGrid}>
          <StatCard
            icon={Book}
            title="Total Exchanges"
            value={stats.knowledgeShared || 0}
          />
          <StatCard
            icon={Users}
            title="Active Members"
            value={stats.activeLearners || 0}
          />
          <StatCard
            icon={Globe}
            title="Topics Covered"
            value={stats.topicsAvailable || 0}
          />
          <StatCard
            icon={TrendingUp}
            title="Daily Exchanges"
            value={stats.exchangesToday || 0}
          />
        </section>

        {/* Quick Actions - Always visible */}
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
              icon={<Calendar size={28} />}
              title="My Sessions"
              desc="Manage your teaching and learning sessions with a calendar view"
              buttonText="My Schedule"
              onClick={() => {
                navigate('/sessions');
              }}
            />
            <ActionCard
              icon={<MessageCircle size={28} />}
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
                            "General skills",
                            match.matchingSkillsTheyHave[0]
                          )}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#6d5447";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#8b6b5c";
                          }}
                        >
                          <Send size={16} /> Send Request
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

        {/* My Connections Section */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={styles.sectionTitle}>My Connections</h2>
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
                          Connected
                        </div>
                      </div>

                      <div style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        backgroundColor: "#f5ede6",
                        borderRadius: "8px"
                      }}>
                        {normalized.matchingSkillsTheyHave.length > 0 && !normalized.matchingSkillsTheyHave.includes('General skills') && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div style={styles.skillLabel}>They wanted to learn from u:</div>
                            <div style={styles.skillTags}>
                              {normalized.matchingSkillsTheyHave.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {normalized.matchingSkillsIHave.length > 0 && (
                          <div>
                            <div style={styles.skillLabel}>You wanna learn from them:</div>
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

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            ...styles.sendRequestBtn,
                            flex: 1
                          }}
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
                          <MessageCircle size={16} />
                          Chat
                        </button>
                        <button
                          style={{
                            ...styles.sendRequestBtn,
                            flex: 1,
                            backgroundColor: '#3c2415'
                          }}
                          onClick={() => {
                            confirmDeleteMatch(
                              {
                                firstName: normalized.partner.firstName,
                                lastName: normalized.partner.lastName
                              },
                              () => deleteMatchFromDashboard(normalized.partnerId)
                            );
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2d1b0f";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#3c2415";
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Users size={48} style={{ margin: "0 auto 1rem", color: "#8b6b5c" }} />
                <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No connections yet.</p>
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
              Connect with {selectedUserForRequest.firstName} {selectedUserForRequest.lastName}
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>What do you want to learn from me?</label>
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

      {/* Profile View Modal */}
      {selectedUserProfile && (
        <div style={styles.modalOverlay} onClick={() => setSelectedUserProfile(null)}>
          <div style={{ ...styles.profileModalContent, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.profileHeader}>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedUserProfile(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                }}
              >
                ×
              </button>

              <div style={styles.profileAvatar}>
                {selectedUserProfile.firstName?.charAt(0)}{selectedUserProfile.lastName?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.profileName}>
                  {selectedUserProfile.firstName} {selectedUserProfile.lastName}
                </div>
                <div style={styles.profileLocation}>
                  📍 {selectedUserProfile.location || 'Location not specified'}
                </div>
                <div style={styles.profileCredits}>
                  💰 {selectedUserProfile.credits !== undefined ? selectedUserProfile.credits : 0} Credits
                </div>
                
                {/* Rating below user info */}
                <div style={styles.headerRating}>
                  <div style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '1.1rem',
                          color: star <= (selectedUserProfile.averageRating || 0) ? '#fbbf24' : 'rgba(255,255,255,0.3)'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div style={styles.ratingText}>
                    {selectedUserProfile.averageRating && selectedUserProfile.averageRating > 0 ? selectedUserProfile.averageRating.toFixed(1) : 'No ratings'}
                  </div>
                  <div style={styles.ratingCount}>
                    ({selectedUserProfile.totalRatings || 0} reviews)
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.profileBody}>

              {/* Skills They Have */}
              <div style={styles.profileSection}>
                <div style={styles.profileSectionTitle}>
                  🎯 Skills They Can Teach
                </div>
                <div style={styles.skillsGrid}>
                  {selectedUserProfile.skills && selectedUserProfile.skills.length > 0 ? (
                    selectedUserProfile.skills.map((skill, idx) => (
                      <span key={idx} style={styles.profileSkillTag}>
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6a5b53', fontStyle: 'italic' }}>No skills listed</span>
                  )}
                </div>
              </div>

              {/* Skills They Want */}
              <div style={styles.profileSection}>
                <div style={styles.profileSectionTitle}>
                  📚 Skills They Want to Learn
                </div>
                <div style={styles.skillsGrid}>
                  {selectedUserProfile.skillsWanted && selectedUserProfile.skillsWanted.length > 0 ? (
                    selectedUserProfile.skillsWanted.map((skill, idx) => (
                      <span key={idx} style={{ ...styles.profileSkillTag, backgroundColor: '#f5ede6', color: '#4b3b34' }}>
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6a5b53', fontStyle: 'italic' }}>No learning interests listed</span>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div style={styles.profileSection}>
                <div style={styles.profileSectionTitle}>
                  💬 Recent Reviews
                </div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  paddingRight: '8px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#8b6b5c #f5ede6'
                }} className="theme-scrollbar">
                  {selectedUserProfile.reviews && selectedUserProfile.reviews.length > 0 ? (
                    selectedUserProfile.reviews.map((review, idx) => (
                      <div key={idx} style={styles.reviewItem}>
                        <div style={styles.reviewHeader}>
                          <span style={styles.reviewerName}>
                            {review.reviewerName || 'Anonymous'}
                          </span>
                          <div style={styles.reviewRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                style={{
                                  fontSize: '1rem',
                                  color: star <= review.rating ? '#fbbf24' : '#e5e7eb'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={styles.reviewText}>
                          {review.comment || 'No comment provided'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#6a5b53', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                      No reviews yet
                    </div>
                  )}
                </div>
              </div>
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
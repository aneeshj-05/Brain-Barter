import React, { useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
// --- NEW --- Import new icons
import { Send, Search, Users, Plus, Video, Smile, ClipboardList, Star, CheckCircle } from "lucide-react"; 
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
// NOTE: socket is provided by AuthContext now (no local socket import/creation)

export default function Chat() {
  // Get user, socket and notification clearer from context
  const { user, socket, clearChatNotifications } = useContext(AuthContext);
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // --- NEW --- State to hold the full partner details (including skills)
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // --- NEW --- Modal & proposal state (existing)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedSkillToLearn, setSelectedSkillToLearn] = useState("");

  // --- NEW STATES for sessions & feedback (ADDED) ---
  const [sessions, setSessions] = useState([]); // To hold sessions for this chat
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const location = useLocation();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat notifications when visiting the chat page
  useEffect(() => {
    if (typeof clearChatNotifications === 'function') {
      clearChatNotifications();
    }
  }, [clearChatNotifications]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('authToken');
      if (token && user) {
        try {
          const res = await axios.get(`http://localhost:5000/api/chat/conversations/${user.id}`, {
            headers: { 'x-auth-token': token }
          });
          setConversations(res.data.conversations || []);
        } catch (err) {
          console.error("Failed to fetch conversations", err);
        }
      }
    };
    if (user) {
        fetchConversations();
    }
  }, [user]);

  // Listen for incoming messages (guard against missing socket)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      console.log('Message received:', data);
      
      // Add message to open chat
      if (selectedChat && data.senderId === selectedChat._id) {
        setMessages(prevMessages => [...prevMessages, {
          text: data.text,
          sent: false,
          time: new Date(data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          _id: data._id
        }]);
      }
      // ✅ NEW: Auto-select user when navigating from Dashboard
// ✅ FIXED: Move this useEffect AFTER conversations are fetched
useEffect(() => {
  if (location.state?.selectedUserId && conversations.length > 0) {
    const targetConvo = conversations.find(
      convo => convo.partnerId === location.state.selectedUserId
    );
    
    if (targetConvo) {
      handleSelectChat(targetConvo);
    }
  }
}, [location.state?.selectedUserId, conversations]); // Added dependency
      
      // Update sidebar list
      setConversations(prevConvos => 
        prevConvos.map(convo => 
          (convo.partnerId === data.senderId)
            ? { ...convo, lastMessage: data.text, timestamp: data.timestamp, senderId: data.senderId }
            : convo
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    };
    
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, selectedChat, user]);

  // Load chat history
  const loadChatHistory = async (recipientId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${user.id}/${recipientId}`,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      const formattedMessages = response.data.messages.map(msg => ({
        text: msg.text,
        sent: msg.senderId === user.id,
        time: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        _id: msg._id
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }
  };

  // --- MODIFIED --- handleSelectChat now also fetches full partner details and sessions
  const handleSelectChat = async (selectedConvo) => {
    // 1. Set the basic details (for header)
    const partnerDetails = {
      _id: selectedConvo.partnerId,
      firstName: selectedConvo.firstName,
      lastName: selectedConvo.lastName,
      email: selectedConvo.email
    };
    setSelectedChat(partnerDetails);
    
    // 2. Load the chat history
    loadChatHistory(selectedConvo.partnerId);

    // 3. Clear old sessions
    setSessions([]);
    
    // 4. Fetch full partner details (for skills) and sessions with this partner
    try {
      const token = localStorage.getItem('authToken');
      const detailsRes = await axios.get(`http://localhost:5000/api/user/${selectedConvo.partnerId}`, {
        headers: { 'x-auth-token': token }
      });
      setSelectedPartnerDetails(detailsRes.data); // Save the full profile data
      setSelectedSkillToLearn("");

      // Fetch sessions with this partner
      const sessionsRes = await axios.get(`http://localhost:5000/api/sessions/with/${selectedConvo.partnerId}`, {
        headers: { 'x-auth-token': token }
      });
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch partner details or sessions", err);
      toast.error("Could not load partner details or sessions.");
    }
  };

  const handleSendMessage = () => {
    // Check for socket
    if (message.trim() && selectedChat && user && socket) { 
      const currentTime = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const messageText = message.trim();
      
      const newMessage = {
        senderId: user.id,
        recipientId: selectedChat._id,
        text: messageText,
        timestamp: new Date().toISOString() 
      };

      socket.emit('privateMessage', newMessage); // Use context socket

      setMessages(prev => [...prev, {
        text: messageText,
        sent: true,
        time: currentTime,
        _id: Date.now()
      }]);
      
      setConversations(prevConvos => 
        prevConvos.map(convo => 
          convo.partnerId === selectedChat._id
            ? { ...convo, lastMessage: messageText, timestamp: newMessage.timestamp, senderId: user.id }
            : convo
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );

      setMessage('');
    }
  };

  // Function to send a Jitsi meeting link (uses context socket)
  const handleSendMeetingLink = () => {
    if (!selectedChat || !user || !socket) return;

    const roomName = `BrainBarter-${user.id.slice(-5)}-${selectedChat._id.slice(-5)}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    const messageText = `I've started a meeting, join here: ${meetingLink}`;
    
    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newMessage = {
        senderId: user.id,
        recipientId: selectedChat._id,
        text: messageText,
        timestamp: new Date().toISOString()
    };

    socket.emit('privateMessage', newMessage); // Use context socket

    setMessages(prev => [...prev, {
      text: messageText,
      sent: true,
      time: currentTime,
      _id: Date.now()
    }]);

    setConversations(prevConvos => 
      prevConvos.map(convo => 
        convo.partnerId === selectedChat._id
          ? { ...convo, lastMessage: "Started a meeting...", timestamp: newMessage.timestamp, senderId: user.id }
          : convo
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter(convo => {
    const fullName = `${convo.firstName || ''} ${convo.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Render message text with links
  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Format preview text
  const formatPreview = (convo) => {
    let preview = convo.lastMessage || "";
    
    if (preview.includes('https://meet.jit.si/')) {
      preview = "Started a meeting...";
    }
    
    if (convo.senderId === user.id) {
        preview = "You: " + preview;
    }
    
    if (preview.length > 40) {
        preview = preview.substring(0, 37) + "...";
    }
    return preview;
  };

  // --- NEW --- Handler for proposing a session
  const handleProposeSession = async () => {
    if (!selectedSkillToLearn) {
      return toast.error("Please select a skill to learn.");
    }
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        'http://localhost:5000/api/sessions/propose',
        {
          teacherId: selectedChat._id,
          skill: selectedSkillToLearn
        },
        { headers: { 'x-auth-token': token } }
      );

      // Send a notification message in chat
      const messageText = `I have proposed a 1-credit session for: ${selectedSkillToLearn}. (Waiting for partner to accept)`;
      const newMessage = {
        senderId: user.id,
        recipientId: selectedChat._id,
        text: messageText,
        timestamp: new Date().toISOString()
      };
      socket.emit('privateMessage', newMessage);
      
      // Add to local messages
      setMessages(prev => [...prev, {
        text: messageText,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        _id: Date.now()
      }]);

      // Update sidebar
      setConversations(prevConvos => 
        prevConvos.map(convo => 
          convo.partnerId === selectedChat._id
            ? { ...convo, lastMessage: "Session proposed...", timestamp: newMessage.timestamp, senderId: user.id }
            : convo
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );

      toast.success(res.data.message);
      setIsProposalModalOpen(false);

      // Optionally refresh sessions list
      const sessionsRes = await axios.get(`http://localhost:5000/api/sessions/with/${selectedChat._id}`, {
        headers: { 'x-auth-token': token }
      });
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) {
      console.error('Failed to propose session', err);
      toast.error(err.response?.data?.message || 'Failed to propose session.');
    }
  };

  // --- NEW --- Handlers for feedback modal
  const openFeedbackModal = (session) => {
    setSessionToComplete(session);
    setFeedback({ rating: 0, comment: '' });
    setHoverRating(0);
    setShowFeedbackModal(true);
  };
  
  const handleCompleteSession = async () => {
    if (feedback.rating === 0) {
      return toast.error('Please select a rating (1-5 stars).');
    }
    if (!sessionToComplete) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/sessions/${sessionToComplete._id}/complete`,
        feedback, // Send rating and comment in the body
        { headers: { 'x-auth-token': token } }
      );
      
      toast.success('Feedback submitted! Session marked as complete.');
      setShowFeedbackModal(false);
      setSessionToComplete(null);
      
      // Refresh sessions to update UI
      setSessions(prev => 
        prev.map(s => 
          s._id === sessionToComplete._id 
          ? { ...s, status: 'completed', learnerCompleted: true, teacherCompleted: true } 
          : s
        )
      );

    } catch (err) {
      console.error('Failed to complete session', err);
      toast.error(err.response?.data?.message || 'Failed to complete session.');
    }
  };

  // --- Styles (unchanged + modal & feedback styles) ---
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#e5dcd3ff",
      color: "#4b3b34",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
    },
    chatContainer: {
      display: "flex",
      flex: 1,
      height: "calc(100vh - 70px)",
    },
    sidebar: {
      width: "350px",
      backgroundColor: "#fff",
      borderRight: "1px solid #e0d5cc",
      display: "flex",
      flexDirection: "column",
    },
    sidebarHeader: {
      padding: "1.5rem",
      borderBottom: "1px solid #e0d5cc",
    },
    sidebarTitle: {
      fontSize: "1.7rem",
      fontWeight: "bold",
      color: "#4b3b34",
      marginBottom: "1.5rem",
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f5ede6",
      borderRadius: "8px",
      border: "1px solid #e0d5cc",
      padding: "0.75rem",
    },
    searchInput: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "0.9rem",
      backgroundColor: "transparent",
      marginLeft: "0.5rem",
      color: "#4b3b34",
    },
    chatList: {
      flex: 1,
      overflowY: "auto",
    },
    chatItem: {
      padding: "1rem 1.5rem",
      borderBottom: "1px solid #f0f0f0",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    chatItemActive: {
      backgroundColor: "#f5ede6",
    },
    avatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#8b6b5c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
    chatInfo: {
      flex: 1,
      overflow: "hidden",
    },
    chatName: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#4b3b34",
      marginBottom: "0.25rem",
    },
    chatPreview: {
      fontSize: "0.85rem",
      color: "#6a5b53",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    chatMain: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
    },
    chatHeader: {
      padding: "1rem 1.5rem",
      borderBottom: "1px solid #e0d5cc",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
    },
    chatHeaderInfo: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    chatHeaderName: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#4b3b34",
    },
    chatHeaderStatus: {
      fontSize: "0.85rem",
      color: "#8b6b5c",
    },
    messagesContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    messageGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    messageGroupSent: {
      alignItems: "flex-end",
    },
    messageGroupReceived: {
      alignItems: "flex-start",
    },
    message: {
      maxWidth: "70%",
      padding: "0.75rem 1rem",
      borderRadius: "18px",
      fontSize: "0.95rem",
      lineHeight: "1.4",
      wordBreak: "break-word",
    },
    messageSent: {
      backgroundColor: "#8b6b5c",
      color: "#fff",
    },
    messageReceived: {
      backgroundColor: "#f5ede6",
      color: "#4b3b34",
    },
    messageTime: {
      fontSize: "0.75rem",
      color: "#8b6b5c",
      marginTop: "0.25rem",
    },
    inputContainer: {
      padding: "1rem 1.5rem",
      borderTop: "1px solid #e0d5cc",
      backgroundColor: "#fff",
    },
    inputBox: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f5ede6",
      borderRadius: "25px",
      border: "1px solid #e0d5cc",
      padding: "0.75rem 1rem",
      gap: "0.75rem",
    },
    messageInput: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "0.95rem",
      backgroundColor: "transparent",
      color: "#4b3b34",
    },
    sendBtn: {
      backgroundColor: "#8b6b5c",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
    emptyChat: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "#8b6b5c",
    },
    emptyChatIcon: {
      width: "64px",
      height: "64px",
      marginBottom: "1rem",
    },
    emptyChatText: {
      fontSize: "1.1rem",
      fontWeight: "500",
    },
    onlineIndicator: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "#22c55e",
      position: "absolute",
      bottom: "2px",
      right: "2px",
      border: "2px solid #fff",
    },
    avatarContainer: {
      position: "relative",
    },
    actionBtn: {
      padding: "0.5rem",
      borderRadius: "50%",
      border: "none",
      backgroundColor: "transparent",
      color: "#8b6b5c",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },

    // --- NEW --- Styles for the Modal & feedback
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#EDE3DB',
      color: '#402E2A',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    modalText: {
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
    modalSelect: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '2px solid #947C70',
      backgroundColor: '#fff',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    modalButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
    },
    modalButtonSecondary: {
      backgroundColor: 'transparent',
      color: '#402E2A',
      border: '2px solid #402E2A',
    },

    // --- NEW STYLES ---
    sessionBanner: {
      padding: '1rem 1.5rem',
      backgroundColor: '#d7beaaff',
      color: '#402E2A',
      borderTop: '1px solid #e0d5cc',
      borderBottom: '1px solid #e0d5cc',
      textAlign: 'center',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    },
    completeButton: {
      backgroundColor: '#402E2A',
      color: '#EDE3DB',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      marginLeft: '1rem'
    },
    starRatingContainer: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
      marginBottom: '1.5rem',
    },
    star: {
      cursor: 'pointer',
      color: '#947C70', // Default empty color
    },
    starFilled: {
      color: '#ffc107', // Gold color for filled
    },
    feedbackTextarea: {
      width: '100%',
      minHeight: '80px',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '2px solid #947C70',
      backgroundColor: '#fff',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical'
    }
  };
  const scrollbarStyles = `
  .matches-scroll::-webkit-scrollbar {
    height: 8px;
  }
  .matches-scroll::-webkit-scrollbar-track {
    background: #f5ede6;
    border-radius: 10px;
  }
  .matches-scroll::-webkit-scrollbar-thumb {
    background: #8b6b5c;
    border-radius: 10px;
  }
  .matches-scroll::-webkit-scrollbar-thumb:hover {
    background: #6d5447;
  }
`;

  // Helper functions
  const getInitials = (user) => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  const getFullName = (user) => {
    if (!user) return 'Unknown User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
  };

  // --- NEW --- Helper function to determine if session banner should show
  const getSessionToComplete = () => {
    if (!sessions || !user) return null;
    // Find the first 'accepted' session that *this user* has not yet completed
    return sessions.find(s => 
      s.status === 'accepted' && 
      (
        (s.learnerId === user.id && !s.learnerCompleted) ||
        (s.teacherId === user.id && !s.teacherCompleted)
      )
    );
  };
  
  const sessionForBanner = getSessionToComplete();

  return (
    <div style={styles.container}>
      <style>{scrollbarStyles}</style>
      <Navbar />
      <div style={styles.chatContainer}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Messages</h2>
            <div style={styles.searchBox}>
              <Search size={16} style={{ color: "#8b6b5c" }} />
              <input
                type="text"
                placeholder="Search users..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.chatList}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => (
                <div
                  key={convo.partnerId}
                  style={{
                    ...styles.chatItem,
                    ...(selectedChat?._id === convo.partnerId ? styles.chatItemActive : {})
                  }}
                  onClick={() => handleSelectChat(convo)}
                  onMouseEnter={(e) => {
                    if (selectedChat?._id !== convo.partnerId) {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChat?._id !== convo.partnerId) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>{getInitials(convo)}</div>
                  </div>
                  <div style={styles.chatInfo}>
                    <div style={styles.chatName}>{getFullName(convo)}</div>
                    <div style={styles.chatPreview}>{formatPreview(convo)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#8b6b5c" }}>
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={styles.chatMain}>
          {selectedChat ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderInfo}>
                  <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>{getInitials(selectedChat)}</div>
                  </div>
                  <div>
                    <div style={styles.chatHeaderName}>{getFullName(selectedChat)}</div>
                    <div style={styles.chatHeaderStatus}>Brain Barter User</div>
                  </div>
                </div>
              </div>

              {/* --- NEW --- Session Completion Banner */}
              {sessionForBanner && (
                <div style={styles.sessionBanner}>
                  <span>
                    Ready to complete your session for <strong>{sessionForBanner.skill}</strong>?
                  </span>
                  <button 
                    style={styles.completeButton}
                    onClick={() => openFeedbackModal(sessionForBanner)}
                  >
                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                    Complete Session
                  </button>
                </div>
              )}

              <div style={styles.messagesContainer}>
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      style={{
                        ...styles.messageGroup,
                        ...(msg.sent ? styles.messageGroupSent : styles.messageGroupReceived)
                      }}
                    >
                      <div
                        style={{
                          ...styles.message,
                          ...(msg.sent ? styles.messageSent : styles.messageReceived)
                        }}
                      >
                        {renderMessageText(msg.text)}
                      </div>
                      <div style={styles.messageTime}>{msg.time}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#8b6b5c", 
                    marginTop: "2rem" 
                  }}>
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputContainer}>
                <div style={styles.inputBox}>
                  <button style={{ ...styles.actionBtn, padding: "0.25rem" }}>
                    <Plus size={20} />
                  </button>
                  
                  {/* --- NEW --- Session Proposal Button */}
                  <button 
                    style={{ ...styles.actionBtn, padding: "0.25rem" }}
                    onClick={() => setIsProposalModalOpen(true)}
                    title="Propose a session"
                  >
                    <ClipboardList size={20} />
                  </button>

                  <button 
                    style={{ ...styles.actionBtn, padding: "0.25rem" }}
                    onClick={handleSendMeetingLink}
                    title="Start a Jitsi meeting"
                  >
                    <Video size={20} />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Type a message..."
                    style={styles.messageInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button style={{ ...styles.actionBtn, padding: "0.25rem" }}>
                    <Smile size={20} />
                  </button>
                  <button style={styles.sendBtn} onClick={handleSendMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <Users style={styles.emptyChatIcon} />
              <div style={styles.emptyChatText}>Select a user to start chatting</div>
            </div>
          )}
        </div>
      </div>

      {/* --- NEW --- Session Proposal Modal */}
      {isProposalModalOpen && selectedPartnerDetails && (
        <div style={styles.modalBackdrop} onClick={() => setIsProposalModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Propose a Session</h3>
            <p style={styles.modalText}>
              You are proposing a 1-credit session with 
              <strong> {getFullName(selectedPartnerDetails)}</strong>.
              Please select the skill you would like to learn from them.
            </p>

            <select 
              style={styles.modalSelect}
              value={selectedSkillToLearn}
              onChange={(e) => setSelectedSkillToLearn(e.target.value)}
            >
              <option value="">-- Select a skill --</option>
              {(selectedPartnerDetails.skills || []).map((skill, index) => (
                <option key={index} value={skill}>{skill}</option>
              ))}
            </select>

            <div style={styles.modalActions}>
              <button 
                style={{...styles.modalButton, ...styles.modalButtonSecondary}}
                onClick={() => setIsProposalModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.modalButton}
                onClick={handleProposeSession}
              >
                Propose Session (1 Credit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW --- Feedback & Rating Modal */}
      {showFeedbackModal && sessionToComplete && (
        <div style={styles.modalBackdrop} onClick={() => setShowFeedbackModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Complete Session</h3>
            <p style={styles.modalText}>
              Please rate your experience with 
              <strong> {getFullName(selectedChat)}</strong> for the 
              <strong> "{sessionToComplete.skill}"</strong> session.
            </p>

            <div style={styles.starRatingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  style={
                    star <= (hoverRating || feedback.rating)
                      ? { ...styles.star, ...styles.starFilled }
                      : styles.star
                  }
                  onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>

            <textarea
              style={styles.feedbackTextarea}
              placeholder="Leave a public comment (optional)..."
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            />

            <div style={{marginTop: '1.5rem', ...styles.modalActions}}>
              <button 
                style={{...styles.modalButton, ...styles.modalButtonSecondary}}
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.modalButton}
                onClick={handleCompleteSession}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
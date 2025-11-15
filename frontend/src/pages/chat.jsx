import React, { useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import { Send, Search, Users, MessageCircle, Paperclip, Smile, Video } from "lucide-react";
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

let socket = null;

export default function Chat() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]); // NEW: Matched users
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('conversations');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fix page to prevent any scrolling
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

  // Initialize socket connection
  useEffect(() => {
    if (user && !socket) {
      socket = io.connect("http://localhost:5000", {
        transports: ['websocket', 'polling']
      });
      
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socket.emit('register', user._id);
        console.log('User registered with socket:', user._id);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  // Fetch actual conversations (only users with messages)
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('authToken');
      if (token && user) {
        try {
          const res = await axios.get(`http://localhost:5000/api/chat/conversations/${user._id}`, {
            headers: { 'x-auth-token': token }
          });
          // Only show conversations that have actual messages
          const realConversations = res.data.conversations.filter(conv => conv.lastMessage && conv.lastMessage.trim() !== '');
          setConversations(realConversations || []);
          const counts = {};
          realConversations.forEach(conv => {
            counts[conv.partnerId] = conv.unreadCount || 0;
          });
          setUnreadCounts(counts);
        } catch (err) {
          console.error("Failed to fetch conversations", err);
        }
      }
    };
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch matched users from accepted matches
  useEffect(() => {
    const fetchMatchedUsers = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/matches/accepted', {
            headers: { 'x-auth-token': token }
          });
          // Transform the matches data to user format for the chat
          const users = res.data.matches.map(match => ({
            _id: match.partnerId,
            firstName: match.firstName,
            lastName: match.lastName,
            email: match.email
          }));
          setMatchedUsers(users);
        } catch (err) {
          console.error("Failed to fetch matched users", err);
        }
      }
    };
    if (user) {
      fetchMatchedUsers();
    }
  }, [user]);

  // Auto-select user when coming from Dashboard
  useEffect(() => {
    if (location.state?.selectedUserId && matchedUsers.length > 0) {
      const targetUser = matchedUsers.find(u => u._id === location.state.selectedUserId);
      
      if (targetUser) {
        handleSelectMatch(targetUser);
        setActiveTab('matches'); // Switch to matches tab
      }
    }
  }, [location.state?.selectedUserId, matchedUsers]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (data) => {
      console.log('Message received:', data);
      
      if (selectedChat && data.senderId === selectedChat._id) {
        setMessages(prevMessages => [...prevMessages, {
          text: data.text,
          sent: false,
          time: new Date(data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          _id: data._id,
          type: data.type || 'text',
          fileUrl: data.fileUrl || null
        }]);
      } else {
        // Increment unread count if message is from another user
        setUnreadCounts(prev => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1
        }));
      }
      
      // Update conversations list - add new conversation if first message
      setConversations(prevConvos => {
        const exists = prevConvos.find(c => c.partnerId === data.senderId);
        if (exists) {
          return prevConvos.map(convo => 
            (convo.partnerId === data.senderId)
              ? { ...convo, lastMessage: data.text, timestamp: data.timestamp }
              : convo
          ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
          // Find user details from matchedUsers
          const senderUser = matchedUsers.find(u => u._id === data.senderId);
          return [{
            partnerId: data.senderId,
            firstName: senderUser?.firstName || '',
            lastName: senderUser?.lastName || '',
            email: senderUser?.email || '',
            lastMessage: data.text,
            timestamp: data.timestamp
          }, ...prevConvos];
        }
      });
    };
    
    const handleMessageSent = (data) => {
      console.log('Message sent confirmation:', data);
    };
    
    const handleMessageError = (error) => {
      console.error('Message error:', error);
      // Remove the last message from UI if it failed to send
      setMessages(prev => prev.slice(0, -1));
      alert(error.error || 'Failed to send message');
    };
    
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageError', handleMessageError);

    return () => {
      if (socket) {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('messageSent', handleMessageSent);
        socket.off('messageError', handleMessageError);
      }
    };
  }, [selectedChat, user]);

  // Load chat history
  const loadChatHistory = async (recipientId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${user._id}/${recipientId}`,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      const formattedMessages = response.data.messages.map(msg => ({
        text: msg.text,
        sent: msg.senderId === user._id,
        time: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        _id: msg._id,
        type: msg.type || 'text',
        fileUrl: msg.fileUrl || null
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }
  };

  // Mark messages as read when user opens a chat
  const markMessagesAsRead = async (partnerId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:5000/api/chat/mark-read`,
        { senderId: partnerId, recipientId: user._id },
        { headers: { 'x-auth-token': token } }
      );

      // Reset unread count for this conversation
      setUnreadCounts(prev => ({
        ...prev,
        [partnerId]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle selecting from conversations
  const handleSelectChat = (selectedConvo) => {
    const partnerDetails = {
      _id: selectedConvo.partnerId,
      firstName: selectedConvo.firstName,
      lastName: selectedConvo.lastName,
      email: selectedConvo.email
    };
    setSelectedChat(partnerDetails);
    loadChatHistory(selectedConvo.partnerId);
    markMessagesAsRead(selectedConvo.partnerId);
  };

  // Handle selecting from matched users
  const handleSelectMatch = (matchedUser) => {
    const chatUser = {
      _id: matchedUser._id,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
      email: matchedUser.email
    };
    setSelectedChat(chatUser);
    loadChatHistory(matchedUser._id);
    markMessagesAsRead(matchedUser._id);
  };

  const handleSendMessage = (messageText = message, messageType = 'text', fileUrl = null) => {
    const textToSend = messageText || message;
    
    if (!textToSend || !textToSend.trim() || !selectedChat || !user || !socket) {
      console.log('Cannot send message:', { textToSend, selectedChat, user, socket });
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const timestamp = new Date();

    const messagePayload = {
      senderId: String(user._id),
      recipientId: String(selectedChat._id),
      text: textToSend.trim(),
      type: messageType || 'text',
      timestamp: timestamp.toISOString(),
      fileUrl: fileUrl || null
    };

    console.log('Sending message:', messagePayload);
    socket.emit('privateMessage', messagePayload);

    setMessages(prev => [...prev, {
      text: textToSend.trim(),
      sent: true,
      time: currentTime,
      _id: Date.now(),
      type: messageType || 'text',
      fileUrl: fileUrl || null
    }]);

    // Add to conversations if this is the first message
    setConversations(prevConvos => {
      const exists = prevConvos.find(c => c.partnerId === selectedChat._id);
      if (!exists) {
        return [{
          partnerId: selectedChat._id,
          firstName: selectedChat.firstName,
          lastName: selectedChat.lastName,
          email: selectedChat.email,
          lastMessage: textToSend.trim(),
          timestamp: new Date().toISOString()
        }, ...prevConvos];
      } else {
        return prevConvos.map(convo => 
          convo.partnerId === selectedChat._id
            ? { ...convo, lastMessage: textToSend.trim(), timestamp: new Date().toISOString() }
            : convo
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    });

    if (messageType === 'text') {
      setMessage('');
    }
  };
  
  const handleVideoCall = () => {
    const meetingId = `brainbarter-${user._id}-${selectedChat._id}-${Date.now()}`;
    const jitsiLink = `https://meet.jit.si/${meetingId}`;
    const videoMessage = `🎥 Video call invitation: ${jitsiLink}`;
    
    handleSendMessage(videoMessage, 'video');
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('authToken');
        const response = await axios.post('http://localhost:5000/api/upload/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        });
        
        const fileData = response.data;
        const fileMessage = `📎 ${fileData.originalName}`;
        handleSendMessage(fileMessage, 'file', fileData.url);
      } catch (error) {
        console.error('File upload failed:', error);
        alert('File upload failed');
      }
    }
  };
  
  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message, 'text');
    }
  };

  // Filter lists
  const filteredConversations = conversations.filter(convo => {
    const fullName = `${convo.firstName || ''} ${convo.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const filteredMatches = matchedUsers.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const styles = {
    container: {
      height: "100vh",
      backgroundColor: "#e5dcd3ff",
      color: "#4b3b34",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden",
      overflowY: "hidden",
    },
    chatContainer: {
      display: "flex",
      flex: 1,
      height: "calc(100vh - 70px)",
      overflow: "hidden",
    },
    sidebar: {
      width: "350px",
      backgroundColor: "#fff",
      borderRight: "1px solid #e0d5cc",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    },
    sidebarHeader: {
      padding: "1.5rem",
      borderBottom: "1px solid #e0d5cc",
      flexShrink: 0,
    },
    sidebarTitle: {
      fontSize: "1.7rem",
      fontWeight: "bold",
      color: "#4b3b34",
      marginBottom: "1rem",
    },
    // Tab styles
    tabContainer: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    tab: {
      flex: 1,
      padding: "0.75rem",
      textAlign: "center",
      cursor: "pointer",
      borderRadius: "8px",
      fontWeight: "600",
      transition: "all 0.2s ease",
    },
    activeTab: {
      backgroundColor: "#8b6b5c",
      color: "#fff",
    },
    inactiveTab: {
      backgroundColor: "#f5ede6",
      color: "#4b3b34",
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
      height: 0,
      minHeight: 0,
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
    },
    chatMain: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      height: "100%",
      overflow: "hidden",
    },
    chatHeader: {
      padding: "1rem 1.5rem",
      borderBottom: "1px solid #e0d5cc",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      flexShrink: 0,
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
      height: 0,
      minHeight: 0,
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
      flexShrink: 0,
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
    inputActions: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    actionBtn: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "0.5rem",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#8b6b5c",
      transition: "background-color 0.2s ease",
    },
    emojiPicker: {
      position: "absolute",
      bottom: "70px",
      right: "20px",
      backgroundColor: "#fff",
      border: "1px solid #e0d5cc",
      borderRadius: "12px",
      padding: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      zIndex: 1000,
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: "0.5rem",
    },
    emojiBtn: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      padding: "0.5rem",
      borderRadius: "6px",
      transition: "background-color 0.2s ease",
    },
    hiddenFileInput: {
      display: "none",
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
    avatarContainer: {
      position: "relative",
    },
    unreadBadge: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      flexShrink: 0,
      marginLeft: 'auto'
    },
    newMessageDot: {
      color: '#22c55e',
      fontSize: '1.5rem',
      marginLeft: '0.5rem',
      animation: 'pulse 2s infinite'
    },
  };

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

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.chatContainer}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Messages</h2>
            
            {/* Tabs */}
            <div style={styles.tabContainer}>
              <div
                style={{
                  ...styles.tab,
                  ...(activeTab === 'conversations' ? styles.activeTab : styles.inactiveTab)
                }}
                onClick={() => setActiveTab('conversations')}
              >
                <MessageCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Chats ({conversations.length})
              </div>
              <div
                style={{
                  ...styles.tab,
                  ...(activeTab === 'matches' ? styles.activeTab : styles.inactiveTab)
                }}
                onClick={() => setActiveTab('matches')}
              >
                <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Matches ({matchedUsers.length})
              </div>
            </div>

            <div style={styles.searchBox}>
              <Search size={16} style={{ color: "#8b6b5c" }} />
              <input
                type="text"
                placeholder="Search..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.chatList}>
            {/* Show Conversations Tab */}
            {activeTab === 'conversations' && (
              filteredConversations.length > 0 ? (
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
                      <div style={styles.chatPreview}>{convo.lastMessage || 'No messages yet'}</div>
                    </div>
                    {unreadCounts[convo.partnerId] > 0 && (
                      <div style={styles.unreadBadge}>
                        {unreadCounts[convo.partnerId]}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#8b6b5c" }}>
                  No conversations yet
                </div>
              )
            )}

            {/* Show Matches Tab */}
            {activeTab === 'matches' && (
              filteredMatches.length > 0 ? (
                filteredMatches.map((matchUser) => (
                  <div
                    key={matchUser._id}
                    style={{
                      ...styles.chatItem,
                      ...(selectedChat?._id === matchUser._id ? styles.chatItemActive : {})
                    }}
                    onClick={() => handleSelectMatch(matchUser)}
                    onMouseEnter={(e) => {
                      if (selectedChat?._id !== matchUser._id) {
                        e.currentTarget.style.backgroundColor = "#fafafa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChat?._id !== matchUser._id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div style={styles.avatarContainer}>
                      <div style={styles.avatar}>{getInitials(matchUser)}</div>
                    </div>
                    <div style={styles.chatInfo}>
                      <div style={styles.chatName}>{getFullName(matchUser)}</div>
                      <div style={{
                        fontSize: "0.8rem",
                        color: "#8b6b5c",
                        marginTop: "0.25rem"
                      }}>
                        {matchUser.skillOffered && matchUser.skillRequested ? (
                          <>
                            <div>They offered: {matchUser.skillOffered}</div>
                            <div>You offered: {matchUser.skillRequested}</div>
                          </>
                        ) : (
                          "Start a conversation"
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#8b6b5c" }}>
                  No matches yet
                </div>
              )
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
                    <div style={styles.chatHeaderName}>
                      {getFullName(selectedChat)}
                      {unreadCounts[selectedChat._id] > 0 && (
                        <span style={styles.newMessageDot}>•</span>
                      )}
                    </div>
                    <div style={styles.chatHeaderStatus}>Brain Barter User</div>
                  </div>
                </div>
              </div>

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
                        {msg.type === 'video' && msg.text.includes('meet.jit.si') ? (
                          <div>
                            🎥 Video call invitation
                            <br />
                            <a 
                              href={msg.text.split(': ')[1]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: msg.sent ? '#fff' : '#8b6b5c', textDecoration: 'underline' }}
                            >
                              Join Meeting
                            </a>
                          </div>
                        ) : msg.type === 'file' && msg.fileUrl ? (
                          <div>
                            📎 {msg.text.replace('📎 ', '')}
                            <br />
                            <a 
                              href={msg.fileUrl.startsWith('http') ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              style={{ 
                                color: msg.sent ? '#fff' : '#8b6b5c', 
                                textDecoration: 'underline',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                              }}
                            >
                              📥 View/Download File
                            </a>
                          </div>
                        ) : (
                          msg.text
                        )}
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
                  <div style={styles.inputActions}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={styles.hiddenFileInput}
                    />
                    <button 
                      style={styles.actionBtn}
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>
                    <button 
                      style={styles.actionBtn}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Add emoji"
                    >
                      <Smile size={18} />
                    </button>
                    <button 
                      style={styles.actionBtn}
                      onClick={handleVideoCall}
                      title="Start video call"
                    >
                      <Video size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    style={styles.messageInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button style={styles.sendBtn} onClick={() => handleSendMessage()}>
                    <Send size={16} />
                  </button>
                </div>
                
                {showEmojiPicker && (
                  <div style={styles.emojiPicker}>
                    {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '😊', '😢', '😡', '🤝', '👋', '🙏'].map(emoji => (
                      <button
                        key={emoji}
                        style={styles.emojiBtn}
                        onClick={() => {
                          insertEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f5ede6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
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
    </div>
  );
}
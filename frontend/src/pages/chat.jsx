import React, { useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import { Send, Search, Users, MessageCircle, Paperclip, Smile, Video, Trash2, UserX, MoreVertical, Home, User, Book, Calendar, Bell } from "lucide-react";
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user, refreshUser, socket, confirmDeleteMatch } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]); // NEW: Matched users
  const [blockedUsers, setBlockedUsers] = useState([]); // Track blocked users
  
  // Debug blocked users state
  useEffect(() => {
    console.log('Blocked users state changed:', blockedUsers);
  }, [blockedUsers]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('conversations');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [videoCallSession, setVideoCallSession] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentSessionRole, setCurrentSessionRole] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [currentLearnerId, setCurrentLearnerId] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    clarity: '',
    focus: '',
    pace: '',
    comfort: '',
    rating: 0
  });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [showChatMenu, setShowChatMenu] = useState(null);
  const [isMessageSelectMode, setIsMessageSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowChatMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch blocked users on component mount
useEffect(() => {
  const fetchBlockedUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (token && user && user._id) {
      try {
        console.log('Fetching blocked users for user:', user._id);
        const res = await axios.get('http://localhost:5000/api/user/blocked', {
          headers: { 'x-auth-token': token }
        });
        console.log('Blocked users API response:', res.data);
        
        // Handle both populated objects and plain IDs
        const blockedUserIds = (res.data.blockedUsers || []).map(user => 
          typeof user === 'string' ? user : user._id
        );
        
        console.log('Setting blocked users to:', blockedUserIds);
        setBlockedUsers(blockedUserIds);
      } catch (err) {
        console.error('Failed to fetch blocked users:', err);
      }
    }
  };
  
  fetchBlockedUsers();
}, [user]);

  // Listen for incoming messages and video call events
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (data) => {
      console.log('Message received:', data);
      
      // Block messages from blocked users
      if (blockedUsers.includes(data.senderId)) {
        console.log('Message blocked from blocked user:', data.senderId);
        return;
      }
      
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
          fileUrl: data.fileUrl || null,
          sessionId: data.sessionId || null,
          learnerId: data.learnerId || null,
          teacherId: data.teacherId || null,
          meetingLink: data.meetingLink || null,
          feedbackSubmitted: data.feedbackSubmitted || false
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
      toast.error(error.error || 'Failed to send message');
    };



    const handleVideoCallAccepted = (data) => {
      console.log('Video call accepted:', data);
      toast.success('Video call accepted! Meeting link sent to chat.');
    };

    const handleVideoCallDeclined = (data) => {
      console.log('Video call declined:', data);
      // Update the message to show declined status using sessionId
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sessionId === data.sessionId || (msg.text && msg.text.includes('🎥 Video call invitation - Waiting for confirmation'))
            ? { ...msg, text: '🎥 Video call invitation - Declined', callStatus: 'declined' }
            : msg
        )
      );
    };

    const handleVideoCallStatusUpdate = (data) => {
      console.log('Video call status update:', data);
      // Update message status based on response using sessionId
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.sessionId === data.sessionId || (msg.text && msg.text.includes('🎥 Video call invitation - Waiting for confirmation'))) {
            if (data.accepted) {
              return { ...msg, text: '🎥 Video call invitation - Accepted', callStatus: 'accepted' };
            } else {
              return { ...msg, text: '🎥 Video call invitation - Declined', callStatus: 'declined' };
            }
          }
          return msg;
        })
      );
    };

    const handleCreditDeducted = (data) => {
      console.log('Credit deducted:', data);
      toast.success(data.message + ` (${data.remainingCredits} credits remaining)`);
      refreshUser();
    };

    const handleCreditReceived = (data) => {
      console.log('Credit received:', data);
      toast.success(data.message);
      refreshUser();
    };

    const handleFeedbackSubmitted = (data) => {
      console.log('Feedback submitted:', data);
      toast.success('Feedback submitted successfully!');
      
      // Show credit received notification if user was the teacher
      if (data.creditAwarded) {
        toast.success('💰 1 credit received for teaching!');
      }
      
      setShowFeedbackModal(false);
      setCurrentSessionId(null);
    };

    const handleCreditError = (data) => {
      console.log('Credit error:', data);
      toast.error(data.error);
    };

    const handleFeedbackError = (data) => {
      console.log('Feedback error:', data);
      toast.error(data.error);
    };

    const handleVideoCallInvitation = (data) => {
      console.log('Received video call invitation:', data);
      setIncomingCallData(data);
      setShowIncomingCallModal(true);
    };
     const handleUserBlocked = (data) => {
    console.log('User blocked event:', data);
    setBlockedUsers(prev => [...prev, data.blockedUserId]);
  };
  
  const handleUserUnblocked = (data) => {
    console.log('User unblocked event:', data);
    setBlockedUsers(prev => prev.filter(id => id !== data.unblockedUserId));
  };

    const handleFeedbackStatusUpdate = (data) => {
      console.log('Feedback status update:', data);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sessionId === data.sessionId 
            ? { ...msg, feedbackSubmitted: data.feedbackSubmitted }
            : msg
        )
      );
    };

    const handleMatchDeleted = (data) => {
      console.log('Match deleted:', data);
      const deletedUserId = data.deletedByUserId;
      
      // Remove from matched users list
      setMatchedUsers(prev => prev.filter(user => user._id !== deletedUserId));
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.partnerId !== deletedUserId));
      
      // Clear selected chat if it's the deleted user
      if (selectedChat?._id === deletedUserId) {
        setSelectedChat(null);
        setMessages([]);
      }
      
      toast.info(data.message);
    };

    const handleNewConnection = (data) => {
      console.log('New connection accepted:', data);
      // Refresh matched users list to include the new connection
      const fetchMatchedUsers = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const res = await axios.get('http://localhost:5000/api/matches/accepted', {
              headers: { 'x-auth-token': token }
            });
            const users = res.data.matches.map(match => ({
              _id: match.partnerId,
              firstName: match.firstName,
              lastName: match.lastName,
              email: match.email
            }));
            setMatchedUsers(users);
          } catch (err) {
            console.error('Failed to refresh matched users:', err);
          }
        }
      };
      fetchMatchedUsers();
    };
    
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageError', handleMessageError);
    socket.on('videoCallInvitation', handleVideoCallInvitation);
    socket.on('videoCallAccepted', handleVideoCallAccepted);
    socket.on('videoCallDeclined', handleVideoCallDeclined);
    socket.on('videoCallStatusUpdate', handleVideoCallStatusUpdate);
    socket.on('creditDeducted', handleCreditDeducted);
    socket.on('creditReceived', handleCreditReceived);
    socket.on('feedbackSubmitted', handleFeedbackSubmitted);
    socket.on('creditError', handleCreditError);
    socket.on('feedbackError', handleFeedbackError);
    socket.on('feedbackStatusUpdate', handleFeedbackStatusUpdate);
    socket.on('matchDeleted', handleMatchDeleted);
    socket.on('newConnection', handleNewConnection);
    socket.on('userBlocked', handleUserBlocked);
    socket.on('userUnblocked', handleUserUnblocked);

    // Debug socket events
    socket.on('connect', () => {
      console.log('Socket connected in chat:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected in chat');
    });

    return () => {
      if (socket) {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('messageSent', handleMessageSent);
        socket.off('messageError', handleMessageError);
        socket.off('videoCallInvitation', handleVideoCallInvitation);
        socket.off('videoCallAccepted', handleVideoCallAccepted);
        socket.off('videoCallDeclined', handleVideoCallDeclined);
        socket.off('videoCallStatusUpdate', handleVideoCallStatusUpdate);
        socket.off('creditDeducted', handleCreditDeducted);
        socket.off('creditReceived', handleCreditReceived);
        socket.off('feedbackSubmitted', handleFeedbackSubmitted);
        socket.off('creditError', handleCreditError);
        socket.off('feedbackError', handleFeedbackError);
        socket.off('feedbackStatusUpdate', handleFeedbackStatusUpdate);
        socket.off('matchDeleted', handleMatchDeleted);
        socket.off('newConnection', handleNewConnection);
        socket.off('userBlocked', handleUserBlocked);
        socket.off('userUnblocked', handleUserUnblocked);
      }
    };
  }, [selectedChat, user, socket, blockedUsers]);

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
        fileUrl: msg.fileUrl || null,
        sessionId: msg.sessionId || null,
        learnerId: msg.learnerId || null,
        teacherId: msg.teacherId || null,
        meetingLink: msg.meetingLink || null,
        feedbackSubmitted: msg.feedbackSubmitted || false
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

    // Prevent sending messages to blocked users
    if (blockedUsers.includes(selectedChat._id)) {
      toast.error('Cannot send messages to blocked users');
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
      fileUrl: fileUrl || null,
      sessionId: null,
      learnerId: null,
      teacherId: null,
      meetingLink: null,
      feedbackSubmitted: false
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
    setUserRole('');
    setShowVideoCallModal(true);
  };

const confirmVideoCall = async () => {
  if (!userRole) {
    toast.error('Please select your role for this session');
    return;
  }
  
  // Check if user has enough credits (only for learners)
  if (userRole === 'learner' && user.credits < 1) {
    toast.error('You need at least 1 credit to start a video call session.');
    return;
  }
  
  try {
    // Store the role for this session BEFORE closing modal
    setCurrentSessionRole(userRole);
    console.log('Setting current session role to:', userRole);
    
    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    
    // Set teacher and learner IDs based on roles
    if (userRole === 'teacher') {
      setCurrentTeacherId(user._id);
      setCurrentLearnerId(selectedChat._id);
    } else {
      setCurrentTeacherId(selectedChat._id);
      setCurrentLearnerId(user._id);
    }
    
    setShowVideoCallModal(false);
    
    // Send invitation message with sessionId
    const videoMessage = `🎥 Video call invitation - Waiting for confirmation`;
    
    // Add message with sessionId for tracking
    setMessages(prev => [...prev, {
      text: videoMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      _id: Date.now(),
      type: 'text',
      sessionId: sessionId,
      callStatus: 'waiting'
    }]);
    
    // Send via socket
    socket.emit('privateMessage', {
      senderId: String(user._id),
      recipientId: String(selectedChat._id),
      text: videoMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    });
    
    // Notify other user via socket
    socket.emit('videoCallInvitation', {
      sessionId,
      from: user._id,
      to: selectedChat._id,
      fromName: `${user.firstName} ${user.lastName}`,
      senderRole: userRole,
      initiatedBy: user._id
    });
    
  } catch (error) {
    console.error('Error creating video session:', error);
    toast.error('Failed to create video session');
  }
};

  const submitFeedback = async () => {
    if (!currentSessionId) {
      toast.error('Session information not found. Please try again.');
      return;
    }
    
    // Validate all feedback fields are filled
    const requiredFields = ['clarity', 'focus', 'pace', 'comfort', 'rating'];
    const missingFields = requiredFields.filter(field => !feedbackData[field] || (field === 'rating' && feedbackData[field] === 0));
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all feedback questions before submitting.');
      return;
    }
    
    // Submit feedback via socket
    socket.emit('submitFeedback', {
      sessionId: currentSessionId,
      feedback: feedbackData
    });
    
    // Reset form
    setFeedbackData({ clarity: '', focus: '', pace: '', comfort: '', rating: 0 });
    setCurrentSessionId(null);
    setCurrentTeacherId(null);
    setCurrentLearnerId(null);
    setCurrentSessionRole('');
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
        toast.error('File upload failed');
      }
    }
  };

  const deleteSelectedChats = async (chatIds = selectedChats) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/chat/delete-conversations', {
        conversationIds: chatIds
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setConversations(prev => prev.filter(conv => !chatIds.includes(conv.partnerId)));
      setSelectedChats([]);
      setIsSelectMode(false);
      setShowChatMenu(null);
      if (selectedChat && chatIds.includes(selectedChat._id)) {
        setSelectedChat(null);
        setMessages([]);
      }
      toast.success(chatIds.length === 1 ? 'Chat cleared successfully' : 'Conversations deleted successfully');
    } catch (error) {
      console.error('Error deleting conversations:', error);
      toast.error('Failed to delete conversations');
    }
  };

const blockUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Blocking user:', userId);
    
    await axios.post('http://localhost:5000/api/user/block', {
      blockedUserId: userId
    }, {
      headers: { 'x-auth-token': token }
    });
    
    // Update blocked users list immediately
    setBlockedUsers(prev => {
      const newList = [...prev, userId];
      console.log('Updated blocked users list:', newList);
      return newList;
    });
    
    // Close the chat menu if open
    setShowChatMenu(null);
    
    // Refresh the user data to ensure backend sync
    if (refreshUser) {
      await refreshUser();
    }
    
    toast.success('User blocked successfully');
  } catch (error) {
    console.error('Error blocking user:', error);
    toast.error(error.response?.data?.error || 'Failed to block user');
  }
};

  const toggleChatSelection = (partnerId) => {
    setSelectedChats(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const deleteSelectedMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/chat/delete-messages', {
        messageIds: selectedMessages
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg._id)));
      setSelectedMessages([]);
      setIsMessageSelectMode(false);
      toast.success('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Failed to delete messages');
    }
  };

const unblockUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Unblocking user:', userId);
    
    await axios.post('http://localhost:5000/api/user/unblock', {
      unblockedUserId: userId
    }, {
      headers: { 'x-auth-token': token }
    });
    
    // Remove from blocked users list immediately
    setBlockedUsers(prev => {
      const newList = prev.filter(id => id !== userId);
      console.log('Updated blocked users list after unblock:', newList);
      return newList;
    });
    
    // Refresh matched users to show the unblocked user
    const res = await axios.get('http://localhost:5000/api/matches/accepted', {
      headers: { 'x-auth-token': token }
    });
    const users = res.data.matches.map(match => ({
      _id: match.partnerId,
      firstName: match.firstName,
      lastName: match.lastName,
      email: match.email
    }));
    setMatchedUsers(users);
    
    // Refresh the user data to ensure backend sync
    if (refreshUser) {
      await refreshUser();
    }
    
    toast.success('User unblocked successfully');
  } catch (error) {
    console.error('Error unblocking user:', error);
    toast.error(error.response?.data?.error || 'Failed to unblock user');
  }
};

  const deleteMatch = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Deleting match with user:', userId);
      
      if (!userId) {
        throw new Error('Invalid user ID');
      }
      
      const response = await axios.delete(`http://localhost:5000/api/matches/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        // Update local state immediately
        setMatchedUsers(prev => prev.filter(user => user._id !== userId));
        setConversations(prev => prev.filter(conv => conv.partnerId !== userId));
        
        // Clear selected chat if it's the deleted user
        if (selectedChat?._id === userId) {
          setSelectedChat(null);
          setMessages([]);
        }
        
        toast.success('Match deleted permanently');
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete match';
      toast.error(errorMessage);
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
      width: "450px",
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
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#4b3b34'
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    modalBtn: {
      flex: 1,
      padding: '0.75rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500'
    },
    confirmBtn: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      transition: 'background-color 0.2s ease'
    },
    cancelBtn: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      transition: 'background-color 0.2s ease'
    },
    feedbackQuestion: {
      marginBottom: '1.5rem'
    },
    questionLabel: {
      display: 'block',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#4b3b34'
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    radioInput: {
      margin: 0
    },
    starRating: {
      display: 'flex',
      gap: '0.25rem',
      fontSize: '1.5rem'
    },
    star: {
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    chatActions: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.5rem 1.5rem',
      borderBottom: '1px solid #e0d5cc'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500'
    },
    checkbox: {
      marginRight: '0.5rem',
      accentColor: '#8b6b5c'
    },

    chatHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      position: 'relative'
    },
    headerActionBtn: {
      padding: '0.5rem',
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    horizontalMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    menuIconContainer: {
      position: 'relative',
      display: 'inline-block'
    },
    menuIcon: {
      padding: '0.5rem',
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    tooltip: {
      position: 'absolute',
      bottom: '-35px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#402E2A',
      color: '#fff',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.2s ease',
      zIndex: 1001,
      pointerEvents: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    blockedBadge: {
      backgroundColor: '#ef4444',
      color: '#fff',
      fontSize: '0.6rem',
      padding: '0.15rem 0.4rem',
      borderRadius: '10px',
      marginLeft: '0.5rem',
      fontWeight: 'bold'
    },
    blockedHeaderBadge: {
      backgroundColor: '#ef4444',
      color: '#fff',
      fontSize: '0.7rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      marginLeft: '0.75rem',
      fontWeight: 'bold'
    },
    blockedInputContainer: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e0d5cc',
      backgroundColor: '#f5f5f5',
      flexShrink: 0
    },
    blockedMessage: {
      textAlign: 'center',
      color: '#ef4444',
      fontSize: '0.9rem',
      fontWeight: '500',
      padding: '1rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px'
    },
    messageCheckbox: {
      marginBottom: '0.5rem',
      accentColor: '#8b6b5c'
    },
    feedbackHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
      borderBottom: '2px solid #8b6b5c',
      paddingBottom: '1rem'
    },
    feedbackTitle: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#4b3b34',
      margin: '0 0 0.5rem 0'
    },
    feedbackSubtitle: {
      fontSize: '1rem',
      color: '#8b6b5c',
      margin: 0
    },
    radioGroupGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem'
    },
    radioOptionGrid: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.25rem'
    },
    videoCallHeader: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      borderBottom: '2px solid #8b6b5c',
      paddingBottom: '1rem'
    },
    videoCallTitle: {
      fontSize: '1.6rem',
      fontWeight: 'bold',
      color: '#4b3b34',
      margin: '0 0 0.5rem 0'
    },
    videoCallSubtitle: {
      fontSize: '1rem',
      color: '#8b6b5c',
      margin: 0
    }
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
      {/* Custom Navbar with Animated Dock */}
      <nav style={{ backgroundColor: '#402E2A', padding: '1rem 1.5rem', borderBottom: '1px solid #947C70' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EDE3DB', textDecoration: 'none', cursor: 'pointer' }}
          >
            Brain Barter
          </div>
          
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
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
                setHoveredButton('dashboard');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
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
                  zIndex: 1000
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
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
                setHoveredButton('profile');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
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
                  zIndex: 1000
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
              onClick={() => navigate('/chat')}
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
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
                setHoveredButton('chat');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
                setHoveredButton(null);
              }}
            >
              <MessageCircle size={24} />
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
                  zIndex: 1000
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
              onClick={() => navigate('/skills')}
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
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
                setHoveredButton('skills');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
                setHoveredButton(null);
              }}
            >
              <Book size={24} />
              {hoveredButton === 'skills' && (
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
                  zIndex: 1000
                }}>
                  Skills
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
              onClick={() => navigate('/sessions')}
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
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 237, 230, 0.2)';
                setHoveredButton('sessions');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'transparent';
                setHoveredButton(null);
              }}
            >
              <Calendar size={24} />
              {hoveredButton === 'sessions' && (
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
                  zIndex: 1000
                }}>
                  Sessions
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
        </div>
      </nav>
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
                      <div style={styles.chatName}>
                        {getFullName(convo)}
                        {blockedUsers.includes(convo.partnerId) && (
                          <span style={styles.blockedBadge}>BLOCKED</span>
                        )}
                      </div>
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
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.75rem'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMatch(matchUser);
                          }}
                          style={{
                            backgroundColor: '#8b6b5c',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#6d5447'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                        >
                          <MessageCircle size={14} />
                          Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteMatch(
                              {
                                firstName: matchUser.firstName,
                                lastName: matchUser.lastName
                              },
                              () => deleteMatch(matchUser._id)
                            );
                          }}
                          style={{
                            backgroundColor: '#3c2415',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2d1b0f'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3c2415'}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
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
                      {blockedUsers.includes(selectedChat._id) && (
                        <span style={styles.blockedHeaderBadge}>BLOCKED</span>
                      )}
                      {unreadCounts[selectedChat._id] > 0 && (
                        <span style={styles.newMessageDot}>•</span>
                      )}
                    </div>
                    <div style={styles.chatHeaderStatus}>
                      {blockedUsers.includes(selectedChat._id) ? 'Blocked User - View Only' : 'Brain Barter User'}
                    </div>
                  </div>
                </div>
                <div style={styles.chatHeaderActions}>
                  <div style={styles.horizontalMenu}>
                    <div 
                      style={styles.menuIconContainer}
                      onMouseEnter={(e) => {
                        const tooltip = e.currentTarget.querySelector('div');
                        const button = e.currentTarget.querySelector('button');
                        if (tooltip) {
                          tooltip.style.opacity = '1';
                          tooltip.style.visibility = 'visible';
                        }
                        if (button) {
                          button.style.backgroundColor = '#6d5447';
                          button.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('div');
                        const button = e.currentTarget.querySelector('button');
                        if (tooltip) {
                          tooltip.style.opacity = '0';
                          tooltip.style.visibility = 'hidden';
                        }
                        if (button) {
                          button.style.backgroundColor = '#8b6b5c';
                          button.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <button 
                        style={styles.menuIcon}
                        onClick={() => {
                          setIsMessageSelectMode(!isMessageSelectMode);
                          setSelectedMessages([]);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div style={styles.tooltip}>Delete Messages</div>
                    </div>
                    
                    {!blockedUsers.includes(selectedChat._id) ? (
                      <div 
                        style={styles.menuIconContainer}
                        onMouseEnter={(e) => {
                          const tooltip = e.currentTarget.querySelector('div');
                          const button = e.currentTarget.querySelector('button');
                          if (tooltip) {
                            tooltip.style.opacity = '1';
                            tooltip.style.visibility = 'visible';
                          }
                          if (button) {
                            button.style.backgroundColor = '#6d5447';
                            button.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const tooltip = e.currentTarget.querySelector('div');
                          const button = e.currentTarget.querySelector('button');
                          if (tooltip) {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                          }
                          if (button) {
                            button.style.backgroundColor = '#8b6b5c';
                            button.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <button 
                          style={styles.menuIcon}
                          onClick={() => blockUser(selectedChat._id)}
                        >
                          <UserX size={16} />
                        </button>
                        <div style={styles.tooltip}>Block User</div>
                      </div>
                    ) : (
                      <div 
                        style={styles.menuIconContainer}
                        onMouseEnter={(e) => {
                          const tooltip = e.currentTarget.querySelector('div');
                          const button = e.currentTarget.querySelector('button');
                          if (tooltip) {
                            tooltip.style.opacity = '1';
                            tooltip.style.visibility = 'visible';
                          }
                          if (button) {
                            button.style.backgroundColor = '#22c55e';
                            button.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const tooltip = e.currentTarget.querySelector('div');
                          const button = e.currentTarget.querySelector('button');
                          if (tooltip) {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                          }
                          if (button) {
                            button.style.backgroundColor = '#8b6b5c';
                            button.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <button 
                          style={styles.menuIcon}
                          onClick={() => unblockUser(selectedChat._id)}
                        >
                          <Users size={16} />
                        </button>
                        <div style={styles.tooltip}>Unblock User</div>
                      </div>
                    )}
                  </div>
                  
                  {isMessageSelectMode && selectedMessages.length > 0 && (
                    <button 
                      style={{...styles.headerActionBtn, backgroundColor: '#ef4444'}}
                      onClick={deleteSelectedMessages}
                    >
                      <Trash2 size={16} /> ({selectedMessages.length})
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.messagesContainer}>
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      style={{
                        ...styles.messageGroup,
                        ...(msg.sent ? styles.messageGroupSent : styles.messageGroupReceived),
                        ...(selectedMessages.includes(msg._id) ? {backgroundColor: '#e5dcd3'} : {})
                      }}
                      onClick={() => isMessageSelectMode && toggleMessageSelection(msg._id)}
                    >
                      {isMessageSelectMode && (
                        <input 
                          type="checkbox" 
                          checked={selectedMessages.includes(msg._id)}
                          onChange={() => toggleMessageSelection(msg._id)}
                          style={{
                            ...styles.messageCheckbox,
                            alignSelf: msg.sent ? 'flex-end' : 'flex-start'
                          }}
                        />
                      )}
                      <div
                        style={{
                          ...styles.message,
                          ...(msg.sent ? styles.messageSent : styles.messageReceived),
                          cursor: isMessageSelectMode ? 'pointer' : 'default'
                        }}
                      >
                        {msg.type === 'video' ? (
                          <div style={{
                            backgroundColor: msg.sent ? 'rgba(255,255,255,0.1)' : 'rgba(139,107,92,0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            border: `1px solid ${msg.sent ? 'rgba(255,255,255,0.2)' : 'rgba(139,107,92,0.2)'}`,
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📹 Session started</div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <a 
                                href={msg.meetingLink || `https://meet.jit.si/brainbarter-${msg.sessionId}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  backgroundColor: msg.sent ? 'rgba(255,255,255,0.2)' : '#8b6b5c',
                                  color: msg.sent ? '#fff' : '#fff',
                                  textDecoration: 'none',
                                  padding: '0.75rem 1.5rem',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  display: 'inline-block',
                                  marginBottom: '0.5rem'
                                }}
                              >
                                🔗 Join Meeting
                              </a>
                            </div>
                            
                            {msg.learnerId === user._id && (
                              <div>
                                {msg.feedbackSubmitted ? (
                                  <span 
                                    style={{ 
                                      color: '#22c55e',
                                      fontSize: '1rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✓ Feedback Submitted
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setCurrentSessionId(msg.sessionId);
                                      setCurrentTeacherId(msg.teacherId);
                                      setCurrentLearnerId(msg.learnerId);
                                      setCurrentSessionRole('learner');
                                      setShowFeedbackModal(true);
                                    }}
                                    style={{ 
                                      backgroundColor: msg.sent ? 'rgba(255,255,255,0.2)' : '#6d5447',
                                      color: '#fff',
                                      border: 'none',
                                      padding: '0.75rem 1.5rem',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontSize: '1rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    📝 Feedback Form
                                  </button>
                                )}
                              </div>
                            )}
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

              {!blockedUsers.includes(selectedChat._id) ? (
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
              ) : (
                <div style={styles.blockedInputContainer}>
                  <div style={styles.blockedMessage}>
                    🚫 This user is blocked. You cannot send or receive messages.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyChat}>
              <Users style={styles.emptyChatIcon} />
              <div style={styles.emptyChatText}>Select a user to start chatting</div>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Confirmation Modal */}
      {showVideoCallModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.videoCallHeader}>
              <h2 style={styles.videoCallTitle}>📹 Start Video Session</h2>
              <p style={styles.videoCallSubtitle}>Ready to connect with {getFullName(selectedChat)}?</p>
            </div>
            
            <div style={{ margin: '1.5rem 0' }}>
              <label style={styles.questionLabel}>What would you like to do in this session?</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="teacher"
                    checked={userRole === 'teacher'}
                    onChange={(e) => setUserRole(e.target.value)}
                    style={styles.radioInput}
                  />
                  I would teach
                </label>
                <label style={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="learner"
                    checked={userRole === 'learner'}
                    onChange={(e) => setUserRole(e.target.value)}
                    style={styles.radioInput}
                  />
                  I would learn
                </label>
              </div>
            </div>
            
            <div style={styles.modalButtons}>
              <button 
                style={{...styles.modalBtn, ...styles.cancelBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b3b34'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={() => {
                  setShowVideoCallModal(false);
                  setUserRole('');
                }}
              >
                Cancel
              </button>
              <button 
                style={{...styles.modalBtn, ...styles.confirmBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b3b34'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={confirmVideoCall}
              >
                Start Call
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Incoming Video Call Modal */}
      {showIncomingCallModal && incomingCallData && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.videoCallHeader}>
              <h2 style={styles.videoCallTitle}>📞 Incoming Video Call</h2>
              <p style={styles.videoCallSubtitle}>{incomingCallData.fromName} wants to start a learning session with you</p>
              <div style={{
                fontSize: '0.9rem',
                color: '#8b6b5c',
                fontWeight: '600',
                backgroundColor: '#f5ede6',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                You will be the <strong>{incomingCallData.senderRole === 'teacher' ? 'learner' : 'teacher'}</strong> in this session
                {incomingCallData.senderRole === 'teacher' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                    ⚠️ 1 credit will be deducted
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalButtons}>
              <button 
                style={{...styles.modalBtn, ...styles.cancelBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#6d5447'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={() => {
                  socket.emit('videoCallResponse', {
                    sessionId: incomingCallData.sessionId,
                    accepted: false,
                    userId: user._id,
                    senderRole: incomingCallData.senderRole
                  });
                  setShowIncomingCallModal(false);
                  setIncomingCallData(null);
                }}
              >
                Decline
              </button>
              <button 
                style={{...styles.modalBtn, ...styles.confirmBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#6d5447'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={() => {
                  const isLearner = incomingCallData.senderRole === 'teacher';
                  if (isLearner && user.credits < 1) {
                    toast.error('You need at least 1 credit to accept a video call session.');
                    return;
                  }
                  
                  socket.emit('videoCallResponse', {
                    sessionId: incomingCallData.sessionId,
                    accepted: true,
                    userId: user._id,
                    acceptedBy: user._id,
                    senderRole: incomingCallData.senderRole,
                    teacherId: incomingCallData.senderRole === 'teacher' ? incomingCallData.from : user._id,
                    learnerId: incomingCallData.senderRole === 'teacher' ? user._id : incomingCallData.from
                  });
                  setShowIncomingCallModal(false);
                  setIncomingCallData(null);
                }}
              >
                Accept Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.feedbackHeader}>
              <h2 style={styles.feedbackTitle}>📝 Feedback Form</h2>
              <p style={styles.feedbackSubtitle}>Please rate your learning session experience</p>
            </div>
            
            <div style={styles.feedbackQuestion}>
              <label style={styles.questionLabel}>1. How clear were the teacher's explanations?</label>
              <div style={styles.radioGroup}>
                {['Very clear', 'Clear', 'Neutral', 'A bit confusing', 'Very confusing'].map(option => (
                  <label key={option} style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="clarity" 
                      value={option}
                      checked={feedbackData.clarity === option}
                      onChange={(e) => setFeedbackData({...feedbackData, clarity: e.target.value})}
                      style={styles.radioInput}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.feedbackQuestion}>
              <label style={styles.questionLabel}>2. Did the teacher stay focused on the topic?</label>
              <div style={styles.radioGroupGrid}>
                {['Yes, completely', 'Mostly', 'Somewhat', 'Not really', 'Not at all'].map(option => (
                  <label key={option} style={styles.radioOptionGrid}>
                    <input 
                      type="radio" 
                      name="focus" 
                      value={option}
                      checked={feedbackData.focus === option}
                      onChange={(e) => setFeedbackData({...feedbackData, focus: e.target.value})}
                      style={styles.radioInput}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.feedbackQuestion}>
              <label style={styles.questionLabel}>3. How was the pace of the session?</label>
              <div style={styles.radioGroup}>
                {['Too fast', 'Slightly fast', 'Perfect', 'Slightly slow', 'Too slow'].map(option => (
                  <label key={option} style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="pace" 
                      value={option}
                      checked={feedbackData.pace === option}
                      onChange={(e) => setFeedbackData({...feedbackData, pace: e.target.value})}
                      style={styles.radioInput}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.feedbackQuestion}>
              <label style={styles.questionLabel}>4. How comfortable did you feel asking questions?</label>
              <div style={styles.radioGroup}>
                {['Very comfortable', 'Comfortable', 'Neutral', 'Slightly uncomfortable', 'Very uncomfortable'].map(option => (
                  <label key={option} style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="comfort" 
                      value={option}
                      checked={feedbackData.comfort === option}
                      onChange={(e) => setFeedbackData({...feedbackData, comfort: e.target.value})}
                      style={styles.radioInput}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.feedbackQuestion}>
              <label style={styles.questionLabel}>5. Overall rating of the session</label>
              <div style={styles.starRating}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    style={{
                      ...styles.star,
                      color: feedbackData.rating >= star ? '#fbbf24' : '#e5e7eb',
                      transform: feedbackData.rating >= star ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onClick={() => setFeedbackData({...feedbackData, rating: star})}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = feedbackData.rating >= star ? 'scale(1.1)' : 'scale(1)';
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={{...styles.modalBtn, ...styles.cancelBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b3b34'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button 
                style={{...styles.modalBtn, ...styles.confirmBtn}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b3b34'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
                onClick={submitFeedback}
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
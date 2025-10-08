import React, { useState, useRef, useEffect, useContext } from "react";
import axios from 'axios';
import { Send, Search, Users } from "lucide-react";
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext'; // <-- Import AuthContext

const socket = io.connect("http://localhost:5000");

export default function Chat() {
  const { user } = useContext(AuthContext); // Get the logged-in user's info
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Will hold the selected user object
  const [messages, setMessages] = useState([]); // Holds messages for the selected chat
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Register the user with the socket server
  useEffect(() => {
    if (user) {
      socket.emit('register', user.id);
    }
  }, [user]);

  // Fetch the user list
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/user', {
            headers: { 'x-auth-token': token }
          });
          setUsers(res.data);
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      }
    };
    fetchUsers();
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
        // Only add the message if it's part of the currently active chat
        if (selectedChat && data.senderId === selectedChat._id) {
            setMessages(prevMessages => [...prevMessages, data]);
        }
    };
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedChat]);


  // Function to handle selecting a user to chat with
  const handleSelectChat = (user) => {
    setSelectedChat(user);
    setMessages([]); // Clear previous messages
    // In a real app, you would fetch past messages from a database here
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      const messageData = {
        senderId: user.id,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true
      };

      socket.emit('privateMessage', {
        recipientId: selectedChat._id,
        messageData
      });

      setMessages(prev => [...prev, messageData]);
      setMessage('');
    }
  };

  // Your styles object
  const styles = { /* ... PASTE YOUR ORIGINAL STYLES OBJECT HERE ... */ };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.chatContainer}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>{/* ... */}</div>
          <div style={styles.chatList}>
            {users.map((u) => (
              <div key={u._id} onClick={() => handleSelectChat(u)}>{/* ... */}</div>
            ))}
          </div>
        </div>
        <div style={styles.chatMain}>
          {selectedChat ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderName}>{selectedChat.firstName} {selectedChat.lastName}</div>
              </div>
              <div style={styles.messagesContainer}>
                {messages.map((msg, index) => (
                  <div key={index} style={msg.sent ? styles.messageSent : styles.messageReceived}>
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={styles.inputContainer}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <Users />
              <div>Select a conversation to start chatting</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
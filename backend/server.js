// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");

// --------- ROUTES ---------
const statsRoutes = require("./routes/stats");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const matchRoutes = require("./routes/matches");
const sessionRoutes = require("./routes/sessions");
const skillsRoutes = require("./routes/skills");
const userSessionsRoutes = require("./routes/userSessions");
const videoSessionsRoutes = require("./routes/videoSessions");

// --------- MODELS USED BY SOCKETS ---------
const Message = require("./models/Message");
const MatchRequest = require("./models/MatchRequest");

// --------- APP SETUP ---------
const app = express();
const server = http.createServer(app);

// --------- SOCKET.IO INITIALIZATION ---------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --------- MIDDLEWARES ---------
app.use(express.json());
app.use(cors());
app.use(helmet());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// --- SMART RATE LIMITER CONFIG ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 5000 : 0, // disable in dev
  message: { error: "Too many requests, try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// --- CONDITIONAL RATE LIMITING ---
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", limiter); // Apply limiter only to auth routes
  console.log("🛡️ Rate limiter active (production mode)");
} else {
  console.log("⚙️ Development mode: Rate limiter disabled");
}

// --- SHARE SOCKET.IO + USERSOCKET MAP ---
const userSockets = {}; // Tracks which userId -> socket.id
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

// --------- ROUTES SETUP ---------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/users', require('./routes/users'));
app.use("/api/stats", statsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/user-sessions", userSessionsRoutes);
app.use("/api/video-sessions", videoSessionsRoutes);
app.use("/api/upload", require('./routes/upload'));

// --------- DATABASE CONNECTION ---------
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brain_barter";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------- SOCKET.IO LOGIC ---------
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // Register: client should emit 'register' with the authenticated userId after connecting
  socket.on('register', (userId) => {
    if (!userId) return;
    socket.userId = String(userId);
    userSockets[socket.userId] = socket.id;
    console.log(`✅ Registered user ${socket.userId} -> socket ${socket.id}`);
  });

  // PRIVATE MESSAGE: validate accepted match, save message, emit to recipient (if online)
  socket.on("privateMessage", async (payload) => {
    try {
      console.log('Received privateMessage:', payload);
      const { senderId, recipientId, text, type, timestamp } = payload;

      // basic validation
      if (!senderId || !recipientId || !text || typeof text !== 'string' || text.trim().length === 0) {
        console.log('Invalid payload validation failed:', {
          senderId: !!senderId,
          recipientId: !!recipientId,
          text: !!text,
          textType: typeof text,
          textLength: text ? text.trim().length : 0,
          fullPayload: payload
        });
        socket.emit('messageError', { error: 'Invalid message payload' });
        return;
      }
      
      console.log('Payload validation passed, checking matches...');
      console.log('SenderId:', senderId, 'RecipientId:', recipientId);

      // Check if users have each other in their matches array
      const User = require('./models/User');
      const senderUser = await User.findById(senderId);
      const recipientUser = await User.findById(recipientId);
      
      if (!senderUser || !recipientUser) {
        console.log('User not found:', { senderId, recipientId });
        socket.emit('messageError', { error: 'User not found' });
        return;
      }
      
      const senderHasMatch = senderUser.matches.some(match => match.userId.toString() === recipientId);
      const recipientHasMatch = recipientUser.matches.some(match => match.userId.toString() === senderId);
      
      if (!senderHasMatch || !recipientHasMatch) {
        console.log('No mutual match found between:', senderId, 'and', recipientId);
        console.log('Sender matches:', senderUser.matches.map(m => m.userId));
        console.log('Recipient matches:', recipientUser.matches.map(m => m.userId));
        socket.emit('messageError', { error: 'You can only message users with accepted matches' });
        return;
      }
      
      console.log('Match validation passed, saving message...');

      // Save message
      const newMessage = new Message({
        senderId,
        recipientId,
        text,
        type: type || 'text',
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        fileUrl: payload.fileUrl || null
      });

      await newMessage.save();
      console.log('Message saved to DB:', newMessage._id);

      // Build a normalized message to emit
      const emittedMessage = {
        _id: newMessage._id,
        senderId: String(newMessage.senderId),
        recipientId: String(newMessage.recipientId),
        text: newMessage.text,
        type: newMessage.type,
        timestamp: newMessage.timestamp,
        fileUrl: newMessage.fileUrl
      };

      // Emit to recipient if online
      const recipientSocketId = userSockets[String(recipientId)];
      if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
        console.log('Emitting to recipient:', recipientId);
        io.to(recipientSocketId).emit("receiveMessage", emittedMessage);
      } else {
        console.log(`🔔 Recipient ${recipientId} offline. Message stored in DB.`);
      }

      // Emit an acknowledgement to the sender with the saved message
      console.log('Sending confirmation to sender:', senderId);
      socket.emit("messageSent", emittedMessage);

    } catch (err) {
      console.error("❌ Error handling privateMessage:", err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Session decision notifications (keeps payload consistent)
  socket.on('session_decision', ({ recipientId, message }) => {
    if (!recipientId) return;
    const recipientSocketId = userSockets[String(recipientId)];
    if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
      io.to(recipientSocketId).emit('session_update', { message });
    }
  });

  // Video call invitation
  socket.on('videoCallInvitation', (data) => {
    console.log('Video call invitation received:', data);
    const { to, sessionId, from, fromName, senderRole } = data;
    const recipientSocketId = userSockets[String(to)];
    console.log('Recipient socket ID:', recipientSocketId);
    console.log('Available sockets:', Object.keys(userSockets));
    
    if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
      console.log('Sending video call invitation to:', to);
      io.to(recipientSocketId).emit('videoCallInvitation', {
        sessionId,
        from,
        fromName,
        senderRole
      });
    } else {
      console.log('Recipient not online or socket not found');
      // Optionally emit back to sender that recipient is offline
      socket.emit('recipientOffline', { message: 'Recipient is not online' });
    }
  });

  // Video call response
  socket.on('videoCallResponse', async (data) => {
    console.log('Video call response received:', data);
    const { sessionId, accepted, userId, senderRole, acceptedBy } = data;
    
    if (accepted) {
      console.log('Video call accepted, notifying teacher only');
      
      // Only notify the teacher who initiated the call
      if (senderRole === 'teacher') {
        for (const [teacherId, socketId] of Object.entries(userSockets)) {
          if (teacherId !== String(acceptedBy || userId)) {
            const teacherSocket = io.sockets.sockets.get(socketId);
            if (teacherSocket) {
              teacherSocket.emit('videoCallAccepted', { sessionId, senderRole });
              console.log('Notified teacher:', teacherId);
              break;
            }
          }
        }
      }
    } else {
      console.log('Video call declined');
      io.emit('videoCallDeclined', { sessionId });
    }
  });

  // Optional: typing indicator (non-persistent)
  socket.on('typing', ({ toUserId, isTyping }) => {
    const recipientSocketId = userSockets[String(toUserId)];
    if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
      io.to(recipientSocketId).emit('typing', { from: socket.userId, isTyping: !!isTyping });
    }
  });

  // Handle disconnect: remove mapping for this socket.userId
  socket.on('disconnect', () => {
    if (socket.userId && userSockets[socket.userId]) {
      delete userSockets[socket.userId];
      console.log(`❌ User ${socket.userId} disconnected and removed from userSockets`);
    } else {
      // Fallback: try to remove by socket id (legacy)
      for (const uid in userSockets) {
        if (userSockets[uid] === socket.id) {
          delete userSockets[uid];
          console.log(`❌ Removed mapping for user ${uid} (socket:${socket.id})`);
        }
      }
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// --------- START SERVER ---------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

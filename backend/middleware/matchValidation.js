// Create a new file: backend/middleware/matchValidation.js

const MatchRequest = require('../models/MatchRequest');

// Middleware to check if two users have an accepted match
const validateAcceptedMatch = async (req, res, next) => {
  try {
    const { senderId, recipientId } = req.body;
    
    if (!senderId || !recipientId) {
      return res.status(400).json({ error: 'Sender and recipient IDs required' });
    }

    // Check if there's an accepted match between these users
    const acceptedMatch = await MatchRequest.findOne({
      $or: [
        { senderId: senderId, recipientId: recipientId, status: 'accepted' },
        { senderId: recipientId, recipientId: senderId, status: 'accepted' }
      ]
    });

    if (!acceptedMatch) {
      return res.status(403).json({ 
        error: 'You can only message users with accepted matches' 
      });
    }

    // Match exists, allow the request to proceed
    next();
  } catch (err) {
    console.error('Match validation error:', err);
    res.status(500).json({ error: 'Server error during validation' });
  }
};

module.exports = { validateAcceptedMatch };

// =============================================================
// Now update backend/routes/chat.js to use this middleware:
// =============================================================

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const MatchRequest = require('../models/MatchRequest');
const auth = require('../middleware/auth');
const { validateAcceptedMatch } = require('../middleware/matchValidation');

// POST send message - WITH VALIDATION
router.post('/send', auth, validateAcceptedMatch, async (req, res) => {
  try {
    const { senderId, recipientId, text } = req.body;
    
    const newMessage = new Message({
      senderId,
      recipientId,
      text,
      timestamp: new Date()
    });
    
    await newMessage.save();
    res.json({ message: 'Message sent successfully', data: newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET messages between two users - WITH VALIDATION
router.get('/messages/:userId/:recipientId', auth, async (req, res) => {
  try {
    const { userId, recipientId } = req.params;
    
    // Verify they have an accepted match
    const acceptedMatch = await MatchRequest.findOne({
      $or: [
        { senderId: userId, recipientId: recipientId, status: 'accepted' },
        { senderId: recipientId, recipientId: userId, status: 'accepted' }
      ]
    });

    if (!acceptedMatch) {
      return res.status(403).json({ 
        error: 'You can only view messages with accepted matches',
        messages: [] 
      });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: recipientId },
        { senderId: recipientId, recipientId: userId }
      ]
    }).sort({ timestamp: 1 });
    
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET conversations for a user - ONLY accepted matches
router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all accepted match requests where user is involved
    const acceptedMatches = await MatchRequest.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' }
      ]
    });

    if (acceptedMatches.length === 0) {
      return res.json({ conversations: [] });
    }

    // Extract partner IDs
    const partnerIds = acceptedMatches.map(match => 
      match.senderId.toString() === userId ? match.recipientId : match.senderId
    );

    // Get latest message with each partner
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select('firstName lastName email');
        
        if (!partner) return null;
        
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, recipientId: partnerId },
            { senderId: partnerId, recipientId: userId }
          ]
        }).sort({ timestamp: -1 });

        return {
          partnerId: partnerId.toString(),
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          lastMessage: lastMessage?.text || 'Start a conversation',
          timestamp: lastMessage?.timestamp || new Date(),
          senderId: lastMessage?.senderId.toString()
        };
      })
    );

    // Filter out null values and sort by most recent
    const validConversations = conversations
      .filter(c => c !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ conversations: validConversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// =============================================================
// Also update backend/server.js socket validation:
// =============================================================

// Inside your socket.io connection handler, add validation:

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('register', (userId) => {
    socket.userId = userId;
    console.log('User registered:', userId);
  });

  socket.on('privateMessage', async (data) => {
    try {
      const { senderId, recipientId, text, timestamp } = data;
      
      // VALIDATE: Check if users have accepted match
      const MatchRequest = require('./models/MatchRequest');
      const acceptedMatch = await MatchRequest.findOne({
        $or: [
          { senderId: senderId, recipientId: recipientId, status: 'accepted' },
          { senderId: recipientId, recipientId: senderId, status: 'accepted' }
        ]
      });

      if (!acceptedMatch) {
        socket.emit('messageError', { 
          error: 'You can only message users with accepted matches' 
        });
        return;
      }

      // Save message to database
      const Message = require('./models/Message');
      const newMessage = new Message({
        senderId,
        recipientId,
        text,
        timestamp: timestamp || new Date()
      });
      
      await newMessage.save();

      // Find recipient's socket and emit
      const recipientSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.userId === recipientId);
      
      if (recipientSocket) {
        recipientSocket.emit('receiveMessage', {
          senderId,
          text,
          timestamp: newMessage.timestamp,
          _id: newMessage._id
        });
      }
    } catch (error) {
      console.error('Error in privateMessage:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
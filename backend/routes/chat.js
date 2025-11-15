const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User"); // Import the User model
const auth = require("../middleware/authMiddleware");
const MatchRequest = require("../models/MatchRequest");

// Get messages between two users (no change to this route)
router.get("/messages/:userId1/:userId2", auth, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 }
      ]
    }).sort({ timestamp: 1 });
    
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// --- MODIFIED ROUTE ---
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

    // Extract partner IDs
    const partnerIds = acceptedMatches.map(match => 
      match.senderId.toString() === userId ? match.recipientId : match.senderId
    );

    // Get latest message with each partner
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select('firstName lastName email');
        
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, recipientId: partnerId },
            { senderId: partnerId, recipientId: userId }
          ]
        }).sort({ timestamp: -1 });

        // Count unread messages from this partner
        const unreadCount = await Message.countDocuments({
          senderId: partnerId,
          recipientId: userId,
          isRead: false
        });

        return {
          partnerId: partnerId.toString(),
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          lastMessage: lastMessage?.text || '',
          timestamp: lastMessage?.timestamp || new Date(),
          senderId: lastMessage?.senderId.toString(),
          unreadCount: unreadCount
        };
      })
    );

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;
    
    await Message.updateMany(
      {
        senderId: senderId,
        recipientId: recipientId,
        isRead: false
      },
      {
        isRead: true
      }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get total unread message count for a user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      isRead: false
    });
    
    res.json({ count: unreadCount });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;  
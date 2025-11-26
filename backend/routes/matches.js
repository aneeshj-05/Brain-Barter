const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MatchRequest = require('../models/MatchRequest');
const auth = require('../middleware/authMiddleware');

// GET potential matches based on skills
router.get('/potential', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all users
    const allUsers = await User.find({ _id: { $ne: req.user.id } });

    // Filter for potential matches
    const potentialMatches = allUsers.filter(user => {
      // Check if user has skills I want
      const hasSkillsIWant = user.skills.some(skill => 
        currentUser.skillsWanted.includes(skill)
      );
      
      // Check if I have skills they want
      const iHaveSkillsTheyWant = currentUser.skills.some(skill =>
        user.skillsWanted.includes(skill)
      );
      
      // Check if not already matched
      const alreadyMatched = currentUser.matches.some(
        match => match.userId === user._id.toString()
      );
      
      return hasSkillsIWant && iHaveSkillsTheyWant && !alreadyMatched;
    });

    // Transform to include matching skills
    const matchesWithSkills = potentialMatches.map(user => {
      const matchingSkillsTheyHave = user.skills.filter(skill =>
        currentUser.skillsWanted.includes(skill)
      );
      
      const matchingSkillsIHave = currentUser.skills.filter(skill =>
        user.skillsWanted.includes(skill)
      );

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        skills: user.skills,
        skillsWanted: user.skillsWanted,
        matchingSkillsTheyHave,
        matchingSkillsIHave,
        isReciprocalMatch: matchingSkillsTheyHave.length > 0 && matchingSkillsIHave.length > 0
      };
    });

    res.json({ potentialMatches: matchesWithSkills });
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ NEW ENDPOINT - GET accepted matches with full details
router.get('/accepted', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('matches.userId', 'firstName lastName email skills skillsWanted');
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get accepted match requests to get skill details
    const acceptedMatchRequests = await MatchRequest.find({
      $or: [
        { senderId: req.user.id, status: 'accepted' },
        { recipientId: req.user.id, status: 'accepted' }
      ]
    });

    // Build array of formatted matches from User.matches array with skill details from MatchRequest
    const formattedMatches = currentUser.matches.map(match => {
      const partner = match.userId;
      
      if (!partner) {
        return null; // Skip if partner not found
      }

      // Find corresponding match request for skill details
      const matchRequest = acceptedMatchRequests.find(req => 
        (req.senderId.toString() === currentUser._id.toString() && req.recipientId.toString() === partner._id.toString()) ||
        (req.recipientId.toString() === currentUser._id.toString() && req.senderId.toString() === partner._id.toString())
      );

      let skillOffered = 'Not specified';
      let skillRequested = 'Not specified';
      
      if (matchRequest) {
        if (matchRequest.senderId.toString() === currentUser._id.toString()) {
          skillOffered = matchRequest.skillOffered;
          skillRequested = matchRequest.skillRequested;
        } else {
          skillOffered = matchRequest.skillRequested;
          skillRequested = matchRequest.skillOffered;
        }
      }

      return {
        _id: match._id,
        partnerId: partner._id.toString(),
        firstName: partner.firstName,
        lastName: partner.lastName,
        email: partner.email,
        skillOffered,
        skillRequested,
        partnerSkills: partner.skills || [],
        partnerSkillsWanted: partner.skillsWanted || [],
        acceptedAt: match.acceptedAt
      };
    });

    // Filter out null values (in case some partners were deleted)
    const validMatches = formattedMatches.filter(match => match !== null);

    res.json({ matches: validMatches });
  } catch (error) {
    console.error('Error fetching accepted matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST send match request
router.post('/request', auth, async (req, res) => {
  try {
    const { recipientId, skillOffered, skillRequested, requestSource } = req.body;

    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = await MatchRequest.findOne({
      senderId: req.user.id,
      recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Match request already sent' });
    }

    const matchRequest = new MatchRequest({
      senderId: req.user.id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      recipientId,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      skillOffered,
      skillRequested,
      requestSource: requestSource || 'search',
      status: 'pending'
    });

    await matchRequest.save();
    res.json({ message: 'Match request sent!', matchRequest });
  } catch (error) {
    console.error('Error sending match request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET incoming match requests (for current user)
router.get('/requests/incoming', auth, async (req, res) => {
  try {
    const requests = await MatchRequest.find({
      recipientId: req.user.id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET outgoing match requests (sent by current user)
router.get('/requests/outgoing', auth, async (req, res) => {
  try {
    const requests = await MatchRequest.find({
      senderId: req.user.id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT accept match request
router.put('/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const matchRequest = await MatchRequest.findById(req.params.requestId);

    if (!matchRequest) {
      return res.status(404).json({ error: 'Match request not found' });
    }

    if (matchRequest.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    matchRequest.status = 'accepted';
    await matchRequest.save();

    // Add to both users' matches array with skill details
    await User.findByIdAndUpdate(matchRequest.senderId, {
      $push: { 
        matches: { 
          userId: matchRequest.recipientId,
          skillOffered: matchRequest.skillOffered,
          skillRequested: matchRequest.skillRequested,
          acceptedAt: new Date() 
        }
      }
    });

    await User.findByIdAndUpdate(matchRequest.recipientId, {
      $push: { 
        matches: { 
          userId: matchRequest.senderId,
          skillOffered: matchRequest.skillRequested, // Reverse for recipient
          skillRequested: matchRequest.skillOffered, // Reverse for recipient
          acceptedAt: new Date() 
        }
      }
    });

    // Notify both users via socket about the new connection
    const userSockets = req.userSockets;
    if (userSockets && req.io) {
      const senderSocketId = userSockets[String(matchRequest.senderId)];
      const recipientSocketId = userSockets[String(matchRequest.recipientId)];
      
      if (senderSocketId && req.io.sockets.sockets.get(senderSocketId)) {
        req.io.to(senderSocketId).emit('newConnection', {
          userId: matchRequest.recipientId,
          message: 'Your connection request was accepted!'
        });
      }
      
      if (recipientSocketId && req.io.sockets.sockets.get(recipientSocketId)) {
        req.io.to(recipientSocketId).emit('newConnection', {
          userId: matchRequest.senderId,
          message: 'New connection added!'
        });
      }
    }

    res.json({ message: 'Match accepted!', matchRequest });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT reject match request
router.put('/requests/:requestId/reject', auth, async (req, res) => {
  try {
    const matchRequest = await MatchRequest.findById(req.params.requestId);

    if (!matchRequest) {
      return res.status(404).json({ error: 'Match request not found' });
    }

    if (matchRequest.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    matchRequest.status = 'rejected';
    await matchRequest.save();

    res.json({ message: 'Match rejected', matchRequest });
  } catch (error) {
    console.error('Error rejecting match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE match
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    console.log('=== MATCH DELETION START ===');
    console.log('Deleting match between:', currentUserId, 'and', userId);
    
    // Validate input
    if (!userId || !currentUserId) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    // Convert to ObjectId for proper MongoDB operations
    const mongoose = require('mongoose');
    let currentUserObjectId, otherUserObjectId;
    
    try {
      currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
      otherUserObjectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      console.error('Invalid ObjectId:', err);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    console.log('ObjectIds:', {
      currentUser: currentUserObjectId.toString(),
      otherUser: otherUserObjectId.toString()
    });

    // Method 1: Direct array manipulation
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(userId);
    
    if (!currentUser || !otherUser) {
      console.error('User not found:', { currentUser: !!currentUser, otherUser: !!otherUser });
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Before deletion:');
    console.log('Current user matches:', currentUser.matches.map(m => m.userId.toString()));
    console.log('Other user matches:', otherUser.matches.map(m => m.userId.toString()));

    // Remove matches using array filter
    currentUser.matches = currentUser.matches.filter(match => {
      const matchUserId = match.userId.toString();
      const targetUserId = otherUserObjectId.toString();
      console.log('Comparing:', matchUserId, 'vs', targetUserId, '=', matchUserId !== targetUserId);
      return matchUserId !== targetUserId;
    });
    
    otherUser.matches = otherUser.matches.filter(match => {
      const matchUserId = match.userId.toString();
      const targetUserId = currentUserObjectId.toString();
      console.log('Comparing:', matchUserId, 'vs', targetUserId, '=', matchUserId !== targetUserId);
      return matchUserId !== targetUserId;
    });

    // Save both users
    await currentUser.save();
    await otherUser.save();

    console.log('After deletion:');
    console.log('Current user matches:', currentUser.matches.map(m => m.userId.toString()));
    console.log('Other user matches:', otherUser.matches.map(m => m.userId.toString()));

    // Update match request status to deleted
    await MatchRequest.updateMany(
      {
        $or: [
          { senderId: currentUserId, recipientId: userId },
          { senderId: userId, recipientId: currentUserId }
        ],
        status: 'accepted'
      },
      { status: 'deleted' }
    );

    // Notify the other user via socket
    const userSockets = req.userSockets;
    const otherUserSocketId = userSockets[String(userId)];
    if (otherUserSocketId && req.io.sockets.sockets.get(otherUserSocketId)) {
      req.io.to(otherUserSocketId).emit('matchDeleted', {
        deletedByUserId: currentUserId,
        message: 'A user has removed you from their matches'
      });
    }

    console.log('=== MATCH DELETION COMPLETE ===');
    
    res.json({ 
      message: 'Match deleted permanently',
      success: true
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
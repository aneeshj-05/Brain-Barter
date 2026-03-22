const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// In-memory storage for video sessions (you can replace with database)
let videoSessions = [];

// Create video session
router.post('/create', auth, async (req, res) => {
  try {
    const { teacherId, learnerId, skill } = req.body;
    
    const session = {
      _id: Date.now().toString(),
      teacherId,
      learnerId,
      skill,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      meetingLink: null,
      feedback: null
    };
    
    videoSessions.push(session);
    res.json({ session });
  } catch (error) {
    console.error('Error creating video session:', error);
    res.status(500).json({ error: 'Failed to create video session' });
  }
});

// Accept video session
router.post('/:sessionId/accept', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = videoSessions.find(s => s._id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: 'Session expired' });
    }
    
    session.status = 'accepted';
    session.meetingLink = `https://meet.jit.si/brainbarter-${sessionId}`;
    
    res.json({ session });
  } catch (error) {
    console.error('Error accepting video session:', error);
    res.status(500).json({ error: 'Failed to accept video session' });
  }
});

// Submit feedback and transfer credit to teacher
router.post('/:sessionId/feedback', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const feedbackData = req.body;
    const VideoSession = require('../models/VideoSession');
    const User = require('../models/User');
    
    const session = await VideoSession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.feedback && session.feedback.submittedAt) {
      return res.status(400).json({ error: 'Feedback already submitted' });
    }
    
    // Only learner can submit feedback
    if (req.user.id !== session.learnerId.toString()) {
      return res.status(403).json({ error: 'Only the learner can submit feedback' });
    }
    
    // Update session with feedback
    session.feedback = {
      ...feedbackData,
      submittedAt: new Date()
    };
    session.status = 'completed';
    await session.save();
    
    // Transfer 1 credit to teacher
    await User.findByIdAndUpdate(session.teacherId, { $inc: { credits: 1 } });
    
    res.json({ success: true, message: 'Feedback submitted and credit transferred to teacher!' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Deduct credit from learner when call starts/is accepted
router.post('/deduct-credit', auth, async (req, res) => {
  try {
    const { sessionId, teacherId, learnerId } = req.body;
    
    // Check if learner has enough credits
    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ error: 'Learner not found' });
    }
    
    if (learner.credits < 1) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    
    // Deduct 1 credit from learner
    await User.findByIdAndUpdate(learnerId, { $inc: { credits: -1 } });
    
    // Store session info for credit transfer later
    const session = {
      _id: sessionId,
      teacherId,
      learnerId,
      status: 'active',
      createdAt: new Date(),
      creditDeducted: true,
      feedback: null
    };
    
    videoSessions.push(session);
    
    res.json({ success: true, message: 'Credit deducted successfully' });
  } catch (error) {
    console.error('Error deducting credit:', error);
    res.status(500).json({ error: 'Failed to deduct credit' });
  }
});

// Get session details
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = videoSessions.find(s => s._id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if session is expired
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
    }
    
    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;
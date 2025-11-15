const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

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

// Submit feedback
router.post('/:sessionId/feedback', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const feedbackData = req.body;
    
    const session = videoSessions.find(s => s._id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: 'Feedback period expired' });
    }
    
    session.feedback = {
      ...feedbackData,
      submittedAt: new Date(),
      submittedBy: req.user.id
    };
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
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
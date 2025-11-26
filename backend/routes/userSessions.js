const express = require('express');
const router = express.Router();
const UserSession = require('../models/UserSession');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/user-sessions - Get user's sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await UserSession.find({ userId: req.user.id }).sort({ date: 1 });
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/user-sessions - Create new session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, skill, type } = req.body;
    
    // Parse date properly to avoid timezone issues
    const sessionDate = new Date(date + 'T00:00:00.000Z');
    
    const session = new UserSession({
      userId: req.user.id,
      title,
      description,
      date: sessionDate,
      startTime,
      endTime,
      skill,
      type
    });

    await session.save();
    res.json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PUT /api/user-sessions/:id - Update session
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, skill, type } = req.body;
    
    // Parse date properly to avoid timezone issues
    const sessionDate = new Date(date + 'T00:00:00.000Z');
    
    const session = await UserSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, date: sessionDate, startTime, endTime, skill, type },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/user-sessions/:id - Delete session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await UserSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
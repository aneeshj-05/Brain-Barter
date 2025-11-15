const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const User = require('../models/User');

// @route   POST api/sessions/propose
// @desc    Propose a new session
// @access  Private
router.post('/propose', auth, async (req, res) => {
  try {
    const { teacherId, skill } = req.body;
    const learnerId = req.user.id;
    // --- NEW --- Get io and sockets from middleware
    const { io, userSockets } = req; 

    // Check if user has enough credits
    const learner = await User.findById(learnerId);
    if (learner.credits < 1) {
      return res.status(400).json({ message: 'You do not have enough credits to propose a session.' });
    }

    // ... (existing check for session) ...
    const existingSession = await Session.findOne({
      learnerId,
      teacherId,
      skill,
      status: 'pending'
    });

    if (existingSession) {
      return res.status(400).json({ message: 'You have already proposed this session.' });
    }

    const newSession = new Session({
      learnerId,
      teacherId,
      skill
    });

    await newSession.save();
    
    // --- NEW --- Populate learner name for the notification
    const populatedSession = await Session.findById(newSession._id).populate('learnerId', 'firstName lastName');

    // --- NEW --- Emit real-time notification to the teacher
    const recipientSocketId = userSockets[teacherId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_session_proposal', populatedSession);
    }

    res.status(201).json({ message: 'Session proposed successfully!', session: populatedSession });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ---
// @route   GET api/sessions/incoming
// @desc    Get all pending session proposals for me (as a teacher)
// @access  Private
router.get('/incoming', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      teacherId: req.user.id,
      status: 'pending'
    })
    .populate('learnerId', 'firstName lastName') // Get learner's name
    .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ---
// @route   PUT api/sessions/:id/accept
// @desc    Accept a session proposal
// @access  Private
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const { io, userSockets } = req;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    // Ensure the current user is the intended teacher
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    session.status = 'accepted';
    await session.save();

    // Notify learner
    const recipientSocketId = userSockets[session.learnerId.toString()];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('session_update', { 
        message: `Your session for "${session.skill}" was accepted!` 
      });
    }

    res.json({ message: 'Session accepted!', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ---
// @route   PUT api/sessions/:id/reject
// @desc    Reject a session proposal
// @access  Private
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { io, userSockets } = req;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    session.status = 'rejected';
    await session.save();

    // Notify learner
    const recipientSocketId = userSockets[session.learnerId.toString()];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('session_update', { 
        message: `Your session for "${session.skill}" was rejected.` 
      });
    }

    res.json({ message: 'Session rejected.', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ---
// @route   GET api/sessions/with/:partnerId
// @desc    Get all sessions with a specific partner
// @access  Private
router.get('/with/:partnerId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.params.partnerId;

    const sessions = await Session.find({
      $or: [
        { learnerId: userId, teacherId: partnerId },
        { learnerId: partnerId, teacherId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10); // Get recent 10

    res.json({ sessions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ---
// @route   PUT api/sessions/:id/complete
// @desc    Mark a session as complete and leave feedback
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { io, userSockets } = req;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    if (session.status !== 'accepted') {
      return res.status(400).json({ message: 'Session must be accepted before completion.' });
    }

    let otherUserId;
    let reviewForUserId;

    // Check if user is the learner or teacher
    if (session.learnerId.toString() === userId) {
      if (session.learnerCompleted) {
        return res.status(400).json({ message: 'You have already completed this session.' });
      }
      session.learnerCompleted = true;
      reviewForUserId = session.teacherId;
      otherUserId = session.teacherId;

    } else if (session.teacherId.toString() === userId) {
      if (session.teacherCompleted) {
        return res.status(400).json({ message: 'You have already completed this session.' });
      }
      session.teacherCompleted = true;
      reviewForUserId = session.learnerId;
      otherUserId = session.learnerId;
    } else {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    // --- Create and save the review ---
    const review = {
      fromUserId: userId,
      sessionId: sessionId,
      rating: Number(rating),
      comment: comment
    };
    
    // Add review to the partner's User document
    const partner = await User.findByIdAndUpdate(
      reviewForUserId,
      { $push: { reviews: review } },
      { new: true } // Return the updated document
    );
    
    // --- Recalculate average rating for the partner ---
    if (partner.reviews.length > 0) {
      const totalRating = partner.reviews.reduce((acc, r) => acc + r.rating, 0);
      partner.rating = (totalRating / partner.reviews.length).toFixed(1);
    }
    await partner.save();


    // --- Check if BOTH parties have completed ---
    if (session.learnerCompleted && session.teacherCompleted) {
      session.status = 'completed';
      
      // --- This is it! The credit transfer logic ---
      await User.findByIdAndUpdate(session.learnerId, { $inc: { credits: -1 } });
      await User.findByIdAndUpdate(session.teacherId, { $inc: { credits: 1 } });
      
      // Notify both users
      const learnerSocket = userSockets[session.learnerId.toString()];
      const teacherSocket = userSockets[session.teacherId.toString()];
      
      const updateMsg = `Session for "${session.skill}" complete! 1 credit transferred.`;
      
      if (learnerSocket) io.to(learnerSocket).emit('session_update', { message: updateMsg });
      if (teacherSocket) io.to(teacherSocket).emit('session_update', { message: updateMsg });
    }

    await session.save();

    res.json({ message: 'Session marked as complete!', session });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
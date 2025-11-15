const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET api/user/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // --- MODIFIED ---
    const user = await User.findById(req.user.id)
      .select('-password_hash')
      .populate('reviews.fromUserId', 'firstName lastName');
      
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ADD THIS NEW ROUTE ---
// @route   GET api/user/:id
// @desc    Get public profile by ID (for skills)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password_hash')
      .populate('reviews.fromUserId', 'firstName lastName');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// --- END OF NEW ROUTE ---


// @route   GET api/user
// @desc    Get all users for chat list (excluding current user)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all users where the _id is "not equal" ($ne) to the logged-in user's id
    const users = await User.find({ _id: { $ne: req.user.id } })
    .select('firstName lastName email skills skillsWanted'); // Only send back needed info
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET matched users only (for chat)
router.get('/matched', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all matched user IDs
    const matchedUserIds = currentUser.matches.map(match => match.userId);

    // Fetch all matched users
    const matchedUsers = await User.find({
      _id: { $in: matchedUserIds }
    }).select('-password_hash');

    res.json(matchedUsers);
  } catch (error) {
    console.error('Error fetching matched users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT api/user/skills
// @desc    Update user's skills
// @access  Private
router.put('/skills', auth, async (req, res) => {
  try {
    const { skills, skillsWanted } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        skills: skills || [],
        skillsWanted: skillsWanted || []
      },
      { new: true }
    ).select('-password_hash');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search users with filter option
router.get('/search/:query/:filter?', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const filter = req.params.filter || 'all';
    const currentUserId = req.user.id;
    
    let searchCondition = { _id: { $ne: currentUserId } };
    
    switch (filter) {
      case 'name':
        searchCondition.$or = [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ];
        break;
      case 'email':
        searchCondition.email = { $regex: query, $options: 'i' };
        break;
      case 'skills':
        searchCondition.skills = { $in: [new RegExp(query, 'i')] };
        break;
      case 'skillsWanted':
        searchCondition.skillsWanted = { $in: [new RegExp(query, 'i')] };
        break;
      default: // 'all'
        searchCondition.$or = [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { skills: { $in: [new RegExp(query, 'i')] } },
          { skillsWanted: { $in: [new RegExp(query, 'i')] } }
        ];
    }
    
    const users = await User.find(searchCondition)
      .select('firstName lastName email skills skillsWanted matches credits rating createdAt')
      .limit(20);
    
    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
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
    
    // Limit reviews to latest 25
    if (user && user.reviews) {
      user.reviews = user.reviews.slice(-25);
    }
      
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get blocked users - MUST BE BEFORE /:id route
router.get('/blocked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      blockedUsers: user.blockedUsers || []
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ error: 'Server error' });
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

    // Calculate average rating and total ratings
    const totalRatings = user.reviews ? user.reviews.length : 0;
    const averageRating = totalRatings > 0 
      ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings 
      : 0;
    
    // Limit reviews to latest 25
    const limitedReviews = user.reviews ? user.reviews.slice(-25) : [];
    
    // Add calculated fields to response
    const userResponse = {
      ...user.toObject(),
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      reviews: limitedReviews
    };
    
    res.json(userResponse);
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

// @route   PUT api/user/profile
// @desc    Update user's profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, location, bio, designation } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        email,
        location,
        bio,
        designation
      },
      { new: true }
    ).select('-password_hash');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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

// Block user
router.post('/block', auth, async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    const userId = req.user.id;
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the match to be blocked
    const matchToBlock = currentUser.matches.find(match => 
      match.userId.toString() === blockedUserId
    );
    
    if (matchToBlock) {
      // Move match to blockedMatches instead of deleting
      await User.findByIdAndUpdate(userId, {
        $push: { 
          blockedMatches: {
            userId: matchToBlock.userId,
            skillOffered: matchToBlock.skillOffered,
            skillRequested: matchToBlock.skillRequested,
            acceptedAt: matchToBlock.acceptedAt,
            blockedAt: new Date()
          }
        },
        $pull: { matches: { userId: blockedUserId } }
      });
    }
    
    // Add to blocked users list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockedUserId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unblock user
router.post('/unblock', auth, async (req, res) => {
  try {
    const { unblockedUserId } = req.body;
    const userId = req.user.id;
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the blocked match to restore
    const blockedMatch = currentUser.blockedMatches.find(match => 
      match.userId.toString() === unblockedUserId
    );
    
    if (blockedMatch) {
      // Move match back to active matches
      await User.findByIdAndUpdate(userId, {
        $push: { 
          matches: {
            userId: blockedMatch.userId,
            skillOffered: blockedMatch.skillOffered,
            skillRequested: blockedMatch.skillRequested,
            acceptedAt: blockedMatch.acceptedAt
          }
        },
        $pull: { blockedMatches: { userId: unblockedUserId } }
      });
    }
    
    // Remove from blocked users list
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: unblockedUserId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
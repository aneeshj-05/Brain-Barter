const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session'); // --- NEW ---
const auth = require('../middleware/authMiddleware');

// @route   GET api/stats
// @desc    Get platform statistics
router.get('/', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // --- NEW --- Count completed sessions
    const totalExchanges = await Session.countDocuments({ status: 'completed' });

    // This calculates the total number of skills listed across all users
    const skillsResult = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills' } },
      { $count: 'uniqueSkills' }
    ]);

    const totalSkills = skillsResult.length > 0 ? skillsResult[0].uniqueSkills : 0;

    res.json({
      activeLearners: totalUsers,
      topicsAvailable: totalSkills,
      knowledgeShared: totalExchanges, // --- MODIFIED ---
      exchangesToday: 89, // Placeholder for now
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
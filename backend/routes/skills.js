const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/skills - Get all skills with user counts
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'skills');
    
    const skillCounts = {};
    
    users.forEach(user => {
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          if (skillName) {
            skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
          }
        });
      }
    });

    const skillsArray = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ skills: skillsArray });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/:skillName/users - Get users who have a specific skill
router.get('/:skillName/users', async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const users = await User.find(
      { skills: { $regex: skillName, $options: 'i' } },
      'firstName lastName email skills'
    ).limit(20);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users for skill:', error);
    res.status(500).json({ error: 'Failed to fetch users for skill' });
  }
});

module.exports = router;
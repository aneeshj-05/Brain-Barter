const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET /api/users/search
// @desc    Search users by query and filter
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, filter } = req.query;
    
    console.log('Search request - Query:', q, 'Filter:', filter);
    
    if (!q || q.trim().length === 0) {
      return res.json({ users: [] });
    }

    const searchQuery = q.trim();
    const searchFilter = filter || 'all';
    
    // Build query based on filter
    let query = {};
    
    // Exclude current user from results
    query._id = { $ne: req.user.id };

    // Build search conditions
    const searchConditions = [];

    if (searchFilter === 'name' || searchFilter === 'all') {
      // Split search query to handle "First Last" searches
      const nameParts = searchQuery.split(/\s+/).filter(Boolean);
      
      if (nameParts.length === 1) {
        // Single word - search in both firstName and lastName
        searchConditions.push(
          { firstName: { $regex: nameParts[0], $options: 'i' } },
          { lastName: { $regex: nameParts[0], $options: 'i' } }
        );
      } else {
        // Multiple words - assume "FirstName LastName" format
        searchConditions.push({
          $and: [
            { firstName: { $regex: nameParts[0], $options: 'i' } },
            { lastName: { $regex: nameParts.slice(1).join(' '), $options: 'i' } }
          ]
        });
        // Also try reverse (LastName FirstName)
        searchConditions.push({
          $and: [
            { firstName: { $regex: nameParts.slice(1).join(' '), $options: 'i' } },
            { lastName: { $regex: nameParts[0], $options: 'i' } }
          ]
        });
      }
    }

    if (searchFilter === 'email' || searchFilter === 'all') {
      searchConditions.push({ email: { $regex: searchQuery, $options: 'i' } });
    }

    if (searchFilter === 'skills' || searchFilter === 'all') {
      searchConditions.push({ skills: { $regex: searchQuery, $options: 'i' } });
    }

    if (searchFilter === 'skillsWanted' || searchFilter === 'all') {
      searchConditions.push({ skillsWanted: { $regex: searchQuery, $options: 'i' } });
    }

    // Add $or conditions if we have any
    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute search with proper field selection
    const users = await User.find(query)
      .select('firstName lastName email skills skillsWanted bio') // ✅ Include skills!
      .limit(50)
      .lean(); // Use lean() for better performance

    console.log(`Search for "${searchQuery}" returned ${users.length} users`);
    
    // Log first user for debugging
    if (users.length > 0) {
      console.log('First user sample:', {
        name: `${users[0].firstName} ${users[0].lastName}`,
        email: users[0].email,
        skills: users[0].skills,
        skillsWanted: users[0].skillsWanted
      });
    }
    
    res.json({ users });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

module.exports = router;
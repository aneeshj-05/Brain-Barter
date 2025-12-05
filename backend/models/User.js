const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
  },
  designation: {
    type: String,
    enum: ['Student', 'Lecturer', 'Professional', 'Freelancer', 'Others'],
    default: 'Student'
  },
  password_hash: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false
  },
  skills: {
    type: [String], 
    default: [],
  },
  skillsWanted: [{
    type: String
  }],
  // ✅ UPDATED: Now includes skill exchange details
  matches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skillOffered: {
      type: String,
      default: ''
    },
    skillRequested: {
      type: String,
      default: ''
    },
    acceptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  credits: {
    type: Number,
    default: 3, 
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedMatches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skillOffered: {
      type: String,
      default: ''
    },
    skillRequested: {
      type: String,
      default: ''
    },
    acceptedAt: {
      type: Date,
      default: Date.now
    },
    blockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['teaching', 'learning', 'meeting'],
    default: 'teaching'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSession', userSessionSchema);
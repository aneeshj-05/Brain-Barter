const mongoose = require('mongoose');

const VideoSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meetingLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  creditDeducted: {
    type: Boolean,
    default: false
  },
  feedback: {
    clarity: String,
    focus: String,
    pace: String,
    comfort: String,
    learning: String,
    rating: Number,
    submittedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VideoSession', VideoSessionSchema);
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  recipientId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'video'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fileUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    default: null
  },
  learnerId: {
    type: String,
    default: null
  },
  teacherId: {
    type: String,
    default: null
  },
  meetingLink: {
    type: String,
    default: null
  },
  feedbackSubmitted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', MessageSchema);

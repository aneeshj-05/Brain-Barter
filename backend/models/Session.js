const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'disputed'],
    default: 'pending'
  },
  // --- MODIFIED ---
  // Renamed for clarity
  learnerCompleted: {
    type: Boolean,
    default: false
  },
  teacherCompleted: {
    type: Boolean,
    default: false
  },
  // --- END MODIFIED ---
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);
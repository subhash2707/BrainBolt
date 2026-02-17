const mongoose = require('mongoose');

const userStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentDifficulty: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
  },
  streak: {
    type: Number,
    default: 0,
  },
  maxStreak: {
    type: Number,
    default: 0,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  lastQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  },
  lastAnswerAt: {
    type: Date,
  },
  stateVersion: {
    type: Number,
    default: 0,
  },
  sessionId: {
    type: String,
  },
  totalAnswered: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userStateSchema.index({ userId: 1 });
userStateSchema.index({ totalScore: -1 });
userStateSchema.index({ maxStreak: -1 });

userStateSchema.methods.calculateAccuracy = function() {
  if (this.totalAnswered === 0) return 0;
  return (this.correctAnswers / this.totalAnswered) * 100;
};

module.exports = mongoose.model('UserState', userStateSchema);

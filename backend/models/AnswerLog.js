const mongoose = require('mongoose');

const answerLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  correct: {
    type: Boolean,
    required: true,
  },
  scoreDelta: {
    type: Number,
    required: true,
  },
  streakAtAnswer: {
    type: Number,
    required: true,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
  answerIdempotencyKey: {
    type: String,
    required: true,
    unique: true,
  },
});

answerLogSchema.index({ userId: 1, answeredAt: -1 });
answerLogSchema.index({ answerIdempotencyKey: 1 });

module.exports = mongoose.model('AnswerLog', answerLogSchema);

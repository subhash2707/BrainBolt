const mongoose = require('mongoose');
const crypto = require('crypto');

const questionSchema = new mongoose.Schema({
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  prompt: {
    type: String,
    required: true,
  },
  choices: [{
    type: String,
    required: true,
  }],
  correctAnswerHash: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });

questionSchema.methods.checkAnswer = function(answer) {
  const answerHash = crypto.createHash('sha256').update(answer.toString()).digest('hex');
  return answerHash === this.correctAnswerHash;
};

questionSchema.statics.createWithAnswer = function(data, correctAnswer) {
  const correctAnswerHash = crypto.createHash('sha256').update(correctAnswer.toString()).digest('hex');
  return this.create({
    ...data,
    correctAnswerHash,
  });
};

module.exports = mongoose.model('Question', questionSchema);

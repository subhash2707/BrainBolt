const express = require('express');
const { getNextQuestion, submitAnswer, getMetrics } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { quizLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/next', protect, quizLimiter, getNextQuestion);
router.post('/answer', protect, quizLimiter, submitAnswer);
router.get('/metrics', protect, getMetrics);

module.exports = router;

const express = require('express');
const { getScoreLeaderboard, getStreakLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/score', protect, getScoreLeaderboard);
router.get('/streak', protect, getStreakLeaderboard);

module.exports = router;

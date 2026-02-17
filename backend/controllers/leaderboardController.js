const UserState = require('../models/UserState');
const User = require('../models/User');
const cacheService = require('../services/cacheService');

const getScoreLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const userId = req.user._id;

    let leaderboard = await cacheService.getLeaderboard('score');

    if (!leaderboard) {
      const topUsers = await UserState.find()
        .sort({ totalScore: -1 })
        .limit(limit)
        .populate('userId', 'username')
        .lean();

      leaderboard = topUsers.map((state, index) => ({
        rank: index + 1,
        userId: state.userId._id,
        username: state.userId.username,
        totalScore: state.totalScore,
        streak: state.streak,
        maxStreak: state.maxStreak,
      }));

      await cacheService.cacheLeaderboard('score', leaderboard);
    }

    const currentUserState = await UserState.findOne({ userId }).populate('userId', 'username');
    
    let currentUserRank = null;
    if (currentUserState) {
      const rank = await UserState.countDocuments({
        totalScore: { $gt: currentUserState.totalScore },
      }) + 1;

      currentUserRank = {
        rank,
        userId: currentUserState.userId._id,
        username: currentUserState.userId.username,
        totalScore: currentUserState.totalScore,
        streak: currentUserState.streak,
        maxStreak: currentUserState.maxStreak,
      };
    }

    res.json({
      leaderboard,
      currentUser: currentUserRank,
    });
  } catch (error) {
    console.error('Get score leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getStreakLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const userId = req.user._id;

    let leaderboard = await cacheService.getLeaderboard('streak');

    if (!leaderboard) {
      const topUsers = await UserState.find()
        .sort({ maxStreak: -1, totalScore: -1 })
        .limit(limit)
        .populate('userId', 'username')
        .lean();

      leaderboard = topUsers.map((state, index) => ({
        rank: index + 1,
        userId: state.userId._id,
        username: state.userId.username,
        maxStreak: state.maxStreak,
        currentStreak: state.streak,
        totalScore: state.totalScore,
      }));

      await cacheService.cacheLeaderboard('streak', leaderboard);
    }

    const currentUserState = await UserState.findOne({ userId }).populate('userId', 'username');
    
    let currentUserRank = null;
    if (currentUserState) {
      const rank = await UserState.countDocuments({
        $or: [
          { maxStreak: { $gt: currentUserState.maxStreak } },
          { 
            maxStreak: currentUserState.maxStreak,
            totalScore: { $gt: currentUserState.totalScore }
          }
        ]
      }) + 1;

      currentUserRank = {
        rank,
        userId: currentUserState.userId._id,
        username: currentUserState.userId.username,
        maxStreak: currentUserState.maxStreak,
        currentStreak: currentUserState.streak,
        totalScore: currentUserState.totalScore,
      };
    }

    res.json({
      leaderboard,
      currentUser: currentUserRank,
    });
  } catch (error) {
    console.error('Get streak leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getScoreLeaderboard, getStreakLeaderboard };

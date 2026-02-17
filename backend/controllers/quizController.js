const Question = require('../models/Question');
const UserState = require('../models/UserState');
const AnswerLog = require('../models/AnswerLog');
const adaptiveService = require('../services/adaptiveService');
const cacheService = require('../services/cacheService');
const crypto = require('crypto');

const getNextQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.query;

    let userState = await cacheService.getUserState(userId);
    
    if (!userState) {
      userState = await UserState.findOne({ userId });
      if (!userState) {
        userState = await UserState.create({
          userId,
          currentDifficulty: 3,
          streak: 0,
          maxStreak: 0,
          totalScore: 0,
        });
      }
      await cacheService.cacheUserState(userId, userState);
    }

    userState = adaptiveService.handleStreakDecay(userState);

    const difficultyRange = adaptiveService.getDifficultyRange(userState.currentDifficulty);
    
    let questions = await cacheService.getQuestionPool(userState.currentDifficulty);
    
    if (!questions || questions.length === 0) {
      questions = await Question.find({
        difficulty: {
          $gte: difficultyRange.min,
          $lte: difficultyRange.max,
        },
        _id: { $ne: userState.lastQuestionId },
      }).limit(20).lean();

      if (questions.length > 0) {
        await cacheService.cacheQuestionPool(userState.currentDifficulty, questions);
      }
    }

    if (questions.length === 0) {
      questions = await Question.find({
        _id: { $ne: userState.lastQuestionId },
      }).limit(20).lean();
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    const newSessionId = sessionId || crypto.randomUUID();

    await UserState.findOneAndUpdate(
      { userId },
      { 
        sessionId: newSessionId,
        lastQuestionId: question._id,
        updatedAt: Date.now(),
      }
    );

    await cacheService.invalidateUserState(userId);

    res.json({
      questionId: question._id,
      difficulty: question.difficulty,
      prompt: question.prompt,
      choices: question.choices,
      sessionId: newSessionId,
      stateVersion: userState.stateVersion,
      currentScore: userState.totalScore,
      currentStreak: userState.streak,
    });
  } catch (error) {
    console.error('Get next question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { questionId, answer, stateVersion, answerIdempotencyKey } = req.body;

    if (!questionId || answer === undefined || !answerIdempotencyKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingLog = await AnswerLog.findOne({ answerIdempotencyKey });
    if (existingLog) {
      const userState = await UserState.findOne({ userId });
      const leaderboards = await getLeaderboardRanks(userId);
      
      return res.json({
        correct: existingLog.correct,
        newDifficulty: userState.currentDifficulty,
        newStreak: userState.streak,
        scoreDelta: existingLog.scoreDelta,
        totalScore: userState.totalScore,
        stateVersion: userState.stateVersion,
        leaderboardRankScore: leaderboards.scoreRank,
        leaderboardRankStreak: leaderboards.streakRank,
        idempotent: true,
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const userState = await UserState.findOne({ userId });
    if (!userState) {
      return res.status(404).json({ error: 'User state not found' });
    }

    if (stateVersion !== undefined && userState.stateVersion !== stateVersion) {
      return res.status(409).json({ 
        error: 'State version mismatch. Please refresh.',
        currentStateVersion: userState.stateVersion,
      });
    }

    const correct = question.checkAnswer(answer);
    
    const recentLogs = await AnswerLog.find({ userId })
      .sort({ answeredAt: -1 })
      .limit(10)
      .lean();

    const recentPerformance = recentLogs.map(log => ({
      correct: log.correct,
      difficulty: log.difficulty,
    }));

    const scoreDelta = adaptiveService.calculateScoreDelta(
      question.difficulty,
      correct,
      userState.streak
    );

    const newStreak = adaptiveService.calculateNewStreak(userState.streak, correct);
    const newDifficulty = adaptiveService.adjustDifficulty(
      userState.currentDifficulty,
      correct,
      newStreak,
      recentPerformance
    );

    const newTotalScore = Math.max(0, userState.totalScore + scoreDelta);
    const newMaxStreak = Math.max(userState.maxStreak, newStreak);

    await AnswerLog.create({
      userId,
      questionId,
      difficulty: question.difficulty,
      answer,
      correct,
      scoreDelta,
      streakAtAnswer: userState.streak,
      answerIdempotencyKey,
    });

    const updatedState = await UserState.findOneAndUpdate(
      { userId },
      {
        currentDifficulty: newDifficulty,
        streak: newStreak,
        maxStreak: newMaxStreak,
        totalScore: newTotalScore,
        lastAnswerAt: Date.now(),
        $inc: { 
          stateVersion: 1,
          totalAnswered: 1,
          correctAnswers: correct ? 1 : 0,
        },
        updatedAt: Date.now(),
      },
      { new: true }
    );

    await cacheService.invalidateUserState(userId);
    await cacheService.invalidateLeaderboards();

    const leaderboards = await getLeaderboardRanks(userId);

    res.json({
      correct,
      newDifficulty,
      newStreak,
      scoreDelta,
      totalScore: updatedState.totalScore,
      stateVersion: updatedState.stateVersion,
      leaderboardRankScore: leaderboards.scoreRank,
      leaderboardRankStreak: leaderboards.streakRank,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const userState = await UserState.findOne({ userId });
    if (!userState) {
      return res.status(404).json({ error: 'User state not found' });
    }

    const answerLogs = await AnswerLog.find({ userId })
      .sort({ answeredAt: -1 })
      .limit(50)
      .lean();

    const performanceMetrics = adaptiveService.getPerformanceMetrics(answerLogs);

    res.json({
      currentDifficulty: userState.currentDifficulty,
      streak: userState.streak,
      maxStreak: userState.maxStreak,
      totalScore: userState.totalScore,
      accuracy: performanceMetrics.accuracy,
      difficultyHistogram: performanceMetrics.difficultyHistogram,
      recentPerformance: performanceMetrics.recentPerformance,
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

async function getLeaderboardRanks(userId) {
  try {
    const scoreRank = await UserState.countDocuments({
      totalScore: { $gt: (await UserState.findOne({ userId })).totalScore },
    }) + 1;

    const streakRank = await UserState.countDocuments({
      maxStreak: { $gt: (await UserState.findOne({ userId })).maxStreak },
    }) + 1;

    return { scoreRank, streakRank };
  } catch (error) {
    console.error('Get leaderboard ranks error:', error);
    return { scoreRank: null, streakRank: null };
  }
}

module.exports = { getNextQuestion, submitAnswer, getMetrics };

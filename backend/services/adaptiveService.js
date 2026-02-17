const DIFFICULTY_MIN = 1;
const DIFFICULTY_MAX = 10;
const STREAK_DECAY_HOURS = 24;

class AdaptiveService {
  calculateScoreDelta(difficulty, correct, streak) {
    const baseScore = difficulty * 10;
    
    if (!correct) {
      return -Math.floor(baseScore * 0.3);
    }
    
    const streakMultiplier = 1 + (streak * 0.1);
    const difficultyBonus = difficulty * 5;
    
    return Math.floor((baseScore + difficultyBonus) * streakMultiplier);
  }

  adjustDifficulty(currentDifficulty, correct, streak, recentPerformance = []) {
    let newDifficulty = currentDifficulty;

    if (correct) {
      if (streak >= 3) {
        newDifficulty += 2;
      } else if (streak >= 1) {
        newDifficulty += 1;
      }
    } else {
      if (streak === 0 && recentPerformance.length >= 3) {
        const recentCorrect = recentPerformance.slice(-3).filter(p => p.correct).length;
        if (recentCorrect === 0) {
          newDifficulty -= 2;
        } else {
          newDifficulty -= 1;
        }
      } else {
        newDifficulty -= 1;
      }
    }

    if (recentPerformance.length >= 5) {
      const last5 = recentPerformance.slice(-5);
      const accuracy = last5.filter(p => p.correct).length / last5.length;
      
      if (accuracy >= 0.8 && correct) {
        newDifficulty += 1;
      } else if (accuracy <= 0.4 && !correct) {
        newDifficulty -= 1;
      }
    }

    return Math.max(DIFFICULTY_MIN, Math.min(DIFFICULTY_MAX, newDifficulty));
  }

  shouldResetStreak(lastAnswerAt) {
    if (!lastAnswerAt) return false;
    
    const hoursSinceLastAnswer = (Date.now() - new Date(lastAnswerAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAnswer >= STREAK_DECAY_HOURS;
  }

  handleStreakDecay(userState) {
    if (this.shouldResetStreak(userState.lastAnswerAt)) {
      return {
        ...userState,
        streak: 0,
        currentDifficulty: Math.max(3, userState.currentDifficulty - 2),
      };
    }
    return userState;
  }

  calculateNewStreak(currentStreak, correct) {
    if (correct) {
      return currentStreak + 1;
    }
    return 0;
  }

  getDifficultyRange(targetDifficulty) {
    const range = 1;
    return {
      min: Math.max(DIFFICULTY_MIN, targetDifficulty - range),
      max: Math.min(DIFFICULTY_MAX, targetDifficulty + range),
    };
  }

  getPerformanceMetrics(answerLogs) {
    if (!answerLogs || answerLogs.length === 0) {
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        difficultyHistogram: {},
        recentPerformance: [],
      };
    }

    const totalAnswered = answerLogs.length;
    const correctAnswers = answerLogs.filter(log => log.correct).length;
    const accuracy = (correctAnswers / totalAnswered) * 100;

    const difficultyHistogram = answerLogs.reduce((acc, log) => {
      const diff = log.difficulty;
      if (!acc[diff]) {
        acc[diff] = { total: 0, correct: 0 };
      }
      acc[diff].total += 1;
      if (log.correct) {
        acc[diff].correct += 1;
      }
      return acc;
    }, {});

    const recentPerformance = answerLogs
      .slice(-10)
      .map(log => ({
        difficulty: log.difficulty,
        correct: log.correct,
        scoreDelta: log.scoreDelta,
        answeredAt: log.answeredAt,
      }));

    return {
      totalAnswered,
      correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      difficultyHistogram,
      recentPerformance,
    };
  }
}

module.exports = new AdaptiveService();

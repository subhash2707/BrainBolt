const { getRedisClient } = require('../config/redis');

const CACHE_TTL = {
  USER_STATE: 300,
  QUESTION_POOL: 3600,
  LEADERBOARD: 60,
};

class CacheService {
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  getUserStateKey(userId) {
    return `user_state:${userId}`;
  }

  getQuestionPoolKey(difficulty) {
    return `question_pool:${difficulty}`;
  }

  getLeaderboardKey(type) {
    return `leaderboard:${type}`;
  }

  async cacheUserState(userId, state) {
    const key = this.getUserStateKey(userId);
    return await this.set(key, state, CACHE_TTL.USER_STATE);
  }

  async getUserState(userId) {
    const key = this.getUserStateKey(userId);
    return await this.get(key);
  }

  async invalidateUserState(userId) {
    const key = this.getUserStateKey(userId);
    return await this.del(key);
  }

  async cacheQuestionPool(difficulty, questions) {
    const key = this.getQuestionPoolKey(difficulty);
    return await this.set(key, questions, CACHE_TTL.QUESTION_POOL);
  }

  async getQuestionPool(difficulty) {
    const key = this.getQuestionPoolKey(difficulty);
    return await this.get(key);
  }

  async cacheLeaderboard(type, data) {
    const key = this.getLeaderboardKey(type);
    return await this.set(key, data, CACHE_TTL.LEADERBOARD);
  }

  async getLeaderboard(type) {
    const key = this.getLeaderboardKey(type);
    return await this.get(key);
  }

  async invalidateLeaderboards() {
    await this.delPattern('leaderboard:*');
  }
}

module.exports = new CacheService();

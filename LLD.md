# Low-Level Design (LLD) - Adaptive Quiz Platform

## 1. System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   Express    │─────▶│   MongoDB   │
│   Frontend  │      │   Backend    │      │   Database  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │
                            ▼
                     ┌─────────────┐
                     │    Redis    │
                     │    Cache    │
                     └─────────────┘
```

## 2. Module Responsibilities

### 2.1 Controllers Layer

#### AuthController
**Responsibilities:**
- User registration with validation
- User authentication
- JWT token generation
- Profile retrieval

**Methods:**
- `register(req, res)`: Create new user account
- `login(req, res)`: Authenticate user and return JWT
- `getProfile(req, res)`: Fetch authenticated user profile

#### QuizController
**Responsibilities:**
- Fetch next adaptive question
- Process answer submissions
- Calculate score and difficulty adjustments
- Retrieve user metrics

**Methods:**
- `getNextQuestion(req, res)`: Get question based on current difficulty
- `submitAnswer(req, res)`: Process answer with idempotency
- `getMetrics(req, res)`: Return performance analytics

#### LeaderboardController
**Responsibilities:**
- Fetch and cache leaderboard data
- Calculate user rankings
- Return paginated results

**Methods:**
- `getScoreLeaderboard(req, res)`: Top users by score
- `getStreakLeaderboard(req, res)`: Top users by max streak

### 2.2 Services Layer

#### AdaptiveService
**Responsibilities:**
- Implement adaptive difficulty algorithm
- Calculate score deltas
- Manage streak logic
- Generate performance metrics

**Methods:**
```javascript
calculateScoreDelta(difficulty, correct, streak)
  Input: difficulty (1-10), correct (boolean), streak (number)
  Output: scoreDelta (number)
  
  Pseudocode:
    baseScore = difficulty * 10
    if not correct:
      return -floor(baseScore * 0.3)
    
    streakMultiplier = 1 + (streak * 0.1)
    difficultyBonus = difficulty * 5
    return floor((baseScore + difficultyBonus) * streakMultiplier)

adjustDifficulty(currentDifficulty, correct, streak, recentPerformance)
  Input: currentDifficulty (1-10), correct (boolean), streak (number), 
         recentPerformance (array)
  Output: newDifficulty (1-10)
  
  Pseudocode:
    newDifficulty = currentDifficulty
    
    if correct:
      if streak >= 3:
        newDifficulty += 2
      else if streak >= 1:
        newDifficulty += 1
    else:
      if streak == 0 and recentPerformance.length >= 3:
        recentCorrect = count correct in last 3
        if recentCorrect == 0:
          newDifficulty -= 2
        else:
          newDifficulty -= 1
      else:
        newDifficulty -= 1
    
    # Adaptive adjustment based on accuracy
    if recentPerformance.length >= 5:
      accuracy = correct count / 5
      if accuracy >= 0.8 and correct:
        newDifficulty += 1
      else if accuracy <= 0.4 and not correct:
        newDifficulty -= 1
    
    return clamp(newDifficulty, 1, 10)

shouldResetStreak(lastAnswerAt)
  Input: lastAnswerAt (Date)
  Output: boolean
  
  Pseudocode:
    if not lastAnswerAt:
      return false
    
    hoursSince = (now - lastAnswerAt) / (1000 * 60 * 60)
    return hoursSince >= 24
```

#### CacheService
**Responsibilities:**
- Redis operations abstraction
- Cache key management
- TTL policies
- Cache invalidation

**Methods:**
```javascript
get(key)
set(key, value, ttl)
del(key)
delPattern(pattern)

cacheUserState(userId, state)
getUserState(userId)
invalidateUserState(userId)

cacheQuestionPool(difficulty, questions)
getQuestionPool(difficulty)

cacheLeaderboard(type, data)
getLeaderboard(type)
invalidateLeaderboards()
```

## 3. API Schemas

### 3.1 Authentication APIs

#### POST /api/v1/auth/register
**Request:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (201):**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "token": "string (JWT)"
}
```

#### POST /api/v1/auth/login
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "token": "string (JWT)"
}
```

### 3.2 Quiz APIs

#### GET /api/v1/quiz/next
**Query Parameters:**
- `sessionId` (optional): string

**Response (200):**
```json
{
  "questionId": "string",
  "difficulty": "number (1-10)",
  "prompt": "string",
  "choices": ["string"],
  "sessionId": "string (UUID)",
  "stateVersion": "number",
  "currentScore": "number",
  "currentStreak": "number"
}
```

#### POST /api/v1/quiz/answer
**Request:**
```json
{
  "questionId": "string",
  "answer": "string",
  "stateVersion": "number",
  "answerIdempotencyKey": "string (unique)"
}
```

**Response (200):**
```json
{
  "correct": "boolean",
  "newDifficulty": "number (1-10)",
  "newStreak": "number",
  "scoreDelta": "number",
  "totalScore": "number",
  "stateVersion": "number",
  "leaderboardRankScore": "number",
  "leaderboardRankStreak": "number",
  "idempotent": "boolean (optional)"
}
```

#### GET /api/v1/quiz/metrics
**Response (200):**
```json
{
  "currentDifficulty": "number",
  "streak": "number",
  "maxStreak": "number",
  "totalScore": "number",
  "accuracy": "number (percentage)",
  "difficultyHistogram": {
    "1": { "total": "number", "correct": "number" },
    "2": { "total": "number", "correct": "number" }
  },
  "recentPerformance": [
    {
      "difficulty": "number",
      "correct": "boolean",
      "scoreDelta": "number",
      "answeredAt": "date"
    }
  ]
}
```

### 3.3 Leaderboard APIs

#### GET /api/v1/leaderboard/score
**Query Parameters:**
- `limit` (optional): number (default: 50)

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": "number",
      "userId": "string",
      "username": "string",
      "totalScore": "number",
      "streak": "number",
      "maxStreak": "number"
    }
  ],
  "currentUser": {
    "rank": "number",
    "userId": "string",
    "username": "string",
    "totalScore": "number",
    "streak": "number",
    "maxStreak": "number"
  }
}
```

## 4. Database Schema

### 4.1 Collections

#### users
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  createdAt: Date (default: now)
}

Indexes:
  - { username: 1 } unique
  - { email: 1 } unique
```

#### questions
```javascript
{
  _id: ObjectId,
  difficulty: Number (1-10, indexed),
  prompt: String,
  choices: [String],
  correctAnswerHash: String (SHA-256),
  tags: [String] (indexed),
  createdAt: Date
}

Indexes:
  - { difficulty: 1 }
  - { tags: 1 }
```

#### user_states
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, unique, indexed),
  currentDifficulty: Number (1-10, default: 3),
  streak: Number (default: 0),
  maxStreak: Number (default: 0, indexed desc),
  totalScore: Number (default: 0, indexed desc),
  lastQuestionId: ObjectId (ref: questions),
  lastAnswerAt: Date,
  stateVersion: Number (default: 0),
  sessionId: String,
  totalAnswered: Number (default: 0),
  correctAnswers: Number (default: 0),
  updatedAt: Date
}

Indexes:
  - { userId: 1 } unique
  - { totalScore: -1 }
  - { maxStreak: -1 }
```

#### answer_logs
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  questionId: ObjectId (ref: questions),
  difficulty: Number,
  answer: String,
  correct: Boolean,
  scoreDelta: Number,
  streakAtAnswer: Number,
  answeredAt: Date (default: now),
  answerIdempotencyKey: String (unique, indexed)
}

Indexes:
  - { userId: 1, answeredAt: -1 }
  - { answerIdempotencyKey: 1 } unique
```

## 5. Cache Strategy

### 5.1 Cache Keys

| Key Pattern | Example | TTL | Purpose |
|------------|---------|-----|---------|
| `user_state:{userId}` | `user_state:507f1f77bcf86cd799439011` | 300s | User game state |
| `question_pool:{difficulty}` | `question_pool:5` | 3600s | Questions by difficulty |
| `leaderboard:score` | `leaderboard:score` | 60s | Score leaderboard |
| `leaderboard:streak` | `leaderboard:streak` | 60s | Streak leaderboard |

### 5.2 Cache Invalidation

**User State:**
- Invalidate on: Answer submission
- Strategy: Delete key, next request fetches from DB

**Question Pools:**
- Invalidate on: Question addition/update (manual)
- Strategy: Time-based expiry (1 hour)

**Leaderboards:**
- Invalidate on: Any score/streak change
- Strategy: Delete all leaderboard keys
- Fallback: Time-based expiry (1 minute)

### 5.3 Cache Miss Handling

```javascript
async function getUserState(userId) {
  // Try cache first
  let state = await cache.get(`user_state:${userId}`)
  
  if (!state) {
    // Cache miss - fetch from DB
    state = await UserState.findOne({ userId })
    
    // Cache for next time
    if (state) {
      await cache.set(`user_state:${userId}`, state, 300)
    }
  }
  
  return state
}
```

## 6. Edge Cases & Handling

### 6.1 Idempotency
**Problem:** User submits same answer multiple times

**Solution:**
```javascript
// Check for existing answer log
const existingLog = await AnswerLog.findOne({ answerIdempotencyKey })

if (existingLog) {
  // Return cached result without updating state
  return {
    ...cachedResult,
    idempotent: true
  }
}

// Process new answer...
```

### 6.2 Streak Decay
**Problem:** User inactive for 24+ hours

**Solution:**
```javascript
function handleStreakDecay(userState) {
  const hoursSince = (now - userState.lastAnswerAt) / (1000 * 60 * 60)
  
  if (hoursSince >= 24) {
    return {
      ...userState,
      streak: 0,
      currentDifficulty: max(3, userState.currentDifficulty - 2)
    }
  }
  
  return userState
}
```

### 6.3 State Version Mismatch
**Problem:** Concurrent requests cause race conditions

**Solution:**
```javascript
// Client sends stateVersion with request
if (stateVersion !== userState.stateVersion) {
  return res.status(409).json({
    error: 'State version mismatch. Please refresh.',
    currentStateVersion: userState.stateVersion
  })
}

// Increment version on update
await UserState.updateOne(
  { userId },
  { $inc: { stateVersion: 1 }, ...updates }
)
```

### 6.4 Difficulty Ping-Pong
**Problem:** Difficulty oscillates rapidly

**Solution:**
- Use recent performance (last 5-10 answers) for smoothing
- Require multiple consecutive failures before large drops
- Cap difficulty changes to ±2 per answer

### 6.5 Question Pool Exhaustion
**Problem:** No questions at target difficulty

**Solution:**
```javascript
// Try difficulty range first
let questions = await Question.find({
  difficulty: { $gte: min, $lte: max }
})

// Fallback to any question
if (questions.length === 0) {
  questions = await Question.find({})
}
```

### 6.6 Negative Scores
**Problem:** Wrong answers could make score negative

**Solution:**
```javascript
const newTotalScore = Math.max(0, userState.totalScore + scoreDelta)
```

## 7. Performance Optimizations

### 7.1 Database Queries
- Use indexes on frequently queried fields
- Limit result sets (pagination)
- Use lean() for read-only queries
- Project only needed fields

### 7.2 Caching
- Cache hot data (user state, leaderboards)
- Use appropriate TTLs
- Invalidate strategically
- Monitor cache hit rates

### 7.3 API
- Rate limiting prevents abuse
- Stateless servers enable horizontal scaling
- Connection pooling for DB and Redis

## 8. Security Considerations

### 8.1 Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Tokens stored in localStorage (client)
- Authorization middleware on protected routes

### 8.2 Answer Validation
- Correct answers stored as SHA-256 hash
- Never expose correct answer to client
- Server-side validation only

### 8.3 Rate Limiting
- General API: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Quiz endpoints: 30 requests / 1 minute

## 9. Monitoring & Observability

### Key Metrics to Track
- API response times
- Cache hit/miss rates
- Database query performance
- Error rates by endpoint
- Active user count
- Questions answered per minute
- Average difficulty progression

### Logging Strategy
- Error logs: All exceptions
- Info logs: User actions (register, login, answer)
- Debug logs: Cache operations, difficulty adjustments

## 10. Scalability Considerations

### Horizontal Scaling
- Stateless backend servers
- Session data in Redis (shared)
- Load balancer distributes requests

### Database Scaling
- Read replicas for leaderboards
- Sharding by userId for large scale
- Archive old answer logs

### Cache Scaling
- Redis Cluster for high availability
- Separate cache instances per service

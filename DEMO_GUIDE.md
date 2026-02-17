# Demo Guide - Adaptive Quiz Platform

## Quick Start Demo

### 1. Start the Application

```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
docker-compose up --build
```

Wait for all services to start, then seed the database:
```bash
docker-compose exec backend npm run seed
```

### 2. Open the Application

Navigate to: **http://localhost:3000**

## Demo Walkthrough

### Step 1: User Registration (2 minutes)

1. Click "Register here" on the login page
2. Create an account:
   - Username: `demo_user`
   - Email: `demo@example.com`
   - Password: `password123`
3. You'll be automatically logged in and redirected to the dashboard

**What to show:**
- Clean, modern UI with dark mode toggle
- Smooth animations and transitions
- Form validation

### Step 2: Dashboard Overview (2 minutes)

**Key Features to Highlight:**
- **Stats Cards**: Current difficulty, streak, max streak, total score
- **Performance Overview**: Accuracy percentage with visual progress bar
- **Recent Performance**: Visual bar chart of last 10 answers (green = correct, red = wrong)
- **Difficulty Distribution**: Breakdown of performance by difficulty level
- **Responsive Design**: Resize browser to show mobile layout

### Step 3: Take the Quiz (5 minutes)

1. Click "Start Quiz" button
2. Answer the first question (Difficulty 3 - starting level)

**Demonstrate Adaptive Algorithm:**

**Scenario A - Success Path:**
- Answer 3 questions correctly in a row
- Show how difficulty increases: 3 → 4 → 5 → 7
- Show streak building: 0 → 1 → 2 → 3
- Show score increasing with multipliers

**Scenario B - Mixed Performance:**
- Answer one wrong
- Show streak reset to 0
- Show difficulty decrease
- Show negative score delta
- Answer correctly again
- Show difficulty adjustment based on recent performance

**What to highlight:**
- Real-time updates after each answer
- Immediate feedback (green for correct, red for wrong)
- Score delta calculation
- Difficulty adjustment logic
- Streak mechanics
- Current rank display in header

### Step 4: Leaderboard (2 minutes)

1. Navigate to Leaderboard tab
2. Switch between "Top Scores" and "Top Streaks"

**What to show:**
- Your current rank highlighted at top
- Top players listed with ranks
- Medal icons for top 3 (gold, silver, bronze crown)
- Real-time updates (refresh after answering more questions)
- Responsive design

### Step 5: Profile Page (2 minutes)

**Key Features:**
- User avatar with initial
- Account information
- Detailed statistics:
  - Total Score
  - Current Difficulty with progress bar
  - Current & Max Streak
  - Total Answered
  - Correct Answers
  - Accuracy percentage
- Achievement badges (unlock by meeting criteria)

### Step 6: Advanced Features Demo (3 minutes)

#### A. Dark Mode
- Toggle theme using moon/sun icon in navbar
- Show smooth transition
- All components adapt to theme

#### B. Idempotency Test
1. Open browser DevTools → Network tab
2. Submit an answer
3. Note the `answerIdempotencyKey` in request
4. Try to replay the request (using curl or Postman)
5. Show that duplicate submission returns cached result without updating score

```bash
# Example idempotency test
curl -X POST http://localhost:5000/api/v1/quiz/answer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "QUESTION_ID",
    "answer": "ANSWER",
    "stateVersion": 1,
    "answerIdempotencyKey": "same-key-as-before"
  }'
```

#### C. Streak Decay (Optional - requires time manipulation)
1. Show `lastAnswerAt` in database
2. Explain 24-hour decay logic
3. Can demonstrate by manually updating timestamp in MongoDB

#### D. Performance Metrics
1. Answer 10+ questions
2. Go to Dashboard
3. Show difficulty histogram
4. Show recent performance visualization
5. Show accuracy calculation

### Step 7: Technical Deep Dive (5 minutes)

#### Backend Architecture
```bash
# Show logs
docker-compose logs backend

# Show Redis cache
docker-compose exec redis redis-cli
> KEYS *
> GET user_state:USER_ID
```

#### Database Inspection
```bash
# Connect to MongoDB
docker-compose exec mongo mongosh adaptive-quiz

# Show collections
> show collections

# View user state
> db.user_states.find().pretty()

# View answer logs
> db.answer_logs.find().limit(5).pretty()

# View leaderboard data
> db.user_states.find().sort({totalScore: -1}).limit(10)
```

#### Code Walkthrough
Show key files:
1. **Adaptive Algorithm**: `backend/services/adaptiveService.js`
2. **Cache Strategy**: `backend/services/cacheService.js`
3. **Component Library**: `frontend/src/components/ui/`
4. **Design System**: `frontend/tailwind.config.js`

## Key Talking Points

### 1. Adaptive Difficulty Algorithm
- **Dynamic Adjustment**: Questions get harder with success, easier with failure
- **Streak Bonus**: Consecutive correct answers increase difficulty faster
- **Performance Smoothing**: Uses last 5-10 answers to prevent ping-ponging
- **Bounded Range**: Difficulty stays between 1-10

### 2. Real-time Features
- **Instant Updates**: Score, streak, difficulty update immediately
- **Leaderboard Refresh**: Rankings update after each answer
- **State Versioning**: Prevents race conditions
- **Cache Invalidation**: Strategic cache clearing ensures consistency

### 3. Edge Case Handling
- **Idempotency**: Duplicate submissions handled gracefully
- **Streak Decay**: Automatic reset after 24 hours
- **State Conflicts**: Version checking prevents concurrent update issues
- **Negative Scores**: Prevented with Math.max(0, score)
- **Question Exhaustion**: Fallback to any available question

### 4. Frontend Excellence
- **Component Library**: Reusable Button, Card, Input, Badge, Progress
- **Design System**: Consistent colors, spacing, typography via tokens
- **Responsive**: Mobile-first design with breakpoints
- **Dark Mode**: Full theme support with smooth transitions
- **Animations**: Fade-in, slide-up, scale-in effects
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

### 5. Performance Optimizations
- **Redis Caching**: 
  - User state (5 min TTL)
  - Question pools (1 hour TTL)
  - Leaderboards (1 min TTL)
- **Database Indexes**: On userId, totalScore, maxStreak, difficulty
- **Rate Limiting**: Prevents abuse
- **Connection Pooling**: Efficient resource usage

### 6. Security
- **Password Hashing**: bcrypt with 10 rounds
- **JWT Authentication**: Stateless, secure tokens
- **Answer Hashing**: Correct answers stored as SHA-256
- **Rate Limiting**: Different limits for auth vs quiz endpoints
- **Input Validation**: Server-side validation on all inputs

## Common Questions & Answers

**Q: How does the adaptive algorithm work?**
A: It adjusts difficulty based on correctness, current streak, and recent performance (last 5-10 answers). Correct answers increase difficulty, wrong answers decrease it, with streak providing acceleration.

**Q: What happens if I don't play for a day?**
A: After 24 hours of inactivity, your streak resets to 0 and difficulty drops by 2 levels (minimum 3).

**Q: How is the score calculated?**
A: Base score = difficulty × 10, with bonuses for difficulty and streak multiplier. Wrong answers give negative points (30% of base).

**Q: How do you prevent cheating?**
A: Correct answers are hashed (SHA-256), validation is server-side only, rate limiting prevents spam, and idempotency keys prevent duplicate submissions.

**Q: Can this scale?**
A: Yes! Stateless backend servers, Redis for shared state, MongoDB with indexes, horizontal scaling ready, Docker containerized.

**Q: What about real-time updates?**
A: Currently REST API with immediate response. Could add WebSockets for live leaderboard updates in future.

## Performance Benchmarks

Expected response times:
- GET /quiz/next: ~50-100ms (cached) / ~200-300ms (uncached)
- POST /quiz/answer: ~100-200ms
- GET /leaderboard: ~30-50ms (cached) / ~150-250ms (uncached)
- GET /metrics: ~100-150ms

## Troubleshooting

### Services won't start
```bash
docker-compose down
docker-compose up --build
```

### Database not seeded
```bash
docker-compose exec backend npm run seed
```

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:5000/health`
- Check CORS settings in backend
- Verify proxy in vite.config.js

### Redis connection issues
```bash
docker-compose restart redis
docker-compose logs redis
```

## Next Steps / Future Enhancements

1. **WebSocket Integration**: Real-time leaderboard updates
2. **Question Categories**: Filter by topic/tag
3. **Timed Challenges**: Speed-based scoring
4. **Multiplayer Mode**: Head-to-head competitions
5. **Analytics Dashboard**: Admin panel with charts
6. **Social Features**: Friend challenges, sharing
7. **Mobile App**: React Native version
8. **AI-Generated Questions**: Dynamic question creation
9. **Achievements System**: More badges and rewards
10. **Study Mode**: Review wrong answers

## Conclusion

This platform demonstrates:
✅ Full-stack development (React + Node.js + MongoDB + Redis)
✅ Complex algorithm implementation (adaptive difficulty)
✅ Real-time features with caching
✅ Production-ready architecture
✅ Clean code and documentation
✅ Docker containerization
✅ Comprehensive edge case handling
✅ Modern UI/UX with design system

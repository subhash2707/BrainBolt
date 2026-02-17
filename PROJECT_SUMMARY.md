# Project Summary - Adaptive Quiz Platform

## 📌 Overview

**Adaptive Quiz Platform** is a full-stack intelligent quiz application that dynamically adjusts question difficulty based on user performance. Built with modern web technologies, it features real-time scoring, competitive leaderboards, and comprehensive performance analytics.

**Project Type:** Educational/Assessment Platform  
**Architecture:** Full-stack web application with containerized deployment  
**Status:** Production-ready with Docker deployment

---

## 🎯 Core Purpose

The platform provides an engaging quiz experience where:
- Questions adapt in real-time to user skill level
- Users compete on global leaderboards
- Performance is tracked with detailed analytics
- Streak mechanics encourage consistent engagement
- Idempotent operations ensure data integrity

---

## 🏗️ System Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   Vite + Tailwind│
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│ Express Backend │ (Port 5000)
│   Node.js API   │
└────┬───────┬────┘
     │       │
     │       └──────────┐
     ▼                  ▼
┌──────────┐      ┌──────────┐
│ MongoDB  │      │  Redis   │
│ Database │      │  Cache   │
└──────────┘      └──────────┘
```

### Technology Stack

#### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB (primary data store)
- **Cache:** Redis (performance optimization)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing
- **Rate Limiting:** express-rate-limit

#### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS (utility-first)
- **Icons:** Lucide React
- **Features:** Dark mode, responsive design

#### DevOps
- **Containerization:** Docker + Docker Compose
- **Services:** 4 containers (frontend, backend, MongoDB, Redis)

---

## 📂 Project Structure

```
/Users/sshivam/projects/Scaler/
│
├── backend/                      # Node.js API Server
│   ├── config/                   # Database & Redis configuration
│   ├── controllers/              # Request handlers (Auth, Quiz, Leaderboard)
│   ├── middleware/               # Auth & rate limiting middleware
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js              # User authentication model
│   │   ├── Question.js          # Quiz questions model
│   │   ├── UserState.js         # Game state & progress
│   │   └── AnswerLog.js         # Answer history & idempotency
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic
│   │   ├── adaptiveService.js   # Difficulty algorithm
│   │   └── cacheService.js      # Redis caching layer
│   ├── scripts/                  # Utility scripts
│   │   └── seedData.js          # Database seeding
│   ├── server.js                # Application entry point
│   ├── package.json             # Dependencies
│   └── Dockerfile               # Container definition
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Design system (Button, Card, Input, etc.)
│   │   │   ├── layout/          # Layout components (Navbar, etc.)
│   │   │   └── auth/            # Authentication components
│   │   ├── contexts/            # React Context providers
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   └── ThemeContext.jsx# Dark/light theme
│   │   ├── pages/               # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── vite.config.js           # Vite build config
│   ├── package.json             # Dependencies
│   └── Dockerfile               # Container definition
│
├── docker-compose.yml            # Multi-container orchestration
├── start.sh                      # Quick start script
├── setup-local.sh                # Local development setup
│
├── README.md                     # Main documentation
├── LLD.md                        # Low-level design document
├── DEMO_GUIDE.md                 # Demo walkthrough guide
└── PROJECT_SUMMARY.md            # This file
```

---

## 🧠 Core Features

### 1. Adaptive Difficulty Algorithm
**How it works:**
- Questions dynamically adjust from difficulty 1-10
- **Correct answers:** Difficulty increases (+1 or +2 based on streak)
- **Wrong answers:** Difficulty decreases (-1 or -2 based on recent performance)
- **Smoothing:** Uses last 5-10 answers to prevent oscillation
- **Starting point:** New users begin at difficulty level 3

**Score Calculation:**
```javascript
baseScore = difficulty × 10
streakMultiplier = 1 + (streak × 0.1)
difficultyBonus = difficulty × 5
finalScore = (baseScore + difficultyBonus) × streakMultiplier
```

### 2. Streak System
- Increments on each correct answer
- Resets to 0 on wrong answers
- **Decay mechanism:** Automatically resets after 24 hours of inactivity
- Max streak tracked separately for achievements

### 3. Dual Leaderboards
- **Score Leaderboard:** Ranked by total points earned
- **Streak Leaderboard:** Ranked by maximum consecutive correct answers
- Real-time updates after each answer
- Current user rank highlighted

### 4. Performance Analytics
- **Accuracy tracking:** Percentage of correct answers
- **Difficulty distribution:** Performance breakdown by difficulty level
- **Recent performance:** Visual chart of last 10 answers
- **Metrics dashboard:** Comprehensive statistics view

### 5. Idempotent Operations
- Prevents duplicate score updates from repeated submissions
- Uses unique `answerIdempotencyKey` for each answer
- Returns cached results for duplicate requests
- Ensures data consistency

---

## 🗄️ Database Schema

### Collections

#### 1. users
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

#### 2. questions
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
```

#### 3. user_states
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, unique),
  currentDifficulty: Number (1-10, default: 3),
  streak: Number (default: 0),
  maxStreak: Number (default: 0, indexed desc),
  totalScore: Number (default: 0, indexed desc),
  lastQuestionId: ObjectId,
  lastAnswerAt: Date,
  stateVersion: Number (default: 0),
  totalAnswered: Number,
  correctAnswers: Number,
  updatedAt: Date
}
```

#### 4. answer_logs
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  questionId: ObjectId,
  difficulty: Number,
  answer: String,
  correct: Boolean,
  scoreDelta: Number,
  streakAtAnswer: Number,
  answeredAt: Date,
  answerIdempotencyKey: String (unique, indexed)
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Authenticate and get JWT token
- `GET /api/v1/auth/profile` - Get current user profile (protected)

### Quiz
- `GET /api/v1/quiz/next` - Fetch next adaptive question (protected)
- `POST /api/v1/quiz/answer` - Submit answer with idempotency (protected)
- `GET /api/v1/quiz/metrics` - Get performance analytics (protected)

### Leaderboard
- `GET /api/v1/leaderboard/score` - Get top scores (protected)
- `GET /api/v1/leaderboard/streak` - Get top streaks (protected)

---

## ⚡ Performance & Caching

### Redis Cache Strategy

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `user_state:{userId}` | 300s (5 min) | User game state |
| `question_pool:{difficulty}` | 3600s (1 hour) | Questions by difficulty |
| `leaderboard:score` | 60s (1 min) | Score rankings |
| `leaderboard:streak` | 60s (1 min) | Streak rankings |

### Cache Invalidation
- **User state:** Cleared on answer submission
- **Leaderboards:** Cleared on any score/streak change
- **Question pools:** Time-based expiry

### Database Indexes
- `users`: username, email (unique)
- `questions`: difficulty, tags
- `user_states`: userId (unique), totalScore (desc), maxStreak (desc)
- `answer_logs`: userId + answeredAt, answerIdempotencyKey (unique)

---

## 🔒 Security Features

1. **Password Security:** bcrypt hashing with 10 rounds
2. **Authentication:** JWT tokens with 7-day expiration
3. **Answer Protection:** Correct answers stored as SHA-256 hashes
4. **Rate Limiting:**
   - General API: 100 requests / 15 minutes
   - Auth endpoints: 5 requests / 15 minutes
   - Quiz endpoints: 30 requests / 1 minute
5. **CORS:** Enabled for cross-origin requests
6. **Environment Variables:** Sensitive config externalized

---

## 🎨 Frontend Design System

### Component Library
- **Button:** Primary, secondary, outline, ghost variants
- **Card:** Composable with Header, Body, Footer
- **Input:** Form inputs with labels and error states
- **Badge:** Status indicators with color variants
- **Progress:** Progress bars with percentage labels

### Color Tokens
- **Primary:** Blue shades (actions, links)
- **Secondary:** Purple shades (accents)
- **Success:** Green shades (correct answers)
- **Error:** Red shades (wrong answers)
- **Warning:** Yellow/Orange shades (streaks, alerts)

### Features
- **Dark Mode:** Full theme support with smooth transitions
- **Responsive:** Mobile-first design (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Animations:** Fade-in, slide-up, scale-in effects
- **Accessibility:** Semantic HTML, ARIA labels

---

## 🚀 Deployment & Setup

### Quick Start (Docker)
```bash
# Start all services
docker-compose up --build

# Seed database with questions
docker-compose exec backend npm run seed

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-quiz
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 🧪 Edge Cases Handled

1. **Idempotency:** Duplicate answer submissions return cached results
2. **Streak Decay:** Automatic reset after 24 hours of inactivity
3. **State Version Mismatch:** Prevents race conditions in concurrent requests
4. **Question Pool Exhaustion:** Falls back to any available question
5. **Difficulty Boundaries:** Clamped between 1-10
6. **Negative Scores:** Prevented (minimum score is 0)
7. **Cache Invalidation:** Strategic clearing on state changes
8. **Difficulty Ping-Pong:** Smoothing prevents rapid oscillation

---

## 📊 Key Metrics & Monitoring

### Performance Benchmarks
- GET /quiz/next: ~50-100ms (cached) / ~200-300ms (uncached)
- POST /quiz/answer: ~100-200ms
- GET /leaderboard: ~30-50ms (cached) / ~150-250ms (uncached)

### Metrics to Track
- API response times
- Cache hit/miss rates
- Database query performance
- Error rates by endpoint
- Active user count
- Questions answered per minute
- Average difficulty progression

---

## 🎯 User Journey

1. **Registration/Login** → Create account or authenticate
2. **Dashboard** → View stats, performance trends, difficulty distribution
3. **Take Quiz** → Answer adaptive questions with real-time feedback
4. **Leaderboard** → Compare rankings with other players
5. **Profile** → View detailed statistics and achievements

---

## 📚 Documentation Files

- **`README.md`** - Main project documentation, setup instructions, features
- **`LLD.md`** - Low-level design with algorithms, schemas, pseudocode
- **`DEMO_GUIDE.md`** - Step-by-step demo walkthrough for presentations
- **`PROJECT_SUMMARY.md`** - This comprehensive overview (you are here)

---

## 🔄 Scalability Considerations

### Horizontal Scaling
- Stateless backend servers (can run multiple instances)
- Session data stored in Redis (shared across instances)
- Load balancer ready

### Database Scaling
- Read replicas for leaderboard queries
- Sharding by userId for large scale
- Archive old answer logs

### Cache Scaling
- Redis Cluster for high availability
- Separate cache instances per service type

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- ✅ Full-stack JavaScript development
- ✅ RESTful API design
- ✅ Database schema design and indexing
- ✅ Caching strategies with Redis
- ✅ Algorithm implementation (adaptive difficulty)
- ✅ React component architecture
- ✅ Design system creation
- ✅ Docker containerization
- ✅ Security best practices
- ✅ Edge case handling
- ✅ Performance optimization

---

## 🚧 Future Enhancements

1. **WebSocket Integration** - Real-time leaderboard updates
2. **Question Categories** - Filter by topic/tag
3. **Timed Challenges** - Speed-based scoring
4. **Multiplayer Mode** - Head-to-head competitions
5. **Analytics Dashboard** - Admin panel with charts
6. **Social Features** - Friend challenges, sharing
7. **Mobile App** - React Native version
8. **AI-Generated Questions** - Dynamic question creation
9. **Achievements System** - More badges and rewards
10. **Study Mode** - Review wrong answers

---

## 📝 Quick Reference

### Key Files to Understand
- `backend/services/adaptiveService.js` - Difficulty algorithm
- `backend/services/cacheService.js` - Redis caching logic
- `backend/controllers/quizController.js` - Quiz API handlers
- `frontend/src/components/ui/` - Design system components
- `frontend/src/contexts/AuthContext.jsx` - Authentication state
- `docker-compose.yml` - Service orchestration

### Common Commands
```bash
# Start application
docker-compose up --build

# Seed database
docker-compose exec backend npm run seed

# View logs
docker-compose logs backend
docker-compose logs frontend

# Access Redis CLI
docker-compose exec redis redis-cli

# Access MongoDB
docker-compose exec mongo mongosh adaptive-quiz

# Stop all services
docker-compose down
```

---

## 👥 Project Context

**Built for:** Scaler Assignment  
**License:** MIT  
**Version:** 1.0.0

This platform showcases production-ready full-stack development with emphasis on:
- Clean architecture and code organization
- Comprehensive documentation
- Edge case handling
- Performance optimization
- Modern UI/UX practices
- DevOps best practices

---

**Last Updated:** February 2026

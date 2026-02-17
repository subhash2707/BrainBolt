#!/bin/bash

echo "🔧 Setting up local development environment..."
echo ""

# Create backend .env for local development
cat > backend/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-quiz
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=adaptive-quiz-secret-key-2024-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
EOF

echo "✅ Created backend/.env with localhost configuration"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Install and start MongoDB:"
echo "   brew install mongodb-community"
echo "   brew services start mongodb-community"
echo ""
echo "2. Install and start Redis:"
echo "   brew install redis"
echo "   brew services start redis"
echo ""
echo "3. Start backend:"
echo "   cd backend && npm start"
echo ""
echo "4. In another terminal, start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Seed the database:"
echo "   cd backend && npm run seed"
echo ""

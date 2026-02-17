import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import { User, Mail, Calendar, Trophy, Zap, Target, TrendingUp } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/v1/auth/profile')
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const state = profile?.state || {}
  const accuracy = state.totalAnswered > 0 
    ? ((state.correctAnswers / state.totalAnswered) * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your account details and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <Card.Body className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-4xl font-bold mb-4">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.username}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user?.email}
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.username}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Joined {new Date(profile?.user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistics
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-secondary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Score</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {state.totalScore || 0}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {state.currentDifficulty || 0}
                  </p>
                  <span className="text-gray-500">/10</span>
                </div>
                <Progress value={state.currentDifficulty || 0} max={10} className="mt-2" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-warning-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {state.streak || 0}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-success-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max Streak</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {state.maxStreak || 0}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Answered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {state.totalAnswered || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Correct Answers
                  </p>
                  <p className="text-2xl font-bold text-success-600">
                    {state.correctAnswers || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Accuracy
                  </p>
                  <p className="text-2xl font-bold text-primary-600">
                    {accuracy}%
                  </p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Achievement Badges
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {state.totalAnswered >= 10 && (
              <div className="text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <div className="text-4xl mb-2">🎯</div>
                <p className="font-medium text-gray-900 dark:text-white">Beginner</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">10+ questions</p>
              </div>
            )}
            {state.maxStreak >= 5 && (
              <div className="text-center p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                <div className="text-4xl mb-2">🔥</div>
                <p className="font-medium text-gray-900 dark:text-white">On Fire</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">5+ streak</p>
              </div>
            )}
            {state.currentDifficulty >= 7 && (
              <div className="text-center p-4 rounded-lg bg-secondary-50 dark:bg-secondary-900/20">
                <div className="text-4xl mb-2">🧠</div>
                <p className="font-medium text-gray-900 dark:text-white">Expert</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Level 7+</p>
              </div>
            )}
            {state.totalScore >= 1000 && (
              <div className="text-center p-4 rounded-lg bg-success-50 dark:bg-success-900/20">
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-medium text-gray-900 dark:text-white">Champion</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">1000+ score</p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Profile

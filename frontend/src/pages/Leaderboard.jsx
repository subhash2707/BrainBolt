import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Trophy, Zap, Medal, Crown } from 'lucide-react'

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('score')
  const [leaderboard, setLeaderboard] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'score' ? '/api/v1/leaderboard/score' : '/api/v1/leaderboard/streak'
      const response = await axios.get(endpoint)
      setLeaderboard(response.data.leaderboard)
      setCurrentUser(response.data.currentUser)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-warning-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />
    return null
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return 'warning'
    if (rank <= 3) return 'secondary'
    if (rank <= 10) return 'primary'
    return 'gray'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          See how you rank against other players
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('score')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'score'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Scores
          </div>
          {activeTab === 'score' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('streak')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'streak'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Top Streaks
          </div>
          {activeTab === 'streak' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
      </div>

      {currentUser && (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white font-bold text-lg">
                  {currentUser.rank}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentUser.username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {activeTab === 'score' ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {currentUser.totalScore}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Max Streak</p>
                    <p className="text-2xl font-bold text-warning-600">
                      {currentUser.maxStreak}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(entry.rank) || (
                          <Badge variant={getRankBadge(entry.rank)} className="text-base px-3 py-1">
                            {entry.rank}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.username}
                        </p>
                        {activeTab === 'score' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Streak: {entry.streak} | Max: {entry.maxStreak}
                          </p>
                        )}
                        {activeTab === 'streak' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Current: {entry.currentStreak} | Score: {entry.totalScore}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activeTab === 'score' ? (
                        <p className="text-2xl font-bold text-primary-600">
                          {entry.totalScore}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-warning-600">
                          {entry.maxStreak}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No leaderboard data yet</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Leaderboard

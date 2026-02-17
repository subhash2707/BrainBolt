import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import { Brain, Trophy, Zap, Target, TrendingUp, Award } from 'lucide-react'

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/quiz/metrics')
      setMetrics(response.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
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

  const stats = [
    {
      label: 'Current Difficulty',
      value: metrics?.currentDifficulty || 0,
      max: 10,
      icon: Target,
      color: 'primary',
    },
    {
      label: 'Current Streak',
      value: metrics?.streak || 0,
      icon: Zap,
      color: 'warning',
    },
    {
      label: 'Max Streak',
      value: metrics?.maxStreak || 0,
      icon: Award,
      color: 'success',
    },
    {
      label: 'Total Score',
      value: metrics?.totalScore || 0,
      icon: Trophy,
      color: 'secondary',
    },
  ]

  const difficultyDistribution = metrics?.difficultyHistogram || {}

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your progress and performance
          </p>
        </div>
        <Button onClick={() => navigate('/quiz')} size="lg">
          <Brain className="w-5 h-5 mr-2" />
          Start Quiz
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="animate-slide-up">
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <Badge variant={stat.color}>
                    {stat.max ? `${stat.value}/${stat.max}` : stat.value}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </h3>
                {stat.max && (
                  <Progress value={stat.value} max={stat.max} className="mt-3" />
                )}
              </Card.Body>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                <span className="text-2xl font-bold text-primary-600">
                  {metrics?.accuracy?.toFixed(1) || 0}%
                </span>
              </div>
              <Progress value={metrics?.accuracy || 0} max={100} showLabel />
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Recent Performance
                </h3>
                <div className="flex gap-1">
                  {metrics?.recentPerformance?.slice(0, 10).reverse().map((perf, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-12 rounded ${
                        perf.correct
                          ? 'bg-success-500'
                          : 'bg-error-500'
                      }`}
                      title={`Difficulty ${perf.difficulty}: ${perf.correct ? 'Correct' : 'Wrong'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Oldest</span>
                  <span>Recent</span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Difficulty Distribution
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {Object.entries(difficultyDistribution).length > 0 ? (
                Object.entries(difficultyDistribution)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([difficulty, stats]) => {
                    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
                    return (
                      <div key={difficulty}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Level {difficulty}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.correct}/{stats.total} ({accuracy.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={accuracy} max={100} />
                      </div>
                    )
                  })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No data yet. Start taking quizzes!
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

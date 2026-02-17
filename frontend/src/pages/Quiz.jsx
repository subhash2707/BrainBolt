import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { CheckCircle, XCircle, Zap, Trophy, Target, ArrowRight } from 'lucide-react'

const Quiz = () => {
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNextQuestion()
  }, [])

  const fetchNextQuestion = async () => {
    setLoading(true)
    setSelectedAnswer(null)
    setResult(null)

    try {
      const response = await axios.get('/api/v1/quiz/next')
      setQuestion(response.data)
    } catch (error) {
      console.error('Failed to fetch question:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !question) return

    setSubmitting(true)

    try {
      const response = await axios.post('/api/v1/quiz/answer', {
        questionId: question.questionId,
        answer: selectedAnswer,
        stateVersion: question.stateVersion,
        answerIdempotencyKey: `${question.questionId}-${Date.now()}-${Math.random()}`,
      })

      setResult(response.data)
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    fetchNextQuestion()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <Card.Body className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No questions available</p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Difficulty: <Badge variant="primary">{question.difficulty}/10</Badge>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Streak: <Badge variant="warning">{question.currentStreak}</Badge>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Score: <Badge variant="secondary">{question.currentScore}</Badge>
            </span>
          </div>
        </div>
      </div>

      <Card className="animate-slide-up">
        <Card.Body className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            {question.prompt}
          </h2>

          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => !result && setSelectedAnswer(choice)}
                disabled={!!result}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAnswer === choice
                    ? result
                      ? result.correct
                        ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
                        : 'border-error-500 bg-error-50 dark:bg-error-900/20'
                      : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                } ${result ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {choice}
                  </span>
                  {result && selectedAnswer === choice && (
                    result.correct ? (
                      <CheckCircle className="w-6 h-6 text-success-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-error-600" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>

          {result && (
            <div className={`mt-6 p-6 rounded-lg ${
              result.correct
                ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
                : 'bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800'
            } animate-scale-in`}>
              <div className="flex items-start gap-4">
                {result.correct ? (
                  <CheckCircle className="w-8 h-8 text-success-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-error-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    result.correct ? 'text-success-900 dark:text-success-100' : 'text-error-900 dark:text-error-100'
                  }`}>
                    {result.correct ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score Change</p>
                      <p className={`text-lg font-bold ${
                        result.scoreDelta > 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {result.scoreDelta > 0 ? '+' : ''}{result.scoreDelta}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Score</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.totalScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Streak</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.newStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Difficulty</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.newDifficulty}/10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            {!result ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || submitting}
                loading={submitting}
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Quiz

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function useScoreSubmit() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  async function submit({ courseId, playedAt, totalScore, holeScores }) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600))
      setSuccess(true)
      setLoading(false)
      return true
    }

    if (!user) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return false
    }

    const { error } = await supabase
      .from('score_records')
      .insert({
        user_id:     user.id,
        course_id:   courseId,
        played_at:   playedAt,
        total_score: totalScore,
        hole_scores: holeScores ?? null,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setSuccess(true)
    setLoading(false)
    return true
  }

  return { submit, loading, error, success }
}

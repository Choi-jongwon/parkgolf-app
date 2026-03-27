import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_MY_SCORES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function useMyScores() {
  const [scores,  setScores]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      setScores(MOCK_MY_SCORES)
      setLoading(false)
      return
    }

    async function fetch() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from('score_records')
        .select(`id, played_at, total_score, hole_scores, golf_courses(name, hole_count)`)
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      if (error) setError(error.message)
      else       setScores(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const stats = scores.length ? {
    rounds: scores.length,
    best:   Math.min(...scores.map((s) => s.total_score)),
    avg:    (scores.reduce((a, s) => a + s.total_score, 0) / scores.length).toFixed(1),
  } : null

  return { scores, stats, loading, error }
}

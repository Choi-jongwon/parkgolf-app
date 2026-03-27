import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_RANKINGS } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function useRanking(courseId) {
  const [rankings, setRankings] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!courseId) return

    if (USE_MOCK) {
      setLoading(true)
      setTimeout(() => {
        setRankings(MOCK_RANKINGS[courseId] ?? [])
        setLoading(false)
      }, 300)
      return
    }

    async function fetch() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('ranking_by_course')
        .select('*')
        .eq('course_id', courseId)
        .order('best_score', { ascending: true })

      if (error) setError(error.message)
      else       setRankings(data.map((row, i) => ({ ...row, rank: i + 1 })))
      setLoading(false)
    }
    fetch()
  }, [courseId])

  return { rankings, loading, error }
}

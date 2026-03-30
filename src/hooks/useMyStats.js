import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_MY_STATS = {
  myAvg: 68.3,
  myBest: 63,
  myRounds: 12,
  myRank: 42,
  totalUsers: 272,
  percentile: 15,
}

export function useMyStats() {
  const { user } = useAuth()
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setMyStats(MOCK_MY_STATS); setLoading(false) }, 500)
      return
    }
    if (!user) { setMyStats(null); setLoading(false); return }

    async function fetch() {
      try {
        /* 전체 스코어 (순위 계산용) */
        const { data: all } = await supabase
          .from('score_records')
          .select('user_id, total_score')

        if (!all || all.length === 0) { setMyStats(null); setLoading(false); return }

        /* 유저별 평균 계산 */
        const map = {}
        all.forEach(({ user_id, total_score }) => {
          if (!map[user_id]) map[user_id] = { sum: 0, count: 0, best: Infinity }
          map[user_id].sum   += total_score
          map[user_id].count++
          map[user_id].best   = Math.min(map[user_id].best, total_score)
        })

        const mine = map[user.id]
        if (!mine) { setMyStats(null); setLoading(false); return }

        const myAvg    = Math.round((mine.sum / mine.count) * 10) / 10
        const myBest   = mine.best
        const myRounds = mine.count

        /* 내 순위 (낮은 평균이 1위) */
        const allAvgs   = Object.values(map).map(({ sum, count }) => sum / count).sort((a, b) => a - b)
        const myRank    = allAvgs.findIndex(v => v >= myAvg) + 1
        const totalUsers = allAvgs.length
        const percentile = Math.round((myRank / totalUsers) * 100)

        setMyStats({ myAvg, myBest, myRounds, myRank, totalUsers, percentile })
      } catch (err) {
        console.error('useMyStats error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [user])

  return { myStats, loading }
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_STATS = {
  ageGroups: [
    { group: '50대', avg: 65.8, change: -1.2, users: 34 },
    { group: '60대', avg: 68.4, change: +1.1, users: 128 },
    { group: '70대', avg: 72.1, change: -0.4, users: 89 },
    { group: '80대', avg: 76.5, change: +0.6, users: 21 },
  ],
  gender: [
    { label: '남성', avg: 69.1, change: -0.5, users: 198 },
    { label: '여성', avg: 71.3, change: +0.3, users: 74 },
  ],
  totalUsers: 272,
  totalRounds: 1043,
}

export function useStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setStats(MOCK_STATS); setLoading(false) }, 400)
      return
    }

    async function fetch() {
      try {
        const today        = new Date()
        const thisWeekFrom = new Date(today - 7  * 86400000).toISOString().split('T')[0]
        const lastWeekFrom = new Date(today - 14 * 86400000).toISOString().split('T')[0]
        const currentYear  = today.getFullYear()

        const { data, error } = await supabase
          .from('score_records')
          .select('total_score, played_at, user_id, users(birth_year, gender)')

        if (error) throw error
        if (!data || data.length === 0) { setStats(null); return }

        /* ── 연령대 / 성별별 집계 ── */
        const ageAll  = {}   // { '60대': { sum, count } }
        const ageThis = {}
        const ageLast = {}
        const genAll  = { male: { sum:0,count:0 }, female: { sum:0,count:0 } }
        const genThis = { male: { sum:0,count:0 }, female: { sum:0,count:0 } }
        const genLast = { male: { sum:0,count:0 }, female: { sum:0,count:0 } }
        const userIds = new Set()

        data.forEach(({ total_score, played_at, user_id, users: u }) => {
          if (!u) return
          userIds.add(user_id)

          const isThis = played_at >= thisWeekFrom
          const isLast = played_at >= lastWeekFrom && played_at < thisWeekFrom

          /* 연령대 */
          if (u.birth_year) {
            const g = Math.floor((currentYear - u.birth_year) / 10) * 10 + '대'
            ;[ageAll, ageThis, ageLast].forEach((map, idx) => {
              if (idx === 1 && !isThis) return
              if (idx === 2 && !isLast) return
              if (!map[g]) map[g] = { sum: 0, count: 0 }
              map[g].sum += total_score
              map[g].count++
            })
          }

          /* 성별 */
          if (u.gender && (u.gender === 'male' || u.gender === 'female')) {
            genAll[u.gender].sum += total_score
            genAll[u.gender].count++
            if (isThis) { genThis[u.gender].sum += total_score; genThis[u.gender].count++ }
            if (isLast) { genLast[u.gender].sum += total_score; genLast[u.gender].count++ }
          }
        })

        /* 연령대 배열 */
        const ageGroups = Object.entries(ageAll)
          .map(([group, { sum, count }]) => {
            const avg      = Math.round((sum / count) * 10) / 10
            const thisAvg  = ageThis[group]?.count > 0 ? ageThis[group].sum / ageThis[group].count : null
            const lastAvg  = ageLast[group]?.count > 0 ? ageLast[group].sum / ageLast[group].count : null
            const change   = thisAvg !== null && lastAvg !== null
              ? Math.round((thisAvg - lastAvg) * 10) / 10 : null
            return { group, avg, change, users: count }
          })
          .sort((a, b) => parseInt(a.group) - parseInt(b.group))

        /* 성별 배열 */
        const gender = [
          { label: '남성', key: 'male' },
          { label: '여성', key: 'female' },
        ].map(({ label, key }) => {
          const { sum, count } = genAll[key]
          if (count === 0) return null
          const avg     = Math.round((sum / count) * 10) / 10
          const thisAvg = genThis[key].count > 0 ? genThis[key].sum / genThis[key].count : null
          const lastAvg = genLast[key].count > 0 ? genLast[key].sum / genLast[key].count : null
          const change  = thisAvg !== null && lastAvg !== null
            ? Math.round((thisAvg - lastAvg) * 10) / 10 : null
          return { label, avg, change, users: count }
        }).filter(Boolean)

        setStats({ ageGroups, gender, totalUsers: userIds.size, totalRounds: data.length })
      } catch (err) {
        console.error('useStats error:', err)
        setStats(MOCK_STATS)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { stats, loading }
}

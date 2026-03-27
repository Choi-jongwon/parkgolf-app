export default function RankingTable({ rankings = [], loading }) {
  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 animate-pulse">
        랭킹을 불러오는 중...
      </div>
    )
  }

  if (rankings.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        아직 기록이 없습니다.
      </div>
    )
  }

  const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const ROW_BG = { 1: 'bg-yellow-50', 2: 'bg-gray-50', 3: 'bg-orange-50' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            <th className="py-2 px-3 text-center w-10">순위</th>
            <th className="py-2 px-3 text-left">닉네임</th>
            <th className="py-2 px-3 text-center">베스트</th>
            <th className="py-2 px-3 text-center hidden sm:table-cell">평균</th>
            <th className="py-2 px-3 text-center hidden sm:table-cell">라운드</th>
            <th className="py-2 px-3 text-center hidden sm:table-cell">최근일</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr
              key={r.user_id || i}
              className={`border-t transition-colors hover:bg-green-50 ${ROW_BG[r.rank] ?? ''}`}
            >
              <td className="py-3 px-3 text-center font-bold">
                {MEDAL[r.rank] ?? r.rank}
              </td>
              <td className="py-3 px-3 font-medium text-gray-800">{r.nickname}</td>
              <td className="py-3 px-3 text-center font-bold text-green-600">{r.best_score}</td>
              <td className="py-3 px-3 text-center text-gray-500 hidden sm:table-cell">
                {r.avg_score}
              </td>
              <td className="py-3 px-3 text-center text-gray-500 hidden sm:table-cell">
                {r.play_count}회
              </td>
              <td className="py-3 px-3 text-center text-gray-400 text-xs hidden sm:table-cell">
                {r.last_played}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { useMyScores } from '../hooks/useMyScores'

export default function MyScoresPage() {
  const { scores, stats, loading } = useMyScores()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
        기록 불러오는 중...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-800">내 기록</h1>

      {/* 스탯 카드 */}
      {stats ? (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '라운드', value: `${stats.rounds}회`, icon: '🏌️' },
            { label: '베스트',  value: `${stats.best}타`,  icon: '⭐' },
            { label: '평균',    value: `${stats.avg}타`,   icon: '📊' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-lg font-extrabold text-green-700">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 rounded-2xl p-5 text-center text-green-700 font-medium">
          아직 기록이 없습니다. 스코어를 입력해 보세요! ⛳
        </div>
      )}

      {/* 히스토리 리스트 */}
      {scores.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b font-bold text-gray-700">라운딩 히스토리</div>
          {scores.map((s) => {
            const par  = (s.golf_courses?.hole_count ?? 18) * 3
            const diff = s.total_score - par
            return (
              <div key={s.id} className="px-4 py-3 border-t flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {s.golf_courses?.name ?? '알 수 없음'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.played_at}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-green-600">{s.total_score}</span>
                  <span className="text-sm text-gray-400 ml-1">타</span>
                  <p className={`text-xs font-semibold mt-0.5 ${diff <= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                    {diff === 0 ? 'PAR' : diff > 0 ? `+${diff}` : diff}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

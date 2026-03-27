import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useRanking } from '../hooks/useRanking'
import RankingTable from '../components/RankingTable'

export default function HomePage() {
  const navigate = useNavigate()
  const { courses, loading: coursesLoading } = useCourses()
  const [selectedId, setSelectedId] = useState(null)

  // courses 로드되면 첫 번째 자동 선택
  const courseId = selectedId ?? courses[0]?.id ?? null
  const selectedCourse = courses.find((c) => c.id === courseId)

  const { rankings, loading: rankLoading } = useRanking(courseId)

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
        골프장 목록 로딩 중...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 배너 */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white p-5 flex items-center justify-between">
        <div>
          <p className="text-green-100 text-sm">오늘도 즐거운 라운딩!</p>
          <h1 className="text-2xl font-bold mt-0.5">골프장별 랭킹</h1>
        </div>
        <div className="text-5xl opacity-80">🏆</div>
      </div>

      {/* 골프장 선택 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          골프장 선택
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                courseId === c.id
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">{c.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    courseId === c.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {c.hole_count}홀
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{c.address}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">
            {selectedCourse?.name}{' '}
            <span className="text-green-600">랭킹</span>
          </h2>
          <span className="text-xs text-gray-400">베스트 스코어 기준</span>
        </div>
        <RankingTable rankings={rankings} loading={rankLoading} />
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/score')}
        className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg text-base transition-all"
      >
        ✏️ 내 스코어 기록하기
      </button>
    </div>
  )
}

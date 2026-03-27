import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useRanking } from '../hooks/useRanking'
import RankingTable from '../components/RankingTable'

// 지역 표시명 매핑
const REGION_LABEL = {
  '서울': '서울', '부산': '부산', '대구': '대구', '인천': '인천',
  '광주': '광주', '대전': '대전', '울산': '울산', '세종': '세종',
  '경기': '경기', '강원': '강원', '충북': '충북', '충남': '충남',
  '전북': '전북', '전남': '전남', '경북': '경북', '경남': '경남', '제주': '제주',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { courses, loading: coursesLoading } = useCourses()

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedId,     setSelectedId]     = useState(null)
  const [searchQuery,    setSearchQuery]     = useState('')

  // 지역 목록 (데이터에 존재하는 것만, 정해진 순서대로)
  const regions = useMemo(() => {
    const inData = new Set(courses.map((c) => c.city_province))
    return Object.keys(REGION_LABEL).filter((r) => inData.has(r))
  }, [courses])

  // 지역 + 검색어 필터링
  const filteredCourses = useMemo(() => {
    let list = courses
    if (selectedRegion) list = list.filter((c) => c.city_province === selectedRegion)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return list
  }, [courses, selectedRegion, searchQuery])

  // 선택된 골프장 (필터 결과 첫 번째 자동 선택)
  const courseId = selectedId && filteredCourses.find((c) => c.id === selectedId)
    ? selectedId
    : filteredCourses[0]?.id ?? null
  const selectedCourse = courses.find((c) => c.id === courseId)

  const { rankings, loading: rankLoading } = useRanking(courseId)

  function handleRegion(region) {
    setSelectedRegion((prev) => prev === region ? null : region)
    setSelectedId(null)
  }

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
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          골프장 선택
        </h2>

        {/* ① 지역 필터 버튼 */}
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => handleRegion(region)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedRegion === region
                  ? 'bg-green-600 text-white border-green-600 shadow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {REGION_LABEL[region]}
            </button>
          ))}
        </div>

        {/* ② 검색창 */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="골프장 이름 검색..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedId(null) }}
            className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* ③ 골프장 목록 */}
        {filteredCourses.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              {selectedRegion ? `${REGION_LABEL[selectedRegion]} · ` : ''}
              총 <span className="font-semibold text-gray-600">{filteredCourses.length}</span>개 골프장
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    courseId === c.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-gray-800 truncate">{c.name}</span>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      courseId === c.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.city_province}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{c.address}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 랭킹 테이블 */}
      {courseId && (
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
      )}

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

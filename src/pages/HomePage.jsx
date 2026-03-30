import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { useCourses }  from '../hooks/useCourses'
import { useRanking }  from '../hooks/useRanking'
import { useStats }    from '../hooks/useStats'
import { useMyStats }  from '../hooks/useMyStats'
import RankingTable    from '../components/RankingTable'

const REGION_LABEL = {
  '서울':'서울','부산':'부산','대구':'대구','인천':'인천',
  '광주':'광주','대전':'대전','울산':'울산','세종':'세종',
  '경기':'경기','강원':'강원','충북':'충북','충남':'충남',
  '전북':'전북','전남':'전남','경북':'경북','경남':'경남','제주':'제주',
}

/* ── 변화 뱃지 ── */
function ChangeBadge({ change }) {
  if (change === null || change === undefined) return <span className="text-xs text-gray-300">-</span>
  const improved = change < 0   // 타수 감소 = 실력 향상
  return (
    <span className={`text-xs font-bold flex items-center gap-0.5
      ${improved ? 'text-blue-500' : 'text-red-400'}`}>
      {improved ? '▼' : '▲'}{Math.abs(change)}
      <span className="font-normal text-gray-400 ml-0.5">지난주 대비</span>
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user, nickname } = useAuth()

  /* 탭: 'stats' | 'ranking' */
  const [tab, setTab] = useState('stats')

  /* ── 통계 탭 데이터 ── */
  const { stats,   loading: statsLoading  } = useStats()
  const { myStats, loading: myStatsLoading } = useMyStats()

  /* ── 랭킹 탭 데이터 ── */
  const { courses, loading: coursesLoading } = useCourses()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedId,     setSelectedId]     = useState(null)
  const [searchQuery,    setSearchQuery]     = useState('')

  const regions = useMemo(() => {
    const inData = new Set(courses.map(c => c.city_province))
    return Object.keys(REGION_LABEL).filter(r => inData.has(r))
  }, [courses])

  const filteredCourses = useMemo(() => {
    let list = courses
    if (selectedRegion) list = list.filter(c => c.city_province === selectedRegion)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(q))
    }
    return list
  }, [courses, selectedRegion, searchQuery])

  const courseId = selectedId && filteredCourses.find(c => c.id === selectedId)
    ? selectedId : filteredCourses[0]?.id ?? null
  const selectedCourse = courses.find(c => c.id === courseId)
  const { rankings, loading: rankLoading } = useRanking(courseId)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* ── 헤더 배너 ── */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">
              {user ? `${nickname}님, 안녕하세요! 👋` : '오늘도 즐거운 라운딩!'}
            </p>
            <h1 className="text-2xl font-bold mt-0.5">파크골프 스코어</h1>
          </div>
          <div className="text-right">
            {stats && (
              <>
                <p className="text-3xl font-extrabold">{stats.totalUsers}<span className="text-lg font-normal text-green-100">명</span></p>
                <p className="text-green-100 text-xs">{stats.totalRounds.toLocaleString()}라운드 기록</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 탭 ── */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[['stats','📊 통계'], ['ranking','🏆 랭킹']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all
              ${tab === key ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          📊 통계 탭
      ════════════════════════════════ */}
      {tab === 'stats' && (
        <div className="space-y-5">

          {/* 개인화 카드 (로그인 시) */}
          {user && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                <h2 className="font-bold text-green-800 text-sm">👤 내 스코어 현황</h2>
              </div>
              {myStatsLoading ? (
                <div className="p-6 text-center text-gray-400 text-sm animate-pulse">데이터 불러오는 중...</div>
              ) : !myStats ? (
                <div className="p-6 text-center space-y-3">
                  <p className="text-gray-400 text-sm">아직 기록된 스코어가 없습니다.</p>
                  <button onClick={() => navigate('/score')}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl">
                    첫 스코어 기록하기 →
                  </button>
                </div>
              ) : (
                <div className="p-4">
                  {/* 순위 / 상위% / 라운드 수 */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: '내 순위',   value: `${myStats.myRank}위`,       sub: `전체 ${myStats.totalUsers}명 중` },
                      { label: '상위',      value: `${myStats.percentile}%`,    sub: '전체 대비' },
                      { label: '총 라운드', value: `${myStats.myRounds}회`,     sub: '누적' },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-xl font-extrabold text-green-700">{value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>
                  {/* 평균 / 베스트 */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '평균 스코어', value: `${myStats.myAvg}타`,  color: 'text-gray-800' },
                      { label: '베스트 스코어', value: `${myStats.myBest}타`, color: 'text-blue-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 비로그인 시 유도 */}
          {!user && (
            <button onClick={() => navigate('/login')}
              className="w-full bg-white border-2 border-dashed border-green-300 rounded-2xl p-4
                text-center text-sm text-green-600 font-semibold hover:bg-green-50 transition-colors">
              🔑 로그인하면 내 순위와 개인 통계를 확인할 수 있어요
            </button>
          )}

          {/* 연령별 평균 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-bold text-gray-800 text-sm">📊 연령별 평균 스코어</h2>
              <p className="text-xs text-gray-400 mt-0.5">▼ 내림 = 타수 감소 (실력 향상)</p>
            </div>
            {statsLoading ? (
              <div className="p-6 text-center text-gray-400 text-sm animate-pulse">불러오는 중...</div>
            ) : !stats?.ageGroups?.length ? (
              <div className="p-6 text-center text-gray-400 text-sm">아직 데이터가 부족합니다</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.ageGroups.map(({ group, avg, change, users }) => (
                  <div key={group} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-sm
                        flex items-center justify-center shrink-0">
                        {group}
                      </span>
                      <div>
                        <p className="font-extrabold text-gray-800 text-lg leading-none">{avg}타</p>
                        <ChangeBadge change={change} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{users}명 참여</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 성별 평균 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-bold text-gray-800 text-sm">👫 성별 평균 스코어</h2>
            </div>
            {statsLoading ? (
              <div className="p-6 text-center text-gray-400 text-sm animate-pulse">불러오는 중...</div>
            ) : !stats?.gender?.length ? (
              <div className="p-6 text-center text-gray-400 text-sm">아직 데이터가 부족합니다</div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {stats.gender.map(({ label, avg, change, users }) => (
                  <div key={label} className="p-5 text-center">
                    <p className="text-2xl mb-1">{label === '남성' ? '👨' : '👩'}</p>
                    <p className="font-bold text-gray-700 text-sm">{label}</p>
                    <p className="text-3xl font-extrabold text-gray-800 my-1">{avg}<span className="text-base font-normal text-gray-400">타</span></p>
                    <ChangeBadge change={change} />
                    <p className="text-xs text-gray-400 mt-1">{users}명</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTab('ranking')}
              className="py-3.5 border-2 border-green-600 text-green-700 font-bold rounded-2xl text-sm
                hover:bg-green-50 active:scale-95 transition-all">
              🏆 골프장별 랭킹
            </button>
            <button onClick={() => navigate('/score')}
              className="py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-sm
                active:scale-95 transition-all shadow-lg">
              ✏️ 스코어 기록
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          🏆 랭킹 탭
      ════════════════════════════════ */}
      {tab === 'ranking' && (
        <div className="space-y-4">

          {coursesLoading ? (
            <div className="py-12 text-center text-gray-400 animate-pulse">골프장 목록 로딩 중...</div>
          ) : (
            <>
              {/* 지역 필터 */}
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <button key={region} onClick={() => {
                    setSelectedRegion(p => p === region ? null : region)
                    setSelectedId(null)
                  }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                      ${selectedRegion === region
                        ? 'bg-green-600 text-white border-green-600 shadow'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'}`}>
                    {REGION_LABEL[region]}
                  </button>
                ))}
              </div>

              {/* 검색 */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input type="text" placeholder="골프장 이름 검색..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedId(null) }}
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:border-green-400 bg-white" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg">×</button>
                )}
              </div>

              {/* 골프장 목록 */}
              {filteredCourses.length === 0 ? (
                <p className="py-8 text-center text-gray-400 text-sm">검색 결과가 없습니다.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400">
                    총 <span className="font-semibold text-gray-600">{filteredCourses.length}</span>개 골프장
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {filteredCourses.map(c => (
                      <button key={c.id} onClick={() => setSelectedId(c.id)}
                        className={`rounded-xl border-2 p-3 text-left transition-all
                          ${courseId === c.id
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-100 bg-white hover:border-green-300'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-800 truncate">{c.name}</span>
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
                            ${courseId === c.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {c.city_province}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.address}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 랭킹 테이블 */}
              {courseId && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">
                      {selectedCourse?.name} <span className="text-green-600">랭킹</span>
                    </h2>
                    <span className="text-xs text-gray-400">베스트 스코어 기준</span>
                  </div>
                  <RankingTable rankings={rankings} loading={rankLoading} />
                </div>
              )}

              <button
                onClick={() => navigate('/score', { state: { course: selectedCourse } })}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-95
                  text-white font-bold rounded-2xl shadow-lg text-base transition-all">
                ✏️ {selectedCourse ? `${selectedCourse.name} 스코어 기록하기` : '내 스코어 기록하기'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

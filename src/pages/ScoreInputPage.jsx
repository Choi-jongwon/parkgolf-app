import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useScoreSubmit } from '../hooks/useScoreSubmit'

/* ── 홀별 레이블 (기준 타수 기준) ── */
function getLabel(score, par) {
  if (score === 1) return ['홀인원', 'bg-purple-100 text-purple-700']
  const d = score - par
  if (d <= -2) return ['이글',     'bg-blue-200 text-blue-700']
  if (d === -1) return ['버디',    'bg-blue-100 text-blue-600']
  if (d === 0)  return ['파',      'bg-gray-100 text-gray-500']
  if (d === 1)  return ['보기',    'bg-red-100 text-red-500']
  if (d === 2)  return ['더블',    'bg-red-200 text-red-600']
  return              ['트리플+', 'bg-red-300 text-red-700']
}

/* ── 달력 컴포넌트 ── */
function CalendarPicker({ value, onChange }) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const initDate = value ? new Date(value + 'T00:00:00') : today
  const [view, setView] = useState(
    new Date(initDate.getFullYear(), initDate.getMonth(), 1)
  )

  const year  = view.getFullYear()
  const month = view.getMonth()

  const firstDow   = new Date(year, month, 1).getDay()           // 0=일
  const paddingDays = firstDow === 0 ? 6 : firstDow - 1          // 월요일 시작 보정
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function toStr(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">
          ‹
        </button>
        <span className="font-bold text-gray-800 text-base">{year}년 {month + 1}월</span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {['월','화','수','목','금','토','일'].map((d, i) => (
          <div key={d}
            className={`text-center text-xs font-semibold py-1
              ${i === 5 ? 'text-blue-400' : i === 6 ? 'text-red-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array(paddingDays).fill(null).map((_, i) => <div key={`p${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const ds      = toStr(d)
          const isSel   = value === ds
          const isToday = todayStr === ds
          const isFut   = ds > todayStr
          const dow     = (paddingDays + d - 1) % 7  // 0=월 … 5=토 6=일
          return (
            <button key={d} disabled={isFut} onClick={() => onChange(ds)}
              className={`w-full aspect-square flex items-center justify-center text-sm rounded-xl transition-colors
                ${isFut   ? 'text-gray-200 cursor-not-allowed' :
                  isSel   ? 'bg-green-600 text-white font-bold shadow' :
                  isToday ? 'border-2 border-green-400 text-green-600 font-semibold' :
                  dow === 5 ? 'text-blue-500 hover:bg-blue-50' :
                  dow === 6 ? 'text-red-500 hover:bg-red-50' :
                              'text-gray-700 hover:bg-green-50'}`}>
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 코스 유형 기준타수 생성 ── */
const HOLE_COUNT = 18  // 항상 18홀 기준

const COURSE_TYPES = {
  simple:   { label: '간단코스', par: 54, desc: '전 홀 파3 · 18홀', color: 'green' },
  official: { label: '대회코스', par: 66, desc: '파3·파4 혼합 · 18홀', color: 'blue' },
}

function makePars(type, holeCount) {
  if (type === 'simple') return Array(holeCount).fill(3)
  // 공인코스: 파4 × (홀수×2/3) + 파3 × (홀수×1/3) ≈ 66/18홀
  // 3홀 간격으로 파3 배치 (3,6,9,...), 나머지 파4
  return Array.from({ length: holeCount }, (_, i) => ((i + 1) % 3 === 0 ? 3 : 4))
}

/* ── 메인 페이지 ── */
export default function ScoreInputPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { courses } = useCourses()
  const { submit, loading: submitting, error: submitError } = useScoreSubmit()

  const preselected = location.state?.course ?? null

  const [step,   setStep]   = useState(preselected ? 2 : 1)
  const [course, setCourse] = useState(preselected)
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0])

  /* 코스 유형 */
  const [courseType, setCourseType] = useState('simple')

  /* 총 타수 직접 입력 */
  const [totalDirect, setTotalDirect] = useState(null)   // null = 홀별 합산 사용

  /* 홀별 데이터 */
  const holeCount = HOLE_COUNT
  const [scores, setScores] = useState(Array(36).fill(3))  // 실제 타수
  const [pars,   setPars]   = useState(() => makePars('simple', 36))  // 기준 타수

  /* 홀별 섹션 펼침 여부 */
  const [showHoles, setShowHoles] = useState(false)

  /* 코스 유형 변경 핸들러 */
  function handleCourseType(type) {
    setCourseType(type)
    const newPars = makePars(type, 36)
    setPars(newPars)
    // 스코어를 기준타 기본값으로 초기화
    setScores([...newPars])
    setTotalDirect(null)
  }

  /* 합산 */
  const holeTotal = scores.slice(0, holeCount).reduce((a, b) => a + b, 0)
  const total     = totalDirect !== null ? totalDirect : holeTotal
  const parTotal  = pars.slice(0, holeCount).reduce((a, b) => a + b, 0)
  const diff      = total - parTotal

  function changeScore(i, d) {
    setScores(prev => { const n = [...prev]; n[i] = Math.max(1, Math.min(9, n[i] + d)); return n })
    setTotalDirect(null)  // 홀별 입력 시 직접 입력 초기화
  }
  function changePar(i, val) {
    setPars(prev => { const n = [...prev]; n[i] = val; return n })
  }
  function changeTotal(d) {
    setTotalDirect(prev => Math.max(holeCount, Math.min(holeCount * 9, (prev ?? holeTotal) + d)))
  }

  async function handleSave() {
    const holeScores = showHoles
      ? Object.fromEntries(scores.slice(0, holeCount).map((s, i) => [String(i + 1), s]))
      : null
    const ok = await submit({
      courseId:   course.id,
      playedAt:   date,
      totalScore: total,
      holeScores,
    })
    if (ok) setStep(3)
  }

  /* ── 완료 화면 ── */
  if (step === 3) return (
    <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800">기록 완료!</h2>
      <div className="bg-green-50 rounded-2xl p-5 space-y-1">
        <p className="text-gray-500 text-sm">{course?.name} · {date} · {COURSE_TYPES[courseType].label}</p>
        <p className="text-4xl font-extrabold text-green-600">{total}타</p>
        <p className={`text-lg font-semibold ${diff <= 0 ? 'text-blue-500' : 'text-red-500'}`}>
          PAR {parTotal} 대비 {diff === 0 ? '이븐' : diff > 0 ? `+${diff}` : diff}
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')}
          className="flex-1 py-3 border-2 border-green-600 text-green-700 font-bold rounded-xl">
          랭킹 보기
        </button>
        <button onClick={() => {
          setStep(1); setCourse(null)
          setScores(Array(36).fill(3)); setPars(Array(36).fill(3))
          setTotalDirect(null); setShowHoles(false)
        }}
          className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl">
          다시 입력
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">

      {/* 진행 표시 */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
            <div className={`h-1 flex-1 rounded-full ${s === 1 ? (step > 1 ? 'bg-green-500' : 'bg-gray-200') : ''}`} />
          </div>
        ))}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
          ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>✓</div>
      </div>

      {/* ───── STEP 1: 골프장 선택 ───── */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold text-gray-800">골프장 선택</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {courses.map((c) => (
              <button key={c.id} onClick={() => setCourse(c)}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all
                  ${course?.id === c.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-800 truncate">{c.name}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full
                    ${course?.id === c.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {c.city_province}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{c.address}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (course ?? courses[0]) { setCourse(c => c ?? courses[0]); setStep(2) } }}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-base active:scale-95 transition-all">
            다음 → 스코어 입력
          </button>
        </>
      )}

      {/* ───── STEP 2: 날짜 + 타수 입력 ───── */}
      {step === 2 && (
        <>
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium">← 이전</button>
            <h2 className="text-base font-bold text-gray-800 truncate mx-2">{course?.name}</h2>
            <span className="text-xs text-gray-400 shrink-0">18홀</span>
          </div>

          {/* 🏌️ 코스 유형 선택 */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">🏌️ 코스 유형</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(COURSE_TYPES).map(([key, ct]) => (
                <button key={key} onClick={() => handleCourseType(key)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-95
                    ${courseType === key
                      ? key === 'simple'
                        ? 'border-green-500 bg-green-50'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className={`text-lg font-extrabold mb-0.5
                    ${courseType === key
                      ? key === 'simple' ? 'text-green-600' : 'text-blue-600'
                      : 'text-gray-700'}`}>
                    {ct.par}타
                  </div>
                  <div className={`text-sm font-bold
                    ${courseType === key
                      ? key === 'simple' ? 'text-green-700' : 'text-blue-700'
                      : 'text-gray-600'}`}>
                    {ct.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{ct.desc}</div>
                  {courseType === key && (
                    <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full inline-block
                      ${key === 'simple'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'}`}>
                      ✓ 선택됨
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 📅 달력 날짜 선택 */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">📅 경기 날짜</label>
            <CalendarPicker value={date} onChange={setDate} />
          </div>

          {/* ⛳ 총 타수 */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">⛳ 총 타수</label>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <button onClick={() => changeTotal(-1)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40
                    text-white font-bold text-2xl flex items-center justify-center transition-colors">
                  −
                </button>
                <div className="text-center">
                  <p className="text-5xl font-extrabold leading-none">{total}</p>
                  <p className="text-green-100 text-xs mt-1">타</p>
                </div>
                <button onClick={() => changeTotal(+1)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40
                    text-white font-bold text-2xl flex items-center justify-center transition-colors">
                  ＋
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-sm">
                <span className="text-green-100">
                  {COURSE_TYPES[courseType].label} · PAR {parTotal}
                </span>
                <span className={`font-bold ${diff === 0 ? 'text-yellow-300' : diff < 0 ? 'text-blue-200' : 'text-red-200'}`}>
                  {diff === 0 ? '이븐' : diff > 0 ? `+${diff}` : `${diff}`}
                </span>
              </div>
            </div>
          </div>

          {/* 홀별 스코어 입력하기 (토글) */}
          <div>
            <button
              onClick={() => setShowHoles(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3
                bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-colors">
              <span className="font-bold text-gray-700 text-sm">홀별 스코어 입력하기</span>
              <span className="text-gray-400 font-bold text-lg">{showHoles ? '▲' : '▼'}</span>
            </button>

            {showHoles && (
              <div className="mt-2 space-y-2">
                {Array.from({ length: holeCount }, (_, i) => {
                  const [label, color] = getLabel(scores[i], pars[i])
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                      {/* 홀 번호 + 기준 타수 선택 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-700 text-sm">{i + 1}홀</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 mr-1">기준타</span>
                          {[3, 4, 5].map(p => (
                            <button key={p} onClick={() => changePar(i, p)}
                              className={`w-8 h-7 rounded-lg text-xs font-bold transition-colors
                                ${pars[i] === p
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 타수 입력 */}
                      <div className="flex items-center justify-between">
                        <button onClick={() => changeScore(i, -1)}
                          className="w-11 h-11 rounded-full bg-red-50 hover:bg-red-100 active:bg-red-200
                            text-red-500 font-bold text-xl flex items-center justify-center transition-colors">
                          −
                        </button>
                        <div className="text-center">
                          <span className={`text-3xl font-extrabold
                            ${scores[i] < pars[i] ? 'text-blue-600' :
                              scores[i] === pars[i] ? 'text-gray-700' : 'text-red-500'}`}>
                            {scores[i]}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button onClick={() => changeScore(i, +1)}
                            className="w-11 h-11 rounded-full bg-green-50 hover:bg-green-100 active:bg-green-200
                              text-green-600 font-bold text-xl flex items-center justify-center transition-colors">
                            ＋
                          </button>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}

          {/* 저장 버튼 */}
          <button onClick={handleSave} disabled={submitting}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-60
              text-white font-bold rounded-2xl text-base active:scale-95 transition-all sticky bottom-4 shadow-xl">
            {submitting ? '저장 중...' : `✅ ${COURSE_TYPES[courseType].label} ${total}타 저장하기`}
          </button>
        </>
      )}
    </div>
  )
}

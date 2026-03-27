import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useScoreSubmit } from '../hooks/useScoreSubmit'

const SCORE_LABEL = { 1: '홀인원', 2: '버디', 3: '파', 4: '보기', 5: '더블+' }
const SCORE_COLOR = {
  1: 'bg-purple-100 text-purple-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-gray-100 text-gray-500',
  4: 'bg-red-100 text-red-500',
  5: 'bg-red-200 text-red-700',
}

export default function ScoreInputPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { courses } = useCourses()
  const { submit, loading: submitting, error: submitError } = useScoreSubmit()

  // 홈에서 선택한 골프장이 있으면 바로 Step 2로 시작
  const preselectedCourse = location.state?.course ?? null

  const [step,           setStep]   = useState(preselectedCourse ? 2 : 1)
  const [selectedCourse, setCourse] = useState(preselectedCourse)
  const [date,           setDate]   = useState(
    new Date().toISOString().split('T')[0]
  )
  const [scores, setScores] = useState(Array(36).fill(3))

  const course    = selectedCourse ?? courses[0]
  const holeCount = course?.hole_count ?? 18
  const total     = scores.slice(0, holeCount).reduce((a, b) => a + b, 0)
  const par       = holeCount * 3
  const diff      = total - par

  function changeScore(idx, delta) {
    setScores((prev) => {
      const next = [...prev]
      next[idx]  = Math.max(1, Math.min(9, next[idx] + delta))
      return next
    })
  }

  async function handleSave() {
    const holeScores = Object.fromEntries(
      scores.slice(0, holeCount).map((s, i) => [String(i + 1), s])
    )
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
        <p className="text-gray-500 text-sm">{course?.name} · {date}</p>
        <p className="text-4xl font-extrabold text-green-600">{total}타</p>
        <p className={`text-lg font-semibold ${diff <= 0 ? 'text-blue-500' : 'text-red-500'}`}>
          {diff === 0 ? 'PAR' : diff > 0 ? `+${diff}` : diff}
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')}
          className="flex-1 py-3 border-2 border-green-600 text-green-700 font-bold rounded-xl">
          랭킹 보기
        </button>
        <button onClick={() => { setStep(1); setCourse(null); setScores(Array(36).fill(3)) }}
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
              ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {s}
            </div>
            <div className={`h-1 flex-1 rounded-full ${s === 1 ? (step > 1 ? 'bg-green-500' : 'bg-gray-200') : ''}`} />
          </div>
        ))}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
          ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
          ✓
        </div>
      </div>

      {/* STEP 1: 골프장 & 날짜 */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold text-gray-800">골프장 &amp; 날짜 선택</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {courses.map((c) => (
              <button key={c.id} onClick={() => setCourse(c)}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all
                  ${(selectedCourse?.id ?? courses[0]?.id) === c.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-800 truncate">{c.name}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full
                    ${(selectedCourse?.id ?? courses[0]?.id) === c.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-500'}`}>
                    {c.city_province}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{c.address}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">경기 날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-green-500" />
          </div>
          <button onClick={() => setStep(2)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-base active:scale-95 transition-all">
            다음 → 홀별 스코어 입력
          </button>
        </>
      )}

      {/* STEP 2: 홀별 입력 */}
      {step === 2 && (
        <>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-sm">← 이전</button>
            <h2 className="text-lg font-bold text-gray-800 truncate mx-2">{course?.name}</h2>
            <span className="text-sm text-gray-400 shrink-0">{date}</span>
          </div>

          {/* 총 타수 요약 */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">현재 총 타수</p>
              <p className="text-4xl font-extrabold">{total}타</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-xs">PAR {par} 대비</p>
              <p className={`text-2xl font-bold ${diff <= 0 ? 'text-yellow-300' : 'text-red-200'}`}>
                {diff === 0 ? 'E' : diff > 0 ? `+${diff}` : diff}
              </p>
            </div>
          </div>

          {/* 홀별 타수 */}
          <div className="space-y-2">
            {Array.from({ length: holeCount }, (_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center px-4 py-2.5 gap-3">
                <div className="w-14 shrink-0">
                  <span className="text-xs text-gray-400 font-medium block">홀</span>
                  <span className="font-bold text-gray-700 text-base">{i + 1}</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-4">
                  <button onClick={() => changeScore(i, -1)}
                    className="hole-btn w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center active:bg-red-200 transition-colors">
                    −
                  </button>
                  <span className={`text-2xl font-extrabold w-8 text-center
                    ${scores[i] < 3 ? 'text-blue-600' : scores[i] === 3 ? 'text-gray-700' : 'text-red-500'}`}>
                    {scores[i]}
                  </span>
                  <button onClick={() => changeScore(i, +1)}
                    className="hole-btn w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold text-xl flex items-center justify-center active:bg-green-200 transition-colors">
                    ＋
                  </button>
                </div>
                <div className="w-16 text-right shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SCORE_COLOR[Math.min(scores[i], 5)]}`}>
                    {SCORE_LABEL[Math.min(scores[i], 5)]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}

          <button onClick={handleSave} disabled={submitting}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-2xl text-base active:scale-95 transition-all sticky bottom-4 shadow-xl">
            {submitting ? '저장 중...' : `✅ 총 ${total}타 저장하기`}
          </button>
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { signInWithNickname, signUp } = useAuth()

  const from = location.state?.from?.pathname ?? '/'

  const [tab,       setTab]       = useState('login')   // 'login' | 'signup'

  /* ── 로그인 필드 ── */
  const [loginNick, setLoginNick] = useState('')
  const [loginPw,   setLoginPw]   = useState('')

  /* ── 회원가입 필드 ── */
  const [nickname,  setNickname]  = useState('')
  const [birthYear, setBirthYear] = useState('1960')
  const [gender,    setGender]    = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')

  /* ── 닉네임 중복 체크 ── */
  const [nickStatus, setNickStatus] = useState(null)
  // null | 'checking' | 'available' | 'taken'

  /* ── 공통 ── */
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [done,      setDone]      = useState(false)

  const birthYears = Array.from({ length: 2026 - 1929 }, (_, i) => 2026 - i)  // 2026 ~ 1930

  /* 닉네임 중복 체크 (debounce 600ms) */
  useEffect(() => {
    if (tab !== 'signup') return
    if (!nickname.trim()) { setNickStatus(null); return }

    setNickStatus('checking')
    const timer = setTimeout(async () => {
      if (USE_MOCK) { setNickStatus('available'); return }
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('nickname', nickname.trim())
        .maybeSingle()
      setNickStatus(data ? 'taken' : 'available')
    }, 600)
    return () => clearTimeout(timer)
  }, [nickname, tab])

  /* ── 로그인 ── */
  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    if (!loginNick.trim()) { setError('닉네임을 입력해 주세요.'); return }
    setLoading(true)
    try {
      await signInWithNickname(loginNick, loginPw)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── 회원가입 ── */
  async function handleSignup(e) {
    e.preventDefault()
    setError(null)
    if (!nickname.trim())       { setError('닉네임을 입력해 주세요.'); return }
    if (nickStatus === 'taken') { setError('이미 사용 중인 닉네임입니다.'); return }
    if (nickStatus === 'checking') { setError('닉네임 중복 확인 중입니다. 잠시 후 다시 시도해 주세요.'); return }
    if (!birthYear)             { setError('출생년도를 선택해 주세요.'); return }
    if (!gender)                { setError('성별을 선택해 주세요.'); return }
    if (!email)                 { setError('이메일을 입력해 주세요.'); return }
    if (password.length < 6)    { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (password !== confirm)   { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      const result = await signUp(email, password, nickname.trim(), Number(birthYear), gender)
      // 이메일 인증 OFF 설정 시: session이 즉시 발급 → 바로 홈으로 이동
      if (result?.session) {
        navigate(from, { replace: true })
      } else {
        // 이메일 인증 ON 설정 시: 인증 완료 후 로그인 필요
        setDone(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* 탭 전환 시 초기화 */
  function switchTab(t) {
    setTab(t); setError(null); setDone(false)
  }

  /* 닉네임 상태 뱃지 */
  function NickBadge() {
    if (!nickStatus) return null
    const map = {
      checking:  ['확인 중...', 'text-gray-400'],
      available: ['✅ 사용 가능', 'text-green-600'],
      taken:     ['❌ 이미 사용 중', 'text-red-500'],
    }
    const [label, cls] = map[nickStatus]
    return <span className={`text-xs font-semibold ${cls}`}>{label}</span>
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* 로고 */}
        <div className="text-center">
          <div className="text-4xl mb-2">⛳</div>
          <h1 className="text-2xl font-extrabold text-green-700">내파스</h1>
          <p className="text-sm text-gray-400 mt-1">내 파크골프 스코어</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[['login','로그인'], ['signup','회원가입']].map(([key, label]) => (
            <button key={key} onClick={() => switchTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab === key ? 'bg-white text-green-700 shadow' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* 회원가입 완료 */}
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <p className="font-bold text-green-800 text-lg">회원가입 완료!</p>
            <p className="text-sm text-green-600">닉네임과 비밀번호로 로그인해 주세요.</p>
            <button onClick={() => { switchTab('login'); setLoginNick(nickname) }}
              className="w-full mt-2 py-3 bg-green-600 text-white font-bold rounded-xl text-sm">
              로그인 하기 →
            </button>
          </div>
        ) : (

          <form onSubmit={tab === 'login' ? handleLogin : handleSignup}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

            {/* ── 로그인 폼 ── */}
            {tab === 'login' && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">닉네임</label>
                  <input type="text" value={loginNick} onChange={e => setLoginNick(e.target.value)}
                    placeholder="가입 시 등록한 닉네임"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-green-400"
                    required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호</label>
                  <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-green-400"
                    required />
                </div>
              </>
            )}

            {/* ── 회원가입 폼 ── */}
            {tab === 'signup' && (
              <>
                {/* 닉네임 + 중복 체크 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-600">닉네임</label>
                    <NickBadge />
                  </div>
                  <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                    placeholder="랭킹에 표시될 이름"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none
                      ${nickStatus === 'taken'     ? 'border-red-400 focus:border-red-400' :
                        nickStatus === 'available' ? 'border-green-400 focus:border-green-400' :
                                                     'border-gray-200 focus:border-green-400'}`}
                    required />
                </div>

                {/* 출생년도 */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">출생년도</label>
                  <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-green-400 bg-white">
                    {birthYears.map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>

                {/* 성별 */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">성별</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[['male','👨 남성'], ['female','👩 여성']].map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setGender(val)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all
                          ${gender === val
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이메일 */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">이메일</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-green-400"
                    required />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="6자 이상"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-green-400"
                    required />
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호 확인</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none
                      ${confirm && confirm !== password
                        ? 'border-red-400 focus:border-red-400'
                        : confirm && confirm === password
                          ? 'border-green-400 focus:border-green-400'
                          : 'border-gray-200 focus:border-green-400'}`}
                    required />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              </>
            )}

            {/* 에러 */}
            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            {/* 제출 */}
            <button type="submit" disabled={loading || (tab === 'signup' && nickStatus === 'taken')}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60
                text-white font-bold rounded-xl text-base transition-all active:scale-95">
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
            </button>

            {/* 비밀번호 찾기 (로그인 탭만) */}
            {tab === 'login' && (
              <button type="button" onClick={() => navigate('/forgot-password')}
                className="w-full text-center text-sm text-gray-400 hover:text-green-600 transition-colors">
                비밀번호를 잊으셨나요?
              </button>
            )}
          </form>
        )}

        <p className="text-center text-xs text-gray-400">
          랭킹 조회는 로그인 없이도 가능합니다.{' '}
          <button onClick={() => navigate('/')} className="text-green-600 underline">홈으로</button>
        </p>
      </div>
    </div>
  )
}

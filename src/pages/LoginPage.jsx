import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { signIn, signUp } = useAuth()

  const from = location.state?.from?.pathname ?? '/'

  const [tab,      setTab]      = useState('login')   // 'login' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [nickname, setNickname] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [done,     setDone]     = useState(false)    // 회원가입 완료 메시지

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 6)  { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (!nickname.trim())     { setError('닉네임을 입력해 주세요.'); return }
    setLoading(true)
    try {
      await signUp(email, password, nickname.trim())
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* 로고 */}
        <div className="text-center">
          <div className="text-4xl mb-2">⛳</div>
          <h1 className="text-2xl font-extrabold text-green-700">파크골프</h1>
          <p className="text-sm text-gray-400 mt-1">스코어 기록 & 랭킹</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[['login','로그인'], ['signup','회원가입']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(null); setDone(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === key ? 'bg-white text-green-700 shadow' : 'text-gray-500'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* 회원가입 완료 메시지 */}
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
            <div className="text-3xl">📧</div>
            <p className="font-semibold text-green-800">가입 확인 이메일을 보냈습니다!</p>
            <p className="text-sm text-green-600">이메일의 링크를 클릭한 후 로그인해 주세요.</p>
            <button onClick={() => { setTab('login'); setDone(false) }}
              className="text-sm text-green-700 underline">
              로그인 화면으로
            </button>
          </div>
        ) : (
          <form onSubmit={tab === 'login' ? handleLogin : handleSignup}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

            {/* 닉네임 (회원가입만) */}
            {tab === 'signup' && (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">닉네임</label>
                <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                  placeholder="랭킹에 표시될 이름"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  required />
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                required />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? '6자 이상' : '비밀번호'}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                required />
            </div>

            {/* 비밀번호 확인 (회원가입만) */}
            {tab === 'signup' && (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호 확인</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  required />
              </div>
            )}

            {/* 에러 */}
            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            {/* 제출 */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-all active:scale-95">
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400">
          랭킹 조회는 로그인 없이도 가능합니다.{' '}
          <button onClick={() => navigate('/')} className="text-green-600 underline">
            홈으로
          </button>
        </p>
      </div>
    </div>
  )
}
